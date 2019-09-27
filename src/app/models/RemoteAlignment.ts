import { ARTURIResource } from "./ARTResources";

export class RemoteAlignmentTask {
    id: string;
    leftDataset: DatasetInfo;
    rightDataset: DatasetInfo;
    engine: string;
    status: string;
    startTime: string;
    endTime: string;
}

export class DatasetInfo {
    projectName: string;
    datasetIRI: ARTURIResource;
    baseURI: string;
    model: ARTURIResource;
    lexicalizationModel: ARTURIResource;
    open: boolean;
}