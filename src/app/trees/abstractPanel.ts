import { Component, EventEmitter, Input, Output } from "@angular/core";
import { GraphModalServices } from "../graph/modal/graphModalServices";
import { GraphMode } from "../graph/abstractGraph";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../models/ARTResources";
import { CustomFormsServices } from "../services/customFormsServices";
import { ResourcesServices } from "../services/resourcesServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { TreeListContext } from "../utils/UIUtils";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";

@Component({})
export abstract class AbstractPanel {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() editable: boolean = true; //if true show the buttons to edit the tree/list
    @Input() deletable: boolean = true; //if true show the buttons to edit the tree/list
    @Input() readonly: boolean = false; //if true disable the buttons to edit the tree/list (useful to disable edit when exploring old version)
    @Input() allowMultiselection: boolean = false; //if true allow the possibility to enable the multiselection in the contained tree/list
    @Input() context: TreeListContext; //useful in some scenarios (ex. scheme list to show/hide the checkboxes, concept and class panel to show/hide configuration button)
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Output() nodeDeleted = new EventEmitter<ARTURIResource>();
    @Output() nodeChecked = new EventEmitter<ARTURIResource[]>();
    @Output() multiselectionStatus = new EventEmitter<boolean>(); //emitted when the multiselection changes status (activated/deactivated)
    @Output('advancedSearch') advancedSearchEvent: EventEmitter<ARTResource> = new EventEmitter();

    /**
     * ATTRIBUTES
     */

    abstract panelRole: RDFResourceRolesEnum; //declare the type of resources in the panel
    rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise
    multiselection: boolean = false; //if true enabled the selection of multiple resources via checkboxes
    showDeprecated: boolean = true;
    eventSubscriptions: any[] = [];
    selectedNode: ARTURIResource = null;

    // abstract graphMode: GraphMode;
    graphMode: GraphMode = GraphMode.modelOriented; //at the moment, set the default to data oriented and override it in concept and individuals panel. Restore the abstract later

    /**
     * CONSTRUCTOR
     */
    protected cfService: CustomFormsServices;
    protected resourceService: ResourcesServices;
    protected basicModals: BasicModalServices;
    protected graphModals: GraphModalServices;
    protected eventHandler: VBEventHandler;
    protected vbProp: VBProperties;
    constructor(cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, graphModals: GraphModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties) {
        this.cfService = cfService;
        this.resourceService = resourceService;
        this.basicModals = basicModals;
        this.graphModals = graphModals;
        this.eventHandler = eventHandler;
        this.vbProp = vbProp;

        this.eventSubscriptions.push(eventHandler.showDeprecatedChangedEvent.subscribe(
            (showDeprecated: boolean) => this.showDeprecated = showDeprecated));
    }

    /**
     * METHODS
     */

    ngOnInit() {
        this.showDeprecated = this.vbProp.getShowDeprecated();
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    //actions
    abstract refresh(): void;
    abstract delete(): void;

    private deprecate() {
        this.resourceService.setDeprecated(this.selectedNode).subscribe();
    }

    private toggleMultiselection() {
        this.multiselection = !this.multiselection;
        this.multiselectionStatus.emit(this.multiselection);
    }

    protected openGraph() {
        this.graphModals.openExplorationGraph(this.selectedNode, this.graphMode);
    }

    //the following determine if the create/delete buttons are disabled in the UI. They could be overriden in the extending components
    isCreateDisabled(): boolean {
        return (this.readonly || !AuthorizationEvaluator.Tree.isCreateAuthorized(this.panelRole));
    }
    isDeleteDisabled(): boolean {
        return (
            !this.selectedNode || !this.selectedNode.getAdditionalProperty(ResAttribute.EXPLICIT) || this.readonly ||
            !AuthorizationEvaluator.Tree.isDeleteAuthorized(this.panelRole)
        );
    }
    isDeprecateDisabled(): boolean {
        return (
            !this.selectedNode || !this.selectedNode.getAdditionalProperty(ResAttribute.EXPLICIT) || this.readonly ||
            !AuthorizationEvaluator.Tree.isDeprecateAuthorized(this.selectedNode)
        );
    }

    isOpenGraphEnabled(): boolean {
        return this.selectedNode && this.isContextDataPanel() && this.vbProp.getExperimentalFeaturesEnabled();
    }

    isContextDataPanel(): boolean {
        return this.context == TreeListContext.dataPanel;
    }

    abstract doSearch(searchedText: string): void;

    /**
     * Handler of advancedSearch event, simply propagates the event
     * @param resource
     */
    private advancedSearch(resource: ARTResource) {
        this.advancedSearchEvent.emit(resource);
    }

    onNodeSelected(node: ARTURIResource) {
        this.selectedNode = node;
        this.nodeSelected.emit(node);
    }

    onNodeChecked(nodes: ARTURIResource[]) {
        this.nodeChecked.emit(nodes);
    }

}