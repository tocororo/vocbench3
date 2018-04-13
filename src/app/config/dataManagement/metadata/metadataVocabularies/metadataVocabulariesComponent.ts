import { Component } from "@angular/core";
import { Observable } from 'rxjs/Observable';
import { ExtensionPointID, NonConfigurableExtensionFactory, PluginSpecification, Scope, Settings } from "../../../../models/Plugins";
import { RDFFormat } from "../../../../models/RDFFormat";
import { DatasetMetadataServices } from "../../../../services/datasetMetadataServices";
import { ExportServices } from "../../../../services/exportServices";
import { ExtensionsServices } from "../../../../services/extensionsServices";
import { PluginsServices } from "../../../../services/pluginsServices";
import { SettingsServices } from "../../../../services/settingsServices";
import { UIUtils } from "../../../../utils/UIUtils";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";


@Component({
    selector: "metadata-vocabularies-component",
    templateUrl: "./metadataVocabulariesComponent.html",
    host: { class: "pageComponent" }
})
export class MetadataVocabulariesComponent {

    //export format selection
    private exportFormats: RDFFormat[];
    private selectedExportFormat: RDFFormat;

    private exporters: NonConfigurableExtensionFactory[];
    private selectedExporter: NonConfigurableExtensionFactory;

    private selectedExporterSettings: Settings;
    private extensionPointSettings: Settings;

    constructor(private metadataExporterService: DatasetMetadataServices, private exportService: ExportServices,
        private extensionService: ExtensionsServices, private settingsService: SettingsServices,
        private pluginService: PluginsServices, private basicModals: BasicModalServices) { }

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

    private onExtensionChange() {
        if (this.selectedExporter == null) return;
        this.settingsService.getSettings(this.selectedExporter.id, this.selectedExporter.settingsScopes[0]).subscribe(
            settings => {
                this.selectedExporterSettings = settings;
            }
        );
        this.settingsService.getSettings(ExtensionPointID.DATASET_METADATA_EXPORTER_ID, Scope.PROJECT).subscribe(
            settings => {
                this.extensionPointSettings = settings;
            }
        )
    }

    private saveSettings() {
        //common settings
        if (this.extensionPointSettings.requireConfiguration()) {
            this.basicModals.alert("Missing configuration", "Required parameter(s) missing in extension point configuration (" +
                this.extensionPointSettings.shortName + ")", "warning");
            return;
        }
        var extensionPointSettingsMap: any = this.extensionPointSettings.getPropertiesAsMap();

        //selected exporter settings
        if (this.selectedExporterSettings.requireConfiguration()) {
            this.basicModals.alert("Missing configuration", "Required parameter(s) missing in exporter configuration (" +
                this.selectedExporterSettings.shortName + ")", "warning");
            return;
        }
        var selectedExporterSettingsMap: any = this.selectedExporterSettings.getPropertiesAsMap();

        let saveSettingsFnArray: any[] = [];

        //extension point settings may be without properties, so check if is necessary to invoke storeSettings()
        if (this.extensionPointSettings.properties.length > 0) {
            saveSettingsFnArray.push(
                this.settingsService.storeSettings(ExtensionPointID.DATASET_METADATA_EXPORTER_ID, Scope.PROJECT, extensionPointSettingsMap)
            );
        }

        saveSettingsFnArray.push(
            this.settingsService.storeSettings(this.selectedExporter.id, this.selectedExporter.settingsScopes[0], selectedExporterSettingsMap)
        );

        Observable.forkJoin(saveSettingsFnArray).subscribe(
            stResp => {
                this.basicModals.alert("Save settings", "Settings saved succesfully");
            }
        );

    }

    private export() {
        if (this.extensionPointSettings.requireConfiguration()) {
            this.basicModals.alert("Missing configuration", "Required parameter(s) missing in extension point configuration (" +
                this.extensionPointSettings.shortName + ")", "warning");
            return;
        }
        var extensionPointSettingsMap: any = this.extensionPointSettings.getPropertiesAsMap();

        if (this.selectedExporterSettings.requireConfiguration()) {
            this.basicModals.alert("Missing configuration", "Required parameter(s) missing in plugin configuration (" +
                this.selectedExporterSettings.shortName + ")", "warning");
            return;
        }
        var selectedExporterSettingsMap: any = this.selectedExporterSettings.getPropertiesAsMap();


        //first set the exporter settings
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.settingsService.storeSettings(this.selectedExporter.id, this.selectedExporter.settingsScopes[0], selectedExporterSettingsMap).subscribe(
            stResp => {
                //export the metadata
                let expoterSpecification: PluginSpecification = {
                    factoryId: this.selectedExporter.id
                }
                this.metadataExporterService.export(expoterSpecification, this.selectedExportFormat).subscribe(
                    blob => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        var exportLink = window.URL.createObjectURL(blob);
                        this.basicModals.downloadLink("Export Metadata", null, exportLink, "metadata_export." + this.selectedExportFormat.defaultFileExtension);
                    }
                );
            }
        );
    }

}