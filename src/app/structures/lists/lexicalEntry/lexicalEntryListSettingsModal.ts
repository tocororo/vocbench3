import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LexEntryVisualizationMode, LexicalEntryListPreference, VisualizationModeTranslation } from "../../../models/Properties";
import { VBContext } from "../../../utils/VBContext";
import { VBProperties } from "../../../utils/VBProperties";

@Component({
    selector: "lex-entry-list-settings-modal",
    templateUrl: "./lexicalEntryListSettingsModal.html",
})
export class LexicalEntryListSettingsModal {

    private pristineLexEntryPref: LexicalEntryListPreference;

    visualization: LexEntryVisualizationMode;
    visualizationModes: { value: LexEntryVisualizationMode, labelTranslationKey: string }[] = [
        { value: LexEntryVisualizationMode.indexBased, labelTranslationKey: VisualizationModeTranslation.translationMap[LexEntryVisualizationMode.indexBased] },
        { value: LexEntryVisualizationMode.searchBased, labelTranslationKey: VisualizationModeTranslation.translationMap[LexEntryVisualizationMode.searchBased] }
    ]

    private safeToGoLimit: number;

    private indexLength: number;
    private lengthChoices: number[] = [1, 2];

    constructor(public activeModal: NgbActiveModal, private vbProp: VBProperties) {}

    ngOnInit() {
        let lexEntryPref: LexicalEntryListPreference = VBContext.getWorkingProjectCtx().getProjectPreferences().lexEntryListPreferences;
        this.pristineLexEntryPref = JSON.parse(JSON.stringify(lexEntryPref));
        this.visualization = lexEntryPref.visualization;
        this.safeToGoLimit = lexEntryPref.safeToGoLimit;
        this.indexLength = lexEntryPref.indexLength;
    }

    ok() {
        let changed: boolean = this.pristineLexEntryPref.visualization != this.visualization ||
            this.pristineLexEntryPref.safeToGoLimit != this.safeToGoLimit || 
            this.pristineLexEntryPref.indexLength != this.indexLength;
        //if something changed store the settings and close the dialog, otherwise cancel
        if (changed) {
            let lexEntryListPrefs: LexicalEntryListPreference = new LexicalEntryListPreference();
            lexEntryListPrefs.indexLength = this.indexLength;
            lexEntryListPrefs.safeToGoLimit = this.safeToGoLimit;
            lexEntryListPrefs.visualization = this.visualization;
            this.vbProp.setLexicalEntryListPreferences(lexEntryListPrefs);
            this.activeModal.close();
        } else {
            this.cancel();
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}