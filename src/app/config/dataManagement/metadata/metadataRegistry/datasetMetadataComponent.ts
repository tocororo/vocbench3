import { Component, Input, SimpleChanges } from "@angular/core";
import { DatasetMetadata } from "../../../../models/Metadata";
import { MetadataRegistryServices } from "../../../../services/metadataRegistryServices";
import { ARTURIResource } from "../../../../models/ARTResources";
import { SemanticTurkey } from "../../../../models/Vocabulary";

@Component({
    selector: "dataset-metadata",
    templateUrl: "./datasetMetadataComponent.html",
})
export class DatasetMetadataComponent {

    @Input() dataset: DatasetMetadata;
    @Input() version: boolean = false; //tells if the DatasetMetadata represents a version. This deteremines whether to show/hide the "Version Info"

    private dereferUnknown: string = "Unknown";
    private dereferYes: string = "Yes";
    private dereferNo: string = "No";

    private dereferenciationValues: string[] = [this.dereferUnknown, this.dereferYes, this.dereferNo];
    private dereferenciationNormalized: string;

    constructor(private metadataRegistryService: MetadataRegistryServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset'] && changes['dataset'].currentValue) {
            if (this.dataset.dereferenciationSystem == null) {
                this.dereferenciationNormalized = this.dereferUnknown;
            } else if (this.dataset.dereferenciationSystem == SemanticTurkey.standardDereferenciation) {
                this.dereferenciationNormalized = this.dereferYes;
            } else if (this.dataset.dereferenciationSystem == SemanticTurkey.noDereferenciation) {
                this.dereferenciationNormalized = this.dereferNo;
            } else {
                this.dereferenciationValues.push(this.dataset.dereferenciationSystem);
                this.dereferenciationNormalized = this.dataset.dereferenciationSystem;
            }
        }
    }

    private updateTitle(newValue: string) {
        let title: string = null;
        if (newValue != null && newValue.trim() != "") {
            title = newValue;
        }
        this.metadataRegistryService.setTitle(new ARTURIResource(this.dataset.identity), title).subscribe(
            stResp => {
                this.dataset.title = title;
            }
        );
    }

    private updateSparqlEndpoint(newValue: string) {
        let endpointPar: ARTURIResource;
        if (newValue != null && newValue.trim() != "") {
            endpointPar = new ARTURIResource(newValue);
        }
        this.metadataRegistryService.setSPARQLEndpoint(new ARTURIResource(this.dataset.identity), endpointPar).subscribe(
            stResp => {
                this.dataset.sparqlEndpoint = newValue;
            }
        );
    }

    private updateDerefSystem(newValue: string) {
        let dereferenciablePar: boolean;
        let newDereferenciable: string;
        if (newValue == this.dereferUnknown) {
            dereferenciablePar = null;
            newDereferenciable = null;
        } else if (newValue == this.dereferYes) {
            dereferenciablePar = true;
            newDereferenciable = SemanticTurkey.standardDereferenciation;
        } else if (newValue == this.dereferNo) {
            dereferenciablePar = false;
            newDereferenciable = SemanticTurkey.noDereferenciation;
        } else { //custom choice, available only if it was already the dereferenciationSystem, so it wasn't canged
            return;
        }
        this.metadataRegistryService.setDereferenciability(new ARTURIResource(this.dataset.identity), dereferenciablePar).subscribe(
            stResp => {
                this.dataset.dereferenciationSystem = newDereferenciable;
            }
        )
    }

}
