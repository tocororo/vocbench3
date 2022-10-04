import { ChangeDetectorRef, Component, QueryList, ViewChildren } from "@angular/core";
import { CustomTreeSettings } from 'src/app/models/Properties';
import { CustomTreesServices } from 'src/app/services/customTreesServices';
import { VBContext } from 'src/app/utils/VBContext';
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { SearchServices } from "../../../services/searchServices";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { UIUtils } from "../../../utils/UIUtils";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { AbstractTree } from "../abstractTree";
import { CustomTreeNodeComponent } from './customTreeNodeComponent';

@Component({
    selector: "custom-tree",
    templateUrl: "./customTreeComponent.html",
    host: { class: "treeListComponent" }
})
export class CustomTreeComponent extends AbstractTree {

    @ViewChildren(CustomTreeNodeComponent) viewChildrenNode: QueryList<CustomTreeNodeComponent>;

    structRole = RDFResourceRolesEnum.undetermined;

    constructor(private customTreeService: CustomTreesServices, private searchService: SearchServices,
        eventHandler: VBEventHandler, basicModals: BasicModalServices, sharedModals: SharedModalServices, changeDetectorRef: ChangeDetectorRef) {
        super(eventHandler, basicModals, sharedModals, changeDetectorRef);

        this.eventSubscriptions.push(this.eventHandler.customTreeSettingsChangedEvent.subscribe(
            () => this.init()
        ));
    }

    initImpl() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);

        //sort by show if rendering is active, uri otherwise
        let orderAttribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;

        let ctSettings: CustomTreeSettings = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().customTreeSettings;
        
        //check necessary since customTreeSettingsChangedEvent might be handled before the tabset in Data is updated (so CTree might be still present but no config available)
        if (!ctSettings.enabled) return;
        this.customTreeService.getRoots().subscribe(
            roots => {
                ResourceUtils.sortResources(roots, orderAttribute);
                this.roots = roots;
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            },
            err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
        );
    }

    openTreeAt(node: ARTURIResource) {
    }

}