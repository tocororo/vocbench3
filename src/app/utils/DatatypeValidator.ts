import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ARTURIResource } from "../models/ARTResources";
import { ConstrainingFacets, DatatypeRestrictionsMap, DatatypeUtils } from "../models/Datatypes";
import { DatatypesServices } from "../services/datatypesServices";

@Injectable()
export class DatatypeValidator {

    private datatypeRestrictions: DatatypeRestrictionsMap;

    constructor(private datatypeService: DatatypesServices) { }

    /**
     * Initializes the datatype-pattern map defined in the project.
     * To call each time the project changes, or a Datatype facet is changed (TODO). 
     */
    public initDatatypeRestrictions(): Observable<any> {
        return this.datatypeService.getDatatypeRestrictions().map(
            dtRestrinctions => {
                this.datatypeRestrictions = dtRestrinctions;
            }
        )
    }

    public isValidableType(type: ARTURIResource): boolean {
        /*
         * A datatype is validable if:
         * - is numeric, so the UI forces the input of a number
         * - is a xsd built-in or a user-defined datatype for which exists a pattern 
         * - is one of the datatype for which exists a UI widget or a programmatic check that validate implicitly the value
         * (e.g. xsd:boolean, xsd:date, xsd:string or rdf:langString (which are valid simply if not empty))
         */
        let facets = this.getConstrainingFacets(type);
        return (
            this.isNumericType(type) || 
            facets != null && (
                facets.pattern != null || facets.maxExclusive != null || facets.maxInclusive != null || 
                facets.minExclusive != null || facets.minInclusive != null
            ) ||
            DatatypeUtils.programmaticallyValidableType.some(dt => dt.equals(type))
        );
    }

    public isNumericType(type: ARTURIResource): boolean {
        return DatatypeUtils.xsdNumericDatatypes.some(dt => dt.equals(type));
    }

    /**
     * Returns the constraining facets (pattern, min/max) for the given datatype
     * @param type 
     */
    public getConstrainingFacets(type: ARTURIResource): ConstrainingFacets {
        let facets: ConstrainingFacets;
        facets = DatatypeUtils.typeRestrictionsMap.get(type.getURI());
        if (facets == null) { //datatype not found among the standard restrictions
            facets = DatatypeUtils.notStandardRestrictionsMap.get(type.getURI());
            if (facets == null) { //datatype not found also among the non-standard restrictions
                facets = this.datatypeRestrictions.get(type.getURI());
            }
        }
        return facets;
    }

    public isValid(value: any, type: ARTURIResource): boolean {
        let facets = this.getConstrainingFacets(type);
        if (facets != null) {
            if (facets.pattern != null) {
                if (!new RegExp("^" + facets.pattern + "$").test(value)) return false;
            }
            if (facets.maxExclusive != null) {
                if (value >= facets.maxExclusive) return false;
            }
            if (facets.maxInclusive != null) {
                if (value > facets.maxInclusive) return false;
            }
            if (facets.minExclusive != null) {
                if (value <= facets.minExclusive) return false;
            }
            if (facets.minInclusive != null) {
                if (value < facets.minInclusive) return false;
            }
        }
        //if the previous checks are not executed, it means that the value does not undergo to any validation, so returns true
        return true;
    }
}