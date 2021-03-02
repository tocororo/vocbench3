import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { PearlValidationResult } from "../../models/Coda";
import { CustomForm, CustomFormType, EditorMode, PreviewForm } from "../../models/CustomForms";
import { CustomFormsServices } from "../../services/customFormsServices";
import { ResourcesServices } from "../../services/resourcesServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { PearlEditorComponent } from "../../widget/codemirror/pearlEditor/pearlEditorComponent";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ExtractFromShaclModal } from "./extractFromShaclModal";
import { PearlInferenceValidationModal } from "./pearlInferenceValidationModal";

@Component({
    selector: "custom-form-editor-modal",
    templateUrl: "./customFormEditorModal.html",
    styles: [`
        .entryRow { margin-bottom: 4px; }
        .entryLabel { min-width: 130px; width: 130px; margin-right: 4px; white-space: nowrap; }
        .optionalCell { min-width: 10px; width: 10px; margin-left: 4px; },
    `]
})
export class CustomFormEditorModal {
    @Input() id: string;
    @Input() existingForms: string[] = [];
    @Input() readOnly: boolean;

    @ViewChild(PearlEditorComponent, { static: true }) viewChildCodemirror: PearlEditorComponent;

    mode: EditorMode;

    namespaceLocked: boolean = true;

    private cfPrefix: string = CustomForm.PREFIX;
    cfId: string;
    private cfShortId: string;
    name: string;
    description: string;
    descriptionTextareaRows: number = 3; //3 by default, dynamically computed in edit mode
    type: CustomFormType = "graph";
    ref: string;
    
    previewForms: PreviewFormStruct[] = [
        { value: null, labelTranslationKey: "----", infoTranslationKey: "" },
        { value: PreviewForm.propertyChain, labelTranslationKey: "CUSTOM_FORMS.FORMS.PREVIEW_FORM.PROP_CHAIN", infoTranslationKey: "CUSTOM_FORMS.FORMS.PREVIEW_FORM.PROP_CHAIN_INFO" },
        { value: PreviewForm.table, labelTranslationKey: "CUSTOM_FORMS.FORMS.PREVIEW_FORM.TABLE", infoTranslationKey: "CUSTOM_FORMS.FORMS.PREVIEW_FORM.TABLE_INFO"},
    ]
    selectedPreviewForm: PreviewFormStruct = this.previewForms[0];

    previewProps: ARTURIResource[] = []; //list of property that can be used both as property chain or table preview, according the dedicated selector
    selectedPreviewProp: ARTURIResource;

    extractFromShaclAuthorized: boolean;

    constructor(public activeModal: NgbActiveModal, private modalService: NgbModal,
        private browsingModals: BrowsingModalServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices, 
        private resourceService: ResourcesServices, private cfService: CustomFormsServices, private translateService: TranslateService,
        private elementRef: ElementRef) {
    }

    ngOnInit() {
        if (this.id != undefined) { //CRE id provided, so the modal works in edit mode
            this.mode = EditorMode.edit;
            this.cfService.getCustomForm(this.id).subscribe(
                cf => {
                    this.cfId = cf.getId();
                    this.cfPrefix = this.cfId.substring(0, this.cfId.lastIndexOf(".") + 1);
                    this.cfShortId = this.cfId.replace(this.cfPrefix, "");
                    this.name = cf.getName();
                    this.type = cf.getType();
                    this.description = cf.getDescription();
                    this.ref = cf.getRef();
                    if (this.type == "graph") {
                        let propChain = cf.getShowPropertyChain();
                        let tablePreview = cf.getPreviewTableProperties();
                        if (propChain.length > 0) {
                            this.previewProps = propChain;
                            this.selectedPreviewForm = this.previewForms.find(pf => pf.value == PreviewForm.propertyChain);
                        } else if (tablePreview.length > 0) {
                            this.previewProps = tablePreview;
                            this.selectedPreviewForm = this.previewForms.find(pf => pf.value == PreviewForm.table);
                        }
                        this.initPreviewProperties();
                    }

                    let lineBreakCount = (this.description.match(/\n/g)||[]).length;
                    this.descriptionTextareaRows = lineBreakCount + 2;
                },
                err => { this.activeModal.dismiss() }
            )
        } else {
            this.mode = EditorMode.create;
        }

        this.extractFromShaclAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.shaclExtractCF);
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    private initPreviewProperties() {
        if (this.previewProps.length == 0) return;
        this.resourceService.getResourcesInfo(this.previewProps).subscribe(
            annotatedRes => {
                /**
                 * Here I don't assign chain to previewProps
                 * (this.previewProps = chain)
                 * since getResourcesInfo() returns a list without duplicate
                 */
                annotatedRes.forEach(r => {
                    this.previewProps.forEach((p, i, list) => {
                        if (p.equals(r)) {
                            list[i] = <ARTURIResource>r;
                        }
                    })
                });
            }
        );
    }

