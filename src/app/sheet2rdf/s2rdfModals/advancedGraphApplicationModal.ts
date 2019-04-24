import { Component } from "@angular/core";
import { DialogRef, Modal, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs";
import { Configuration, ConfigurationComponents, ConfigurationProperty } from "../../models/Configuration";
import { PrefixMapping } from "../../models/Metadata";
import { AdvancedGraphApplication, NodeConversion, SimpleHeader } from "../../models/Sheet2RDF";
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


    private alreadyDefinedNodes: NodeConversion[] = []; //nodes already defined in the header
    private newDefinedNodes: NodeConversion[] = []; //nodes defined contextually the graph creation/edit
    private selectedNode: NodeConversion;

    private globalPrefixMappings: PrefixMapping[] = [];
    private localPrefixMappings: PrefixMapping[] = [];
    private selectedMapping: PrefixMapping;

    private graphPattern: string;

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
            }
        );

        if (this.context.graphApplication != null) { //edit mode => restore UI
            this.graphPattern = this.context.graphApplication.pattern;
        }
    }

    private selectNode(node: NodeConversion) {
        if (this.selectedNode == node) {
            this.selectedNode = null;
        } else {
            this.selectedNode = node;
        }
    }

    private addNode() {
        var modalData = new NodeCreationModalData(this.context.header, null, null, null, this.newDefinedNodes);
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

    private selectMapping(m: PrefixMapping) {
        if (!m.explicit) return;
        if (this.selectedMapping == m) {
            this.selectedMapping = null;
        } else {
            this.selectedMapping = m;
        }
    }

    private isOkEnabled(): boolean {
        return (this.newDefinedNodes.length > 0 || this.alreadyDefinedNodes.length > 0) && this.graphPattern != null && this.graphPattern.trim() != "";
    }

    private validatePatternMockup(): Observable<string[]> {
        //Ideally, the server should throw an exception in case the pattern is wrong, the list of node otherwise
        let nodes: string[] = [];
        let nodeIdRegex: RegExp = /\$([a-zA-Z0-9_]+)/g;
        let match = nodeIdRegex.exec(this.graphPattern);
        while (match != null) {
            let nodeId = match[1]; //index 0 is the whole match, index 1 is the group of the id (without the leading $)
            if (nodes.indexOf(nodeId) == -1) {
                nodes.push(nodeId);
            }
            match = nodeIdRegex.exec(this.graphPattern);
        };
        if (nodes.indexOf("subject") != -1) { //eventually remove the "subject" from the referenced node IDs (which is reserved)
            nodes.splice(nodes.indexOf("subject"), 1);
        }
        return Observable.of(nodes);
    }


    private validateReferencedNodes(referencedIDs: string[]): boolean {
        //check for referenced nodes missing in nodes list
        for (let referencedId of referencedIDs) {
            let referencedNode = this.newDefinedNodes.find(n => n.nodeId == referencedId);
            if (referencedNode == null) {
                referencedNode = this.alreadyDefinedNodes.find(n => n.nodeId == referencedId);
            }

            if (referencedNode == null) { //referenced node not found
                this.basicModals.alert("Advanced Graph Application", "The graph pattern references to a node with id '" + referencedId 
                    + "', but it is not defined in the nodes list", "warning");
                return false;
            }
        }
        return true;
    }


    private saveGraph() {
        if (!this.isOkEnabled()) {
            this.basicModals.alert("Store Advanced Graph Application", "The Graph Application is not completed. " + 
                "Please, provide a list of nodes and a graph pattern.", "warning");
            return;
        }
        this.validatePatternMockup().subscribe(
            referencedNodeIDs => {
                if (!this.validateReferencedNodes(referencedNodeIDs)) {
                    return;
                }

                //collect only the node to store in the configuration, namely those nodes referenced by the graph pattern
                let nodesToStore: NodeConversion[] = [];
                referencedNodeIDs.forEach(nodeId => {
                    let referencedNode = this.newDefinedNodes.find(n => n.nodeId == nodeId);
                    if (referencedNode == null) {
                        referencedNode = this.alreadyDefinedNodes.find(n => n.nodeId == nodeId);
                    }
                    nodesToStore.push(referencedNode);
                });
                let prefixMappingToStore: {[key:string]:string} = {}
                this.localPrefixMappings.forEach(mapping => {
                    prefixMappingToStore[mapping.prefix] = mapping.namespace;
                })
                let config: { [key: string]: any } = {
                    graphPattern: this.graphPattern,
                    nodes: nodesToStore,
                    prefixMapping: prefixMappingToStore
                };
                this.sharedModals.storeConfiguration("Save Advanced Graph Application", ConfigurationComponents.ADVANCED_GRAPH_APPLICATION_STORE, config).then(
                    () => {
                        this.basicModals.alert("Save configuration", "Configuration saved succesfully");
                    },
                    () => {}
                );
            }
        );
    }

    private loadGraph() {
        this.sharedModals.loadConfiguration("Load Advanced Graph Application", ConfigurationComponents.ADVANCED_GRAPH_APPLICATION_STORE).then(
            (data: LoadConfigurationModalReturnData) => {
                //reset the current status
                this.newDefinedNodes = [];
                this.alreadyDefinedNodes = [];
                this.selectedNode = null;
                this.localPrefixMappings = [];
                this.selectedMapping = null;
                this.graphPattern = null;
                this.setLoadedGraphApplication(data.configuration);
            }
        );
    }

    private setLoadedGraphApplication(conf: Configuration) {
        let confProps: ConfigurationProperty[] = conf.properties;
        let nodesToRestore: NodeConversion[] = [];
        for (let i = 0; i < confProps.length; i++) {
            if (confProps[i].name == "graphPattern") {
                this.graphPattern = confProps[i].value;
            } else if (confProps[i].name == "nodes") {
                nodesToRestore = confProps[i].value;
            } else if (confProps[i].name == "prefixMapping") {
                let prefMapValue: {[key: string]: string} = confProps[i].value;
                Object.keys(prefMapValue).forEach(prefix => {
                    this.localPrefixMappings.push({ prefix: prefix, namespace: prefMapValue[prefix], explicit: true });
                });
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
                            console.log("replace", oldId, "with", newId);
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

    ok() {
        /**
         * Steps:
         * - validate graph pattern (passing also the prefix-ns mappings).
         *   I expect from the response: if the pattern is ok, the list of placeholders, otherwise an error message.
         * - check if all the placeholders returned above (those used in the graph pattern) are defined in the nodes section.
         * - add all the nodes to the header
         * - add the advancedGraphApplication to the header
         */
        this.validatePatternMockup().subscribe(
            referencedIDs => {
                //if there is some node referenced but not defined, prevent confirming
                if (!this.validateReferencedNodes(referencedIDs)) {
                    return;
                }
                //above check passed, now add the new nodes to the header (prevent to add nodes again to the header in case of update)
                let addNodeFn: Observable<any>[] = [];
                this.newDefinedNodes.forEach(n => {
                    addNodeFn.push(this.s2rdfService.addNodeToHeader(this.context.header.id, n.nodeId, n.converter.type,
                        n.converter.contractUri, n.converter.datatypeUri, n.converter.language, n.converter.params, n.memoize));
                });

                let prefixMappingMap: {[key: string]: string} = {};
                this.localPrefixMappings.map(p => prefixMappingMap[p.prefix] = p.namespace);

                if (addNodeFn.length != 0) {
                    Observable.forkJoin(addNodeFn).subscribe(
                        () => { //nodes added => now add/update the graph application
                            let graphAppFn: Observable<any>;
                            if (this.context.graphApplication == null) { //creation mode
                                graphAppFn = this.s2rdfService.addAdvancedGraphApplicationToHeader(
                                    this.context.header.id, this.graphPattern, referencedIDs, prefixMappingMap);
                            } else { //edit mode
                                graphAppFn = this.s2rdfService.updateAdvancedGraphApplication(
                                    this.context.header.id, this.context.graphApplication.id, this.graphPattern, referencedIDs, prefixMappingMap);
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
                        this.context.header.id, this.context.graphApplication.id, this.graphPattern, referencedIDs, prefixMappingMap).subscribe(
                        stResp => {
                            this.dialog.close();
                        }
                    );
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