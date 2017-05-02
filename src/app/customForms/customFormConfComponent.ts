import {Component} from "@angular/core";
import {Modal, BSModalContextBuilder} from 'angular2-modal/plugins/bootstrap';
import {OverlayConfig} from 'angular2-modal';
import {CustomFormsServices} from "../services/customFormsServices";
import {ModalServices} from "../widget/modal/basicModal/modalServices";
import {FormCollMappingModal} from "./customFormConfigModals/formCollMappingModal"
import {FormCollEditorModal, FormCollEditorModalData} from "./customFormConfigModals/formCollEditorModal"
import {CustomFormEditorModal, CustomFormEditorModalData} from "./customFormConfigModals/customFormEditorModal"
import {ImportCfModal, ImportCfModalData} from "./customFormConfigModals/importCfModal"
import {ARTURIResource} from "../models/ARTResources";
import {FormCollectionMapping, CustomForm, CustomFormLevel, FormCollection} from "../models/CustomForms";

@Component({
	selector: "custom-form-conf-component",
	templateUrl: "./customFormConfComponent.html",
    host: { class : "pageComponent" }
})
export class CustomFormConfigComponent {
    
    private cfConfigurationMap: Array<FormCollectionMapping>;
    private formCollectionList: Array<FormCollection>;
    private customFormList: Array<CustomForm>;
    
    private selectedFormCollMapping: FormCollectionMapping;
    private selectedFormColl: FormCollection;
    private selectedCustomForm: CustomForm;
    
    constructor(private customFormsService: CustomFormsServices, private modalService: ModalServices, private modal: Modal) {}
    
    ngOnInit() {
        this.initCFConfMap();
        this.initFormCollList();
        this.initCustomFormList();
    }

    /**
     * CF CONFIG MAP
     */
    
    private initCFConfMap() {
        this.customFormsService.getCustomFormConfigMap().subscribe(
            cfConfMap => { 
                this.cfConfigurationMap = cfConfMap;
                this.selectedFormCollMapping = null;
            }
        );
    }