    // ============= PEARL handler ================

    pickConverter() {
        this.sharedModals.selectConverter({key:"ACTIONS.PICK_CONVERTER"}, null).then(
            (converter: {projectionOperator: string, contractDesctiption: any }) => {
                this.viewChildCodemirror.insertAtCursor(converter.projectionOperator);
            },
            () => {}
        )
    }

    inferAnnotations() {
        this.cfService.validatePearl(this.ref, this.type).subscribe(
            (result: PearlValidationResult) => {
                if (!result.valid) {
                    let msg = this.translateService.instant("MESSAGES.CANNOT_INFER_PEARL_ANNOTATIONS");
                    this.basicModals.alert({key:"STATUS.ERROR"}, msg + "\n" + result.details, ModalType.error);
                    return;
                }
                this.cfService.inferPearlAnnotations(this.ref).subscribe(
                    (annotatedPearl) => {
                        //ask user for validation
                        this.openInferenceValidationModal(annotatedPearl).then(
                            () => {
                                this.ref = annotatedPearl;
                            },
                            () => {}
                        )
                    }
                );
            }
        )
    }

    private openInferenceValidationModal(newPearl: string) {
        const modalRef: NgbModalRef = this.modalService.open(PearlInferenceValidationModal, new ModalOptions('xl'));
        modalRef.componentInstance.oldPearl = this.ref;
		modalRef.componentInstance.newPearl = newPearl;
        return modalRef.result;
    }

    extractFromShacl() {
        const modalRef: NgbModalRef = this.modalService.open(ExtractFromShaclModal, new ModalOptions());
        return modalRef.result.then(
            pearl => {
                this.ref = pearl;
            },
            () => {}
        )
    }

    //========= ID Namespace-lock HANDLER =========

    unlockNamespace() {
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

    //========= PREVIEW PROPERTIES HANDLERS ============

    selectPreviewProp(prop: ARTURIResource) {
        if (this.readOnly) {
            return;
        }
        if (this.selectedPreviewProp == prop) {
            this.selectedPreviewProp = null;
        } else {
            this.selectedPreviewProp = prop;
        }
    }
    addPropToPreview(where?: "before" | "after") {
        this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.ADD_PROPERTY"}).then(
            (prop: any) => {
                if (where == null) {
                    this.previewProps.push(prop);
                } else if (where == "before") {
                    this.previewProps.splice(this.previewProps.indexOf(this.selectedPreviewProp), 0, prop);
                } else if (where == "after") {
                    this.previewProps.splice(this.previewProps.indexOf(this.selectedPreviewProp) + 1, 0, prop);
                }
            },
            () => { }
        );
    }
    disableMove(where: "before" | "after") {
        if (this.selectedPreviewProp == null || this.previewProps.length == 1) {
            return true;
        }
        if (where == "after" && this.previewProps.indexOf(this.selectedPreviewProp) == this.previewProps.length) {
            return true; //selected prop was the last in the list
        }
        if (where == "before" && this.previewProps.indexOf(this.selectedPreviewProp) == 0) {
            return true; //selected prop was the first in the list
        }
        return false;
    }
    movePropInPreview(where: "before" | "after") {
        var prevIndex = this.previewProps.indexOf(this.selectedPreviewProp);
        this.previewProps.splice(prevIndex, 1); //remove from current position
        if (where == "before") {
            this.previewProps.splice(prevIndex - 1, 0, this.selectedPreviewProp);
        } else { //after
            this.previewProps.splice(prevIndex + 1, 0, this.selectedPreviewProp);
        }
    }
    removePropFromPreview(prop: ARTURIResource) {
        if (this.readOnly) {
            return;
        }
        this.previewProps.splice(this.previewProps.indexOf(prop), 1);
        if (this.selectedPreviewProp == prop) {
            this.selectedPreviewProp = null;
        }
    }
    /**
     * Allow to edit manually the property chain
     */
    editPreviewProps() {
        var serializedPropChain: string = "";
        for (var i = 0; i < this.previewProps.length; i++) {
            serializedPropChain += this.previewProps[i].getURI() + ",";
        }
        if (serializedPropChain.length > 0) {
            serializedPropChain = serializedPropChain.slice(0, -1);//delete last ","
        }

        this.basicModals.prompt({key:"DATA.ACTIONS.EDIT_PROPERTY_CHAIN"}, null, {key:"MESSAGES.CUSTOM_FORM_PROP_CHAIN_DESCR"}, serializedPropChain, true).then(
            (value: any) => {
                var chain: string = String(value).trim();
                if (chain.length != 0) {
                    this.cfService.validateShowPropertyChain(chain).subscribe(
                        chainIRIs => {
                            this.previewProps = chainIRIs;
                            this.initPreviewProperties();
                        }
                    )
                } else {
                    this.previewProps = [];
                }
            },
            () => {}
        )
    }
    //=======================================


