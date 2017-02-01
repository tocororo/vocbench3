import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {HttpManager} from "../utils/HttpManager";
import {Deserializer} from "../utils/Deserializer";
import {ARTResource, ARTURIResource, ARTNode} from "../utils/ARTResources";
import {CustomRangePropertyMapping, CustomRange, CustomRangeEntry, CustomRangeEntryType, FormEntry, FormEntryType} from "../utils/CustomRanges";

@Injectable()
export class CustomRangeServices {

    private serviceName = "CustomRanges";
    private oldTypeService = false;

    constructor(private httpMgr: HttpManager) { }

    /**
     * Returns the description of a reified resource, object of a predicate with custom range
     * @param predicate predicate of which the resource represents the object
     * @param resource object of a predicate with a custom range.
     * @return 
     */
    getGraphObjectDescription(predicate: ARTURIResource, resource: ARTNode) {
        console.log("[CustomRangeServices] getGraphObjectDescription");
        var params: any = {
            predicate: predicate.getURI(),
            resource: resource.getNominalValue()
        };
        return this.httpMgr.doGet(this.serviceName, "getGraphObjectDescription", params, this.oldTypeService);
    }
    
    /**
     * Removes the reified resource generated by means of a custom range
     * @param predicate predicate of wich the resource represents the object
     * @param resource object of a predicate with a custom range
     * @return 
     */
    removeReifiedResource(subject: ARTResource, predicate: ARTURIResource, resource: ARTNode) {
        console.log("[CustomRangeServices] removeReifiedResource");
        var params: any = {
            subject: subject.getNominalValue(),
            predicate: predicate.getURI(),
            resource: resource.getNominalValue()
        };
        return this.httpMgr.doGet(this.serviceName, "removeReifiedResource", params, this.oldTypeService);
    }
    
    /**
     * Returns the form for the given CustomRangeEntry
     * @param creId id of a CustomRangeEntry
     * @return an array of FormEntry
     */
    getCustomRangeEntryForm(creId: string) {
        console.log("[CustomRangeServices] getCustomRangeEntryForm");
        var params: any = {
            id: creId
        };
        return this.httpMgr.doGet(this.serviceName, "getCustomRangeEntryForm", params, this.oldTypeService).map(
            stResp => {
                /* this service could throw an error if Pearl is invalid
                (in this case the server throws a PRParserException and it is handled in HttpManager),
                or if the form doesn't contain any formEntry (in this case <form> element doesn't contain
                <formEntry> elements but has an "exception" attribute) */
                var form: Array<FormEntry> = [];
                var formEntryElemColl: Array<Element> = stResp.getElementsByTagName("formEntry");
                
                if (formEntryElemColl.length == 0) {
                    var exception = stResp.getElementsByTagName("form")[0].getAttribute("exception");
                    throw new Error("Error in pearl code of the Custom Range Entry with id '" + creId + "': " + exception);
                }
                
                var pendingEntryDependencies = <any>[];
                //an array of objects {phIdEntry: string, userPromptArg: string} that collects the userPrompt
                //of the formEntries that are used just as argument/dependency of another formEntry and later
                //will be set as arguments to other formEntries
                
                for (var i = 0; i < formEntryElemColl.length; i++) {
                    var placeholderId = formEntryElemColl[i].getAttribute("placeholderId");
                    var type: FormEntryType = formEntryElemColl[i].getAttribute("type") == "literal" ? "literal" : "uri";
                    var mandatory = formEntryElemColl[i].getAttribute("mandatory") == "true";
                    var userPrompt = formEntryElemColl[i].getAttribute("userPrompt");
                    var converter = formEntryElemColl[i].getElementsByTagName("converter")[0].getAttribute("uri");
                    //coda:langString could have an argument to specify the language through another entry 
                    if (converter == "http://art.uniroma2.it/coda/contracts/langString") {
                        var argUserPrompt = formEntryElemColl[i].getElementsByTagName("converter")[0]
                                .getElementsByTagName("arg")[0].getAttribute("userPrompt");
                        pendingEntryDependencies.push({phIdEntry: placeholderId, userPromptArg: argUserPrompt});
                    }
                    var entry = new FormEntry(placeholderId, type, mandatory, userPrompt, converter);
                    if (type == "literal") {
                        var datatype = formEntryElemColl[i].getAttribute("datatype");
                        if (datatype != undefined) {
                            entry.setDatatype(datatype);
                        }
                        var lang = formEntryElemColl[i].getAttribute("lang");
                        if (lang != undefined) {
                            entry.setLang(lang);
                        }
                    }
                    form.push(entry);
                }
                
                //iterate over pendingEntryDependencies and set them as argument of other formEntries
                for (var i = 0; i < pendingEntryDependencies.length; i++) {
                    var argEntry: FormEntry; //entry that is used as argument of another
                    //get the FormEntry to set as argument
                    for (var j = 0; j < form.length; j++) {
                        if (form[j].getUserPrompt() == pendingEntryDependencies[i].userPromptArg) {
                            argEntry = form[j];
                            argEntry.setDependency(true); //mark the entry as a dependency
                        }
                    }
                    //look for the entry to which inject the argEntry as argument
                    for (var j = 0; j < form.length; j++) {
                        if (pendingEntryDependencies[i].phIdEntry == form[j].getPlaceholderId()) {
                            form[j].setConverterArg(argEntry);
                        }
                    }
                }
               
                return form;
            }
        );
    }
    
