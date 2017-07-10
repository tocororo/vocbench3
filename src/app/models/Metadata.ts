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

export type ImportStatus = "OK" | "FAILED" | "STAGED_ADDITION" | "STAGED_REMOVAL" | "LOOP";
export const ImportStatus = {
    OK: "OK" as ImportStatus,
    FAILED: "FAILED" as ImportStatus,
    STAGED_ADDITION: "STAGED_ADDITION" as ImportStatus,
    STAGED_REMOVAL: "STAGED_REMOVAL" as ImportStatus,
    LOOP: "LOOP" as ImportStatus
}

export type ImportType = "fromWeb" | "fromWebToMirror" | "fromLocalFile" | "fromOntologyMirror";
export const ImportType = {
    fromWeb: "fromWeb" as ImportType,
    fromWebToMirror: "fromWebToMirror" as ImportType,
    fromLocalFile: "fromLocalFile" as ImportType,
    fromOntologyMirror: "fromOntologyMirror" as ImportType
};