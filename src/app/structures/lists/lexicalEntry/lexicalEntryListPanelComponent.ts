import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cookie } from "src/app/utils/Cookie";
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { SharedModalServices } from 'src/app/widget/modal/sharedModal/sharedModalServices';
import { GraphModalServices } from "../../../graph/modal/graphModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { Project } from "../../../models/Project";
import { LexEntryVisualizationMode, LexicalEntryListPreference, SearchSettings } from "../../../models/Properties";
import { OntoLex } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../services/ontoLexLemonServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SearchServices } from "../../../services/searchServices";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { ActionDescription, RoleActionResolver } from "../../../utils/RoleActionResolver";
import { UIUtils } from "../../../utils/UIUtils";
import { VBActionFunctionCtx } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBProperties } from '../../../utils/VBProperties';
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { MultiSubjectEnrichmentHelper } from "../../multiSubjectEnrichmentHelper";
import { AbstractListPanel } from "../abstractListPanel";
import { LexicalEntryListComponent } from "./lexicalEntryListComponent";
import { LexicalEntryListSettingsModal } from "./lexicalEntryListSettingsModal";

@Component({
    selector: "lexical-entry-list-panel",
    templateUrl: "./lexicalEntryListPanelComponent.html",
    host: { class: "vbox" }
})
export class LexicalEntryListPanelComponent extends AbstractListPanel {
    @Input() lexicon: ARTURIResource;
    @Input() lexiconChangeable: boolean = false; //if true, above the tree is shown a menu to select a lexicon
    @Output() lexiconChanged = new EventEmitter<ARTURIResource>();//when dynamic lexicon is changed
    @Output() indexChanged = new EventEmitter<string>();//when index changed

    @ViewChild(LexicalEntryListComponent) viewChildList: LexicalEntryListComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.ontolexLexicalEntry;

    private lexiconList: ARTURIResource[];//list of lexicons, visible only when lexiconChangeable is true
    workingLexicon: ARTURIResource;//keep track of the selected lexicon: could be assigned throught @Input lexicon or lexicon selection
    //(useful expecially when lexiconChangeable is true so the changes don't effect the lexicon in context)
    private lexiconLang: string;

    visualizationMode: LexEntryVisualizationMode;

    //for visualization indexBased
    private alphabet: string[] = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
    private firstDigitIndex: string = this.alphabet[0];
    private secondDigitIndex: string = this.alphabet[0];
    index: string;
    private indexLenght: number;

    //for visualization searchBased
    lastSearch: string;

    constructor(private ontolexService: OntoLexLemonServices, private searchService: SearchServices, private modalService: NgbModal,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, sharedModals: SharedModalServices, graphModals: GraphModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties, actionResolver: RoleActionResolver, multiEnrichment: MultiSubjectEnrichmentHelper,
        private translateService: TranslateService) {
        super(cfService, resourceService, basicModals, sharedModals, graphModals, eventHandler, vbProp, actionResolver, multiEnrichment);

        this.eventSubscriptions.push(eventHandler.lexiconChangedEvent.subscribe(
            (data: { lexicon: ARTURIResource, project: Project }) => {
                if (data.project.getName() == VBContext.getWorkingProjectCtx(this.projectCtx).getProject().getName()) {
                    this.onLexiconChanged(data.lexicon);
                }
            })
        );
        this.eventSubscriptions.push(eventHandler.lexicalEntryCreatedEvent.subscribe(
            (data: { entry: ARTURIResource, lexicon: ARTURIResource }) => this.onLexicalEntryCreated(data.lexicon, data.entry)));
    }

