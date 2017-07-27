import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { SearchSettingsModal, SearchSettingsModalData } from './searchSettingsModal';
import { VBProperties, StringMatchMode, SearchSettings, ClassIndividualPanelSearchMode } from "../../utils/VBProperties";
import { RDFResourceRolesEnum } from "../../models/ARTResources";

@Component({
    selector: "search-bar",
    templateUrl: "./searchBarComponent.html"
})
export class SearchBarComponent {

    @Input() roles: RDFResourceRolesEnum[]; //tells the roles of the panel where the search bar is placed (usefull for customizing the settings)
    @Output() search: EventEmitter<string> = new EventEmitter();

    // private inClassPanel: boolean = false;
    // private inConceptPanel: boolean = false;

    // private searchSettings: SearchSettings;

    // //search mode startsWith/contains/endsWith
    // private stringMatchModes: { show: string, value: StringMatchMode }[] = [
    //     // { show: "Starts with", value: StringMatchMode.startsWith },
    //     // { show: "Contains", value: StringMatchMode.contains },
    //     // { show: "Ends with", value: StringMatchMode.endsWith }
    //     { show: "Starts with", value: "startsWith" },
    //     { show: "Contains", value: "contains" },
    //     { show: "Ends with", value: "endsWith" }
    // ];
    // private activeStringMatchMode: StringMatchMode;

    // //search mode use URI/LocalName
    // private useURI: boolean;
    // private useLocalName: boolean;

    // //concept search restriction
    // private restrictConceptSchemes: boolean;

    // //class panel search
    // private clsIndSearchMode: { show: string, value: ClassIndividualPanelSearchMode }[] = [
    //     // { show: "Only classes", value: ClassIndividualPanelSearchMode.onlyClasses },
    //     // { show: "Only instances", value: ClassIndividualPanelSearchMode.onlyInstances },
    //     // { show: "Both classes and instances", value: ClassIndividualPanelSearchMode.all }
    //     { show: "Only classes", value: "onlyClasses" },
    //     { show: "Only instances", value: "onlyInstances" },
    //     { show: "Both classes and instances", value: "all" }
    // ];
    // private activeClsIndSearchMode: ClassIndividualPanelSearchMode;

    constructor(private modal: Modal, private vbProperties: VBProperties) {}

    ngOnInit() {
        // this.inConceptPanel = (this.roles != null && this.roles[0] == RDFResourceRolesEnum.concept);
        // this.inClassPanel = (this.roles != null && this.roles.indexOf(RDFResourceRolesEnum.cls) != -1 && 
        //     this.roles.indexOf(RDFResourceRolesEnum.individual) != -1);
        

        // this.searchSettings = this.vbProperties.getSearchSettings();
        // this.activeStringMatchMode = this.searchSettings.stringMatchMode;
        // console.log("at init string match " + this.activeStringMatchMode);
        // for (var i = 0; i < this.stringMatchModes.length; i++) {
        //     console.log("panel", this.roles, "stringmatchmode", this.stringMatchModes[i], "equals? " + (this.stringMatchModes[i].value === this.activeStringMatchMode));
        // }
        // this.useURI = this.searchSettings.useURI;
        // this.useLocalName = this.searchSettings.useLocalName;
        // this.restrictConceptSchemes = this.searchSettings.restrictActiveScheme;
        // this.activeClsIndSearchMode = this.searchSettings.classIndividualSearchMode;
    }

    // private updateStringMatchMode(mode: StringMatchMode) {
    //     this.activeStringMatchMode = mode;
    //     this.updateSettings();
    // }

    // private updateClsIndSearchMode(mode: ClassIndividualPanelSearchMode) {
    //     this.activeClsIndSearchMode = mode;
    //     this.updateSettings();
    // }

    // private updateSettings() {
    //     this.searchSettings.stringMatchMode = this.activeStringMatchMode;
    //     this.searchSettings.useURI = this.useURI;
    //     this.searchSettings.useLocalName = this.useLocalName;
    //     this.searchSettings.restrictActiveScheme = this.restrictConceptSchemes;
    //     this.searchSettings.classIndividualSearchMode = this.activeClsIndSearchMode;
    //     console.log("saving settings", this.searchSettings);
    //     this.vbProperties.setSearchSettings(this.searchSettings);
    // }

    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(key: number, searchedText: string) {
        if (key == 13) {
            this.doSearch(searchedText);
        }
    }

    private doSearch(text: string) {
        this.search.emit(text);
    }

    private editSettings() {
        var modalData = new SearchSettingsModalData(this.roles);
        const builder = new BSModalContextBuilder<SearchSettingsModalData>(
            modalData, undefined, SearchSettingsModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(SearchSettingsModal, overlayConfig);
    }


}