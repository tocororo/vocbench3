import { ChangeDetectorRef, Component, QueryList, ViewChildren } from "@angular/core";
import { map } from 'rxjs/operators';
import { CustomTreeSettings } from 'src/app/models/Properties';
import { CustomTreesServices } from 'src/app/services/customTreesServices';
import { VBContext } from 'src/app/utils/VBContext';
import { ARTURIResource, ResAttribute } from "../../../models/ARTResources";
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
        let ctSettings: CustomTreeSettings = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().customTreeSettings;
        let cls: ARTURIResource = new ARTURIResource(ctSettings.type);
        let childProp: ARTURIResource = new ARTURIResource(ctSettings.hierarchicalProperty);
        let invDirection: boolean = ctSettings.inverseHierarchyDirection;
        let includeSubProp: boolean = ctSettings.includeSubProp;
        let includeSubcls: boolean = ctSettings.includeSubtype;
        return this.customTreeService.getChildrenResources(this.node, cls, childProp, invDirection, includeSubProp, includeSubcls).pipe(
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