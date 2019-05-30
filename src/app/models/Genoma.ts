import { ARTURIResource } from "./ARTResources";

export class GenomaTask {
    id: string;
    leftDataset: GenomaDataset;
    rightDataset: GenomaDataset;
    engine: string;
    status: string;
    startTime: string;
    endTime: string;
}

export class GenomaDataset {
    projectName: string;
    datasetIRI: ARTURIResource;
    baseURI: string;
    model: ARTURIResource;
    lexicalizationModel: ARTURIResource;
    open: boolean;
}