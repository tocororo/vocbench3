import { Component, ViewChild, ElementRef } from "@angular/core";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { DialogRef, ModalComponent } from "ngx-modialog";
import { PluginsServices } from "../services/pluginsServices";
import { CollaborationServices } from "../services/collaborationServices";
import { Plugin, PluginConfiguration, ExtensionPointID } from "../models/Plugins";
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { VBContext } from "../utils/VBContext";
import { VBCollaboration } from "../utils/VBCollaboration";
import { UIUtils } from "../utils/UIUtils";

@Component({
    selector: "collaboration-config-modal",
    templateUrl: "./collaborationConfigModal.html",
})
export class CollaborationConfigModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private availableCollaborationPlugins: Plugin[];

    private collSysSettings: PluginConfiguration;
    private collSysPreferences: PluginConfiguration;

    constructor(public dialog: DialogRef<BSModalContext>, private pluginService: PluginsServices, 
        private collaborationService: CollaborationServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.collaborationService.getProjectSettings(VBCollaboration.jiraFactoryId).subscribe(
            settings => {
                this.collSysSettings = settings;
            }
        );
        this.collaborationService.getProjectPreferences(VBCollaboration.jiraFactoryId).subscribe(
            preferences => {
                this.collSysPreferences = preferences;
            }
        );

    }

    private isOkClickable(): boolean {
        if (this.collSysSettings == null || this.collSysPreferences == null) {
            return false;
        }
        if (this.collSysPreferences.requireConfiguration()) {
            return false;
        }
        if (this.collSysSettings.requireConfiguration()) {
            return false;
        }
        return true;
    }

    ok(event: Event) {
        let settingsParam = this.collSysSettings.getPropertiesAsMap();
        let prefsParam = this.collSysPreferences.getPropertiesAsMap();
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.collaborationService.activateCollaboratioOnProject(VBCollaboration.jiraFactoryId, settingsParam, prefsParam).subscribe(
            resp => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                event.stopPropagation();
                event.preventDefault();
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}