import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { finalize } from 'rxjs/operators';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource, LocalResourcePosition, RemoteResourcePosition, ResourcePosition, ResourcePositionEnum } from "../../models/ARTResources";
import { DatasetMetadata } from "../../models/Metadata";
import { Project } from "../../models/Project";
import { SearchMode } from "../../models/Properties";
import { OntoLex, RDFS, SKOS, SKOSXL } from "../../models/Vocabulary";
import { AlignmentServices } from "../../services/alignmentServices";
import { MapleServices } from "../../services/mapleServices";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { HttpServiceContext } from "../../utils/HttpManager";
import { NTriplesUtil } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AssistedSearchResultModal } from "./assistedSearchResultModal";

@Component({
    selector: "assiste-search-modal",
    templateUrl: "./assistedSearchModal.html",
})
export class AssistedSearchModal {
    @Input() resource: ARTURIResource;

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;

    private sourceProject: Project;

    ResourcePositionEnum = ResourcePositionEnum;
    targetPosition: ResourcePositionEnum = ResourcePositionEnum.local;

    private projectList: Project[] = [];
    private selectedProject: Project;
    private projectMetadataAvailabilityMap: Map<Project, boolean> = new Map();

    private remoteDatasets: DatasetMetadata[] = [];
    private selectedDataset: DatasetMetadata;
    private datasetMetadataAvailabilityMap: Map<DatasetMetadata, boolean> = new Map();

    private pairedLexicalizationSets: LexicalizationSet[];

    private languagesToCheck: { lang: string, lexModel: string, checked: boolean }[] = [];

    stringMatchModes: { labelTranslationKey: string, value: SearchMode, checked: boolean }[] = [
        { labelTranslationKey: "SEARCH.SETTINGS.STARTS_WITH", value: SearchMode.startsWith, checked: false },
        { labelTranslationKey: "SEARCH.SETTINGS.CONTAINS", value: SearchMode.contains, checked: true },
        { labelTranslationKey: "SEARCH.SETTINGS.ENDS_WITH", value: SearchMode.endsWith, checked: false },
        { labelTranslationKey: "SEARCH.SETTINGS.EXACT", value: SearchMode.exact, checked: false },
        { labelTranslationKey: "SEARCH.SETTINGS.FUZZY", value: SearchMode.fuzzy, checked: false }
    ];
    private activeStringMatchMode: SearchMode;

    translationParams: { datasetUriSpace: string, projName: string };

    constructor(public activeModal: NgbActiveModal, private alignmentService: AlignmentServices,
        private metadataRegistryService: MetadataRegistryServices, private mapleService: MapleServices,
        private basicModals: BasicModalServices, private modalService: NgbModal) {
    }

    ngOnInit() {
        this.sourceProject = VBContext.getWorkingProject();
        this.initRemoteDatasets();
    }

    private initRemoteDatasets() {
        if (this.isRemoteAuthorized()) {
            this.metadataRegistryService.getCatalogRecords().subscribe(
                catalogs => {
                    this.remoteDatasets = [];
                    catalogs.forEach(c => this.remoteDatasets.push(c.abstractDataset));
                }
            );
        }
    }

    changeTargetPosition(position: ResourcePositionEnum) {
        this.targetPosition = position;
        this.pairedLexicalizationSets = null;
        this.languagesToCheck = [];
        if (this.targetPosition == ResourcePositionEnum.local && this.selectedProject != null) {
            this.selectProject(this.selectedProject);
        } else if (this.targetPosition == ResourcePositionEnum.remote && this.selectedDataset != null) {
            this.selectDataset(this.selectedDataset);
        }
    }

    refreshTargetMetadata() {
        HttpServiceContext.setContextProject(this.selectedProject);
        this.mapleService.profileProject().pipe(
            finalize(() => HttpServiceContext.removeContextProject())
        ).subscribe(
            resp => {
                HttpServiceContext.removeContextProject();
                this.profileMediation();
            }
        );
    }