    private selectFormCollMapping(cfConfMap: FormCollectionMapping) {
        if (this.selectedFormCollMapping == cfConfMap) {
            this.selectedFormCollMapping = null;
        } else {
            this.selectedFormCollMapping = cfConfMap;
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
                                ", add more CustomForm to the assigned FormCollection (" + this.cfConfigurationMap[i].getFormCollection().getId() + ")",
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
        console.log("update replace")
        this.customFormsService.updateReplace(fcMap.getResource(), checked).subscribe();
    }

    /**
     * FORM COLLECTION
     */
    
    private initFormCollList() {
        this.customFormsService.getAllFormCollections().subscribe(
            crList => {
                this.formCollectionList = crList;
                this.selectedFormColl = null;
            }
        );
    }

     private selectFormColl(fc: FormCollection) {
        if (this.selectedFormColl == fc) {
            this.selectedFormColl = null;
        } else {
            this.selectedFormColl = fc;
        }
    }

    private createFormCollection() {
        var existingFormCollIds: string[] = [];
        for (var i = 0; i < this.formCollectionList.length; i++) {
            existingFormCollIds.push(this.formCollectionList[i].getId());
        }
        var modalData = new FormCollEditorModalData(null, existingFormCollIds);
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
        var modalData = new FormCollEditorModalData(this.selectedFormColl.getId(), [], (this.selectedFormColl.getLevel() == CustomFormLevel.system));
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
        this.modalService.confirm("Delete Form Collection", "You are deleting Form Collection " + this.selectedFormColl.getId() + ". Are you sure?", "warning").then(
            confirm => {
                this.customFormsService.deleteFormCollection(this.selectedFormColl.getId()).subscribe(
                    stResp => {
                        this.initCFConfMap();
                        this.initFormCollList();
                    }
                )
            },
            () => {}
        )
    }

    private cloneFormCollection() {
        this.modalService.promptPrefixed("Clone FormCollection", FormCollection.PREFIX, "ID", null, false, true).then(
            (value: any) => {
                let fcId = FormCollection.PREFIX + value;
                for (var i = 0; i < this.formCollectionList.length; i++) {
                    if (this.formCollectionList[i].getId() == fcId) {
                        this.modalService.alert("Duplicated ID", "A CustomForm with ID " + fcId + " already exists", "error");
                        return;
                    }
                }
                this.customFormsService.cloneFormCollection(this.selectedFormColl.getId(), fcId).subscribe(
                    stResp => {
                        this.initFormCollList();
                    }
                )
            },
            () => {}
        );
    }

    private exportFormCollection() {
        this.customFormsService.exportFormCollection(this.selectedFormColl.getId()).subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.modalService.downloadLink("Export FormCollection", null, exportLink, this.selectedFormColl.getId() + ".xml");
            }
        );
    }

    private importFormCollection() {
        var modalData = new ImportCfModalData("Import FormCollection", "FormCollection");
        const builder = new BSModalContextBuilder<ImportCfModalData>(
            modalData, undefined, ImportCfModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ImportCfModal, overlayConfig).then(
            dialog => dialog.result.then(
                (data: any) => {
                    this.customFormsService.importFormCollection(data.file, data.id).subscribe(
                        stResp => {
                            this.initFormCollList();
                        }
                    )
                },
                () => {}
            )
        );
    }

    /**
     * CUSTOM FORM
     */
    
    private initCustomFormList() {
        this.customFormsService.getAllCustomForms().subscribe(
            creList => {
                this.customFormList = creList;
                this.selectedCustomForm = null;
            }
        );
    }
    
    private selectCustomForm(cf: CustomForm) {
        if (this.selectedCustomForm == cf) {
            this.selectedCustomForm = null;
        } else {
            this.selectedCustomForm = cf;
        }
    }
    
    private createCustomForm() {
        var existingCustomFormIds: string[] = [];
        for (var i = 0; i < this.customFormList.length; i++) {
            existingCustomFormIds.push(this.customFormList[i].getId());
        }
        var modalData = new CustomFormEditorModalData(null, existingCustomFormIds);
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
        var modalData = new CustomFormEditorModalData(this.selectedCustomForm.getId(), [], (this.selectedCustomForm.getLevel() == CustomFormLevel.system));
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
                let fcId = CustomForm.PREFIX + value;
                for (var i = 0; i < this.customFormList.length; i++) {
                    if (this.customFormList[i].getId() == fcId) {
                        this.modalService.alert("Duplicated ID", "A CustomForm with ID " + fcId + " already exists", "error");
                        return;
                    }
                }
                this.customFormsService.cloneCustomForm(this.selectedCustomForm.getId(), fcId).subscribe(
                    stResp => {
                        this.initCustomFormList();
                    }
                )
            },
            () => {}
        );
    }
    
    private deleteCustomForm() {
        this.customFormsService.isFormLinkedToCollection(this.selectedCustomForm.getId()).subscribe(
            result => {
                if (result) { //selectedCustomForm belong to a CR
                    this.modalService.confirmCheck("Delete CustomForm", "You are deleting a CustomForm that " +
                        "belongs to one or more FormCollection(s). Are you sure?", "Delete also FormCollection(s) left empty", "error").then(
                        (check: any) => {
                            this.customFormsService.deleteCustomForm(this.selectedCustomForm.getId(), check).subscribe(
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
                    this.modalService.confirm("Delete CustomForm", "You are deleting CustomForm " + this.selectedCustomForm.getId() + 
                        ". Are you sure?", "warning").then(
                        confirm => {
                            this.customFormsService.deleteCustomForm(this.selectedCustomForm.getId()).subscribe(
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

    private exportCustomForm() {
        this.customFormsService.exportCustomForm(this.selectedCustomForm.getId()).subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.modalService.downloadLink("Export FormCollection", null, exportLink, this.selectedCustomForm.getId() + ".xml");
            }
        );
    }

    private importCustomForm() {
        var modalData = new ImportCfModalData("Import CustomForm", "CustomForm");
        const builder = new BSModalContextBuilder<ImportCfModalData>(
            modalData, undefined, ImportCfModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(ImportCfModal, overlayConfig).then(
            dialog => dialog.result.then(
                (data: any) => {
                    this.customFormsService.importCustomForm(data.file, data.id).subscribe(
                        stResp => {
                            this.initCustomFormList();
                        }
                    )
                },
                () => {}
            )
        );
    }
    
}