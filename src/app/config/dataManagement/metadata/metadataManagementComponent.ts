import { Component } from "@angular/core";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../../utils/VBActions";

@Component({
    selector: "metadata-management-component",
    templateUrl: "./metadataManagementComponent.html",
    host: { class: "pageComponent" }
})
export class MetadataManagementComponent {

    constructor() { }

    private isMetadataVocAuthorized(): boolean {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.datasetMetadataExport) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.datasetMetadataGetMetadata)
        );
    }

    private isMetadataRegistryAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryRead);
    }

}