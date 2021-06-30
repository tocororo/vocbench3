import { ARTURIResource, ARTResource, ARTNode } from "./ARTResources";
import { Deserializer } from "../utils/Deserializer";
import { NTriplesUtil } from "../utils/ResourceUtils";

export class CommitInfo {
    public commit: ARTURIResource;
    public user: ARTURIResource;
    public operation: ARTURIResource;
    public operationParameters: ParameterInfo[];
    public startTime: Date;
    public startTimeLocal: string;
    public endTime: Date;
    public endTimeLocal: string;
    public commentAllowed: boolean;
    public created: ARTResource[];
    public modified: ARTResource[];
    public deleted: ARTResource[];
    // public comment: string;

    constructor(commit: ARTURIResource, user: ARTURIResource, operation: ARTURIResource, operationParameters: ParameterInfo[],
        startTime: Date, endTime: Date, commentAllowed?: boolean) {
        this.commit = commit;
        this.user = user;

        this.operation = operation;

        this.operationParameters = operationParameters;

        this.startTime = startTime;
        if (startTime != null) {
            this.startTimeLocal = Deserializer.parseDateTime(startTime);
        }
        this.endTime = endTime;
        if (endTime != null) {
            this.endTimeLocal = Deserializer.parseDateTime(endTime);
        }

        this.commentAllowed = commentAllowed;
    }

    public static parse(commitJson: any) {
        let commitUri: ARTURIResource
        if (commitJson.commit) {
            commitUri = new ARTURIResource(commitJson.commit);
        }

        let user: ARTURIResource;
        if (commitJson.user != null) {
            user = new ARTURIResource(commitJson.user['@id'], commitJson.user.show);
        }

        let operation: ARTURIResource;
        if (commitJson.operation != null) {
            operation = Deserializer.createURI(commitJson.operation);
            // operation = new ARTURIResource(commitJson.operation['@id']);
        }

        let operationParameters: ParameterInfo[] = [];
        if (commitJson.operationParameters != null) {
            commitJson.operationParameters.forEach(element => {
                if (element.value != null) {
                    operationParameters.push(new ParameterInfo(element.name, element.value));
                }
            });
        }

        let startTime: Date;
        if (commitJson.startTime != null) {
            startTime = new Date(commitJson.startTime);
        }

        let endTime: Date;
        if (commitJson.endTime != null) {
            endTime = new Date(commitJson.endTime);
        }

        let commit = new CommitInfo(commitUri, user, operation, operationParameters, startTime, endTime);

        if (commitJson.created) {
            commit.created = commitJson.created.map((n: string) => NTriplesUtil.parseResource(n));
        }
        if (commitJson.modified) {
            commit.modified = commitJson.modified.map((n: string) => NTriplesUtil.parseResource(n));
        }
        if (commitJson.deleted) {
            commit.deleted = commitJson.deleted.map((n: string) => NTriplesUtil.parseResource(n));
        }
        return commit;
    }
}

export class ParameterInfo {
    public name: string;
    public value: string;
    constructor(name: string, value: string) {
        this.name = name;
        this.value = value;
    }
}

export class CommitOperation {
    public subject: ARTResource;
    public predicate: ARTURIResource;
    public object: ARTNode;
    public context: ARTResource;
    constructor(subject: ARTResource, predicate: ARTURIResource, object: ARTNode, context: ARTResource) {
        this.subject = subject;
        this.predicate = predicate;
        this.object = object;
        this.context = context;
    }
}

export enum SortingDirection {
    Ascending = "Ascending",
    Descending = "Descending",
    Unordered = "Unordered"
}


export class VersionInfo {
    public versionId: string;
    public repositoryId: string;
    public dateTime: Date;
    public dateTimeLocal: string;
    public repositoryStatus: RepositoryStatus;
    public repositoryLocation: RepositoryLocation;

    constructor(versionId: string, repositoryId: string, dateTime: Date, repositoryLocation: RepositoryLocation, repositoryStatus: RepositoryStatus) {
        this.versionId = versionId;
        this.repositoryId = repositoryId;
        this.dateTime = dateTime;
        if (dateTime != null) {
            this.dateTimeLocal = Deserializer.parseDateTime(dateTime);
        }
        this.repositoryLocation = repositoryLocation;
        this.repositoryStatus = repositoryStatus;
    }
}


export enum RepositoryStatus {
    INITIALIZED = "INITIALIZED",
    UNITIALIZED = "UNITIALIZED"
}

export enum RepositoryLocation {
    LOCAL = "LOCAL",
    REMOTE = "REMOTE",
    NOT_FOUND = "NOT_FOUND"
}

export class CommitDelta {
    additions: CommitOperation[];
    removals: CommitOperation[];
    additionsTruncated?: number;
    removalsTruncated?: number;
}
