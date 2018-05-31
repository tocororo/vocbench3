import { Component } from "@angular/core";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { AbstractListNode } from "../../abstractListNode";

@Component({
    selector: "datatype-list-node",
    templateUrl: "./datatypeListNodeComponent.html",
})
export class DatatypeListNodeComponent extends AbstractListNode {

    constructor(eventHandler: VBEventHandler) {
        super(eventHandler);
    }

}