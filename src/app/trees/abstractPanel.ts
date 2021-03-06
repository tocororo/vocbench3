import { EventEmitter, Input, Output } from "@angular/core";
import { Subscription } from "rxjs";
import { GraphMode } from "../graph/abstractGraph";
import { GraphModalServices } from "../graph/modal/graphModalServices";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../models/ARTResources";
import { CustomFormsServices } from "../services/customFormsServices";
import { ResourcesServices } from "../services/resourcesServices";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { ActionDescription, RoleActionResolver } from "../utils/RoleActionResolver";
import { TreeListContext } from "../utils/UIUtils";
import { VBActionFunctionCtx } from "../utils/VBActions";
import { ProjectContext, VBContext } from "../utils/VBContext";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { MultiSubjectEnrichmentHelper } from "./multiSubjectEnrichmentHelper";

export abstract class AbstractPanel {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() editable: boolean = true; //if true show the buttons to edit the tree/list
    @Input() deletable: boolean = true; //if true show the buttons to edit the tree/list
    @Input() readonly: boolean = false; //if true disable the buttons to edit the tree/list (useful to disable edit when exploring old version)
    @Input() allowMultiselection: boolean = false; //if true allow the possibility to enable the multiselection in the contained tree/list
    @Input() context: TreeListContext; //useful in some scenarios (ex. scheme list to show/hide the checkboxes, concept and class panel to show/hide configuration button)
    @Input() projectCtx: ProjectContext; //useful to make the panel (the underlying tree or list) work with another project, different from the open one
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
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
    eventSubscriptions: Subscription[] = [];
    selectedNode: ARTURIResource = null;
    checkedNodes: ARTURIResource[] = [];

    panelActions: ActionDescription[];

    /**
     * CONSTRUCTOR
     */
    protected cfService: CustomFormsServices;
    protected resourceService: ResourcesServices;
    protected basicModals: BasicModalServices;
    protected graphModals: GraphModalServices;
    protected eventHandler: VBEventHandler;
    protected vbProp: VBProperties;
    protected actionResolver: RoleActionResolver;
    protected multiEnrichment: MultiSubjectEnrichmentHelper;
    constructor(cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, graphModals: GraphModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties, actionResolver: RoleActionResolver, multiEnrichment: MultiSubjectEnrichmentHelper) {
        this.cfService = cfService;
        this.resourceService = resourceService;
        this.basicModals = basicModals;
        this.graphModals = graphModals;
        this.eventHandler = eventHandler;
        this.vbProp = vbProp;
        this.actionResolver = actionResolver;
        this.multiEnrichment = multiEnrichment;

        this.eventSubscriptions.push(eventHandler.showDeprecatedChangedEvent.subscribe(
            (showDeprecated: boolean) => this.showDeprecated = showDeprecated));
    }

    /**
     * METHODS
     */

    ngOnInit() {
        this.showDeprecated = this.vbProp.getShowDeprecated();
        this.panelActions = this.actionResolver.getActionsForRole(this.panelRole);
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    //actions
    abstract refresh(): void;

    /**
     * returns the action context to be used during the execution of the action
     */
    abstract getActionContext(role?: RDFResourceRolesEnum): VBActionFunctionCtx; 
    /**
     * Executes an action
     * @param act 
     */
    abstract executeAction(act: ActionDescription, role?: RDFResourceRolesEnum): void;

    /**
     * An action is visible in the buttons group (that is in turn visible only if the panel is editable) if:
     * - it creates a resource (edit type C)
     * - it deletes a resource and the panel instance allows deletion (deletable true)
     */
    isActionVisible(action: ActionDescription) {
        return action.editType == "C" || (action.editType == "D" && this.deletable);
    }

    /**
     * An action is disabled if:
     * - the panel instance is readonly
     * - the action is not authorized (user capabilities don't satisfy the required authorization)
     * - a selection of a resource is required but
     *      - a resource is not selected
     *      - a resource is selected but it is required to be explicit and it is not
     */
    isActionDisabled(action: ActionDescription) {
        /**
         * Below distinguish the check on the authorization between the case when selection is not required and when it is required.
         * This is necessary in order to avoid to invoke isAuthorized with a null selectedNode when it is required instead
         */
        return (
            this.readonly ||
            !action.conditions.pre.selectionRequired && !AuthorizationEvaluator.isAuthorized(action.id) ||
            action.conditions.pre.selectionRequired && (
                !this.selectedNode || 
                (action.conditions.pre.explicitRequired && !this.selectedNode.getAdditionalProperty(ResAttribute.EXPLICIT)) ||
                !AuthorizationEvaluator.isAuthorized(action.id, this.selectedNode)
            )
        )

    }

    private toggleMultiselection() {
        this.multiselection = !this.multiselection;
        this.multiselectionStatus.emit(this.multiselection);
    }

    protected openDataGraph() {
        this.graphModals.openDataGraph(this.selectedNode, this.rendering);
    }
    
    protected openModelGraph() {
        this.graphModals.openModelGraph(null, this.rendering);
    }

    private enrichMultiSubject() {
        this.multiEnrichment.enrichMultiSubject(this.checkedNodes);
    }

    /**
     * Open data/model-oriented graph is available only if:
     * - the panel is in the data page panel
     * - there is a selected node (in case of graph mode data-oriented)
     * @param graphMode 
     */
    isOpenGraphEnabled(graphMode?: GraphMode): boolean {
        if (this.context != TreeListContext.dataPanel) {
            return false;
        }
        if (graphMode == null) { //no graph mode provided => tells if at least one of the two mode is available
            return this.isOpenGraphEnabled(GraphMode.dataOriented) || this.isOpenGraphEnabled(GraphMode.modelOriented);
        } else {
            if (graphMode == GraphMode.dataOriented) {
                return this.selectedNode != null;
            } else { //model oriented
                return true;
            }    
        }
    }

    /**
     * Settings of a project are editable only if the panel is in the data page and if it is about the project opened, not a contextual project
     */
    isOpenSettingsAvailable(): boolean {
        return this.projectCtx == null && this.isContextDataPanel();
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
        this.checkedNodes = nodes;
        this.nodeChecked.emit(nodes);
    }

    //UTILS

    isContextDataPanel(): boolean {
        return this.context == TreeListContext.dataPanel;
    }

}