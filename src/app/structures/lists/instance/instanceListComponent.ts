import { Component, EventEmitter, Input, Output, QueryList, SimpleChanges, ViewChildren } from "@angular/core";
import { Observable, of } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../../models/ARTResources";
import { InstanceListPreference, InstanceListVisualizationMode, SafeToGo, SafeToGoMap } from "../../../models/Properties";
import { SemanticTurkey } from "../../../models/Vocabulary";
import { ClassesServices } from "../../../services/classesServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { TreeListContext, UIUtils } from "../../../utils/UIUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { InstanceDeleteUndoData, VBEventHandler } from "../../../utils/VBEventHandler";
import { AbstractList } from "../abstractList";
import { InstanceListNodeComponent } from "./instanceListNodeComponent";

@Component({
    selector: "instance-list",
    templateUrl: "./instanceListComponent.html",
    host: { class: "treeListComponent" }
})
export class InstanceListComponent extends AbstractList {
    @Input() cls: ARTURIResource;
    @Output() switchMode = new EventEmitter<InstanceListVisualizationMode>(); //requires to the parent panel to switch mode

    //InstanceListNodeComponent children of this Component (useful to select the instance during the search)
    @ViewChildren(InstanceListNodeComponent) viewChildrenNode: QueryList<InstanceListNodeComponent>;

    private pendingSearchCls: ARTURIResource; //class of a searched instance that is waiting to be selected once the list is initialized

    visualizationMode: InstanceListVisualizationMode;//this could be changed dynamically, so each time it is used, get it again from preferences

    private safeToGoLimit: number;
    safeToGo: SafeToGo = { safe: true };

    structRole = RDFResourceRolesEnum.individual;

    list: ARTResource[] = [];

    translationParam: { count: number, safeToGoLimit: number };

