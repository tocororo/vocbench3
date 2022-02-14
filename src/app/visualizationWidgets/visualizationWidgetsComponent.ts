import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { WidgetAssociation, WidgetStruct, WidgetUtils } from "../models/VisualizationWidgets";
import { VisualizationWidgetsServices } from "../services/visualizationWidgetsServices";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { ModalOptions, ModalType, Translation } from "../widget/modal/Modals";
import { WidgetAssociationEditorModal } from "./editors/widgetAssociationEditorModal";
import { WidgetEditorModal } from "./editors/widgetEditorModal";

@Component({
    selector: "visualization-widgets-component",
    templateUrl: "./visualizationWidgetsComponent.html",
    host: { class: "pageComponent" }
})
export class VisualizationWidgetsComponent {

    widgets: WidgetStruct[];
    selectedWidget: WidgetStruct;

    associations: WidgetAssociation[];
    selectedAssociation: WidgetAssociation;

    createWidgetAuthorized: boolean;
    deleteWidgetAuthorized: boolean;
    modifyWidgetAuthorized: boolean;
    createAssociationAuthorized: boolean;
    deleteAssociationAuthorized: boolean;

    constructor(private visualizationWidgetsService: VisualizationWidgetsServices, private basicModals: BasicModalServices,
         private modalService: NgbModal, private translateService: TranslateService) { }

    ngOnInit() {
        this.initWidgets();
        this.initTriggers();

        //for the moment initialize all the permission to true
        this.createWidgetAuthorized = true;
        this.deleteWidgetAuthorized = true;
        this.modifyWidgetAuthorized = true;
        this.createAssociationAuthorized = true;
        this.deleteAssociationAuthorized = true;
    }

    /*
     * WIDGETS
     */


    private initWidgets() {
        this.visualizationWidgetsService.getWidgetIdentifiers().subscribe(
            refs => {
                this.widgets = refs.map(ref => WidgetUtils.convertReferenceToWidgetStruct(ref));
                this.selectedWidget = null;
            }
        );
    }

    createWidget() {
        this.openWidgetEditor({key:"RESOURCE_METADATA.ACTIONS.CREATE_METADATA_PATTERN"}).then(
            () => this.initWidgets(),
            () => {}
        );
    }

    editWidget() {
        this.openWidgetEditor({key:"RESOURCE_METADATA.ACTIONS.EDIT_METADATA_PATTERN"}, this.selectedWidget.reference).then(
            () => this.initWidgets(),
            () => {}
        );
    }

    deleteWidget() {
        this.basicModals.confirm("Delete widget", "You are deleting widget, are you sure?", ModalType.warning).then(
            () => {
                this.visualizationWidgetsService.deleteWidget(this.selectedWidget.reference).subscribe(
                    () => {
                        this.initWidgets();
                    }
                );
            },
            () => {}
        );
    }

    private openWidgetEditor(title: Translation, widgetRef?: string) {
        // let readonly: boolean = (widgetRef != null) ? widgetRef.startsWith("factory") : false;
        const modalRef: NgbModalRef = this.modalService.open(WidgetEditorModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.existingWidgets = this.widgets;
        modalRef.componentInstance.ref = widgetRef;
        // modalRef.componentInstance.readOnly = readonly;
        return modalRef.result;
    }

    /*
     * ASSOCIATIONS
     */

    private initTriggers() {
        this.visualizationWidgetsService.listAssociations().subscribe(
            associations => {
                this.associations = associations;
                this.selectedAssociation = null;
            }
        );
    }

    createAssociation() {
        this.openAssociationEditor({key:"RESOURCE_METADATA.ACTIONS.CREATE_METADATA_ASSOCIATION"}).then(
            () => this.initTriggers(),
            () => {}
        );
    }

    deleteAssociation() {
        this.basicModals.confirm("Delete association", "You are deleting association, are you sure?", ModalType.warning).then(
        // this.basicModals.confirm({key:"RESOURCE_METADATA.ACTIONS.DELETE_METADATA_ASSOCIATION"}, {key:"MESSAGES.DELETE_METADATA_PATTERN_ASSOCIATION_CONFIRM"}, ModalType.warning).then(
            () => {
                this.visualizationWidgetsService.deleteAssociation(this.selectedAssociation.ref).subscribe(
                    () => this.initTriggers()
                );
            },
            () => {}
        );
    }

    private openAssociationEditor(title: Translation) {
        const modalRef: NgbModalRef = this.modalService.open(WidgetAssociationEditorModal, new ModalOptions());
        modalRef.componentInstance.title = this.translateService.instant(title.key, title.params);
		modalRef.componentInstance.existingAssociations = this.associations;
        return modalRef.result;
    }

 }