import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Configuration } from '../../models/Configuration';
import { ConfigurableExtensionFactory, ExtensionConfigurationStatus, Settings } from '../../models/Plugins';
import { ConfigurationsServices } from '../../services/configurationsServices';
import { BasicModalServices } from '../modal/basicModal/basicModalServices';
import { LoadConfigurationModalReturnData } from '../modal/sharedModal/configurationStoreModal/loadConfigurationModal';
import { SharedModalServices } from '../modal/sharedModal/sharedModalServices';

@Component({
    selector: 'extension-configurator',
    templateUrl: './extensionConfiguratorComponent.html'
})
export class ExtensionConfiguratorComponent {

    @Input('extensions') extensions: ConfigurableExtensionFactory[];
    @Input() storeable: boolean = true; //tells if the component should allow to store and load configuration
    @Input() disabled: boolean = false;
    @Output() extensionUpdated = new EventEmitter<ConfigurableExtensionFactory>();
    @Output() configurationUpdated = new EventEmitter<Settings>();
    @Output() configStatusUpdated = new EventEmitter<{ status: ExtensionConfigurationStatus, relativeReference?: string }>();

    selectedExtension: ConfigurableExtensionFactory;
    private selectedConfiguration: Settings;

    private status: ExtensionConfigurationStatus;

    constructor(private configurationService: ConfigurationsServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices) { }

    ngOnInit() {
        this.selectedExtension = this.extensions[0];
        this.extensionUpdated.emit(this.selectedExtension);

        if (this.selectedExtension.configurations != null) {
            this.selectedConfiguration = this.selectedExtension.configurations[0];
            this.configurationUpdated.emit(this.selectedConfiguration);
        }

        this.status = ExtensionConfigurationStatus.unsaved;
        this.configStatusUpdated.emit({ status: this.status });
    }

    onChangeExtension() {
        this.extensionUpdated.emit(this.selectedExtension);
        if (this.selectedExtension.configurations != null) { //if extension has configurations
            this.selectedConfiguration = this.selectedExtension.configurations[0];
            this.configurationUpdated.emit(this.selectedConfiguration);

            this.status = ExtensionConfigurationStatus.unsaved;
            this.configStatusUpdated.emit({ status: this.status });
        }
    }

    onChangeConfig() {
        this.configurationUpdated.emit(this.selectedConfiguration);

        this.status = ExtensionConfigurationStatus.unsaved;
        this.configStatusUpdated.emit({ status: this.status });
    }

    configure() {
        this.sharedModals.configurePlugin(this.selectedConfiguration).then(
            (cfg: Settings) => {
                //update the selected configuration...
                this.selectedConfiguration = cfg;
                //...and the configuration among the availables
                let configs: Settings[] = this.selectedExtension.configurations;
                for (let i = 0; i < configs.length; i++) {
                    if (configs[i].shortName == this.selectedConfiguration.shortName) {
                        configs[i] = this.selectedConfiguration;
                    }
                }

                this.extensionUpdated.emit(this.selectedExtension);
                this.configurationUpdated.emit(this.selectedConfiguration);

                this.status = ExtensionConfigurationStatus.unsaved;
                this.configStatusUpdated.emit({ status: this.status });
            },
            () => { }
        );
    }

    saveConfig() {
        let config: { [key: string]: any } = this.selectedConfiguration.getPropertiesAsMap(true);
        this.sharedModals.storeConfiguration({ key: "ACTIONS.SAVE_CONFIGURATION" }, this.selectedExtension.id, config).then(
            (relativeRef: string) => {
                this.basicModals.alert({ key: "STATUS.OPERATION_DONE" }, { key: "MESSAGES.CONFIGURATION_SAVED" });

                this.status = ExtensionConfigurationStatus.saved;
                this.configStatusUpdated.emit({ status: this.status, relativeReference: relativeRef });
            },
            () => { }
        );
    }

    loadConfig() {
        this.sharedModals.loadConfiguration({ key: "ACTIONS.LOAD_CONFIGURATION" }, this.selectedExtension.id).then(
            (config: LoadConfigurationModalReturnData) => {
                for (let i = 0; i < this.selectedExtension.configurations.length; i++) {
                    if (this.selectedExtension.configurations[i].type == config.configuration.type) {
                        this.selectedExtension.configurations[i] = config.configuration;
                        this.selectedConfiguration = this.selectedExtension.configurations[i];
                    }
                }
                this.configurationUpdated.emit(this.selectedConfiguration);

                this.status = ExtensionConfigurationStatus.saved;
                this.configStatusUpdated.emit({ status: this.status, relativeReference: config.reference.relativeReference });
            },
            () => { }
        );
    }

    //useful to change the selected extension and configuration from a parent component
    public selectExtensionAndConfiguration(extensionID: string, configurationType: string) {
        //select extension
        for (let ext of this.extensions) {
            if (ext.id == extensionID) {
                this.selectedExtension = ext;
                this.extensionUpdated.emit(this.selectedExtension);
                break;
            }
        }
        for (let conf of this.selectedExtension.configurations) {
            if (conf.type == configurationType) {
                this.selectedConfiguration = conf;
                this.configurationUpdated.emit(this.selectedConfiguration);
            }
        }
    }

    /**
     * Select the given extension and configuration
     * @param extensionID 
     * @param config 
     */
    public forceConfiguration(extensionID: string, config: Settings) {
        //select extension
        for (let ext of this.extensions) {
            if (ext.id == extensionID) {
                this.selectedExtension = ext;
                this.extensionUpdated.emit(this.selectedExtension);
                break;
            }
        }
        //force configuration
        this.selectConfigOfSelectedExtension(config);
    }

    //useful for forcing a configuration through its reference (e.g. for the filter chain of load/export data)
    public forceConfigurationByRef(extensionID: string, configRef: string) {
        //select extension
        for (let ext of this.extensions) {
            if (ext.id == extensionID) {
                this.selectedExtension = ext;
                this.extensionUpdated.emit(this.selectedExtension);
                break;
            }
        }
        //load the configuration
        this.configurationService.getConfiguration(this.selectedExtension.id, configRef).subscribe(
            (conf: Configuration) => {
                this.selectConfigOfSelectedExtension(conf);

                this.status = ExtensionConfigurationStatus.saved;
                this.configStatusUpdated.emit({ status: this.status, relativeReference: configRef });
            }
        );
    }

    private selectConfigOfSelectedExtension(config: Settings) {
        for (let i = 0; i < this.selectedExtension.configurations.length; i++) {
            if (this.selectedExtension.configurations[i].type == config.type) {
                this.selectedExtension.configurations[i] = config;
                this.selectedConfiguration = this.selectedExtension.configurations[i];
                break;
            }
        }
        this.configurationUpdated.emit(this.selectedConfiguration);
    }


}