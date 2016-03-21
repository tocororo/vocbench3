import {Injectable} from 'angular2/core';
import {HttpManager} from "../utils/HttpManager";
import {VBEventHandler} from "../utils/VBEventHandler";
import {Deserializer} from "../utils/Deserializer";
import {ARTURIResource} from "../utils/ARTResources";
import {RDFTypesEnum} from "../utils/Enums";

@Injectable()
export class PropertyServices {

    private serviceName = "property";
    private oldTypeService = true;

    constructor(private httpMgr: HttpManager, private eventHandler: VBEventHandler) { }

    /**
     * Gets a static property tree
     * @return a nested array of ARTURIResource representing the properties tree
     */
    getPropertiesTree() {
        console.log("[PropertyServices] getPropertiesTree");
        var params: any = {}
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
        p.setAdditionalProperty("explicit", explicit);
        //recursively parse children
        var subProperties: ARTURIResource[] = [];
        var subPropsXml = propXml.querySelectorAll(":scope > SubProperties > Property");
        for (var i=0; i<subPropsXml.length; i++) {
            var subP = this.parseProperty(subPropsXml[i]);
            subProperties.push(subP);
        }
        p.setAdditionalProperty("children", subProperties);
        return p;
    }

    /**
     * Removes the given property. Emits a propertyDeletedEvent with property (the deleted property)
     * @param property the property to remove
     * @return the deleted property
     */
    removeProperty(property: ARTURIResource) {
        console.log("[PropertyServices] removeProperty");
        var params: any = {
            name: property.getURI(),
            type: "Property",
        };
        return this.httpMgr.doGet("delete", "removeProperty", params, this.oldTypeService).map(
            stResp => {
                this.eventHandler.propertyDeletedEvent.emit(property);
                return property;
            }
        );
    }

    /**
     * Creates a property with the given name of the given type.
     * Emits a topPropertyCreatedEvent with the new property
     * @param propertyName local name of the property
     * @param propertyType type of the property (property, objectProperty, datatypeProperty, ...) 
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
                newProp.setAdditionalProperty("children", []);
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
        return this.httpMgr.doGet(this.serviceName, "addProperty", params, this.oldTypeService).map(
            stResp => {
                var newProp = Deserializer.createURI(stResp.getElementsByTagName("Property")[0]);
                newProp.setAdditionalProperty("children", []);
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
    createAndAddPropValue(subject: ARTURIResource, property: ARTURIResource, value: string, rangeQName: string, type: RDFTypesEnum, lang?: string) {
        console.log("[PropertyServices] createAndAddPropValue");
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
        return this.httpMgr.doGet(this.serviceName, "createAndAddPropValue", params, this.oldTypeService);
    }

    /**
     * Adds the triple subject property value where value is an existing resource
     * @param subject subject of the triple
     * @param property property whose the value will be created
     * @param value value to add
     * @param type
     */
    addExistingPropValue(subject: ARTURIResource, property: ARTURIResource, value: string, type: string) {
        console.log("[PropertyServices] addExistingPropValue");
        var params: any = {
            instanceQName: subject.getURI(),
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
    
}