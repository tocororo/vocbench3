import { Component } from "@angular/core";
import { AbstractListNode } from "../../abstractListNode";
import { VBEventHandler } from "../../../utils/VBEventHandler";

@Component({
    selector: "instance-list-node",
    templateUrl: "./instanceListNodeComponent.html",
})
export class InstanceListNodeComponent extends AbstractListNode {

    constructor(eventHandler: VBEventHandler) {
        super(eventHandler);
    }

}