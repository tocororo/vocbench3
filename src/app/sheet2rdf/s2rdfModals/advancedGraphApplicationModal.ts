import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, Modal, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs";
import { ARTURIResource } from "../../models/ARTResources";
import { ConverterContractDescription, RDFCapabilityType } from "../../models/Coda";
import { Configuration, ConfigurationComponents, ConfigurationProperty } from "../../models/Configuration";
import { PrefixMapping } from "../../models/Metadata";
import { AdvancedGraphApplication, NodeConversion, SimpleHeader } from "../../models/Sheet2RDF";
import { RangeType } from "../../services/propertyServices";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { LoadConfigurationModalReturnData } from "../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { NodeCreationModal, NodeCreationModalData } from "./nodeCreationModal";

export class AdvancedGraphApplicationModalData extends BSModalContext {
    constructor(public header: SimpleHeader, public graphApplication?: AdvancedGraphApplication) {
        super();
    }
}

@Component({
    selector: "advanced-graph-modal",
    templateUrl: "./advancedGraphApplicationModal.html",
})
export class AdvancedGraphApplicationModal implements ModalComponent<AdvancedGraphApplicationModalData> {
    context: AdvancedGraphApplicationModalData;

    //Nodes
    private alreadyDefinedNodes: NodeConversion[] = []; //nodes already defined in the header
    private newDefinedNodes: NodeConversion[] = []; //nodes defined contextually the graph creation/edit
    private selectedNode: NodeConversion;

    //Graph
    @ViewChild('prefixnstable') prefixNsTableElement: ElementRef;
    private globalPrefixMappings: PrefixMapping[] = [];
    private localPrefixMappings: PrefixMapping[] = [];
    private selectedMapping: PrefixMapping;

    private graphPattern: string;
    private defaultPredicate: ARTURIResource;
    private readonly PRED_PLACEHOLDER: string = "{{pred}}"

