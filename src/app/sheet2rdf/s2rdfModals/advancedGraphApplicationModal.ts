import { ChangeDetectorRef, Component, ElementRef, Input, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable, of } from "rxjs";
import { map, mergeMap } from 'rxjs/operators';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { ConverterContractDescription, RDFCapabilityType } from "../../models/Coda";
import { Configuration, ConfigurationComponents, ConfigurationProperty } from "../../models/Configuration";
import { PrefixMapping } from "../../models/Metadata";
import { AdvancedGraphApplication, NodeConversion, S2RDFModel, SimpleHeader } from "../../models/Sheet2RDF";
import { RangeType } from "../../services/propertyServices";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { LoadConfigurationModalReturnData } from "../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { Sheet2RdfContextService } from "../sheet2rdfContext";
import { NodeCreationModal } from "./nodeCreationModal";

@Component({
    selector: "advanced-graph-modal",
    templateUrl: "./advancedGraphApplicationModal.html",
})
export class AdvancedGraphApplicationModal {
    @Input() sheetName: string;
    @Input() header: SimpleHeader;
    @Input() graphApplication?: AdvancedGraphApplication;

    private s2rdfModel: S2RDFModel;

    //Nodes
    alreadyDefinedNodes: NodeConversion[] = []; //nodes already defined in the header
    newDefinedNodes: NodeConversion[] = []; //nodes defined contextually the graph creation/edit
    selectedNode: NodeConversion;

    //Graph
    @ViewChild('prefixnstable') prefixNsTableElement: ElementRef;
    globalPrefixMappings: PrefixMapping[] = [];
    localPrefixMappings: PrefixMapping[] = [];
    selectedMapping: PrefixMapping;

    graphPattern: string;
    defaultPredicate: ARTURIResource;
    private readonly PRED_PLACEHOLDER: string = "{{pred}}";

    constructor(public activeModal: NgbActiveModal, private s2rdfService: Sheet2RDFServices, private s2rdfCtx: Sheet2RdfContextService,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal,
        private translateService: TranslateService, private changeDetectorRef: ChangeDetectorRef) {
    }

