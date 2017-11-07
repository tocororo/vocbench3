import { Injectable } from '@angular/core';
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { ARTResource } from "../../../models/ARTResources";
import { PluginConfiguration } from "../../../models/Plugins";
import { RemoteRepositoryAccessConfig } from "../../../models/Project";
import { PluginConfigModal, PluginConfigModalData } from "./pluginConfigModal/pluginConfigModal";
import { RemoteAccessConfigModal, RemoteAccessConfigModalData } from "./remoteAccessConfigModal/remoteAccessConfigModal";
import { RemoteRepoSelectionModal, RemoteRepoSelectionModalData } from "./remoteRepoSelectionModal/remoteRepoSelectionModal";
import { LanguageSelectorModal, LanguageSelectorModalData } from "./languagesSelectorModal/languageSelectorModal";
import { ResourceViewModal, ResourceViewModalData } from "../../../resourceView/resourceViewModal";

@Injectable()
export class SharedModalServices {

    constructor(private modal: Modal) { }

    /**
     * Opens a modal to change a plugin configuration.
     * Returns a new PluginConfiguration, the input configuration doesn't mutate.
     * @param configuration
     */
    configurePlugin(configuration: PluginConfiguration) {
        var modalData = new PluginConfigModalData(configuration);
        const builder = new BSModalContextBuilder<PluginConfigModalData>(
            modalData, undefined, PluginConfigModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
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
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
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
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).size('lg').toJSON() };
        return this.modal.open(RemoteRepoSelectionModal, overlayConfig).result;
    }

    /**
     * Opens a resource view in a modal
     * @param resource 
     */
    openResourceView(resource: ARTResource, readonly?: boolean) {
        var modalData = new ResourceViewModalData(resource, readonly);
        const builder = new BSModalContextBuilder<ResourceViewModalData>(
            modalData, undefined, ResourceViewModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).size('lg').toJSON() };
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
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(LanguageSelectorModal, overlayConfig).result;
    }

}