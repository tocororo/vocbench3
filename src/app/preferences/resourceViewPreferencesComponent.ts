import { Component } from "@angular/core";
import { ResourceViewMode, ResourceViewPreference, ResourceViewType } from "../models/Properties";
import { OntoLex, SKOS } from "../models/Vocabulary";
import { VBContext } from "../utils/VBContext";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";

@Component({
    selector: "res-view-pref",
    templateUrl: "./resourceViewPreferencesComponent.html"
})
export class ResourceViewPreferencesComponent {

    resViewMode: ResourceViewMode;
    private resViewTabSync: boolean;

    rvConceptTypeSelectorAvailable: boolean;
    private rvConceptTypes: ResViewTypeOpt[] = [
        { type: ResourceViewType.resourceView, showTranslationKey: "RESOURCE_VIEW.TYPES.DETAILED", descrTranslationKey: "RESOURCE_VIEW.TYPES.DETAILED_DESCR" },
        { type: ResourceViewType.termView, showTranslationKey: "RESOURCE_VIEW.TYPES.TERMINOLOGIST", descrTranslationKey: "RESOURCE_VIEW.TYPES.TERMINOLOGIST_DESCR" }
    ];
    private selectedRvConceptType: ResViewTypeOpt;

    rvLexEntryTypeSelectorAvailable: boolean;
    private rvLexEntryTypes: ResViewTypeOpt[] = [
        { type: ResourceViewType.resourceView, showTranslationKey: "RESOURCE_VIEW.TYPES.DETAILED", descrTranslationKey: "RESOURCE_VIEW.TYPES.DETAILED_DESCR" },
        { type: ResourceViewType.lexicographerView, showTranslationKey: "RESOURCE_VIEW.TYPES.LEXICOGRAPHER", descrTranslationKey: "RESOURCE_VIEW.TYPES.LEXICOGRAPHER_DESCR" }
    ];
    private selectedRvLexEntryType: ResViewTypeOpt;

    displayImg: boolean;
    showDeprecated: boolean;
    showDatatypeBadge: boolean;
    sortByRendering: boolean;

    constructor(private vbProp: VBProperties, private eventHandler: VBEventHandler) { }

    ngOnInit() {
        let rvPrefs: ResourceViewPreference = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences;
        this.resViewMode = rvPrefs.mode;
        this.resViewTabSync = rvPrefs.syncTabs;
        this.displayImg = rvPrefs.displayImg;
        this.showDeprecated = rvPrefs.showDeprecated;
        this.showDatatypeBadge = rvPrefs.showDatatypeBadge;
        this.sortByRendering = rvPrefs.sortByRendering;

        this.selectedRvConceptType = this.rvConceptTypes.find(t => t.type == rvPrefs.defaultConceptType);
        this.selectedRvLexEntryType = this.rvLexEntryTypes.find(t => t.type == rvPrefs.defaultLexEntryType);
        //selection of RV type for concept available only in skos and ontolex projects
        this.rvConceptTypeSelectorAvailable = VBContext.getWorkingProject().getModelType() == SKOS.uri;
        //selection of RV type for lex entry available only in ontolex projects
        this.rvLexEntryTypeSelectorAvailable = VBContext.getWorkingProject().getModelType() == OntoLex.uri;
    }

    onResViewModeChange() {
        this.vbProp.setResourceViewMode(this.resViewMode);
        this.eventHandler.resViewModeChangedEvent.emit({ mode: this.resViewMode, fromVbPref: true });
    }

    onResViewConceptTypeChange() {
        let rvPrefs: ResourceViewPreference = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences;
        rvPrefs.defaultConceptType = this.selectedRvConceptType.type;
        this.vbProp.setResourceViewPreferences(rvPrefs);
    }

    onResViewLexEntryTypeChange() {
        let rvPrefs: ResourceViewPreference = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences;
        rvPrefs.defaultLexEntryType = this.selectedRvLexEntryType.type;
        this.vbProp.setResourceViewPreferences(rvPrefs);
    }

    onTabSyncChange() {
        this.vbProp.setResourceViewTabSync(this.resViewTabSync);
        this.eventHandler.resViewTabSyncChangedEvent.emit(this.resViewTabSync);
    }

    onDisplayImgChange() {
        this.vbProp.setResourceViewDisplayImg(this.displayImg);
    }

    onShowDeprecatedChange() {
        this.vbProp.setShowDeprecatedInResView(this.showDeprecated);
    }

    onShowDatatypeBadge() {
        this.vbProp.setShowDatatypeBadge(this.showDatatypeBadge);
    }

    onSortByRenderingChange() {
        this.vbProp.setSortByRendering(this.sortByRendering);
    }

}

interface ResViewTypeOpt {
    type: ResourceViewType;
    showTranslationKey: string;
    descrTranslationKey: string;
}