import { Component } from "@angular/core";
import { DialogRef, Modal, ModalComponent, OverlayConfig } from "ngx-modialog";
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { RemoteAlignmentServiceConfiguration, RemoteAlignmentServiceConfigurationDef } from "../../../models/Alignment";
import { RemoteAlignmentServices } from "../../../services/remoteAlignmentServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { RemoteSystemConfigurationsAdministration } from "./remoteSystemConfigurationsAdministration";

@Component({
    selector: "remote-system-settings-modal",
    templateUrl: "./remoteSystemSettingsModal.html",
})
export class RemoteSystemSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private isAdmin: boolean;
    private isSetServiceAuthorized: boolean;
    private isRemoveServiceAuthorized: boolean;

    private savedConfigs: RemoteAlignmentServiceConfigurationDef[];
    private activeConfig: RemoteAlignmentServiceConfigurationDef;

    constructor(public dialog: DialogRef<BSModalContext>, private remoteAlignmentService: RemoteAlignmentServices, 
        private basicModals: BasicModalServices, private modal: Modal) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.isAdmin = VBContext.getLoggedUser().isAdmin();
        this.isSetServiceAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.remoteAlignmentServiceSet);
        this.isRemoveServiceAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.remoteAlignmentServiceRemove);

        this.initConfigs();
    }

    initConfigs() {
        //initialize the available configurations
        this.remoteAlignmentService.getRemoteAlignmentServices().subscribe(
            services => {
                this.savedConfigs = [];
                for (let id in services) {
                    let servConf: RemoteAlignmentServiceConfiguration = services[id];
                    let servConfDef: RemoteAlignmentServiceConfigurationDef = {
                        id: id,
                        serverURL: servConf.getPropertyValue("serverURL"),
                        username: servConf.getPropertyValue("username"),
                        password: servConf.getPropertyValue("password")
                    }
                    this.savedConfigs.push(servConfDef);
                }
                this.savedConfigs.sort((c1, c2) => c1.id.localeCompare(c2.id));
                //initialize the active configuration
                this.remoteAlignmentService.getAlignmentServiceForProject().subscribe(
                    pair => {
                        this.activeConfig = null;
                        if (pair != null) {
                            let confId: string = pair[0];
                            let explicit: boolean = pair[1];
                            this.activeConfig = this.savedConfigs.find(c => c.id == confId);
                            if (this.activeConfig == null) {
                                //the stored alignment service for the current project has been probably deleted => remove it
                                this.remoteAlignmentService.removeAlignmentServiceForProject().subscribe();
                            }
                        }
                    }
                );
            }
        );
    }

    activateConfig(config: RemoteAlignmentServiceConfigurationDef) {
        this.activeConfig = config;
        this.remoteAlignmentService.setAlignmentServiceForProject(this.activeConfig.id).subscribe();
    }

    // toggleConfig(config: RemoteAlignmentServiceConfigurationDef) {
    //     if (this.activeConfig == config) {
    //         this.activeConfig = null;
    //         this.remoteAlignmentService.removeAlignmentServiceForProject().subscribe();
    //     } else {
    //         this.activeConfig = config;
    //         this.remoteAlignmentService.setAlignmentServiceForProject(this.activeConfig.id).subscribe();
    //     }
    // }

    administration() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).size('lg').toJSON() };
        this.modal.open(RemoteSystemConfigurationsAdministration, overlayConfig).result.then(
            () => {
                this.initConfigs();
            }
        )
    }


    ok() {
        this.dialog.close();
    }

}