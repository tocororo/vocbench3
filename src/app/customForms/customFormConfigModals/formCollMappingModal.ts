import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { CustomFormsServices } from "../../services/customFormsServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { ARTURIResource } from "../../models/ARTResources";
import { FormCollection } from "../../models/CustomForms";
import { RDF, OWL } from "../../models/Vocabulary";

@Component({
    selector: "form-coll-mapping-modal",
    templateUrl: "./formCollMappingModal.html",
})
export class FormCollMappingModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private formCollectionList: Array<FormCollection>;
    private selectedResource: ARTURIResource;
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
                    this.basicModals.alert("Suggested resources", "No classes/properties suggested for the FormCollection " + fc.getId, "warning");
                } else {
                    this.basicModals.selectResource("Suggested resources", null, suggestions).then(
                        res => {
                            this.selectedResource = res;
                        },
                        () => {}
                    );
                }
            }
        );
    }

    private selectProperty() {
        this.browsingModals.browsePropertyTree("Select a property").then(
            (prop: any) => {
                this.selectedResource = prop;
            },
            () => { }
        )
    }

    private selectClass() {
        this.browsingModals.browseClassTree("Select a class", [RDF.property, OWL.class, OWL.thing]).then(
            (cls: any) => {
                this.selectedResource = cls;
            },
            () => { }
        )
    }

    private selectFormColl(formColl: FormCollection) {
        this.selectedFormColl = formColl;
    }

    ok(event: Event) {
        event.stopPropagation();
        this.dialog.close({ resource: this.selectedResource, formCollection: this.selectedFormColl.getId() });
    }

    cancel() {
        this.dialog.dismiss();
    }
}