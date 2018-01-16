import { Component } from "@angular/core";
import { DatasetMetadataServices } from "../../../../services/datasetMetadataServices";
import { ExportServices } from "../../../../services/exportServices";
import { PluginsServices } from "../../../../services/pluginsServices";
import { Plugin, PluginConfiguration, PluginConfigProp, PluginSpecification, ExtensionPoint } from "../../../../models/Plugins";
import { RDFFormat } from "../../../../models/RDFFormat";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { UIUtils } from "../../../../utils/UIUtils";

@Component({
    selector: "metadata-vocabularies-component",
    templateUrl: "./metadataVocabulariesComponent.html",
    host: { class: "pageComponent" }
})
export class MetadataVocabulariesComponent {

    //export format selection
    private exportFormats: RDFFormat[];
    private selectedExportFormat: RDFFormat;

    private exporterPlugins: Plugin[];
    private selectedExporterPlugin: Plugin;
    private selectedExporterPluginConfigurations: PluginConfiguration[];
    private selectedConfiguration: PluginConfiguration;

    private selectedExporterSettings: { extensionPointSettings: PluginConfiguration, pluginSettings: PluginConfiguration };

    constructor(private metadataExporterService: DatasetMetadataServices, private exportService: ExportServices,
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
        this.pluginService.getAvailablePlugins(ExtensionPoint.DATASET_METADATA_EXPORTER_ID).subscribe(
            plugins => {
                this.exporterPlugins = plugins;
            }
        )
    }

    private onPluginChange() {
        if (this.selectedExporterPlugin == null) return;
        this.pluginService.getPluginConfigurations(this.selectedExporterPlugin.factoryID).subscribe(
            config => {
                this.selectedExporterPluginConfigurations = config.configurations;
                this.selectedConfiguration = this.selectedExporterPluginConfigurations[0];
            }
        )
        this.metadataExporterService.getDatasetMetadata(this.selectedExporterPlugin.factoryID).subscribe(
            config => {
                this.selectedExporterSettings = config;
            }
        );
    }

    private configurePlugin() {
        //at the moment there is no plugin configuration with parameters, so this method doesn't do anything
        console.log("configure " + this.selectedConfiguration);
    }

    private saveSettings() {
        if (this.selectedExporterSettings.extensionPointSettings.requireConfiguration()) {
            this.basicModals.alert("Missing configuration", "Required parameter(s) missing in extension point configuration (" +
                this.selectedExporterSettings.extensionPointSettings.shortName + ")", "warning");
            return;
        }
        var extPointProps: any = this.selectedExporterSettings.extensionPointSettings.getPropertiesAsMap();

        if (this.selectedExporterSettings.pluginSettings.requireConfiguration()) {
            this.basicModals.alert("Missing configuration", "Required parameter(s) missing in plugin configuration (" +
                this.selectedExporterSettings.pluginSettings.shortName + ")", "warning");
            return;
        }
        var pluginProps: any = this.selectedExporterSettings.pluginSettings.getPropertiesAsMap();

        this.metadataExporterService.setDatasetMetadata(this.selectedExporterPlugin.factoryID, extPointProps, pluginProps).subscribe(
            stResp => {
                this.basicModals.alert("Save settings", "Settings saved succesfully");
            }
        );
    }

    private export() {
        if (this.selectedExporterSettings.extensionPointSettings.requireConfiguration()) {
            this.basicModals.alert("Missing configuration", "Required parameter(s) missing in extension point configuration (" +
                this.selectedExporterSettings.extensionPointSettings.shortName + ")", "warning");
            return;
        }
        var extPointProps: any = this.selectedExporterSettings.extensionPointSettings.getPropertiesAsMap();

        if (this.selectedExporterSettings.pluginSettings.requireConfiguration()) {
            this.basicModals.alert("Missing configuration", "Required parameter(s) missing in plugin configuration (" +
                this.selectedExporterSettings.pluginSettings.shortName + ")", "warning");
            return;
        }
        var pluginProps: any = this.selectedExporterSettings.pluginSettings.getPropertiesAsMap();


        //first set the exporter settings
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.metadataExporterService.setDatasetMetadata(this.selectedExporterPlugin.factoryID, extPointProps, pluginProps).subscribe(
            stResp => {
                //export the metadata
                let expoterSpecification: PluginSpecification = {
                    factoryId: this.selectedExporterPlugin.factoryID,
                    configType: this.selectedConfiguration.type,
                    properties: this.selectedConfiguration.getPropertiesAsMap()
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