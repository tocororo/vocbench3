import { Component } from "@angular/core";
import { DatasetMetadataExportServices } from "../../../../services/datasetMetadataExportServices";
import { ExportServices } from "../../../../services/exportServices";
import { PluginsServices } from "../../../../services/pluginsServices";
import { Plugin, PluginConfiguration, PluginConfigParam, PluginSpecification } from "../../../../models/Plugins";
import { RDFFormat } from "../../../../models/RDFFormat";
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

    private metadataExporterExtPoint = "it.uniroma2.art.semanticturkey.plugin.extpts.DatasetMetadataExporter";

    private exporterPlugins: Plugin[];
    private selectedExporterPlugin: Plugin;
    private selectedExporterPluginConfigurations: PluginConfiguration[];
    private selectedConfiguration: PluginConfiguration;

    private selectedExporterSettings: { extensionPointSettings: PluginConfiguration, pluginSettings: PluginConfiguration };

    constructor(private metadataExporterService: DatasetMetadataExportServices, private exportService: ExportServices,
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
        this.pluginService.getAvailablePlugins(this.metadataExporterExtPoint).subscribe(
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
        this.metadataExporterService.getExporterSettings(this.selectedExporterPlugin.factoryID).subscribe(
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
        var extPointProps: any = this.collectExtPointParams();
        var pluginProps: any = this.collectPluginParams();
        this.metadataExporterService.setExporterSettings(this.selectedExporterPlugin.factoryID, extPointProps, pluginProps).subscribe(
            stResp => {
                this.basicModals.alert("Save settings", "Settings saved succesfully");
            }
        );
    }

    private export() {
        //first set the exporter settings
        var extPointProps: any = this.collectExtPointParams();
        var pluginProps: any = this.collectPluginParams();
        this.metadataExporterService.setExporterSettings(this.selectedExporterPlugin.factoryID, extPointProps, pluginProps).subscribe(
            stResp => {
                //export the metadata
                let configurationProperties: any = {}
                //the following should be useless since all the exporter have no configuration params
                for (var i = 0; i < this.selectedConfiguration.params.length; i++) {
                    configurationProperties[this.selectedConfiguration.params[i].name] = this.selectedConfiguration.params[i].value;
                }
                let expoterSpecification: PluginSpecification = {
                    factoryId: this.selectedExporterPlugin.factoryID,
                    configType: this.selectedConfiguration.type,
                    properties: configurationProperties
                }

                this.metadataExporterService.export(expoterSpecification, this.selectedExportFormat).subscribe(
                    blob => {
                        var exportLink = window.URL.createObjectURL(blob);
                        this.basicModals.downloadLink("Export Metadata", null, exportLink, "metadata_export." + this.selectedExportFormat.defaultFileExtension);
                    }
                );
            }
        );
    }

    private collectExtPointParams(): any {
        var extPointParams: PluginConfigParam[] = this.selectedExporterSettings.extensionPointSettings.params;
        var extPointProps: any = {};
        for (var i = 0; i < extPointParams.length; i++) {
            if (extPointParams[i].required && extPointParams[i].value == null) {
                this.basicModals.alert("Missing configuration", "Required parameter(s) missing in extension point configuration (" +
                    this.selectedExporterSettings.extensionPointSettings.shortName + ")", "error");
                return;
            }
            extPointProps[extPointParams[i].name] = extPointParams[i].value;
        }
        return extPointProps;
    }

    private collectPluginParams(): any {
        var pluginParams: PluginConfigParam[] = this.selectedExporterSettings.pluginSettings.params;
        var pluginProps: any = {};
        for (var i = 0; i < pluginParams.length; i++) {
            if (pluginParams[i].required && pluginParams[i].value == null) {
                this.basicModals.alert("Missing configuration", "Required parameter(s) missing in plugin configuration (" +
                    this.selectedExporterSettings.pluginSettings.shortName + ")", "error");
                return;
            }
            pluginProps[pluginParams[i].name] = pluginParams[i].value;
        }
        return pluginProps;
    }

}