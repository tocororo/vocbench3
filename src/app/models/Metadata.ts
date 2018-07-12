import { ResourceUtils } from "./ARTResources";

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
    mirror = "mirror"
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