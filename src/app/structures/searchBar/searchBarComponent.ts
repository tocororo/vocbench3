import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { AutocompleteComponent } from 'angular-ng-autocomplete';
import { VBRequestOptions } from 'src/app/utils/HttpManager';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { SearchMode, SearchSettings } from "../../models/Properties";
import { SearchServices } from "../../services/searchServices";
import { TreeListContext } from "../../utils/UIUtils";
import { ProjectContext, VBContext } from "../../utils/VBContext";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AdvancedSearchModal } from "./advancedSearchModal";
import { CustomSearchModal } from "./customSearchModal";
import { LoadCustomSearchModal } from "./loadCustomSearchModal";
import { SearchSettingsModal } from './searchSettingsModal';

@Component({
    selector: "search-bar",
    templateUrl: "./searchBarComponent.html",
    styleUrls: ["./searchBarComponent.css"]
})
export class SearchBarComponent {

    @Input() role: RDFResourceRolesEnum; //tells the role of the panel where the search bar is placed (usefull for customizing the settings)
    @Input() disabled: boolean = false;
    @Input() cls: ARTURIResource; //useful where search-bar is in the instance list panel
    @Input() schemes: ARTURIResource[]; //useful where search-bar is in the concept tree panel
    @Input() context: TreeListContext;
    @Input() projectCtx: ProjectContext;
    @Output() search: EventEmitter<string> = new EventEmitter();
    @Output('advancedSearch') advancedSearchEvent: EventEmitter<ARTResource> = new EventEmitter();

    //search mode startsWith/contains/endsWith
    stringMatchModes: { show: string, value: SearchMode, symbol: string }[] = [
        { show: "Starts with", value: SearchMode.startsWith, symbol: "α.." },
        { show: "Contains", value: SearchMode.contains, symbol: ".α." },
        { show: "Ends with", value: SearchMode.endsWith, symbol: "..α" },
        { show: "Exact", value: SearchMode.exact, symbol: "α" },
        { show: "Fuzzy", value: SearchMode.fuzzy, symbol: "~α" }
    ];

    searchSettings: SearchSettings;
    searchStr: string;

    constructor(private searchService: SearchServices, private modalService: NgbModal, private vbProperties: VBProperties,
        private eventHandler: VBEventHandler, private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        this.searchSettings = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().searchSettings;
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['cls'] && ! changes['cls'].firstChange) {
            // this.completerDatasource.setClass(changes['cls'].currentValue);
        }
        
    }

    doSearch() {
        this.autocompleter.close();
        if (this.searchStr != undefined && this.searchStr.trim() != "") {
            this.search.emit(this.searchStr);
        } else {
            this.basicModals.alert("Search", "Please enter a valid string to search", ModalType.warning);
        }
    }

    editSettings() {
        const modalRef: NgbModalRef = this.modalService.open(SearchSettingsModal, new ModalOptions());
        modalRef.componentInstance.role = this.role;
        modalRef.componentInstance.structureCtx = this.context;
        modalRef.componentInstance.projectCtx = this.projectCtx;
        return modalRef.result;
    }

    /**
     * Advanced and Custom search are available only if the panel is in the data page and works on the current project, not a contextual one
     */
    showOtherSearch(): boolean {
        return this.context == TreeListContext.dataPanel && this.projectCtx == null;
    }

    advancedSearch() {
        const modalRef: NgbModalRef = this.modalService.open(AdvancedSearchModal, new ModalOptions('lg'));
        modalRef.result.then(
            (resource: ARTResource) => {
                this.advancedSearchEvent.emit(resource);
            },
            () => {}
        );
    }

    private customSearch() {
        const modalRef: NgbModalRef = this.modalService.open(LoadCustomSearchModal, new ModalOptions());
        modalRef.result.then(
            customSearchRef => {
                const modalRef: NgbModalRef = this.modalService.open(CustomSearchModal, new ModalOptions());
                modalRef.componentInstance.searchParameterizationReference = customSearchRef;
                modalRef.result.then(
                    (resource: ARTResource) => {
                        //exploit the same event (and related handler) of advanced search
                        this.advancedSearchEvent.emit(resource);
                    },
                    () => {}
                );
            },
            () => {}
        );
    }

    private updateSearchMode(mode: SearchMode, event: Event) {
        event.stopPropagation();
        this.searchSettings.stringMatchMode = mode;
        this.vbProperties.setSearchSettings(VBContext.getWorkingProjectCtx(this.projectCtx), this.searchSettings);
    }

    /**
     * AUTOCOMPLETER STUFF
     */
    @ViewChild('autocompleter') autocompleter: AutocompleteComponent;

    completerData: string[];
    isCompleterLoading: boolean;

    private lastCompleterKey: string;

    onChangeSearch() {
        if (this.searchStr.trim() == "" ) { 
            this.completerData = [];
            return;
        }
        /* ng-autocomplete component emit a inputChanged event even when user press any other key (e.g. move the caret) and the string doesn't change.
        I need to perform this check in order to prevent search repetition */
        if (this.lastCompleterKey == this.searchStr) {
            return;
        }
        this.lastCompleterKey = this.searchStr;

        this.isCompleterLoading = true;
        let langsParam: string[];
        let includeLocales: boolean;
        if (this.searchSettings.restrictLang) {
            langsParam = this.searchSettings.languages;
            includeLocales = this.searchSettings.includeLocales;
        }
        let schemesParam: ARTURIResource[];
        if (this.searchSettings.restrictActiveScheme) {
            schemesParam = this.schemes;
        }
        let clsParam: ARTURIResource;
        if (this.role == RDFResourceRolesEnum.individual && !this.searchSettings.extendToAllIndividuals) {
            clsParam = this.cls;
        }
        let concTreePref = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().conceptTreePreferences;
        this.searchService.searchStringList(this.searchStr, [this.role], this.searchSettings.useLocalName, this.searchSettings.stringMatchMode, 
            langsParam, includeLocales, schemesParam, concTreePref.multischemeMode, clsParam, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
            (results: string[]) => {
                this.completerData = results.slice(0, 100);
                this.isCompleterLoading = false;
            }
        );
    }

}