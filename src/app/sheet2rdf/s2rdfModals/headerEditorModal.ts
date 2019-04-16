import { Component } from "@angular/core";
import { DialogRef, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { GraphApplication, NodeConversion, SimpleHeader } from "../../models/Sheet2RDF";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { VBContext } from "../../utils/VBContext";
import { SimpleGraphApplicationModal, SimpleGraphApplicationModalData } from "./simpleGraphApplicationModal";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class HeaderEditorModalData extends BSModalContext {
    /**
     * This modal get the headerId instead of directly the HeaderStruct in order to prevent changes directly on the HeaderStruct
     * (even if the user discard the modal)
     * @param headerId 
     */
    constructor(public headerId: string) {
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

    private pristineIgnore: boolean;
    private ignoreInitialized: boolean = false;
    
    private selectedNode: NodeConversion;
    private selectedGraph: GraphApplication;

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
                    this.pristineIgnore = this.header.ignore;
                    this.ignoreInitialized = true;
                }
            }
        );
    }

    private onIgnoreChange() {
        if (this.header.ignore) {
            this.selectedNode = null;
            this.selectedGraph = null;
        }
    }

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
        this.header.graph.forEach(g => {
            if (g.nodeId == this.selectedNode.nodeId) {
                used = true;
            }
        });
        if (used) { //cannot delete a node used by a graph application
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
            }
        );
    }

    private editNode() {
        // var modalData = new NodeCreationModalData()
        // const builder = new BSModalContextBuilder<SimpleGraphApplicationModalData>(
        //     modalData, undefined, HeaderEditorModalData
        // );
        // let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        // this.modal.open(SimpleGraphApplicationModal, overlayConfig).result.then(
        //     () => {},
        //     () => {}
        // );
    }

    private selectGraph(graph: GraphApplication) {
        if (this.header.ignore) return;

        if (this.selectedGraph == graph) {
            this.selectedGraph = null;
        } else {
            this.selectedGraph = graph;
        }
    }

    private editGraph() {
        var modalData = new SimpleGraphApplicationModalData(this.header, this.selectedGraph);
        const builder = new BSModalContextBuilder<SimpleGraphApplicationModalData>(
            modalData, undefined, HeaderEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(SimpleGraphApplicationModal, overlayConfig).result.then(
            () => {
                this.initHeader();
            },
            () => {}
        );
    }

    private addSimpleGraphApplication() {
        var modalData = new SimpleGraphApplicationModalData(this.header);
        const builder = new BSModalContextBuilder<SimpleGraphApplicationModalData>(
            modalData, undefined, HeaderEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(SimpleGraphApplicationModal, overlayConfig).result.then(
            () => {
                this.initHeader();
            },
            () => {}
        );
    }

    private addAdvancedGraphApplication() {

    }

    private removeGraph() {
        this.s2rdfService.removeGraphApplicationFromHeader(this.header.id, this.selectedGraph.id).subscribe(
            resp => {
                this.initHeader();
            }
        )
    }

    ok() {
        //if ignore has changed, inform the server
        if (this.header.ignore != this.pristineIgnore) {
            this.s2rdfService.ignoreHeader(this.header.id, this.header.ignore).subscribe();
        }
        this.dialog.close();
    }

    //UTILS

    private getDatatypeShow(datatypeUri: string) {
        return ResourceUtils.getQName(datatypeUri, VBContext.getPrefixMappings());
    }

}