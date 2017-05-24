import { ARTURIResource, ARTResource, ARTNode } from "./ARTResources";

export class HistoryItem {
    public commit: ARTURIResource;
    public user: HistoryItemUser;
    public operation: HistoryOperation;
    public subject: ARTURIResource;
    public validationAction: string;
    constructor(commit: ARTURIResource, user: HistoryItemUser, operation: HistoryOperation, subject: ARTURIResource) {
        this.commit = commit;
        this.user = user;
        this.operation = operation;
        this.subject = subject;
    }
}

export class HistoryItemUser {
    public id: string;
    public show: string;
    constructor(id: string, show: string) {
        this.id = id;
        this.show = show;
    }
}

export class HistoryOperation {
    public id: string;
    public show: string;
    constructor(id: string) {
        this.id = id;
        this.show = this.id;
        var stCoreServices: string = "st-core-services/";
        var idx = this.id.indexOf(stCoreServices);
        if (idx != -1) {
            this.show = this.id.substring(idx + stCoreServices.length);
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


// export type ValidationAction = "accept" | "reject";
// export const ValidationAction = {
//     accept: "accept" as ValidationAction,
//     reject: "reject" as ValidationAction
// }
