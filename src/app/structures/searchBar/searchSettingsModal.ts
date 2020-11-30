import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { RDFResourceRolesEnum } from "../../models/ARTResources";
import { SearchMode, SearchSettings } from "../../models/Properties";
import { TreeListContext } from "../../utils/UIUtils";
import { ProjectContext, VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "search-settings-modal",
    templateUrl: "./searchSettingsModal.html",
    styles: [
        //in order to keep the background of the languages-input-text white when it's readonly but not disabled
        '.form-control[readonly]:not([disabled]) { background-color: #fff; }'
    ]
})
export class SearchSettingsModal {
    @Input() role: RDFResourceRolesEnum;
    @Input() structureCtx: TreeListContext;
    @Input() projectCtx: ProjectContext;

    private settings: SearchSettings;

    settingsForInstancePanel: boolean = false;
    settingsForConceptPanel: boolean = false;

    //search mode startsWith/contains/endsWith
    stringMatchModes: { labelTranslationKey: string, value: SearchMode }[] = [
        { labelTranslationKey: "DATA.SEARCH.SETTINGS.STRING_MATCH_MODE.STARTS_WITH", value: SearchMode.startsWith },
        { labelTranslationKey: "DATA.SEARCH.SETTINGS.STRING_MATCH_MODE.CONTAINS", value: SearchMode.contains },
        { labelTranslationKey: "DATA.SEARCH.SETTINGS.STRING_MATCH_MODE.ENDS_WITH", value: SearchMode.endsWith },
        { labelTranslationKey: "DATA.SEARCH.SETTINGS.STRING_MATCH_MODE.EXACT", value: SearchMode.exact },
        { labelTranslationKey: "DATA.SEARCH.SETTINGS.STRING_MATCH_MODE.FUZZY", value: SearchMode.fuzzy }
    ];
    private activeStringMatchMode: SearchMode;

    //search mode use URI/LocalName
    useURI: boolean = true;
    useLocalName: boolean = true;
    useNotes: boolean = true;

    restrictLang: boolean = false;
    includeLocales: boolean = false;
    languages: string[];

    useAutocompletion: boolean = false;

    //concept search restriction
    private restrictConceptSchemes: boolean = true;

    //individual panel search
    private extendsToAllIndividuals: boolean = false;

    constructor(public activeModal: NgbActiveModal, private vbProp: VBProperties, private sharedModals: SharedModalServices) {}

    ngOnInit() {
        this.settingsForConceptPanel = (this.role == RDFResourceRolesEnum.concept);
        //individual settings (extends individual search to all classes) must be visible only when modal is opened from the cls-ind panel in the data page
        this.settingsForInstancePanel = (this.role == RDFResourceRolesEnum.individual && this.structureCtx == TreeListContext.dataPanel);

        this.settings = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().searchSettings;
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

    selectRestrictionLanguages() {
        this.sharedModals.selectLanguages("Language restrictions", this.languages, false, true, this.projectCtx).then(
            (langs: string[]) => {
                this.languages = langs;
                this.updateSettings();
            },
            () => {}
        );
    }

    updateSettings() {
        this.vbProp.setSearchSettings(
            VBContext.getWorkingProjectCtx(this.projectCtx),
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

    ok() {
        this.activeModal.close();
    }

}