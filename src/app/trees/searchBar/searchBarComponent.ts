import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { Project } from "../../models/Project";
import { SearchMode, SearchSettings } from "../../models/Properties";
import { SearchServices } from "../../services/searchServices";
import { TreeListContext } from "../../utils/UIUtils";
import { ProjectContext, VBContext } from "../../utils/VBContext";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { VBProperties } from "../../utils/VBProperties";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AdvancedSearchModal } from "./advancedSearchModal";
import { CustomCompleterData } from "./customCompleterData";
import { CustomSearchModal } from "./customSearchModal";
import { LoadCustomSearchModal } from "./loadCustomSearchModal";
import { SearchSettingsModal } from './searchSettingsModal';

@Component({
    selector: "search-bar",
    templateUrl: "./searchBarComponent.html"
})
export class SearchBarComponent {

    @Input() role: RDFResourceRolesEnum; //tells the role of the panel where the search bar is placed (usefull for customizing the settings)
    @Input() disabled: boolean = false;
    @Input() cls: ARTURIResource; //useful where search-bar is in the instance list panel
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
    // private completerDatasource: CustomCompleterData;

    private eventSubscriptions: Subscription[] = [];

    constructor(private searchService: SearchServices, private modalService: NgbModal, private vbProperties: VBProperties,
        private eventHandler: VBEventHandler, private basicModals: BasicModalServices) {

        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (data: { schemes: ARTURIResource[], project: Project }) => {
                if (VBContext.getWorkingProjectCtx(this.projectCtx).getProject().getName() == data.project.getName()) {
                    this.setSchemeInCompleter(data.schemes);
                }
            })
        );
        this.eventSubscriptions.push(eventHandler.searchPrefsUpdatedEvent.subscribe(
            (project: Project) => {
                if (VBContext.getWorkingProjectCtx(this.projectCtx).getProject().getName() == project.getName()) {
                    this.updateSearchSettings();
                }
            })
        );
    }

    ngOnInit() {
        this.searchSettings = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().searchSettings;
        // this.completerDatasource = new CustomCompleterData(this.searchService, this.role, this.searchSettings);
        this.setSchemeInCompleter(VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().activeSchemes);
        this.setProjectCtxInCompleter(this.projectCtx);
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['cls'] && ! changes['cls'].firstChange) {
            // this.completerDatasource.setClass(changes['cls'].currentValue);
        }
        
    }

    doSearch() {
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

    private setSchemeInCompleter(schemes: ARTURIResource[]) {
        if (this.role == RDFResourceRolesEnum.concept) {
            // this.completerDatasource.setConceptSchemes(schemes);
        }
    }

    private setProjectCtxInCompleter(projectCtx: ProjectContext) {
        // this.completerDatasource.setProjectCtx(projectCtx);
    }

    /**
     * When the search settings is updated, updates the setting of the bar and the settings for the autocompleter
     */
    private updateSearchSettings() {
        this.searchSettings = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().searchSettings;
        // this.completerDatasource.updateSearchSettings(this.searchSettings);
    }

}