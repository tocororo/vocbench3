import { Component } from "@angular/core";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { AbstractListNode } from "../abstractListNode";

@Component({
    selector: "translationset-list-node",
    templateUrl: "./translationSetListNodeComponent.html",
})
export class TranslationSetListNodeComponent extends AbstractListNode {

    constructor(eventHandler: VBEventHandler) {
        super(eventHandler);
    }

}