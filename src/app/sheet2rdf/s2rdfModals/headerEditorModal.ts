import { Component, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from 'src/app/models/ARTResources';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { AdvancedGraphApplication, GraphApplication, NodeConversion, SimpleGraphApplication, SimpleHeader } from "../../models/Sheet2RDF";
import { RangeType } from "../../services/propertyServices";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AdvancedGraphApplicationModal } from "./advancedGraphApplicationModal";
import { NodeCreationModal } from "./nodeCreationModal";
import { SimpleGraphApplicationModal } from "./simpleGraphApplicationModal";

@Component({
    selector: "header-editor-modal",
    templateUrl: "./headerEditorModal.html",
})
export class HeaderEditorModal {
    @Input() headerId: string;
    @Input() headers: SimpleHeader[];

    header: SimpleHeader;

    private ignoreInitialized: boolean = false;
    
    selectedNode: NodeConversion;
    selectedGraph: GraphApplication;

    private changed: boolean = false; //useful to keep trace of changes in order to ask to the user if he want to replicate the changes to multiple headers

    constructor(public activeModal: NgbActiveModal, private s2rdfService: Sheet2RDFServices, private basicModals: BasicModalServices, private modalService: NgbModal) {
    }

    ngOnInit() {
        this.initHeader();
    }

    initHeader() {
        this.selectedGraph = null;
        this.selectedNode = null;
        this.s2rdfService.getHeaderFromId(this.headerId).subscribe(
            header => {
                this.header = header;
                if (!this.ignoreInitialized) {
                    this.ignoreInitialized = true;
                }
            }
        );
    }

    private onIgnoreChange() {
        this.s2rdfService.ignoreHeader(this.header.id, this.header.ignore).subscribe(
            () => {
                this.initHeader();
                this.changed = true;
            }
        );
    }

    /*
     * NODES
     */

    private selectNode(node: NodeConversion) {
        if (this.header.ignore) return;

        if (this.selectedNode == node) {
            this.selectedNode = null;
        } else {
            this.selectedNode = node;
        }
    }

    addNode() {
        this.openNodeEditorModal(this.header, null, null, null, null, this.header.nodes).then(
            (newNode: NodeConversion) => {
                this.s2rdfService.addNodeToHeader(this.header.id, newNode.nodeId, newNode.converter.type, 
                    newNode.converter.contractUri, newNode.converter.datatypeUri, newNode.converter.language,
                    newNode.converter.params, newNode.memoize).subscribe(
                    () => {
                        this.initHeader();
                        this.changed = true;
                    }
                );
            }
        );
    }

    private renameNode(node: NodeConversion) {
        this.basicModals.prompt({key:"ACTIONS.RENAME_NODE"}, { value: "ID" }, null, node.nodeId, false, true).then(
            (newID: string) => {
                if (newID != node.nodeId) {
                    this.s2rdfService.renameNodeId(this.header.id, node.nodeId, newID).subscribe(
                        () => {
                            this.initHeader();
                            this.changed = true;
                        }
                    );
                }
            },
            () => {}
        )
    }

    removeNode() {
        let used: boolean = false;
        //check if the node is used by some graph application
        let referenced: boolean = SimpleHeader.isNodeReferenced(this.header, this.selectedNode);
        //TODO allow to forcing the deletion a referenced node or not allow at all? 
        if (referenced) { //cannot delete a node used by a graph application
            this.basicModals.confirm({key:"STATUS.WARNING"}, {key:"MESSAGES.DELETE_HEADER_NODE_USED_IN_GRAPH_APP_CONFIRM"}, ModalType.warning).then(
                confirm => {
                    this.removeNodeImpl();
                },
                () => {}
            );
        } else {
            this.removeNodeImpl();
        }
    }
    private removeNodeImpl() {
        this.s2rdfService.removeNodeFromHeader(this.header.id, this.selectedNode.nodeId).subscribe(
            resp => {
                this.initHeader();
                this.changed = true;
            }
        );
    }

    private changeUriConverter(node: NodeConversion) {
        this.openNodeEditorModal(this.header, node, RangeType.resource, null, null, null).then(
            (n: NodeConversion) => {
                node.converter = n.converter;
                node.memoize = n.memoize;
                this.s2rdfService.updateNodeInHeader(this.header.id, node.nodeId, node.converter.type, node.converter.contractUri, 
                    node.converter.datatypeUri, node.converter.language, node.converter.params, node.memoize).subscribe(
                    resp => {
                        this.initHeader();
                        this.changed = true;
                    }
                )
            },
            () => {}
        );
    }

