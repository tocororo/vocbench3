import { ChangeDetectorRef, Component, ElementRef, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { ARTResource, ARTURIResource } from "../models/ARTResources";
import { ResourceViewModeDispatcher } from "../resourceView/resourceViewModes/resourceViewModeDispatcher";
import { TabsetPanelComponent } from "../structures/tabset/tabsetPanelComponent";
import { ResourceUtils } from '../utils/ResourceUtils';
import { VBContext } from "../utils/VBContext";
import { VBEventHandler } from "../utils/VBEventHandler";
import { BasicModalServices } from '../widget/modal/basicModal/basicModalServices';
import { ModalType } from '../widget/modal/Modals';

@Component({
    selector: "data-component",
    templateUrl: "./dataComponent.html",
    host: { 
        class: "pageComponent",
        '(mousemove)': 'onMousemove($event)',
        '(mouseup)': 'onMouseup()',
        '(mouseleave)': 'onMouseup()'
    },
})
export class DataComponent {

    @ViewChild(TabsetPanelComponent) treePanelChild: TabsetPanelComponent;
    @ViewChild(ResourceViewModeDispatcher) resViewPanelChild: ResourceViewModeDispatcher;

    //{ read: ElementRef } to specify to get the element instead of the component (see https://stackoverflow.com/q/45921819/5805661)
    @ViewChild('treePanel') private treePanelRef: ElementRef; 
    @ViewChild('resViewPanel', { read: ElementRef }) private resViewPanelRef: ElementRef;

    showPromptAddress: boolean;
    address: string;

    private eventSubscriptions: Subscription[] = [];

    constructor(private eventHandler: VBEventHandler, private basicModals: BasicModalServices, private changeDetectorRef: ChangeDetectorRef) {
        this.eventSubscriptions.push(this.eventHandler.resourceCreatedUndoneEvent.subscribe(
            (res: ARTURIResource) => this.onResourceCreatedUndone(res)));
        this.eventSubscriptions.push(this.eventHandler.datatypeDeletedEvent.subscribe(
            (deletedRes: ARTURIResource) => this.onNodeDeleted(deletedRes)));
        this.eventSubscriptions.push(this.eventHandler.classDeletedEvent.subscribe(
            (deletedRes: ARTURIResource) => this.onNodeDeleted(deletedRes)));
        this.eventSubscriptions.push(this.eventHandler.collectionDeletedEvent.subscribe(
            (deletedRes: ARTURIResource) => this.onNodeDeleted(deletedRes)));
        this.eventSubscriptions.push(this.eventHandler.conceptDeletedEvent.subscribe(
            (deletedRes: ARTURIResource) => this.onNodeDeleted(deletedRes)));
        this.eventSubscriptions.push(this.eventHandler.instanceDeletedEvent.subscribe(
            (data: { instance: ARTURIResource, cls: ARTURIResource }) => this.onNodeDeleted(data.instance)));
        this.eventSubscriptions.push(this.eventHandler.lexicalEntryDeletedEvent.subscribe(
            (deletedRes: ARTURIResource) => this.onNodeDeleted(deletedRes)));
        this.eventSubscriptions.push(this.eventHandler.lexiconDeletedEvent.subscribe(
            (deletedRes: ARTURIResource) => this.onNodeDeleted(deletedRes)));
        this.eventSubscriptions.push(this.eventHandler.propertyDeletedEvent.subscribe(
            (deletedRes: ARTURIResource) => this.onNodeDeleted(deletedRes)));
        this.eventSubscriptions.push(this.eventHandler.schemeDeletedEvent.subscribe(
            (deletedRes: ARTURIResource) => this.onNodeDeleted(deletedRes)));
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe());
    }

    onNodeSelected(node: ARTResource) {
        if (node == null) return;

        if (this.resViewPanelFlex == 0) { //if the right panel is collapsed, open it
            this.resViewPanelFlex = this.maxPanelSize;
            this.treePanelFlex = 2;
        }
        //in order to wait that the resView panel is rendered
        this.changeDetectorRef.detectChanges();
        this.resViewPanelChild.selectResource(node);
    }

    private onNodeDeleted(node: ARTResource) {
        if (!VBContext.getWorkingProject().isValidationEnabled() && this.resViewPanelChild != null) {
            this.resViewPanelChild.deleteResource(node);
        }
    }

    private onResourceCreatedUndone(node: ARTResource) {
        if (this.resViewPanelChild != null) {
            this.resViewPanelChild.deleteResource(node);
        }
    }

    /*
    Prompt Address handler 
    */

    togglePromptAddress() {
        this.showPromptAddress = !this.showPromptAddress;
    }

    describeAddress() {
        if (this.address == null || this.address.trim() == "") return;
        if (ResourceUtils.testIRI(this.address)) {
            this.onNodeSelected(new ARTURIResource(this.address));
        } else {
            this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "MESSAGES.INVALID_IRI", params: { iri: this.address } }, ModalType.warning);
        }
    }


    //Draggable slider handler
    /**
     * There are two panel:
     * - tree/list panel to the left:
     * The flex value varies between "minPanelSize" and "maxPanelSize"
     * - ResourceView panel to the right:
     * The flex value admits just two value: 0 means that the panel is closed; "maxPanelSize" (fixed) when the panel is open.
     * 
     * When resizing, it is changed just "treePanelFlex" between "minPanelSize" and "maxPanelSize"
     * The "minPanelSize" and "maxPanelSize" determine the proportion between the two panels left:right that is between 
     * minPanelSize:maxPanelSize and maxPanelSize:maxPanelSize
     */

    private readonly maxPanelSize: number = 5;
    private readonly minPanelSize: number = 1;

    treePanelFlex: number = this.minPanelSize;
    resViewPanelFlex: number = 0; //initially 0 the res view panel is closed

    private dragging: boolean = false;
    private startMousedownX: number;

    private onMousedown(event: MouseEvent) {
        event.preventDefault();
        this.dragging = true;
        this.startMousedownX = event.clientX;
        this.onMousemove = this.draggingHandler; //set listener on mousemove
    }
    private onMouseup() {
        if (this.dragging) { //remove listener on mousemove
            this.onMousemove = (event: MouseEvent) => {};
            this.dragging = false;
        }
    }
    private onMousemove(event: MouseEvent) {}
    private draggingHandler(event: MouseEvent) {
        let endMousedownX = event.clientX;
        let diffX: number = this.startMousedownX - endMousedownX;
        let classPanelHeight: number = this.treePanelRef.nativeElement.offsetWidth;
        let instancePanelHeight: number = this.resViewPanelRef.nativeElement.offsetWidth;
        /**
         * Compute the classPanelFlex based on the following mathematical proportion:
         *  classPanelHeight:instancePanelFlex = classPanelFlex:instancePanelFlex
         */
        this.treePanelFlex = (classPanelHeight-diffX)/(instancePanelHeight+diffX)*this.resViewPanelFlex;

        //ration between class and instance panel should be always  between 4:1 and 1:4
        if (this.treePanelFlex > this.maxPanelSize) this.treePanelFlex = this.maxPanelSize;
        else if (this.treePanelFlex < this.minPanelSize) this.treePanelFlex = this.minPanelSize;
        //update the initial X position of the cursor
        this.startMousedownX = event.clientX;
    }

    private onResViewEmpty() {
        this.resViewPanelFlex = 0;
    }

    //when a tab describing a concept is selected (only in res view in tab mode)
    private onTabSelected(resource: ARTResource) {
        this.treePanelChild.syncResource(resource);
    }

}