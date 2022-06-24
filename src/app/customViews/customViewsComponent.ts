import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import * as FileSaver from 'file-saver';
import { CustomViewAssociation, CustomViewReference } from "src/app/models/CustomViews";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType, Translation } from "src/app/widget/modal/Modals";
import { Scope, ScopeUtils } from '../models/Plugins';
import { CustomViewEditorModal } from "./editors/customViewEditorModal";
import { CvAssociationEditorModal } from "./editors/cvAssociationEditorModal";
import { ImportCustomViewModal, ImportCvModalReturnData } from './editors/importCustomViewModal';

@Component({
    selector: "custom-views-component",
    templateUrl: "./customViewsComponent.html",
    host: { class: "vbox" }
})
export class CustomViewsComponent {

    customViews: CustomViewReference[];
    selectedCustomView: CustomViewReference;

    associations: CustomViewAssociation[];
    selectedAssociation: CustomViewAssociation;

    createCustomViewAuthorized: boolean;
    deleteCustomViewAuthorized: boolean;
    modifyCustomViewAuthorized: boolean;
    createAssociationAuthorized: boolean;
    deleteAssociationAuthorized: boolean;

    constructor(private customViewsService: CustomViewsServices, private basicModals: BasicModalServices,
        private modalService: NgbModal, private translateService: TranslateService) { }

    ngOnInit() {
        this.initCustomViews();
        this.initAssociations();

        //for the moment initialize all the permission to true
        this.createCustomViewAuthorized = true;
        this.deleteCustomViewAuthorized = true;
        this.modifyCustomViewAuthorized = true;
        this.createAssociationAuthorized = true;
        this.deleteAssociationAuthorized = true;
    }

    /*
     * Custom Viws
     */


    private initCustomViews() {
        this.customViewsService.getViewsIdentifiers().subscribe(
            refs => {
                this.customViews = refs.map(ref => CustomViewReference.parseCustomViewReference(ref));
                this.selectedCustomView = null;
            }
        );
    }

    createCustomView() {
        this.openCustomViewEditor({ key: "CUSTOM_VIEWS.ACTIONS.CREATE_CUSTOM_VIEW" }).then(
            () => this.initCustomViews(),
            () => { }
        );
    }

    editCustomView() {
        this.openCustomViewEditor({ key: "CUSTOM_VIEWS.ACTIONS.EDIT_CUSTOM_VIEW" }, this.selectedCustomView.reference);
    }

    deleteCustomView() {
        this.basicModals.confirm({ key: "CUSTOM_VIEWS.ACTIONS.DELETE_CUSTOM_VIEW" }, { key: "CUSTOM_VIEWS.MESSAGES.DELETE_CUSTOM_VIEW_CONFIRM" }, ModalType.warning).then(
            () => {
                this.customViewsService.deleteCustomView(this.selectedCustomView.reference).subscribe(
                    () => {
                        this.initCustomViews();
                    }
                );
            },
            () => { }
        );
    }

    private openCustomViewEditor(title: Translation, widgetRef?: string) {
        const modalRef: NgbModalRef = this.modalService.open(CustomViewEditorModal, new ModalOptions('xl'));
        modalRef.componentInstance.title = this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.existingCV = this.customViews;
        modalRef.componentInstance.ref = widgetRef;
        return modalRef.result;
    }


    exportCustomView() {
        this.customViewsService.exportCustomView(this.selectedCustomView.reference).subscribe(
            blob => {
                FileSaver.saveAs(blob, this.selectedCustomView.name + ".cfg");
            }
        );
    }

    importCustomView() {
        const modalRef: NgbModalRef = this.modalService.open(ImportCustomViewModal, new ModalOptions());
        modalRef.componentInstance.existingCV = this.customViews;
        modalRef.result.then(
            (data: ImportCvModalReturnData) => {
                this.customViewsService.importCustomView(data.file, ScopeUtils.serializeScope(Scope.PROJECT) + ":" + data.name).subscribe(
                    () => {
                        this.initCustomViews();
                    }
                );
            },
            () => { }
        );
    }

    /*
     * ASSOCIATIONS
     */

    private initAssociations() {
        this.customViewsService.listAssociations().subscribe(
            associations => {
                this.associations = associations;
                this.selectedAssociation = null;
            }
        );
    }

    createAssociation() {
        this.openAssociationEditor({ key: "CUSTOM_VIEWS.ACTIONS.ADD_ASSOCIATION" }).then(
            () => this.initAssociations(),
            () => { }
        );
    }

    deleteAssociation() {
        this.basicModals.confirm({ key: "CUSTOM_VIEWS.ACTIONS.DELETE_ASSOCIATION" }, { key: "CUSTOM_VIEWS.MESSAGES.DELETE_CUSTOM_VIEW_ASSOCIATION_CONFIRM" }, ModalType.warning).then(
            () => {
                this.customViewsService.deleteAssociation(this.selectedAssociation.ref).subscribe(
                    () => this.initAssociations()
                );
            },
            () => { }
        );
    }

    private openAssociationEditor(title: Translation) {
        const modalRef: NgbModalRef = this.modalService.open(CvAssociationEditorModal, new ModalOptions());
        modalRef.componentInstance.title = this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.existingAssociations = this.associations;
        return modalRef.result;
    }

}