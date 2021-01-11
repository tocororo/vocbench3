import { ARTURIResource } from "./ARTResources";

export class Issue {
    private id: string;
    private key: string;
    private status: string;
    private statusId: string;
    private summary: string;
    private url: string;
    private labels: string[];
    private resolution: string;
    private category: string;
    //further params not in services response
    private statusClass: string;
    private resources: ARTURIResource[];

    constructor(id: string, key: string, status: string, statusId: string, summary: string, url: string, labels: string[], resolution: string, category: string) {
        this.id = id;
        this.key = key;
        this.status = status;
        this.statusId = statusId;
        this.summary = summary;
        this.url = url;
        this.labels = labels;
        this.resolution = resolution;
        this.category = category;

        if (statusId == "10000") {
            this.statusClass = "badge-primary";
        } else if (statusId == "10001") {
            this.statusClass = "badge-success";
        } else if (statusId == "3") {
            this.statusClass = "badge-warning";
        } else {
            this.statusClass = "badge-info";
        }

        this.resources = [];
    }

    public getId(): string {
        return this.id;
    }
    public getKey(): string {
        return this.key;
    }
    public getStatus(): string {
        return this.status;
    }
    public getSummary(): string {
        return this.summary;
    }
    public getUrl(): string {
        return this.url;
    }
    public getLabels(): string[] {
        return this.labels;
    }
    public getResolution(): string {
        return this.resolution;
    }
    public getCategory(): string {
        return this.category;
    }
    public getStatusClass(): string {
        return this.statusClass;
    }
    public getStatusId(): string {
        return this.statusId;
    }
    public getResources(): ARTURIResource[] {
        return this.resources;
    }
    public setResources(resources: ARTURIResource[]) {
        this.resources = resources;
    }
    public addResource(resource: ARTURIResource) {
        this.resources.push(resource);
    }

}

export class IssuesStruct {
    issues: Issue[];
    more: boolean;
    numIssues: number;
    numPagesTotal: number;
}

export interface CollaborationSystemStatus {
    backendId: string;
    csActive: boolean; //tells if the CS (even if configured and working) has been activated/deactivated
    linked: boolean; //tells if a project on the CS has been linked
    projSettingsConfigured: boolean;
    userSettingsConfigured: boolean;
}

export class CollaborationUtils {

    public static parseIssue(json: any): Issue {
        return new Issue(json.id, json.key, json.status, json.statusId, json.summary, json.url, json.labels, json.resolution, json.category);
    }

    public static parseIssues(json: any[]): Issue[] {
        let issues: Issue[] = [];
        for (var i = 0; i < json.length; i++) {
            issues.push(CollaborationUtils.parseIssue(json[i]));
        }
        return issues;
    }

    public static sortIssues(issues: Issue[], attribute: "key" | "status" | "id", descending?: boolean) {
        issues.sort(
            (i1: Issue, i2: Issue) => {
                if (descending) {
                    return -i1[attribute].localeCompare(i2[attribute]);
                } else {
                    return i1[attribute].localeCompare(i2[attribute]);
                }
            }
        );
    }

}

/**
 * Context of the issues list. Useful in orderd to render different the issues list depending on the context:
 * - in the dashboard the issues are not selectable
 * - in the modal to assign issue to a resource the issues are selectable and the column about the assigned resource is not shown
 */
export enum IssuesListCtx {
    Dashboard = "Dashboard",
    Assignment = "Assignment"
}
