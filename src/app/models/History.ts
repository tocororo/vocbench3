import { ARTURIResource, ARTResource, ARTNode } from "./ARTResources";

export class CommitInfo {
    public commit: ARTURIResource;
    public user: ARTURIResource;
    public operation: ARTURIResource;
    public subject: ARTURIResource;
    public startTime: string;
    public endTime: string;

    constructor(commit: ARTURIResource, user: ARTURIResource, operation: ARTURIResource, subject: ARTURIResource, 
            startTime: string, endTime: string) {
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
        this.endTime = endTime;
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