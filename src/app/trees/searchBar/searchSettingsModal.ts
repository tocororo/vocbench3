import { Component, Input } from "@angular/core";
import { BSModalContext } from 'angular2-modal/plugins/bootstrap';
import { DialogRef, ModalComponent } from "angular2-modal";
import { VBProperties, StringMatchMode, SearchSettings, ClassIndividualPanelSearchMode } from "../../utils/VBProperties";
import { RDFResourceRolesEnum } from "../../models/ARTResources";

export class SearchSettingsModalData extends BSModalContext {
    constructor(public roles: RDFResourceRolesEnum[]) {
        super();
    }
}

@Component({
    selector: "search-settings-modal",
    templateUrl: "./searchSettingsModal.html",
})
export class SearchSettingsModal implements ModalComponent<SearchSettingsModalData> {
    context: SearchSettingsModalData;

    private settings: SearchSettings;

    private settingsForClassPanel: boolean = false;
    private settingsForConceptPanel: boolean = false;

    //search mode startsWith/contains/endsWith
    private stringMatchModes: { show: string, value: StringMatchMode }[] = [
        { show: "Starts with", value: StringMatchMode.startsWith },
        { show: "Contains", value: StringMatchMode.contains },
        { show: "Ends with", value: StringMatchMode.endsWith }
    ];
    private activeStringMatchMode: StringMatchMode;

    //search mode use URI/LocalName
    private useURI: boolean = true;
    private useLocalName: boolean = true;

    //concept search restriction
    private restrictConceptSchemes: boolean = true;

    //class panel search
    private clsIndSearchMode: { show: string, value: ClassIndividualPanelSearchMode }[] = [
        { show: "Only classes", value: ClassIndividualPanelSearchMode.onlyClasses },
        { show: "Only instances", value: ClassIndividualPanelSearchMode.onlyInstances },
        { show: "Both classes and instances", value: ClassIndividualPanelSearchMode.all }
    ];
    private activeClsIndSearchMode: ClassIndividualPanelSearchMode;


    constructor(public dialog: DialogRef<SearchSettingsModalData>, private vbProp: VBProperties) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.settingsForConceptPanel = (this.context.roles != null && this.context.roles[0] == RDFResourceRolesEnum.concept);
        this.settingsForClassPanel = (this.context.roles != null && this.context.roles.indexOf(RDFResourceRolesEnum.cls) != -1 && 
            this.context.roles.indexOf(RDFResourceRolesEnum.individual) != -1);

        this.settings = this.vbProp.getSearchSettings();
        console.log("settings", this.settings);
        this.activeStringMatchMode = this.settings.stringMatchMode;
        this.useURI = this.settings.useURI;
        this.useLocalName = this.settings.useLocalName;
        this.restrictConceptSchemes = this.settings.restrictActiveScheme;
        this.activeClsIndSearchMode = this.settings.classIndividualSearchMode;
    }

    private updateSettings() {
        this.settings.stringMatchMode = this.activeStringMatchMode;
        this.settings.useURI = this.useURI;
        this.settings.useLocalName = this.useLocalName;
        this.settings.restrictActiveScheme = this.restrictConceptSchemes;
        this.settings.classIndividualSearchMode = this.activeClsIndSearchMode
        this.vbProp.setSearchSettings(this.settings);
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}