import { ARTURIResource } from "./ARTResources";

export class RemoteAlignmentTask {
    id: string;
    leftDataset: DatasetInfo;
    rightDataset: DatasetInfo;
    status: string;
    progress?: number;
    reason?: ReasonInfo;
    startTime: string;
    endTime: string;
}

export class ReasonInfo {
    message: string;
}

export class DatasetInfo {
    projectName: string;
    datasetIRI: ARTURIResource;
    baseURI: string;
    model: ARTURIResource;
    lexicalizationModel: ARTURIResource;
    open: boolean;
}