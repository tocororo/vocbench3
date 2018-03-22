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
    public baseURI: string;
	public sparqlEndpoint: string;
	public dereferenceable: boolean;
    public title: string;
}

//TODO check if object types are correct
export class CatalogRecord {
    public identity: ARTURIResource;
	public issued: string;
	public modified: string;
	public abstractDataset: DatasetMetadata;
	public versions: DatasetMetadata[];
}