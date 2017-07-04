import { Component } from "@angular/core";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator"

@Component({
    selector: "metadata-management-component",
    templateUrl: "./metadataManagementComponent.html",
    host: { class: "pageComponent" }
})
export class MetadataManagementComponent {

    constructor() { }

    private isMetadataVocAuthorized(): boolean {
        return (
            AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.DATASET_METADATA_EXPORT) &&
            AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.DATASET_METADATA_GET_METADATA)
        );
    }

}