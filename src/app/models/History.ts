import { ARTURIResource, ARTResource, ARTNode } from "./ARTResources";
import { Deserializer } from "../utils/Deserializer";

export class CommitInfo {
    public commit: ARTURIResource;
    public user: ARTURIResource;
    public operation: ARTURIResource;
    public subject: ARTURIResource;
    public startTime: Date;
    public startTimeLocal: string;
    public endTime: Date;
    public endTimeLocal: string;

    constructor(commit: ARTURIResource, user: ARTURIResource, operation: ARTURIResource, subject: ARTURIResource, 
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
        
        this.subject = subject;
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

export class VersionInfo {
    public versionId: string;
    public repositoryId: string;
    public dateTime: Date;
    public dateTimeLocal: string;

    constructor(versionId: string, repositoryId: string, dateTime: Date) {
        this.versionId = versionId;
        this.repositoryId = repositoryId;
        this.dateTime = dateTime;
        if (dateTime != null) {
            this.dateTimeLocal = Deserializer.parseDateTime(dateTime);
        }
    }
}

export type SortingDirection = "Ascending" | "Descending" | "Unordered";
export const SortingDirection = {
    Ascending: "Ascending" as SortingDirection,
    Descending: "Descending" as SortingDirection,
    Unordered: "Unordered" as SortingDirection
}