    constructor(private clsService: ClassesServices, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.instanceDeletedEvent.subscribe(
            (data: {instance: ARTResource, cls: ARTResource}) => { 
                if (this.cls == null) return;
                if (data.cls.equals(this.cls)) this.onListNodeDeleted(data.instance); 
            }
        ));
        this.eventSubscriptions.push(eventHandler.instanceCreatedEvent.subscribe(
            (data: {instance: ARTResource, cls: ARTResource}) => { 
                if (this.cls == null) return;
                if (data.cls.equals(this.cls)) this.onListNodeCreated(<ARTURIResource>data.instance); 
            } 
        ));
        this.eventSubscriptions.push(eventHandler.typeRemovedEvent.subscribe(
            (data: {resource: ARTResource, type: ARTResource}) => this.onTypeRemoved(data.resource, <ARTURIResource>data.type)));
        this.eventSubscriptions.push(eventHandler.instanceDeletedUndoneEvent.subscribe(
            (data: InstanceDeleteUndoData) => {
                if (this.cls == null) return;
                if (data.types.some(t => t.equals(this.cls))) {
                    this.list.push(data.resource);
                }
            }
        ));
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['cls']) {
            this.init();
        }
    }

    initImpl() {
        if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesGetInstances)) {
            return;
        }

        this.visualizationMode = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().instanceListPreferences.visualization;
        if (this.cls != null) { //class provided => init list
            if (this.visualizationMode == InstanceListVisualizationMode.standard) {
                this.checkInitializationSafe().subscribe(
                    () => {
                        if (this.safeToGo.safe) {
                            UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
                            this.clsService.getInstances(this.cls, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
                                instances => {
                                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                                    //sort by show if rendering is active, uri otherwise
                                    ResourceUtils.sortResources(instances, this.rendering ? SortAttribute.show : SortAttribute.value);
                                    this.list = instances;
                                    this.resumePendingSearch();
                                }
                            );
                        }
                    }
                )
            } else { //search based
                //reset to empty list and check for pending search
                this.forceList(null);
                this.resumePendingSearch();
            }
        } else { //class not provided, reset the instance list
            //setTimeout prevent ExpressionChangedAfterItHasBeenCheckedError on isOpenGraphEnabled('dataOriented') in the parent panel
            setTimeout(() => {
                this.setInitialStatus();
            });
        }
    }

    private resumePendingSearch() {
        // if there is some pending search where the class is same class which instance are currently described
        if (
            this.pendingSearchRes && 
            (
                (this.pendingSearchCls && this.pendingSearchCls.equals(this.cls)) || 
                !this.pendingSearchCls //null if already checked that the pendingSearchCls is the current (see selectSearchedInstance)
            )
        ) {
            if (VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().instanceListPreferences.visualization == InstanceListVisualizationMode.standard) {
                this.openListAt(this.pendingSearchRes); //standard mode => simply open list (focus searched res)
            } else { //search mode => set the pending searched resource as only element of the list and then focus it
                this.forceList([this.pendingSearchRes]);
                setTimeout(() => {
                    this.openListAt(this.pendingSearchRes);
                });
            }
        }
    }

    selectNode(node: ARTURIResource) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }

    /**
     * Perform a check in order to prevent the initialization of the structure with too many elements
     * Return true if the initialization is safe or if the user agreed to init the structure anyway
     */
    private checkInitializationSafe(): Observable<void> {
        let instListPreference: InstanceListPreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().instanceListPreferences;
        let safeToGoMap: SafeToGoMap = instListPreference.safeToGoMap;
        this.safeToGoLimit = instListPreference.safeToGoLimit;

        let checksum = this.getInitRequestChecksum();

        let safeness: SafeToGo = safeToGoMap[checksum];
        if (safeness != null) { //found safeness in cache
            this.safeToGo = safeness;
            this.translationParam = { count: this.safeToGo.count, safeToGoLimit: this.safeToGoLimit };
            return of(null)
        } else { //never initialized => count
            UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
            return this.getNumberOfInstances(this.cls).pipe(
                mergeMap(count => {
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                    safeness = { safe: count < this.safeToGoLimit, count: count }; 
                    safeToGoMap[checksum] = safeness; //cache the safeness
                    this.safeToGo = safeness;
                    this.translationParam = { count: this.safeToGo.count, safeToGoLimit: this.safeToGoLimit };
                    return of(null)
                })
            );
        }
    }

    private getInitRequestChecksum() {
        let checksum = "cls:" + this.cls.toNT();
        return checksum;
    }

    /**
     * Forces the safeness of the structure even if it was reported as not safe, then re initialize it
     */
    forceSafeness() {
        this.safeToGo = { safe: true };
        let instListPreference: InstanceListPreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().instanceListPreferences;
        let safeToGoMap: SafeToGoMap = instListPreference.safeToGoMap;
        let checksum = this.getInitRequestChecksum();
        safeToGoMap[checksum] = this.safeToGo;
        this.initImpl();
    }

    /**
     * Returns the number of instances of the given class. Useful when the user select a class in order to check if there 
     * are too many instances.
     * @param cls 
     */
    private getNumberOfInstances(cls: ARTURIResource): Observable<number> {
        if (VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().classTreePreferences.showInstancesNumber) { //if num inst are already computed when building the tree...
            return of(this.cls.getAdditionalProperty(ResAttribute.NUM_INST));
        } else { //otherwise call a service
            return this.clsService.getNumberOfInstances(cls, VBRequestOptions.getRequestOptions(this.projectCtx));
        }
    }

    public forceList(list: ARTURIResource[]) {
        this.setInitialStatus();
        this.list = list;
    }

    //EVENT LISTENERS
    onListNodeDeleted(node: ARTResource) {
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].equals(node)) {
                if (VBContext.getWorkingProject().isValidationEnabled()) {
                    //replace the resource instead of simply change the graphs, so that the rdfResource detect the change
                    let stagedRes: ARTResource = this.list[i].clone();
                    stagedRes.setGraphs([new ARTURIResource(SemanticTurkey.stagingRemoveGraph + VBContext.getWorkingProject().getBaseURI())]);
                    stagedRes.setAdditionalProperty(ResAttribute.EXPLICIT, false);
                    stagedRes.setAdditionalProperty(ResAttribute.SELECTED, false);
                    this.list[i] = stagedRes;
                } else {
                    this.list.splice(i, 1);
                }
                break;
            }
        }
    }

    onResourceCreatedUndone(node: ARTResource) {
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].equals(node)) {
                this.list.splice(i, 1);
                break;
            }
        }
    }

    onListNodeCreated(node: ARTURIResource) {
        this.list.unshift(node);
        if (this.context == TreeListContext.addPropValue) {
            this.selectNode(node);
        }
    }

    private onTypeRemoved(instance: ARTResource, cls: ARTURIResource) {
        //check of cls not undefined is required if instance list has never been initialized with an @Input class
        if (this.cls && this.cls.equals(cls)) {
            for (let i = 0; i < this.list.length; i++) {
                if (this.list[i].equals(instance)) {
                    this.list.splice(i, 1);
                    break;
                }
            }
        }
    }

}