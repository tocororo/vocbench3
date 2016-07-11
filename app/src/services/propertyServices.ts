import {Injectable} from '@angular/core';
import {HttpManager} from "../utils/HttpManager";
import {VBEventHandler} from "../utils/VBEventHandler";
import {Deserializer} from "../utils/Deserializer";
import {ARTResource, ARTURIResource, ResAttribute, RDFTypesEnum, RDFResourceRolesEnum} from "../utils/ARTResources";
import {RDF, OWL} from "../utils/Vocabulary";
import {CustomRange, CustomRangeEntry, CustomRangeEntryType} from "../utils/CustomRanges";

@Injectable()
export class PropertyServices {

    private serviceName = "property";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Gets a static property tree
     * @param resource optional, if provided the returned propertyTree contains 
     * just the properties that have as domain the type of the resource 
     * @return a nested array of ARTURIResource representing the properties tree
     */
    getPropertiesTree(resource?: ARTURIResource) {
        console.log("[PropertyServices] getPropertiesTree");
        var params: any = {}
        if (resource != undefined) {
            params.instanceQName = resource.getURI();
        }
        return this.httpMgr.doGet(this.serviceName, "getPropertiesTree", params, this.oldTypeService).map(
            stResp => {
                var propertyTree: ARTURIResource[] = new Array()
                var propertiesXml = stResp.querySelectorAll("data > Property");
                for (var i = 0; i < propertiesXml.length; i++) {
                    var p = this.parseProperty(propertiesXml[i]);
                    propertyTree.push(p);
                }
                return propertyTree;
            }
        );
    }
    
    //when property service will be reimplemented with <uri> element this will be not useful anymore
    private parseProperty(propXml): ARTURIResource {
        var show = propXml.getAttribute("name");
        var role = propXml.getAttribute("type");
        var uri = propXml.getAttribute("uri");
        //properties use deleteForbidden instead of explicit, use explicit in order to standardize the attributes
        var explicit = propXml.getAttribute("deleteForbidden") != "true";
        var p = new ARTURIResource(uri, show, role);
        p.setAdditionalProperty(ResAttribute.EXPLICIT, explicit);
        //recursively parse children
        var subProperties: ARTURIResource[] = [];
        var subPropsXml = propXml.querySelectorAll(":scope > SubProperties > Property");
        for (var i=0; i<subPropsXml.length; i++) {
            var subP = this.parseProperty(subPropsXml[i]);
            subProperties.push(subP);
        }
        p.setAdditionalProperty(ResAttribute.CHILDREN, subProperties);
        if (subProperties.length > 0) {
            p.setAdditionalProperty(ResAttribute.OPEN, true); //to initialize tree all expanded
        }
        return p;
    }