    ngOnInit() {
        super.ngOnInit();

        /**
         * in order to avoid to set twice the workingLexicon (now during the @Input check and then during the lexiconChangeable check),
         * store it in a temp variable and then set to the workingLexicon (in case of lexiconChangeable, the workingLexicon would be
         * subscribed from the active lexicon in the lexicon list)
         */
        let activeLexicon: ARTURIResource; 
        if (this.lexicon == undefined) { //if @Input is not provided, get the lexicon from the preferences
            activeLexicon = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().activeLexicon;
        } else { //if @Input lexicon is provided, initialize the tree with this lexicon
            activeLexicon = this.lexicon;
        }
        if (this.lexiconChangeable) {
            //init the scheme list if the concept tree allows dynamic change of scheme
            this.ontolexService.getLexicons(VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
                lexicons => {
                    this.lexiconList = lexicons;
                    this.workingLexicon = this.lexiconList[ResourceUtils.indexOfNode(this.lexiconList, activeLexicon)];
                    this.initLexiconLang();
                }
            );
        } else {
            this.workingLexicon = activeLexicon;
            this.initLexiconLang();
        }

        this.visualizationMode = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().lexEntryListPreferences.visualization;
        this.indexLenght = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().lexEntryListPreferences.indexLength;
        this.restoreLastIndex();
        this.onDigitChange();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['lexicon'] && changes['lexicon'].currentValue) {
            this.workingLexicon = this.lexicon;
        }
    }

    private initLexiconLang() {
        if (this.workingLexicon != null) {
            this.ontolexService.getLexiconLanguage(this.workingLexicon, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
                lang => {
                    this.lexiconLang = lang;
                }
            );
        }
    }

    getActionContext(): VBActionFunctionCtx {
        let actionCtx: VBActionFunctionCtx = { 
            metaClass: OntoLex.lexicalEntry, loadingDivRef: this.viewChildList.blockDivElement, 
            lexicon: { res: this.workingLexicon, lang: this.lexiconLang }
        };
        return actionCtx;
    }

    //@Override
    isActionDisabled(action: ActionDescription) {
        //In addition to the cross-panel conditions, in this case the actions are disabled if the panel is in no-lexicon mode
        return super.isActionDisabled(action) || !this.workingLexicon
    }

    doSearch(searchedText: string) {
        this.lastSearch = searchedText;

        let searchSettings: SearchSettings = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().searchSettings;
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }

        UIUtils.startLoadingDiv(this.viewChildList.blockDivElement.nativeElement);
        this.searchService.searchLexicalEntry(searchedText, searchSettings.useLocalName, searchSettings.useURI, searchSettings.useNotes,
            searchSettings.stringMatchMode, [this.workingLexicon], searchLangs, includeLocales, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.viewChildList.blockDivElement.nativeElement);
                if (searchResult.length == 0) {
                    this.basicModals.alert({key:"SEARCH.SEARCH"}, {key:"MESSAGES.NO_RESULTS_FOUND_FOR", params:{text: searchedText}}, ModalType.warning);
                    return;
                }
                ResourceUtils.sortResources(searchResult, this.rendering ? SortAttribute.show : SortAttribute.value);
                if (this.visualizationMode == LexEntryVisualizationMode.indexBased) {
                    if (searchResult.length == 1) {
                        this.selectSearchedResource(searchResult[0]);
                    } else { //multiple results, ask the user which one select
                        this.sharedModals.selectResource({key:"SEARCH.SEARCH"}, {key:"MESSAGES.TOT_RESULTS_FOUND", params:{count: searchResult.length}}, searchResult, this.rendering).then(
                            (selectedResource: any) => {
                                this.selectSearchedResource(selectedResource);
                            },
                            () => { }
                        );
                    }
                } else { //searchBased
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
        this.ontolexService.getLexicalEntryLexicons(resource, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
            lexicons => {
                let isInActiveLexicon: boolean = ResourceUtils.containsNode(lexicons, this.workingLexicon);
                if (isInActiveLexicon) {
                    this.selectSearchedResource(resource);
                } else {
                    let message = this.translateService.instant("MESSAGES.SWITCH_LEXICON_FOR_SEARCHED_ENTRY_SELECT.BELONGS_TO_FOLLOWING");
                    if (lexicons.length > 1) {
                        message += " " + this.translateService.instant("MESSAGES.SWITCH_LEXICON_FOR_SEARCHED_ENTRY_SELECT.LEXICONS");
                    } else {
                        message += " " + this.translateService.instant("MESSAGES.SWITCH_LEXICON_FOR_SEARCHED_ENTRY_SELECT.LEXICON");
                    }
                    this.sharedModals.selectResource({key:"SEARCH.SEARCH"}, message, lexicons, this.rendering).then(
                        (lexicon: ARTURIResource) => {
                            this.vbProp.setActiveLexicon(VBContext.getWorkingProjectCtx(this.projectCtx), lexicon); //update the active lexicon
                            setTimeout(() => { //wait for a change detection round, since after the setActiveLexicon, the lex entry list is reset
                                this.selectSearchedResource(resource); //then open the list on the searched resource
                            });
                        },
                        () => {}
                    );
                }
            }
        )
    }

    public selectSearchedResource(resource: ARTURIResource) {
        if (this.visualizationMode == LexEntryVisualizationMode.indexBased) {
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
        } else { //search based
            this.viewChildList.forceList([resource]);
            setTimeout(() => {
                this.openAt(resource);
            });
        }
        
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
            return of(entry.getAdditionalProperty("index").toLocaleUpperCase());
        } else {
            return this.ontolexService.getLexicalEntryIndex(entry, VBRequestOptions.getRequestOptions(this.projectCtx)).pipe(
                map(index => {
                    return index.toLocaleUpperCase();
                })
            );
        }
    }

    refresh() {
        if (this.visualizationMode == LexEntryVisualizationMode.indexBased) {
            //in index based visualization reinit the list
            this.viewChildList.init();
        } else if (this.visualizationMode == LexEntryVisualizationMode.searchBased) {
            //in search based visualization repeat the search
            if (this.lastSearch != undefined) {
                this.doSearch(this.lastSearch);
            }
        }
    }

    //lexicon selection menu handlers

    /**
     * Listener to <select> element that allows to change dynamically the lexicon of the lex-entry list
     * (visible only if @Input lexiconChangeable is true).
     */
    private onLexiconSelectionChange() {
        this.initLexiconLang();
        this.lexiconChanged.emit(this.workingLexicon);
    }

    private getLexiconRendering(lexicon: ARTURIResource) {
        return ResourceUtils.getRendering(lexicon, this.rendering);
    }


    settings() {
        const modalRef: NgbModalRef = this.modalService.open(LexicalEntryListSettingsModal, new ModalOptions());
        return modalRef.result.then(
            () => {
                let lexEntryListPref: LexicalEntryListPreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().lexEntryListPreferences;
                this.visualizationMode = lexEntryListPref.visualization;
                if (this.visualizationMode == LexEntryVisualizationMode.indexBased) {
                    this.indexLenght = lexEntryListPref.indexLength;
                    this.onDigitChange();
                }
                this.viewChildList.init();
            },
            () => {}
        );
    }

    onSwitchMode(mode: LexEntryVisualizationMode) {
        let lexEntryListPref: LexicalEntryListPreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().lexEntryListPreferences;
        lexEntryListPref.visualization = mode;
        this.vbProp.setLexicalEntryListPreferences(lexEntryListPref);
        this.visualizationMode = lexEntryListPref.visualization;
        this.viewChildList.init();
    }

    onChangeIndexLenght(lenght: number) {
        let lexEntryListPref: LexicalEntryListPreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().lexEntryListPreferences;
        lexEntryListPref.indexLength = lenght;
        this.vbProp.setLexicalEntryListPreferences(lexEntryListPref);
        this.indexLenght = lexEntryListPref.indexLength;
        this.onDigitChange();
    }

    private onDigitChange() {
        this.index = (this.indexLenght == 1) ? this.firstDigitIndex : this.firstDigitIndex + this.secondDigitIndex;
        this.storeLastIndex();
        this.indexChanged.emit(this.index);
    }

    private onLexiconChanged(lexicon: ARTURIResource) {
        this.workingLexicon = lexicon;
        this.initLexiconLang();
        //in case of visualization search based reset the list
        if (this.visualizationMode == LexEntryVisualizationMode.searchBased && this.lastSearch != null) {
            this.viewChildList.init();
        }
    }

    private onLexicalEntryCreated(lexicon: ARTURIResource, lexEntry: ARTURIResource) {
        if (this.visualizationMode == LexEntryVisualizationMode.indexBased) {
            if (lexicon.equals(this.workingLexicon)) {
                this.getSearchedEntryIndex(lexEntry).subscribe(
                    index => {
                        this.firstDigitIndex = index.charAt(0);
                        this.secondDigitIndex = index.charAt(1);
                        this.onDigitChange();
                    }
                );
            }
        }
    }

    /**
     * Store a cookie with the current index in order to restore in the next sessions
     */
    private storeLastIndex() {
        Cookie.setProjectCookie(Cookie.LEX_ENTRY_LAST_INDEX, VBContext.getWorkingProject(), this.index);
    }
    /**
     * Restore the index selected the last session by getting a dedicated cookie
     */
    private restoreLastIndex() {
        //init firstDigitIndex and secondDigitIndex restoring the last selection from cookie (if set)
        let lastIdxsCookie: string = Cookie.getProjectCookie(Cookie.LEX_ENTRY_LAST_INDEX, VBContext.getWorkingProject());
        if (lastIdxsCookie != null) {
            lastIdxsCookie = lastIdxsCookie.toUpperCase();
            if (lastIdxsCookie.length == 1) {
                this.firstDigitIndex = lastIdxsCookie;
            } else if (lastIdxsCookie.length == 2) {
                this.firstDigitIndex = lastIdxsCookie.charAt(0);
                this.secondDigitIndex = lastIdxsCookie.charAt(1);
            }
            //check if the two digits are admitted values (otherwise set AA)
            if (!this.alphabet.includes(this.firstDigitIndex)) {
                this.firstDigitIndex = this.alphabet[0];
            }
            if (!this.alphabet.includes(this.secondDigitIndex) && this.secondDigitIndex != " ") {
                this.secondDigitIndex = this.alphabet[0];
            }
        }
    }

}