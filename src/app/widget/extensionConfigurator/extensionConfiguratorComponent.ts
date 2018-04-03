import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Settings, ConfigurableExtensionFactory } from '../../models/Plugins';
import { SharedModalServices } from '../modal/sharedModal/sharedModalServices';

@Component({
    selector: 'extension-configurator',
    templateUrl: './extensionConfiguratorComponent.html',
    host: { class: "hbox" }
})
export class ExtensionConfiguratorComponent {

    @Input('extensions') extensionsInput: ConfigurableExtensionFactory[];
    @Output() extensionUpdated = new EventEmitter<ConfigurableExtensionFactory>();
    @Output() configurationUpdated = new EventEmitter<Settings>();

    private extensions: ConfigurableExtensionFactory[];
    private selectedExtension: ConfigurableExtensionFactory;
    private selectedConfiguration: Settings;
    
    constructor(private sharedModals: SharedModalServices) {}

    ngOnInit() {
        // clone Input extensions so that changes on them, do not changes the ConfigurableExtensionFactory of the parent component
        this.extensions = [];
        for (var i = 0; i < this.extensionsInput.length; i++) {
            this.extensions.push(this.extensionsInput[i].clone());
        }

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

}