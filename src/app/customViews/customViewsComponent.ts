import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { CustomViewAssociation, CustomViewReference } from "src/app/models/CustomViews";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType, Translation } from "src/app/widget/modal/Modals";
import { CustomViewEditorModal } from "./editors/customViewEditorModal";
import { CvAssociationEditorModal } from "./editors/cvAssociationEditorModal";

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
        this.openCustomViewEditor({ key: "Create Custom View" }).then(
            () => this.initCustomViews(),
            () => {}
        );
    }

    editCustomView() {
        this.openCustomViewEditor({key:"Edit Custom View"}, this.selectedCustomView.reference).then(
            () => this.initCustomViews(),
            () => {}
        );
    }

    deleteCustomView() {
        this.basicModals.confirm("Delete Custom View", "You are deleting Custom View, are you sure?", ModalType.warning).then(
            () => {
                this.customViewsService.deleteCustomView(this.selectedCustomView.reference).subscribe(
                    () => {
                        this.initCustomViews();
                    }
                );
            },
            () => {}
        );
    }

    private openCustomViewEditor(title: Translation, widgetRef?: string) {
        const modalRef: NgbModalRef = this.modalService.open(CustomViewEditorModal, new ModalOptions('xl'));
        modalRef.componentInstance.title = this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.existingWidgets = this.customViews;
        modalRef.componentInstance.ref = widgetRef;
        return modalRef.result;
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
        this.openAssociationEditor({key: "Add property association"}).then(
            () => this.initAssociations(),
            () => {}
        );
    }

    deleteAssociation() {
        this.basicModals.confirm("Delete association", "You are deleting association, are you sure?", ModalType.warning).then(
            () => {
                this.customViewsService.deleteAssociation(this.selectedAssociation.ref).subscribe(
                    () => this.initAssociations()
                );
            },
            () => {}
        );
    }

    private openAssociationEditor(title: Translation) {
        const modalRef: NgbModalRef = this.modalService.open(CvAssociationEditorModal, new ModalOptions());
        modalRef.componentInstance.title = this.translateService.instant(title.key, title.params);
		modalRef.componentInstance.existingAssociations = this.associations;
        return modalRef.result;
    }

}