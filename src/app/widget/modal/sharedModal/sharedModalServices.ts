import { Injectable } from '@angular/core';
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { DatasetCatalogModal, DatasetCatalogModalData } from '../../../config/dataManagement/datasetCatalog/datasetCatalogModal';
import { ImportFromDatasetCatalogModal, ImportFromDatasetCatalogModalData } from '../../../config/dataManagement/metadata/namespacesAndImports/importFromDatasetCatalogModal';
import { ImportOntologyModal, ImportOntologyModalData } from '../../../config/dataManagement/metadata/namespacesAndImports/importOntologyModal';
import { ARTResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { RDFCapabilityType } from "../../../models/Coda";
import { ImportType } from '../../../models/Metadata';
import { Settings } from "../../../models/Plugins";
import { RemoteRepositoryAccessConfig } from "../../../models/Project";
import { User } from '../../../models/User';
import { ResourceViewModal, ResourceViewModalData } from "../../../resourceView/resourceViewModal";
import { LoadConfigurationModal, LoadConfigurationModalData } from "./configurationStoreModal/loadConfigurationModal";
import { StoreConfigurationModal, StoreConfigurationModalData } from "./configurationStoreModal/storeConfigurationModal";
import { ConverterPickerModal, ConverterPickerModalData } from "./converterPickerModal/converterPickerModal";
import { LanguageSelectorModal, LanguageSelectorModalData } from "./languagesSelectorModal/languageSelectorModal";
import { PluginConfigModal, PluginConfigModalData } from "./pluginConfigModal/pluginConfigModal";
import { RemoteAccessConfigModal, RemoteAccessConfigModalData } from "./remoteAccessConfigModal/remoteAccessConfigModal";
import { RemoteRepoSelectionModal, RemoteRepoSelectionModalData } from "./remoteRepoSelectionModal/remoteRepoSelectionModal";
import { ResourcePickerModal, ResourcePickerModalData } from './resourcePickerModal/resourcePickerModal';
import { UserSelectionModal, UserSelectionModalData } from './userSelectionModal/userSelectionModal';

@Injectable()
export class SharedModalServices {

    constructor(private modal: Modal) { }

    /**
     * Opens a modal to change a plugin configuration.
     * Returns a new PluginConfiguration, the input configuration doesn't mutate.
     * @param configuration
     */
    configurePlugin(configuration: Settings) {
        var modalData = new PluginConfigModalData(configuration);
        const builder = new BSModalContextBuilder<PluginConfigModalData>(
            modalData, undefined, PluginConfigModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(PluginConfigModal, overlayConfig).result;
    }

    /**
     * Opens a modal to change a remote repository access configuration (serverURL, username and password).
     * Returns a new RemoteRepositoryAccessConfig, the input configuration doesn't mutate
     * @param configuration
     */
    configureRemoteRepositoryAccess(configuration: RemoteRepositoryAccessConfig) {
        var modalData = new RemoteAccessConfigModalData(configuration);
        const builder = new BSModalContextBuilder<RemoteAccessConfigModalData>(
            modalData, undefined, RemoteAccessConfigModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(RemoteAccessConfigModal, overlayConfig).result;
    }

    /**
     * Opens a modal to pick a remote repository. Note, this modal doesn't check if the remote repo configuration provided
     * is ok, the check of serverURL must be done previously.
     * @param title
     * @param remoteRepoConfig contains serverURL, username and password
     */
    selectRemoteRepository(title: string, remoteRepoConfig: RemoteRepositoryAccessConfig) {
        var modalData = new RemoteRepoSelectionModalData(title, remoteRepoConfig);
        const builder = new BSModalContextBuilder<RemoteRepoSelectionModalData>(
            modalData, undefined, RemoteRepoSelectionModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(RemoteRepoSelectionModal, overlayConfig).result;
    }

    /**
     * Opens a resource view in a modal
     * @param resource 
     */
    openResourceView(resource: ARTResource, readonly: boolean) {
        var modalData = new ResourceViewModalData(resource, readonly);
        const builder = new BSModalContextBuilder<ResourceViewModalData>(
            modalData, undefined, ResourceViewModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(ResourceViewModal, overlayConfig).result;
    }

    /**
     * Opens a modal to select multiple languages
     * @param title
     * @param languages languages already selected
     * @param projectAware if true, allow selection only of languages available in the current project
     */
    selectLanguages(title: string, languages: string[], projectAware?: boolean) {
        var modalData = new LanguageSelectorModalData(title, languages, projectAware);
        const builder = new BSModalContextBuilder<LanguageSelectorModalData>(
            modalData, undefined, LanguageSelectorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(LanguageSelectorModal, overlayConfig).result;
    }

    /**
     * Opens a modal that allow to select a converter
     * @param title 
     * @param message 
     */
    selectConverter(title: string, message?: string, capabilities?: RDFCapabilityType[]) {
        var modalData = new ConverterPickerModalData(title, message, capabilities);
        const builder = new BSModalContextBuilder<ConverterPickerModalData>(
            modalData, undefined, ConverterPickerModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(ConverterPickerModal, overlayConfig).result;
    }


    /**
     * Open a modal that allows to store a configuration. If the configuration is succesfully stored, returns it relativeReference.
     * @param title 
     * @param configurationComponent 
     * @param configurationObject 
     * @param relativeRef if provided suggest to override a previously saved configuration
     * @return the relativeReference of the stored configuration
     */
    storeConfiguration(title: string, configurationComponent: string, configurationObject: { [key: string]: any }, relativeRef?: string) {
        var modalData = new StoreConfigurationModalData(title, configurationComponent, configurationObject, relativeRef);
        const builder = new BSModalContextBuilder<StoreConfigurationModalData>(
            modalData, undefined, StoreConfigurationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(StoreConfigurationModal, overlayConfig).result;
    }

    /**
     * 
     * @param title 
     * @param configurationComponent
     * @param selectionMode if true, the dialog allows just to select a configuration, 
     * it doesn't load the config and doesn't allow to delete them
     * @return returns a LoadConfigurationModalReturnData object with configuration and relativeReference
     */
    loadConfiguration(title: string, configurationComponent: string, selectionMode?: boolean) {
        var modalData = new LoadConfigurationModalData(title, configurationComponent, selectionMode);
        const builder = new BSModalContextBuilder<LoadConfigurationModalData>(
            modalData, undefined, LoadConfigurationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(LoadConfigurationModal, overlayConfig).result;
    }

    /**
     * 
     * @param title 
     * @param roles 
     * @param editable 
     */
    pickResource(title: string, roles?: RDFResourceRolesEnum[], editable?: boolean) {
        var modalData = new ResourcePickerModalData(title, roles, editable);
        const builder = new BSModalContextBuilder<ResourcePickerModalData>(
            modalData, undefined, ResourcePickerModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(ResourcePickerModal, overlayConfig).result;
    }

    /**
     * 
     * @param title 
     * @param importType 
     */
    importOntology(title: string, importType: ImportType) {
        var modalData = new ImportOntologyModalData(title, importType);
        const builder = new BSModalContextBuilder<ImportOntologyModalData>(
            modalData, undefined, ImportOntologyModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(ImportOntologyModal, overlayConfig).result;
    }

    /**
     * 
     * @param title 
     */
    importFromDatasetCatalog(title: string) {
        var modalData = new ImportFromDatasetCatalogModalData(title);
        const builder = new BSModalContextBuilder<ImportFromDatasetCatalogModalData>(
            modalData, undefined, ImportFromDatasetCatalogModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(ImportFromDatasetCatalogModal, overlayConfig).result;
    }

    /**
     * Selects and returns a user
     * @param title 
     * @param projectDependent if true, the modal allows to select only users bound to the current project
     * @param unselectableUsers a (optional) list of user not selectable (disabled). This list can be useful in order to
     * disable the selection of some users when the modal is used to enrich an existing list of users
     */
    selectUser(title: string, projectDependent?: boolean, unselectableUsers?: User[]) {
        var modalData = new UserSelectionModalData(title, projectDependent, unselectableUsers);
        const builder = new BSModalContextBuilder<UserSelectionModalData>(
            modalData, undefined, UserSelectionModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(UserSelectionModal, overlayConfig).result;
    }

    /**
     * 
     */
    datasetCatalog() {
        var modalData = new DatasetCatalogModalData();
        const builder = new BSModalContextBuilder<DatasetCatalogModalData>(
            modalData, undefined, DatasetCatalogModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).dialogClass("modal-dialog modal-xl").toJSON() };
        return this.modal.open(DatasetCatalogModal, overlayConfig).result;
    }

}