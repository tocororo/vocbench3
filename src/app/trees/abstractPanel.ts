import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { CustomFormsServices } from "../services/customFormsServices";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ARTResource } from "../models/ARTResources";
import { CustomForm } from "../models/CustomForms";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";
import { AuthorizationEvaluator } from "../utils/AuthorizationEvaluator";
import { TreeListContext } from "../utils/UIUtils";
import { ResourcesServices } from "../services/resourcesServices";

@Component({
    selector: "panel",
    templateUrl: "./owl/classTreePanel/classTreePanelComponent.html", //placeholder template
})
export abstract class AbstractPanel {

    /**
     * VIEWCHILD, INPUTS / OUTPUTS
     */

    @Input() editable: boolean = true; //if true show the buttons to edit the tree/list
    @Input() deletable: boolean = true; //if true show the buttons to edit the tree/list
    @Input() readonly: boolean = false; //if true disable the buttons to edit the tree/list (useful to disable edit when exploring old version)
    @Input() context: TreeListContext; //useful in some scenarios (ex. scheme list to show/hide the checkboxes, concept and class panel to show/hide configuration button)
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    @Output() nodeDeleted = new EventEmitter<ARTURIResource>();
    @Output('advancedSearch') advancedSearchEvent: EventEmitter<ARTResource> = new EventEmitter();

    /**
     * ATTRIBUTES
     */

    abstract panelRole: RDFResourceRolesEnum; //declare the type of resources in the panel
    rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise
    showDeprecated: boolean = true;
    eventSubscriptions: any[] = [];
    selectedNode: ARTURIResource;

    /**
     * CONSTRUCTOR
     */
    protected cfService: CustomFormsServices;
    protected resourceService: ResourcesServices;
    protected basicModals: BasicModalServices;
    protected eventHandler: VBEventHandler;
    protected vbProp: VBProperties;
    constructor(cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, eventHandler: VBEventHandler, vbProp: VBProperties) {
        this.cfService = cfService;
        this.resourceService = resourceService;
        this.basicModals = basicModals;
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
    deprecate() {
        this.resourceService.setDeprecated(this.selectedNode).subscribe();
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

}