import { Component } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LexEntryVisualizationMode, LexicalEntryListPreference } from "../../../../models/Properties";
import { VBContext } from "../../../../utils/VBContext";
import { VBProperties } from "../../../../utils/VBProperties";

@Component({
    selector: "lex-entry-list-settings-modal",
    templateUrl: "./lexicalEntryListSettingsModal.html",
})
export class LexicalEntryListSettingsModal {

    private pristineLexEntryPref: LexicalEntryListPreference;

    visualization: LexEntryVisualizationMode;
    visualizationModes: { label: string, value: LexEntryVisualizationMode }[] = [
        { label: "Index based", value: LexEntryVisualizationMode.indexBased },
        { label: "Search based", value: LexEntryVisualizationMode.searchBased }
    ]

    private safeToGoLimit: number;

    private indexLenght: number;
    private lenghtChoices: number[] = [1, 2];

    constructor(public activeModal: NgbActiveModal, private vbProp: VBProperties) {}

    ngOnInit() {
        let lexEntryPref: LexicalEntryListPreference = VBContext.getWorkingProjectCtx().getProjectPreferences().lexEntryListPreferences;
        this.pristineLexEntryPref = JSON.parse(JSON.stringify(lexEntryPref));
        this.visualization = lexEntryPref.visualization;
        this.safeToGoLimit = lexEntryPref.safeToGoLimit;
        this.indexLenght = lexEntryPref.indexLength;
    }

    ok() {
        if (this.pristineLexEntryPref.visualization != this.visualization) {
            this.vbProp.setLexicalEntryListVisualization(this.visualization);
        }
        
        if (this.visualization == LexEntryVisualizationMode.indexBased) {
            if (this.pristineLexEntryPref.safeToGoLimit != this.safeToGoLimit) {
                this.vbProp.setLexicalEntryListSafeToGoLimit(this.safeToGoLimit);
            }
            if (this.pristineLexEntryPref.indexLength != this.indexLenght) {
                this.vbProp.setLexicalEntryListIndexLenght(this.indexLenght);
            }
        }
        
        this.activeModal.close();
    }

    cancel() {
        this.activeModal.dismiss();
    }

}