import { RDFS, OWL, SKOS, SKOSXL } from "./Vocabulary";

export class Project {
    private name: string;
    private accessible: boolean;
    private historyEnabled: boolean;
    private validationEnabled: boolean;
    
    private model: string;
    private lexicalizationModel: string;

    private open: boolean;
    private status: Object;
    private type: string;
    
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
    
    public setStatus(status: Object) {
        this.status = status;
    }
    public getStatus(): Object {
        return this.status;
    }
    
    public setType(type: string) {
        this.type = type;
    }
    public getType(): string {
        return this.type;
    }
}

export type ProjectTypesEnum = "saveToStore" | "continuosEditing";
export const ProjectTypesEnum = {
    saveToStore: "saveToStore" as ProjectTypesEnum,
    continuosEditing: "continuosEditing" as ProjectTypesEnum
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

export class VersionInfo {
    public versionId: string;
    public repositoryId: string;
    public dateTime: string;
}