import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTURIResource, ResourceUtils } from "../../../../models/ARTResources";
import { DatasetMetadata } from "../../../../models/Metadata";
import { SemanticTurkey } from "../../../../models/Vocabulary";
import { MetadataRegistryServices } from "../../../../services/metadataRegistryServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "dataset-metadata",
    templateUrl: "./datasetMetadataComponent.html",
})
export class DatasetMetadataComponent {

    @Input() dataset: DatasetMetadata;
    @Input() version: boolean = false; //tells if the DatasetMetadata represents a version. This deteremines whether to show/hide the "Version Info"
    @Output() update = new EventEmitter();

    private dereferUnknown: string = "Unknown";
    private dereferYes: string = "Yes";
    private dereferNo: string = "No";

    private dereferenciationValues: string[] = [this.dereferUnknown, this.dereferYes, this.dereferNo];
    private dereferenciationNormalized: string;

    private sparqlLimitations: boolean;

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset'] && changes['dataset'].currentValue) {
            //normalize dereferenciation
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
            //normalize limitation
            this.sparqlLimitations = false;
            if (this.dataset.sparqlEndpointMetadata.limitations != null) {
                this.sparqlLimitations = this.dataset.sparqlEndpointMetadata.limitations.indexOf("<" + SemanticTurkey.noAggregation + ">") != -1;
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
                this.update.emit();
            }
        );
    }

    private updateSparqlEndpoint(newValue: string) {
        let sparqlEndpoint: ARTURIResource;
        if (newValue != null && newValue.trim() != "") {
            if (ResourceUtils.testIRI(newValue)) {
                sparqlEndpoint = new ARTURIResource(newValue);
            } else { //invalid IRI
                this.basicModals.alert("Invalid SPARQL Endpoint", newValue + " is not a valid IRI", "warning");
                //restore old id
                let backupId: string = this.dataset.sparqlEndpointMetadata.id;
                this.dataset.sparqlEndpointMetadata.id = null + "new";
                setTimeout(() => {
                    this.dataset.sparqlEndpointMetadata.id = backupId;
                });
                return;
            }
        }
        this.metadataRegistryService.setSPARQLEndpoint(new ARTURIResource(this.dataset.identity), sparqlEndpoint).subscribe(
            stResp => {
                this.update.emit();
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
                this.update.emit();
            }
        )
    }

    private updateSparqlLimitations() {
        if (this.sparqlLimitations) {
            this.metadataRegistryService.setSPARQLEndpointLimitation(new ARTURIResource(this.dataset.sparqlEndpointMetadata.id), 
                new ARTURIResource(SemanticTurkey.noAggregation)).subscribe(
                stResp => {
                    this.update.emit();
                }
            );
        } else {
            this.metadataRegistryService.removeSPARQLEndpointLimitation(new ARTURIResource(this.dataset.sparqlEndpointMetadata.id), 
                new ARTURIResource(SemanticTurkey.noAggregation)).subscribe(
                stResp => {
                    this.update.emit();
                }
            );
        }
        
    }

}
