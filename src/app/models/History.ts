import { ARTURIResource, ARTResource, ARTNode } from "./ARTResources";
import { Deserializer } from "../utils/Deserializer";

export class CommitInfo {
    public commit: ARTURIResource;
    public user: ARTURIResource;
    public operation: ARTURIResource;
    public operationParameters: ParameterInfo[];
    public startTime: Date;
    public startTimeLocal: string;
    public endTime: Date;
    public endTimeLocal: string;

    constructor(commit: ARTURIResource, user: ARTURIResource, operation: ARTURIResource, operationParameters: ParameterInfo[],
            startTime: Date, endTime: Date) {
        this.commit = commit;
        this.user = user;

        this.operation = operation;
        if (operation != null) {
            let stCoreServices: string = "st-core-services/";
            let operationShow = operation.getURI();
            var idx = operationShow.indexOf(stCoreServices);
            if (idx != -1) {
                operationShow = operationShow.substring(idx + stCoreServices.length);
            }
            this.operation.setShow(operationShow);
        }

        this.operationParameters = operationParameters;
        
        this.startTime = startTime;
        if (startTime != null) {
            this.startTimeLocal = Deserializer.parseDateTime(startTime);
        }
        this.endTime = endTime;
        if (endTime != null) {
            this.endTimeLocal = Deserializer.parseDateTime(endTime);
        }
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

export type SortingDirection = "Ascending" | "Descending" | "Unordered";
export const SortingDirection = {
    Ascending: "Ascending" as SortingDirection,
    Descending: "Descending" as SortingDirection,
    Unordered: "Unordered" as SortingDirection
}

export class VersionInfo {
    public versionId: string;
    public repositoryId: string;
    public dateTime: Date;
    public dateTimeLocal: string;
    public status: RepositoryStatus;

    constructor(versionId: string, repositoryId: string, dateTime: Date, status: RepositoryStatus) {
        this.versionId = versionId;
        this.repositoryId = repositoryId;
        this.dateTime = dateTime;
        if (dateTime != null) {
            this.dateTimeLocal = Deserializer.parseDateTime(dateTime);
        }
        this.status = status;
    }
}

export type RepositoryStatus = "INITIALIZED" | "UNITIALIZED";
export const RepositoryStatus = {
    INITIALIZED: "INITIALIZED" as RepositoryStatus,
    UNITIALIZED: "UNITIALIZED" as RepositoryStatus
}

