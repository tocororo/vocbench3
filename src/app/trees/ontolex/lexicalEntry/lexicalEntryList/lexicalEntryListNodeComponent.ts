import { Component } from "@angular/core";
import { AbstractListNode } from "../../../abstractListNode";
import { VBEventHandler } from "../../../../utils/VBEventHandler";

@Component({
    selector: "lexical-entry-list-node",
    templateUrl: "./lexicalEntryListNodeComponent.html",
})
export class LexicalEntryListNodeComponent extends AbstractListNode {

    constructor(eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)));
    }

}