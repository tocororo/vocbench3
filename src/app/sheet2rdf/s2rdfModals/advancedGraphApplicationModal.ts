import { Component } from "@angular/core";
import { DialogRef, Modal, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { PrefixMapping } from "../../models/Metadata";
import { NodeConversion, SimpleHeader, AdvancedGraphApplication, SimpleGraphApplication } from "../../models/Sheet2RDF";
import { Sheet2RDFServices } from "../../services/sheet2rdfServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { VBContext } from "../../utils/VBContext";
import { NodeCreationModal, NodeCreationModalData } from "./nodeCreationModal";
import { Observable } from "rxjs";
import { ARTURIResource } from "../../models/ARTResources";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

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

    private prefixMappings: PrefixMapping[];
    private selectedMapping: PrefixMapping;

    private graphPattern: string;

    constructor(public dialog: DialogRef<AdvancedGraphApplicationModalData>, private s2rdfService: Sheet2RDFServices, 
        private basicModals: BasicModalServices, private modal: Modal) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.context.header.nodes.forEach(n => {
            this.alreadyDefinedNodes.push(n);
        })
        this.s2rdfService.getPrefixMappings().subscribe(
            mapping => {
                this.prefixMappings = mapping;
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
        console.log("parsed node ids", nodes);
        return Observable.of(nodes);
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
                console.log("referencedIDs pre", referencedIDs);
                console.log("idx of subject", referencedIDs.indexOf("subject"));
                if (referencedIDs.indexOf("subject") != -1) { //eventually remove the "subject" from the referenced node IDs (which is reserved)
                    referencedIDs.splice(referencedIDs.indexOf("subject"), 1);
                }
                console.log("referencedIDs post", referencedIDs);
                //check for referenced nodes missing in nodes list
                for (let referencedId of referencedIDs) {
                    let referencedNode = this.newDefinedNodes.find(n => n.nodeId == referencedId);
                    if (referencedNode == null) {
                        referencedNode = this.alreadyDefinedNodes.find(n => n.nodeId == referencedId);
                    }

                    if (referencedNode == null) { //referenced node not found
                        this.basicModals.alert("Advanced Graph Application", "The graph pattern references to a node with id '" + referencedId 
                            + "', but it is not defined in the nodes list", "warning");
                        return;
                    }
                }
                //above check passed, now add the new nodes to the header
                let addNodeFn: Observable<any>[] = [];
                this.newDefinedNodes.forEach(n => {
                    let dtParam: ARTURIResource;
                    if (n.converter.datatype != null) {
                        dtParam = new ARTURIResource(n.converter.datatype);
                    }
                    addNodeFn.push(this.s2rdfService.addNodeToHeader(this.context.header.id, n.nodeId, n.converter.capability,
                        n.converter.contract, dtParam, n.converter.language, n.converter.params, n.memoize));
                });
                Observable.forkJoin(addNodeFn).subscribe(
                    () => { //nodes added => now add/update the graph application
                        let graphAppFn: Observable<any>;
                        if (this.context.graphApplication == null) { //creation mode
                            graphAppFn = this.s2rdfService.addAdvancedGraphApplicationToHeader(this.context.header.id, this.graphPattern, referencedIDs);
                        } else { //edit mode
                            graphAppFn = this.s2rdfService.updateAdvancedGraphApplication(this.context.header.id, this.context.graphApplication.id, this.graphPattern, referencedIDs);
                        }
                        graphAppFn.subscribe(
                            () => { //done
                                this.dialog.close();
                            }
                        );
                    }
                );
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