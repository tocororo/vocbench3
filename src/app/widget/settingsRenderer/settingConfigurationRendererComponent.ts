import { ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Configuration } from 'src/app/models/Configuration';
import { ExtensionFactory, SettingsPropTypeConstraint } from 'src/app/models/Plugins';
import { ExtensionsServices } from 'src/app/services/extensionsServices';
import { ExtensionConfiguratorComponent } from '../extensionConfigurator/extensionConfiguratorComponent';

@Component({
    selector: 'setting-configuration',
    templateUrl: './settingConfigurationRendererComponent.html',
})
export class SettingConfigurationRendererComponent {

    @Input() value: Configuration;
    @Input() disabled: boolean = false;
    @Input() constraints: SettingsPropTypeConstraint[];
    @Output() valueChanged = new EventEmitter<any>();

    @ViewChild(ExtensionConfiguratorComponent) extConfigurator: ExtensionConfiguratorComponent;

    extPointId: string;
    extensions: ExtensionFactory[];

    selectedExtension: ExtensionFactory;
    extensionConfig: Configuration;

    constructor(private extensionService: ExtensionsServices, private changeDetectorRef: ChangeDetectorRef) { }

    ngOnInit() {
        if (this.constraints.length > 0) {
            this.extPointId = this.constraints[0].value;
            this.extensionService.getExtensions(this.extPointId).subscribe(
                extensions => {
                    /* if a configuration (input value) needs to be restored, I need to copy value to this temp variable
                    since value will be reset as soon as extensions is initialized and ExtensionConfiguratorComponent
                    emits extensionUpdated and configurationUpdated */
                    let configToRestore: Configuration;
                    if (this.value) {
                        configToRestore = this.value.clone();
                    }

                    this.extensions = extensions;
                    this.changeDetectorRef.detectChanges(); //wait that child ExtensionConfiguratorComponent is initialized
                    if (configToRestore) {
                        this.extConfigurator.forceConfiguration(this.extPointId, configToRestore);
                    }
                }
            );
        }
    }


    onExtensionChange(selectedExtension: ExtensionFactory) {
        this.selectedExtension = selectedExtension;
    }

    onExtensionConfigUpdated(config: Configuration) {
        this.extensionConfig = config;
        this.emitChanges();
    }

    emitChanges() {
        this.value = this.extensionConfig;
        this.valueChanged.emit(this.value);
    }

}