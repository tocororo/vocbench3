import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/modules/sharedModule';
import { ModalType } from 'src/app/widget/modal/Modals';
import { SharedModalServices } from 'src/app/widget/modal/sharedModal/sharedModalServices';
import { ARTURIResource } from "../../models/ARTResources";
import { FormCollection } from "../../models/CustomForms";
import { OWL, RDF } from "../../models/Vocabulary";
import { CustomFormsServices } from "../../services/customFormsServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "form-coll-mapping-modal",
    templateUrl: "./formCollMappingModal.html",
})
export class FormCollMappingModal {

    formCollectionList: Array<FormCollection>;
    selectedResourceIri: string;
    selectedFormColl: FormCollection;

    constructor(public activeModal: NgbActiveModal, private cfService: CustomFormsServices, private basicModals: BasicModalServices,
        private sharedModals: SharedModalServices,
        private browsingModals: BrowsingModalServices) {
    }

    ngOnInit() {
        this.cfService.getAllFormCollections().subscribe(
            fcList => {
                this.formCollectionList = fcList;
            }
        );
    }

    selectSuggested() {
        this.cfService.getFormCollection(this.selectedFormColl.getId()).subscribe(
            fc => {
                var suggestions: ARTURIResource[] = fc.getSuggestions();
                if (suggestions.length == 0) {
                    this.basicModals.alert({key:"STATUS.WARNING"}, "No classes/properties suggested for the FormCollection " + fc.getId(), ModalType.warning);
                } else {
                    this.sharedModals.selectResource("Suggested resources", null, suggestions).then(
                        (res: ARTURIResource) => {
                            this.selectedResourceIri = res.getURI();
                        },
                        () => {}
                    );
                }
            }
        );
    }

    selectProperty() {
        this.browsingModals.browsePropertyTree("Select a property").then(
            (res: ARTURIResource) => {
                this.selectedResourceIri = res.getURI();
            },
            () => { }
        )
    }

    selectClass() {
        this.browsingModals.browseClassTree("Select a class", [RDF.property, OWL.class, OWL.thing]).then(
            (res: ARTURIResource) => {
                this.selectedResourceIri = res.getURI();
            },
            () => { }
        )
    }

    selectFormColl(formColl: FormCollection) {
        this.selectedFormColl = formColl;
    }

    ok() {
        this.selectedResourceIri = this.selectedResourceIri.trim();
        if (!ResourceUtils.testIRI(this.selectedResourceIri)) {
            this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, "The provided resource IRI is not valid", ModalType.warning);
            return
        }
        this.activeModal.close({ resource: new ARTURIResource(this.selectedResourceIri), formCollection: this.selectedFormColl.getId() });
    }

    cancel() {
        this.activeModal.dismiss();
    }
}