import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "../../models/ARTResources";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";

@Component({
    selector: "catalog-record-modal",
    templateUrl: "./newCatalogRecordModal.html",
})
export class NewCatalogRecordModal {
    @Input() title: string;

    dereferenceableValues: { label: string, value: any }[] = [
        { label: "Unknown", value: null },
        { label: "Yes", value: true },
        { label: "No", value: false }
    ];

    dataset: string;
    uriSpace: string;
    recordTitle: string;
    dereferenceable: { label: string, value: any } = this.dereferenceableValues[0];
    sparqlEndpoint: string;

    constructor(public activeModal: NgbActiveModal, private metadataRegistryService: MetadataRegistryServices) {}

    
    isInputValid() {
        return this.uriSpace != null && this.uriSpace.trim() != "";
    }

    ok() {
        let datasetPar: ARTURIResource = null;
        if (this.dataset != null && this.dataset.trim() != "") {
            datasetPar = new ARTURIResource(this.dataset);
        }
        let sparqlEndpointPar: ARTURIResource = null;
        if (this.sparqlEndpoint != null) {
            sparqlEndpointPar = new ARTURIResource(this.sparqlEndpoint);
        }
        let dereferenceablePar: boolean = this.dereferenceable.value;

        this.metadataRegistryService.addDataset(this.uriSpace, datasetPar, this.recordTitle, sparqlEndpointPar, dereferenceablePar).subscribe(
            () => {
                this.activeModal.close();
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}