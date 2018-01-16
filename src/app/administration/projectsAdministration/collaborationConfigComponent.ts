import { Component, Input, SimpleChanges } from "@angular/core";
import { PluginsServices } from "../../services/pluginsServices";
import { CollaborationServices } from "../../services/collaborationServices";
import { Plugin, ExtensionPoint, PluginConfiguration } from "../../models/Plugins";
import { Project } from "../../models/Project";

@Component({
    selector: "collaboration-config",
    templateUrl: "./collaborationConfigComponent.html",
})
export class CollaborationConfigComponent {

    @Input() project: Project;

    private availableCollaborationPlugins: Plugin[];
    private selectedPlugin: Plugin;

    private collSysSettings: PluginConfiguration;
    private collSysPreferences: PluginConfiguration;

    constructor(private pluginService: PluginsServices, private collaborationService: CollaborationServices) { }

    ngOnInit() {
        this.pluginService.getAvailablePlugins(ExtensionPoint.COLLABORATION_BACKEND_ID).subscribe(
            plugins => {
                this.availableCollaborationPlugins = plugins;
                this.selectedPlugin = this.availableCollaborationPlugins[0];
                if (this.project != null) {
                    this.initCollaborationSystemConf();
                }
            }
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['project'] && changes['project'].currentValue && !changes['project'].firstChange) {
            this.initCollaborationSystemConf();
        }
    }

    private initCollaborationSystemConf() {
        this.collaborationService.getProjectSettings(this.selectedPlugin.factoryID, this.project.getName()).subscribe(
            settings => {
                this.collSysSettings = settings;
            }
        );
        this.collaborationService.getProjectPreferences(this.selectedPlugin.factoryID, this.project.getName()).subscribe(
            prefs => {
                this.collSysPreferences = prefs;
            }
        )
    }

    private isConfigured() {
        if (this.collSysSettings == null || this.collSysPreferences == null) {
            return false;
        }
        if (this.collSysSettings.requireConfiguration()) {
            return false;
        }
        if (this.collSysPreferences.requireConfiguration()) {
            return false;
        }
        return true;
    }

    private activate() {
        let settingsParam = this.collSysSettings.getPropertiesAsMap();
        let prefsParam = this.collSysPreferences.getPropertiesAsMap();
        this.collaborationService.activateCollaboratioOnProject(this.selectedPlugin.factoryID, this.project.getName(), settingsParam, prefsParam).subscribe(
            resp => {
                console.log("resp", resp);
            }
        )
    }

}