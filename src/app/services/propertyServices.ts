import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpManager} from "../utils/HttpManager";
import {VBEventHandler} from "../utils/VBEventHandler";
import {Deserializer} from "../utils/Deserializer";
import {ARTResource, ARTURIResource, ResAttribute, RDFTypesEnum, RDFResourceRolesEnum} from "../utils/ARTResources";
import {RDF, OWL} from "../utils/Vocabulary";
import {CustomRange, CustomRangeEntry, CustomRangeEntryType} from "../utils/CustomRanges";

@Injectable()
export class PropertyServices {

    private serviceName = "Properties";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Returns a list of top properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopProperties(): Observable<ARTURIResource[]> {
        console.log("[PropertyServices] getTopProperties");
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopProperties", params, this.oldTypeService, true).map(
            stResp => {
                var topProperties = Deserializer.createURIArray(stResp);
                for (var i = 0; i < topProperties.length; i++) {
                    topProperties[i].setAdditionalProperty(ResAttribute.CHILDREN, []);
                }
                return topProperties;
            }
        );
    }

    /**
     * Returns the subProperty of the given property
     * @param property
     * @return an array of subProperties
     */
    getSubProperties(property: ARTURIResource): Observable<ARTURIResource[]> {
        console.log("[PropertyServices] getSubProperties");
        var params: any = {
            superProperty: property
        };
        return this.httpMgr.doGet(this.serviceName, "getSubProperties", params, this.oldTypeService, true).map(
            stResp => {
                var subProps = Deserializer.createURIArray(stResp);
                for (var i = 0; i < subProps.length; i++) {
                    subProps[i].setAdditionalProperty(ResAttribute.CHILDREN, []);
                }
                return subProps;
            }
        );
    }

    /**
     * takes a list of Properties and return their description as if they were roots for a tree
	 * (so more, role, explicit etc...)
     * @param properties
     */
    getPropertiesInfo(properties: ARTURIResource[]): Observable<ARTURIResource[]> {
        console.log("[PropertyServices] getPropertiesInfo");
        var params: any = {
            propList: properties
        };
        return this.httpMgr.doGet(this.serviceName, "getPropertiesInfo", params, this.oldTypeService, true).map(
            stResp => {
                var props = Deserializer.createURIArray(stResp);
                for (var i = 0; i < props.length; i++) {
                    props[i].setAdditionalProperty(ResAttribute.CHILDREN, []);
                }
                return props;
            }
        );
    }

    /**
     * Retrieves all types of res, then all properties having their domain on any of the types for res.
	 * Note that it provides only root properties (e.g. if both rdfs:label and skos:prefLabel,
	 * which is a subProperty of rdfs:label, have domain = one of the types of res, then only rdfs:label is returned)
     * @param resource service returns properties that have as domain the type of this resource 
     */
    getRelevantPropertiesForResource(resource: ARTResource): Observable<ARTURIResource[]> {
        console.log("[PropertyServices] getRelevantPropertiesForResource");
        var params: any = {
            res: resource
        };
        return this.httpMgr.doGet(this.serviceName, "getRelevantPropertiesForResource", params, this.oldTypeService, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Creates a property with the given name of the given type.
     * Emits a topPropertyCreatedEvent with the new property
     * @param propertyName local name of the property
     * @param propertyType type of the property 
     * @return the created property
     */
    addProperty(propertyName: string, propertyType: RDFResourceRolesEnum) {
        console.log("[PropertyServices] addProperty");
        var params: any = {
            propertyQName: propertyName,
            propertyType: propertyType,
        };
        return this.httpMgr.doGet("property", "addProperty", params, true).map(
            stResp => {
                var newProp = Deserializer.createURI(stResp);
                newProp.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.topPropertyCreatedEvent.emit(newProp);
                return newProp;
            }
        );
    }

    /**
     * Creates a subproperty. Emits a subPropertyCreatedEvent with subProperty and superProperty
     * @param propertyQName local name of the subproperty to create
     * @param superProperty the superProperty of the creating property
     * @return the created sub property
     */
    addSubProperty(propertyQName: string, superProperty: ARTURIResource) {
        console.log("[PropertyServices] addSubProperty");
        var params: any = {
            propertyQName: propertyQName,
            propertyType: superProperty.getRole(),
            superPropertyQName: superProperty.getURI(),
        };
        return this.httpMgr.doGet("property", "addProperty", params, true).map(
            stResp => {
                var newProp = Deserializer.createURI(stResp.getElementsByTagName("Property")[0]);
                newProp.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.subPropertyCreatedEvent.emit({subProperty: newProp, superProperty: superProperty});
                return newProp;
            }
        );
    }
    
    /**
     * Adds a superProperty to the given property. Emits a subPropertyCreatedEvent with subProperty and superProperty
     * @param property property to which add a super property
     * @param superProperty the superProperty to add
     */
    addSuperProperty(property: ARTURIResource, superProperty: ARTURIResource) {
        console.log("[PropertyServices] addSuperProperty");
        var params: any = {
            propertyQName: property.getURI(),
            superPropertyQName: superProperty.getURI(),
        };
        return this.httpMgr.doGet("property", "addSuperProperty", params, true).map(
            stResp => {
                //waiting that the addSuperProperty is refactored (returning subProperty info in response)
                //create subProperty by duplicating property param
                var subProperty = new ARTURIResource(property.getURI(), property.getShow(), property.getRole());
                subProperty.setAdditionalProperty(ResAttribute.CHILDREN, property.getAdditionalProperty(ResAttribute.CHILDREN));
                subProperty.setAdditionalProperty(ResAttribute.EXPLICIT, property.getAdditionalProperty(ResAttribute.EXPLICIT));
                subProperty.setAdditionalProperty(ResAttribute.MORE, property.getAdditionalProperty(ResAttribute.MORE));
                this.eventHandler.superPropertyAddedEvent.emit({subProperty: subProperty, superProperty: superProperty});
                return stResp;
            }
        );
    }

    /**
     * Removes a superProperty from the given property.
     * Emits a superPropertyRemovedEvent with property and superProperty
     * @param property property to which remove a super property
     * @param superProperty the superProperty to remove
     */
    removeSuperProperty(property: ARTURIResource, superProperty: ARTURIResource) {
        console.log("[PropertyServices] removeSuperProperty");
        var params: any = {
            propertyQName: property.getURI(),
            superPropertyQName: superProperty.getURI(),
        };
        return this.httpMgr.doGet("property", "removeSuperProperty", params, true).map(
            stResp => {
                this.eventHandler.superPropertyRemovedEvent.emit({property: property, superProperty: superProperty});
                return stResp;
            }
        );
    }

    /**
     * Removes the triple subject property value
     * @param subject subject of the triple
     * @param property property whose the value will be removed
     * @param value value to remove
     * @param rangeQName
     * @param type
     * @param lang
     */
    removePropValue(subject: ARTURIResource, property: ARTURIResource, value: string, rangeQName: string, type: RDFTypesEnum, lang?: string) {
        console.log("[PropertyServices] removePropValue");
        var params: any = {
            instanceQName: subject.getURI(),
            propertyQName: property.getURI(),
            value: value,
            rangeQName: rangeQName,
            type: type,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet("property", "removePropValue", params, true);
    }

    /**
     * Creates the value and adds the triple subject property value
     * @param subject subject of the triple
     * @param property property whose the value will be created
     * @param value value to add
     * @param rangeQName
     * @param type
     * @param lang
     */
    createAndAddPropValue(subject: ARTResource, property: ARTURIResource, value: string, rangeQName: string, type: RDFTypesEnum, lang?: string) {
        console.log("[PropertyServices] createAndAddPropValue");
        var params: any = {
            instanceQName: subject.getNominalValue(),
            propertyQName: property.getURI(),
            value: value,
            rangeQName: rangeQName,
            type: type,
        };
        if (lang != undefined) {
            params.lang = lang;
        }
        return this.httpMgr.doGet("property", "createAndAddPropValue", params, true);
    }

    /**
     * Adds the triple subject property value where value is an existing resource
     * @param subject subject of the triple
     * @param property property whose the value will be created
     * @param value value to add
     * @param type 
     */
    addExistingPropValue(subject: ARTResource, property: ARTURIResource, value: string, type: RDFTypesEnum) {
        console.log("[PropertyServices] addExistingPropValue");
        var params: any = {
            instanceQName: subject.getNominalValue(),
            propertyQName: property.getURI(),
            value: value,
            type: type,
        };
        return this.httpMgr.doGet("property", "addExistingPropValue", params, true);
    }

    /**
     * Adds a class as domain of a property
     * @param property property to which add the domain
     * @param domain the domain class of the property
     */
    addPropertyDomain(property: ARTURIResource, domain: ARTURIResource) {
        console.log("[PropertyServices] addPropertyDomain");
        var params: any = {
            propertyQName: property.getURI(),
            domainPropertyQName: domain.getURI()
        };
        return this.httpMgr.doGet("property", "addPropertyDomain", params, true);
    }
    
    /**
     * Removes the domain of a property
     * @param property property to which remove the domain
     * @param domain the domain class of the property
     */
    removePropertyDomain(property: ARTURIResource, domain: ARTURIResource) {
        console.log("[PropertyServices] removePropertyDomain");
        var params: any = {
            propertyQName: property.getURI(),
            domainPropertyQName: domain.getURI(),
        };
        return this.httpMgr.doGet("property", "removePropertyDomain", params, true);
    }
    
    /**
     * Returns the range of a property
     * @param property
     * @return an object with:
     * - ranges: "classic" range of a property omitted if a CustomRange is provided for the given property
     *      and the "replaceRanges" attribute is true (so, the "classic" range in replaced by the custom one).
     *      Contains two attributes:
     *          - type: available values: resource, plainLiteral, typedLiteral, literal, undetermined, inconsistent;
     *          - rangeColl: an array of ARTURIResource 
     *              (available only if rngType is resource, then represent the admitted range classes,
     *              or typedLiteral, then represent the admitted datatypes);
     * - customRange, an optional CustomRange object only if the property has custom ranges
     */
    getRange(property: ARTURIResource): Observable<{ranges: {type: string, rangeColl: ARTURIResource[]}, customRange: CustomRange}> {
        console.log("[PropertyServices] getRange");
        var params: any = {
            propertyQName: property.getURI(),
        };
        return this.httpMgr.doGet("property", "getRange", params, true).map(
            stResp => {
                let ranges: any;
                let customRange: CustomRange;
                if (stResp.getElementsByTagName("ranges").length != 0) {
                    var rangesElem: Element = stResp.getElementsByTagName("ranges")[0];
                    ranges = {}
                    ranges.type = rangesElem.getAttribute("rngType");
                    if (ranges.type != "undetermined") {
                        ranges.rangeColl = Deserializer.createURIArrayGivenList(rangesElem.children);
                    }
                }
                if (stResp.getElementsByTagName("customRange").length != 0) {
                    var cRangesElem: Element = stResp.getElementsByTagName("customRange")[0];
                    var crId = cRangesElem.getAttribute("id");
                    var crProp = cRangesElem.getAttribute("property");
                    var crEntries: CustomRangeEntry[] = [];
                    var creElemColl = cRangesElem.getElementsByTagName("crEntry");
                    for (var i = 0; i < creElemColl.length; i++) {
                        let creId = creElemColl[i].getAttribute("id");
                        let name = creElemColl[i].getAttribute("name");
                        let type: CustomRangeEntryType = creElemColl[i].getAttribute("type") == "graph" ? "graph" : "node";
                        let description = creElemColl[i].getElementsByTagName("description")[0].textContent;
                        let cre: CustomRangeEntry = new CustomRangeEntry(creId);
                        cre.setName(name);
                        cre.setType(type);
                        cre.setDescription(description);
                        crEntries.push(cre);
                    }
                    customRange = new CustomRange(crId);
                    customRange.setEntries(crEntries);
                }
                return {ranges: ranges, customRange: customRange};
            }
        );
    }
    
    /**
     * Adds a class as range of a property
     * @param property property to which add the domain
     * @param range the range class of the property
     */
    addPropertyRange(property: ARTURIResource, range: ARTURIResource) {
        console.log("[PropertyServices] addPropertyRange");
        var params: any = {
            propertyQName: property.getURI(),
            rangePropertyQName: range.getURI()
        };
        return this.httpMgr.doGet("property", "addPropertyRange", params, true);
    }

    /**
     * Removes the range of a property
     * @param property property to which remove the range
     * @param range the range class of the property
     */
    removePropertyRange(property: ARTURIResource, range: ARTURIResource) {
        console.log("[PropertyServices] removePropertyRange");
        var params: any = {
            propertyQName: property.getURI(),
            rangePropertyQName: range.getURI(),
        };
        return this.httpMgr.doGet("property", "removePropertyRange", params, true);
    }
    
}