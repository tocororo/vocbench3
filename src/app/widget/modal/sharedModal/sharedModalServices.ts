import { Injectable } from '@angular/core';
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { PluginConfiguration } from "../../../models/Plugins";
import { RemoteRepositoryAccessConfig } from "../../../models/Project";
import { PluginConfigModal, PluginConfigModalData } from "./pluginConfigModal/pluginConfigModal";
import { RemoteAccessConfigModal, RemoteAccessConfigModalData } from "./remoteAccessConfigModal/remoteAccessConfigModal";

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
        return this.modal.open(PluginConfigModal, overlayConfig).then(
            dialog => dialog.result
        );
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
        return this.modal.open(RemoteAccessConfigModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

}