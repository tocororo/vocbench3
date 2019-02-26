import { ResourceUtils } from "../utils/ResourceUtils";
import { ARTURIResource } from "./ARTResources";
import { OntoLex, OWL, RDFS, SKOS, SKOSXL } from "./Vocabulary";

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
    private repositoryLocation: { location: "remote" | "local", serverURL?: string };
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
        } else if (modelType == OntoLex.uri) {
            return "OntoLex";
        }
    }

    public setOpen(open: boolean) {
        this.open = open;
    }
    public isOpen(): boolean {
        return this.open;
    }

    public getRepositoryLocation() {
        return this.repositoryLocation;
    }
    public setRepositoryLocation(repositoryLocation: { location: "remote" | "local", serverURL?: string }) {
        this.repositoryLocation = repositoryLocation;
    }
    public isRepositoryRemote(): boolean {
        return this.repositoryLocation.location == "remote";
    }

    public setStatus(status: { status: string, message?: string }) {
        this.status = status;
    }
    public getStatus(): { status: string, message?: string } {
        return this.status;
    }

}

export enum ProjectTypesEnum {
    saveToStore = "saveToStore",
    continuosEditing = "continuosEditing"
}

export enum BackendTypesEnum {
    graphdb_FreeSail = "graphdb:FreeSail",
    openrdf_NativeStore = "openrdf:NativeStore",
    openrdf_MemoryStore = "openrdf:MemoryStore"
}

export enum AccessLevel {
    R = "R",
    RW = "RW"
}

export enum LockLevel {
    R = "R",
    W = "W",
    NO = "NO",
}

export class RepositorySummary {
    public id: string;
    public description: string;
    public remoteRepoSummary: {
        serverURL: string;
        repositoryId: string;
        username: string;
        password: string;
    }
}

export enum RepositoryAccessType {
    CreateLocal = "CreateLocal",
    CreateRemote = "CreateRemote",
    AccessExistingRemote = "AccessExistingRemote",
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

export class ProjectTableColumnStruct {
    public name: string;
    public show: boolean;
    public mandatory?: boolean;
}

export class PreloadedDataSummary {
    public baseURI?: string;
    public model?: ARTURIResource;
    public lexicalizationModel?: ARTURIResource;
    public preloadedDataFile: string;
    public preloadedDataFormat: string;
    public warnings: PreloadWarning[];

    public static parse(json: any): PreloadedDataSummary {
        return {
            baseURI: json.baseURI,
            model: (json.model != null) ? ResourceUtils.parseURI(json.model) : null,
            lexicalizationModel: (json.lexicalizationModel != null) ? ResourceUtils.parseURI(json.lexicalizationModel) : null,
            preloadedDataFile: json.preloadedDataFile,
            preloadedDataFormat: json.preloadedDataFormat,
            warnings: json.warnings
        }
    }
}

export class PreloadWarning {
    public '@type': string;
    public message: string;
}