    constructor(public dialog: DialogRef<AdvancedGraphApplicationModalData>, private s2rdfService: Sheet2RDFServices, 
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modal: Modal) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.context.header.nodes.forEach(n => {
            this.alreadyDefinedNodes.push(n);
        })
        this.s2rdfService.getPrefixMappings().subscribe(
            mapping => {
                this.globalPrefixMappings = mapping;
                if (this.context.graphApplication != null) { //edit mode => restore pref-ns mappings
                    this.restorePrefixNsMappings(this.context.graphApplication.prefixMapping);
                }
            }
        );
        if (this.context.graphApplication != null) { //edit mode => restore UI
            this.graphPattern = this.context.graphApplication.pattern;
            this.defaultPredicate = this.context.graphApplication.defaultPredicate;
        }
    }

    /*
     * ============== NODES ==================
     */

    private selectNode(node: NodeConversion) {
        if (this.selectedNode == node) {
            this.selectedNode = null;
        } else {
            this.selectedNode = node;
        }
    }

    private addNode() {
        var modalData = new NodeCreationModalData(this.context.header, null, null, null, null, this.newDefinedNodes);
        const builder = new BSModalContextBuilder<NodeCreationModalData>(
            modalData, undefined, NodeCreationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        this.modal.open(NodeCreationModal, overlayConfig).result.then(
            (node: NodeConversion) => {
                this.newDefinedNodes.push(node);
            },
            () => {}
        );
    }

    private removeNode() {
        /**
         * The deletion of a new created node should not invoke any service since the node is not already added to the header.
         * The deleation of a pre-defined node, instead, should invoke the removal service
         */
        if (this.newDefinedNodes.indexOf(this.selectedNode) != -1) { //node defined contextually in this creation/edit
            this.newDefinedNodes.splice(this.newDefinedNodes.indexOf(this.selectedNode), 1);
            this.selectedNode = null;
        } else { //node already defined in the header => check if it is used by some other graph application
            let used: boolean = false;
            let referenced: boolean = SimpleHeader.isNodeReferenced(this.context.header, this.selectedNode);
            //TODO allow to forcing the deletion a referenced node or not allow at all? 
            if (referenced) { //cannot delete a node used by a graph application
                this.basicModals.confirm("Delete node", "Warning: the node '" + this.selectedNode.nodeId + "' is used in one or more graph application. " +
                    "This operation will affect also the graph application. Do you want to continue?", "warning").then(
                    confirm => {
                        this.removeNodeImpl();
                    },
                    () => {}
                );
            } else {
                this.removeNodeImpl();
            }
        }
    }
    private removeNodeImpl() {
        this.s2rdfService.removeNodeFromHeader(this.context.header.id, this.selectedNode.nodeId).subscribe(
            resp => {
                this.alreadyDefinedNodes.splice(this.alreadyDefinedNodes.indexOf(this.selectedNode), 1);
                this.selectedNode = null;
            }
        );
    }

    private changeUriConverter(node: NodeConversion) {
        var modalData = new NodeCreationModalData(this.context.header, node, RangeType.resource, null, null, null);
        const builder = new BSModalContextBuilder<NodeCreationModalData>(
            modalData, undefined, NodeCreationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        this.modal.open(NodeCreationModal, overlayConfig).result.then(
            (n: NodeConversion) => {
                node.converter = n.converter;
            },
            () => {}
        );
    }

    private changeLiteralConverter(node: NodeConversion) {
        var modalData = new NodeCreationModalData(this.context.header, node, RangeType.plainLiteral, null, null, null);
        const builder = new BSModalContextBuilder<NodeCreationModalData>(
            modalData, undefined, NodeCreationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        this.modal.open(NodeCreationModal, overlayConfig).result.then(
            (n: NodeConversion) => {
                node.converter = n.converter;
            },
            () => {}
        );
    }

    /*
     * ============= PREFIX-NS =================
     */

    private selectMapping(m: PrefixMapping) {
        if (!m.explicit) return;
        if (this.selectedMapping == m) {
            this.selectedMapping = null;
        } else {
            this.selectedMapping = m;
        }
    }

    private addMapping() {
        this.sharedModals.prefixNamespace("Add prefix-namespace mapping").then(
            (mapping: { prefix: string, namespace: string }) => {
                //check if the prefix or the namespace are not already defined
                if (
                    this.globalPrefixMappings.some(m => m.prefix == mapping.prefix) || 
                    this.localPrefixMappings.some(m => m.prefix == mapping.prefix)
                ) {
                    this.basicModals.alert("Add prefix-namespace mapping", "A mapping with prefix " + mapping.prefix + " is already defined", "warning");
                } else if (
                    this.globalPrefixMappings.some(m => m.namespace == mapping.namespace) || 
                    this.localPrefixMappings.some(m => m.namespace == mapping.namespace)
                ) {
                    this.basicModals.alert("Add prefix-namespace mapping", "A mapping with namespace " + mapping.namespace + " is already defined", "warning");
                } else { //not used => add it
                    let newMapping = { prefix: mapping.prefix, namespace: mapping.namespace, explicit: true };
                    this.localPrefixMappings.push(newMapping);
                    setTimeout(() => {
                        this.prefixNsTableElement.nativeElement.scrollTop = this.prefixNsTableElement.nativeElement.scrollHeight;
                        this.selectMapping(newMapping);
                    });
                }
            }
        );
    }

    private removeMapping() {
        this.localPrefixMappings.splice(this.localPrefixMappings.indexOf(this.selectedMapping), 1);
    }
    
    /**
     * Adds the given mappings into localPrefixMappings
     */
    private restorePrefixNsMappings(mappings: {[prefix: string]: string}) {
        for (let prefix in mappings) {
            /** 
             * If the mappings is not already in the globalPrefixMappings, add it into the localPrefixMappings.
             * TODO: if the mappings is not in the globalPrefixMappings, but the prefix is already in use?
             * do not add the mapping and replace the prefix in the pattern?
             */
            if (!this.globalPrefixMappings.some((gp: PrefixMapping) => gp.prefix == prefix && gp.namespace == mappings[prefix])) {
                this.localPrefixMappings.push({ prefix: prefix, namespace: mappings[prefix], explicit: true })
            }
        }
    }

    /*
     * ============= GRAPHS =================
     */

    private updateDefaultPredicate(pred: ARTURIResource) {
        this.defaultPredicate = pred;
    }

    private validatePattern() {
        /**
         * Creates a fake complete pearl rule just for pass it to the validateGraphPattern service.
         */
        let pearl: string = "";
        this.globalPrefixMappings.forEach(m => {
            pearl += "prefix " + m.prefix + ": <" + m.namespace + ">\n";
        });
        this.localPrefixMappings.forEach(m => {
            pearl += "prefix " + m.prefix + ": <" + m.namespace + ">\n";
        });
        pearl += "rule it.uniroma2.art.FakeRule id:rule {\n";
        pearl += "nodes = {\n";
        pearl += "subject uri " + this.context.header.pearlFeature + "\n";
        this.alreadyDefinedNodes.forEach(n => {
            pearl += n.nodeId + " " + n.converter.type + " " + this.context.header.pearlFeature + " .\n";
        });
        this.newDefinedNodes.forEach(n => {
            pearl += n.nodeId + " " + n.converter.type + " " + this.context.header.pearlFeature + " .\n";
        });
        pearl += "}\n"; //close nodes
        pearl += "graph = {\n";
        let gp: string = this.graphPattern;
        if (gp.includes(this.PRED_PLACEHOLDER)) {
            gp = gp.replace(this.PRED_PLACEHOLDER, this.defaultPredicate.toNT());
        }
        pearl += gp + "\n";
        pearl += "}\n"; //close graph
        pearl += "}\n"; //close rule

        return this.s2rdfService.validateGraphPattern(pearl).map(
            validation => {
                if (!validation.valid) {
                    this.basicModals.alert("Advanced Graph Application", validation.details, "warning");
                    return validation;
                } else {
                    validation.usedNodes.forEach((nodeId, index, list) => {
                        list[index] = nodeId.substring(1); //removes the leading $
                    })
                    if (validation.usedNodes.indexOf("subject")) {
                        validation.usedNodes.splice(validation.usedNodes.indexOf("subject"), 1);
                    }
                    return validation;
                }
            }
        );
    }


    private saveGraph() {
        if (!this.isOkEnabled()) {
            this.basicModals.alert("Store Advanced Graph Application", "The Graph Application is not completed. " + 
                "Please, provide a list of nodes and a graph pattern.", "warning");
            return;
        }

        this.validatePattern().subscribe(
            validation => {
                if (validation.valid) {
                    //collect only the node to store in the configuration, namely those nodes referenced by the graph pattern
                    let nodesToStore: NodeConversion[] = [];
                    validation.usedNodes.forEach(nodeId => {
                        let referencedNode = this.newDefinedNodes.find(n => n.nodeId == nodeId);
                        if (referencedNode == null) {
                            referencedNode = this.alreadyDefinedNodes.find(n => n.nodeId == nodeId);
                        }
                        nodesToStore.push(referencedNode);
                    });
                    let prefixMappingToStore: {[key:string]:string} = {}

                    validation.usedPrefixes.forEach(prefix => {
                        let namespace: string;
                        this.localPrefixMappings.forEach(m => { //search first the prefix-ns mapping in those defined locally
                            if (m.prefix == prefix) {
                                namespace = m.namespace;
                            }
                        });
                        if (namespace == null) { //if not found, search it in the global prefix-ns mapping
                            this.globalPrefixMappings.forEach(m => {
                                if (m.prefix == prefix) {
                                    namespace = m.namespace;
                                }
                            });
                        }
                        prefixMappingToStore[prefix] = namespace;
                    })
                    let config: { [key: string]: any } = {
                        pattern: this.graphPattern,
                        nodes: nodesToStore,
                        prefixMapping: prefixMappingToStore,
                        defaultPredicate: this.defaultPredicate != null ? this.defaultPredicate.toNT() : null
                    };
                    this.sharedModals.storeConfiguration("Save Advanced Graph Application", ConfigurationComponents.ADVANCED_GRAPH_APPLICATION_STORE, config).then(
                        () => {
                            this.basicModals.alert("Save configuration", "Configuration saved succesfully");
                        },
                        () => {}
                    );
                }
            }
        );
    }

    private loadGraph() {
        this.s2rdfService.getDefaultAdvancedGraphApplicationConfigurations().subscribe(
            references => {
                this.sharedModals.loadConfiguration("Load Advanced Graph Application", ConfigurationComponents.ADVANCED_GRAPH_APPLICATION_STORE, false, references).then(
                    (data: LoadConfigurationModalReturnData) => {
                        //reset the current status
                        this.newDefinedNodes = [];
                        // this.alreadyDefinedNodes = [];
                        this.selectedNode = null;
                        this.localPrefixMappings = [];
                        this.selectedMapping = null;
                        this.graphPattern = null;

                        if (data.configuration != null) { //configuration loaded by the loadConfiguration modal
                            this.setLoadedGraphApplication(data.configuration);
                        } else { //configuration not loaded, it means that the user has chosen an additional configuration => handle it
                            this.s2rdfService.getConfiguration(data.reference.identifier).subscribe(
                                conf => {
                                    this.setLoadedGraphApplication(conf);
                                }
                            )
                        }
                    },
                    () => {}
                );
            }
        );
    }

    private setLoadedGraphApplication(conf: Configuration) {
        let confProps: ConfigurationProperty[] = conf.properties;
        let nodesToRestore: NodeConversion[] = [];
        for (let i = 0; i < confProps.length; i++) {
            if (confProps[i].name == "pattern") {
                this.graphPattern = confProps[i].value;
            } else if (confProps[i].name == "nodes") {
                nodesToRestore = confProps[i].value;
            } else if (confProps[i].name == "prefixMapping") {
                let prefMapValue: {[key: string]: string} = confProps[i].value;
                this.restorePrefixNsMappings(prefMapValue);
            } else if (confProps[i].name == "defaultPredicate" && confProps[i].value != null) {
                this.defaultPredicate = new ARTURIResource(confProps[i].value);
            }
        }
        /**
         * Now restore the nodes. This operation could not be done in the previous for loop, because if the nodes are processed before the
         * graph pattern, the replace of the node IDs in the graph pattern fails
         */
        //check and collect node id collisions to be replaced
        let replacedNodeIds: { old: string, new: string }[] = [];
        let nodeIdCheckFn: Observable<any>[] = [];
        nodesToRestore.forEach(n => {
            nodeIdCheckFn.push(
                this.getAdaptedNodeId(n.nodeId).map(
                    newId => {
                        if (newId != n.nodeId) { //node is different, so it was already used and it is changed.
                            let oldId = n.nodeId;
                            replacedNodeIds.push({ old: oldId, new: newId });
                            //replace node id in the conversion
                            n.nodeId = newId; //node ID
                            //replace node id in graph pattern
                            let nodeRegex = new RegExp("(?<!\\w)\\$" + oldId + "\\b", "g");
                            this.graphPattern = this.graphPattern.replace(nodeRegex, "$"+newId);
                        }
                    }
                )
            );
        });
        Observable.forkJoin(nodeIdCheckFn).subscribe(
            () => {
                if (replacedNodeIds.length > 0) { //report of changes
                    let report: string = replacedNodeIds.map(n => " - '" + n.old + "' → '" + n.new + "'").join("\n");
                    this.basicModals.alert("Load Advanced Graph Application", "One or more nodes defined in the loaded " + 
                        "Advanced Graph Application, have ID already in use by other nodes. They have been replaced:\n"  + report, "warning");
                }
                /**
                 * Some node might be referenced as parameter of other node converter => replace there as well
                 */
                replacedNodeIds.forEach(replacement => {
                    nodesToRestore.forEach(n => {
                        for (let paramName in n.converter.params) {
                            let paramValue = n.converter.params[paramName];
                            if (typeof paramValue === "string") {
                                if (n.converter.params[paramName] == replacement.old) n.converter.params[paramName] = replacement.new;
                            } else if (Array.isArray(paramValue)) { //array
                                paramValue.forEach(v => {
                                    if (v == replacement.old) v = replacement.new;
                                });
                            } else if (typeof paramValue == "object") { //map
                                for (let key in <any>paramValue) {
                                    if (paramValue[key] == replacement.old) paramValue[key] = replacement.new;
                                }
                            }
                        }
                    })
                });

                /**
                 * for each node: 
                 * if its converter is the default literal,
                 * if it has a language (so, the conversion serialization would be something like literal@xy)
                 * if the header has a language in the name
                 * => replace the converter language with the one in the header name
                 */
                nodesToRestore.forEach(n => {
                    if (
                        n.converter.contractUri == ConverterContractDescription.NAMESPACE + "default" && n.converter.type == RDFCapabilityType.literal &&
                        n.converter.language != null && this.context.header.nameStruct.lang != null
                    ) {
                        n.converter.language = this.context.header.nameStruct.lang
                    }
                })

                this.newDefinedNodes = nodesToRestore;
            }
        );
    }

    /**
     * Given a node, checks if the given id is in use and in case of collision with other id, return the first "free" id
     * @param node 
     * @param nodeId 
     */
    private getAdaptedNodeId(nodeId: string): Observable<string> {
        return this.s2rdfService.isNodeIdAlreadyUsed(nodeId).flatMap(
            used => {
                if (used) {
                    let newId = nodeId + "_1";
                    //invoke itself recursively
                    return this.getAdaptedNodeId(newId);
                } else { //not used
                    return Observable.of(nodeId);
                }
            }
        );
    }

    private isOkEnabled(): boolean {
        return (this.newDefinedNodes.length > 0 || this.alreadyDefinedNodes.length > 0) && this.graphPattern != null && this.graphPattern.trim() != "";
    }

    ok() {
        /**
         * Steps:
         * - check if pattern contains {{pred}} placeholder, in case, check if the default predicate is provided.
         * - validate graph pattern (passing also the prefix-ns mappings and eventually replace the {{pred}} placeholder).
         *   I expect from the response: if the pattern is ok, the list of placeholders, otherwise an error message.
         * - check if all the placeholders returned above (those used in the graph pattern) are defined in the nodes section.
         * - add all the nodes to the header
         * - add the advancedGraphApplication to the header
         */

        if (this.graphPattern.includes(this.PRED_PLACEHOLDER) && this.defaultPredicate == null) {
            this.basicModals.alert("Missing default predicate", 
                "The graph pattern contains the {{pred}} placeholder, but a default predicate has not been provided", "warning");
            return;
        }

        this.validatePattern().subscribe(
            validation => {
                if (validation.valid) {
                    //above check passed, now add the new nodes to the header (prevent to add nodes again to the header in case of update)
                    let addNodeFn: Observable<any>[] = [];
                    this.newDefinedNodes.forEach(n => {
                        addNodeFn.push(this.s2rdfService.addNodeToHeader(this.context.header.id, n.nodeId, n.converter.type,
                            n.converter.contractUri, n.converter.datatypeUri, n.converter.language, n.converter.params, n.memoize));
                    });

                    let prefixMappingMap: {[key: string]: string} = {};
                    //collect the prefixes used in the graph pattern and locally defined
                    //(no need to check on global, since it means that the prefix-namespace is already available in the project)
                    validation.usedPrefixes.forEach(prefix => {
                        let namespace: string;
                        this.localPrefixMappings.forEach(m => { //search first the prefix-ns mapping in those defined locally
                            if (m.prefix == prefix) {
                                namespace = m.namespace;
                            }
                        });
                        if (namespace != null) { //namespace found in the local mapping (if null => is defined in the global one)
                            prefixMappingMap[prefix] = namespace;
                        }
                    });

                    if (addNodeFn.length != 0) {
                        Observable.forkJoin(addNodeFn).subscribe(
                            () => { //nodes added => now add/update the graph application
                                let graphAppFn: Observable<any>;
                                if (this.context.graphApplication == null) { //creation mode
                                    graphAppFn = this.s2rdfService.addAdvancedGraphApplicationToHeader(
                                        this.context.header.id, this.graphPattern, validation.usedNodes, prefixMappingMap, this.defaultPredicate);
                                } else { //edit mode
                                    graphAppFn = this.s2rdfService.updateAdvancedGraphApplication(
                                        this.context.header.id, this.context.graphApplication.id, this.graphPattern, validation.usedNodes, prefixMappingMap);
                                }
                                graphAppFn.subscribe(
                                    () => { //done
                                        this.dialog.close();
                                    }
                                );
                            }
                        );
                    } else { //no node to add, simply update the graph pattern
                        this.s2rdfService.updateAdvancedGraphApplication(
                            this.context.header.id, this.context.graphApplication.id, this.graphPattern, validation.usedNodes, prefixMappingMap).subscribe(
                            stResp => {
                                this.dialog.close();
                            }
                        );
                    }
                }
            }
        );

    }

    cancel() {
        this.dialog.dismiss();
    }

    //UTILS

    private getDatatypeShow(datatypeUri: string) {
        return ResourceUtils.getQName(datatypeUri, VBContext.getPrefixMappings());
    }

}