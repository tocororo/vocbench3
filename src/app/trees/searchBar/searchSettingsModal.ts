import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { RDFResourceRolesEnum } from "../../models/ARTResources";
import { SearchMode, SearchSettings } from "../../models/Properties";
import { TreeListContext } from "../../utils/UIUtils";
import { ProjectContext, VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

export class SearchSettingsModalData extends BSModalContext {
    constructor(public role: RDFResourceRolesEnum, public structureCtx: TreeListContext, public projectCtx: ProjectContext) {
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

    private settingsForInstancePanel: boolean = false;
    private settingsForConceptPanel: boolean = false;

    //search mode startsWith/contains/endsWith
    private stringMatchModes: { show: string, value: SearchMode }[] = [
        { show: "Starts with", value: SearchMode.startsWith },
        { show: "Contains", value: SearchMode.contains },
        { show: "Ends with", value: SearchMode.endsWith },
        { show: "Exact", value: SearchMode.exact },
        { show: "Fuzzy", value: SearchMode.fuzzy }
    ];
    private activeStringMatchMode: SearchMode;

    //search mode use URI/LocalName
    private useURI: boolean = true;
    private useLocalName: boolean = true;
    private useNotes: boolean = true;

    private restrictLang: boolean = false;
    private includeLocales: boolean = false;
    private languages: string[];

    private useAutocompletion: boolean = false;

    //concept search restriction
    private restrictConceptSchemes: boolean = true;

    //individual panel search
    private extendsToAllIndividuals: boolean = false;

    constructor(public dialog: DialogRef<SearchSettingsModalData>, private vbProp: VBProperties, private sharedModals: SharedModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.settingsForConceptPanel = (this.context.role == RDFResourceRolesEnum.concept);
        //individual settings (extends individual search to all classes) must be visible only when modal is opened from the cls-ind panel in the data page
        this.settingsForInstancePanel = (this.context.role == RDFResourceRolesEnum.individual && this.context.structureCtx == TreeListContext.dataPanel);

        this.settings = VBContext.getWorkingProjectCtx(this.context.projectCtx).getProjectPreferences().searchSettings;
        this.activeStringMatchMode = this.settings.stringMatchMode;
        this.useURI = this.settings.useURI;
        this.useLocalName = this.settings.useLocalName;
        this.useNotes = this.settings.useNotes;
        this.restrictLang = this.settings.restrictLang;
        this.includeLocales = this.settings.includeLocales;
        this.languages = this.settings.languages;
        this.useAutocompletion = this.settings.useAutocompletion;
        this.restrictConceptSchemes = this.settings.restrictActiveScheme;
        this.extendsToAllIndividuals = this.settings.extendToAllIndividuals;
    }

    private selectRestrictionLanguages() {
        this.sharedModals.selectLanguages("Language restrictions", this.languages, true, this.context.projectCtx).then(
            (langs: string[]) => {
                this.languages = langs;
                this.updateSettings();
            },
            () => {}
        );
    }

    private updateSettings() {
        this.vbProp.setSearchSettings(
            VBContext.getWorkingProjectCtx(this.context.projectCtx),
            {
                stringMatchMode: this.activeStringMatchMode,
                useURI: this.useURI,
                useLocalName: this.useLocalName,
                useNotes: this.useNotes,
                restrictLang: this.restrictLang,
                includeLocales: this.includeLocales,
                languages: this.languages,
                useAutocompletion: this.useAutocompletion,
                restrictActiveScheme: this.restrictConceptSchemes,
                extendToAllIndividuals: this.extendsToAllIndividuals,
            }
        );
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

}