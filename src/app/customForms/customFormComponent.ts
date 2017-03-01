import {Component} from "@angular/core";
import {Modal, BSModalContextBuilder} from 'angular2-modal/plugins/bootstrap';
import {OverlayConfig} from 'angular2-modal';
import {CustomFormsServices} from "../services/customFormsServices";
import {ModalServices} from "../widget/modal/modalServices";
import {FormCollMappingModal} from "./customFormConfigModals/formCollMappingModal"
import {FormCollEditorModal, FormCollEditorModalData} from "./customFormConfigModals/formCollEditorModal"
import {CustomFormEditorModal, CustomFormEditorModalData} from "./customFormConfigModals/customFormEditorModal"
import {ARTURIResource} from "../models/ARTResources";
import {FormCollectionMapping, CustomForm} from "../models/CustomForms";

@Component({
	selector: "custom-form-component",
	templateUrl: "./customFormComponent.html",
    host: { class : "pageComponent" }
})
export class CustomFormComponent {
    
    private cfConfigurationMap: Array<FormCollectionMapping>;
    private formCollectionList: Array<string>;
    private customFormList: Array<string>;
    
    private selectedFormCollMapping: FormCollectionMapping;
    private selectedFormColl: string;
    private selectedCustomForm: string;
    
    constructor(private customFormsService: CustomFormsServices, private modalService: ModalServices, private modal: Modal) {}
    
    ngOnInit() {
        this.initCFConfMap();
        this.initFormCollList();
        this.initCustomFormList();
    }
    
    private initCFConfMap() {
        this.customFormsService.getCustomFormConfigMap().subscribe(
            cfConfMap => { 
                console.log("cfConfMap", cfConfMap);
                this.cfConfigurationMap = cfConfMap;
                this.selectedFormCollMapping = null;
            }
        );
    }
    
    private initFormCollList() {
        this.customFormsService.getAllFormCollections().subscribe(
            crList => {
                this.formCollectionList = crList;
                this.selectedFormColl = null;
            }
        );
    }
    
    private initCustomFormList() {
        this.customFormsService.getAllCustomForms().subscribe(
            creList => {
                this.customFormList = creList;
                this.selectedCustomForm = null;
            }
        );
    }
    
    private selectFormCollMapping(cfConfMap: FormCollectionMapping) {
        if (this.selectedFormCollMapping == cfConfMap) {
            this.selectedFormCollMapping == null;
        } else {
            this.selectedFormCollMapping = cfConfMap;
        }
    }
    
    private selectFormColl(fc: string) {
        if (this.selectedFormColl == fc) {
            this.selectedFormColl == null;
        } else {
            this.selectedFormColl = fc;
        }
    }
    
    private selectCustomForm(cf: string) {
        if (this.selectedCustomForm == cf) {
            this.selectedCustomForm == null;
        } else {
            this.selectedCustomForm = cf;
        }
    }
    