    private changeLiteralConverter(node: NodeConversion) {
        this.openNodeEditorModal(this.header, node, RangeType.literal, null, null, null).then(
            (n: NodeConversion) => {
                node.converter = n.converter;
                this.s2rdfService.updateNodeInHeader(this.header.id, node.nodeId, node.converter.type, node.converter.contractUri, 
                    node.converter.datatypeUri, node.converter.language, node.converter.params, node.memoize).subscribe(
                    resp => {
                        this.initHeader();
                        this.changed = true;
                    }
                )
            },
            () => {}
        );
    }

    private openNodeEditorModal(header: SimpleHeader, editingNode: NodeConversion, constrainedRangeType: RangeType, 
            constrainedLanguage: string, constrainedDatatype: ARTURIResource, headerNodes: NodeConversion[]) {
        const modalRef: NgbModalRef = this.modalService.open(NodeCreationModal, new ModalOptions('xl'));
        modalRef.componentInstance.header = header;
		modalRef.componentInstance.editingNode = editingNode;
        modalRef.componentInstance.constrainedRangeType = constrainedRangeType;
        modalRef.componentInstance.constrainedLanguage = constrainedLanguage;
        modalRef.componentInstance.constrainedDatatype = constrainedDatatype;
        modalRef.componentInstance.headerNodes = headerNodes;
        return modalRef.result;
    }

    /*
     * GRAPH 
     */

    private selectGraph(graph: GraphApplication) {
        if (this.header.ignore) return;

        if (this.selectedGraph == graph) {
            this.selectedGraph = null;
        } else {
            this.selectedGraph = graph;
        }
    }

    private isSimpleGraphApplication(graph: GraphApplication): boolean {
        return graph instanceof SimpleGraphApplication;
    }

    editGraph() {
        if (this.selectedGraph instanceof SimpleGraphApplication) {
            this.openSimpleGraphApplicationModal(this.header, <SimpleGraphApplication>this.selectedGraph).then(
                () => {
                    this.initHeader();
                    this.changed = true;
                },
                () => {}
            );
        } else { //AdvancedGraphApplication
            this.openAdvancedGraphApplicationModal(this.header, this.headers, <AdvancedGraphApplication>this.selectedGraph).then(
                () => {
                    this.initHeader();
                    this.changed = true;
                },
                () => {}
            );
        }
    }

    addSimpleGraphApplication() {
        this.openSimpleGraphApplicationModal(this.header, null).then(
            () => {
                this.initHeader();
                this.changed = true;
            },
            () => {}
        );
    }

    addAdvancedGraphApplication() {
        this.openAdvancedGraphApplicationModal(this.header, this.headers, null).then(
            () => {
                this.initHeader();
                this.changed = true;
            },
            () => {}
        );
    }

    private openSimpleGraphApplicationModal(header: SimpleHeader, graphApplication: SimpleGraphApplication) {
        const modalRef: NgbModalRef = this.modalService.open(SimpleGraphApplicationModal, new ModalOptions());
        modalRef.componentInstance.header = header;
		modalRef.componentInstance.graphApplication = graphApplication;
        return modalRef.result;
    }

    private openAdvancedGraphApplicationModal(header: SimpleHeader, headers: SimpleHeader[], graphApplication: AdvancedGraphApplication) {
        const modalRef: NgbModalRef = this.modalService.open(AdvancedGraphApplicationModal, new ModalOptions('lg'));
        modalRef.componentInstance.header = header;
        modalRef.componentInstance.headers = headers;
		modalRef.componentInstance.graphApplication = graphApplication;
        return modalRef.result;
    }

    removeGraph() {
        this.s2rdfService.removeGraphApplicationFromHeader(this.header.id, this.selectedGraph.id).subscribe(
            resp => {
                this.initHeader();
                this.changed = true;
            }
        )
    }

    ok() {
        if (this.changed && this.header.isMultiple) {
            this.basicModals.confirm({key:"STATUS.WARNING"}, {key:"MESSAGES.UPDATE_MULTIPLE_HEADER_SAME_NAME_CONFIRM", params:{headerName: this.header.nameStruct.name}},
                ModalType.warning).then(
                confirm => {
                    this.s2rdfService.replicateMultipleHeader(this.header.id).subscribe(
                        () => {
                            this.activeModal.close();
                        }
                    )
                },
                () => {
                    this.activeModal.close();
                }
            )
        } else {
            this.activeModal.close();
        }
    }


    //UTILS

    private getDatatypeShow(datatypeUri: string) {
        return ResourceUtils.getQName(datatypeUri, VBContext.getPrefixMappings());
    }

}