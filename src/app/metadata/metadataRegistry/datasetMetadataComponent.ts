import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTLiteral, ARTURIResource } from 'src/app/models/ARTResources';
import { MdrVoc } from 'src/app/models/Vocabulary';
import { AuthorizationEvaluator } from 'src/app/utils/AuthorizationEvaluator';
import { ResourceUtils } from 'src/app/utils/ResourceUtils';
import { VBActionsEnum } from 'src/app/utils/VBActions';
import { ModalType } from 'src/app/widget/modal/Modals';
import { LocalizedMap } from 'src/app/widget/modal/sharedModal/localizedEditorModal/localizedEditorModal';
import { SharedModalServices } from 'src/app/widget/modal/sharedModal/sharedModalServices';
import { DatasetMetadata2 } from "../../models/Metadata";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "dataset-metadata",
    templateUrl: "./datasetMetadataComponent.html",
})
export class DatasetMetadataComponent {

    @Input() dataset: DatasetMetadata2;

    // datasetMetadata: DatasetMetadata;
    @Output() update = new EventEmitter();

    private dereferUnknown: string = "Unknown";
    private dereferYes: string = "Yes";
    private dereferNo: string = "No";

    dereferenciationValues: string[] = [this.dereferUnknown, this.dereferYes, this.dereferNo];
    dereferenciationNormalized: string;

    sparqlLimitations: boolean;

