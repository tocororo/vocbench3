import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Settings, ConfigurableExtensionFactory } from '../../models/Plugins';
import { SharedModalServices } from '../modal/sharedModal/sharedModalServices';
import { BasicModalServices } from '../modal/basicModal/basicModalServices';
import { Configuration } from '../../models/Configuration';

@Component({
    selector: 'extension-configurator',
    templateUrl: './extensionConfiguratorComponent.html'
})
export class ExtensionConfiguratorComponent {

    @Input('extensions') extensions: ConfigurableExtensionFactory[];
    @Output() extensionUpdated = new EventEmitter<ConfigurableExtensionFactory>();
    @Output() configurationUpdated = new EventEmitter<Settings>();

    private selectedExtension: ConfigurableExtensionFactory;
    private selectedConfiguration: Settings;
    
    constructor(private basicModals: BasicModalServices, private sharedModals: SharedModalServices) {}

    ngOnInit() {
        this.selectedExtension = this.extensions[0];
        this.extensionUpdated.emit(this.selectedExtension);
        
        this.selectedConfiguration = this.selectedExtension.configurations[0];
        this.configurationUpdated.emit(this.selectedConfiguration);
    }

    private onChangeExtension() {
        this.extensionUpdated.emit(this.selectedExtension);
        this.selectedConfiguration = this.selectedExtension.configurations[0];
        this.configurationUpdated.emit(this.selectedConfiguration);
    }

    private onChangeConfig() {
        this.configurationUpdated.emit(this.selectedConfiguration);
    }

    private configure() {
        this.sharedModals.configurePlugin(this.selectedConfiguration).then(
            (cfg: Settings) => {
                //update the selected configuration...
                this.selectedConfiguration = cfg;
                //...and the configuration among the availables
                var configs: Settings[] = this.selectedExtension.configurations;
                for (var i = 0; i < configs.length; i++) {
                    if (configs[i].shortName == this.selectedConfiguration.shortName) {
                        configs[i] = this.selectedConfiguration;
                    }
                }

                this.extensionUpdated.emit(this.selectedExtension);
                this.configurationUpdated.emit(this.selectedConfiguration);
            },
            () => { }
        );
    }

    private saveConfig() {
        let config: { [key: string]: any } = this.selectedConfiguration.getPropertiesAsMap();
        this.sharedModals.storeConfiguration("Store configuration", this.selectedExtension.id, config).then(
            () => {
                this.basicModals.alert("Save configuration", "Configuration saved succesfully");
            },
            () => {}
        );
    }

    private loadConfig() {
        this.sharedModals.loadConfiguration("Load configuration", this.selectedExtension.id).then(
            (config: Settings) => {
                this.selectedConfiguration = config;
                this.configurationUpdated.emit(this.selectedConfiguration);
            },
            () => {}
        )
    }

}