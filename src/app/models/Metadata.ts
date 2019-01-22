import { ResourceUtils, ARTLiteral, ARTURIResource } from "./ARTResources";

export class PrefixMapping {
    public prefix: string;
    public namespace: string;
    public explicit: boolean = true;
}

export class OntologyImport {
    public id: string;
    public status: ImportStatus;
    public imports: OntologyImport[];
}

export enum ImportStatus {
    OK = "OK",
    FAILED = "FAILED",
    STAGED_ADDITION = "STAGED_ADDITION",
    STAGED_REMOVAL = "STAGED_REMOVAL",
    LOOP = "LOOP"
}

export enum ImportType {
    fromWeb = "fromWeb",
    fromWebToMirror = "fromWebToMirror",
    fromLocalFile = "fromLocalFile",
    fromOntologyMirror = "fromOntologyMirror",
    toOntologyMirror = "toOntologyMirror"
};

export enum TransitiveImportMethodAllowance {
    web = "web",
    webFallbackToMirror = "webFallbackToMirror",
    mirrorFallbackToWeb = "mirrorFallbackToWeb",
    mirror = "mirror",
    nowhere = "nowhere"
}

export class DatasetMetadata {
    public identity: string;
    public uriSpace: string;
    public title: string;
    public dereferenciationSystem: string;
    public sparqlEndpointMetadata: SparqlEndpointMetadata;
    public versionInfo: string;

    public static deserialize(datasetMetadataJson: any): DatasetMetadata {
        let sparqlEndpointMetadata: SparqlEndpointMetadata = SparqlEndpointMetadata.deserialize(datasetMetadataJson.sparqlEndpointMetadata);
        return {
            identity: datasetMetadataJson.identity,
            uriSpace: datasetMetadataJson.uriSpace,
            title: datasetMetadataJson.title,
            dereferenciationSystem: datasetMetadataJson.dereferenciationSystem,
            sparqlEndpointMetadata: sparqlEndpointMetadata,
            versionInfo: datasetMetadataJson.versionInfo
        }
    }
}

export class CatalogRecord {
    public identity: string;
    public issued: Date;
    public modified: Date;
    public abstractDataset: DatasetMetadata;
    public versions: DatasetMetadata[];

    public static deserialize(catalogRecordJson: any) {
        let versions: DatasetMetadata[];
        if (catalogRecordJson.versions) {
            versions = [];
            for (var i = 0; i < catalogRecordJson.versions.length; i++) {
                versions.push(DatasetMetadata.deserialize(catalogRecordJson.versions[i]));
            }
        }
        return {
            identity: catalogRecordJson.identity,
            issued: catalogRecordJson.issued,
            modified: catalogRecordJson.modified,
            abstractDataset: DatasetMetadata.deserialize(catalogRecordJson.abstractDataset),
            versions: versions
        }
    }
}

export class SparqlEndpointMetadata {
    id: string;
    limitations: string[];
    public static deserialize(metadataJson: any): SparqlEndpointMetadata {
        if (metadataJson) {
            return {
                id: ResourceUtils.parseURI(metadataJson['@id']).getURI(),
                limitations: metadataJson.limitations
            }
        } else {
            return { id: null, limitations: null }
        }
        
    }
}

export class LexicalizationSetMetadata {
    public identity: string;
    public referenceDataset: string;
    public lexiconDataset?: string;
    public lexicalizationModel: string;
    public language: string;
    public references?: number;
    public lexicalEntries?: number;
    public lexicalizations?: number;
    public percentage?: number;
    public avgNumOfLexicalizations?: number;
}

export class ConnectorsID {
    public static LOVConnector_ID: string = "it.uniroma2.art.semanticturkey.extension.impl.metadatarepository.lov.LOVConnector";
    public static LODCloudConnector_ID: string = "it.uniroma2.art.semanticturkey.extension.impl.metadatarepository.lodcloud.LODCloudConnector"
}

export abstract class AbstractDataset {
    id: string;
    ontologyIRI: ARTURIResource; //or ARTURI?
    datasetPage: string;
    titles: ARTLiteral[];
    descriptions: ARTLiteral[];
    facets: DatasetSearchFacets;

    private prefTitle: ARTLiteral;
    private prefDescription: ARTLiteral;

    constructor(id: string) {
        this.id = id;
    }

    getPreferredTitle(): ARTLiteral {
        if (this.prefTitle != null) return this.prefTitle; //if already initialized, return it
        //otherwise, init it
        this.prefTitle = this.titles[0]; //set by default the first title
        if (this.titles.length > 1) {
            langLoop: for (let i = 0; i < navigator.languages.length; i++) { //for each language look for the title
                for (let j = 0; j < this.titles.length; j++) {
                    if (this.titles[j].getLang() == navigator.languages[i]) {
                        this.prefTitle = this.titles[j];
                        break langLoop;
                    }
                };
            };
        }
        return this.prefTitle;
    }

    getPreferredDescription(): ARTLiteral {
        if (this.prefDescription != null) return this.prefDescription; //if already initialized, return it
        //otherwise, init it
        this.prefDescription = this.descriptions[0]; //set by default the first description
        if (this.descriptions.length > 1) {
            langLoop: for (let i = 0; i < navigator.languages.length; i++) { //for each language look for the description
                for (let j = 0; j < this.descriptions.length; j++) {
                    if (this.descriptions[j].getLang() == navigator.languages[i]) {
                        this.prefDescription = this.descriptions[j];
                        break langLoop;
                    }
                };
            };
        }
        return this.prefDescription;
    }
}

export class DatasetDescription extends AbstractDataset {
    uriPrefix: string;
    dataDump: string;
    sparqlEndpoint: string;
    model: string;
    lexicalizationModel: string;
}

export class DatasetSearchResult extends AbstractDataset {
	score: number;
}

export class SearchResultsPage<T> {
    totalResults: number;
	pageSize: number;
	page: number;
	tail: boolean;
	content: T[];
}

export class DatasetSearchFacets {
    [key: string]: string[]
}