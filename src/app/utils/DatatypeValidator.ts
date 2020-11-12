import { Injectable } from "@angular/core";
import { Observable, Subscription } from "rxjs";
import { map } from 'rxjs/operators';
import { ARTLiteral, ARTURIResource } from "../models/ARTResources";
import { ConstrainingFacets, DatatypeRestrictionDescription, DatatypeRestrictionsMap, DatatypeUtils } from "../models/Datatypes";
import { DatatypesServices } from "../services/datatypesServices";
import { VBEventHandler } from "./VBEventHandler";

/**
 * This service provides useful method in order to manage datatype restrictions and to validate typed literal.
 * It stored a cache of restrictions for user-defined datatypes. 
 * In addition to NewTypedLiteralModal, this service is used in EditableResourceComponent in order to validate a typed value 
 * during the edit of literal value and the add-manually (as required in ST-1414).
 * Without the cache, the validation would require to invoke datatypeService.getDatatypeRestrictions() each time, so in 
 * EditableResourceComponent (the one who handle the edit and the add-manually) the validation would be Observable-based (async) 
 * and it would be very difficult to handle.
 */
@Injectable()
export class DatatypeValidator {
    
    private eventSubscriptions: Subscription[] = [];

    /**
     * client-side cache of restrictions on user defined datatypes. This is useful for client-side validation
     */
    private userDefinedDatatypeRestrictions: DatatypeRestrictionsMap;

    constructor(private datatypeService: DatatypesServices, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(
            this.eventHandler.resourceRenamedEvent.subscribe((data: { oldResource: ARTURIResource, newResource: ARTURIResource }) => {
                if (this.userDefinedDatatypeRestrictions.has(data.oldResource.getURI())) {
                    this.initDatatypeRestrictions().subscribe();
                }
            })
        );
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    /**
     * Initializes the datatype-pattern map defined in the project.
     * To call each time the project changes, or a Datatype facet is changed (TODO). 
     */
    public initDatatypeRestrictions(): Observable<any> {
        return this.datatypeService.getDatatypeRestrictions().pipe(
            map(dtRestrinctions => {
                this.userDefinedDatatypeRestrictions = dtRestrinctions;
            })
        )
    }

    public isValidableType(type: ARTURIResource): boolean {
        let validable: boolean;
        /*
         * A datatype is validable if:
         * - is numeric, so the UI forces the input of a number
         * - is a xsd built-in or a user-defined datatype for which exists a pattern 
         * - is one of the datatype for which exists a UI widget or a programmatic check that validate implicitly the value
         * (e.g. xsd:boolean, xsd:date, xsd:string or rdf:langString (which are valid simply if not empty))
         */
        validable = this.isNumericType(type);
        if (!validable) {
            validable = DatatypeUtils.programmaticallyValidableType.some(dt => dt.equals(type));
        }
        if (!validable) {
            let facets = this.getDatatypeFacets(type);
            if (facets != null) {
                validable = facets.pattern != null || facets.maxExclusive != null || facets.maxInclusive != null ||
                    facets.minExclusive != null || facets.minInclusive != null;
            }
        }
        if (!validable) {
            validable = this.getDatatypeEnumerations(type) != null;
        }
        return validable;
    }

    /**
     * Tells if a datatype is numeric (useful in order to show the input number field in the UI).
     * A datatype is numeric if:
     * - is one of the well-known numeric XSD datatypes
     * - is defined by the user and based on one of the aboves
     * @param type 
     */
    public isNumericType(type: ARTURIResource): boolean {
        let numeric: boolean;
        numeric = DatatypeUtils.xsdNumericDatatypes.some(dt => dt.equals(type));
        if (!numeric) {
            let restr: DatatypeRestrictionDescription = this.userDefinedDatatypeRestrictions.get(type.getURI());
            if (restr != null && restr.facets != null && restr.facets.base) {
                numeric = DatatypeUtils.xsdNumericDatatypes.some(dt => dt.equals(restr.facets.base));
            }
        }
        return numeric;
    }

    /**
     * Returns the facets (if any) of the given datatype
     * @param type 
     */
    public getDatatypeFacets(type: ARTURIResource): ConstrainingFacets {
        let facets: ConstrainingFacets = DatatypeUtils.typeRestrictionsMap.get(type.getURI());
        if (facets == null) { //datatype not found among the standard restrictions
            facets = DatatypeUtils.notStandardRestrictionsMap.get(type.getURI());
        }
        if (facets == null) { //datatype not found among the non-standard restrictions
            let restrDesc = this.userDefinedDatatypeRestrictions.get(type.getURI());
            if (restrDesc != null && restrDesc.facets != null) {
                facets = restrDesc.facets.facets;
            }
        }
        return facets;
    }

    /**
     * Returns the enumerations (if any) of the given datatype
     * @param type 
     */
    public getDatatypeEnumerations(type: ARTURIResource): ARTLiteral[] {
        let enumerations: ARTLiteral[];
        let restrDesc = this.userDefinedDatatypeRestrictions.get(type.getURI());
        if (restrDesc != null) {
            enumerations = restrDesc.enumerations;
        }
        return enumerations;
    }

    /**
     * Validate a value according a datatype.
     * The validation goes under the following logic:
     * - if the datatype has facets defined (min/max, pattern), checks if they are respected
     * - if the datatype has enumerations, check if the value is one of the enumerations
     * @param value
     * @param type 
     */
    public isValid(value: ARTLiteral, type: ARTURIResource): boolean {
        let valid: boolean = true;
        let facets = this.getDatatypeFacets(type);
        if (facets != null) {
            let valueString = value.getValue();
            if (facets.pattern != null && !new RegExp("^" + facets.pattern + "$").test(valueString)) {
                valid = false; // pattern violated
            }
            if (facets.maxExclusive != null && +valueString >= facets.maxExclusive) {
                valid = false; // maxExclusive violated
            }
            if (facets.maxInclusive != null && +valueString > facets.maxInclusive) {
                valid = false; // maxInclusive violated
            }
            if (facets.minExclusive != null && +valueString <= facets.minExclusive) {
                valid = false; // minExclusive violated
            }
            if (facets.minInclusive != null && +valueString < facets.minInclusive) {
                valid = false; // minInclusive violated
            }
        }
        let enumerations = this.getDatatypeEnumerations(type);
        if (enumerations != null) {
            if (!enumerations.some(e => e.equals(value))) { //value is not among the enumerations
                valid = false;
            }
        }
        //if valid has not been set to false, it means that it passed all the checks or that the datatype does not undergo to any validation
        return valid;
    }
}