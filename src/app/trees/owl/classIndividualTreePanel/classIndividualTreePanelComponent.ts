import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Subscription } from "rxjs";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../../models/ARTResources";
import { ClassIndividualPanelSearchMode, SearchSettings } from "../../../models/Properties";
import { IndividualsServices } from "../../../services/individualsServices";
import { SearchServices } from "../../../services/searchServices";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { TreeListContext, UIUtils } from "../../../utils/UIUtils";
import { ProjectContext, VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { ClassTreePanelComponent } from "../classTreePanel/classTreePanelComponent";
import { InstanceListPanelComponent } from "../instanceListPanel/instanceListPanelComponent";

/**
 * While classTreeComponent has as @Input rootClasses this componente cannot
 * because if it allows multiple roots, when the user wants to add a class (not a sublcass)
 * I don't know wich class consider as superClass of the new added class
 */

@Component({
    selector: "class-individual-tree-panel",
    templateUrl: "./classIndividualTreePanelComponent.html",
    host: { 
        class: "blockingDivHost vbox",
        '(mousemove)': 'onMousemove($event)',
        '(mouseup)': 'onMouseup()',
        '(mouseleave)': 'onMouseup()'
    }
})
export class ClassIndividualTreePanelComponent {
    @Input() readonly: boolean;
    @Input() editable: boolean;
    @Input() context: TreeListContext;
    @Input() projectCtx: ProjectContext;
    @Input() allowMultiselection: boolean = false; //if true allow the possibility to enable the multiselection in the contained tree/list
    @Output() classSelected = new EventEmitter<ARTURIResource>();
    @Output() instanceSelected = new EventEmitter<ARTURIResource>();
    @Output('advancedSearch') advancedSearchEvent: EventEmitter<ARTResource> = new EventEmitter();

    @ViewChild('blockDivClsIndList') public blockDivElement: ElementRef;
    //{ read: ElementRef } to specify to get the element instead of the component (see https://stackoverflow.com/q/45921819/5805661)
    @ViewChild('clsPanel', { read: ElementRef }) private classPanelRef: ElementRef; 
    @ViewChild('instPanel',  { read: ElementRef }) private instancePanelRef: ElementRef;

    @ViewChild(ClassTreePanelComponent) viewChildTree: ClassTreePanelComponent;
    @ViewChild(InstanceListPanelComponent) viewChildInstanceList: InstanceListPanelComponent;

    private rendering: boolean = false; //if true the nodes in the tree should be rendered with the show, with the qname otherwise

    private selectedClass: ARTURIResource = null;
    private selectedInstance: ARTURIResource;

    private rolesForSearch: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.individual];

    private eventSubscriptions: Subscription[] = [];

    constructor(private individualService: IndividualsServices, private searchService: SearchServices,
        private basicModals: BasicModalServices, private eventHandler: VBEventHandler) {

        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(
            (deletedRes: ARTURIResource) => this.onClassDeleted(deletedRes)));
        this.eventSubscriptions.push(eventHandler.instanceDeletedEvent.subscribe(
            (data: { instance: ARTURIResource, cls: ARTURIResource }) => this.onInstanceDeleted(data.instance)));
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    private doSearch(searchedText: string) {
        let searchSettings: SearchSettings = VBContext.getWorkingProjectCtx().getProjectPreferences().searchSettings;
        let searchRoles: RDFResourceRolesEnum[] = [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.individual];
        if (searchSettings.classIndividualSearchMode == ClassIndividualPanelSearchMode.onlyInstances) {
            searchRoles = [RDFResourceRolesEnum.individual];
        } else if (searchSettings.classIndividualSearchMode == ClassIndividualPanelSearchMode.onlyClasses) {
            searchRoles = [RDFResourceRolesEnum.cls];
        }
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.searchService.searchResource(searchedText, searchRoles, searchSettings.useLocalName, searchSettings.useURI, 
            searchSettings.useNotes, searchSettings.stringMatchMode, searchLangs, includeLocales).subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                if (searchResult.length == 0) {
                    this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                } else { //1 or more results
                    if (searchResult.length == 1) {
                        this.selectSearchedResource(searchResult[0]);
                    } else { //multiple results, ask the user which one select
                        ResourceUtils.sortResources(searchResult, this.rendering ? SortAttribute.show : SortAttribute.value);
                        this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, this.rendering).then(
                            (selectedResource: any) => {
                                this.selectSearchedResource(selectedResource);
                            },
                            () => { }
                        );
                    }
                }
            }
        );
    }

    /**
     * If resource is a class expands the class tree and select the resource,
     * otherwise (resource is an instance) expands the class tree to the class of the instance and
     * select the instance in the instance list
     */
    public selectSearchedResource(resource: ARTURIResource) {
        if (resource.getRole() == RDFResourceRolesEnum.cls) {
            this.viewChildTree.openTreeAt(resource);
        } else { // resource is an instance
            //get type of instance, then open the tree to that class
            this.individualService.getNamedTypes(resource).subscribe(
                types => {
                    this.viewChildTree.openTreeAt(types[0]);
                    //center instanceList to the individual
                    this.viewChildInstanceList.openAt(resource);
                }
            )
        }
    }

    public openClassTreeAt(resource: ARTURIResource) {
        if (resource.getRole() == RDFResourceRolesEnum.cls) {
            this.viewChildTree.openTreeAt(resource);
        }
    }

    //EVENT LISTENERS
    private onClassSelected(cls: ARTURIResource) {
        this.selectedClass = cls;
        if (this.selectedInstance != null) {
            this.selectedInstance.setAdditionalProperty(ResAttribute.SELECTED, false);
            this.selectedInstance = null;
        }
        if (cls != null) { //cls could be null if the underlaying classTree has been refreshed
            this.classSelected.emit(cls);
        }
    }

    private onInstanceSelected(instance: ARTURIResource) {
        this.selectedInstance = instance;
        //event could be fired after a refresh on the list, in that case, instance is null
        if (instance != null) { //forward the event only if instance is not null
            this.instanceSelected.emit(instance);
        }
    }

    private onClassDeleted(cls: ARTURIResource) {
        if (this.selectedClass.equals(cls)) {
            this.selectedClass = null;
        }
    }

    private onInstanceDeleted(instance: ARTURIResource) {
        if (this.selectedInstance.equals(instance)) {
            this.selectedInstance = null;
        }
    }

    /**
     * Handler of advancedSearch event, simply propagates the event
     * @param resource 
     */
    private advancedSearch(resource: ARTResource) {
        this.advancedSearchEvent.emit(resource);
    }

    //Draggable slider handler

    /**
     * There are two panel:
     * - class tree panel to the top:
     * The flex value varies between 16 and 4
     * - instance list panel to the bottom:
     * The flex value is fixed to 4
     * 
     * When resizing, it is changed just "classPanelFlex" between "minPanelSize" and "maxPanelSize"
     * The "minPanelSize" and "maxPanelSize" determine the proportion between the two panels left:right that is between 
     * minPanelSize:instancePanelFlex and maxPanelSize:instancePanelFlex (1:4 16:4)
     */

    private readonly maxPanelSize: number = 16;
    private readonly minPanelSize: number = 1;

    private classPanelFlex = 6;
    private readonly instancePanelFlex: number = 4;

    private dragging: boolean = false;
    private startMousedownY: number;

    private onMousedown(event: MouseEvent) {
        event.preventDefault();
        this.dragging = true;
        this.startMousedownY = event.clientY;
        this.onMousemove = this.draggingHandler; //set listener on mousemove
    }
    private onMouseup() {
        if (this.dragging) { //remove listener on mousemove
            this.onMousemove = (event: MouseEvent) => {};
            this.dragging = false;
        }
    }
    private onMousemove(event: MouseEvent) {}
    private draggingHandler(event: MouseEvent) {
        let endMousedownY = event.clientY;
        let diffY: number = this.startMousedownY - endMousedownY;
        // console.log("startMousedownY", this.startMousedownY, "endMousedownY", endMousedownY, "diffY ", diffY);
        let classPanelHeight: number = this.classPanelRef.nativeElement.offsetHeight;
        let instancePanelHeight: number = this.instancePanelRef.nativeElement.offsetHeight;
        /**
         * Compute the classPanelFlex based on the following mathematical proportion:
         *  classPanelHeight:instancePanelHeight = classPanelFlex:instancePanelFlex
         */
        this.classPanelFlex = (classPanelHeight-diffY)/(instancePanelHeight+diffY)*this.instancePanelFlex;

        //ration between class and instance panel should be always  between 4:1 and 1:4
        if (this.classPanelFlex > this.maxPanelSize) this.classPanelFlex = this.maxPanelSize;
        else if (this.classPanelFlex < this.minPanelSize) this.classPanelFlex = this.minPanelSize;
        //update the initial Y position of the cursor
        this.startMousedownY = event.clientY;
    }

}