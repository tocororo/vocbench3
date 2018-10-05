import { Component, ViewChild } from "@angular/core";
import { DialogRef, Modal, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from "../../models/ARTResources";
import { CustomForm, CustomFormType, EditorMode } from "../../models/CustomForms";
import { CustomFormsServices } from "../../services/customFormsServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { CodemirrorComponent } from "../../widget/codemirror/codemirrorComponent";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

export class CustomFormEditorModalData extends BSModalContext {
    /**
     * @param id identifier of the CustomForm to edit.
     * If not provided the modal allows to create a CustomForm from scratch
     * @param existingForms list of CustomForm id that already exist.
     * Useful to avoid cretion of CustomForm with duplicate id.
     */
    constructor(public id: string, public existingForms: string[] = [], public readOnly: boolean = false) {
        super();
    }
}

@Component({
    selector: "custom-form-editor-modal",
    templateUrl: "./customFormEditorModal.html",
})
export class CustomFormEditorModal implements ModalComponent<CustomFormEditorModalData> {
    context: CustomFormEditorModalData;

    @ViewChild(CodemirrorComponent) viewChildCodemirror: CodemirrorComponent;

    private mode: EditorMode;

    private namespaceLocked: boolean = true;

    private cfPrefix: string = CustomForm.PREFIX;
    private cfId: string;
    private cfShortId: string;
    private name: string;
    private description: string;
    private type: CustomFormType = "graph";
    private ref: string;
    private showPropertyChain: ARTURIResource[] = [];

    private selectedPropInChain: ARTURIResource; //used in showPropertyChain field    

    private submitted: boolean = false;
    private errorMsg: string;

    constructor(public dialog: DialogRef<CustomFormEditorModalData>, private modal: Modal, private resourceService: ResourcesServices,
        private browsingModals: BrowsingModalServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices, 
        private cfService: CustomFormsServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.id != undefined) { //CRE id provided, so the modal works in edit mode
            this.mode = EditorMode.edit;
            this.cfService.getCustomForm(this.context.id).subscribe(
                cf => {
                    this.cfId = cf.getId();
                    this.cfPrefix = this.cfId.substring(0, this.cfId.lastIndexOf(".") + 1);
                    this.cfShortId = this.cfId.replace(this.cfPrefix, "");
                    this.name = cf.getName();
                    this.type = cf.getType();
                    this.description = cf.getDescription();
                    this.ref = cf.getRef();
                    if (this.type == "graph") {
                        this.showPropertyChain = cf.getShowPropertyChain();
                        if (this.showPropertyChain.length > 0) {
                            this.initShowPropChain();
                        }
                    }
                },
                err => { this.dialog.dismiss() }
            )
        } else {
            this.mode = EditorMode.create;
        }
    }

    private initShowPropChain() {
        this.resourceService.getResourcesInfo(this.showPropertyChain).subscribe(
            chain => {
                /**
                 * Here I don't assign chain to showPropertyChain
                 * (this.showPropertyChain = chain)
                 * since getResourcesInfo() returns a list without duplicate
                 */
                for (var i = 0; i < this.showPropertyChain.length; i++) {
                    chain.forEach((el: ARTURIResource) => {
                        if (this.showPropertyChain[i].getURI() == el.getURI()) {
                            this.showPropertyChain[i] = el;
                        }
                    });
                }
            }
        );
    }

    private pickConverter() {
        this.sharedModals.selectConverter("Pick a converter", null).then(
            (converter: {projectionOperator: string, contractDesctiption: any }) => {
                this.viewChildCodemirror.insertAtCursor(converter.projectionOperator);
            }
        )
    }

    //========= ID Namespace-lock HANDLER =========

    private unlockNamespace() {
        this.namespaceLocked = !this.namespaceLocked;
        if (this.namespaceLocked) { //from free id to locked namespace
            this.fromIdToPrefixAndShortId();
        } else { //from locked namespace to free id
            this.cfId = this.cfPrefix + (this.cfShortId != null ? this.cfShortId : "");
        }
    }

    private fromIdToPrefixAndShortId() {
        let separatorIdx: number = this.cfId.lastIndexOf(".");
        if (separatorIdx > 0) {
            this.cfPrefix = this.cfId.substring(0, separatorIdx + 1);
            this.cfShortId = this.cfId.substring(separatorIdx + 1);
        } else {  //no . in the id => restore the original id
            this.cfShortId = null;
        }
    }

    //========= PROPERTY CHAIN HANDLERS ============
    private selectPropInChain(prop: ARTURIResource) {
        if (this.context.readOnly) {
            return;
        }
        if (this.selectedPropInChain == prop) {
            this.selectedPropInChain = null;
        } else {
            this.selectedPropInChain = prop;
        }
    }
    private addPropToChain(where?: "before" | "after") {
        this.browsingModals.browsePropertyTree("Add property").then(
            (prop: any) => {
                if (where == null) {
                    this.showPropertyChain.push(prop);
                } else if (where == "before") {
                    this.showPropertyChain.splice(this.showPropertyChain.indexOf(this.selectedPropInChain), 0, prop);
                } else if (where == "after") {
                    this.showPropertyChain.splice(this.showPropertyChain.indexOf(this.selectedPropInChain) + 1, 0, prop);
                }
            },
            () => { }
        );
    }
    private disableMove(where: "before" | "after") {
        if (this.selectedPropInChain == null || this.showPropertyChain.length == 1) {
            return true;
        }
        if (where == "after" && this.showPropertyChain.indexOf(this.selectedPropInChain) == this.showPropertyChain.length) {
            return true; //selected prop was the last in the list
        }
        if (where == "before" && this.showPropertyChain.indexOf(this.selectedPropInChain) == 0) {
            return true; //selected prop was the first in the list
        }
        return false;
    }
    private movePropInChain(where: "before" | "after") {
        var prevIndex = this.showPropertyChain.indexOf(this.selectedPropInChain);
        this.showPropertyChain.splice(prevIndex, 1); //remove from current position
        if (where == "before") {
            this.showPropertyChain.splice(prevIndex - 1, 0, this.selectedPropInChain);
        } else { //after
            this.showPropertyChain.splice(prevIndex + 1, 0, this.selectedPropInChain);
        }
    }
    private removePropFromChain(prop: ARTURIResource) {
        if (this.context.readOnly) {
            return;
        }
        this.showPropertyChain.splice(this.showPropertyChain.indexOf(prop), 1);
        if (this.selectedPropInChain == prop) {
            this.selectedPropInChain = null;
        }
    }
    /**
     * Allow to edit manually the property chain
     */
    private editPropChain() {
        var serializedPropChain: string = "";
        for (var i = 0; i < this.showPropertyChain.length; i++) {
            serializedPropChain += this.showPropertyChain[i].getURI() + ",";
        }
        if (serializedPropChain.length > 0) {
            serializedPropChain = serializedPropChain.slice(0, -1);//delete last ","
        }

        this.basicModals.prompt("Edit property chain", null, "Write the chain as sequence of comma (,) separated IRIs (QNames are accepted as well)",
            serializedPropChain, true).then(
            (value: any) => {
                var chain: string = String(value).trim();
                if (chain.length != 0) {
                    this.cfService.validateShowPropertyChain(chain).subscribe(
                        chainIRIs => {
                            this.showPropertyChain = chainIRIs;
                            this.initShowPropChain();
                        }
                    )
                } else {
                    this.showPropertyChain = [];
                }
            },
            () => {}
        )
    }
    //=======================================

    private isDataValid() {
        var valid = true;
        //name and ref are mandatory
        if (this.name == null || this.name.trim() == "" || this.ref == null || this.ref.trim() == "") {
            this.errorMsg = "You need to fill all the mandatory field."
            valid = false;
        }

        if (this.cfId == null) { //check only in create mode
            if (this.cfShortId == null || !this.cfShortId.match(/^[a-zA-Z0-9.]+$/i)) { //invalid character
                this.errorMsg = "The CustomForm ID is not valid (it may be empty or contain invalid characters). Please fix it."
                valid = false;
            }
            if (this.context.existingForms.indexOf(this.cfPrefix + this.cfShortId) != -1) { //CRE with the same id already exists
                this.errorMsg = "A CustomForm with the same ID already exists";
                valid = false;
            }
        }
        return valid;
    }

    ok(event: Event) {
        this.submitted = true;
        if (!this.isDataValid()) {
            return;
        }

        //update CRE only if ref is valid
        this.cfService.validatePearl(this.ref, this.type).subscribe(
            valid => {
                if (this.description == null) { //set empty definition if it is not provided (prevent setting "undefined" as definition of CRE)
                    this.description = "";
                }
                //I don't distinguish between node and graph since if type is node showPropertyChain is ignored server-side
                if (this.mode == EditorMode.edit) {
                    if (this.type == "node") {
                        this.cfService.updateCustomForm(this.cfId, this.name, this.description, this.ref).subscribe(
                            stResp => {
                                event.stopPropagation();
                                this.dialog.close();
                            }
                        );
                    } else { //graph
                        this.cfService.updateCustomForm(this.cfId, this.name, this.description, this.ref, this.showPropertyChain).subscribe(
                            stResp => {
                                event.stopPropagation();
                                this.dialog.close();
                            }
                        );
                    }
                } else { //create mode
                    this.cfService.createCustomForm(this.type, this.cfPrefix + this.cfShortId, this.name, this.description, this.ref, this.showPropertyChain).subscribe(
                        stResp => {
                            event.stopPropagation();
                            this.dialog.close();
                        }
                    );
                }
            },
            err => { }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }
}