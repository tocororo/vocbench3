import { Component, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { AbstractGraphPanel } from "../abstractGraphPanel";
import { DataGraphSettingsModal } from "../modal/dataGraphSettingsModal";
import { ARTNode, ARTURIResource, ResAttribute } from './../../models/ARTResources';
import { Link } from './../model/Link';
import { Node } from './../model/Node';
import { PropInfo, UmlNode } from './../model/UmlNode';
import { UmlGraphComponent } from './umlGraphComponent';

@Component({
    selector: 'uml-graph-panel',
    templateUrl: "./umlGraphPanel.html"
})
export class UmlGraphPanel extends AbstractGraphPanel {

    @ViewChild(UmlGraphComponent) viewChildGraph: UmlGraphComponent;
    
    resourceToDescribe: ARTNode;
    isHideArrows: boolean = false;
    activeRemove: boolean = false;

    constructor(basicModals: BasicModalServices, browsingModals: BrowsingModalServices, private modalService: NgbModal) {
        super(basicModals, browsingModals);
    }


    openSettings() {
        const modalRef: NgbModalRef = this.modalService.open(DataGraphSettingsModal, new ModalOptions('lg'));
        return modalRef.result;
    }



    addNode() {
        this.browsingModals.browseClassTree("Add node").then(
            (cls: ARTURIResource) => {
                if (!cls.getAdditionalProperty(ResAttribute.EXPLICIT)) {
                    this.basicModals.alert("Add node", "Cannot add a new node for " + cls.getShow() +
                        ". In the class-diagram you can only add resources locally defined.", ModalType.warning);
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


    onElementSelected(element: Node | Link | PropInfo) {
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