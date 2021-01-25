import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { ExtensionPointID, Settings, Plugin, PluginSpecification } from "src/app/models/Plugins";
import { OntoLex, RDFS, SKOS, SKOSXL } from "src/app/models/Vocabulary";
import { PluginsServices } from "src/app/services/pluginsServices";
import { ProjectServices } from "src/app/services/projectServices";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ModalType } from "src/app/widget/modal/Modals";
import { SharedModalServices } from "src/app/widget/modal/sharedModal/sharedModalServices";
import { Project } from '../../models/Project';

@Component({
    selector: "proj-settings-editor-modal",
    templateUrl: "./projectSettingsEditorModal.html",
})
export class ProjSettingsEditorModal {
    @Input() project: Project;

    //BLACKLISTING
    validationEnabled: boolean;
    blacklisting: boolean;

    openAtStartup: boolean;

    //RENDERING ENGINE PLUGIN
    rendEngPluginList: Plugin[]; //available plugins for rendering engine
    selectedRendEngPlugin: Plugin; //chosen plugin for rendering engine
    rendEngPluginConfMap: Map<string, Settings[]> = new Map(); //map of <factoryID, pluginConf> (plugin - available configs)
    selectedRendEngPluginConfList: Settings[]; //plugin configurations for the selected plugin
    selectedRendEngPluginConf: Settings; //chosen configuration for the chosen rendering engine plugin

    //URI GENERATOR PLUGIN
    uriGenPluginList: Plugin[]; //available plugins for uri generator (retrieved through getAvailablePlugins)
    selectedUriGenPlugin: Plugin; //chosen plugin for uri generator (the one selected through a <select> element)
    uriGenPluginConfMap: Map<string, Settings[]> = new Map(); //map of <factoryID, pluginConf> used to store the configurations for the plugins
    selectedUriGenPluginConfList: Settings[]; //plugin configurations for the selected plugin (represent the choices of the <select> element of configurations)
    selectedUriGenPluginConf: Settings; //chosen configuration for the chosen uri generator plugin (selected through a <select> element)

    constructor(public activeModal: NgbActiveModal, private pluginService: PluginsServices, private projectService: ProjectServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices) { }

    ngOnInit() {
        this.initBlacklisting();
        this.initRenderingEngine();
        this.initUriGenerator();
        this.openAtStartup = this.project.getOpenAtStartup();
    }

    //================== BLACKLISTING ==================

    initBlacklisting() {
        this.validationEnabled = this.project.isValidationEnabled();
        if (this.validationEnabled) {
            this.blacklisting = this.project.isBlacklistingEnabled();
        }
    }

    changeBlacklisting() {
        this.blacklisting = !this.blacklisting;
        this.projectService.setBlacklistingEnabled(this.project.getName(), this.blacklisting).subscribe();
        this.project.setBlacklistingEnabled(this.blacklisting);
    }

    //================== OPEN AT STARTUP ==================

    changeOpenAtStartup() {
        this.openAtStartup = !this.openAtStartup;
        this.projectService.setOpenAtStartup(this.project.getName(), this.openAtStartup).subscribe();
        this.project.setOpenAtStartup(this.openAtStartup);
    }

    //================== RENDERING ENGINE ==================

    private initRenderingEngine() {
        this.pluginService.getAvailablePlugins(ExtensionPointID.RENDERING_ENGINE_ID).subscribe(
            (plugins: Plugin[]) => {
                this.rendEngPluginList = plugins;
                this.projectService.getRenderingEngineConfiguration(this.project.getName()).subscribe(
                    config => {
                        let pluginToRestore = config.factoryID;
                        let configToRestore = config.settings;
                        //select the plugin among the available
                        this.selectedRendEngPlugin = this.rendEngPluginList.find(p => p.factoryID == pluginToRestore);
                        //restore the configuration
                        this.ensureRenderingEngineConfigLoaded().subscribe(
                            () => {
                                //update the list of plugin configurations (according the selected plugin)
                                this.selectedRendEngPluginConfList = this.rendEngPluginConfMap.get(this.selectedRendEngPlugin.factoryID);
                                //search the configuration to restore among these configuration list, then replace it and set it as selected
                                let targetConfigIdx = this.selectedRendEngPluginConfList.findIndex(c => c.type == configToRestore.type);
                                this.selectedRendEngPluginConfList[targetConfigIdx] = configToRestore;
                                this.selectedRendEngPluginConf = this.selectedRendEngPluginConfList[targetConfigIdx];
                            }
                        )
                    }
                );
            }
        );
    }

    /**
     * Ensures that the configurations for the selected plugin is available.
     * If they are not yet in the map retrieve them form server, otherwise do nothing
     */
    private ensureRenderingEngineConfigLoaded(): Observable<void> {
        let confs: Settings[] = this.rendEngPluginConfMap.get(this.selectedRendEngPlugin.factoryID);
        if (confs != null) { //selected plugin is already in the map, so there's no need to get the configurations
            return of(null);
        } else { //configurations for selected plugin not found => get the configurations
            return this.pluginService.getPluginConfigurations(this.selectedRendEngPlugin.factoryID).pipe(
                map(configs => {
                    this.rendEngPluginConfMap.set(configs.factoryID, configs.configurations);
                })
            );
        }
    }

