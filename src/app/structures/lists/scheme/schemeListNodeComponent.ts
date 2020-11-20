import { Component } from "@angular/core";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { AbstractListNode } from "../abstractListNode";

@Component({
    selector: "scheme-list-node",
    templateUrl: "./schemeListNodeComponent.html",
})
export class SchemeListNodeComponent extends AbstractListNode {

    constructor(eventHandler: VBEventHandler) {
        super(eventHandler);
    }

}