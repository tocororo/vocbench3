import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { ExtensionPointID, NonConfigurableExtensionFactory, PluginSpecification, Scope, Settings } from "../../models/Plugins";
import { RDFFormat } from "../../models/RDFFormat";
import { DatasetMetadataServices } from "../../services/datasetMetadataServices";
import { ExportServices } from "../../services/exportServices";
import { ExtensionsServices } from "../../services/extensionsServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { ConflictResolverModal, ImportedMetadataConflict } from './conflictResolverModal';

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

    constructor(private datasetMetadataService: DatasetMetadataServices, private exportService: ExportServices,
        private extensionService: ExtensionsServices, private basicModals: BasicModalServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.exportService.getOutputFormats().subscribe(
            formats => {
                this.exportFormats = formats;
                //select Turtle as default
                for (let i = 0; i < this.exportFormats.length; i++) {
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
        );
    }

    onExtensionChange() {
        if (this.selectedExporter == null) return;

        this.settingsStructs = [];
        //for each scope retrieve the settings
        this.selectedExporter.settingsScopes.forEach(
            (scope: Scope) => {
                this.datasetMetadataService.getMetadataVocabularySettings(this.selectedExporter.id, scope).subscribe(
                    settings => {
                        this.settingsStructs.push({ settings: settings, scope: scope });
                    }
                );
            }
        );

        this.datasetMetadataService.getMetadataVocabularySettings(ExtensionPointID.DATASET_METADATA_EXPORTER_ID, Scope.PROJECT).subscribe(
            settings => {
                this.extensionPointSettings = settings;
            }
        );
    }

    importSettingsFromMDR(settingsStruct: SettingsStruct) {
        let pluginSpec: PluginSpecification = { factoryId: this.selectedExporter.id };
        this.datasetMetadataService.importMetadataVocabulariesFromMetadataRegistry(pluginSpec, settingsStruct.scope).subscribe(
            importedSettings => {
                let empty = !importedSettings.properties.some(p => p.value != null);
                if (empty) {
                    this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "METADATA.METADATA_VOCABULARIES.MESSAGES.IMPORT_EMPTY_RESULT" }, ModalType.warning);
                    return;
                }

                //compare pre-existing with imported data in order to detect conflicts
                let conflicts: ImportedMetadataConflict[] = [];
                let settingsMap = settingsStruct.settings.getPropertiesAsMap();
                let importedSettingsMap = importedSettings.getPropertiesAsMap();
                for (let propName in settingsMap) {
                    let oldStProp = settingsStruct.settings.getProperty(propName);
                    let newStProp = importedSettings.getProperty(propName);
                    let oldValue = settingsMap[propName];
                    let newValue = importedSettingsMap[propName];
                    if (oldValue != null && newValue != null && oldValue != newValue) { //conflict
                        conflicts.push({ old: oldStProp, new: newStProp });
                    }
                }
                if (conflicts.length > 0) {
                    const modalRef: NgbModalRef = this.modalService.open(ConflictResolverModal, new ModalOptions('lg'));
                    modalRef.componentInstance.conflicts = conflicts;
                    modalRef.result.then(
                        () => {
                            //for each conflict, if user choosed to override, replace the value with the new one
                            conflicts.forEach(c => {
                                if (c.choice == 'override') {
                                    settingsStruct.settings.getProperty(c.old.name).value = c.new.value;
                                }
                                //if keep, do nothing
                            });
                            //set all the rest settings not in conflict
                            importedSettings.properties.forEach(p => {
                                //set the value only if new value is not null and if it was not already among the conflicts (in such case it would have already been handled by resolver)
                                if (p.value != null && !conflicts.some(c => c.old.name == p.name)) {
                                    settingsStruct.settings.getProperty(p.name).value = p.value;
                                }
                            });
                        },
                        () => {}
                    );
                } else { //no conflicts => simply set new (non-null) values
                    importedSettings.properties.forEach(p => {
                        if (p.value != null) {
                            settingsStruct.settings.getProperty(p.name).value = p.value;
                        }
                    });
                }
            }
        );
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
                this.datasetMetadataService.storeMetadataVocabularySettings(ExtensionPointID.DATASET_METADATA_EXPORTER_ID, Scope.PROJECT, extensionPointSettingsMap)
            );
        }

        for (let i = 0; i < this.settingsStructs.length; i++) {
            if (!this.isExporterSettingsConfigured(this.settingsStructs[i])) {
                return;
            }
            let exporterSettingsMap: any = this.settingsStructs[i].settings.getPropertiesAsMap();
            saveSettingsFnArray.push(
                this.datasetMetadataService.storeMetadataVocabularySettings(this.selectedExporter.id, this.settingsStructs[i].scope, exporterSettingsMap)
            );
        }

        forkJoin(saveSettingsFnArray).subscribe(
            () => {
                this.basicModals.alert({ key: "STATUS.OPERATION_DONE" }, { key: "MESSAGES.SETTING_SAVED" });
            }
        );

    }

    export() {
        let saveSettingsFnArray: any[] = [];

        if (!this.isCommonSettingsConfigure()) {
            return;
        }

        for (let i = 0; i < this.settingsStructs.length; i++) {
            if (!this.isExporterSettingsConfigured(this.settingsStructs[i])) {
                return;
            }
            let exporterSettingsMap: any = this.settingsStructs[i].settings.getPropertiesAsMap();
            saveSettingsFnArray.push(
                this.datasetMetadataService.storeMetadataVocabularySettings(this.selectedExporter.id, this.settingsStructs[i].scope, exporterSettingsMap)
            );
        }

        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        forkJoin(saveSettingsFnArray).subscribe(
            () => {
                //export the metadata
                let expoterSpecification: PluginSpecification = {
                    factoryId: this.selectedExporter.id
                };
                this.datasetMetadataService.export(expoterSpecification, this.selectedExportFormat).subscribe(
                    blob => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        let exportLink = window.URL.createObjectURL(blob);
                        this.basicModals.downloadLink({ key: "ACTIONS.EXPORT_METADATA" }, null, exportLink, "metadata_export." + this.selectedExportFormat.defaultFileExtension);
                    }
                );
            }
        );
    }

    private isCommonSettingsConfigure(): boolean {
        if (this.extensionPointSettings.requireConfiguration()) {
            this.basicModals.alert({ key: "STATUS.WARNING" }, { key: "MESSAGES.MISSING_REQUIRED_PARAM_IN_EXT_POINT", params: { extPoint: this.extensionPointSettings.shortName } },
                ModalType.warning);
            return false;
        } else {
            return true;
        }
    }

    private isExporterSettingsConfigured(settingsStruct: SettingsStruct): boolean {
        if (settingsStruct.settings.requireConfiguration()) {
            this.basicModals.alert({ key: "STATUS.WARNING" },
                { key: "MESSAGES.MISSING_REQUIRED_PARAM_IN_EXPORTER", params: { exporter: settingsStruct.settings.shortName, scope: settingsStruct.scope } },
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