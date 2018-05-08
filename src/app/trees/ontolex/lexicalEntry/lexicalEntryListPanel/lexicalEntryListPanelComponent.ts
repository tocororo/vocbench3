import { Component, Input, ViewChild } from "@angular/core";
import { OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder, Modal } from "ngx-modialog/plugins/bootstrap";
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils, SortAttribute } from "../../../../models/ARTResources";
import { SearchSettings, LexEntryVisualizationMode } from "../../../../models/Properties";
import { OntoLex } from "../../../../models/Vocabulary";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../../services/ontoLexLemonServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { SearchServices } from "../../../../services/searchServices";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBProperties } from '../../../../utils/VBProperties';
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { NewResourceWithLiteralCfModalReturnData } from "../../../../widget/modal/creationModal/newResourceModal/shared/newResourceWithLiteralCfModal";
import { AbstractPanel } from "../../../abstractPanel";
import { LexicalEntryListComponent } from "../lexicalEntryList/lexicalEntryListComponent";
import { LexicalEntryListSettingsModal } from "./lexicalEntryListSettingsModal";

@Component({
    selector: "lexical-entry-list-panel",
    templateUrl: "./lexicalEntryListPanelComponent.html",
})
export class LexicalEntryListPanelComponent extends AbstractPanel {
    @Input() hideSearch: boolean = false; //if true hide the search bar
    @Input() lexicon: ARTURIResource;

    @ViewChild(LexicalEntryListComponent) viewChildList: LexicalEntryListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.ontolexLexicalEntry;

    private visualizationMode: LexEntryVisualizationMode;

    //for visualization indexBased
    private alphabet: string[] = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    private firstDigitIndex: string = this.alphabet[0];
    private secondDigitIndex: string = this.alphabet[0];
    private index: string;
    private indexLenght: number;

    //for visualization searchBased
    private lastSearch: string;

    constructor(private ontolexService: OntoLexLemonServices, private searchService: SearchServices, private creationModals: CreationModalServices,
        private modal: Modal, cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties) {
        super(cfService, resourceService, basicModals, eventHandler, vbProp);

        this.eventSubscriptions.push(eventHandler.lexiconChangedEvent.subscribe(
            (lexicon: ARTURIResource) => this.onLexiconChanged(lexicon)));
    }

    ngOnInit() {
        super.ngOnInit();
        if (this.lexicon === undefined) { //if @Input is not provided at all, get the lexicon from the preferences
            this.lexicon = this.vbProp.getActiveLexicon();
        }

        this.visualizationMode = this.vbProp.getLexicalEntryListPreferences().visualization;
        this.indexLenght = this.vbProp.getLexicalEntryListPreferences().indexLength;
        this.onDigitChange();
    }

    private create() {
        this.creationModals.newResourceWithLiteralCf("Create new ontolex:LexicalEntry", OntoLex.lexicalEntry, true, "Canonical Form").then(
            (data: NewResourceWithLiteralCfModalReturnData) => {
                this.ontolexService.createLexicalEntry(data.literal, this.lexicon, data.uriResource, data.cls, data.cfValue).subscribe();
            },
            () => { }
        );
    }

    delete() {
        this.ontolexService.deleteLexicalEntry(this.selectedNode).subscribe(
            stResp => {
                this.nodeDeleted.emit(this.selectedNode);
                this.selectedNode = null;
            }
        );
    }

    doSearch(searchedText: string) {
        this.lastSearch = searchedText;

        let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        this.searchService.searchLexicalEntry(searchedText, searchSettings.useLocalName, searchSettings.useURI,
            searchSettings.stringMatchMode, [this.lexicon], searchLangs, includeLocales).subscribe(
            searchResult => {
                if (searchResult.length == 0) {
                    this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                } else { //1 or more results
                    if (this.visualizationMode == LexEntryVisualizationMode.indexBased) {
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
                    } else { //searchBased
                        this.viewChildList.forceList(searchResult);
                    }
                }
            }
        );
    }

    public openAt(node: ARTURIResource) {
        this.index = node.getAdditionalProperty("index").toLocaleUpperCase();//update the index to the first character of the searched node
        setTimeout(() => {
            this.viewChildList.openListAt(node);
        });
    }

    refresh() {
        if (this.visualizationMode == LexEntryVisualizationMode.indexBased) {
            //in index based visualization reinit the list
            this.viewChildList.initList();
        } else if (this.visualizationMode == LexEntryVisualizationMode.searchBased) {
            //in search based visualization repeat the search
            if (this.lastSearch != undefined && this.lastSearch.trim() != "") {
                this.doSearch(this.lastSearch);
            } else {
                this.basicModals.alert("Search", "Please enter a valid string to search", "warning");
            }
        }
        
    }

    //@Override
    isCreateDisabled(): boolean {
        return (!this.lexicon || this.readonly || !AuthorizationEvaluator.Tree.isCreateAuthorized(this.panelRole));
    }

    private settings() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(LexicalEntryListSettingsModal, overlayConfig).result.then(
            changesDone => {
                console.log(this.vbProp.getLexicalEntryListPreferences());
                this.visualizationMode = this.vbProp.getLexicalEntryListPreferences().visualization;
                if (this.visualizationMode == LexEntryVisualizationMode.searchBased) {
                    this.viewChildList.forceList([]);
                } else {
                    this.indexLenght = this.vbProp.getLexicalEntryListPreferences().indexLength;
                    this.onDigitChange();
                    this.refresh();
                }
            },
            () => {}
        );
    }

    private onDigitChange() {
        this.index = (this.indexLenght == 1) ? this.firstDigitIndex : this.firstDigitIndex + this.secondDigitIndex;
    }

    private onLexiconChanged(lexicon: ARTURIResource) {
        this.lexicon = lexicon;
    }

}