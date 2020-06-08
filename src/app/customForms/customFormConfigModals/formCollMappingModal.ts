import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
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
export class FormCollMappingModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private formCollectionList: Array<FormCollection>;
    private selectedResourceIri: string;
    private selectedFormColl: FormCollection;

    constructor(public dialog: DialogRef<BSModalContext>, private cfService: CustomFormsServices, private basicModals: BasicModalServices,
        private browsingModals: BrowsingModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.cfService.getAllFormCollections().subscribe(
            fcList => {
                this.formCollectionList = fcList;
            }
        );
    }

    private selectSuggested() {
        this.cfService.getFormCollection(this.selectedFormColl.getId()).subscribe(
            fc => {
                var suggestions: ARTURIResource[] = fc.getSuggestions();
                if (suggestions.length == 0) {
                    this.basicModals.alert("Suggested resources", "No classes/properties suggested for the FormCollection " + fc.getId(), "warning");
                } else {
                    this.basicModals.selectResource("Suggested resources", null, suggestions).then(
                        (res: ARTURIResource) => {
                            this.selectedResourceIri = res.getURI();
                        },
                        () => {}
                    );
                }
            }
        );
    }

    private selectProperty() {
        this.browsingModals.browsePropertyTree("Select a property").then(
            (res: ARTURIResource) => {
                this.selectedResourceIri = res.getURI();
            },
            () => { }
        )
    }

    private selectClass() {
        this.browsingModals.browseClassTree("Select a class", [RDF.property, OWL.class, OWL.thing]).then(
            (res: ARTURIResource) => {
                this.selectedResourceIri = res.getURI();
            },
            () => { }
        )
    }

    private selectFormColl(formColl: FormCollection) {
        this.selectedFormColl = formColl;
    }

    ok() {
        this.selectedResourceIri = this.selectedResourceIri.trim();
        if (!ResourceUtils.testIRI(this.selectedResourceIri)) {
            this.basicModals.alert("Invalid IRI", "The provided resource IRI is not valid", "warning");
            return
        }
        this.dialog.close({ resource: new ARTURIResource(this.selectedResourceIri), formCollection: this.selectedFormColl.getId() });
    }

    cancel() {
        this.dialog.dismiss();
    }
}