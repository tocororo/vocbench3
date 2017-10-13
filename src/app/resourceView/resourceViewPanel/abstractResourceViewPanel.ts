import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ARTResource } from "../../models/ARTResources";

@Component({
    selector: "abstract-res-view",
    templateUrl: "./resourceViewTabbedComponent.html", //placeholder template
})
export abstract class AbstractResourceViewPanel {

    /**
     * METHODS
     */
    abstract selectResource(resource: ARTResource): void;
    abstract deleteResource(resource: ARTResource): void;
    abstract getMainResource(): ARTResource;
    abstract objectDblClick(obj: ARTResource): void;

}