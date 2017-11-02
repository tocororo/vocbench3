import { Component, Input } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
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
    styles: [
        //in order to keep the background of the languages-input-text white when it's readonly but not disabled
        '.form-control[readonly]:not([disabled]) { background-color: #fff; }'
    ]
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

    private restrictLang: boolean = false;
    private languages: string[];

    //concept search restriction
    private restrictConceptSchemes: boolean = true;

    //class panel search
    private clsIndSearchMode: { show: string, value: ClassIndividualPanelSearchMode }[] = [
        { show: "Only classes", value: ClassIndividualPanelSearchMode.onlyClasses },
        { show: "Only instances", value: ClassIndividualPanelSearchMode.onlyInstances },
        { show: "Both classes and instances", value: ClassIndividualPanelSearchMode.all }
    ];
    private activeClsIndSearchMode: ClassIndividualPanelSearchMode;


    constructor(public dialog: DialogRef<SearchSettingsModalData>, private vbProp: VBProperties, private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.settingsForConceptPanel = (this.context.roles != null && this.context.roles[0] == RDFResourceRolesEnum.concept);
        this.settingsForClassPanel = (this.context.roles != null && this.context.roles.indexOf(RDFResourceRolesEnum.cls) != -1 && 
            this.context.roles.indexOf(RDFResourceRolesEnum.individual) != -1);

        this.settings = this.vbProp.getSearchSettings();
        this.activeStringMatchMode = this.settings.stringMatchMode;
        this.useURI = this.settings.useURI;
        this.useLocalName = this.settings.useLocalName;
        this.restrictLang = this.settings.restrictLang;
        this.languages = this.settings.languages;
        this.restrictConceptSchemes = this.settings.restrictActiveScheme;
        this.activeClsIndSearchMode = this.settings.classIndividualSearchMode;
    }

    private selectRestrictionLanguages() {
        this.sharedModals.selectLanguages("Language restrictions", this.languages, true).then(
            (langs: string[]) => {
                this.languages = langs;
                this.updateSettings();
            },
            () => {}
        );
    }

    private updateSettings() {
        this.vbProp.setSearchSettings({
            stringMatchMode: this.activeStringMatchMode,
            useURI: this.useURI,
            useLocalName: this.useLocalName,
            restrictLang: this.restrictLang,
            languages: this.languages,
            restrictActiveScheme: this.restrictConceptSchemes,
            classIndividualSearchMode: this.activeClsIndSearchMode
        });
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}