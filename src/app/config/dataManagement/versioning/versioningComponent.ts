import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { RepositoryLocation, RepositoryStatus, VersionInfo } from '../../../models/History';
import { VersionsServices } from "../../../services/versionsServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { UIUtils } from '../../../utils/UIUtils';
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from '../../../utils/VBContext';
import { BasicModalServices } from '../../../widget/modal/basicModal/basicModalServices';
import { DumpCreationModal } from "./dumpCreationModal";

@Component({
    selector: "versioning-component",
    templateUrl: "./versioningComponent.html",
    host: { class: "pageComponent" }
})
export class VersioningComponent {

    versionList: VersionInfo[];
    selectedVersion: VersionInfo;

    isDumpAuthorized: boolean;

    constructor(private versionsService: VersionsServices, private basicModals: BasicModalServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.initVersions();
        this.isDumpAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.exportDataDump);
    }

    private initVersions() {
        this.versionsService.getVersions().subscribe(
            versions => {
                this.versionList = [{ 
                    versionId: "CURRENT", 
                    dateTimeLocal: "---", 
                    dateTime: null, 
                    repositoryId: "---", 
                    repositoryLocation: VBContext.getWorkingProject().isRepositoryRemote() ? RepositoryLocation.REMOTE : RepositoryLocation.LOCAL, 
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

    swithcToVersion() {
        //update current version
        if (this.versionList.indexOf(this.selectedVersion) == 0) { //first element of versionList is always the current version (unversioned)
            VBContext.removeContextVersion();
        } else {
            VBContext.setContextVersion(this.selectedVersion);
        }
        VBContext.setProjectChanged(true); //changing version is equivalent to changing project
    }

    delteVersion() {
        // this.selectedVersion
        alert("TODO");
    }

    dump() {
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

    dumpWithLocation() {
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
        const modalRef: NgbModalRef = this.modalService.open(DumpCreationModal, new ModalOptions());
        modalRef.componentInstance.title = "Configure version dump";
        return modalRef.result;
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

