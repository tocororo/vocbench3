import { Component, Input, Output, ViewChild, ElementRef, EventEmitter } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { ARTURIResource, ResAttribute } from "../models/ARTResources";
import { CustomForm } from "../models/CustomForms";
import { ModalServices } from "../widget/modal/modalServices";

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

    customForms: CustomForm[] = []; //custom forms for skos:Concept

    /**
     * CONSTRUCTOR
     */
    protected modalService: ModalServices;
    constructor(modalService: ModalServices) {
        this.modalService = modalService;
    }

    /**
     * METHODS
     */

    abstract initCustomConstructors(): void;

    abstract refresh(): void;

    selectCustomForm(): Observable<string> {
        if (this.customForms.length == 0) { //empty form collection
            return Observable.of(null);
        } else if (this.customForms.length == 1) {
            return Observable.of(this.customForms[0].getId());
        } else { //(forms.length > 1) //let user choose
            return Observable.fromPromise(
                this.modalService.selectCustomForm("Select constructor form", this.customForms).then(
                    (selectedCF: any) => {
                        return (<CustomForm>selectedCF).getId();
                    },
                    () => {}
                )
            );
        }
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