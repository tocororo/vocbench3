import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { ARTLiteral, ARTURIResource } from 'src/app/models/ARTResources';
import { LanguageUtils } from 'src/app/models/LanguagesCountries';
import { AbstractDatasetAttachment, CatalogRecord2, DatasetNature, Distribution } from 'src/app/models/Metadata';
import { Project } from 'src/app/models/Project';
import { Dcat, MdrVoc, StMdr } from 'src/app/models/Vocabulary';
import { MetadataRegistryServices } from 'src/app/services/metadataRegistryServices';
import { ProjectServices } from 'src/app/services/projectServices';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';

@Component({
    selector: "new-dataset-modal",
    templateUrl: "./newDatasetModal.html",
})
export class NewDatasetModal {
    @Input() title: string;
    @Input() mode: NewDatasetModeEnum;

    /** 
     * Commons stuff:
     * - create concrete dataset
     * - spawn abstract dataset (from 2 concrete datasets)
     */  
    datasetName: string;
    uriSpace: string;
    datasetTitle: ARTLiteral;
    description: ARTLiteral;

    dereferenceableOpts: { label: string, value: boolean }[] = [
        { label: "Unknown", value: null },
        { label: "Yes", value: true },
        { label: "No", value: false }
    ];
    dereferenceable: boolean = this.dereferenceableOpts[0].value;

    datasetRelationOpts: { id: DatasetRelationEnum, uri: ARTURIResource, label: string }[] = [
        { id: DatasetRelationEnum.master, uri: MdrVoc.master, label: "Master" },
        { id: DatasetRelationEnum.lod, uri: MdrVoc.lod, label: "Lod" },
        { id: DatasetRelationEnum.version, uri: Dcat.hasVersion, label: "Has version" },
    ];

    /**
     * Stuff for create concrete dataset
     */
    distributionNatureOpts: { id: DatasetNature, uri: ARTURIResource, label: string }[] = [
        { id: DatasetNature.PROJECT, uri: StMdr.Project, label: "Project" },
        { id: DatasetNature.RDF4J_REPOSITORY, uri: MdrVoc.RDF4JHTTPRepository, label: "RDF4J Http Repository" },
        { id: DatasetNature.GRAPHDB_REPOSITORY, uri: MdrVoc.GRAPHDBRepository, label: "GraphDB Repository" },
        { id: DatasetNature.SPARQL_ENDPOINT, uri: MdrVoc.SPARQLEndpoint, label: "SPARQL Endpoint" },
    ];
    distributionNature: DatasetNature = this.distributionNatureOpts[0].id;
    sparqlEndpoint: string;
    projects: Project[] = [];
    selectedProject: Project;

    attachToDataset: boolean = false;
    abstractDatasets: CatalogRecord2[];
    abstractDatasetAttached: CatalogRecord2; //reference to abstract dataset identity
    
    absDatasetRelation: DatasetRelationEnum = this.datasetRelationOpts[0].id;
    versionInfo: string;
    versionNotes: ARTLiteral;

    /**
     * Stuff for spawn abstract dataset
     */
    concreteDatasets: CatalogRecord2[];
    
    concreteDataset1: CatalogRecord2;
    dataset1Relation: DatasetRelationEnum = this.datasetRelationOpts[0].id;
    dataset1VersInfo: string;
    dataset1VersNotes: ARTLiteral;
    
    concreteDataset2: CatalogRecord2;
    dataset2Relation: DatasetRelationEnum = this.datasetRelationOpts[0].id;
    dataset2VersInfo: string;
    dataset2VersNotes: ARTLiteral;


    constructor(public activeModal: NgbActiveModal, private metadataRegistryService: MetadataRegistryServices, private projectService: ProjectServices, 
        private basicModals: BasicModalServices, private translate: TranslateService) {}