    /**
     * When the selected rendering engine changes, update the configurations list
     */
    onRendEngineChanged() {
        this.ensureRenderingEngineConfigLoaded().subscribe(
            () => {
                this.selectedRendEngPluginConfList = this.rendEngPluginConfMap.get(this.selectedRendEngPlugin.factoryID);
                this.selectedRendEngPluginConf = this.selectedRendEngPluginConfList[0];
            }
        )
    }

    configureRenderingEngine() {
        this.sharedModals.configurePlugin(this.selectedRendEngPluginConf).then(
            (config: Settings) => {
                this.selectedRendEngPluginConf.properties = config.properties;
            },
            () => { }
        )
    }

    updateRenderingEngine() {
        let pluginSpec: PluginSpecification;
        //check if plugin needs to be configured
        if (this.selectedRendEngPluginConf.requireConfiguration()) {
            //...and in case if every required configuration parameters are not null
            this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.MISSING_RENDERING_ENGINE_CONFIG"}, ModalType.warning);
            return;
        }
        pluginSpec = {
            factoryId: this.selectedRendEngPlugin.factoryID,
            configType: this.selectedRendEngPluginConf.type,
            properties: this.selectedRendEngPluginConf.getPropertiesAsMap()
        }
        this.projectService.updateRenderingEngineConfiguration(this.project.getName(), pluginSpec).subscribe(
            () => {
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key:"MESSAGES.RENDERING_ENGINE_CONFIG_UPDATED"});
            }
        )
    }

    //================== URI GENERATOR ==================

    private initUriGenerator() {
        this.pluginService.getAvailablePlugins(ExtensionPointID.URI_GENERATOR_ID).subscribe(
            (plugins: Plugin[]) => {
                this.uriGenPluginList = plugins;
                this.projectService.getURIGeneratorConfiguration(this.project.getName()).subscribe(
                    config => {
                        let pluginToRestore = config.factoryID;
                        let configToRestore = config.settings;
                        //select the plugin among the available
                        this.selectedUriGenPlugin = this.uriGenPluginList.find(p => p.factoryID == pluginToRestore);
                        //restore the configuration
                        this.ensureUriGeneratorConfigLoaded().subscribe(
                            () => {
                                //update the list of plugin configurations (according the selected plugin)
                                this.selectedUriGenPluginConfList = this.uriGenPluginConfMap.get(this.selectedUriGenPlugin.factoryID);
                                //search the configuration to restore among these configuration list, then replace it and set it as selected
                                let targetConfigIdx = this.selectedUriGenPluginConfList.findIndex(c => c.type == configToRestore.type);
                                this.selectedUriGenPluginConfList[targetConfigIdx] = configToRestore;
                                this.selectedUriGenPluginConf = this.selectedUriGenPluginConfList[targetConfigIdx];
                            }
                        )
                    }
                );
            }
        );
    }

    /**
     * Ensures that the configurations for the selected plugin is available.
     * If they are not yet in the map retrieve them form server, otherwise do nothing
     */
    private ensureUriGeneratorConfigLoaded(): Observable<void> {
        let confs: Settings[] = this.uriGenPluginConfMap.get(this.selectedUriGenPlugin.factoryID);
        if (confs != null) { //selected plugin is already in map, so there's no need to get the configurations
            return of(null);
        } else { //configurations for selected plugin not found => get the configurations and store them in the map
            return this.pluginService.getPluginConfigurations(this.selectedUriGenPlugin.factoryID).pipe(
                map(configs => {
                    this.uriGenPluginConfMap.set(configs.factoryID, configs.configurations);
                })
            );
        }
    }

    /**
     * When the selected uri generator changes, update the configurations list and select the first config
     */
    onUriGeneratorChanged() {
        this.ensureUriGeneratorConfigLoaded().subscribe(
            () => {
                this.selectedUriGenPluginConfList = this.uriGenPluginConfMap.get(this.selectedUriGenPlugin.factoryID);
                this.selectedUriGenPluginConf = this.selectedUriGenPluginConfList[0];
            }
        )
    }

    configureUriGenerator() {
        this.sharedModals.configurePlugin(this.selectedUriGenPluginConf).then(
            (config: Settings) => {
                this.selectedUriGenPluginConf.properties = (<Settings>config).properties;
            },
            () => { }
        )
    }

    updateUriGenerator() {
        let pluginSpec: PluginSpecification;
        //check if plugin needs to be configured
        if (this.selectedUriGenPluginConf.requireConfiguration()) {
            this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.MISSING_URI_GENERATOR_CONFIG"}, ModalType.warning);
            return;
        }
        pluginSpec = {
            factoryId: this.selectedUriGenPlugin.factoryID,
            configType: this.selectedUriGenPluginConf.type,
            properties: this.selectedUriGenPluginConf.getPropertiesAsMap()
        }
        this.projectService.updateURIGeneratorConfiguration(this.project.getName(), pluginSpec).subscribe(
            () => {
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key:"MESSAGES.URI_GENERATOR_CONFIG_UPDATED"});
            }
        );
    }


    ok() {
        this.activeModal.close();
    }

}

interface LexModelEntry {
    value: string;
    label: string;
}