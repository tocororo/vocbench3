import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { LexiconListComponent } from "../lexiconList/lexiconListComponent";
import { AbstractPanel } from "../../../abstractPanel";
import { OntoLexLemonServices } from "../../../../services/ontoLexLemonServices";
import { SearchServices } from "../../../../services/searchServices";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { NewLexiconCfModalReturnData } from "../../../../widget/modal/creationModal/newResourceModal/ontolex/newLexiconCfModal";
import { VBProperties } from '../../../../utils/VBProperties';
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBContext } from "../../../../utils/VBContext";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ResourceUtils, SortAttribute } from "../../../../models/ARTResources";
import { SearchSettings } from "../../../../models/Properties";

@Component({
    selector: "lexicon-list-panel",
    templateUrl: "./lexiconListPanelComponent.html",
})
export class LexiconListPanelComponent extends AbstractPanel {
    @Input() hideSearch: boolean = false; //if true hide the search bar
    @ViewChild(LexiconListComponent) viewChildList: LexiconListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.limeLexicon;

    constructor(private ontolexService: OntoLexLemonServices, private searchService: SearchServices, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, 
        eventHandler: VBEventHandler, vbProp: VBProperties) {
        super(cfService, resourceService, basicModals, eventHandler, vbProp);
        
    }

    private create() {
        this.creationModals.newLexiconCf("Create new lime:Lexicon").then(
            (res: NewLexiconCfModalReturnData) => {
                this.ontolexService.createLexicon(res.language, res.uriResource, res.title, res.cfValue).subscribe();
            },
            () => { }
        );
    }

    delete() {
        this.ontolexService.deleteLexicon(this.selectedNode).subscribe(
            stResp => {
                this.nodeDeleted.emit(this.selectedNode);
                this.selectedNode = null;
            }
        );
    }

    doSearch(searchedText: string) {
        let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.limeLexicon], searchSettings.useLocalName, 
            searchSettings.useURI, searchSettings.stringMatchMode, searchLangs, includeLocales).subscribe(
            searchResult => {
                if (searchResult.length == 0) {
                    this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                } else { //1 or more results
                    if (searchResult.length == 1) {
                        this.openAt(searchResult[0]);
                    } else { //multiple results, ask the user which one select
                        ResourceUtils.sortResources(searchResult, this.rendering ? SortAttribute.show : SortAttribute.value);
                        this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, this.rendering).then(
                            (selectedResource: any) => {
                                this.openAt(selectedResource);
                            },
                            () => { }
                        );
                    }
                }
            }
        );
    }

    public openAt(node: ARTURIResource) {
        this.viewChildList.openListAt(node);
    }

    refresh() {
        this.selectedNode = null; //lexical entry list refresh automatically after this since it listen for changes on lexicon
        this.nodeSelected.emit(this.selectedNode); //emit nodeSelected with node null, so ontolexPanel reset the lexicon entry list
        this.viewChildList.initList();
    }

}