    ngOnInit() {
        this.projectService.listProjects().subscribe(
            projects => {
                this.projects = projects;
                this.selectedProject = this.projects[0];
            }
        );

        this.metadataRegistryService.listRootDatasets().subscribe(
            datasets => {
                this.abstractDatasets = datasets.filter(d => d.dataset.nature == DatasetNature.ABSTRACT);
                this.abstractDatasets.forEach(d => {
                    d.dataset['localizedTitle'] = LanguageUtils.getLocalizedLiteral(d.dataset.titles, this.translate.currentLang).getValue();
                });
                this.abstractDatasetAttached = this.abstractDatasets[0];

                this.concreteDatasets = datasets.filter(d => d.dataset.nature != DatasetNature.ABSTRACT);
                this.concreteDatasets.forEach(d => {
                    d.dataset['localizedTitle'] = LanguageUtils.getLocalizedLiteral(d.dataset.titles, this.translate.currentLang).getValue();
                });
            }
        );
    }


    
    isInputValid() {
        return this.datasetName != null && this.datasetName.trim() != "" && 
            this.uriSpace != null && this.uriSpace.trim() != "";
    }

    private createConcreteDataset(): Observable<ARTURIResource> {
        let distribution: Distribution = {
            nature: this.distributionNatureOpts.find(opt => opt.id == this.distributionNature).uri,
        };
        if (this.distributionNature == DatasetNature.PROJECT) {
            distribution.projectName = this.selectedProject.getName();
        } else {
            if (this.sparqlEndpoint == null) {
                this.basicModals.alert({ key: "STATUS.WARNING" }, {key: "You need to provide a valid SPARQL endpoint URL"}, ModalType.warning);
                return null;
            }
            distribution.sparqlEndpoint = this.sparqlEndpoint;
        }

        let abstractDatasetAttachment: AbstractDatasetAttachment;
        if (this.attachToDataset) {
            if (this.abstractDatasetAttached == null) {
                this.basicModals.alert({ key: "STATUS.WARNING" }, {key: "You need to select an abstract dataset to attach to"}, ModalType.warning);
                return null;
            }
            abstractDatasetAttachment = {
                abstractDataset: this.abstractDatasetAttached.dataset.identity.getURI(),
                relation: this.datasetRelationOpts.find(r => r.id == this.absDatasetRelation).uri,
            };
            if (this.absDatasetRelation == DatasetRelationEnum.version) {
                abstractDatasetAttachment.versionInfo = this.versionInfo;
                abstractDatasetAttachment.versionNotes = this.versionNotes;
            }
        }
        return this.metadataRegistryService.createConcreteDataset(this.datasetName, this.uriSpace, this.datasetTitle, this.description, this.dereferenceable, distribution, abstractDatasetAttachment);
    }

    private spawnAbstractDataset(): Observable<ARTURIResource> {
        if (this.concreteDataset1 == null || this.concreteDataset2 == null) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, {key: "You need to select two concrete dataset to spawn a new abstract dataset"}, ModalType.warning);
            return null;
        }
        let datasetAttachment1: AbstractDatasetAttachment = {
            abstractDataset: null,
            relation: this.datasetRelationOpts.find(r => r.id == this.dataset1Relation).uri,
        };
        if (this.dataset1Relation == DatasetRelationEnum.version) {
            datasetAttachment1.versionInfo = this.dataset1VersInfo;
            datasetAttachment1.versionNotes = this.dataset1VersNotes;
        }

        let datasetAttachment2: AbstractDatasetAttachment = {
            abstractDataset: null,
            relation: this.datasetRelationOpts.find(r => r.id == this.dataset2Relation).uri,
        };
        if (this.dataset2Relation == DatasetRelationEnum.version) {
            datasetAttachment2.versionInfo = this.dataset2VersInfo;
            datasetAttachment2.versionNotes = this.dataset2VersNotes;
        }

        return this.metadataRegistryService.spawnNewAbstractDataset(this.concreteDataset1.dataset.identity, datasetAttachment1,
            this.concreteDataset2.dataset.identity, datasetAttachment2, 
            this.datasetName, this.uriSpace, this.datasetTitle, this.description);
    }

    ok() {
        let createFn: Observable<any>;
        if (this.mode == NewDatasetModeEnum.createConcrete) {
            createFn = this.createConcreteDataset();
        } else {
            createFn = this.spawnAbstractDataset();
        }
        if (createFn != null) {
            createFn.subscribe(
                () => {
                    this.activeModal.close();
                }
            );
        }
        
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

enum DatasetRelationEnum {
    master = "master",
    lod = "lod",
    version = "version",
}

export enum NewDatasetModeEnum {
    createConcrete = "createConcrete",
    spawnAbstract = "spawnAbstract"
}