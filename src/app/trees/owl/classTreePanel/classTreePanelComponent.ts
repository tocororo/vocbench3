import { Component, Input, ViewChild } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils, SortAttribute } from "../../../models/ARTResources";
import { SearchSettings } from "../../../models/Properties";
import { OWL, RDFS } from "../../../models/Vocabulary";
import { ClassesServices } from "../../../services/classesServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SearchServices } from "../../../services/searchServices";
import { UIUtils } from "../../../utils/UIUtils";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { AbstractTreePanel } from "../../abstractTreePanel";
import { ClassTreeComponent } from "../classTree/classTreeComponent";
import { ClassTreeSettingsModal } from "./classTreeSettingsModal";

@Component({
    selector: "class-tree-panel",
    templateUrl: "./classTreePanelComponent.html",
    host: { class: "vbox" }
})
export class ClassTreePanelComponent extends AbstractTreePanel {
    @Input() hideSearch: boolean = false; //if true hide the search bar
    @Input() roots: ARTURIResource[]; //root classes

    @ViewChild(ClassTreeComponent) viewChildTree: ClassTreeComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.cls;
    rendering: boolean = false; //override the value in AbstractPanel

    private filterEnabled: boolean;
    private creatingClassType: ARTURIResource = OWL.class;

    constructor(private classesService: ClassesServices, private searchService: SearchServices, private creationModals: CreationModalServices,
        private modal: Modal, cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, 
        eventHandler: VBEventHandler, vbProp: VBProperties) {
        super(cfService, resourceService, basicModals, eventHandler, vbProp);
    }

    ngOnInit() {
        this.filterEnabled = this.vbProp.getClassTreePreferences().filterEnabled;
        if (VBContext.getWorkingProject().getModelType() == RDFS.uri) {
            this.creatingClassType = RDFS.class;
        }
    }

    //Top Bar commands handlers

    createRoot() {
        this.creationModals.newResourceCf("Create a new class", this.creatingClassType).then(
            (data: any) => {
                let superClass: ARTURIResource = OWL.thing;
                if (data.cls.getURI() == RDFS.class.getURI()) {
                    superClass = RDFS.resource;
                }
                this.classesService.createClass(data.uriResource, superClass, data.cls, data.cfValue).subscribe();
            },
            () => {}
        );
    }

    createChild() {
        this.creationModals.newResourceCf("Create a subClass of " + this.selectedNode.getShow(), this.creatingClassType).then(
            (data: any) => {
                this.classesService.createClass(data.uriResource, this.selectedNode, data.cls, data.cfValue).subscribe();
            },
            () => {}
        );
    }

    delete() {
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);;
        this.classesService.deleteClass(this.selectedNode).subscribe(
            stResp => {
                this.nodeDeleted.emit(this.selectedNode);
                this.selectedNode = null;
                UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
            }
        );
    }

    refresh() {
        this.selectedNode = null; //instance list refresh automatically after this since it listen for changes on cls
        this.nodeSelected.emit(this.selectedNode); //emit nodeSelected with node null, so classIndividualTreePanel reset the instance list
        this.viewChildTree.initTree();
    }

    //search handlers

    doSearch(searchedText: string) {
        let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
        this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.cls], searchSettings.useLocalName, searchSettings.useURI,
            searchSettings.useNotes, searchSettings.stringMatchMode, searchLangs, includeLocales).subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (searchResult.length == 0) {
                    this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                } else { //1 or more results
                    if (searchResult.length == 1) {
                        this.openTreeAt(searchResult[0]);
                    } else { //multiple results, ask the user which one select
                        ResourceUtils.sortResources(searchResult, this.rendering ? SortAttribute.show : SortAttribute.value);
                        this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, this.rendering).then(
                            (selectedResource: any) => {
                                this.openTreeAt(selectedResource);
                            },
                            () => { }
                        );
                    }
                }
            }
        );
    }

    //this is public so it can be invoked from classIndividualTreePanelComponent
    openTreeAt(cls: ARTURIResource) {
        this.viewChildTree.openTreeAt(cls);
    }

    private settings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(ClassTreeSettingsModal, overlayConfig).result.then(
            changesDone => {
                this.filterEnabled = this.vbProp.getClassTreePreferences().filterEnabled;
                this.refresh();
            },
            () => {
                this.filterEnabled = this.vbProp.getClassTreePreferences().filterEnabled;
            }
        );
    }

}