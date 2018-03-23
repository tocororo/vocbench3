import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ARTURIResource } from "../../../../models/ARTResources";
import { MetadataRegistryServices } from "../../../../services/metadataRegistryServices";

export class NewDatasetVersionModalData extends BSModalContext {
    constructor(public catalogRecordIdentity: string) {
        super();
    }
}

@Component({
    selector: "dataset-version-modal",
    templateUrl: "./newDatasetVersionModal.html",
})
export class NewDatasetVersionModal implements ModalComponent<NewDatasetVersionModalData> {
    context: NewDatasetVersionModalData;

    private dataset: string;
    private versionInfo: string;
    
    constructor(public dialog: DialogRef<NewDatasetVersionModalData>, private metadataRegistryService: MetadataRegistryServices) {
        this.context = dialog.context;
    }
    
    private isInputValid() {
        return this.versionInfo != null && this.versionInfo.trim() != "";
    }

    ok(event: Event) {
        let datasetPar: ARTURIResource = null;
        if (this.dataset != null) {
            datasetPar = new ARTURIResource(this.dataset);
        }

        this.metadataRegistryService.addDatasetVersion(new ARTURIResource(this.context.catalogRecordIdentity), this.versionInfo, datasetPar).subscribe(
            stReps => {
                event.stopPropagation();
                event.preventDefault();
                this.dialog.close();
            }
        )
    }

    cancel() {
        this.dialog.dismiss();
    }

}