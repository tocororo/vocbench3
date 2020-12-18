import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "../models/ARTResources";
import { CustomForm, CustomFormLevel, FormCollection, FormCollectionMapping } from "../models/CustomForms";
import { CustomFormsServices } from "../services/customFormsServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../utils/VBActions";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ConfirmCheckOptions } from '../widget/modal/basicModal/confirmModal/confirmCheckModal';
import { ModalOptions, ModalType } from '../widget/modal/Modals';
import { BrokenCFStructReportModal } from "./customFormConfigModals/brokenCFStructReportModal";
import { CustomFormEditorModal } from "./customFormConfigModals/customFormEditorModal";
import { FormCollEditorModal } from "./customFormConfigModals/formCollEditorModal";
import { FormCollMappingModal } from "./customFormConfigModals/formCollMappingModal";
import { ImportCfModal, ImportCfModalReturnData } from "./customFormConfigModals/importCfModal";

@Component({
    selector: "custom-form-conf-component",
    templateUrl: "./customFormConfComponent.html",
    host: { class: "pageComponent" }
})
export class CustomFormConfigComponent {

    cfConfigurationMap: Array<FormCollectionMapping>;
    formCollectionList: Array<FormCollection>;
    customFormList: Array<CustomForm>;

    selectedFormCollMapping: FormCollectionMapping;
    selectedFormColl: FormCollection;
    selectedCustomForm: CustomForm;

    constructor(private customFormsService: CustomFormsServices, private basicModals: BasicModalServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.initCFConfMap();
        this.initFormCollList();
        this.initCustomFormList();
    }

