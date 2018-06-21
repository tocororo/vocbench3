import { Component, Input, SimpleChanges } from "@angular/core";
import { LexicalizationSetMetadata, DatasetMetadata } from "../../../../models/Metadata";
import { MetadataRegistryServices } from "../../../../services/metadataRegistryServices";
import { ARTURIResource, ResourceUtils } from "../../../../models/ARTResources";
import { RDFS, SKOS, SKOSXL, OntoLex } from "../../../../models/Vocabulary";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "lexicalization-set-metadata",
    templateUrl: "./lexicalizationSetMetadataComponent.html",
})
export class LexicalizationSetMetadataComponent {

    @Input() dataset: DatasetMetadata;
    @Input() lexicalizationSetMetadata: LexicalizationSetMetadata;

    // private lexicalizationSet: string;
    private lexiconDataset: string;
    private lexicalizationModel: string;
    private language: string;
    private references: number;
    private lexicalEntries: number;
    private lexicalizations: number;
    private percentage: number;
    private avgNumOfLexicalizations: number;

    private lexicalModelMap = [
        { iri: RDFS.uri, label: "RDFS" },
        { iri: SKOS.uri, label: "SKOS" },
        { iri: SKOSXL.uri, label: "SKOSXL" },
        { iri: OntoLex.uri, label: "OntoLex" }
    ];
    private lexicalModelOpts = ["RDFS", "SKOS", "SKOSXL", "OntoLex"];

    constructor(private metadataRegistryService: MetadataRegistryServices, private basicModals: BasicModalServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['lexicalizationSetMetadata'] && changes['lexicalizationSetMetadata'].currentValue) {
            this.lexiconDataset = this.lexicalizationSetMetadata.lexiconDataset;

            this.lexicalModelMap.forEach(lexModel => {
                if (this.lexicalizationSetMetadata.lexicalizationModel == lexModel.iri) {
                    this.lexicalizationModel = lexModel.label;
                }
            })

            this.language = this.lexicalizationSetMetadata.language;
            this.references = this.lexicalizationSetMetadata.references;
            this.lexicalEntries = this.lexicalizationSetMetadata.lexicalEntries;
            this.lexicalizations = this.lexicalizationSetMetadata.lexicalizations;
            this.percentage = this.lexicalizationSetMetadata.percentage;
            this.avgNumOfLexicalizations = this.lexicalizationSetMetadata.avgNumOfLexicalizations;
        }
    }

    //TODO update when services will be available

    // private updateLexicalizationSet(newValue: string) {
        
    // }

    private updateLexiconDataset(newValue: string) {
        if (newValue != this.lexiconDataset) {
            if (!ResourceUtils.testIRI(newValue)) {
                this.basicModals.alert("Invalid data", "'" + newValue + "' is not a valid IRI", "warning");
                //restore old value
                this.lexiconDataset = newValue;
                setTimeout(() => {
                    this.lexiconDataset = this.lexicalizationSetMetadata.lexiconDataset;
                });
            } else {
                this.lexiconDataset = newValue;
                this.updateLexicalizationSetMetadata();
            }
        }
    }

    private updateLexicalizationModel(newValue: string) {
        if (newValue != this.lexicalizationModel) {
            this.lexicalizationModel = newValue;
            this.updateLexicalizationSetMetadata();
        }
    }

    private updateLanguage(newValue: string) {
        if (newValue != this.language) {
            let langRegexp = new RegExp("^[a-z]{2,3}(?:-[A-Z]{2,3}(?:-[a-zA-Z]{4})?)?$");
            if (!langRegexp.test(newValue)) {
                this.basicModals.alert("Invalid data", "'" + this.language + "' is not a valid language tag", "warning");
                //restore old value
                this.language = newValue;
                setTimeout(() => {
                    this.language = this.lexicalizationSetMetadata.language;
                });
            } else {
                this.language = newValue;
                this.updateLexicalizationSetMetadata();
            }
        }
    }

    private updateReferences(newValue: number) {
        if (newValue != this.references) {
            this.references = newValue;
            this.updateLexicalizationSetMetadata();
        }
    }

    private updateLexicalEntries(newValue: number) {
        if (newValue != this.references) {
            this.lexicalEntries = newValue;
            this.updateLexicalizationSetMetadata();
        }
    }

    private updateLexicalizations(newValue: number) {
        if (newValue != this.references) {
            this.lexicalizations = newValue;
            this.updateLexicalizationSetMetadata();
        }
    }

    private updatePercentage(newValue: number) {
        if (newValue != this.references) {
            this.percentage = newValue;
            this.updateLexicalizationSetMetadata();
        }
    }

    private updateAvgNumOfLexicalizations(newValue: number) {
        if (newValue != this.references) {
            this.avgNumOfLexicalizations = newValue;
            this.updateLexicalizationSetMetadata();
        }
    }

    private updateLexicalizationSetMetadata() {
        this.metadataRegistryService.deleteEmbeddedLexicalizationSet(new ARTURIResource(this.lexicalizationSetMetadata.identity)).subscribe(
            stResp => {
                let lexicalizationModelPar: string;
                this.lexicalModelMap.forEach(lexModel => {
                    if (this.lexicalizationModel == lexModel.label) {
                        lexicalizationModelPar = lexModel.iri;
                    }
                });
                let lexiconDatasetPar: ARTURIResource;
                if (this.lexiconDataset != null) {
                    lexiconDatasetPar = new ARTURIResource(this.lexiconDataset);
                }

                this.metadataRegistryService.addEmbeddedLexicalizationSets(new ARTURIResource(this.dataset.identity), 
                    new ARTURIResource(lexicalizationModelPar), this.language, new ARTURIResource(this.lexicalizationSetMetadata.identity),
                    lexiconDatasetPar, this.references, this.lexicalEntries, this.lexicalizations, this.percentage, this.avgNumOfLexicalizations).subscribe(
                    stResp => {
                        this.lexicalizationSetMetadata.lexiconDataset = this.lexiconDataset;
                        this.lexicalizationSetMetadata.lexicalizationModel = lexicalizationModelPar;
                        this.lexicalizationSetMetadata.language = this.language;
                        this.lexicalizationSetMetadata.references = this.references;
                        this.lexicalizationSetMetadata.lexicalEntries = this.lexicalEntries;
                        this.lexicalizationSetMetadata.lexicalizations = this.lexicalizations;
                        this.lexicalizationSetMetadata.percentage = this.percentage;
                        this.lexicalizationSetMetadata.avgNumOfLexicalizations = this.avgNumOfLexicalizations;
                    }
                )
            }
        )
    }


}
