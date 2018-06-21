import { ARTURIResource } from "./ARTResources";

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
    public sparqlEndpoint: string;
    public versionInfo: string;
}

export class CatalogRecord {
    public identity: string;
    public issued: Date;
    public modified: Date;
    public abstractDataset: DatasetMetadata;
    public versions: DatasetMetadata[];
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