import { ElementRef, ViewChild } from "@angular/core";
import { ResAttribute } from "../models/ARTResources";
import { TreeListContext } from "../utils/UIUtils";
import { VBEventHandler } from "../utils/VBEventHandler";
import { AbstractNode } from "./abstractNode";

export abstract class AbstractListNode extends AbstractNode {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    //get an element in the view referenced with #listNodeElement (useful to apply scrollIntoView in the search function)
    @ViewChild('listNodeElement') listNodeElement: ElementRef;

    /**
     * CONSTRUCTOR
     */
    constructor(eventHandler: VBEventHandler) {
        super(eventHandler);
    }

    /**
     * METHODS
     */

    ngAfterViewInit() {
        //if the resource is new (just created), make it visible in the view
        if (this.node.getAdditionalProperty(ResAttribute.NEW)) {
            this.ensureVisible();
            this.node.deleteAdditionalProperty(ResAttribute.NEW);
        }
    }

    ensureVisible() {
        /**
         * ensureVisible is invoked after selectNode. Since the node selection could open a res view and
         * the res view could make reduce the size of the tree, give time to update the view
         */
        setTimeout(() => {
            this.listNodeElement.nativeElement.scrollIntoView({block: 'end', behavior: 'smooth'});
        });
    }

}