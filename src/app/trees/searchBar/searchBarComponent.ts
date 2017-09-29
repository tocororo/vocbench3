import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
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

    constructor(private modal: Modal, private vbProperties: VBProperties) {}

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