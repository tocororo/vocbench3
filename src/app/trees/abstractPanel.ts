import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { CustomFormsServices } from "../services/customFormsServices";
import { ARTURIResource } from "../models/ARTResources";
import { CustomForm } from "../models/CustomForms";
import { ModalServices } from "../widget/modal/basicModal/modalServices";

@Component({
    selector: "panel",
    templateUrl: "./owl/classTreePanel/classTreePanelComponent.html", //placeholder template
})
export abstract class AbstractPanel {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() editable: boolean = true; //if true show the buttons to edit the tree
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
    protected modalService: ModalServices;
    constructor(cfService: CustomFormsServices, modalService: ModalServices) {
        this.cfService = cfService;
        this.modalService = modalService;
    }

    /**
     * METHODS
     */

    abstract refresh(): void;

    abstract delete(): void;

    selectCustomForm(cls: ARTURIResource): Promise<string> {
        return new Promise((resolve, reject) => {
            this.cfService.getCustomConstructors(cls).subscribe(
                customForms => {
                    if (customForms.length == 0) { //empty form collection
                        resolve(null);
                    } else if (customForms.length == 1) {
                        resolve(customForms[0].getId()); 
                    } else { //(forms.length > 1) //let user choose
                        return this.modalService.selectCustomForm("Select constructor form", customForms).then(
                            (selectedCF: any) => {
                                resolve((<CustomForm>selectedCF).getId());
                            },
                            () => {}
                        );
                    }
                }
            );
        });
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