    ngOnInit() {
        this.s2rdfModel = this.s2rdfCtx.sheetModelMap.get(this.sheetName);

        this.header.nodes.forEach(n => {
            this.alreadyDefinedNodes.push(n);
        });
        this.s2rdfService.getPrefixMappings().subscribe(
            mapping => {
                this.globalPrefixMappings = mapping;
                if (this.graphApplication != null) { //edit mode => restore pref-ns mappings
                    this.restorePrefixNsMappings(this.graphApplication.prefixMapping);
                }
            }
        );
        if (this.graphApplication != null) { //edit mode => restore UI
            this.graphPattern = this.graphApplication.pattern;
            this.defaultPredicate = this.graphApplication.defaultPredicate;
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

    addNode() {
        this.openNodeEditorModal(this.header, null, null, false, null, null, this.newDefinedNodes).then(
            (node: NodeConversion) => {
                this.newDefinedNodes.push(node);
            },
            () => { }
        );
    }

    removeNode() {
        /**
         * The deletion of a new created node should not invoke any service since the node is not already added to the header.
         * The deleation of a pre-defined node, instead, should invoke the removal service
         */
        if (this.newDefinedNodes.indexOf(this.selectedNode) != -1) { //node defined contextually in this creation/edit
            this.newDefinedNodes.splice(this.newDefinedNodes.indexOf(this.selectedNode), 1);
            this.selectedNode = null;
        } else { //node already defined in the header => check if it is used by some other graph application
            let referenced: boolean = SimpleHeader.isNodeReferenced(this.header, this.selectedNode);
            //allow to forcing the deletion a referenced node or not allow at all? 
            if (referenced) { //cannot delete a node used by a graph application
                this.basicModals.confirm({ key: "STATUS.WARNING" }, { key: "MESSAGES.DELETE_HEADER_NODE_USED_IN_GRAPH_APP_CONFIRM" }, ModalType.warning).then(
                    confirm => {
                        this.removeNodeImpl();
                    },
                    () => { }
                );
            } else {
                this.removeNodeImpl();
            }
        }
    }
    private removeNodeImpl() {
        this.s2rdfService.removeNodeFromHeader(this.sheetName, this.header.id, this.selectedNode.nodeId).subscribe(
            resp => {
                this.alreadyDefinedNodes.splice(this.alreadyDefinedNodes.indexOf(this.selectedNode), 1);
                this.selectedNode = null;
            }
        );
    }

    changeConverter(node: NodeConversion) {
        let rangeType: RangeType = node.converter ? (node.converter.type == RDFCapabilityType.uri ? RangeType.resource : RangeType.literal) : null;
        this.openNodeEditorModal(this.header, node, rangeType, false, null, null, null).then(
            (n: NodeConversion) => {
                node.converter = n.converter;
            },
            () => { }
        );
    }

    private openNodeEditorModal(header: SimpleHeader, editingNode: NodeConversion, rangeType: RangeType, lockRangeType: boolean,
        constrainedLanguage: string, constrainedDatatype: ARTURIResource, headerNodes: NodeConversion[]) {
        const modalRef: NgbModalRef = this.modalService.open(NodeCreationModal, new ModalOptions('xl'));
        modalRef.componentInstance.sheetName = this.sheetName;
        modalRef.componentInstance.header = header;
        modalRef.componentInstance.editingNode = editingNode;
        modalRef.componentInstance.rangeTypeConfig = { type: rangeType, lock: lockRangeType };
        modalRef.componentInstance.constrainedLanguage = constrainedLanguage;
        modalRef.componentInstance.constrainedDatatype = constrainedDatatype;
        modalRef.componentInstance.headerNodes = headerNodes;
        return modalRef.result;
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

    addMapping() {
        this.sharedModals.prefixNamespace({ key: "ACTIONS.ADD_PREFIX_NAMESPACE_MAPPING" }).then(
            (mapping: { prefix: string, namespace: string }) => {
                //check if the prefix or the namespace are not already defined
                if (
                    this.globalPrefixMappings.some(m => m.prefix == mapping.prefix) ||
                    this.localPrefixMappings.some(m => m.prefix == mapping.prefix)
                ) {
                    this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "MESSAGES.ALREADY_DEFINED_MAPPING_WITH_PREFIX" }, ModalType.warning);
                } else if (
                    this.globalPrefixMappings.some(m => m.namespace == mapping.namespace) ||
                    this.localPrefixMappings.some(m => m.namespace == mapping.namespace)
                ) {
                    this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, { key: "MESSAGES.ALREADY_DEFINED_MAPPING_WITH_NAMESPACE" }, ModalType.warning);
                } else { //not used => add it
                    let newMapping = { prefix: mapping.prefix, namespace: mapping.namespace, explicit: true };
                    this.localPrefixMappings.push(newMapping);

                    this.changeDetectorRef.detectChanges();
                    this.prefixNsTableElement.nativeElement.scrollTop = this.prefixNsTableElement.nativeElement.scrollHeight;
                    this.selectMapping(newMapping);
                }
            }
        );
    }

    removeMapping() {
        this.localPrefixMappings.splice(this.localPrefixMappings.indexOf(this.selectedMapping), 1);
        this.selectedMapping = null;
    }

    /**
     * Adds the given mappings into localPrefixMappings
     */
    private restorePrefixNsMappings(mappings: { [prefix: string]: string }) {
        for (let prefix in mappings) {
            /** 
             * If the mappings is not already in the globalPrefixMappings, add it into the localPrefixMappings.
             * TODO: if the mappings is not in the globalPrefixMappings, but the prefix is already in use?
             * do not add the mapping and replace the prefix in the pattern?
             */
            if (!this.globalPrefixMappings.some((gp: PrefixMapping) => gp.prefix == prefix && gp.namespace == mappings[prefix])) {
                this.localPrefixMappings.push({ prefix: prefix, namespace: mappings[prefix], explicit: true });
            }
        }
    }

    /*
     * ============= GRAPHS =================
     */

    updateDefaultPredicate(pred: ARTURIResource) {
        this.defaultPredicate = pred;
    }

