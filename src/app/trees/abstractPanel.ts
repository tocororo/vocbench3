import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { CustomFormsServices } from "../services/customFormsServices";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum } from "../models/ARTResources";
import { CustomForm } from "../models/CustomForms";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { VBEventHandler } from "../utils/VBEventHandler";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";

@Component({
    selector: "panel",
    templateUrl: "./owl/classTreePanel/classTreePanelComponent.html", //placeholder template
})
export abstract class AbstractPanel {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() editable: boolean = true; //if true show the buttons to edit the tree/list
    @Input() readonly: boolean = false; //if true disable the buttons to edit the tree/list (useful to disable edit when exploring old version)
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Output() nodeDeleted = new EventEmitter<ARTURIResource>();

    /**
     * ATTRIBUTES
     */

    abstract panelRole: RDFResourceRolesEnum; //declare the type of resources in the panel
    rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise
    showDeprecated: boolean = true;
    eventSubscriptions: any[] = [];
    selectedNode: ARTURIResource;

    /**
     * CONSTRUCTOR
     */
    protected cfService: CustomFormsServices;
    protected basicModals: BasicModalServices;
    protected eventHandler: VBEventHandler;
    constructor(cfService: CustomFormsServices, basicModals: BasicModalServices, eventHandler: VBEventHandler) {
        this.cfService = cfService;
        this.basicModals = basicModals;
        this.eventHandler = eventHandler;

        this.eventSubscriptions.push(eventHandler.showDeprecatedChangedEvent.subscribe(
            (showDeprecated: boolean) => this.showDeprecated = showDeprecated));
    }

    /**
     * METHODS
     */

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    abstract refresh(): void;
    abstract delete(): void;
    
    //the following determine if the create/delete buttons are disabled in the UI. They could be overriden in the extending components
    isCreateDisabled(): boolean {
        return (this.readonly || !AuthorizationEvaluator.Tree.isCreateAuthorized(this.panelRole));
    }
    isDeleteDisabled(): boolean {
        return (
            !this.selectedNode || !this.selectedNode.getAdditionalProperty(ResAttribute.EXPLICIT) || this.readonly || 
            !AuthorizationEvaluator.Tree.isDeleteAuthorized(this.panelRole)
        );
    }

    abstract doSearch(searchedText: string): void;

    onNodeSelected(node: ARTURIResource) {
        this.selectedNode = node;
        this.nodeSelected.emit(node);
    }

}