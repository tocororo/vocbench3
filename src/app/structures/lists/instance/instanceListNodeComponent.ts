import { Component } from "@angular/core";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { AbstractListNode } from "../abstractListNode";

@Component({
    selector: "instance-list-node",
    templateUrl: "./instanceListNodeComponent.html",
})
export class InstanceListNodeComponent extends AbstractListNode {

    constructor(eventHandler: VBEventHandler) {
        super(eventHandler);
    }

}