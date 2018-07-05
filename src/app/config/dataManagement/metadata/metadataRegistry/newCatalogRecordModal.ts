import { Component } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { ARTURIResource } from "../../../../models/ARTResources";
import { MetadataRegistryServices } from "../../../../services/metadataRegistryServices";

export class NewCatalogRecordModalData extends BSModalContext {
    constructor(public title: string) {
        super();
    }
}

@Component({
    selector: "catalog-record-modal",
    templateUrl: "./newCatalogRecordModal.html",
})
export class NewCatalogRecordModal implements ModalComponent<NewCatalogRecordModalData> {
    context: NewCatalogRecordModalData;

    private dereferenceableValues: { label: string, value: any }[] = [
        { label: "Unknown", value: null },
        { label: "Yes", value: true },
        { label: "No", value: false }
    ];

    private dataset: string;
    private uriSpace: string;
    private title: string;
    private dereferenceable: { label: string, value: any } = this.dereferenceableValues[0];
    private sparqlEndpoint: string;

    constructor(public dialog: DialogRef<NewCatalogRecordModalData>, private metadataRegistryService: MetadataRegistryServices) {
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
        let dereferenceablePar: boolean = this.dereferenceable.value;

        this.metadataRegistryService.addDataset(this.uriSpace, datasetPar, this.title, sparqlEndpointPar, dereferenceablePar).subscribe(
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