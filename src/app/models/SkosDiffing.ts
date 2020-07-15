export interface DiffingTask {
    projectName1: string;
    lexicalizationType1: string;
    versionRepoId1: string;
    versionId1: string; //not in the response, computed manually
    sparqlEndpoint1: string;

    projectName2: string;
    lexicalizationType2: string;
    versionRepoId2: string;
    versionId2: string; //not in the response, computed manually
    sparqlEndpoint2: string;
    
    status: TaskStatus;
    taskId: string;
    executionTime: string;
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