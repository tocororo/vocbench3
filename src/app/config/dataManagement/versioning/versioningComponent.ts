import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { PluginSpecification } from "src/app/models/Plugins";
import { BackendTypesEnum, RepositoryAccess } from "src/app/models/Project";
import { ProjectServices } from "src/app/services/projectServices";
import { ModalOptions } from 'src/app/widget/modal/Modals';
import { RepositoryLocation, RepositoryStatus, VersionInfo } from '../../../models/History';
import { VersionsServices } from "../../../services/versionsServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { UIUtils } from '../../../utils/UIUtils';
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from '../../../utils/VBContext';
import { BasicModalServices } from '../../../widget/modal/basicModal/basicModalServices';
import { DumpCreationModal, DumpCreationModalReturnData } from "./dumpCreationModal";

@Component({
    selector: "versioning-component",
    templateUrl: "./versioningComponent.html",
    host: { class: "pageComponent" }
})
export class VersioningComponent {

    versionList: VersionInfo[];
    selectedVersion: VersionInfo;

    isDumpAuthorized: boolean;
    isDeleteAuthorized: boolean;

    isAdmin: boolean; //in order to allow dump to a different location

    constructor(private versionsService: VersionsServices, private projectService: ProjectServices,
        private basicModals: BasicModalServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.isAdmin = VBContext.getLoggedUser().isAdmin();
        this.initVersions();
        this.isDumpAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.versionsCreateVersionDump);
        this.isDeleteAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.versionsDeleteVersions);
    }

    private initVersions() {
        this.selectedVersion = null;
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

                //if initVersions is invoked after the addition/removal of a version it is useful to update the versions chached in the ResView ctx
                VBContext.getWorkingProjectCtx().resViewCtx.versions = versions;
            }
        );
    }

    selectVersion(version: VersionInfo) {
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
        this.projectService.getContextRepositoryBackend().subscribe(backend => VBContext.getWorkingProjectCtx().setRepoBackend(backend));
        VBContext.setProjectChanged(true); //changing version is equivalent to changing project
    }

    dump() {
        this.basicModals.prompt({ key: "ACTIONS.CREATE_VERSION_DUMP" }, { value: "Version ID" }).then(
            (id: string) => {
                this.createDump(id);
            },
            () => { }
        );
    }

    dumpWithLocation() {
        this.configureDumpWithLocation().then(
            (data: DumpCreationModalReturnData) => {
                this.createDump(data.versionId, data.repositoryAccess, data.repositoryId, data.repoConfigurerSpecification, data.backendType);
            },
            () => { }
        );
    }

    private createDump(versionId: string, repositoryAccess?: RepositoryAccess, repositoryId?: string, repoConfigurerSpecification?: PluginSpecification, backendType?: BackendTypesEnum) {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.versionsService.createVersionDump(versionId, repositoryAccess, repositoryId, repoConfigurerSpecification, backendType).subscribe(
            () => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.initVersions();
            }
        );
    }

    private configureDumpWithLocation() {
        const modalRef: NgbModalRef = this.modalService.open(DumpCreationModal, new ModalOptions());
        modalRef.componentInstance.title = "Configure version dump";
        return modalRef.result;
    }

    isActiveVersion(version: VersionInfo): boolean {
        let activeVersion: VersionInfo = VBContext.getContextVersion();
        if (activeVersion == null) {
            return this.versionList.indexOf(version) == 0;
        } else {
            return VBContext.getContextVersion().versionId == version.versionId;
        }
    }

    closeVersion(version: VersionInfo) {
        this.versionsService.closeVersion(version.versionId).subscribe(
            () => {
                this.initVersions();
            }
        );
    }

    deleteVersion() {
        this.versionsService.deleteVersion(this.selectedVersion.versionId).subscribe(
            () => {
                this.initVersions();
            }
        );
    }

}

