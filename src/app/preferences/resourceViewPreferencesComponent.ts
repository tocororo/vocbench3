import { Component } from "@angular/core";
import { ResourceViewType, ResourceViewMode, ResourceViewPreference } from "../models/Properties";
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

    typeSelectionAvailable: boolean;
    private rvConceptTypes: ResViewConceptTypeOpt[] = [
        { 
            type: ResourceViewType.resourceView, 
            show: "Detailed", 
            description: "The standard form for editing RDF resources"
        },
        { 
            type: ResourceViewType.termView, 
            show: "Terminologist", 
            description: "A simplified - less RDF centric - form tailored on the needs of terminologists and lexicographers" 
        }
    ]
    private selectedRvConceptType: ResViewConceptTypeOpt;

    displayImg: boolean;
    showDeprecated: boolean;
    showDatatypeBadge: boolean;

    constructor(private vbProp: VBProperties, private eventHandler: VBEventHandler) { }

    ngOnInit() {
        let rvPrefs: ResourceViewPreference = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences;
        this.resViewMode = rvPrefs.mode;
        this.resViewTabSync = rvPrefs.syncTabs;
        this.displayImg = rvPrefs.displayImg;
        this.showDeprecated = rvPrefs.showDeprecated;
        this.showDatatypeBadge = rvPrefs.showDatatypeBadge;

        this.selectedRvConceptType = this.rvConceptTypes.find(t => t.type == rvPrefs.defaultConceptType);
        //selection of RV type for concept available only in skos and ontolex projects
        this.typeSelectionAvailable = VBContext.getWorkingProject().getModelType() == SKOS.uri || VBContext.getWorkingProject().getModelType() == OntoLex.uri;
    }

    onResViewModeChange() {
        this.vbProp.setResourceViewMode(this.resViewMode);
        this.eventHandler.resViewModeChangedEvent.emit({ mode: this.resViewMode, fromVbPref: true });
    }

    onResViewConceptTypeChange() {
        this.vbProp.setResourceViewConceptType(this.selectedRvConceptType.type);
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

}

interface ResViewConceptTypeOpt {
    type: ResourceViewType;
    show: string;
    description: string;
}