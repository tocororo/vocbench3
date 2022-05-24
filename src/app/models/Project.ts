import { NTriplesUtil } from "../utils/ResourceUtils";
import { ARTURIResource } from "./ARTResources";
import { Settings } from "./Plugins";
import { EDOAL, OntoLex, OWL, RDFS, SKOS, SKOSXL } from "./Vocabulary";

export class Project {
    private name: string;
    private baseURI: string;
    private defaultNamespace: string;
    private accessible: boolean;
    private historyEnabled: boolean;
    private validationEnabled: boolean;
    private blacklistingEnabled: boolean;
    private undoEnabled: boolean;
    private model: string;
    private lexicalizationModel: string;
    private open: boolean;
    private repositoryLocation: { location: "remote" | "local", serverURL?: string };
    private status: { status: string, message?: string };
    private shaclEnabled: boolean;
    private facets: Settings;
    private description: string;
    private createdAt: string;
    private openAtStartup: boolean;
    private labels: {[lang: string]: string} = {}; //lang->labels

    constructor(name?: string) {
        if (name != undefined) {
            this.name = name;
        }
    }

    public setName(name: string) {
        this.name = name;
    }

    /**
     * Returns the name of the project. 
     * If labelRequired is true (if not provided is false by default),
     * returns the rendering label according the rendering status and the language
     * @param label 
     * @returns 
     */
    public getName(labelRequired: boolean = false): string {
        let name = this.name;
        //returns the label only if explicity required through the arg, if rendering is enabled and if label in the given language exists
        if (labelRequired && ProjectLabelCtx.renderingEnabled && this.labels[ProjectLabelCtx.language]) {
            name = this.labels[ProjectLabelCtx.language];
        }
        return name;
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

    public setBlacklistingEnabled(enabled: boolean) {
        this.blacklistingEnabled = enabled;
    }

    public isBlacklistingEnabled(): boolean {
        return this.blacklistingEnabled;
    }

    public setUndoEnabled(enabled: boolean) {
        this.undoEnabled = enabled;
    }

    public isUndoEnabled(): boolean {
        return this.undoEnabled;
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

    public setDescription(description: string) {
        this.description = description;
    }
    public getDescription(): string {
        return this.description;
    }

    public setFacets(facets: Settings) {
        this.facets = facets;
    }

    public getFacets(): Settings {
        return this.facets;
    }

    public setCreatedAt(createdAt: string) {
        this.createdAt = createdAt;
    }

    public getCreatedAt(): string {
        return this.createdAt;
    }

    public getCreatedAtAsDate(): Date {
        if (this.createdAt) {
            return new Date(this.createdAt);
        } else {
            return null;
        }
    }

    public setOpenAtStartup(openAtStartup: boolean) {
        this.openAtStartup = openAtStartup;
    }

    public getOpenAtStartup(): boolean {
        return this.openAtStartup;
    }

    public setLabels(labels: {[key: string]: string}) {
        if (labels != null) {
            this.labels = labels;
        }        
    }

    public getLabels(): {[key: string]: string} {
        return this.labels;
    }

    public static deserialize(projJson: any): Project {
        let proj = new Project();
        proj.setName(projJson.name);
        proj.setBaseURI(projJson.baseURI);
        proj.setDefaultNamespace(projJson.defaultNamespace);
        proj.setAccessible(projJson.accessible);
        proj.setHistoryEnabled(projJson.historyEnabled);
        proj.setValidationEnabled(projJson.validationEnabled);
        proj.setBlacklistingEnabled(projJson.blacklistingEnabled);
        proj.setUndoEnabled(projJson.undoEnabled);
        proj.setModelType(projJson.model);
        proj.setLexicalizationModelType(projJson.lexicalizationModel);
        proj.setOpen(projJson.open);
        proj.setRepositoryLocation(projJson.repositoryLocation);
        proj.setStatus(projJson.status);
        proj.setShaclEnabled(projJson.shaclEnabled);
        proj.setDescription(projJson.description);
        proj.setCreatedAt(projJson.createdAt);
        proj.setFacets(Settings.parse(projJson.facets));
        proj.setOpenAtStartup(projJson.openAtStartup);
        proj.setLabels(projJson.labels);
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
    public universalACLLevel: AccessLevel;
}

export class ConsumerACL {
    name: string;
    availableACLLevel: AccessLevel;
    acquiredACLLevel: AccessLevel;
}
export class LockStatus {
    public availableLockLevel: LockLevel;
    public lockingConsumer: string;
    public acquiredLockLevel: LockLevel;
}

export enum AccessLevel {
    R = "R",
    RW = "RW",
    EXT = "EXT"
}

export enum LockLevel {
    R = "R",
    W = "W",
    NO = "NO",
}

export class Repository {
    public id: string;
    public location: string;
    public description: string;
    public readable: boolean;
    public writable: boolean;
}

export class RepositorySummary {
    public id: string;
    public description: string;
    public backendType: string;
    public remoteRepoSummary: RemoteRepositorySummary;
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
        };
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
            model: (json.model != null) ? NTriplesUtil.parseURI(json.model) : null,
            lexicalizationModel: (json.lexicalizationModel != null) ? NTriplesUtil.parseURI(json.lexicalizationModel) : null,
            preloadedDataFile: json.preloadedDataFile,
            preloadedDataFormat: json.preloadedDataFormat,
            warnings: json.warnings
        };
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

export interface FailReport {
    offensiveElemId: string; //e.g. repo ID, project name, ...
    exception: ExceptionDAO;
}

export enum ProjectFacets {
    dir = "dir",
    prjHistoryEnabled = "prjHistoryEnabled",
    prjLexModel = "prjLexModel",
    prjModel = "prjModel",
    prjValidationEnabled = "prjValidationEnabled",
}

export enum ProjectViewMode {
    list = "list",
    facet = "facet",
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
            { id: ProjectColumnId.name, translationKey: "COMMONS.NAME", show: true, flex: 3, mandatory: true },
            { id: ProjectColumnId.open, translationKey: "PROJECTS.OPEN_CLOSE", show: true, flex: 1, mandatory: true },
            { id: ProjectColumnId.accessed, translationKey: "PROJECTS.ACCESSED", show: true, flex: 1, mandatory: true },
            { id: ProjectColumnId.model, translationKey: "COMMONS.MODEL", show: true, flex: 1 },
            { id: ProjectColumnId.lexicalization, translationKey: "MODELS.PROJECT.LEXICALIZATION", show: true, flex: 1 },
            { id: ProjectColumnId.history, translationKey: "MODELS.PROJECT.HISTORY", show: true, flex: 1 },
            { id: ProjectColumnId.validation, translationKey: "MODELS.PROJECT.VALIDATION", show: true, flex: 1 },
            { id: ProjectColumnId.location, translationKey: "MODELS.PROJECT.REPO_LOCATION", show: true, flex: 2 }
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
    ];

    public static projectFacetsTranslationStruct: { facet: ProjectFacets, translationKey: string }[] = [
        { facet: ProjectFacets.prjHistoryEnabled, translationKey: "MODELS.PROJECT.HISTORY" },
        { facet: ProjectFacets.prjLexModel, translationKey: "MODELS.PROJECT.LEXICALIZATION" },
        { facet: ProjectFacets.prjModel, translationKey: "COMMONS.MODEL" },
        { facet: ProjectFacets.prjValidationEnabled, translationKey: "MODELS.PROJECT.VALIDATION" }
    ];

}

/**
 * This class keep the rendering status and the language for the rendering of the projects.
 * I need to declare it here (instead of in VBContext or VBProperties for example) since it
 * needs to be references in Project#getName() without injecting any service and 
 * preventing cycling dependencies (e.g. VBContext -> Project -> VBContext).
 * renderingEnabled needs to be updated each time it is changed from the project list panel (in Project page or modal)
 * language needs to be updated each time the i18n language is changed
 */
export class ProjectLabelCtx {
    public static renderingEnabled: boolean = false;
    public static language: string;
}