    /**
     * Local Projects
     */

    private selectProject(project: Project) {
        this.selectedProject = project;
        this.updateTranslationParams();
        if (this.projectMetadataAvailabilityMap.has(this.selectedProject)) {
            //metadata availability has already been checked (the entry is in the map)
            this.profileMediationLocalProject();
        } else {
            //metadata availability has not been checked (the entry is not in the map) => check it
            HttpServiceContext.setContextProject(this.selectedProject);
            this.mapleService.checkProjectMetadataAvailability().pipe(
                finalize(() => HttpServiceContext.removeContextProject())
            ).subscribe(
                available => {
                    HttpServiceContext.removeContextProject();
                    this.projectMetadataAvailabilityMap.set(this.selectedProject, available);
                    this.profileMediationLocalProject();
                }
            );
        }
    }

    private profileMediationLocalProject() {
        if (this.isProjectMetadataAvailable()) {
            this.profileMediation();
        }
    }

    generateProjectMetadata() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        HttpServiceContext.setContextProject(this.selectedProject);
        this.mapleService.profileProject().pipe(
            finalize(() => HttpServiceContext.removeContextProject())
        ).subscribe(
            resp => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                HttpServiceContext.removeContextProject();
                this.projectMetadataAvailabilityMap.set(this.selectedProject, true);
                this.profileMediation();
            }
        );
    }

    private isProjectMetadataAvailable() {
        return this.projectMetadataAvailabilityMap.get(this.selectedProject);
    }

    /**
     * Remote datasets
     */

    private selectDataset(dataset: DatasetMetadata) {
        this.selectedDataset = dataset;
        this.updateTranslationParams();
        if (this.datasetMetadataAvailabilityMap.has(this.selectedDataset)) {
            //metadata availability has already been checked (the entry is in the map)
            this.profileMediationRemoteDataset();
        } else {
            //metadata availability has not been checked (the entry is not in the map) => check it
            this.metadataRegistryService.getEmbeddedLexicalizationSets(this.selectedDataset.identity).subscribe(
                lexSet => {
                    this.datasetMetadataAvailabilityMap.set(this.selectedDataset, lexSet.length > 0);
                    this.profileMediationRemoteDataset();
                }
            );
        }
    }

    // addRemoteDataset() {
    //     const modalRef: NgbModalRef = this.modalService.open(NewCatalogRecordModal, new ModalOptions());
    //     modalRef.componentInstance.title = "New Remote Dataset";
    //     modalRef.result.then(
    //         () => {
    //             this.initRemoteDatasets();
    //         },
    //         () => { }
    //     );
    // }

    private profileMediationRemoteDataset() {
        if (this.isDatasetMetadataAvailable()) {
            this.profileMediation();
        }
    }

    private isDatasetMetadataAvailable() {
        return this.datasetMetadataAvailabilityMap.get(this.selectedDataset);
    }

    //---------------------------

    private profileMediation() {
        this.pairedLexicalizationSets = null;

        let resourcePosition: ResourcePosition;
        if (this.targetPosition == ResourcePositionEnum.local) {
            resourcePosition = new LocalResourcePosition(this.selectedProject.getName());
        } else { //remote
            resourcePosition = new RemoteResourcePosition(this.selectedDataset.identity.getURI());
        }

        this.mapleService.profileSingleResourceMatchProblem(this.resource, resourcePosition).subscribe(
            resp => {
                this.pairedLexicalizationSets = [];
                resp.pairedLexicalizationSets.forEach((pls: any) => {
                    //second element of an element of pairedLexicalizationSets is the LexicalizationSet (for a lang) of the target
                    this.pairedLexicalizationSets.push(pls[1]);
                    //sort for lang
                    this.pairedLexicalizationSets.sort((ls1, ls2) => {
                        return ls1.languageTag.localeCompare(ls2.languageTag);
                    });
                });
                //init lang list (for checkboxes)
                this.languagesToCheck = [];
                this.pairedLexicalizationSets.forEach(ls => {
                    this.languagesToCheck.push({ lang: ls.languageTag, lexModel: ls.lexicalizationModel, checked: false });
                });
            }
        );
    }

    private getLexModelDisplayName(lexModelIri: string) {
        if (lexModelIri == "<" + RDFS.uri + ">") {
            return "RDFS";
        } else if (lexModelIri == "<" + SKOS.uri + ">") {
            return "SKOS";
        } else if (lexModelIri == "<" + SKOSXL.uri + ">") {
            return "SKOSXL";
        } else if (lexModelIri == "<" + OntoLex.uri + ">") {
            return "OntoLex";
        } else {
            return "Unknown";
        }
    }

    private getCheckedSearchMode(): SearchMode[] {
        let checkedSearchModes: SearchMode[] = [];
        this.stringMatchModes.forEach(m => {
            if (m.checked) {
                checkedSearchModes.push(m.value);
            }
        });
        return checkedSearchModes;
    }

    /**
     * Ok is clickable when there is at least a shared lexicalization checked.
     * Check also if a project is selected (in case of local project target) 
     * or a dataset is selected (in case of remote dataset target)
     */
    isOkClickable(): boolean {
        if (this.targetPosition == ResourcePositionEnum.local && this.selectedProject == null) {
            return false;
        }
        if (this.targetPosition == ResourcePositionEnum.remote && this.selectedDataset == null) {
            return false;
        }
        let ok: boolean = false;
        //true only if there is at least a shared lexicalization checked
        this.languagesToCheck.forEach(l => {
            if (l.checked) {
                ok = true;
            }
        });
        return ok;
    }

    private selectSearchResult(searchResult: ARTURIResource[]) {
        const modalRef: NgbModalRef = this.modalService.open(AssistedSearchResultModal, new ModalOptions());
        modalRef.componentInstance.title = "Select search result";
        modalRef.componentInstance.resourceList = searchResult;
        return modalRef.result;
    }

    /**
     * Remote Assisted-search requires to initialize the catalog records, so it needs that the user has the required capabilities
     */
    isRemoteAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryRead);
    }

    ok() {
        let resourcePosition: string = this.targetPosition + ":" +
            ((this.targetPosition == ResourcePositionEnum.local) ? this.selectedProject.getName() : this.selectedDataset.identity.getURI());

        let langsToLexModel: Map<string, ARTURIResource> = new Map();
        this.languagesToCheck.forEach(l => {
            if (l.checked) {
                langsToLexModel.set(l.lang, NTriplesUtil.parseURI(l.lexModel));
            }
        });

        let searchModePar: SearchMode[] = this.getCheckedSearchMode();

        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.alignmentService.searchResources(this.resource, resourcePosition, [this.resource.getRole()], langsToLexModel, searchModePar).subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                if (searchResult.length == 0) {
                    this.basicModals.alert({ key: "SEARCH.SEARCH" }, { key: "MESSAGES.NO_RESULTS_FOUND" }, ModalType.warning);
                } else {
                    this.selectSearchResult(searchResult).then(
                        (selectedResource: ARTURIResource) => {
                            this.activeModal.close(selectedResource);
                        }
                    );
                }
            },
            () => { }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

    private updateTranslationParams() {
        this.translationParams = {
            datasetUriSpace: this.selectedDataset != null ? this.selectedDataset.uriSpace : null,
            projName: this.selectedProject != null ? this.selectedProject.getName() : null
        };
    }

}

class LexicalizationSet {
    avgNumOfLexicalizations: number;
    languageLOC: string;
    languageLexvo: string;
    languageTag: string;
    lexicalEntries: number;
    lexicalizationModel: string;
    lexicalizations: number;
    lexiconDataset: string;
    percentage: number;
    referenceDataset: string;
    references: number;
}