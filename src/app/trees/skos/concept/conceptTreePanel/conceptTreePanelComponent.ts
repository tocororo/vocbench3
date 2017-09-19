import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { AbstractTreePanel } from "../../../abstractTreePanel"
import { ConceptTreeComponent } from "../conceptTree/conceptTreeComponent";
import { SkosServices } from "../../../../services/skosServices";
import { SearchServices } from "../../../../services/searchServices";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { VBProperties, SearchSettings } from "../../../../utils/VBProperties";
import { UIUtils } from "../../../../utils/UIUtils";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ResourceUtils } from "../../../../models/ARTResources";
import { CustomForm } from "../../../../models/CustomForms";
import { SKOS } from "../../../../models/Vocabulary";

@Component({
    selector: "concept-tree-panel",
    templateUrl: "./conceptTreePanelComponent.html",
})
export class ConceptTreePanelComponent extends AbstractTreePanel {
    @Input() schemes: ARTURIResource[]; //if set the concept tree is initialized with this scheme, otherwise with the scheme from VB context
    @Input() schemeChangeable: boolean = false; //if true, above the tree is shown a menu to select a scheme
    @Output() schemeChanged = new EventEmitter<ARTURIResource>();//when dynamic scheme is changed

    @ViewChild(ConceptTreeComponent) viewChildTree: ConceptTreeComponent

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.concept;

    private schemeList: Array<ARTURIResource>;
    private selectedSchemeUri: string; //needed for the <select> element where I cannot use ARTURIResource as <option> values
    //because I need also a <option> with null value for the no-scheme mode (and it's not possible)
    private workingSchemes: ARTURIResource[];//keep track of the selected scheme: could be assigned throught @Input scheme or scheme selection
    //(useful expecially when schemeChangeable is true so the changes don't effect the scheme in context)

