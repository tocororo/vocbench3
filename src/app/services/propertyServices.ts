import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpManager} from "../utils/HttpManager";
import {VBEventHandler} from "../utils/VBEventHandler";
import {Deserializer} from "../utils/Deserializer";
import {ARTResource, ARTURIResource, ResAttribute, RDFTypesEnum, RDFResourceRolesEnum} from "../models/ARTResources";
import {RDF, OWL} from "../models/Vocabulary";
import {FormCollection, CustomForm, CustomFormType} from "../models/CustomForms";

@Injectable()
export class PropertyServices {

    private serviceName = "Properties";

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Returns a list of top properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopProperties(): Observable<ARTURIResource[]> {
        console.log("[PropertyServices] getTopProperties");
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopProperties", params, true).map(
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
     * Returns a list of top Rdf Properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopRDFProperties(): Observable<ARTURIResource[]> {
        console.log("[PropertyServices] getTopRDFProperties");
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopRDFProperties", params, true).map(
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
     * Returns a list of top object properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopObjectProperties(): Observable<ARTURIResource[]> {
        console.log("[PropertyServices] getTopObjectProperties");
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopObjectProperties", params, true).map(
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
     * Returns a list of top datatype properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopDatatypeProperties(): Observable<ARTURIResource[]> {
        console.log("[PropertyServices] getTopDatatypeProperties");
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopDatatypeProperties", params, true).map(
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
     * Returns a list of top annotation properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopAnnotationProperties(): Observable<ARTURIResource[]> {
        console.log("[PropertyServices] getTopAnnotationProperties");
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopAnnotationProperties", params, true).map(
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
     * Returns a list of top ontology properties (properties which have not a superProperty)
     * @return an array of Properties
     */
    getTopOntologyProperties(): Observable<ARTURIResource[]> {
        console.log("[PropertyServices] getTopOntologyProperties");
        var params: any = {}
        return this.httpMgr.doGet(this.serviceName, "getTopOntologyProperties", params, true).map(
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
        return this.httpMgr.doGet(this.serviceName, "getSubProperties", params, true).map(
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
        return this.httpMgr.doGet(this.serviceName, "getPropertiesInfo", params, true).map(
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
        return this.httpMgr.doGet(this.serviceName, "getRelevantPropertiesForResource", params, true).map(
            stResp => {
                return Deserializer.createURIArray(stResp);
            }
        );
    }

    /**
     * Returns the range of a property
     * @param property
     * @return an object with:
     * - ranges: "classic" range of a property omitted if a FormCollection is provided for the given property
     *      and the "replace" attribute is true (so, the "classic" range in replaced by the custom one).
     *      Contains two attributes:
     *          - type: available values: resource, plainLiteral, typedLiteral, literal, undetermined, inconsistent;
     *          - rangeColl: an array of ARTURIResource 
     *              (available only if rngType is resource, then represent the admitted range classes,
     *              or typedLiteral, then represent the admitted datatypes);
     * - formCollection, an optional FormCollection object only if the property has form collection associated
     */
    getRange(property: ARTURIResource): Observable<{ranges: {type: RangeType, rangeCollection: ARTURIResource[]}, formCollection: FormCollection}> {
        console.log("[PropertyServices] getRange");
        var params: any = {
            property: property,
        };
        return this.httpMgr.doGet(this.serviceName, "getRange", params, true).map(
            stResp => {
                let ranges: any;
                let formCollection: FormCollection;
                
                if (stResp.ranges) {
                    ranges = {};
                    ranges.type = stResp.ranges.type;
                    if (stResp.ranges.rangeCollection) {
                        //cannot use Deserializer since rangeCollection contains just the URIs
                        // ranges.rangeCollection = Deserializer.createURIArray(stResp.ranges.rangeCollection);
                        var rangeColl: ARTURIResource[] = [];
                        for (var i = 0; i < stResp.ranges.rangeCollection.length; i++) {
                            rangeColl.push(new ARTURIResource(stResp.ranges.rangeCollection[i], null, null));
                        }
                        ranges.rangeCollection = rangeColl;
                    }
                }
                if (stResp.formCollection) {
                    formCollection = new FormCollection(stResp.formCollection.id);
                    var forms: CustomForm[] = [];
                    for (var i = 0; i < stResp.formCollection.forms.length; i++) {
                        let cf: CustomForm = new CustomForm(stResp.formCollection.forms[i].id);
                        cf.setName(stResp.formCollection.forms[i].name);
                        cf.setType(stResp.formCollection.forms[i].type);
                        cf.setDescription(stResp.formCollection.forms[i].description);
                        forms.push(cf);
                    }
                    forms.sort(
                        function(a: CustomForm, b: CustomForm) {
                            if (a.getName() < b.getName()) return -1;
                            if (a.getName() > b.getName()) return 1;
                            return 0;
                        }
                    )
                    formCollection.setForms(forms);
                }
                return {ranges: ranges, formCollection: formCollection};
            }
        );
    }

    /**
     * Creates a property of the given type.
     * Emits a topPropertyCreatedEvent with the new property
     * @param propertyType uri of a property class
     * @param newProperty uri of the new property
     * @param customFormId id of the custom form that set additional info to the property
     * @param userPromptMap json map object of key - value of the custom form
     * @return the new property
     */
    createProperty(propertyType: ARTURIResource, newProperty: ARTURIResource, customFormId?: string, userPromptMap?: any) {
        console.log("[PropertyServices] createProperty");
        var params: any = {
            propertyType: propertyType,
            newProperty: newProperty
        };
        if (customFormId != null && userPromptMap != null) {
            params.customFormId = customFormId;
            params.userPromptMap = JSON.stringify(userPromptMap);
        }
        return this.httpMgr.doPost(this.serviceName, "createProperty", params, true).map(
            stResp => {
                var newProp = Deserializer.createURI(stResp);
                newProp.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.topPropertyCreatedEvent.emit(newProp);
                return newProp;
            }
        );
    }

    /**
     * Creates a property (subPropertyOf the superProperty) of the given type.
     * Emits a topPropertyCreatedEvent with the new property
     * @param propertyType uri of a property class
     * @param newProperty uri of the new property
     * @param superProperty uri of the super property
     * @param customFormId id of the custom form that set additional info to the property
     * @param userPromptMap json map object of key - value of the custom form
     * @return the new property
     */
    createSubProperty(propertyType: ARTURIResource, newProperty: ARTURIResource, superProperty: ARTURIResource,
            customFormId?: string, userPromptMap?: any) {
        console.log("[PropertyServices] createProperty");
        var params: any = {
            propertyType: propertyType,
            newProperty: newProperty
        };
        if (superProperty != null) {
            params.superProperty = superProperty
        }
        if (customFormId != null && userPromptMap != null) {
            params.customFormId = customFormId;
            params.userPromptMap = JSON.stringify(userPromptMap);
        }
        return this.httpMgr.doPost(this.serviceName, "createProperty", params, true).map(
            stResp => {
                var newProp = Deserializer.createURI(stResp);
                newProp.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.subPropertyCreatedEvent.emit({subProperty: newProp, superProperty: superProperty});
                return newProp;
            }
        );
    }

    /**
     * Deletes a property. Emits a propertyDeletedEvent with property (the deleted property)
     * @param property 
     */
    deleteProperty(property: ARTURIResource) {
        console.log("[PropertyServices] deleteProperty");
        var params: any = {
            property: property
        };
        return this.httpMgr.doPost(this.serviceName, "deleteProperty", params, true).map(
            stResp => {
                this.eventHandler.propertyDeletedEvent.emit(property);
                return property;
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
            property: property,
            superProperty: superProperty,
        };
        return this.httpMgr.doPost(this.serviceName, "addSuperProperty", params, true).map(
            stResp => {
                //create subProperty by duplicating property param
                var subProperty = property.clone();
                // var subProperty = new ARTURIResource(property.getURI(), property.getShow(), property.getRole());
                // subProperty.setAdditionalProperty(ResAttribute.CHILDREN, property.getAdditionalProperty(ResAttribute.CHILDREN));
                // subProperty.setAdditionalProperty(ResAttribute.EXPLICIT, property.getAdditionalProperty(ResAttribute.EXPLICIT));
                // subProperty.setAdditionalProperty(ResAttribute.MORE, property.getAdditionalProperty(ResAttribute.MORE));
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
            property: property,
            superProperty: superProperty,
        };
        return this.httpMgr.doPost(this.serviceName, "removeSuperProperty", params, true).map(
            stResp => {
                this.eventHandler.superPropertyRemovedEvent.emit({property: property, superProperty: superProperty});
                return stResp;
            }
        );
    }

    /**
     * Adds a class as domain of a property
     * @param property property to which add the domain
     * @param domain the domain class of the property
     */
    addPropertyDomain(property: ARTURIResource, domain: ARTURIResource) {
        console.log("[PropertyServices] addPropertyDomain");
        var params: any = {
            property: property,
            domain: domain
        };
        return this.httpMgr.doPost(this.serviceName, "addPropertyDomain", params, true);
    }
    
    /**
     * Removes the domain of a property
     * @param property property to which remove the domain
     * @param domain the domain class of the property
     */
    removePropertyDomain(property: ARTURIResource, domain: ARTURIResource) {
        console.log("[PropertyServices] removePropertyDomain");
        var params: any = {
            property: property,
            domain: domain,
        };
        return this.httpMgr.doPost(this.serviceName, "removePropertyDomain", params, true);
    }
    
    /**
     * Adds a class as range of a property
     * @param property property to which add the domain
     * @param range the range class of the property
     */
    addPropertyRange(property: ARTURIResource, range: ARTURIResource) {
        console.log("[PropertyServices] addPropertyRange");
        var params: any = {
            property: property,
            range: range
        };
        return this.httpMgr.doPost(this.serviceName, "addPropertyRange", params, true);
    }

    /**
     * Removes the range of a property
     * @param property property to which remove the range
     * @param range the range class of the property
     */
    removePropertyRange(property: ARTURIResource, range: ARTURIResource) {
        console.log("[PropertyServices] removePropertyRange");
        var params: any = {
            property: property,
            range: range,
        };
        return this.httpMgr.doPost(this.serviceName, "removePropertyRange", params, true);
    }
    
}

type RangeType = "resource" | "plainLiteral" | "typedLiteral" | "literal" | "undetermined" | "inconsistent";