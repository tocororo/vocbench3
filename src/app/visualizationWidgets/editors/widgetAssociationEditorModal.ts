import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { WidgetAssociation, WidgetStruct, WidgetUtils } from "src/app/models/VisualizationWidgets";
import { VisualizationWidgetsServices } from "src/app/services/visualizationWidgetsServices";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "widget-assosiaction-editor-modal",
    templateUrl: "./widgetAssociationEditorModal.html",
})
export class WidgetAssociationEditorModal {
    @Input() title: string;
    @Input() existingAssociations: WidgetAssociation[];

    widgets: WidgetStruct[];
    selectedWidget: WidgetStruct;

    selectedTrigger: ARTURIResource;


    constructor(public activeModal: NgbActiveModal, private visualizationWidgetsService: VisualizationWidgetsServices,
        private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        this.visualizationWidgetsService.getWidgetIdentifiers().subscribe(
            refs => {
                this.widgets = refs.map(ref => WidgetUtils.convertReferenceToWidgetStruct(ref));
            }
        )
    }

    onTriggerSelected(predicate: ARTURIResource) {
        //check if an association for the given predicate already exists
        if (this.existingAssociations.some(a => a.trigger.equals(predicate))) {
            this.basicModals.alert({key:"STATUS.WARNING"}, "The selected property has already a widget associated.", ModalType.warning);
        } else {
            this.selectedTrigger = predicate;
        }
    }

    isDataValid(): boolean {
        return this.selectedWidget != null && this.selectedTrigger != null;
    }

    ok() {
        this.visualizationWidgetsService.addAssociation(this.selectedTrigger, this.selectedWidget.reference).subscribe(
            () => {
                this.activeModal.close();
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }
}