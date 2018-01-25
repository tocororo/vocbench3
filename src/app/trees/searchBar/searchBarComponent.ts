import { Component, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { CompleterService } from 'ng2-completer';
import { CustomCompleterData } from "./customCompleterData";
import { SearchSettingsModal, SearchSettingsModalData } from './searchSettingsModal';
import { SearchServices } from "../../services/searchServices";
import { VBProperties } from "../../utils/VBProperties";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { ARTURIResource, RDFResourceRolesEnum } from "../../models/ARTResources";
import { StringMatchMode, SearchSettings } from "../../models/Properties";

@Component({
    selector: "search-bar",
    templateUrl: "./searchBarComponent.html"
})
export class SearchBarComponent {

    @Input() roles: RDFResourceRolesEnum[]; //tells the roles of the panel where the search bar is placed (usefull for customizing the settings)
    @Input() disabled: boolean = false;
    @Input() cls: ARTURIResource; //useful where search-bar is in the instance list panel
    @Output() search: EventEmitter<string> = new EventEmitter();

    //search mode startsWith/contains/endsWith
    private stringMatchModes: { show: string, value: StringMatchMode, symbol: string }[] = [
        { show: "Starts with", value: StringMatchMode.startsWith, symbol: "α.." },
        { show: "Contains", value: StringMatchMode.contains, symbol: ".α." },
        { show: "Ends with", value: StringMatchMode.endsWith, symbol: "..α" }
    ];

    private searchSettings: SearchSettings;

    private searchStr: string;
    private completerDatasource: CustomCompleterData;

    private eventSubscriptions: Subscription[] = [];

    constructor(private searchService: SearchServices, private modal: Modal, private vbProperties: VBProperties,
        private eventHandler: VBEventHandler, private completerService: CompleterService) {

        this.eventSubscriptions.push(eventHandler.schemeChangedEvent.subscribe(
            (schemes: ARTURIResource[]) => this.setSchemeInCompleter()));
        this.eventSubscriptions.push(eventHandler.searchPrefsUpdatedEvent.subscribe(
            () => this.updateSearchSettings()));
    }

    ngOnInit() {
        this.searchSettings = this.vbProperties.getSearchSettings();
        this.completerDatasource = new CustomCompleterData(this.searchService, this.roles, this.searchSettings);
        this.setSchemeInCompleter();
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['cls'] && ! changes['cls'].firstChange) {
            this.completerDatasource.setClass(changes['cls'].currentValue);
        }
        
    }

    /**
     * Handles the keyup event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(event: KeyboardEvent) {
        if (event.which == 13) {
            event.preventDefault();
            event.stopPropagation();
            this.doSearch();
        }
    }

    private doSearch() {
        if (this.searchStr != undefined && this.searchStr.trim() != "") {
            this.search.emit(this.searchStr);
        }
    }

    private editSettings() {
        var modalData = new SearchSettingsModalData(this.roles);
        const builder = new BSModalContextBuilder<SearchSettingsModalData>(
            modalData, undefined, SearchSettingsModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(SearchSettingsModal, overlayConfig);
    }

    private updateSearchMode(mode: StringMatchMode, event: Event) {
        event.stopPropagation();
        this.searchSettings.stringMatchMode = mode;
        this.vbProperties.setSearchSettings(this.searchSettings);
    }

    private setSchemeInCompleter() {
        if (this.roles.indexOf(RDFResourceRolesEnum.concept) != -1) {
            this.completerDatasource.setConceptSchemes(this.vbProperties.getActiveSchemes());
        }
    }

    /**
     * When the search settings is updated, updates the setting of the bar and the settings for the autocompleter
     */
    private updateSearchSettings() {
        this.searchSettings = this.vbProperties.getSearchSettings();
        this.completerDatasource.updateSearchSettings(this.searchSettings);
    }

}