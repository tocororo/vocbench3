import { RDFS, OWL, SKOS, SKOSXL } from "./Vocabulary";

export class Project {
    private name: string;
    private baseURI: string;
    private defaultNamespace: string;
    private accessible: boolean;
    private historyEnabled: boolean;
    private validationEnabled: boolean;
    private model: string;
    private lexicalizationModel: string;
    private open: boolean;
    private status: { status: string, message?: string };
    
    constructor(name?: string) {
        if (name != undefined) {
            this.name = name;       
        }
    }
    
    public setName(name: string) {
        this.name = name;
    }
    
    public getName(): string {
        return this.name;
    }

    public setBaseURI(baseURI: string) {
        this.baseURI = baseURI;
    }
    
    public getBaseURI(): string {
        return this.baseURI;
    }

    public setDefaultNamespace(defaultNamespace: string) {
        this.defaultNamespace = defaultNamespace;
    }
    
    public getDefaultNamespace(): string {
        return this.defaultNamespace;
    }
    
    public setAccessible(accessible: boolean) {
        this.accessible = accessible;
    }
    
    public isAccessible(): boolean {
        return this.accessible;
    }

    public setHistoryEnabled(historyEnabled: boolean) {
        this.historyEnabled = historyEnabled;
    }
    
    public isHistoryEnabled(): boolean {
        return this.historyEnabled;
    }

    public setValidationEnabled(validationEnabled: boolean) {
        this.validationEnabled = validationEnabled;
    }
    
    public isValidationEnabled(): boolean {
        return this.validationEnabled;
    }
    
    public setModelType(modelType: string) {
        this.model = modelType;
    }
    public getModelType(prettyPrint?: boolean): string {
        if (prettyPrint) {
            return this.getPrettyPrintModelType(this.model);
        }
        return this.model;
    }

    public setLexicalizationModelType(lexicalizationModel: string) {
        this.lexicalizationModel = lexicalizationModel;
    }
    public getLexicalizationModelType(prettyPrint?: boolean): string {
        if (prettyPrint) {
            return this.getPrettyPrintModelType(this.lexicalizationModel);
        }
        return this.lexicalizationModel;
    }

    private getPrettyPrintModelType(modelType: string) {
        if (modelType == RDFS.uri) {
            return "RDFS";
        } else if (modelType == OWL.uri) {
            return "OWL";
        } else if (modelType == SKOS.uri) {
            return "SKOS";
        } else if (modelType == SKOSXL.uri) {
            return "SKOSXL";
        }
    }
    
    public setOpen(open: boolean) {
        this.open = open;
    }
    public isOpen(): boolean {
        return this.open;
    }
    
    public setStatus(status:  { status: string, message?: string }) {
        this.status = status;
    }
    public getStatus():  { status: string, message?: string } {
        return this.status;
    }
    
}

export type ProjectTypesEnum = "saveToStore" | "continuosEditing";
export const ProjectTypesEnum = {
    saveToStore: "saveToStore" as ProjectTypesEnum,
    continuosEditing: "continuosEditing" as ProjectTypesEnum
}

export type BackendTypesEnum = "graphdb:FreeSail" | "openrdf:NativeStore" | "openrdf:MemoryStore";
export const BackendTypesEnum = {
    graphdb_FreeSail: "graphdb:FreeSail" as BackendTypesEnum,
    openrdf_NativeStore: "openrdf:NativeStore" as BackendTypesEnum,
    openrdf_MemoryStore: "openrdf:MemoryStore" as BackendTypesEnum
}

export type AccessLevel = "R" | "RW";
export const AccessLevel = {
    R: "R" as AccessLevel,
    RW: "RW" as AccessLevel
}

export type LockLevel = "R" | "W" | "NO";
export const LockLevel = {
    R: "R" as LockLevel,
    W: "W" as LockLevel,
    NO: "NO" as LockLevel,
}

export type RepositoryAccessType = "CreateLocal" | "CreateRemote" | "AccessExistingRemote";
export const RepositoryAccessType = {
    CreateLocal: "CreateLocal" as RepositoryAccessType,
    CreateRemote: "CreateRemote" as RepositoryAccessType,
    AccessExistingRemote: "AccessExistingRemote" as RepositoryAccessType,
}

export class RepositoryAccess {
    private type: RepositoryAccessType;
    private configuration: RemoteRepositoryAccessConfig;

    constructor(type: RepositoryAccessType) {
        this.type = type;
    }

    public setConfiguration(configuration: RemoteRepositoryAccessConfig) {
        this.configuration = configuration;
    }

    public stringify(): string {
        let repoAccess: any = {
            "@type": this.type,
        }
        //if the repository access is remote, add the configuration
        if (this.type == RepositoryAccessType.CreateRemote || this.type == RepositoryAccessType.AccessExistingRemote) {
            repoAccess.serverURL = this.configuration.serverURL;
            repoAccess.username = this.configuration.username;
            repoAccess.password = this.configuration.password;
        }
        return JSON.stringify(repoAccess);
    }
}

export class RemoteRepositoryAccessConfig {
    public serverURL: string;
    public username: string;
    public password: string;
}

export class Repository {
    public id: string;
    public location: string;
    public description: string;
    public readable: boolean;
    public writable: boolean;
}