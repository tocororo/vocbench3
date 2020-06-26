import { Component } from "@angular/core";
import { ResourceViewConceptType, ResourceViewMode, ResourceViewPreference } from "../models/Properties";
import { OntoLex, SKOS } from "../models/Vocabulary";
import { VBContext } from "../utils/VBContext";
import { VBEventHandler } from "../utils/VBEventHandler";
import { VBProperties } from "../utils/VBProperties";

@Component({
    selector: "res-view-pref",
    templateUrl: "./resourceViewPreferencesComponent.html"
})
export class ResourceViewPreferencesComponent {

    private resViewMode: ResourceViewMode;
    private resViewTabSync: boolean;

    private typeSelectionAvailable: boolean;
    private rvConceptTypes: ResViewConceptTypeOpt[] = [
        { 
            type: ResourceViewConceptType.resourceForm, 
            show: "Resource Form", 
            description: "A complete UI for editing RDF data"
        },
        { 
            type: ResourceViewConceptType.simplifiedForm, 
            show: "Simplified Form", 
            description: "An alternative and simplified UI, less RDF-centric and more suitable for lexicographer, allowing for editing definitions and lexicalizations" 
        }
    ]
    private selectedRvConceptType: ResViewConceptTypeOpt;

    private displayImg: boolean;

    constructor(private vbProp: VBProperties, private eventHandler: VBEventHandler) { }

    ngOnInit() {
        let rvPrefs: ResourceViewPreference = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences;
        this.resViewMode = rvPrefs.mode;
        this.resViewTabSync = rvPrefs.syncTabs;
        this.displayImg = rvPrefs.displayImg;

        this.selectedRvConceptType = this.rvConceptTypes.find(t => t.type == rvPrefs.defaultConceptType);
        //selection of RV type for concept available only in skos and ontolex projects
        this.typeSelectionAvailable = VBContext.getWorkingProject().getModelType() == SKOS.uri || VBContext.getWorkingProject().getModelType() == OntoLex.uri;
    }

    private onResViewModeChange() {
        this.vbProp.setResourceViewMode(this.resViewMode);
        this.eventHandler.resViewModeChangedEvent.emit({ mode: this.resViewMode, fromVbPref: true });
    }

    private onResViewConceptTypeChange() {
        this.vbProp.setResourceViewConceptType(this.selectedRvConceptType.type);
    }

    private onTabSyncChange() {
        this.vbProp.setResourceViewTabSync(this.resViewTabSync);
        this.eventHandler.resViewTabSyncChangedEvent.emit(this.resViewTabSync);
    }

    private onDisplayImgChange() {
        this.vbProp.setResourceViewDisplayImg(this.displayImg);
    }

}

interface ResViewConceptTypeOpt {
    type: ResourceViewConceptType;
    show: string;
    description: string;
}