import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { OntoLex, RDFS, SKOS, SKOSXL } from "../../models/Vocabulary";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "embedded-lexicalization-modal",
    templateUrl: "./newEmbeddedLexicalizationModal.html",
})
export class NewEmbeddedLexicalizationModal {
    @Input() catalogRecordIdentity: string;

    lexicalModelList = [
        { value: RDFS.uri, label: "RDFS" },
        { value: SKOS.uri, label: "SKOS" },
        { value: SKOSXL.uri, label: "SKOSXL" },
        { value: OntoLex.uri, label: "OntoLex" }
    ];

    lexicalizationSet: string;
    lexiconDataset: string;
    lexicalizationModel: string = this.lexicalModelList[0].value;
    language: string;
    references: number;
    lexicalEntries: number;
    lexicalizations: number;
    percentage: number;
    avgNumOfLexicalizations: number;

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalServices, private metadataRegistryService: MetadataRegistryServices) { }

    isInputValid() {
        return this.language != null && this.language.trim() != "";
    }

    ok() {
        let lexicalizationSetPar: ARTURIResource;
        let lexiconDatasetPar: ARTURIResource;

        if (this.lexicalizationSet != null) {
            if (ResourceUtils.testIRI(this.lexicalizationSet)) {
                lexicalizationSetPar = new ARTURIResource(this.lexicalizationSet);
            } else {
                this.basicModals.alert("Invalid data", "'" + this.lexicalizationSet + "' is not a valid IRI", ModalType.warning);
                return;
            }
        }
        if (this.lexiconDataset != null) {
            if (ResourceUtils.testIRI(this.lexiconDataset)) {
                lexiconDatasetPar = new ARTURIResource(this.lexiconDataset);
            } else {
                this.basicModals.alert("Invalid data", "'" + this.lexiconDataset + "' is not a valid IRI", ModalType.warning);
                return;
            }
        }

        let langRegexp = new RegExp("^[a-z]{2,3}(?:-[A-Z]{2,3}(?:-[a-zA-Z]{4})?)?$");
        if (!langRegexp.test(this.language)) {
            this.basicModals.alert("Invalid data", "'" + this.language + "' is not a valid language tag", ModalType.warning);
            return;
        }

        this.metadataRegistryService.addEmbeddedLexicalizationSet(new ARTURIResource(this.catalogRecordIdentity), 
            new ARTURIResource(this.lexicalizationModel), this.language, lexicalizationSetPar, lexiconDatasetPar, 
            this.references, this.lexicalEntries, this.lexicalizations, this.percentage, this.avgNumOfLexicalizations).subscribe(
            stReps => {
                this.activeModal.close();
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}