    mdrUpdateAuthorized: boolean;

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices) { }

    ngOnInit() {
        this.mdrUpdateAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryUpdate);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['dataset'] && changes['dataset'].currentValue) {
            this.initDatasetMetadata();
        }
    }

    // private initDatasetMetadata() {
    //     this.metadataRegistryService.getDatasetMetadata(this.dataset.identity).subscribe(
    //         datasetMetadata => {
    //             this.datasetMetadata = datasetMetadata;

    //             // normalize dereferenciation
    //             if (this.datasetMetadata.dereferenciationSystem == null) {
    //                 this.dereferenciationNormalized = this.dereferUnknown;
    //             } else if (this.datasetMetadata.dereferenciationSystem == MdrVoc.standardDereferenciation.getURI()) {
    //                 this.dereferenciationNormalized = this.dereferYes;
    //             } else if (this.datasetMetadata.dereferenciationSystem == MdrVoc.noDereferenciation.getURI()) {
    //                 this.dereferenciationNormalized = this.dereferNo;
    //             } else {
    //                 this.dereferenciationValues.push(this.datasetMetadata.dereferenciationSystem);
    //                 this.dereferenciationNormalized = this.datasetMetadata.dereferenciationSystem;
    //             }
    //             // normalize limitation
    //             this.sparqlLimitations = false;
    //             if (this.datasetMetadata.sparqlEndpointMetadata.limitations != null) {
    //                 this.sparqlLimitations = this.datasetMetadata.sparqlEndpointMetadata.limitations.indexOf(MdrVoc.noAggregation.toNT()) != -1;
    //             }
    //         }
    //     );
    // }

    private initDatasetMetadata() {
        // normalize dereferenciation
        if (this.dataset.dereferenciationSystem == null) {
            this.dereferenciationNormalized = this.dereferUnknown;
        } else if (this.dataset.dereferenciationSystem == MdrVoc.standardDereferenciation.getURI()) {
            this.dereferenciationNormalized = this.dereferYes;
        } else if (this.dataset.dereferenciationSystem == MdrVoc.noDereferenciation.getURI()) {
            this.dereferenciationNormalized = this.dereferNo;
        } else {
            this.dereferenciationValues.push(this.dataset.dereferenciationSystem);
            this.dereferenciationNormalized = this.dataset.dereferenciationSystem;
        }
        // normalize limitation
        this.sparqlLimitations = false;
        if (this.dataset.sparqlEndpoint.limitations != null) {
            this.sparqlLimitations = this.dataset.sparqlEndpoint.limitations.indexOf(MdrVoc.noAggregation.getURI()) != -1;
        }
    }

    editTitles() {
        let localizedMap: LocalizedMap = new Map();
        this.dataset.titles.forEach(t => { localizedMap.set(t.getLang(), t.getValue()); });
        this.sharedModals.localizedEditor({ key: "COMMONS.TITLE" }, localizedMap).then(
            (newLocalizedMap: LocalizedMap) => {
                let toUpdate: ARTLiteral[] = [];
                newLocalizedMap.forEach((title, lang) => {
                    let old = this.dataset.titles.find(t => t.getLang() == lang);
                    if (old == null || old.getValue() != title) {
                        toUpdate.push(new ARTLiteral(title, null, lang));
                    }
                });
                let toDelete: ARTLiteral[] = [];
                this.dataset.titles.forEach(t => {
                    if (newLocalizedMap.get(t.getLang()) == null) {
                        toDelete.push(t);
                    }
                });
                if (toUpdate.length > 0) {
                    let updateFn: Observable<void>[] = toUpdate.map(t => {
                        return this.metadataRegistryService.setTitle(this.dataset.identity, t).pipe(
                            map(() => {
                                let updatedIdx = this.dataset.titles.findIndex(title => title.getLang() == t.getLang());
                                if (updatedIdx == -1) {
                                    this.dataset.titles.push(t); //new
                                } else {
                                    this.dataset.titles[updatedIdx] = t; //updated
                                }
                            })
                        );
                    });
                    forkJoin(updateFn).subscribe();
                }
                if (toDelete.length > 0) {
                    let removeFn: Observable<void>[] = toDelete.map(t => {
                        return this.metadataRegistryService.deleteTitle(this.dataset.identity, t).pipe(
                            map(() => {
                                this.dataset.titles.splice(this.dataset.titles.indexOf(t), 1);
                            })
                        );
                    });
                    forkJoin(removeFn).subscribe();
                }
            },
            () => { }
        );
    }

    editDescriptions() {
        let localizedMap: LocalizedMap = new Map();
        this.dataset.descriptions.forEach(d => { localizedMap.set(d.getLang(), d.getValue()); });
        this.sharedModals.localizedEditor({ key: "COMMONS.DESCRIPTION" }, localizedMap, true).then(
            (newLocalizedMap: LocalizedMap) => {
                let toUpdate: ARTLiteral[] = [];
                newLocalizedMap.forEach((descr, lang) => {
                    let old = this.dataset.descriptions.find(d => d.getLang() == lang);
                    if (old == null || old.getValue() != descr) {
                        toUpdate.push(new ARTLiteral(descr, null, lang));
                    }
                });
                let toDelete: ARTLiteral[] = [];
                this.dataset.descriptions.forEach(d => {
                    if (newLocalizedMap.get(d.getLang()) == null) {
                        toDelete.push(d);
                    }
                });
                if (toUpdate.length > 0) {
                    let updateFn: Observable<void>[] = toUpdate.map(d => {
                        return this.metadataRegistryService.setDescription(this.dataset.identity, d).pipe(
                            map(() => {
                                let updatedIdx = this.dataset.descriptions.findIndex(descr => descr.getLang() == d.getLang());
                                if (updatedIdx == -1) {
                                    this.dataset.descriptions.push(d); //new
                                } else {
                                    this.dataset.descriptions[updatedIdx] = d; //updated
                                }
                            })
                        );
                    });
                    forkJoin(updateFn).subscribe();
                }
                if (toDelete.length > 0) {
                    let removeFn: Observable<void>[] = toDelete.map(d => {
                        return this.metadataRegistryService.deleteDescription(this.dataset.identity, d).pipe(
                            map(() => {
                                this.dataset.descriptions.splice(this.dataset.descriptions.indexOf(d), 1);
                            })
                        );
                    });
                    forkJoin(removeFn).subscribe();
                }
            },
            () => { }
        );
    }


    updateSparqlEndpoint(newValue: string) {
        let sparqlEndpoint: ARTURIResource;
        if (newValue != null && newValue.trim() != "") {
            if (ResourceUtils.testIRI(newValue)) {
                sparqlEndpoint = new ARTURIResource(newValue);
            } else { //invalid IRI
                this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.INVALID_IRI", params: { iri: newValue } }, ModalType.warning);
                //restore old id
                let backupId: string = this.dataset.sparqlEndpoint.id;
                this.dataset.sparqlEndpoint.id = null + "new";
                setTimeout(() => {
                    this.dataset.sparqlEndpoint.id = backupId;
                });
                return;
            }
        }
        this.metadataRegistryService.setSPARQLEndpoint(this.dataset.identity, sparqlEndpoint).subscribe(
            () => {
                if (this.dataset.sparqlEndpoint) {
                    this.dataset.sparqlEndpoint.id = sparqlEndpoint.getURI();
                } else {
                    this.dataset.sparqlEndpoint = {
                        id: sparqlEndpoint.getURI(),
                    };
                }
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
        this.metadataRegistryService.setDereferenciability(this.dataset.identity, dereferenciablePar).subscribe(
            () => {
                this.dataset.dereferenciationSystem = newValue;
                this.initDatasetMetadata();
                this.update.emit();
            }
        );
    }

    updateSparqlLimitations() {
        if (this.sparqlLimitations) {
            this.metadataRegistryService.setSPARQLEndpointLimitation(new ARTURIResource(this.dataset.sparqlEndpoint.id), MdrVoc.noAggregation).subscribe(
                () => {
                    this.dataset.sparqlEndpoint.limitations = [MdrVoc.noAggregation.getURI()];
                    this.initDatasetMetadata();
                    this.update.emit();
                }
            );
        } else {
            this.metadataRegistryService.removeSPARQLEndpointLimitation(new ARTURIResource(this.dataset.sparqlEndpoint.id), MdrVoc.noAggregation).subscribe(
                () => {
                    this.dataset.sparqlEndpoint.limitations.splice(this.dataset.sparqlEndpoint.limitations.indexOf(MdrVoc.noAggregation.getURI()), 1);
                    this.initDatasetMetadata();
                    this.update.emit();
                }
            );
        }
    }

}
