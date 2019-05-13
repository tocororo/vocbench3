import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ExtensionFactory, ExtensionPointID, Scope, Settings } from "../../models/Plugins";
import { CollaborationServices } from "../../services/collaborationServices";
import { ExtensionsServices } from "../../services/extensionsServices";
import { SettingsServices } from "../../services/settingsServices";
import { UIUtils } from "../../utils/UIUtils";
import { VBCollaboration } from "../../utils/VBCollaboration";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "collaboration-proj-settings-modal",
    templateUrl: "./collaborationProjSettingsModal.html",
})
export class CollaborationProjSettingsModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private extensions: ExtensionFactory[];
    private selectedExtension: ExtensionFactory;

    private projSettings: Settings;

    private resettable: boolean = false; //true if a collaboration system was already configured => shows a reset button

    constructor(public dialog: DialogRef<BSModalContext>, private extensionService: ExtensionsServices, private settingsService: SettingsServices,
        private collaborationService: CollaborationServices, private vbColl: VBCollaboration, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.init();
    }

    private init() {
        this.extensions = null;
        this.selectedExtension = null;
        this.projSettings = null;
        this.extensionService.getExtensions(ExtensionPointID.COLLABORATION_BACKEND_ID).subscribe(
            extensions => {
                this.extensions = extensions;
                let backendId = this.vbColl.getBackendId();
                if (backendId != null) {
                    this.resettable = true;
                    for (var i = 0; i < this.extensions.length; i++) {
                        if (this.extensions[i].id == backendId) {
                            this.selectedExtension = this.extensions[i];
                            break;
                        }
                    }
                    this.initSettings();
                }
            }
        );
    }

    private initSettings() {
        this.settingsService.getSettings(this.selectedExtension.id, Scope.PROJECT).subscribe(
            settings => {
                this.projSettings = settings;
            }
        );
    }

    private reset() {
        this.basicModals.confirm("Reset Collaboration System", "You are going to disable the Collaboration System on the current project. Are you sure?", "warning").then(
            () => {
                this.collaborationService.resetCollaborationOnProject().subscribe(
                    () => {
                        this.vbColl.initCollaborationSystem().subscribe(
                            () => this.dialog.close()
                        );
                    }
                )
            }, 
            () => {}
        )
        
    }

    private onExtensionChange() {
        this.initSettings();
    }

    private isOkClickable(): boolean {
        if (this.projSettings == null) {
            return false;
        }
        if (this.projSettings.requireConfiguration()) {
            return false;
        }
        return true;
    }

    ok(event: Event) {
        let settingsParam = this.projSettings.getPropertiesAsMap();
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.settingsService.storeSettings(this.selectedExtension.id, Scope.PROJECT, settingsParam).subscribe(
            resp => {
                this.collaborationService.activateCollaboratioOnProject(this.selectedExtension.id).subscribe(
                    resp => {
                        UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                        this.vbColl.initCollaborationSystem();
                        event.stopPropagation();
                        event.preventDefault();
                        this.dialog.close();
                    }
                )
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}