    private validatePattern() {
        /**
         * Creates a fake complete pearl rule just for pass it to the validateGraphPattern service.
         */
        let pearl: string = "";
        //PREFIX
        this.globalPrefixMappings.forEach(m => {
            pearl += "prefix " + m.prefix + ": <" + m.namespace + ">\n";
        });
        this.localPrefixMappings.forEach(m => {
            pearl += "prefix " + m.prefix + ": <" + m.namespace + ">\n";
        });
        pearl += "rule it.uniroma2.art.FakeRule id:rule {\n";
        //NODES
        pearl += "nodes = {\n";
        // - subject
        pearl += "subject uri " + this.header.pearlFeature + " .\n";
        //- other headers nodes (useful in case graph section contains foreign reference)
        this.s2rdfModel.headers.forEach(h => {
            //skip the same current header (prevent to write multiple time the declaration of its nodes)
            if (h.id == this.header.id) return;
            h.nodes.forEach(n => {
                pearl += n.nodeId + " uri " + this.header.pearlFeature + " .\n"; //converter and FS are just mockup
            });
        });
        // - nodes of this graph application
        this.alreadyDefinedNodes.forEach(n => {
            pearl += n.nodeId + " " + n.converter.type + " " + this.header.pearlFeature + " .\n";
        });
        this.newDefinedNodes.forEach(n => {
            pearl += n.nodeId + " " + n.converter.type + " " + this.header.pearlFeature + " .\n";
        });
        pearl += "}\n"; //close nodes
        //GRAPH
        pearl += "graph = {\n";
        let gp: string = this.graphPattern;
        if (gp.includes(this.PRED_PLACEHOLDER)) {
            gp = gp.replace(this.PRED_PLACEHOLDER, this.defaultPredicate.toNT());
        }
        pearl += gp + "\n";
        pearl += "}\n"; //close graph
        pearl += "}\n"; //close rule

        return this.s2rdfService.validateGraphPattern(pearl).pipe(
            map(validation => {
                if (!validation.valid) {
                    this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_GRAPH_PATTERN" }, ModalType.warning, validation.details);
                    return validation;
                } else {
                    validation.usedNodes.forEach((nodeId, index, list) => {
                        list[index] = nodeId.substring(1); //removes the leading $
                    });
                    if (validation.usedNodes.includes("subject")) {
                        validation.usedNodes.splice(validation.usedNodes.indexOf("subject"), 1);
                    }
                    return validation;
                }
            })
        );
    }


    saveGraph() {
        if (!this.isOkEnabled()) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.INCOMPLETE_GRAPH_APPLICATION" }, ModalType.warning);
            return;
        }