    ok() {
        //check if input data is valid
        if (this.name == null || this.name.trim() == "" || this.ref == null || this.ref.trim() == "") {
            this.basicModals.alert({key:"STATUS.INVALID_DATA"}, {key: "MESSAGES.FILL_ALL_REQUIRED_FIELDS"}, ModalType.warning);
            return;
        }

        if (this.cfId == null) { //check only in create mode
            if (this.cfShortId == null || !this.cfShortId.match(/^[a-zA-Z0-9.-_]+$/i)) { //invalid character
                this.basicModals.alert({key:"STATUS.INVALID_DATA"}, {key: "MESSAGES.INVALID_CUSTOM_FORM_ID"}, ModalType.warning);
                return;
            }
            if (this.existingForms.indexOf(this.cfPrefix + this.cfShortId) != -1) { //CRE with the same id already exists
                this.basicModals.alert({key:"STATUS.INVALID_DATA"}, {key: "MESSAGES.ALREADY_EXISTING_CUSTOM_FORM_ID"}, ModalType.warning);
                return;
            }
        }

        //update CRE only if ref is valid
        this.cfService.validatePearl(this.ref, this.type).subscribe(
            (result: PearlValidationResult) => {
                if (!result.valid) {
                    this.basicModals.alert({key:"STATUS.ERROR"}, result.details, ModalType.error);
                    return;
                }
                if (this.description == null) { //set empty definition if it is not provided (prevent setting "undefined" as definition of CRE)
                    this.description = "";
                }

                //I don't distinguish between node and graph since if type is node previewProps is ignored server-side
                let propChainParam: ARTURIResource[];
                let tablePreviewParam: ARTURIResource[];
                if (this.selectedPreviewForm.value == PreviewForm.propertyChain) {
                    propChainParam = this.previewProps;
                } else if (this.selectedPreviewForm.value == PreviewForm.table) {
                    tablePreviewParam = this.previewProps;
                }
                if (this.mode == EditorMode.edit) {
                    this.cfService.updateCustomForm(this.cfId, this.name, this.description, this.ref, propChainParam, tablePreviewParam).subscribe(
                        () => {
                            this.activeModal.close();
                        }
                    );
                } else { //create mode
                    this.cfService.createCustomForm(this.type, this.cfPrefix + this.cfShortId, this.name, this.description, this.ref, propChainParam, tablePreviewParam).subscribe(
                        () => {
                            this.activeModal.close();
                        }
                    );
                }
            },
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }
}

interface PreviewFormStruct {
    value: PreviewForm;
    labelTranslationKey: string;
    infoTranslationKey?: string;
}