    showBrokenCFS() {
        const modalRef: NgbModalRef = this.modalService.open(BrokenCFStructReportModal, new ModalOptions('xl'));
        return modalRef.result;
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

    selectFormCollMapping(cfConfMap: FormCollectionMapping) {
        if (this.selectedFormCollMapping == cfConfMap) {
            this.selectedFormCollMapping = null;
        } else {
            this.selectedFormCollMapping = cfConfMap;
        }
    }

    createFormCollMapping() {
        const modalRef: NgbModalRef = this.modalService.open(FormCollMappingModal, new ModalOptions());
        return modalRef.result.then(
            res => {
                var resource: ARTURIResource = res.resource;
                var formCollId: string = res.formCollection;
                //check if selected property has not a FormCollection already assigned
                for (var i = 0; i < this.cfConfigurationMap.length; i++) {
                    if (this.cfConfigurationMap[i].getResource().getURI() == resource.getURI()) {
                        //already in a mapping
                        this.basicModals.alert({key:"STATUS.ERROR"}, "A FormCollection is already assigned to " + resource.getShow() +
                            ". Please, select another resource, or if you want to add a form to " + resource.getShow() +
                            ", add more CustomForm to the assigned FormCollection (" + this.cfConfigurationMap[i].getFormCollection().getId() + ")",
                            ModalType.warning);
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
        );
    }

    removeFormCollMapping() {
        this.customFormsService.removeFormCollectionOfResource(this.selectedFormCollMapping.getResource()).subscribe(
            stResp => {
                this.initCFConfMap();
            }
        );
    }

    changeReplaceToMapping(checked: boolean, fcMap: FormCollectionMapping) {
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

    selectFormColl(fc: FormCollection) {
        if (this.selectedFormColl == fc) {
            this.selectedFormColl = null;
        } else {
            this.selectedFormColl = fc;
        }
    }

    createFormCollection() {
        let existingFormCollIds: string[] = [];
        for (let i = 0; i < this.formCollectionList.length; i++) {
            existingFormCollIds.push(this.formCollectionList[i].getId());
        }
        this.openFormCollEditor(null, existingFormCollIds, false).then(
            () => {},
            () => {}
        );
    }

    editFormCollection() {
        this.openFormCollEditor(this.selectedFormColl.getId(), [], (this.selectedFormColl.getLevel() == CustomFormLevel.system)).then(
            () => {},
            () => {}
        );
    }

    private openFormCollEditor(id: string, existingFormColl: string[], readOnly: boolean) {
        const modalRef: NgbModalRef = this.modalService.open(FormCollEditorModal, new ModalOptions('lg'));
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.existingFormColl = existingFormColl;
        modalRef.componentInstance.readOnly = readOnly;
        return modalRef.result
    }

    deleteFormCollection() {
        this.basicModals.confirm({key:"ACTIONS.DELETE_FORM_COLLECTION"}, "You are deleting Form Collection " + this.selectedFormColl.getId() + ". Are you sure?", ModalType.warning).then(
            confirm => {
                this.customFormsService.deleteFormCollection(this.selectedFormColl.getId()).subscribe(
                    stResp => {
                        this.initCFConfMap();
                        this.initFormCollList();
                    }
                )
            },
            () => { }
        )
    }

    cloneFormCollection() {
        this.basicModals.promptPrefixed({key:"ACTIONS.CLONE_FORM_COLLECTION"}, FormCollection.PREFIX, "ID", null, false, true, true).then(
            (fcId: any) => {
                for (var i = 0; i < this.formCollectionList.length; i++) {
                    if (this.formCollectionList[i].getId() == fcId) {
                        this.basicModals.alert({key:"STATUS.WARNING"}, "A CustomForm with ID " + fcId + " already exists", ModalType.warning);
                        return;
                    }
                }
                this.customFormsService.cloneFormCollection(this.selectedFormColl.getId(), fcId).subscribe(
                    stResp => {
                        this.initFormCollList();
                    }
                )
            },
            () => { }
        );
    }

    exportFormCollection() {
        this.customFormsService.exportFormCollection(this.selectedFormColl.getId()).subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink({ key: "ACTIONS.EXPORT_FORM_COLLECTION" }, null, exportLink, this.selectedFormColl.getId() + ".xml");
            }
        );
    }

    importFormCollection() {
        return this.openImportCfModal("Import FormCollection", "FormCollection").then(
            (data: ImportCfModalReturnData) => {
                this.customFormsService.importFormCollection(data.file, data.id).subscribe(
                    () => {
                        this.initFormCollList();
                    }
                )
            },
            () => { }
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

    selectCustomForm(cf: CustomForm) {
        if (this.selectedCustomForm == cf) {
            this.selectedCustomForm = null;
        } else {
            this.selectedCustomForm = cf;
        }
    }

    createCustomForm() {
        var existingCustomFormIds: string[] = [];
        for (var i = 0; i < this.customFormList.length; i++) {
            existingCustomFormIds.push(this.customFormList[i].getId());
        }
        return this.openCustomFormEditor(null, existingCustomFormIds, false).then(
            () => this.initCustomFormList(),
            () => { }
        );
    }

    editCustomForm() {
        return this.openCustomFormEditor(this.selectedCustomForm.getId(), [], (this.selectedCustomForm.getLevel() == CustomFormLevel.system)).then(
            () => { },
            () => { }
        );
    }

    private openCustomFormEditor(id: string, existingForms: string[], readOnly: boolean) {
        const modalRef: NgbModalRef = this.modalService.open(CustomFormEditorModal, new ModalOptions('full'));
        modalRef.componentInstance.id = id;
        modalRef.componentInstance.existingForms = existingForms;
        modalRef.componentInstance.readOnly = readOnly;
        return modalRef.result;
    }

    cloneCustomForm() {
        this.basicModals.promptPrefixed({key:"ACTIONS.CLONE_CUSTOM_FORM"}, CustomForm.PREFIX, "ID", null, false, true, true).then(
            (fcId: any) => {
                for (var i = 0; i < this.customFormList.length; i++) {
                    if (this.customFormList[i].getId() == fcId) {
                        this.basicModals.alert({key:"STATUS.WARNING"}, "A CustomForm with ID " + fcId + " already exists", ModalType.warning);
                        return;
                    }
                }
                this.customFormsService.cloneCustomForm(this.selectedCustomForm.getId(), fcId).subscribe(
                    stResp => {
                        this.initCustomFormList();
                    }
                )
            },
            () => { }
        );
    }

    deleteCustomForm() {
        this.customFormsService.isFormLinkedToCollection(this.selectedCustomForm.getId()).subscribe(
            result => {
                if (result) { //selectedCustomForm belong to a CR
                    let deletEmptyCollCkeckOpt: ConfirmCheckOptions = { label: "Delete also FormCollection(s) left empty", value: true };
                    this.basicModals.confirmCheck({key:"ACTIONS.DELETE_CUSTOM_FORM"}, "You are deleting a CustomForm that " +
                        "belongs to one or more FormCollection(s). Are you sure?", [deletEmptyCollCkeckOpt], ModalType.warning).then(
                        (checkboxOpts: ConfirmCheckOptions[]) => {
                            let deleteEmptyColl: boolean = checkboxOpts[0].value;
                            this.customFormsService.deleteCustomForm(this.selectedCustomForm.getId(), deleteEmptyColl).subscribe(
                                stResp => {
                                    if (deleteEmptyColl) { //if user chooses to delete also empty FormCollection
                                        this.initCFConfMap();
                                        this.initFormCollList();
                                    }
                                    this.initCustomFormList();
                                }
                            );
                        },
                        () => { }
                        );
                } else { //selectedCustomForm does not belong to any FormCollection
                    this.basicModals.confirm({key:"ACTIONS.DELETE_CUSTOM_FORM"}, "You are deleting CustomForm " + this.selectedCustomForm.getId() +
                        ". Are you sure?", ModalType.warning).then(
                        confirm => {
                            this.customFormsService.deleteCustomForm(this.selectedCustomForm.getId()).subscribe(
                                stResp => {
                                    this.initCustomFormList();
                                }
                            );
                        },
                        () => { }
                    );
                }
            }
        )
    }

    exportCustomForm() {
        this.customFormsService.exportCustomForm(this.selectedCustomForm.getId()).subscribe(
            blob => {
                var exportLink = window.URL.createObjectURL(blob);
                this.basicModals.downloadLink({ key: "ACTIONS.EXPORT_FORM_COLLECTION" }, null, exportLink, this.selectedCustomForm.getId() + ".xml");
            }
        );
    }

    importCustomForm() {
        this.openImportCfModal("Import CustomForm", "CustomForm").then(
            (data: any) => {
                this.customFormsService.importCustomForm(data.file, data.id).subscribe(
                    stResp => {
                        this.initCustomFormList();
                    }
                )
            },
            () => { }
        );
    }

    private openImportCfModal(title: string, type: "CustomForm" | "FormCollection") {
        const modalRef: NgbModalRef = this.modalService.open(ImportCfModal, new ModalOptions());
        modalRef.componentInstance.title = title;
		modalRef.componentInstance.type = type;
        return modalRef.result;
    }

    //Authorization handlers
    isCreateMappingAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormCreateFormMapping);
    }
    isDeleteMappingAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormDeleteFormMapping);
    }
    isUpdateMappingAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormUpdateFormMapping);
    }

    isCreateFormAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormCreateForm);
    }
    isDeleteFormAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormDeleteForm);
    }
    isUpdateFormAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormUpdateForm);
    }

    isCreateCollectionAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormCreateCollection);
    }
    isDeleteCollectionAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormDeleteCollection);
    }
    isUpdateCollectionAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.customFormUpdateCollection);
    }

}