        this.validatePattern().subscribe(
            validation => {
                if (validation.valid) {
                    //collect only the node to store in the configuration, namely those nodes referenced by the graph pattern
                    let nodesToStore: NodeConversion[] = [];
                    for (let nodeId of validation.usedNodes) {
                        let referencedNode = this.newDefinedNodes.find(n => n.nodeId == nodeId);
                        if (referencedNode == null) {
                            referencedNode = this.alreadyDefinedNodes.find(n => n.nodeId == nodeId);
                        }
                        if (referencedNode != null) {
                            nodesToStore.push(referencedNode);
                        } else {
                            /* a node used in the graph pattern but not found in both alreadyDefinedNodes and newDefinedNodes, 
                            so probably a reference to a node defined in an external header. This AGA cannot be stored since
                            the presence of the referenced node (that is created from another header) is not granted in other cases.
                            */
                            this.basicModals.alert({key: "STATUS.WARNING"}, {key: "MESSAGES.CANNOT_EXPORT_ADV_GRAPH_APP_WITH_EXTERNAL_REF"}, ModalType.warning);
                            return;
                        }
                    }
                    let prefixMappingToStore: { [key: string]: string } = {};

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
                    });
                    let config: { [key: string]: any } = {
                        pattern: this.graphPattern,
                        nodes: nodesToStore,
                        prefixMapping: prefixMappingToStore,
                        defaultPredicate: this.defaultPredicate != null ? this.defaultPredicate.toNT() : null
                    };
                    this.sharedModals.storeConfiguration({ key: "SHEET2RDF.ACTIONS.SAVE_ADVANCED_GRAPH_APPLICATION" }, ConfigurationComponents.ADVANCED_GRAPH_APPLICATION_STORE, config).then(
                        () => {
                            this.basicModals.alert({ key: "STATUS.OPERATION_DONE" }, { key: "MESSAGES.CONFIGURATION_SAVED" });
                        },
                        () => { }
                    );
                }
            }
        );
    }

    loadGraph() {
        this.s2rdfService.getDefaultAdvancedGraphApplicationConfigurations().subscribe(
            references => {
                this.sharedModals.loadConfiguration({ key: "SHEET2RDF.ACTIONS.LOAD_ADVANCED_GRAPH_APPLICATION" }, ConfigurationComponents.ADVANCED_GRAPH_APPLICATION_STORE, true, true, references).then(
                    (data: LoadConfigurationModalReturnData) => {
                        //reset the current status
                        this.newDefinedNodes = [];
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
                            );
                        }
                    },
                    () => { }
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
                let prefMapValue: { [key: string]: string } = confProps[i].value;
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
                this.getAdaptedNodeId(n.nodeId).pipe(
                    map(newId => {
                        if (newId != n.nodeId) { //node is different, so it was already used and it is changed.
                            let oldId = n.nodeId;
                            replacedNodeIds.push({ old: oldId, new: newId });
                            //replace node id in the conversion
                            n.nodeId = newId; //node ID
                            //replace node id in graph pattern
                            let nodeRegex = new RegExp("(?<!\\w)\\$" + oldId + "\\b", "g");
                            this.graphPattern = this.graphPattern.replace(nodeRegex, "$" + newId);
                        }
                    })
                )
            );
        });
        forkJoin(nodeIdCheckFn).subscribe(
            () => {
                if (replacedNodeIds.length > 0) { //report of changes
                    let report: string = replacedNodeIds.map(n => " - '" + n.old + "' → '" + n.new + "'").join("\n");
                    let msg = this.translateService.instant("MESSAGES.ADV_GRAPH_APP_LOADED_REPORT");
                    this.basicModals.alert({ key: "STATUS.WARNING" }, msg + ":\n" + report, ModalType.warning);
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
                    });
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
                        n.converter.language != null && this.header.nameStruct.lang != null
                    ) {
                        n.converter.language = this.header.nameStruct.lang;
                    }
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
        return this.s2rdfService.isNodeIdAlreadyUsed(this.sheetName, nodeId).pipe(
            mergeMap(used => {
                if (used) {
                    let newId = nodeId + "_1";
                    //invoke itself recursively
                    return this.getAdaptedNodeId(newId);
                } else { //not used
                    return of(nodeId);
                }
            })
        );
    }

    isOkEnabled(): boolean {
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
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.MISSING_DEFAULT_PRED_IN_GRAPH_PATTERN" }, ModalType.warning);
            return;
        }

        this.validatePattern().subscribe(
            validation => {
                if (validation.valid) {
                    //above check passed, now add the new nodes to the header (prevent to add nodes again to the header in case of update)
                    let addNodeFn: Observable<any>[] = [];
                    this.newDefinedNodes.forEach(n => {
                        addNodeFn.push(this.s2rdfService.addNodeToHeader(this.sheetName, this.header.id, n.nodeId, n.converter.type,
                            n.converter.contractUri, n.converter.datatypeUri, n.converter.language, n.converter.params, n.memoize, n.memoizeId));
                    });

                    let prefixMappingMap: { [key: string]: string } = {};
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
                        forkJoin(addNodeFn).subscribe(
                            () => { //nodes added => now add/update the graph application
                                this.addOrUpdateAdvancedGraphApplication(validation.usedNodes, prefixMappingMap).subscribe(
                                    () => {
                                        this.activeModal.close();
                                    }
                                );
                            }
                        );
                    } else { //no node to add, simply update/create the graph application
                        this.addOrUpdateAdvancedGraphApplication(validation.usedNodes, prefixMappingMap).subscribe(
                            () => {
                                this.activeModal.close();
                            }
                        );
                    }
                }
            }
        );
    }

    private addOrUpdateAdvancedGraphApplication(referencedNodesId: string[], prefixMappingMap: { [key: string]: string }): Observable<void> {
        let graphAppFn: Observable<void>;
        if (this.graphApplication == null) { //creation mode
            graphAppFn = this.s2rdfService.addAdvancedGraphApplicationToHeader(
                this.sheetName, this.header.id, this.graphPattern, referencedNodesId, prefixMappingMap, this.defaultPredicate);
        } else { //edit mode
            graphAppFn = this.s2rdfService.updateAdvancedGraphApplication(
                this.sheetName, this.header.id, this.graphApplication.id, this.graphPattern, referencedNodesId, prefixMappingMap, this.defaultPredicate);
        }
        return graphAppFn;
    }

    cancel() {
        this.activeModal.dismiss();
    }

    //UTILS

    private getDatatypeShow(datatypeUri: string) {
        return ResourceUtils.getQName(datatypeUri, VBContext.getPrefixMappings());
    }

}