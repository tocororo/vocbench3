import { Component, Input, ViewChild } from "@angular/core";
import { OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder, Modal } from "ngx-modialog/plugins/bootstrap";
import { Observable } from "rxjs/Observable";
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils, SortAttribute } from "../../../../models/ARTResources";
import { LexEntryVisualizationMode, SearchSettings } from "../../../../models/Properties";
import { OntoLex } from "../../../../models/Vocabulary";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../../services/ontoLexLemonServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { SearchServices } from "../../../../services/searchServices";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../../../utils/UIUtils";
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

        UIUtils.startLoadingDiv(this.viewChildList.blockDivElement.nativeElement);
        this.searchService.searchLexicalEntry(searchedText, searchSettings.useLocalName, searchSettings.useURI, searchSettings.useNotes,
            searchSettings.stringMatchMode, [this.lexicon], searchLangs, includeLocales).subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.viewChildList.blockDivElement.nativeElement);
                if (this.visualizationMode == LexEntryVisualizationMode.indexBased) {
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
                } else { //searchBased
                    if (searchResult.length == 0) {
                        this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    }
                    this.viewChildList.forceList(searchResult);
                }
            }
        );
    }

    /**
     * Unlike the "ordinary" search, that looks for entry only in the current lexicon,
     * the advanced search looks for entry in any lexicon, so in order to select the entry in the panel, 
     * it needs to retrieve the lexicon of the entry, select it, eventually change the index, then select the entry
     */
    public selectAdvancedSearchedResource(resource: ARTURIResource) {
        this.ontolexService.getLexicalEntryLexicons(resource).subscribe(
            lexicons => {
                let isInActiveLexicon: boolean = ResourceUtils.containsNode(lexicons, this.lexicon);
                if (isInActiveLexicon) {
                    this.selectSearchedResource(resource);
                } else {
                    let message = "Searched LexicalEntry '" + resource.getShow() + "' is not reachable in the list since it belongs to the following";
                    if (lexicons.length > 1) {
                        message += " lexicon. If you want to activate one of these lexicons and continue the search, "
                            + "please select the lexicon you want to activate and press OK.";
                    } else {
                        message += " lexicon. If you want to activate the lexicon and continue the search, please select it and press OK.";
                    }
                    this.basicModals.selectResource("Search", message, lexicons, this.rendering).then(
                        (lexicon: ARTURIResource) => {
                            this.vbProp.setActiveLexicon(lexicon); //update the active lexicon
                            this.selectSearchedResource(resource); //then open the list on the searched resource
                        },
                        () => {}
                    );
                }
            }
        )
    }

    public selectSearchedResource(resource: ARTURIResource) {
        this.getSearchedEntryIndex(resource).subscribe(
            index => {
                this.firstDigitIndex = index.charAt(0);
                this.secondDigitIndex = index.charAt(1);
                this.onDigitChange();
                setTimeout(() => {
                    this.openAt(resource);
                });
            }
        );
    }

    public openAt(node: ARTURIResource) {
        this.viewChildList.openListAt(node);
    }

    /**
     * Index of a searched entry could be retrieved from a "index" attribute (if searched by a "ordinary" search), or from
     * invoking a specific service (if the "index" attr is not present when searched by advanced search)
     */
    private getSearchedEntryIndex(entry: ARTURIResource): Observable<string> {
        if (entry.getAdditionalProperty("index") != null) {
            return Observable.of(entry.getAdditionalProperty("index").toLocaleUpperCase());
        } else {
            return this.ontolexService.getLexicalEntryIndex(entry).map(
                index => {
                    return index.toLocaleUpperCase();
                }
            );
        }
    }

    refresh() {
        this.selectedNode = null;
        if (this.visualizationMode == LexEntryVisualizationMode.indexBased) {
            //in index based visualization reinit the list
            this.viewChildList.initList();
        } else if (this.visualizationMode == LexEntryVisualizationMode.searchBased) {
            //in search based visualization repeat the search
            if (this.lastSearch != undefined) {
                this.doSearch(this.lastSearch);
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
                this.visualizationMode = this.vbProp.getLexicalEntryListPreferences().visualization;
                if (this.visualizationMode == LexEntryVisualizationMode.searchBased) {
                    this.viewChildList.forceList([]);
                    this.lastSearch = null;
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
        //in case of visualization search based reset the list
        if (this.visualizationMode == LexEntryVisualizationMode.searchBased && this.lastSearch != null) {
            this.viewChildList.forceList([]);
            this.lastSearch = null;
        }
    }

}