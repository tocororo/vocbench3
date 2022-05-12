import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTURIResource } from 'src/app/models/ARTResources';
import { MdrVoc } from 'src/app/models/Vocabulary';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { ModalType } from 'src/app/widget/modal/Modals';
import { DatasetMetadata, DatasetMetadata2, DatasetNature } from "../../models/Metadata";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "dataset-metadata",
    templateUrl: "./datasetMetadataComponent.html",
})
export class DatasetMetadataComponent {

    @Input() dataset: DatasetMetadata2;

    datasetMetadata: DatasetMetadata;
    @Output() update = new EventEmitter();

    private dereferUnknown: string = "Unknown";
    private dereferYes: string = "Yes";
    private dereferNo: string = "No";

    dereferenciationValues: string[] = [this.dereferUnknown, this.dereferYes, this.dereferNo];
    dereferenciationNormalized: string;

    sparqlLimitations: boolean;

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset'] && changes['dataset'].currentValue) {
            if (this.dataset.nature != DatasetNature.ABSTRACT) {
                this.initDatasetMetadata();
            }
        }
    }

    private initDatasetMetadata() {
        this.metadataRegistryService.getDatasetMetadata(this.dataset.identity).subscribe(
            datasetMetadata => {
                this.datasetMetadata = datasetMetadata;

                // normalize dereferenciation
                if (this.datasetMetadata.dereferenciationSystem == null) {
                    this.dereferenciationNormalized = this.dereferUnknown;
                } else if (this.datasetMetadata.dereferenciationSystem == MdrVoc.standardDereferenciation.getURI()) {
                    this.dereferenciationNormalized = this.dereferYes;
                } else if (this.datasetMetadata.dereferenciationSystem == MdrVoc.noDereferenciation.getURI()) {
                    this.dereferenciationNormalized = this.dereferNo;
                } else {
                    this.dereferenciationValues.push(this.datasetMetadata.dereferenciationSystem);
                    this.dereferenciationNormalized = this.datasetMetadata.dereferenciationSystem;
                }
                // normalize limitation
                this.sparqlLimitations = false;
                if (this.datasetMetadata.sparqlEndpointMetadata.limitations != null) {
                    this.sparqlLimitations = this.datasetMetadata.sparqlEndpointMetadata.limitations.indexOf(MdrVoc.noAggregation.toNT()) != -1;
                }
            }
        );
    }

    // updateTitle(newValue: string) {
    //     let title: string = null;
    //     if (newValue != null && newValue.trim() != "") {
    //         title = newValue;
    //     }
    //     this.metadataRegistryService.setTitle(this.dataset.identity, title).subscribe(
    //         stResp => {
    //             this.update.emit();
    //         }
    //     );
    // }

    updateSparqlEndpoint(newValue: string) {
        let sparqlEndpoint: ARTURIResource;
        if (newValue != null && newValue.trim() != "") {
            if (ResourceUtils.testIRI(newValue)) {
                sparqlEndpoint = new ARTURIResource(newValue);
            } else { //invalid IRI
                this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_IRI", params: { iri: newValue } }, ModalType.warning);
                //restore old id
                let backupId: string = this.datasetMetadata.sparqlEndpointMetadata.id;
                this.datasetMetadata.sparqlEndpointMetadata.id = null + "new";
                setTimeout(() => {
                    this.datasetMetadata.sparqlEndpointMetadata.id = backupId;
                });
                return;
            }
        }
        this.metadataRegistryService.setSPARQLEndpoint(this.datasetMetadata.distribution, sparqlEndpoint).subscribe(
            stResp => {
                this.initDatasetMetadata();
                this.update.emit();
            }
        );
    }

    updateDerefSystem(newValue: string) {
        let dereferenciablePar: boolean;
        if (newValue == this.dereferUnknown) {
            dereferenciablePar = null;
        } else if (newValue == this.dereferYes) {
            dereferenciablePar = true;
        } else if (newValue == this.dereferNo) {
            dereferenciablePar = false;
        } else { //custom choice, available only if it was already the dereferenciationSystem, so it wasn't canged
            return;
        }
        this.metadataRegistryService.setDereferenciability(this.datasetMetadata.identity, dereferenciablePar).subscribe(
            () => {
                this.update.emit();
            }
        );
    }

    updateSparqlLimitations() {
        if (this.sparqlLimitations) {
            this.metadataRegistryService.setSPARQLEndpointLimitation(new ARTURIResource(this.datasetMetadata.sparqlEndpointMetadata.id), MdrVoc.noAggregation).subscribe(
                stResp => {
                    this.update.emit();
                }
            );
        } else {
            this.metadataRegistryService.removeSPARQLEndpointLimitation(new ARTURIResource(this.datasetMetadata.sparqlEndpointMetadata.id), MdrVoc.noAggregation).subscribe(
                stResp => {
                    this.update.emit();
                }
            );
        }

    }












    //////

    // @Input() dataset: DatasetMetadata;
    // @Input() version: boolean = false; //tells if the DatasetMetadata represents a version. This deteremines whether to show/hide the "Version Info"
    // @Output() update = new EventEmitter();

    // private dereferUnknown: string = "Unknown";
    // private dereferYes: string = "Yes";
    // private dereferNo: string = "No";

    // dereferenciationValues: string[] = [this.dereferUnknown, this.dereferYes, this.dereferNo];
    // dereferenciationNormalized: string;

    // sparqlLimitations: boolean;

    // constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalServices) { }

    // ngOnChanges(changes: SimpleChanges) {
    //     if (changes['dataset'] && changes['dataset'].currentValue) {
    //         //normalize dereferenciation
    //         if (this.dataset.dereferenciationSystem == null) {
    //             this.dereferenciationNormalized = this.dereferUnknown;
    //         } else if (this.dataset.dereferenciationSystem == MdrVoc.standardDereferenciation.getURI()) {
    //             this.dereferenciationNormalized = this.dereferYes;
    //         } else if (this.dataset.dereferenciationSystem == MdrVoc.noDereferenciation.getURI()) {
    //             this.dereferenciationNormalized = this.dereferNo;
    //         } else {
    //             this.dereferenciationValues.push(this.dataset.dereferenciationSystem);
    //             this.dereferenciationNormalized = this.dataset.dereferenciationSystem;
    //         }
    //         //normalize limitation
    //         this.sparqlLimitations = false;
    //         if (this.dataset.sparqlEndpointMetadata.limitations != null) {
    //             this.sparqlLimitations = this.dataset.sparqlEndpointMetadata.limitations.indexOf(MdrVoc.noAggregation.toNT()) != -1;
    //         }
    //     }
    // }

    // updateTitle(newValue: string) {
    //     let title: string = null;
    //     if (newValue != null && newValue.trim() != "") {
    //         title = newValue;
    //     }
    //     this.metadataRegistryService.setTitle(new ARTURIResource(this.dataset.identity), title).subscribe(
    //         stResp => {
    //             this.update.emit();
    //         }
    //     );
    // }

    // updateSparqlEndpoint(newValue: string) {
    //     let sparqlEndpoint: ARTURIResource;
    //     if (newValue != null && newValue.trim() != "") {
    //         if (ResourceUtils.testIRI(newValue)) {
    //             sparqlEndpoint = new ARTURIResource(newValue);
    //         } else { //invalid IRI
    //             this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_IRI", params: { iri: newValue } }, ModalType.warning);
    //             //restore old id
    //             let backupId: string = this.dataset.sparqlEndpointMetadata.id;
    //             this.dataset.sparqlEndpointMetadata.id = null + "new";
    //             setTimeout(() => {
    //                 this.dataset.sparqlEndpointMetadata.id = backupId;
    //             });
    //             return;
    //         }
    //     }
    //     this.metadataRegistryService.setSPARQLEndpoint(new ARTURIResource(this.dataset.identity), sparqlEndpoint).subscribe(
    //         stResp => {
    //             this.update.emit();
    //         }
    //     );
    // }

    // updateDerefSystem(newValue: string) {
    //     let dereferenciablePar: boolean;
    //     if (newValue == this.dereferUnknown) {
    //         dereferenciablePar = null;
    //     } else if (newValue == this.dereferYes) {
    //         dereferenciablePar = true;
    //     } else if (newValue == this.dereferNo) {
    //         dereferenciablePar = false;
    //     } else { //custom choice, available only if it was already the dereferenciationSystem, so it wasn't canged
    //         return;
    //     }
    //     this.metadataRegistryService.setDereferenciability(new ARTURIResource(this.dataset.identity), dereferenciablePar).subscribe(
    //         () => {
    //             this.update.emit();
    //         }
    //     );
    // }

    // updateSparqlLimitations() {
    //     if (this.sparqlLimitations) {
    //         this.metadataRegistryService.setSPARQLEndpointLimitation(new ARTURIResource(this.dataset.sparqlEndpointMetadata.id), MdrVoc.noAggregation).subscribe(
    //                 stResp => {
    //                     this.update.emit();
    //                 }
    //             );
    //     } else {
    //         this.metadataRegistryService.removeSPARQLEndpointLimitation(new ARTURIResource(this.dataset.sparqlEndpointMetadata.id), MdrVoc.noAggregation).subscribe(
    //                 stResp => {
    //                     this.update.emit();
    //                 }
    //             );
    //     }

    // }

}
