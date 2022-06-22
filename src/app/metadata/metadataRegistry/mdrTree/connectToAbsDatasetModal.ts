import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ARTLiteral, ARTURIResource } from 'src/app/models/ARTResources';
import { LanguageUtils } from 'src/app/models/LanguagesCountries';
import { AbstractDatasetAttachment, CatalogRecord2, DatasetNature } from 'src/app/models/Metadata';
import { Dcat, MdrVoc } from 'src/app/models/Vocabulary';
import { MetadataRegistryServices } from 'src/app/services/metadataRegistryServices';

@Component({
    selector: "connect-to-abs-dataset-modal",
    templateUrl: "./connectToAbsDatasetModal.html",
})
export class ConnectToAbsDatasetModal {
    @Input() concreteDataset: CatalogRecord2;

    datasetRelationOpts: { id: DatasetRelationEnum, uri: ARTURIResource, label: string }[] = [
        { id: DatasetRelationEnum.master, uri: MdrVoc.master, label: "Master" },
        { id: DatasetRelationEnum.lod, uri: MdrVoc.lod, label: "Lod" },
        { id: DatasetRelationEnum.version, uri: Dcat.hasVersion, label: "Has version" },
    ];

    abstractDatasets: CatalogRecord2[];
    abstractDatasetAttached: CatalogRecord2; //reference to abstract dataset identity
    
    absDatasetRelation: DatasetRelationEnum = this.datasetRelationOpts[0].id;
    versionInfo: string;
    versionNotes: ARTLiteral;

    constructor(public activeModal: NgbActiveModal, private metadataRegistryService: MetadataRegistryServices, private translate: TranslateService) {}

    ngOnInit() {
        this.metadataRegistryService.listRootDatasets().subscribe(
            datasets => {
                this.abstractDatasets = datasets.filter(d => d.dataset.nature == DatasetNature.ABSTRACT);
                this.abstractDatasets.forEach(d => {
                    d.dataset['localizedTitle'] = d.dataset.titles.length > 0 ? LanguageUtils.getLocalizedLiteral(d.dataset.titles, this.translate.currentLang).getValue() : d.dataset.uriSpace;
                });
                this.abstractDatasetAttached = this.abstractDatasets[0];
            }
        );
    }

    ok() {
        let datasetAttachment: AbstractDatasetAttachment = {
            abstractDataset: this.abstractDatasetAttached.dataset.identity.getURI(),
            relation: this.datasetRelationOpts.find(r => r.id == this.absDatasetRelation).uri,
        };
        if (this.absDatasetRelation == DatasetRelationEnum.version) {
            datasetAttachment.versionInfo = this.versionInfo;
            datasetAttachment.versionNotes = this.versionNotes;
        }
        this.metadataRegistryService.connectToAbstractDataset(this.concreteDataset.dataset.identity, datasetAttachment).subscribe(
            () => {
                this.activeModal.close();
            }
        );
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