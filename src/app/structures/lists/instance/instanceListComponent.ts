import { Component, Input, QueryList, SimpleChanges, ViewChildren } from "@angular/core";
import { Observable, of } from "rxjs";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../../models/ARTResources";
import { InstanceListVisualizationMode } from "../../../models/Properties";
import { SemanticTurkey } from "../../../models/Vocabulary";
import { ClassesServices } from "../../../services/classesServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { TreeListContext, UIUtils } from "../../../utils/UIUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { SelectionOption } from "../../../widget/modal/basicModal/selectionModal/selectionModal";
import { AbstractList } from "../abstractList";
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

    private instanceLimit: number = 10000;

    structRole = RDFResourceRolesEnum.individual;

    list: ARTResource[] = [];

    constructor(private clsService: ClassesServices, private vbProp: VBProperties, private basicModals: BasicModalServices, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.instanceDeletedEvent.subscribe(
            (data: {instance: ARTResource, cls: ARTResource}) => { 
                if (this.cls == null) return; //in case there are multiple InstanceListComponent initialized and one of them has cls null
                if (data.cls.equals(this.cls)) this.onListNodeDeleted(data.instance); 
            }
        ));
        this.eventSubscriptions.push(eventHandler.instanceCreatedEvent.subscribe(
            (data: {instance: ARTResource, cls: ARTResource}) => { 
                if (this.cls == null) return; //in case there are multiple InstanceListComponent initialized and one of them has cls null
                if (data.cls.equals(this.cls)) this.onListNodeCreated(<ARTURIResource>data.instance); 
            } 
        ));
        this.eventSubscriptions.push(eventHandler.typeRemovedEvent.subscribe(
            (data: {resource: ARTResource, type: ARTResource}) => this.onTypeRemoved(data.resource, <ARTURIResource>data.type)));
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

        let visualizationMode = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().instanceListPreferences.visualization;
        if (this.cls != null) { //class provided => init list
            if (visualizationMode == InstanceListVisualizationMode.standard) {
                this.getNumberOfInstances(this.cls).subscribe(
                    numInst => {
                        if (numInst > this.instanceLimit) { //too much instances => ask user
                            let opts: SelectionOption[] = [
                                { value: "Continue anyway", description: null },
                                { 
                                    value: "Switch visualization of instance list to search-based mode", 
                                    description: "Visualization mode can be changed also from the instance panel settings"
                                },
                            ]
                            this.basicModals.select({key:"DATA.INSTANCE.UNSAFE_WARN.TOO_MANY_ELEM"}, "Warning: the selected class (" + this.cls.getShow() 
                                + ") has too many instances (" + numInst + "). Retrieving them all could be a very long process, "
                                + "you might experience performance decrease. What do you want to do?", opts, ModalType.warning)
                            .then(
                                (choice: SelectionOption) => {
                                    if (choice == opts[0]) { //continue anyway
                                        this.initStandardModeInstanceList();
                                    } else { //swith to search based and reinit the list
                                        this.vbProp.setInstanceListVisualization(InstanceListVisualizationMode.searchBased);
                                        this.initImpl();
                                    }
                                },
                                () => {} //canceled
                            );
                        } else { //limited insances => init list
                            this.initStandardModeInstanceList();
                        }
                    }
                );
            } else { //search based
                //don't do nothing, just check for pending search
                this.resumePendingSearch();
            }
        } else { //class not provided, reset the instance list
            //setTimeout prevent ExpressionChangedAfterItHasBeenCheckedError on isOpenGraphEnabled('dataOriented') in the parent panel
            setTimeout(() => {
                this.setInitialStatus();
            });
        }
    }

    private initStandardModeInstanceList() {
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
        if (this.context == TreeListContext.addPropValue) {
            this.selectNode(node);
        }
    }

    private onTypeRemoved(instance: ARTResource, cls: ARTURIResource) {
        //check of cls not undefined is required if instance list has never been initialized with an @Input class
        if (this.cls && this.cls.equals(cls)) {
            for (var i = 0; i < this.list.length; i++) {
                if (this.list[i].equals(instance)) {
                    this.list.splice(i, 1);
                    break;
                }
            }
        }
    }

}