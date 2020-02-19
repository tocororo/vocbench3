import { Component, Input, QueryList, SimpleChanges, ViewChildren } from "@angular/core";
import { Observable } from "rxjs";
import { ARTURIResource, RDFResourceRolesEnum, ResAttribute, ARTResource } from "../../../models/ARTResources";
import { SemanticTurkey } from "../../../models/Vocabulary";
import { ClassesServices } from "../../../services/classesServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { UIUtils } from "../../../utils/UIUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { AbstractList } from "../../abstractList";
import { InstanceListNodeComponent } from "./instanceListNodeComponent";

@Component({
    selector: "instance-list",
    templateUrl: "./instanceListComponent.html",
    host: { class: "treeListComponent" }
})
export class InstanceListComponent extends AbstractList {
    @Input() cls: ARTURIResource;

    //InstanceListNodeComponent children of this Component (useful to select the instance during the search)
    @ViewChildren(InstanceListNodeComponent) viewChildrenNode: QueryList<InstanceListNodeComponent>;

    private pendingSearchCls: ARTURIResource; //class of a searched instance that is waiting to be selected once the list is initialized

    private viewInitialized: boolean = false;//useful to avoid ngOnChanges calls initList when the view is not initialized

    private instanceLimit: number = 10000;

    structRole = RDFResourceRolesEnum.individual;

    list: ARTResource[] = [];

    constructor(private clsService: ClassesServices, private basicModals: BasicModalServices, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.instanceDeletedEvent.subscribe(
            (data: any) => { 
                if (this.cls == null) return; //in case there are multiple InstanceListComponent initialized and one of them has cls null
                if (data.cls.getURI() == this.cls.getURI()) this.onListNodeDeleted(data.instance); 
            }
        ));
        this.eventSubscriptions.push(eventHandler.instanceCreatedEvent.subscribe(
            (data: any) => { 
                if (this.cls == null) return; //in case there are multiple InstanceListComponent initialized and one of them has cls null
                if (data.cls.getURI() == this.cls.getURI()) this.onListNodeCreated(data.instance); 
            } 
        ));
        this.eventSubscriptions.push(eventHandler.typeRemovedEvent.subscribe(
            (data: any) => this.onTypeRemoved(data.resource, data.type)));
    }

    ngOnChanges(changes: SimpleChanges) {
        //viewInitialized needed to prevent the initialization of the list before view is initialized
        if (this.viewInitialized) {
            if (changes['cls']) {
                if (this.cls != null) {
                    this.getNumberOfInstances(this.cls).subscribe(
                        numInst => {
                            if (numInst > this.instanceLimit) {
                                this.basicModals.confirm("Too much instances", "Warning: the selected class (" + this.cls.getShow() 
                                    + ") has too many instances (" + numInst + "). Retrieving them all could be a very long process "
                                    + "and it may slow down the server. Do you want to continue anyway?", "warning").then(
                                    (confirm: any) => {
                                        this.init();
                                    },
                                    (cancel: any) =>  {
                                        this.list = [];
                                    }
                                );
                            } else {
                                this.init();
                            }
                        }
                    );
                } else { //class not provided
                    //setTimeout prevent ExpressionChangedAfterItHasBeenCheckedError on isOpenGraphEnabled('dataOriented') in the parent panel
                    setTimeout(() => {
                        this.init(); //this will reset the list
                    });
                }
            }
        }
    }

    ngAfterViewInit() {
        this.viewInitialized = true;
        this.init();
    }

    initImpl() {
        if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.classesGetInstances)) {
            return;
        }

        if (this.cls != undefined) {
            UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
            this.clsService.getInstances(this.cls, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
                instances => {
                    //sort by show if rendering is active, uri otherwise
                    ResourceUtils.sortResources(instances, this.rendering ? SortAttribute.show : SortAttribute.value);
                    this.list = instances;
                    // if there is some pending search where the class is same class which instance are currently described
                    if (
                        this.pendingSearchRes && 
                        (
                            (this.pendingSearchCls && this.pendingSearchCls.getURI() == this.cls.getURI()) || 
                            !this.pendingSearchCls //null if already checked that the pendingSearchCls is the current (see selectSearchedInstance)
                        )
                    ) {
                        this.openListAt(this.pendingSearchRes);
                    }
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                }
            );
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
     * Returns the number of instances of the given class. Useful when the user select a class in order to check if there 
     * are too many instances.
     * @param cls 
     */
    private getNumberOfInstances(cls: ARTURIResource): Observable<number> {
        if (VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().classTreePreferences.showInstancesNumber) { //if num inst are already computed when building the tree...
            return Observable.of(this.cls.getAdditionalProperty(ResAttribute.NUM_INST));
        } else { //otherwise call a service
            return this.clsService.getNumberOfInstances(cls, VBRequestOptions.getRequestOptions(this.projectCtx));
        }
    }

    //EVENT LISTENERS
    onListNodeDeleted(node: ARTURIResource) {
        for (var i = 0; i < this.list.length; i++) {
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

    onListNodeCreated(node: ARTURIResource) {
        this.list.unshift(node);
    }

    private onTypeRemoved(instance: ARTURIResource, cls: ARTURIResource) {
        //check of cls not undefined is required if instance list has never been initialized with an @Input class
        if (this.cls && this.cls.getURI() == cls.getURI()) {
            for (var i = 0; i < this.list.length; i++) {
                if (this.list[i].equals(instance)) {
                    this.list.splice(i, 1);
                    break;
                }
            }
        }
    }

}