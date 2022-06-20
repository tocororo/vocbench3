import { Component, ElementRef, ViewChild } from "@angular/core";
import { finalize } from 'rxjs/operators';
import { Project } from 'src/app/models/Project';
import { MapleServices } from 'src/app/services/mapleServices';
import { HttpServiceContext } from 'src/app/utils/HttpManager';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';
import { CatalogRecord2 } from "../../models/Metadata";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "metadata-registry-component",
    templateUrl: "./metadataRegistryComponent.html",
    host: { class: "pageComponent" },
})
export class MetadataRegistryComponent {

    @ViewChild('blockDiv', { static: false }) blockingDivElement: ElementRef;

    selectedCatalogRecord2: CatalogRecord2;

    activeTab: AddendaTabsEnum = "lexicalizationSets";

    constructor(private mapleService: MapleServices, private basicModals: BasicModalServices) { }

    /**
     * Catalog records
     */

    onCatalogSelected(catalogRecord: CatalogRecord2) {
        this.selectedCatalogRecord2 = catalogRecord;
    }

    // onDatasetUpdate() {
    //     this.mdrTreePanel.refresh();
    // }

    profileProject() {
        let project: Project = new Project(this.selectedCatalogRecord2.dataset.projectName);
        HttpServiceContext.setContextProject(project);
        this.mapleService.checkProjectMetadataAvailability().pipe(
            finalize(() => HttpServiceContext.removeContextProject())
        ).subscribe(
            available => {
                if (available) {
                    this.basicModals.confirm({ key: "ACTIONS.PROFILE_PROJECT" }, { key: "MESSAGES.PROFILE_PROJECT_REFRESH_CONFIRM", params: { project: project.getName() } }, ModalType.warning).then(
                        () => {
                            this.profileProjectImpl(project);
                        },
                        () => { }
                    );
                } else {
                    this.profileProjectImpl(project);
                }
            }
        );
    }
    
    private profileProjectImpl(project: Project) {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        HttpServiceContext.setContextProject(project);
        this.mapleService.profileProject().pipe(
            finalize(() => HttpServiceContext.removeContextProject())
        ).subscribe(
            () => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
            }
        );
    }


}

type AddendaTabsEnum = "linksets" | "lexicalizationSets";