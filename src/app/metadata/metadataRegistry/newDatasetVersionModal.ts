import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "../../models/ARTResources";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";

@Component({
    selector: "dataset-version-modal",
    templateUrl: "./newDatasetVersionModal.html",
})
export class NewDatasetVersionModal {
    @Input() catalogRecordIdentity: string;

    dataset: string;
    versionInfo: string;
    
    constructor(public activeModal: NgbActiveModal, private metadataRegistryService: MetadataRegistryServices) {}
    
    isInputValid() {
        return this.versionInfo != null && this.versionInfo.trim() != "";
    }

    ok() {
        let datasetPar: ARTURIResource = null;
        if (this.dataset != null) {
            datasetPar = new ARTURIResource(this.dataset);
        }

        this.metadataRegistryService.addDatasetVersion(new ARTURIResource(this.catalogRecordIdentity), this.versionInfo, datasetPar).subscribe(
            stReps => {
                this.activeModal.close();
            }
        )
    }

    cancel() {
        this.activeModal.dismiss();
    }

}