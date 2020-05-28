import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { LexEntryVisualizationMode, LexicalEntryListPreference } from "../../../../models/Properties";
import { VBContext } from "../../../../utils/VBContext";
import { VBProperties } from "../../../../utils/VBProperties";

@Component({
    selector: "lex-entry-list-settings-modal",
    templateUrl: "./lexicalEntryListSettingsModal.html",
})
export class LexicalEntryListSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private pristineLexEntryPref: LexicalEntryListPreference;

    private visualization: LexEntryVisualizationMode;
    private visualizationModes: { label: string, value: LexEntryVisualizationMode }[] = [
        { label: "Index based", value: LexEntryVisualizationMode.indexBased },
        { label: "Search based", value: LexEntryVisualizationMode.searchBased }
    ]

    private safeToGoLimit: number;

    private indexLenght: number;
    private lenghtChoices: number[] = [1, 2];

    constructor(public dialog: DialogRef<BSModalContext>, private vbProp: VBProperties) {
        this.context = dialog.context;
    }

    ngOnInit() {
        let lexEntryPref: LexicalEntryListPreference = VBContext.getWorkingProjectCtx().getProjectPreferences().lexEntryListPreferences;
        this.pristineLexEntryPref = JSON.parse(JSON.stringify(lexEntryPref));
        this.visualization = lexEntryPref.visualization;
        this.safeToGoLimit = lexEntryPref.safeToGoLimit;
        this.indexLenght = lexEntryPref.indexLength;
    }

    ok(event: Event) {
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
        
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close();
    }

    cancel() {
        this.dialog.dismiss();
    }

}