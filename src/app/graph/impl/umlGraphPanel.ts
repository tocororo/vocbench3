import { ARTURIResource, ARTNode, ResAttribute } from './../../models/ARTResources';
import { PropInfo } from './../model/UmlNode';
import { Link } from './../model/Link';
import { Node } from './../model/Node';
import { Component, ViewChild, Input } from "@angular/core";
import { Modal, OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder } from "ngx-modialog/plugins/bootstrap";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { AbstractGraphPanel } from "../abstractGraphPanel";
import { DataGraphSettingsModal } from "../modal/dataGraphSettingsModal";
import { UmlGraphComponent } from './umlGraphComponent';
import { UmlNode } from './../model/UmlNode';

@Component({
    selector: 'uml-graph-panel',
    templateUrl: "./umlGraphPanel.html"
})
export class UmlGraphPanel extends AbstractGraphPanel {
    //@override
    //protected selectedElement: Node | Link | PropInfo;
    private resourceToDescribe: ARTNode;
    protected isHideArrows: boolean = false;
    private activeRemove: boolean;
    @ViewChild(UmlGraphComponent) viewChildGraph: UmlGraphComponent;
    //@Input() nodeToRemove: UmlNode;



    constructor(basicModals: BasicModalServices, browsingModals: BrowsingModalServices, private modal: Modal) {
        super(basicModals, browsingModals);
    }


    openSettings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        return this.modal.open(DataGraphSettingsModal, overlayConfig).result;
    }



    addNode() {
        this.browsingModals.browseClassTree("Add node").then(
            (cls: ARTURIResource) => {
                if (!cls.getAdditionalProperty(ResAttribute.EXPLICIT)) {
                    this.basicModals.alert("Add node", "Cannot add a new node for " + cls.getShow() +
                        ". In the class-diagram you can only add resources locally defined.", "warning");
                    return;
                }
                this.viewChildGraph.addNode(cls);
            },
            () => { }
        )
    }

    removeNode() {
        this.viewChildGraph.removeNode(<UmlNode>this.selectedElement);
    }


    protected onElementSelected(element: Node | Link | PropInfo) {
        this.activeRemove = false;
        this.resourceToDescribe = null;
        if (element != null) {
            if (element instanceof Node) {
                this.selectedElement = element
                this.activeRemove = true;
                this.resourceToDescribe = element.res;
            } else if (element instanceof Link) {
                this.selectedElement = element
                this.resourceToDescribe = element.res;
            } else {
                this.resourceToDescribe = element.property;
            }
        }

    }
    updateArrows(){
        this.isHideArrows=!this.isHideArrows
        
    }

    // hideArrows() {
    //     this.isHideArrows = false;
    //     this.viewChildGraph.updateArrows();
    // }

    // showArrows() {
    //     this.isHideArrows = true;
    //     this.viewChildGraph.updateArrows();
    // }




}