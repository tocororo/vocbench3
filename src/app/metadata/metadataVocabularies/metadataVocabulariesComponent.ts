import { Component } from "@angular/core";
import { forkJoin, Observable } from 'rxjs';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ExtensionPointID, NonConfigurableExtensionFactory, PluginSpecification, Scope, Settings } from "../../models/Plugins";
import { RDFFormat } from "../../models/RDFFormat";
import { DatasetMetadataServices } from "../../services/datasetMetadataServices";
import { ExportServices } from "../../services/exportServices";
import { ExtensionsServices } from "../../services/extensionsServices";
import { SettingsServices } from "../../services/settingsServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "metadata-vocabularies-component",
    templateUrl: "./metadataVocabulariesComponent.html",
    host: { class: "pageComponent" }
})
export class MetadataVocabulariesComponent {

    //export format selection
    exportFormats: RDFFormat[];
    selectedExportFormat: RDFFormat;

    exporters: NonConfigurableExtensionFactory[];
    selectedExporter: NonConfigurableExtensionFactory;

    settingsStructs: SettingsStruct[];

    // private selectedExporterSettings: Settings;
    extensionPointSettings: Settings;

    constructor(private metadataExporterService: DatasetMetadataServices, private exportService: ExportServices,
        private extensionService: ExtensionsServices, private settingsService: SettingsServices, private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.exportService.getOutputFormats().subscribe(
            formats => {
                this.exportFormats = formats;
                //select Turtle as default
                for (var i = 0; i < this.exportFormats.length; i++) {
                    if (this.exportFormats[i].name == "Turtle") {
                        this.selectedExportFormat = this.exportFormats[i];
                        return;
                    }
                }
            }
        );
        this.extensionService.getExtensions(ExtensionPointID.DATASET_METADATA_EXPORTER_ID).subscribe(
            extensions => {
                this.exporters = <NonConfigurableExtensionFactory[]>extensions;
            }
        )
    }

    onExtensionChange() {
        if (this.selectedExporter == null) return;

        this.settingsStructs = [];
        //for each scope retrieve the settings
        this.selectedExporter.settingsScopes.forEach(
            (scope: Scope) => {
                this.settingsService.getSettings(this.selectedExporter.id, scope).subscribe(
                    settings => {
                        this.settingsStructs.push({ settings: settings, scope: scope });
                    }
                );
            }
        );

        this.settingsService.getSettings(ExtensionPointID.DATASET_METADATA_EXPORTER_ID, Scope.PROJECT).subscribe(
            settings => {
                this.extensionPointSettings = settings;
            }
        )
    }

    saveSettings() {
        let saveSettingsFnArray: any[] = [];

        if (!this.isCommonSettingsConfigure()) {
            return;
        }
        //extension point settings may be without properties, so check if is necessary to invoke storeSettings()
        if (this.extensionPointSettings.properties.length > 0) {
            let extensionPointSettingsMap: any = this.extensionPointSettings.getPropertiesAsMap();
            saveSettingsFnArray.push(
                this.settingsService.storeSettings(ExtensionPointID.DATASET_METADATA_EXPORTER_ID, Scope.PROJECT, extensionPointSettingsMap)
            );
        }

        for (var i = 0; i < this.settingsStructs.length; i++) {
            if (!this.isExporterSettingsConfigured(this.settingsStructs[i])) {
                return;
            }
            let exporterSettingsMap: any = this.settingsStructs[i].settings.getPropertiesAsMap();
            saveSettingsFnArray.push(
                this.settingsService.storeSettings(this.selectedExporter.id, this.settingsStructs[i].scope, exporterSettingsMap)
            );
        }

        forkJoin(saveSettingsFnArray).subscribe(
            () => {
                this.basicModals.alert({key:"STATUS.OPERATION_DONE"}, {key:"MESSAGES.SETTING_SAVED"});
            }
        );

    }

    export() {
        let saveSettingsFnArray: any[] = [];

        if (!this.isCommonSettingsConfigure()) {
            return;
        }

        for (var i = 0; i < this.settingsStructs.length; i++) {
            if (!this.isExporterSettingsConfigured(this.settingsStructs[i])) {
                return;
            }
            let exporterSettingsMap: any = this.settingsStructs[i].settings.getPropertiesAsMap();
            saveSettingsFnArray.push(
                this.settingsService.storeSettings(this.selectedExporter.id, this.settingsStructs[i].scope, exporterSettingsMap)
            );
        }

        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        forkJoin(saveSettingsFnArray).subscribe(
            () => {
                //export the metadata
                let expoterSpecification: PluginSpecification = {
                    factoryId: this.selectedExporter.id
                }
                this.metadataExporterService.export(expoterSpecification, this.selectedExportFormat).subscribe(
                    blob => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        var exportLink = window.URL.createObjectURL(blob);
                        this.basicModals.downloadLink({ key: "ACTIONS.EXPORT_METADATA" }, null, exportLink, "metadata_export." + this.selectedExportFormat.defaultFileExtension);
                    }
                );
            }
        );
    }

    private isCommonSettingsConfigure(): boolean {
        if (this.extensionPointSettings.requireConfiguration()) {
            this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.MISSING_REQUIRED_PARAM_IN_EXT_POINT", params:{extPoint: this.extensionPointSettings.shortName}},
                ModalType.warning);
            return false;
        } else {
            return true;
        }
    }

    private isExporterSettingsConfigured(settingsStruct: SettingsStruct): boolean {
        if (settingsStruct.settings.requireConfiguration()) {
            this.basicModals.alert({key:"STATUS.WARNING"}, 
                {key:"MESSAGES.MISSING_REQUIRED_PARAM_IN_EXPORTER", params:{exporter: settingsStruct.settings.shortName, scope: settingsStruct.scope}},
                ModalType.warning);
            return false;
        } else {
            return true;
        }
    }

}




class SettingsStruct {
    scope: Scope;
    settings: Settings;
}