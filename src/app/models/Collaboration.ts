import { ARTURIResource } from "./ARTResources";

export class Issue {
    private id: string;
    private key: string;
    private status: string;
    private summary: string;
    private url: string;
    private labels: string[];
    private resolution: string;
    private category: string;
    //further params not in services response
    private statusClass: string;
    private resources: ARTURIResource[];

    constructor(id: string, key: string, status: string, summary: string, url: string, labels: string[], resolution: string, category: string) {
        this.id = id;
        this.key = key;
        this.status = status;
        this.summary = summary;
        this.url = url;
        this.labels = labels;
        this.resolution = resolution;
        this.category = category;

        if (status == "To Do") {
            this.statusClass = "label-primary";
        } else if (status == "Done") {
            this.statusClass = "label-success";
        } else if (status == "In Progress") {
            this.statusClass = "label-warning";
        } else {
            this.statusClass = "label-info";
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

export class CollaborationUtils {

    public static parseIssue(json: any): Issue {
        return new Issue(json.id, json.key, json.status, json.summary, json.url, json.labels, json.resolution, json.category);
    }

    public static parseIssues(json: any[]): Issue[] {
        let issues: Issue[] = [];
        for (var i = 0; i < json.length; i++) {
            issues.push(CollaborationUtils.parseIssue(json[i]));
        }
        return issues;
    }

    public static sortIssues(issues: Issue[], attribute: "key" | "status", descending?: boolean) {
        if (attribute == "status") {
            issues.sort(
                function (i1: Issue, i2: Issue) {
                    if (descending) {
                        return -i1.getStatus().localeCompare(i2.getStatus())
                    } else {
                        return i1.getStatus().localeCompare(i2.getStatus())
                    }
                }
            );
        }
        if (attribute == "key") {
            issues.sort(
                function (i1: Issue, i2: Issue) {
                    if (descending) {
                        return -i1.getKey().localeCompare(i2.getKey())
                    } else {
                        return i1.getKey().localeCompare(i2.getKey())
                    }
                }
            );
        }
    }

}
