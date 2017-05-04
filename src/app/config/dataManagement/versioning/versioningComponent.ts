import { Component, OnInit, OnDestroy } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { DumpCreationModal, DumpCreationModalData } from "./dumpCreationModal";
import { VersionsServices } from "../../../services/versionsServices";
import { BasicModalServices } from '../../../widget/modal/basicModal/basicModalServices';
import { VBContext } from '../../../utils/VBContext';
import { VBEventHandler } from '../../../utils/VBEventHandler';
import { RepositoryAccess, RepositoryAccessType, VersionInfo } from '../../../models/Project';

@Component({
    selector: "versioning-component",
    templateUrl: "./versioningComponent.html",
    host: { class: "pageComponent" }
})
export class VersioningComponent {

    private versionList: VersionInfo[];
    private selectedVersion: VersionInfo;

    constructor(private versionsService: VersionsServices, private basicModals: BasicModalServices, 
        private eventHandler: VBEventHandler, private modal: Modal) { }

    ngOnInit() {
        this.initVersions();
    }

    private initVersions() {
        this.versionsService.getVersions().subscribe(
            versions => {
                this.versionList = [{ id: "current", date: "---", location: "---" }];
                this.versionList = this.versionList.concat(versions);
            }
        );
    }

    private selectVersion(version: VersionInfo) {
        if (this.selectedVersion == version) {
            this.selectedVersion = null;
        } else {
            this.selectedVersion = version;
        }
    }

    private swithcToVersion() {
        console.log("switching to ", this.selectedVersion);
        if (this.versionList.indexOf(this.selectedVersion) == 0) { //first element of versionList is always the current version (unversioned)
            VBContext.removeContextVersion();
        } else {
            VBContext.setContextVersion(this.selectedVersion);
        }
        this.eventHandler.refreshDataBroadcastEvent.emit();
    }

    private dump() {
        //TODO which repo access? the same of the project? In case, how can I retrieve that? or local?
        let repoAccess = new RepositoryAccess(RepositoryAccessType.CreateLocal);
        this.basicModals.prompt("Create a project dump", "Version ID").then(
            (id: any) => {
                this.versionsService.createVersionDump(id, repoAccess).subscribe(
                    stResp => {
                        this.initVersions();
                    }
                );
            },
            () => { }
        )
    }

    private dumpWithLocation() {
        var modalData = new DumpCreationModalData("Configure dump");
        const builder = new BSModalContextBuilder<DumpCreationModalData>(
            modalData, undefined, DumpCreationModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(DumpCreationModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

    private isActiveVersion(version: VersionInfo): boolean {
        var activeVersion: VersionInfo = VBContext.getContextVersion();
        if (activeVersion == null) {
            return this.versionList.indexOf(version) == 0;
        } else {
            return VBContext.getContextVersion().id == version.id;
        }
    }

}

