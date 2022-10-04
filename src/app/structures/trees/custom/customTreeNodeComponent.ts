import { ChangeDetectorRef, Component, QueryList, ViewChildren } from "@angular/core";
import { map } from 'rxjs/operators';
import { CustomTreesServices } from 'src/app/services/customTreesServices';
import { ResAttribute } from "../../../models/ARTResources";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { AbstractTreeNode } from "../abstractTreeNode";

@Component({
    selector: "custom-tree-node",
    templateUrl: "./customTreeNodeComponent.html",
})
export class CustomTreeNodeComponent extends AbstractTreeNode {

    @ViewChildren(CustomTreeNodeComponent) viewChildrenNode: QueryList<CustomTreeNodeComponent>;

    constructor(private customTreeService: CustomTreesServices, eventHandler: VBEventHandler, 
        basicModals: BasicModalServices, sharedModals: SharedModalServices, changeDetectorRef: ChangeDetectorRef) {
        super(eventHandler, basicModals, sharedModals, changeDetectorRef);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    expandNodeImpl() {
        return this.customTreeService.getChildrenResources(this.node).pipe(
            map(children => {
                //sort by show if rendering is active, uri otherwise
                ResourceUtils.sortResources(children, this.rendering ? SortAttribute.show : SortAttribute.value);
                this.children = children;
                this.open = true;
                if (this.children.length == 0) {
                    this.open = false;
                    this.node.setAdditionalProperty(ResAttribute.MORE, 0);
                }
            })
        );
    }

}