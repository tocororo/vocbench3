import { Component } from "@angular/core";
import { DialogRef, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { AdvancedGraphApplication, GraphApplication, NodeConversion, SimpleGraphApplication, SimpleHeader } from "../../models/Sheet2RDF";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AdvancedGraphApplicationModal, AdvancedGraphApplicationModalData } from "./advancedGraphApplicationModal";
import { SimpleGraphApplicationModal, SimpleGraphApplicationModalData } from "./simpleGraphApplicationModal";
import { NodeCreationModalData, NodeCreationModal } from "./nodeCreationModal";
import { RangeType } from "../../services/propertyServices";

export class HeaderEditorModalData extends BSModalContext {
    /**
     * This modal get the headerId instead of directly the HeaderStruct in order to prevent changes directly on the HeaderStruct
     * (even if the user discard the modal)
     * @param headerId 
     * @param headers all the headers in the spreadsheet. Useful for checks
     */
    constructor(public headerId: string, public headers: SimpleHeader[]) {
        super();
    }
}

@Component({
    selector: "header-editor-modal",
    templateUrl: "./headerEditorModal.html",
})
export class HeaderEditorModal implements ModalComponent<HeaderEditorModalData> {
    context: HeaderEditorModalData;

    private header: SimpleHeader;

    private ignoreInitialized: boolean = false;
    
    private selectedNode: NodeConversion;
    private selectedGraph: GraphApplication;

    private changed: boolean = false; //useful to keep trace of changes in order to ask to the user if he want to replicate the changes to multiple headers

    constructor(public dialog: DialogRef<HeaderEditorModalData>, private s2rdfService: Sheet2RDFServices, private basicModals: BasicModalServices, private modal: Modal) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.initHeader();
    }

    initHeader() {
        this.selectedGraph = null;
        this.selectedNode = null;
        this.s2rdfService.getHeaderFromId(this.context.headerId).subscribe(
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

    private removeNode() {
        let used: boolean = false;
        //check if the node is used by some graph application
        let referenced: boolean = SimpleHeader.isNodeReferenced(this.header, this.selectedNode);
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
    private removeNodeImpl() {
        this.s2rdfService.removeNodeFromHeader(this.header.id, this.selectedNode.nodeId).subscribe(
            resp => {
                this.initHeader();
                this.changed = true;
            }
        );
    }

    private changeUriConverter(node: NodeConversion) {
        var modalData = new NodeCreationModalData(this.header, node, RangeType.resource, null, null, null);
        const builder = new BSModalContextBuilder<NodeCreationModalData>(
            modalData, undefined, NodeCreationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        this.modal.open(NodeCreationModal, overlayConfig).result.then(
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
        var modalData = new NodeCreationModalData(this.header, node, RangeType.plainLiteral, null, null, null);
        const builder = new BSModalContextBuilder<NodeCreationModalData>(
            modalData, undefined, NodeCreationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        this.modal.open(NodeCreationModal, overlayConfig).result.then(
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

    private editGraph() {
        if (this.selectedGraph instanceof SimpleGraphApplication) {
            let modalData = new SimpleGraphApplicationModalData(this.header, <SimpleGraphApplication>this.selectedGraph);
            const builder = new BSModalContextBuilder<SimpleGraphApplicationModalData>(
                modalData, undefined, HeaderEditorModalData
            );
            let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
            this.modal.open(SimpleGraphApplicationModal, overlayConfig).result.then(
                () => {
                    this.initHeader();
                    this.changed = true;
                },
                () => {}
            );
        } else { //AdvancedGraphApplication
            let modalData = new AdvancedGraphApplicationModalData(this.header, this.context.headers, <AdvancedGraphApplication>this.selectedGraph);
            const builder = new BSModalContextBuilder<AdvancedGraphApplicationModalData>(
                modalData, undefined, AdvancedGraphApplicationModalData
            );
            let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
            this.modal.open(AdvancedGraphApplicationModal, overlayConfig).result.then(
                () => {
                    this.initHeader();
                    this.changed = true;
                },
                () => {}
            );
        }
    }

    private addSimpleGraphApplication() {
        var modalData = new SimpleGraphApplicationModalData(this.header);
        const builder = new BSModalContextBuilder<SimpleGraphApplicationModalData>(
            modalData, undefined, SimpleGraphApplicationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(SimpleGraphApplicationModal, overlayConfig).result.then(
            () => {
                this.initHeader();
                this.changed = true;
            },
            () => {}
        );
    }

    private addAdvancedGraphApplication() {
        var modalData = new AdvancedGraphApplicationModalData(this.header, this.context.headers);
        const builder = new BSModalContextBuilder<AdvancedGraphApplicationModalData>(
            modalData, undefined, AdvancedGraphApplicationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(AdvancedGraphApplicationModal, overlayConfig).result.then(
            () => {
                this.initHeader();
                this.changed = true;
            },
            () => {}
        );
    }

    private removeGraph() {
        this.s2rdfService.removeGraphApplicationFromHeader(this.header.id, this.selectedGraph.id).subscribe(
            resp => {
                this.initHeader();
                this.changed = true;
            }
        )
    }

    ok() {
        if (this.changed && this.header.isMultiple) {
            this.basicModals.confirm("Multiple headers", "There are multiple headers with the same name (" + this.header.nameStruct.name +
                "). Do you want to apply the changes to all of them?", "warning").then(
                confirm => {
                    this.s2rdfService.replicateMultipleHeader(this.header.id).subscribe(
                        () => {
                            this.dialog.close();
                        }
                    )
                },
                () => {
                    this.dialog.close();
                }
            )
        } else {
            this.dialog.close();
        }
    }


    //UTILS

    private getDatatypeShow(datatypeUri: string) {
        return ResourceUtils.getQName(datatypeUri, VBContext.getPrefixMappings());
    }

}