    /**
     * Creates a property with the given name of the given type.
     * Emits a topPropertyCreatedEvent with the new property
     * @param propertyName local name of the property
     * @param propertyType type of the property (rdf:Property, owl:ObjectProperty, owl:DatatypeProperty, ...) 
     * @return the created property
     */
    addProperty(propertyName: string, propertyType: string) {
        console.log("[PropertyServices] addProperty");
        var params: any = {
            propertyQName: propertyName,
            propertyType: propertyType,
        };
        return this.httpMgr.doGet(this.serviceName, "addProperty", params, this.oldTypeService).map(
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
        var propType: string; //need to convert from role to type (service requires type, but returns role)
        if (superProperty.getRole().toLowerCase().indexOf(RDFResourceRolesEnum.property.toLowerCase())) {
            propType = RDF.property.getShow();
        } else if (superProperty.getRole().toLowerCase().indexOf(RDFResourceRolesEnum.objectProperty.toLowerCase())) {
            propType = OWL.objectProperty.getShow();
        } else if (superProperty.getRole().toLowerCase().indexOf(RDFResourceRolesEnum.datatypeProperty.toLowerCase())) {
            propType = OWL.datatypeProperty.getShow();
        } else if (superProperty.getRole().toLowerCase().indexOf(RDFResourceRolesEnum.annotationProperty.toLowerCase())) {
            propType = OWL.annotationProperty.getShow();
        } else if (superProperty.getRole().toLowerCase().indexOf(RDFResourceRolesEnum.ontologyProperty.toLowerCase())) {
            propType = OWL.ontologyProperty.getShow();
        } else {
            propType = superProperty.getRole();
        } 
        var params: any = {
            propertyQName: propertyQName,
            propertyType: propType,
            superPropertyQName: superProperty.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "addProperty", params, this.oldTypeService).map(
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
        return this.httpMgr.doGet(this.serviceName, "addSuperProperty", params, this.oldTypeService).map(
            stResp => {
                //this is needed to avoid error when the event is catched. Since the subProperty is added to the 
                //children of the superProp, and so it is added to a PropertyTreeNodeComponent,
                //children not set causes error when in the view is performed a check on children.lenght...
                //but this solution "hides" the eventual children that subProperty has
                //TODO: this could be resolved when the services for propertyTree change to dynamic 
                //and addSuperProperty return attribute "more" about the subProperty
                property.setAdditionalProperty(ResAttribute.CHILDREN, []);
                this.eventHandler.subPropertyCreatedEvent.emit({subProperty: property, superProperty: superProperty});
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
        return this.httpMgr.doGet(this.serviceName, "removeSuperProperty", params, this.oldTypeService).map(
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
        return this.httpMgr.doGet(this.serviceName, "removePropValue", params, this.oldTypeService);
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
        return this.httpMgr.doGet(this.serviceName, "createAndAddPropValue", params, this.oldTypeService);
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
        return this.httpMgr.doGet(this.serviceName, "addExistingPropValue", params, this.oldTypeService);
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
        return this.httpMgr.doGet(this.serviceName, "addPropertyDomain", params, this.oldTypeService);
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
        return this.httpMgr.doGet(this.serviceName, "removePropertyDomain", params, this.oldTypeService);
    }
    
    /**
     * Returns the range of a property
     * @param property
     * @return an object with:
     * rngType (available values: resource, plainLiteral, typedLiteral, literal, undetermined, inconsistent);
     * ranges, an array of ARTURIResource (available only if rngType is resource, then represent the admitted range classes,
     * or typedLiteral, then represent the admitted datatypes);
     * customRanges, an optional CustomRange object only if the property has custom ranges
     */
    getRange(property: ARTURIResource) {
        console.log("[PropertyServices] getRange");
        var params: any = {
            propertyQName: property.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "getRange", params, this.oldTypeService).map(
            stResp => {
                var rangesElem: Element = stResp.getElementsByTagName("ranges")[0];
                var rngType = rangesElem.getAttribute("rngType");
                if (rngType != "undetermined") {
                    var rangesUriColl = Deserializer.createURIArrayGivenList(rangesElem.childNodes);
                }
                if (stResp.getElementsByTagName("customRanges").length != 0) {
                    var cRangesElem: Element = stResp.getElementsByTagName("customRanges")[0];
                    var crId = cRangesElem.getAttribute("id");
                    var crProp = cRangesElem.getAttribute("property");
                    var crEntries: CustomRangeEntry[] = [];
                    var creElemColl = cRangesElem.getElementsByTagName("crEntry");
                    for (var i = 0; i < creElemColl.length; i++) {
                        var creId = creElemColl[i].getAttribute("id");
                        var name = creElemColl[i].getAttribute("name");
                        var type: CustomRangeEntryType = creElemColl[i].getAttribute("type") == "graph" ? "graph" : "node";
                        var description = creElemColl[i].getElementsByTagName("description")[0].textContent;
                        var cre: CustomRangeEntry = new CustomRangeEntry(creId);
                        cre.setName(name);
                        cre.setType(type);
                        cre.setDescription(description);
                        crEntries.push(cre);
                    }
                    var cr = new CustomRange(crId);
                    cr.setEntries(crEntries);
                }
                return {rngType: rngType, ranges: rangesUriColl, customRanges: cr};
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
        return this.httpMgr.doGet(this.serviceName, "addPropertyRange", params, this.oldTypeService);
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
        return this.httpMgr.doGet(this.serviceName, "removePropertyRange", params, this.oldTypeService);
    }
    
    /**
     * Returns class tree information for the range of the given property.
     * (e.g. property P has class C as range, so this method returns the same response of 
     * getClassesInfoAsRootsForTree in owlService for the class C)
     * @return
     */
    getRangeClassesTree(property: ARTURIResource) {
        console.log("[PropertyServices] getRangeClassesTree");
        var params: any = {
            propertyQName: property.getURI(),
        };
        return this.httpMgr.doGet(this.serviceName, "getRangeClassesTree", params, this.oldTypeService).map(
            stResp => {
                // var classElemColl: Element[] = stResp.getElementsByTagName("Class");
                // for (var i = 0; i < classElemColl.length; i++) {
                //     var cls = new ARTURIResource()
                //     classElemColl[i].
                // }
                return stResp;
            }
        );
    }
    
}