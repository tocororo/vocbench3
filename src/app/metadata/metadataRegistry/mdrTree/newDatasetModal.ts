import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ARTLiteral, ARTURIResource } from 'src/app/models/ARTResources';
import { LanguageUtils } from 'src/app/models/LanguagesCountries';
import { AbstractDatasetAttachment, CatalogRecord2, DatasetNature, Distribution } from 'src/app/models/Metadata';
import { Project } from 'src/app/models/Project';
import { Dcat, MdrVoc, StMdr } from 'src/app/models/Vocabulary';
import { MetadataRegistryServices } from 'src/app/services/metadataRegistryServices';
import { ProjectServices } from 'src/app/services/projectServices';

@Component({
    selector: "new-dataset-modal",
    templateUrl: "./newDatasetModal.html",
})
export class NewDatasetModal {
    // @Input() abstractDatasets: CatalogRecord2[];

    datasetName: string;
    uriSpace: string;
    title: ARTLiteral;
    description: ARTLiteral;

    dereferenceableOpts: { label: string, value: boolean }[] = [
        { label: "Unknown", value: null },
        { label: "Yes", value: true },
        { label: "No", value: false }
    ];
    dereferenceable: boolean = this.dereferenceableOpts[0].value;
    
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
    absDatasetRelationOpts: { id: AbsDatasetRelationEnum, uri: ARTURIResource, label: string }[] = [
        { id: AbsDatasetRelationEnum.master, uri: MdrVoc.master, label: "Master" },
        { id: AbsDatasetRelationEnum.lod, uri: MdrVoc.lod, label: "Lod" },
        { id: AbsDatasetRelationEnum.version, uri: Dcat.hasVersion, label: "Has version" },
    ];
    absDatasetRelation: AbsDatasetRelationEnum = this.absDatasetRelationOpts[0].id;
    versionInfo: string;
    versionNotes: ARTLiteral;

    constructor(public activeModal: NgbActiveModal, private metadataRegistryService: MetadataRegistryServices, private projectService: ProjectServices, private translate: TranslateService) {}

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
            }
        );
    }


    
    isInputValid() {
        return this.datasetName != null && this.datasetName.trim() != "" && 
            this.uriSpace != null && this.uriSpace.trim() != "";
    }

    ok() {
        let distribution: Distribution = {
            nature: this.distributionNatureOpts.find(opt => opt.id == this.distributionNature).uri,
        };
        if (this.distributionNature == DatasetNature.PROJECT) {
            distribution.projectName = this.selectedProject.getName();
        } else {
            distribution.sparqlEndpoint = this.sparqlEndpoint;
        }

        let abstractDatasetAttachment: AbstractDatasetAttachment;
        if (this.attachToDataset) {
            abstractDatasetAttachment = {
                abstractDataset: this.abstractDatasetAttached.dataset.identity.getURI(),
                relation: this.absDatasetRelationOpts.find(r => r.id == this.absDatasetRelation).uri,
            };
            if (this.absDatasetRelation == AbsDatasetRelationEnum.version) {
                abstractDatasetAttachment.versionInfo = this.versionInfo;
                abstractDatasetAttachment.versionNotes = this.versionNotes;
            }
        }
        this.metadataRegistryService.createConcreteDataset(this.datasetName, this.uriSpace, this.title, this.description, this.dereferenceable, distribution, abstractDatasetAttachment).subscribe(
            () => {
                this.activeModal.close();
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

enum AbsDatasetRelationEnum {
    master = "master",
    lod = "lod",
    version = "version",
}