    /**
     * Makes Coda execute the pearl rule in the given CustomRangeEntry and with the value specified in the entryMap.
     * Then "append" the generated triples (representing a reified object) to the subject-predicate pair. 
     * @param subject
     * @param predicate
     * @param crEntryId
     * @param entryMap array of object {userPrompt: string, value: string} where "userPrompt" is the feature
     * name in the pearl rule which its "value" is provided by means a custom form
     */
    runCoda(subject: ARTResource, predicate: ARTURIResource, crEntryId: string, entryMap: Array<any>) {
        console.log("[CustomRangeServices] runCoda");
        var params: any = {
            subject: subject.getNominalValue(),
            predicate: predicate.getURI(),
            crEntryId: crEntryId,
        };
        for (var i = 0; i < entryMap.length; i++) {
            params[entryMap[i].userPrompt] = entryMap[i].value;
        }
        return this.httpMgr.doGet(this.serviceName, "runCoda", params, this.oldTypeService);
    }
    
    /**
     * Returns the mapping between CustomRange and properties. The returned array contains object
     * with {idCustomRange: string, property: string}.
     * At the moment replaceRanges is ignored 
     */
    getCustomRangeConfigMap(): Observable<CustomRangePropertyMapping[]> {
        console.log("[CustomRangeServices] getCustomRangeConfigMap");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getCustomRangeConfigMap", params, this.oldTypeService).map(
            stResp => {
                var confEntries: Array<any> = [];
                var confEntryElemColl: Array<Element> = stResp.getElementsByTagName("configEntry");
                for (var i = 0; i < confEntryElemColl.length; i++) {
                    var idCustomRange = confEntryElemColl[i].getAttribute("idCustomRange")
                    var property = confEntryElemColl[i].getAttribute("property")
                    var replaceRanges = confEntryElemColl[i].getAttribute("replaceRanges") == "true";//at the moment don't use this
                    confEntries.push(new CustomRangePropertyMapping(idCustomRange, property, replaceRanges));
                }
                return confEntries;
            }
        );
    }
    
    /**
     * Adds a new CustomRange - property mapping
     * @param customRangeId
     * @param property
     * @param replaceRanges tells if the CustomRange will replace the "classic" ranges in the response of getRange service.
     * Currently if it's true it could cause error since the getRange response handler expects <ranges> element.
     */
    addCustomRangeToProperty(customRangeId: string, property: ARTURIResource, replaceRanges?: boolean) {
        console.log("[CustomRangeServices] addCustomRangeToProperty");
        var params: any = {
            customRangeId: customRangeId,
            property: property.getURI()
        };
        if (replaceRanges != undefined) {
            params.replaceRanges = replaceRanges;
        }
        return this.httpMgr.doGet(this.serviceName, "addCustomRangeToProperty", params, this.oldTypeService);
    }
    
    /**
     * Removes the CustomRange from the given property
     * @param property
     */
    removeCustomRangeFromProperty(property: string) {
        console.log("[CustomRangeServices] removeCustomRangeFromProperty");
        var params: any = {
            property: property
        };
	    return this.httpMgr.doGet(this.serviceName, "removeCustomRangeFromProperty", params, this.oldTypeService);
    }

    /**
	 * Update the replaceRanges attribute of a property-CR mapping for the given property
	 * @param property
	 * @param replaceRanges
     */
    updateReplaceRanges(property: string, replaceRanges: boolean) {
        console.log("[CustomRangeServices] updateReplaceRanges");
        var params: any = {
            property: property,
            replaceRanges: replaceRanges
        };
	    return this.httpMgr.doGet(this.serviceName, "updateReplaceRanges", params, this.oldTypeService);
    }
    
    /**
     * Returns the IDs of CustomRange available
     */
    getAllCustomRanges() {
        console.log("[CustomRangeServices] getAllCustomRanges");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getAllCustomRanges", params, this.oldTypeService).map(
            stResp => {
                var customRanges: Array<string> = [];
                var customRangeElemColl: Array<Element> = stResp.getElementsByTagName("customRange");
                for (var i = 0; i < customRangeElemColl.length; i++) {
                    customRanges.push(customRangeElemColl[i].textContent);
                }
                return customRanges;
            }
        );
    }
    
    /**
     * Returns the CustomRange with the given id.
     * @param id
     */
    getCustomRange(id: string) {
	    console.log("[CustomRangeServices] getCustomRange");
        var params: any = {
            id: id
        };
        return this.httpMgr.doGet(this.serviceName, "getCustomRange", params, this.oldTypeService).map(
            stResp => {
                var customRange: CustomRange;
                var crElem: Element = stResp.getElementsByTagName("customRange")[0];
                var crId = crElem.getAttribute("id");
                var entries: CustomRangeEntry[] = [];
                var entryElemColl = crElem.getElementsByTagName("entry");
                for (var i = 0; i < entryElemColl.length; i++) {
                    entries.push(new CustomRangeEntry(entryElemColl[i].getAttribute("id")));
                }
                customRange = new CustomRange(crId);
                customRange.setEntries(entries);
                return customRange;
            }
        );
    }

    /**
     * Creates an empty CustomRange with the given id
     * @param id
     */
    createCustomRange(id: string) {
        console.log("[CustomRangeServices] createCustomRange");
        var params: any = {
            id: id
        };
        return this.httpMgr.doGet(this.serviceName, "createCustomRange", params, this.oldTypeService);
    }

    /**
     * Deletes the CustomRange with the given ID and consequentially the CR-prop mapping with the same CR
     * @param id the ID of the CustomRange to delete
     */
    deleteCustomRange(id: string) {
        console.log("[CustomRangeServices] deleteCustomRange");
        var params: any = {
            id: id
        };
        return this.httpMgr.doGet(this.serviceName, "deleteCustomRange", params, this.oldTypeService);
    }
    
    /**
     * Returns the IDs of all the CustomRangeEntry available
     */
    getAllCustomRangeEntries() {
        console.log("[CustomRangeServices] getAllCustomRangeEntries");
        var params: any = {};
        return this.httpMgr.doGet(this.serviceName, "getAllCustomRangeEntries", params, this.oldTypeService).map(
            stResp => {
                var customRangeEntries: Array<string> = [];
                var customRangeEntryElemColl: Array<Element> = stResp.getElementsByTagName("customRangeEntry");
                for (var i = 0; i < customRangeEntryElemColl.length; i++) {
                    customRangeEntries.push(customRangeEntryElemColl[i].textContent);
                }
                return customRangeEntries;
            }
        );
    }
    
    /**
     * Retrieves the CustomRangeEntry with the given id
     * @param id
     */
    getCustomRangeEntry(id: string) {
        console.log("[CustomRangeServices] getCustomRangeEntry");
        var params: any = {
            id: id
        };
        return this.httpMgr.doGet(this.serviceName, "getCustomRangeEntry", params, this.oldTypeService).map(
            stResp => {
                var creElem: Element = stResp.getElementsByTagName("customRangeEntry")[0];
                var id: string = creElem.getAttribute("id");
                var name: string = creElem.getAttribute("name");
                var type: CustomRangeEntryType = creElem.getAttribute("type") == "graph" ? "graph" : "node";
                var description: string = creElem.getElementsByTagName("description")[0].textContent;
                var refElem: Element = creElem.getElementsByTagName("ref")[0];
                var ref: string = refElem.textContent;
                var showProp: string = refElem.getAttribute("showProperty");
                var cre: CustomRangeEntry = new CustomRangeEntry(id);
                cre.setName(name);
                cre.setType(type);
                cre.setDescription(description);
                cre.setRef(ref);
                if (type == "graph") {
                    cre.setShowProperty(showProp);
                }
                return cre;
            }
        );
    }

    /**
     * Creates a CustomRangeEntry
     * @param type type of the CRE, available values: graph/node
     * @param id id (comprensive of prefix) of the CRE
     * @param name
     * @param description
     * @param ref a pearl rule in case type is "graph", or a converter in case of type is "node"
     * @param showProp to provide only if type is "graph", tells the property which value should show in place of the
     * generated graph by means of this CRE
     */
    createCustomRangeEntry(type: CustomRangeEntryType, id: string, name: string, description: string, ref: string, showProp?: string) {
        console.log("[CustomRangeServices] createCustomRangeEntry");
        var params: any = {
            type: type,
            id: id,
            name: name,
            description: description,
            ref: ref,
        };
        if (showProp != undefined) {
            params.showProp = showProp;
        }
        return this.httpMgr.doPost(this.serviceName, "createCustomRangeEntry", params, this.oldTypeService);
    }

    /**
     * Creates a new CRE cloning an existing CRE
     * @param sourceId id of the CRE to clone
     * @param targetId id of the CRE to create
     */
    cloneCustomRangeEntry(sourceId: string, targetId: string) {
        console.log("[CustomRangeServices] cloneCustomRangeEntry");
        var params: any = {
            sourceId: sourceId,
            targetId: targetId
        };
        return this.httpMgr.doGet(this.serviceName, "cloneCustomRangeEntry", params, this.oldTypeService);
    }

    /**
     * Deletes the CustomRangeEntry with the given ID.
     * @param id the ID of the CustomRangeEntry to delete
     */
    deleteCustomRangeEntry(id: string, deleteEmptyCr?: boolean) {
        console.log("[CustomRangeServices] deleteCustomRangeEntry");
        var params: any = {
            id: id
        };
        if (deleteEmptyCr != undefined) {
            params.deleteEmptyCr = deleteEmptyCr;
        }
        return this.httpMgr.doGet(this.serviceName, "deleteCustomRangeEntry", params, this.oldTypeService);
    }

    /**
     * Given the id of a CustomRangeEntry tells if it belong to a CustomRange
     * @param id the ID of the CustomRangeEntry to check
     */
    isEntryLinkedToCustomRange(id: string): Observable<boolean> {
        console.log("[CustomRangeServices] isEntryLinkedToCustomRange");
        var params: any = {
            id: id
        };
        return this.httpMgr.doGet(this.serviceName, "isEntryLinkedToCustomRange", params, this.oldTypeService).map(
            stResp => {
                return stResp.getElementsByTagName("value")[0].textContent == "true";
            }
        );
    }

    /**
     * Updates attributes of an existing CRE
     * @param id
     * @param name
     * @param description
     * @param ref
     * @param showProp
     */
    updateCustomRangeEntry(id: string, name: string, description: string, ref: string, showProp: string) {
        console.log("[CustomRangeServices] updateCustomRangeEntry");
        var params: any = {
            id: id,
            name: name,
            description: description,
            ref: ref,
        };
        if (showProp != undefined) {
            params.showProp = showProp;
        }
        return this.httpMgr.doPost(this.serviceName, "updateCustomRangeEntry", params, this.oldTypeService);
    }

    /**
     * Adds a CustomRangeEntry to the entries of a CustomRange
     * @param customRangeId
     * @param customRangeEntryId
     */
    addEntryToCustomRange(customRangeId: string, customRangeEntryId: string) {
        console.log("[CustomRangeServices] addEntryToCustomRange");
        var params: any = {
            customRangeId: customRangeId,
            customRangeEntryId: customRangeEntryId
        };
        return this.httpMgr.doGet(this.serviceName, "addEntryToCustomRange", params, this.oldTypeService);
    }

    /**
     * Removes a CustomRangeEntry from the entries of a CustomRange
     * @param customRangeId
     * @param customRangeEntryId
     */
    removeEntryFromCustomRange(customRangeId: string, customRangeEntryId: string) {
        console.log("[CustomRangeServices] removeEntryFromCustomRange");
        var params: any = {
            customRangeId: customRangeId,
            customRangeEntryId: customRangeEntryId
        };
        return this.httpMgr.doGet(this.serviceName, "removeEntryFromCustomRange", params, this.oldTypeService);
    }

    /**
     * Validate a pearl rule. If the rule is syntactically correct return a response, otherwise hanlde an exception.
     * @param pearl rule to be parsed, it should be a whole pearl rule if the CRE is a graph entry
     * or a converter if the CRE is a node entry
     * @param creType tells if the CRE is type "node" or "graph".
     * Determines also the nature of the pearl parameter
     */
    validatePearl(pearl: string, creType: CustomRangeEntryType) {
        console.log("[CustomRangeServices] validatePearl");
        var params: any = {
            pearl: pearl,
            creType: creType
        };
        return this.httpMgr.doPost(this.serviceName, "validatePearl", params, this.oldTypeService);
    }
    
}