import { Component } from "@angular/core";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { AbstractListNode } from "../../../abstractListNode";

@Component({
    selector: "lexical-entry-list-node",
    templateUrl: "./lexicalEntryListNodeComponent.html",
})
export class LexicalEntryListNodeComponent extends AbstractListNode {

    constructor(eventHandler: VBEventHandler) {
        super(eventHandler);
    }

}