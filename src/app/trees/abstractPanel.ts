import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { CustomFormsServices } from "../services/customFormsServices";
import { ARTURIResource } from "../models/ARTResources";
import { CustomForm } from "../models/CustomForms";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

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