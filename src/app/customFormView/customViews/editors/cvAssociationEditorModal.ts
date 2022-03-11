import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CustomViewAssociation, CustomViewConfiguration, CustomViewConst, CustomViewDefinition, CustomViewDefinitionKeys, CustomViewReference, ViewsEnum } from "src/app/models/CustomViews";
import { CustomViewsServices } from "src/app/services/customViewsServices";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../../models/ARTResources";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "cv-assosiaction-editor-modal",
    templateUrl: "./cvAssociationEditorModal.html",
})
export class CvAssociationEditorModal {
    @Input() title: string;
    @Input() existingAssociations: CustomViewAssociation[];

    selectedProperty: ARTURIResource;

    customViews: CustomViewReference[];
    selectedCustomView: CustomViewReference;

    availableViews: { id: ViewsEnum, translationKey: string }[];
    defaultView: ViewsEnum;


    constructor(public activeModal: NgbActiveModal, private customViewsService: CustomViewsServices,
        private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        this.customViewsService.getViewsIdentifiers().subscribe(
            refs => {
                this.customViews = refs.map(ref => CustomViewReference.parseCustomViewReference(ref));
            }
        )
    }

    onPropertySelected(property: ARTURIResource) {
        //check if an association for the given predicate already exists
        if (this.existingAssociations.some(a => a.property.equals(property))) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, "The selected property has already a Custom View associated.", ModalType.warning);
        } else {
            this.selectedProperty = property;
        }
    }

    selectCustomView(ref: CustomViewReference) {
        this.selectedCustomView = ref;
        this.customViewsService.getCustomView(ref.reference).subscribe(
            (cv: CustomViewConfiguration) => {
                this.availableViews = CustomViewConst.modelToViewMap[CustomViewConst.classNameToModelMap[cv.type]];
                this.defaultView = cv.getPropertyValue(CustomViewDefinitionKeys.suggestedView)
            }
        )
    }

    isDataValid(): boolean {
        return this.selectedCustomView != null && this.selectedProperty != null;
    }

    ok() {
        this.customViewsService.addAssociation(this.selectedProperty, this.selectedCustomView.reference, this.defaultView).subscribe(
            () => {
                this.activeModal.close();
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }
}