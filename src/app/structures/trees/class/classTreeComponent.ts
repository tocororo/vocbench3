import { ChangeDetectorRef, Component, Input, QueryList, SimpleChanges, ViewChildren } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { ClassesServices } from "../../../services/classesServices";
import { SearchServices } from "../../../services/searchServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { UIUtils } from "../../../utils/UIUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { AbstractTree } from "../abstractTree";
import { ClassTreeNodeComponent } from "./classTreeNodeComponent";

@Component({
    selector: "class-tree",
    templateUrl: "./classTreeComponent.html",
    host: { class: "treeListComponent" }
})
export class ClassTreeComponent extends AbstractTree {
    @Input('roots') rootClasses: ARTURIResource[];
    @Input() selectionOnInit: ARTURIResource; //specifies a resource to select after the tree init
    @Input() filterEnabled: boolean = false;

    //ClassTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ClassTreeNodeComponent) viewChildrenNode: QueryList<ClassTreeNodeComponent>;

    structRole = RDFResourceRolesEnum.cls;

    constructor(private clsService: ClassesServices, private searchService: SearchServices,
        eventHandler: VBEventHandler, basicModals: BasicModalServices, sharedModals: SharedModalServices, changeDetectorRef: ChangeDetectorRef) {
        super(eventHandler, basicModals, sharedModals, changeDetectorRef);
        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(
            (cls: ARTURIResource) => this.onTreeNodeDeleted(cls)));
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['rootClasses']) {
            this.init();
        }
    }

    initImpl() {
        if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesGetClassTaxonomy)) {
            this.unauthorized = true;
            return;
        }
        
        let clsTreeRoots: ARTURIResource[] = this.rootClasses;
        if (clsTreeRoots == undefined || clsTreeRoots.length == 0) {
            clsTreeRoots = [new ARTURIResource(VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().classTreePreferences.rootClassUri)];
        }

        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.clsService.getClassesInfo(clsTreeRoots, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
            roots => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                //sort by show if rendering is active, uri otherwise
                ResourceUtils.sortResources(roots, this.rendering ? SortAttribute.show : SortAttribute.value);
                this.roots = this.roots.concat(roots);
                if (this.selectionOnInit != null) {
                    this.openTreeAt(this.selectionOnInit);
                }
            },
            err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
        );
    }

    openTreeAt(node: ARTURIResource) {
        let rootForPath: ARTURIResource;
        if (this.rootClasses == undefined || this.rootClasses.length == 0) {
            rootForPath = new ARTURIResource(VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().classTreePreferences.rootClassUri);
        } else if (this.rootClasses != undefined && this.rootClasses.length == 1) {
            rootForPath = this.rootClasses[0];
        }
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.cls, null, null, null, null, null, rootForPath, 
            VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
            path => {
                if (path.length == 0) {
                    this.onTreeNodeNotFound(node);
                    return;
                }
                this.openRoot(path);
            }
        );
    }

}