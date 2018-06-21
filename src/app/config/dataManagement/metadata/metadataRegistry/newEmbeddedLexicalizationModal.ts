import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ARTURIResource, ResourceUtils } from "../../../../models/ARTResources";
import { MetadataRegistryServices } from "../../../../services/metadataRegistryServices";
import { RDF, RDFS, SKOS, SKOSXL, OntoLex } from "../../../../models/Vocabulary";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";

export class NewEmbeddedLexicalizationModalData extends BSModalContext {
    constructor(public catalogRecordIdentity: string) {
        super();
    }
}


@Component({
    selector: "embedded-lexicalization-modal",
    templateUrl: "./newEmbeddedLexicalizationModal.html",
})
export class NewEmbeddedLexicalizationModal implements ModalComponent<NewEmbeddedLexicalizationModalData> {
    context: NewEmbeddedLexicalizationModalData;

    private lexicalModelList = [
        { value: RDFS.uri, label: "RDFS" },
        { value: SKOS.uri, label: "SKOS" },
        { value: SKOSXL.uri, label: "SKOSXL" },
        { value: OntoLex.uri, label: "OntoLex" }
    ];

    private lexicalizationSet: string;
    private lexiconDataset: string;
    private lexicalizationModel: string = this.lexicalModelList[0].value;
    private language: string;
    private references: number;
    private lexicalEntries: number;
    private lexicalizations: number;
    private percentage: number;
    private avgNumOfLexicalizations: number;

    constructor(public dialog: DialogRef<NewEmbeddedLexicalizationModalData>, private basicModals: BasicModalServices,
        private metadataRegistryService: MetadataRegistryServices) {
        this.context = dialog.context;
    }

    private isInputValid() {
        return this.language != null && this.language.trim() != "";
    }

    ok(event: Event) {
        let lexicalizationSetPar: ARTURIResource;
        let lexiconDatasetPar: ARTURIResource;

        if (this.lexicalizationSet != null) {
            if (ResourceUtils.testIRI(this.lexicalizationSet)) {
                lexicalizationSetPar = new ARTURIResource(this.lexicalizationSet);
            } else {
                this.basicModals.alert("Invalid data", "'" + this.lexicalizationSet + "' is not a valid IRI", "warning");
                return;
            }
        }
        if (this.lexiconDataset != null) {
            if (ResourceUtils.testIRI(this.lexiconDataset)) {
                lexiconDatasetPar = new ARTURIResource(this.lexiconDataset);
            } else {
                this.basicModals.alert("Invalid data", "'" + this.lexiconDataset + "' is not a valid IRI", "warning");
                return;
            }
        }

        let langRegexp = new RegExp("^[a-z]{2,3}(?:-[A-Z]{2,3}(?:-[a-zA-Z]{4})?)?$");
        if (!langRegexp.test(this.language)) {
            this.basicModals.alert("Invalid data", "'" + this.language + "' is not a valid language tag", "warning");
            return;
        }

        this.metadataRegistryService.addEmbeddedLexicalizationSets(new ARTURIResource(this.context.catalogRecordIdentity), 
            new ARTURIResource(this.lexicalizationModel), this.language, lexicalizationSetPar, lexiconDatasetPar, 
            this.references, this.lexicalEntries, this.lexicalizations, this.percentage, this.avgNumOfLexicalizations).subscribe(
            stReps => {
                event.stopPropagation();
                event.preventDefault();
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}