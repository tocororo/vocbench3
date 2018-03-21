import { Component, Input, Output, EventEmitter, ViewChildren, ViewChild, QueryList } from "@angular/core";
import { AbstractListNode } from "../../../abstractListNode";
import { ARTURIResource, ARTResource, ARTLiteral, ResAttribute } from "../../../../models/ARTResources";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBContext } from "../../../../utils/VBContext";
import { SkosServices } from "../../../../services/skosServices";

@Component({
    selector: "scheme-list-node",
    templateUrl: "./schemeListNodeComponent.html",
})
export class SchemeListNodeComponent extends AbstractListNode {

    constructor(private skosService: SkosServices, eventHandler: VBEventHandler) {
        super(eventHandler);
    }

}