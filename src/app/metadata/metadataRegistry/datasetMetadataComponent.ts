import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTLiteral, ARTURIResource } from 'src/app/models/ARTResources';
import { MdrVoc } from 'src/app/models/Vocabulary';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { CreationModalServices } from 'src/app/widget/modal/creationModal/creationModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';
import { LocalizedMap } from 'src/app/widget/modal/sharedModal/localizedEditorModal/localizedEditorModal';
import { SharedModalServices } from 'src/app/widget/modal/sharedModal/sharedModalServices';
import { DatasetMetadata, DatasetMetadata2 } from "../../models/Metadata";
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

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalServices, private creationModals: CreationModalServices, private sharedModals: SharedModalServices) { }

    ngOnChanges(changes: SimpleChanges) {
        // if (changes['dataset'] && changes['dataset'].currentValue) {
        //     if (this.dataset.nature != DatasetNature.ABSTRACT) {
        //         this.initDatasetMetadata();
        //     }
        // }
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
    //         () => {
    //             this.update.emit();
    //         }
    //     );
    // }

    // onTitleChanged(index: number, newValue: ARTLiteral) {
    //     this.metadataRegistryService.setTitle(this.dataset.identity, newValue).subscribe(
    //         () => {
    //             this.dataset.titles[index] = newValue;
    //             this.update.emit();
    //         }
    //     );
    // }

    changeDescription(index: number) {
        let oldDescr = this.dataset.descriptions[index];
        this.creationModals.newPlainLiteral({ key: "COMMONS.TITLE" }, null, false, oldDescr.getLang(), true).then(
            newDescr => {
                this.metadataRegistryService.setDescription(this.dataset.identity, newDescr).subscribe(
                    () => {
                        this.dataset.descriptions[index] = newDescr;
                        this.update.emit();
                    }
                );
            }
        );
    }
    
    editTitles() {
        let localizedMap: LocalizedMap = {};
        this.dataset.titles.forEach(t => { localizedMap[t.getLang()] = t.getValue(); });
        this.sharedModals.localizedEditor({ key: "COMMONS.TITLE" }, localizedMap).then(
            (newLocalizedMap: LocalizedMap) => {
                let toUpdate: ARTLiteral[] = [];
                for (let lang in newLocalizedMap) {
                    let old = this.dataset.titles.find(t => t.getLang() == lang);
                    if (old == null || old.getValue() != newLocalizedMap[lang]) {
                        toUpdate.push(new ARTLiteral(newLocalizedMap[lang], null, lang));
                    }
                }
                let toDelete: ARTLiteral[] = [];
                this.dataset.titles.forEach(t => {
                    if (newLocalizedMap[t.getLang()] == null) {
                        toDelete.push(t);
                    }
                });
            }
        );
    }

    editDescriptions() {
        let localizedMap: LocalizedMap = {};
        this.dataset.descriptions.forEach(d => { localizedMap[d.getLang()] = d.getValue(); });
        this.sharedModals.localizedEditor({ key: "COMMONS.DESCRIPTION" }, localizedMap, true).then(
            (newLocalizedMap: LocalizedMap) => {
                let toUpdate: ARTLiteral[] = [];
                for (let lang in newLocalizedMap) {
                    let old = this.dataset.descriptions.find(d => d.getLang() == lang);
                    if (old == null || old.getValue() != newLocalizedMap[lang]) {
                        toUpdate.push(new ARTLiteral(newLocalizedMap[lang], null, lang));
                    }
                }
                let toDelete: ARTLiteral[] = [];
                this.dataset.descriptions.forEach(d => {
                    if (newLocalizedMap[d.getLang()] == null) {
                        toDelete.push(d);
                    }
                });
            }
        );
    }

    // editDescription(index: number) {
    //     let editingDescr = this.dataset.descriptions[index];
    //     editingDescr['backup'] = editingDescr.clone();
    //     editingDescr['editing'] = true;

    // }
    // confirmEditDescription(index: number) {
    //     let descr = this.dataset.descriptions[index];
    //     this.metadataRegistryService.setDescription(this.dataset.identity, descr).subscribe(
    //         () => {
    //             descr['editing'] = false;
    //             this.update.emit();
    //         }
    //     );
    // }
    // cancelEditDescription(index: number) {
    //     let descr = this.dataset.descriptions[index];
    //     this.dataset.descriptions[index] = descr['backup'];
    // }

    // onDescriptionChanged(index: number, newLit: ARTLiteral) {
    //     let descr = this.dataset.descriptions[index];
    //     descr.setLang(newLit.getLang());
    //     descr.setValue(newLit.getValue());
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
        this.metadataRegistryService.setSPARQLEndpoint(this.datasetMetadata.identity, sparqlEndpoint).subscribe(
            () => {
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
