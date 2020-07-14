import { Component } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { RepositoryStatus, VersionInfo, RepositoryLocation } from '../../../models/History';
import { VersionsServices } from "../../../services/versionsServices";
import { UIUtils } from '../../../utils/UIUtils';
import { VBContext } from '../../../utils/VBContext';
import { BasicModalServices } from '../../../widget/modal/basicModal/basicModalServices';
import { DumpCreationModal, DumpCreationModalData } from "./dumpCreationModal";

@Component({
    selector: "versioning-component",
    templateUrl: "./versioningComponent.html",
    host: { class: "pageComponent" }
})
export class VersioningComponent {

    private versionList: VersionInfo[];
    private selectedVersion: VersionInfo;

    constructor(private versionsService: VersionsServices, private basicModals: BasicModalServices, private modal: Modal) { }

    ngOnInit() {
        this.initVersions();
    }

    private initVersions() {
        this.versionsService.getVersions().subscribe(
            versions => {
                this.versionList = [{ 
                    versionId: "CURRENT", 
                    dateTimeLocal: "---", 
                    dateTime: null, 
                    repositoryId: "---", 
                    repositoryLocation: null, 
                    repositoryStatus: RepositoryStatus.INITIALIZED 
                }];
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
        //update current version
        if (this.versionList.indexOf(this.selectedVersion) == 0) { //first element of versionList is always the current version (unversioned)
            VBContext.removeContextVersion();
        } else {
            VBContext.setContextVersion(this.selectedVersion);
        }
        VBContext.setProjectChanged(true); //changing version is equivalent to changing project
    }

    private dump() {
        this.basicModals.prompt("Create a version dump", { value: "Version ID" }).then(
            (id: any) => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.versionsService.createVersionDump(id).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
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
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.versionsService.createVersionDump(
                    data.versionId, data.repositoryAccess, data.repositoryId, data.repoConfigurerSpecification, data.backendType).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
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
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(DumpCreationModal, overlayConfig).result;
    }

    private isActiveVersion(version: VersionInfo): boolean {
        var activeVersion: VersionInfo = VBContext.getContextVersion();
        if (activeVersion == null) {
            return this.versionList.indexOf(version) == 0;
        } else {
            return VBContext.getContextVersion().versionId == version.versionId;
        }
    }

    private closeVersion(version: VersionInfo) {
        this.versionsService.closeVersion(version.versionId).subscribe(
            stResp => {
                this.initVersions();
            }
        );
    }

}

