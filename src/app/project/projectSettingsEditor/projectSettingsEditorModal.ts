import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ExtensionPointID, Settings, Plugin } from "src/app/models/Plugins";
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

    //LEX MODEL
    lexModel: LexModelEntry;
    lexModelList: LexModelEntry[] = [
        { value: RDFS.uri, label: Project.getPrettyPrintModelType(RDFS.uri) },
        { value: SKOS.uri, label: Project.getPrettyPrintModelType(SKOS.uri) },
        { value: SKOSXL.uri, label: Project.getPrettyPrintModelType(SKOSXL.uri) },
        { value: OntoLex.uri, label: Project.getPrettyPrintModelType(OntoLex.uri) },
    ];

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
        this.initLexModel();
        this.initRenderingEngine();
        this.initUriGenerator();
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

    //================== LEX MODEL ==================

    initLexModel() {
        this.lexModel = this.lexModelList.find(lm => lm.value == this.project.getLexicalizationModelType());
    }

    changeLexModel() {
        this.basicModals.confirm({key: "STATUS.WARNING"}, {key: "MESSAGES.LEX_MODEL_CHANGE_CONFIRM", params: {model: this.lexModel.label}}, ModalType.warning).then(
            () => {
                //TODO service invocation
            },
            () => { //in case user cancel operation, restore the lex model
                this.initLexModel();
            }
        );
    }

    //================== RENDERING ENGINE ==================

    private initRenderingEngine() {
        //TODO init selection according current project settings
        this.pluginService.getAvailablePlugins(ExtensionPointID.RENDERING_ENGINE_ID).subscribe(
            (plugins: Plugin[]) => {
                this.rendEngPluginList = plugins;
                this.selectedRendEngPlugin = this.rendEngPluginList[0];
                this.onRendEngineChanged(); //init configuration for the default selected rendering engine plugin
            }
        );
    }

    /**
     * When the selected rendering engine changes, update the configurations list
     */
    onRendEngineChanged() {
        //check if the selected plugin configuration has already the configuration list
        var rendEngConfs: Settings[] = this.rendEngPluginConfMap.get(this.selectedRendEngPlugin.factoryID);
        if (rendEngConfs != null) {
            this.selectedRendEngPluginConfList = rendEngConfs;
            this.selectedRendEngPluginConf = this.selectedRendEngPluginConfList[0];
            return; //selected plugin is already in rendEngPluginConfMap, so there's no need to get the configurations
        }
        //configurations for selected plugin not found => get the configurations
        this.pluginService.getPluginConfigurations(this.selectedRendEngPlugin.factoryID).subscribe(
            configs => {
                this.rendEngPluginConfMap.set(configs.factoryID, configs.configurations);
                this.selectedRendEngPluginConfList = configs.configurations;
                //set the first configuration as default
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
        alert("TODO");
    }

    //================== URI GENERATOR ==================

    private initUriGenerator() {
        //TODO init selection according current project settings
        this.pluginService.getAvailablePlugins(ExtensionPointID.URI_GENERATOR_ID).subscribe(
            (plugins: Plugin[]) => {
                this.uriGenPluginList = plugins;
                this.selectedUriGenPlugin = this.uriGenPluginList[0];
                this.onUriGeneratorChanged(); //init configuration for the default selected uri generator plugin
            }
        );
    }

    /**
     * When the selected uri generator changes, update the configurations list
     */
    onUriGeneratorChanged() {
        //check if the selected plugin configuration has already the configuration list
        var uriGenConfs: Settings[] = this.uriGenPluginConfMap.get(this.selectedUriGenPlugin.factoryID);
        if (uriGenConfs != null) {
            this.selectedUriGenPluginConfList = uriGenConfs;
            this.selectedUriGenPluginConf = this.selectedUriGenPluginConfList[0];
            return; //selected plugin is already in uriGenPluginConfMap, so there's no need to get the configurations
        }
        //configurations for selected plugin not found => get the configurations
        this.pluginService.getPluginConfigurations(this.selectedUriGenPlugin.factoryID).subscribe(
            configs => {
                this.uriGenPluginConfMap.set(configs.factoryID, configs.configurations);
                this.selectedUriGenPluginConfList = configs.configurations;
                //set the first configuration as default
                this.selectedUriGenPluginConf = this.selectedUriGenPluginConfList[0];
            }
        )
    }

    configureUriGenerator() {
        this.sharedModals.configurePlugin(this.selectedUriGenPluginConf).then(
            (config: any) => {
                this.selectedUriGenPluginConf.properties = (<Settings>config).properties;
            },
            () => { }
        )
    }

    updateUriGenerator() {
        alert("TODO");
    }


    ok() {
        this.activeModal.close();
    }

}

interface LexModelEntry {
    value: string;
    label: string;
}