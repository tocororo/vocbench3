import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { CustomFormsServices } from "../services/customFormsServices";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum } from "../models/ARTResources";
import { CustomForm } from "../models/CustomForms";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
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
    @Input() readonly: boolean = false; //if true disable the buttons to edit the tree/list
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    /**
     * ATTRIBUTES
     */

    abstract panelRole: RDFResourceRolesEnum; //declare the type of resources in the panel
    rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise
    eventSubscriptions: any[] = [];
    selectedNode: ARTURIResource;

    /**
     * CONSTRUCTOR
     */
    protected cfService: CustomFormsServices;
    protected basicModals: BasicModalServices;
    constructor(cfService: CustomFormsServices, basicModals: BasicModalServices) {
        this.cfService = cfService;
        this.basicModals = basicModals;
    }

    /**
     * METHODS
     */

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

    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */
    searchKeyHandler(key: number, searchedText: string) {
        if (key == 13) {
            this.doSearch(searchedText);
        }
    }

    abstract doSearch(searchedText: string): void;

}