import { ResourceUtils } from "../utils/ResourceUtils";
import { ARTURIResource } from "./ARTResources";
import { EDOAL, OntoLex, OWL, RDFS, SKOS, SKOSXL } from "./Vocabulary";

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
    private shaclEnabled: boolean;
    private facets: {[key: string]: string} = {};
    private description: string;

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

    public setHistoryEnabled(enabled: boolean) {
        this.historyEnabled = enabled;
    }

    public isHistoryEnabled(): boolean {
        return this.historyEnabled;
    }

    public setValidationEnabled(enabled: boolean) {
        this.validationEnabled = enabled;
    }

    public isValidationEnabled(): boolean {
        return this.validationEnabled;
    }

    public setShaclEnabled(enabled: boolean) {
        this.shaclEnabled = enabled;
    }

    public isShaclEnabled(): boolean {
        return this.shaclEnabled;
    }

    public setModelType(modelType: string) {
        this.model = modelType;
    }
    public getModelType(prettyPrint?: boolean): string {
        if (prettyPrint) {
            return Project.getPrettyPrintModelType(this.model);
        }
        return this.model;
    }

    public setLexicalizationModelType(lexicalizationModel: string) {
        this.lexicalizationModel = lexicalizationModel;
    }
    public getLexicalizationModelType(prettyPrint?: boolean): string {
        if (prettyPrint) {
            return Project.getPrettyPrintModelType(this.lexicalizationModel);
        }
        return this.lexicalizationModel;
    }

    public static getPrettyPrintModelType(modelType: string) {
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
        } else if (modelType == EDOAL.uri) {
            return "EDOAL";
        } else {
            return modelType;
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

    public setFacets(facets: {[key: string]: string}) {
        this.facets = facets;
    }
    public getFacets(): {[key: string]: string} {
        return this.facets;
    }
    public getFacet(facet: string): string {
        return this.facets[facet];
    }

    public setDescription(description: string) {
        this.description = description;
    }
    public getDescription(): string {
        return this.description;
    }

    public static deserialize(projJson: any): Project {
        let proj = new Project();
        proj.setName(projJson.name);
        proj.setBaseURI(projJson.baseURI);
        proj.setDefaultNamespace(projJson.defaultNamespace);
        proj.setAccessible(projJson.accessible);
        proj.setHistoryEnabled(projJson.historyEnabled);
        proj.setValidationEnabled(projJson.validationEnabled);
        proj.setModelType(projJson.model);
        proj.setLexicalizationModelType(projJson.lexicalizationModel);
        proj.setOpen(projJson.open);
        proj.setRepositoryLocation(projJson.repositoryLocation);
        proj.setStatus(projJson.status);
        proj.setShaclEnabled(projJson.shaclEnabled);
        proj.setFacets(projJson.facets);
        proj.setDescription(projJson.description);
        return proj;
    }

}

export enum BackendTypesEnum {
    graphdb_FreeSail = "graphdb:FreeSail",
    openrdf_NativeStore = "openrdf:NativeStore",
    openrdf_MemoryStore = "openrdf:MemoryStore"
}

export class AccessStatus {
    public name: string;
    public consumers: ConsumerACL[];
    public lock: LockStatus;
}

export class ConsumerACL {
    name: string;
    availableACLLevel: AccessLevel;
    acquiredACLLevel: AccessLevel
}
export class LockStatus {
    public availableLockLevel: LockLevel;
    public lockingConsumer: string;
    public acquiredLockLevel: LockLevel
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
    public remoteRepoSummary: RemoteRepositorySummary
}
export class RemoteRepositorySummary {
    public serverURL: string;
    public repositoryId: string;
    public username: string;
    public password: string;
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

export class ExceptionDAO {
    public message: string;
    public type: string;
    public stacktrace: string;
}

export enum ProjectFacets {
    dir = "dir"
}

export enum ProjectViewMode {
    list = "list",
    dir = "dir"
}

export enum ProjectColumnId {
    name = "name",
    open = "open",
    accessed = "accessed",
    model = "model",
    lexicalization = "lexicalization",
    history = "history",
    validation = "validation",
    location = "location"
}

export class ProjectTableColumnStruct {
    public id: ProjectColumnId;
    public translationKey: string; //key of the translation entry
    public show: boolean;
    public flex: number; //useful for the view: tells how much the column should grow
    public mandatory?: boolean;
}

export class ProjectUtils {

    public static getDefaultProjectTableColumns(): ProjectTableColumnStruct[] {
        return [
            { id: ProjectColumnId.name, translationKey: "PROJECTS.TABLE.HEADERS.NAME", show: true, flex: 3, mandatory: true },
            { id: ProjectColumnId.open, translationKey: "PROJECTS.TABLE.HEADERS.OPEN_CLOSE", show: true, flex: 1, mandatory: true },
            { id: ProjectColumnId.accessed, translationKey: "PROJECTS.TABLE.HEADERS.ACCESSED", show: true, flex: 1, mandatory: true },
            { id: ProjectColumnId.model, translationKey: "PROJECTS.TABLE.HEADERS.MODEL", show: true, flex: 1 },
            { id: ProjectColumnId.lexicalization, translationKey: "PROJECTS.TABLE.HEADERS.LEXICALIZATION", show: true, flex: 1 },
            { id: ProjectColumnId.history, translationKey: "PROJECTS.TABLE.HEADERS.HISTORY", show: true, flex: 1 },
            { id: ProjectColumnId.validation, translationKey: "PROJECTS.TABLE.HEADERS.VALIDATION", show: true, flex: 1 },
            { id: ProjectColumnId.location, translationKey: "PROJECTS.TABLE.HEADERS.REPO_LOCATION", show: true, flex: 2 }
        ];
    }

    public static readonly defaultTableOrder: ProjectColumnId[] = [
        ProjectColumnId.name,
        ProjectColumnId.open,
        ProjectColumnId.accessed,
        ProjectColumnId.model,
        ProjectColumnId.lexicalization,
        ProjectColumnId.history,
        ProjectColumnId.validation,
        ProjectColumnId.location,
    ]

}