import { Component, OnInit, OnDestroy } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';
import { DumpCreationModal, DumpCreationModalData } from "./dumpCreationModal";
import { VersionsServices } from "../../../services/versionsServices";
import { BasicModalServices } from '../../../widget/modal/basicModal/basicModalServices';
import { VBContext } from '../../../utils/VBContext';
import { VBEventHandler } from '../../../utils/VBEventHandler';
import { UIUtils } from '../../../utils/UIUtils';
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
                this.versionList = [{ versionId: "current", repositoryId: "---", dateTime: "---" }];
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
        if (this.versionList.indexOf(this.selectedVersion) == 0) { //first element of versionList is always the current version (unversioned)
            VBContext.removeContextVersion();
        } else {
            VBContext.setContextVersion(this.selectedVersion);
        }
        this.eventHandler.refreshDataBroadcastEvent.emit();
    }

    private dump() {
        this.basicModals.prompt("Create a version dump", "Version ID").then(
            (id: any) => {
                UIUtils.startLoadingDiv(document.getElementById("blockDivFullScreen"));
                //TODO when service updates, remove repoAccess from parameter
                let repoAccess = new RepositoryAccess(RepositoryAccessType.CreateLocal);
                this.versionsService.createVersionDump(id, repoAccess).subscribe(
                // this.versionsService.createVersionDump(id).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen"));
                        this.initVersions();
                    }
                );
            },
            () => { }
        )
    }

    private dumpWithLocation() {
        this.configureDumpWithLocation().then(
            (data: any) => {
                UIUtils.startLoadingDiv(document.getElementById("blockDivFullScreen"));
                this.versionsService.createVersionDump(
                    data.versionId, data.repositoryAccess, data.repositoryId, data.repoConfigurerSpecification).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(document.getElementById("blockDivFullScreen"));
                        this.initVersions();
                    }
                );
            },
            () => {}
        )
    }

    private configureDumpWithLocation() {
        var modalData = new DumpCreationModalData("Configure version dump");
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
            return VBContext.getContextVersion().versionId == version.versionId;
        }
    }

}