    constructor(private skosService: SkosServices, private searchService: SearchServices, private resourceService: ResourcesServices,
        private eventHandler: VBEventHandler, private vbProp: VBProperties, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, basicModals: BasicModalServices) {
        super(cfService, basicModals);

        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (schemes: ARTURIResource[]) => this.onSchemeChanged(schemes)));
    }

    ngOnInit() {
        if (this.schemes === undefined) { //if @Input is not provided at all, get the scheme from the preferences
            this.workingSchemes = this.vbProp.getActiveSchemes();
        } else { //if @Input schemes is provided (it could be null => no scheme-mode), initialize the tree with this scheme
            if (this.schemeChangeable) {
                if (this.schemes.length > 0) {
                    this.selectedSchemeUri = this.schemes[0].getURI();
                    this.workingSchemes = [this.schemes[0]];
                } else { //no scheme mode
                    this.selectedSchemeUri = "---"; //no scheme
                    this.workingSchemes = [];
                }
                //init the scheme list if the concept tree allows dynamic change of scheme
                this.skosService.getAllSchemes().subscribe(
                    schemes => {
                        this.schemeList = schemes;
                    }
                );
            } else {
                this.workingSchemes = this.schemes;
            }
        }
    }
    
    //@Override
    isCreateDisabled(): boolean {
        return (this.isNoSchemeMode() || this.readonly || !AuthorizationEvaluator.Tree.isCreateAuthorized(this.panelRole));
    }
    //@Override
    isCreateChildDisabled(): boolean {
        return (!this.selectedNode || this.isNoSchemeMode() || this.readonly || !AuthorizationEvaluator.Tree.isDeleteAuthorized(this.panelRole));
    }

    //top bar commands handlers

    createRoot() {
        this.creationModals.newConceptCf("Create new skos:Concept", null, true).then(
            (data: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                this.skosService.createTopConcept(data.label, data.schemes, data.uriResource, data.cls, data.cfId, data.cfValueMap).subscribe(
                    stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                );
            },
            () => { }
        );
    }

    createChild() {
        this.creationModals.newConceptCf("Create a skos:narrower", this.selectedNode, true).then(
            (data: any) => {
                UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                this.skosService.createNarrower(data.label, this.selectedNode, data.schemes, data.uriResource, data.cls, data.cfId, data.cfValueMap).subscribe(
                    stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement)
                );
            },
            () => { }
        );
    }

    delete() {
        if (this.selectedNode.getAdditionalProperty(ResAttribute.MORE)) {
            this.basicModals.alert("Operation denied", "Cannot delete " + this.selectedNode.getURI() + 
                " since it has narrower concept(s). Please delete the narrower(s) and retry", "warning");
            return;
        }
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
        this.skosService.deleteConcept(this.selectedNode).subscribe(
            stResp => {
                this.nodeDeleted.emit(this.selectedNode);
                this.selectedNode = null;
                UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
            }
        );
    }

    refresh() {
        this.selectedNode = null;
        this.viewChildTree.initTree();
    }

    private isNoSchemeMode() {
        return this.workingSchemes.length == 0;
    }

    //scheme selection menu handlers

    /**
     * Listener to <select> element that allows to change dynamically the scheme of the
     * concept tree (visible only if @Input schemeChangeable is true).
     * This is only invokable if schemeChangeable is true, this mode allow only one scheme at time, so can reset workingSchemes
     */
    private onSchemeSelectionChange() {
        var newSelectedScheme: ARTURIResource = this.getSchemeResourceFromUri(this.selectedSchemeUri);
        if (newSelectedScheme != null) { //if it is not "no-scheme"                 
            this.workingSchemes = [newSelectedScheme];
        } else {
            this.workingSchemes = [];
        }
        this.schemeChanged.emit(newSelectedScheme);
    }

    /**
     * Retrieves the ARTURIResource of a scheme URI from the available scheme. Returns null
     * if the URI doesn't represent a scheme in the list.
     */
    private getSchemeResourceFromUri(schemeUri: string): ARTURIResource {
        for (var i = 0; i < this.schemeList.length; i++) {
            if (this.schemeList[i].getURI() == schemeUri) {
                return this.schemeList[i];
            }
        }
        return null; //schemeUri was probably "---", so for no-scheme mode return a null object
    }

    private getSchemeRendering(scheme: ARTURIResource) {
        return ResourceUtils.getRendering(scheme, this.rendering);
    }

    //search handlers

    doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.basicModals.alert("Search", "Please enter a valid string to search", "error");
        } else {
            let searchSettings: SearchSettings = this.vbProp.getSearchSettings();

            let searchingScheme: ARTURIResource[] = [];
            if (searchSettings.restrictActiveScheme) {
                if (this.schemeChangeable) {
                    searchingScheme.push(this.getSchemeResourceFromUri(this.selectedSchemeUri));
                } else {
                    searchingScheme = this.workingSchemes;
                }
            }

            UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.concept], searchSettings.useLocalName, 
                searchSettings.useURI, searchSettings.stringMatchMode, searchingScheme).subscribe(
                searchResult => {
                    UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                    if (searchResult.length == 0) {
                        this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.selectSearchResult(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            ResourceUtils.sortResources(searchResult, this.rendering ? "show" : "value");
                            this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, this.rendering).then(
                                (selectedResource: any) => {
                                    this.selectSearchResult(selectedResource);
                                },
                                () => { }
                            );
                        }
                    }
                }
            );
        }
    }

    private selectSearchResult(resource: ARTURIResource) {
        let schemes: ARTURIResource[] = resource.getAdditionalProperty(ResAttribute.SCHEMES);
        let isInActiveSchemes: boolean = false;
        for (var i = 0; i < schemes.length; i++) {
            if (ResourceUtils.containsNode(this.workingSchemes, schemes[i])) {
                isInActiveSchemes = true;
                break;
            }
        }
        if (isInActiveSchemes) {
            this.viewChildTree.openTreeAt(resource);
        } else {
            let message = "Searched concept '" + resource.getShow() + "' is not reachable in the tree since it belongs to the following";
            if (schemes.length > 1) {
                message += " schemes. If you want to activate one of these schemes and continue the search, "
                    + "please select the scheme you want to activate and press OK.";
            } else {
                message += " scheme. If you want to activate the scheme and continue the search, please select it and press OK.";
            }
            this.resourceService.getResourcesInfo(schemes).subscribe(
                schemes => {
                    this.basicModals.selectResource("Search", message, schemes, this.rendering).then(
                        scheme => {
                            this.vbProp.setActiveSchemes(this.workingSchemes.concat(scheme)); //update the active schemes
                            this.viewChildTree.openTreeAt(resource); //then open the tree on the searched resource
                        },
                        () => {}
                    );
                }
            );
        }
    }

    //EVENT LISTENERS

    //when a concept is removed from a scheme, it should be still visible in res view,
    //but no more selected in the tree if it was in the current scheme 
    private onConceptRemovedFromScheme(concept: ARTURIResource) {
        this.selectedNode = null;
    }

    private onSchemeChanged(schemes: ARTURIResource[]) {
        this.workingSchemes = schemes;
    }

}