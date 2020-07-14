export interface DiffingTask {
    lexicalizationType1: string;
    lexicalizationType2: string;
    sparqlEndpoint1: string;
    sparqlEndpoint2: string;
    status: TaskStatus;
    taskId: string;
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