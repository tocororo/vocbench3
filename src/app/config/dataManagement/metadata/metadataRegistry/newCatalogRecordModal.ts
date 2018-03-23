import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ARTURIResource } from "../../../../models/ARTResources";
import { MetadataRegistryServices } from "../../../../services/metadataRegistryServices";


@Component({
    selector: "catalog-record-modal",
    templateUrl: "./newCatalogRecordModal.html",
})
export class NewCatalogRecordModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private dataset: string;
    private uriSpace: string;
    private title: string;
    private dereferenceable: boolean;
    private sparqlEndpoint: string;
    
    constructor(public dialog: DialogRef<BSModalContext>, private metadataRegistryService: MetadataRegistryServices) {
        this.context = dialog.context;
    }
    
    private isInputValid() {
        return this.uriSpace != null && this.uriSpace.trim() != "";
    }

    ok(event: Event) {
        let datasetPar: ARTURIResource = null;
        if (this.dataset != null) {
            datasetPar = new ARTURIResource(this.dataset);
        }
        let sparqlEndpointPar: ARTURIResource = null;
        if (this.sparqlEndpoint != null) {
            sparqlEndpointPar = new ARTURIResource(this.sparqlEndpoint);
        }

        this.metadataRegistryService.addDataset(this.uriSpace, datasetPar, this.title, sparqlEndpointPar, this.dereferenceable).subscribe(
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