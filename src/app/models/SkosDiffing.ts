export interface DiffingTask {
    leftDataset: TaskDataset;
    rightDataset: TaskDataset;
    status: TaskStatus;
    taskId: string;
    executionTime: string;
    langsShown: string[];
}

export interface TaskDataset {
    sparqlEndpoint: string;
    projectName: string;
    versionRepoId: string;
    versionId: string; //not in the response, computed manually
    lexicalizationIRI: string;
}

export enum TaskStatus {
    completed = "completed",
    execution = "execution",
    error = "error"
}

export enum TaskResultType {
    html = "html",
    pdf = "pdf", 
    json = "json"
}