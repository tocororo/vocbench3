import { Component, Output, EventEmitter, ViewChild } from "@angular/core";
import { LexiconListComponent } from "../lexiconList/lexiconListComponent";
import { AbstractPanel } from "../../../abstractPanel";
import { OntoLexLemonServices } from "../../../../services/ontoLexLemonServices";
import { SearchServices } from "../../../../services/searchServices";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { NewLexiconCfModalReturnData } from "../../../../widget/modal/creationModal/newResourceModal/newLexiconCfModal";
import { VBProperties } from '../../../../utils/VBProperties';
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBContext } from "../../../../utils/VBContext";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ResourceUtils } from "../../../../models/ARTResources";
// import { SKOS, SemanticTurkey } from "../../../../models/Vocabulary";
import { SearchSettings } from "../../../../models/Properties";

@Component({
    selector: "lexicon-list-panel",
    templateUrl: "./lexiconListPanelComponent.html",
})
export class LexiconListPanelComponent extends AbstractPanel {

    @ViewChild(LexiconListComponent) viewChildList: LexiconListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.limeLexicon;

    constructor(private ontolexService: OntoLexLemonServices, private searchService: SearchServices, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, basicModals: BasicModalServices, eventHandler: VBEventHandler, vbProp: VBProperties) {
        super(cfService, basicModals, eventHandler, vbProp);
        
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
        // this.ontolexService.deleteConceptScheme(this.selectedNode).subscribe(
        //     stResp => {
        //         this.eventHandler.schemeDeletedEvent.emit(this.selectedNode);
        //         this.nodeDeleted.emit(this.selectedNode);
        //         this.selectedNode = null;
        //     }
        // );
    }

    doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.basicModals.alert("Search", "Please enter a valid string to search", "error");
        } else {
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
                            ResourceUtils.sortResources(searchResult, this.rendering ? "show" : "value");
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
    }

    public openAt(node: ARTURIResource) {
        this.viewChildList.openListAt(node);
    }

    refresh() {
        this.viewChildList.initList();
    }

}