    private createFormCollMapping() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(FormCollMappingModal, overlayConfig).then(
            dialog => dialog.result.then(
                res => {
                    var resource: ARTURIResource = res.resource;
                    var formCollId: string = res.formCollection;
                    //check if selected property has not a FormCollection already assigned
                    for (var i = 0; i < this.cfConfigurationMap.length; i++) {
                        if (this.cfConfigurationMap[i].getResource().getURI() == resource.getURI()) {
                            //already in a mapping
                            this.modalService.alert("Denied", "A FormCollection is already assigned to " + resource.getShow() +
                                ". Please, select another resource, or if you want to add a form to " + resource.getShow() +
                                ", add more CustomForm to the assigned FormCollection (" + this.cfConfigurationMap[i].getFormCollectionID() + ")",
                                "warning");
                            return;
                        }
                    }
                    this.customFormsService.addFormsMapping(formCollId, resource).subscribe(
                        stResp => {
                            this.initCFConfMap();
                        }
                    )
                },
                () => {}                
            )
        );
    }
    
    private removeFormCollMapping() {
        this.customFormsService.removeFormCollectionOfResource(this.selectedFormCollMapping.getResource()).subscribe(
            stResp => {
                this.initCFConfMap();
            }
        );
    }

    private changeReplaceToMapping(checked: boolean, fcMap: FormCollectionMapping) {
        this.customFormsService.updateReplace(fcMap.getResource(), checked).subscribe();
    }
    
    private createFormCollection() {
        var modalData = new FormCollEditorModalData(null, this.formCollectionList);
        const builder = new BSModalContextBuilder<FormCollEditorModalData>(
            modalData, undefined, FormCollEditorModalData
        );
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(FormCollEditorModal, overlayConfig).then(
            dialog => dialog.result.then(
                res => this.initFormCollList(),
                () => {}
            )
        );
    }
    
    private editFormCollection() {
        var modalData = new FormCollEditorModalData(this.selectedFormColl);
        const builder = new BSModalContextBuilder<FormCollEditorModalData>(
            modalData, undefined, FormCollEditorModalData
        );
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(FormCollEditorModal, overlayConfig).then(
            dialog => dialog.result.then(
                res => {},
                () => {}
            )
        );
    }
    
    private deleteFormCollection() {
        this.modalService.confirm("Delete Form Collection", "You are deleting Form Collection " + this.selectedFormColl + ". Are you sure?", "warning").then(
            confirm => {
                this.customFormsService.deleteFormCollection(this.selectedFormColl).subscribe(
                    stResp => {
                        this.initCFConfMap();
                        this.initFormCollList();
                    }
                )
            },
            () => {}
        )
    }
    
    private createCustomForm() {
        var modalData = new CustomFormEditorModalData(null, this.customFormList);
        const builder = new BSModalContextBuilder<CustomFormEditorModalData>(
            modalData, undefined, CustomFormEditorModalData
        );
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(CustomFormEditorModal, overlayConfig).then(
            dialog => dialog.result.then(
                res => this.initCustomFormList(),
                () => {}
            )
        );
    }
    
    private editCustomForm() {
        var modalData = new CustomFormEditorModalData(this.selectedCustomForm);
        const builder = new BSModalContextBuilder<CustomFormEditorModalData>(
            modalData, undefined, CustomFormEditorModalData
        );
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(CustomFormEditorModal, overlayConfig).then(
            dialog => dialog.result.then(
                res => {},
                () => {}
            )
        );
    }

    private cloneCustomForm() {
        this.modalService.promptPrefixed("Clone CustomForm", CustomForm.PREFIX, "ID", null, false, true).then(
            (value: any) => {
                let crId = CustomForm.PREFIX + value;
                for (var i = 0; i < this.customFormList.length; i++) {
                    if (this.customFormList[i] == crId) {
                        this.modalService.alert("Duplicated ID", "A CustomForm with ID " + crId + " already exists", "error");
                        return;
                    }
                }
                this.customFormsService.cloneCustomForm(this.selectedCustomForm, crId).subscribe(
                    stResp => {
                        this.initCustomFormList();
                    }
                )
            },
            () => {}
        );
    }
    
    private deleteCustomForm() {
        this.customFormsService.isFormLinkedToCollection(this.selectedCustomForm).subscribe(
            result => {
                if (result) { //selectedCustomForm belong to a CR
                    this.modalService.confirmCheck("Delete CustomForm", "You are deleting a CustomForm that " +
                        "belongs to one or more FormCollection(s). Are you sure?", "Delete also FormCollection(s) left empty", "error").then(
                        (check: any) => {
                            this.customFormsService.deleteCustomForm(this.selectedCustomForm, check).subscribe(
                                stResp => {
                                    if (check) { //if user chooses to delete also empty FormCollection
                                        this.initCFConfMap();
                                        this.initFormCollList();
                                    }
                                    this.initCustomFormList();
                                }
                            );
                        },
                        () => {}
                    );
                } else { //selectedCustomForm does not belong to any FormCollection
                    this.modalService.confirm("Delete CustomForm", "You are deleting CustomForm " + this.selectedCustomForm + 
                        ". Are you sure?", "warning").then(
                        confirm => {
                            this.customFormsService.deleteCustomForm(this.selectedCustomForm).subscribe(
                                stResp => {
                                    this.initCustomFormList();
                                }
                            );
                        },
                        () => {}
                    );
                }
            }
        )
    }
    
}