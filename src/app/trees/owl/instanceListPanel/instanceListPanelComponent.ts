import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { Observable } from "rxjs";
import { GraphModalServices } from "../../../graph/modal/graphModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { SearchSettings } from "../../../models/Properties";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { IndividualsServices } from "../../../services/individualsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SearchServices } from "../../../services/searchServices";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { ActionDescription, RoleActionResolver } from "../../../utils/RoleActionResolver";
import { TreeListContext, UIUtils } from "../../../utils/UIUtils";
import { VBActionFunctionCtx } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { AbstractListPanel } from "../../abstractListPanel";
import { MultiSubjectEnrichmentHelper } from "../../multiSubjectEnrichmentHelper";
import { InstanceListComponent } from "../instanceList/instanceListComponent";

@Component({
    selector: "instance-list-panel",
    templateUrl: "./instanceListPanelComponent.html",
    host: { class: "vbox" }
})
export class InstanceListPanelComponent extends AbstractListPanel {
    @Input() hideSearch: boolean = false; //if true hide the search bar
    @Input() cls: ARTURIResource; //class of the instances
    @Output() classChange: EventEmitter<ARTURIResource> = new EventEmitter(); //event emitted when, due to a search, a class change is required

    @ViewChild(InstanceListComponent) viewChildInstanceList: InstanceListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.individual;
    rendering: boolean = false; //override the value in AbstractPanel

    constructor(private searchService: SearchServices, private individualService: IndividualsServices,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, graphModals: GraphModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties, actionResolver: RoleActionResolver, multiEnrichment: MultiSubjectEnrichmentHelper) {
        super(cfService, resourceService, basicModals, graphModals, eventHandler, vbProp, actionResolver, multiEnrichment);
    }

    getActionContext(): VBActionFunctionCtx {
        let actionCtx: VBActionFunctionCtx = { metaClass: this.cls, loadingDivRef: this.viewChildInstanceList.blockDivElement }
        return actionCtx;
    }

    //@Override
    isActionDisabled(action: ActionDescription) {
        //In addition to the cross-panel conditions, in this case the actions are disabled if the panel has no input cls
        return super.isActionDisabled(action) || !this.cls
    }

    // //@Override
    // isCreateDisabled(): boolean {
    //     return (!this.cls || this.readonly || !AuthorizationEvaluator.Tree.isCreateAuthorized(this.panelRole));
    // }
    // //@Override
    // isDeleteDisabled(): boolean {
    //     return (
    //         !this.cls || !this.selectedNode || !this.selectedNode.getAdditionalProperty(ResAttribute.EXPLICIT) || 
    //         this.readonly || !AuthorizationEvaluator.Tree.isDeleteAuthorized(this.panelRole)
    //     );
    // }

    // private create() {
    //     this.creationModals.newResourceCf("Create a new instance of " + this.cls.getShow(), this.cls, false).then(
    //         (data: any) => {
    //             this.classesService.createInstance(data.uriResource, this.cls, data.cfValue).subscribe();
    //         },
    //         () => {}
    //     );
    // }

    // delete() {
    //     UIUtils.startLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement);
    //     this.classesService.deleteInstance(this.selectedNode, this.cls).subscribe(
    //         stResp => {
    //             this.selectedNode = null;
    //             UIUtils.stopLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement);
    //         },
    //         err => { UIUtils.stopLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement); }
    //     )
    // }

    refresh() {
        this.viewChildInstanceList.init();
    }

    //search handlers

    doSearch(searchedText: string) {
        let searchSettings: SearchSettings = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().searchSettings;
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        let searchFn: Observable<ARTURIResource[]>;
        if (this.extendSearchToAllIndividuals()) {
            searchFn = this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.individual], searchSettings.useLocalName, 
                searchSettings.useURI, searchSettings.useNotes, searchSettings.stringMatchMode, searchLangs, includeLocales, null, 
                VBRequestOptions.getRequestOptions(this.projectCtx));
        } else { //search only in current class
            searchFn = this.searchService.searchInstancesOfClass(this.cls, searchedText, searchSettings.useLocalName, 
                searchSettings.useURI, searchSettings.useNotes, searchSettings.stringMatchMode, searchLangs, includeLocales, 
                VBRequestOptions.getRequestOptions(this.projectCtx));
        }
        UIUtils.startLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement);
        searchFn.subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement);
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
        if (this.extendSearchToAllIndividuals()) {
            //get type of instance, then open the tree to that class
            this.individualService.getNamedTypes(resource).subscribe(
                types => {
                    this.getClassOfIndividual(resource, types).subscribe(
                        cls => {
                            if (cls != null) {
                                if (cls.equals(this.cls)) { //searched individual belongs to the current class
                                    this.viewChildInstanceList.openListAt(resource);
                                } else { //searched individual belongs to another class
                                    //require to parent to switch class
                                    this.classChange.emit(types[0]);
                                    //and invoke to open list in order to store the search as pending
                                    this.viewChildInstanceList.openListAt(resource);
                                }
                            } //cls == null means that user has canceled the operation
                        }
                    )
                }
            )
        } else {
            this.viewChildInstanceList.openListAt(resource);
        }
    }

    /**
     * After a search of an individual that belongs to a different class, returns the class to switch to
     */
    private getClassOfIndividual(individual: ARTURIResource, types: ARTURIResource[]): Observable<ARTURIResource> {
        if (types.some(t => t.equals(this.cls))) { //simplest case: searched individual belongs to the current selected class
            return Observable.of(this.cls);
        } else {
            if (types.length == 1) {
                return Observable.fromPromise(
                    this.basicModals.confirm("Search", "Searched instance " + individual.getShow() + " belong to a different class " + 
                        types[0].getShow() + ". Do you want to switch class?").then(
                        () => { //confirmed => switch class
                            return types[0];
                        },
                        () => { //canceled => don't switch class
                            return null;
                        }
                    )
                );
            } else { //multiple types
                return Observable.fromPromise(
                    this.basicModals.selectResource("Search", "Searched instance " + individual.getShow() + 
                        " belong to the following classes. If you want to complete the search, select one of them and confirm", types, this.rendering).then(
                        res => { //selected => switch class
                            return res;
                        },
                        () => { //canceled => don't switch class
                            return null;
                        }
                    )
                );
            }
        }
    }

    private extendSearchToAllIndividuals(): boolean {
        //extended search to all individuals (also in other classes) only if the setting is enabled and only from the panel in the Data page
        return VBContext.getWorkingProjectCtx().getProjectPreferences().searchSettings.extendToAllIndividuals && this.context == TreeListContext.dataPanel;
    }

    //this is public so it can be invoked from classIndividualTreePanelComponent
    openAt(instance: ARTURIResource) {
        this.viewChildInstanceList.openListAt(instance);
    }

}