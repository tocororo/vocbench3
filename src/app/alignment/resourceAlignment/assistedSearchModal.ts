import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, Modal, ModalComponent, OverlayConfig } from 'ngx-modialog';
import { BSModalContext, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { NewCatalogRecordModal, NewCatalogRecordModalData } from "../../metadata/metadataRegistry/newCatalogRecordModal";
import { ARTURIResource, LocalResourcePosition, RemoteResourcePosition, ResourcePosition, ResourcePositionEnum } from "../../models/ARTResources";
import { DatasetMetadata } from "../../models/Metadata";
import { Project } from "../../models/Project";
import { SearchMode } from "../../models/Properties";
import { OntoLex, RDFS, SKOS, SKOSXL } from "../../models/Vocabulary";
import { AlignmentServices } from "../../services/alignmentServices";
import { MapleServices } from "../../services/mapleServices";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { ProjectServices } from "../../services/projectServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { HttpServiceContext } from "../../utils/HttpManager";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { AssistedSearchResultModal, AssistedSearchResultModalData } from "./assistedSearchResultModal";

export class AssistedSearchModalData extends BSModalContext {
    constructor(public resource: ARTURIResource) {
        super();
    }
}

@Component({
    selector: "assiste-search-modal",
    templateUrl: "./assistedSearchModal.html",
})
export class AssistedSearchModal implements ModalComponent<AssistedSearchModalData> {
    context: AssistedSearchModalData;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private sourceProject: Project;

    private targetPosition: ResourcePositionEnum = ResourcePositionEnum.local;

    private projectList: Project[] = [];
    private selectedProject: Project;
    private projectMetadataAvailabilityMap: Map<Project, boolean> = new Map();

    private remoteDatasets: DatasetMetadata[] = [];
    private selectedDataset: DatasetMetadata;
    private datasetMetadataAvailabilityMap: Map<DatasetMetadata, boolean> = new Map();

    private pairedLexicalizationSets: LexicalizationSet[];

    private languagesToCheck: { lang: string, lexModel: string, checked: boolean }[] = [];

    private searchModes: { mode: SearchMode, show: string, checked: boolean }[] = [
        { mode: SearchMode.startsWith, show: "Starts with", checked: false },
        { mode: SearchMode.contains, show: "Contains", checked: true },
        { mode: SearchMode.endsWith, show: "Ends with", checked: false },
        { mode: SearchMode.exact, show: "Exact", checked: false },
        { mode: SearchMode.fuzzy, show: "Fuzzy", checked: false }
    ]
    
    constructor(public dialog: DialogRef<AssistedSearchModalData>, private projectService: ProjectServices, private alignmentService: AlignmentServices,
        private metadataRegistryService: MetadataRegistryServices, private mapleService: MapleServices,
        private basicModals: BasicModalServices, private modal: Modal) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.sourceProject = VBContext.getWorkingProject();
        this.projectService.listProjects(this.sourceProject, false, true).subscribe(
            projects => {
                //keep only the projects different from the current
                for (var i = 0; i < projects.length; i++) {
                    if (projects[i].getName() != this.sourceProject.getName()) {
                        this.projectList.push(projects[i])
                    }
                }
            }
        );

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

    private changeTargetPosition(position: ResourcePositionEnum) {
        this.targetPosition = position;
        this.pairedLexicalizationSets = null;
        this.languagesToCheck = [];
        if (this.targetPosition == ResourcePositionEnum.local && this.selectedProject != null) {
            this.selectProject(this.selectedProject);
        } else if (this.targetPosition == ResourcePositionEnum.remote && this.selectedDataset != null) {
            this.selectDataset(this.selectedDataset);
        }
    }

    private refreshTargetMetadata() {
        HttpServiceContext.setContextProject(this.selectedProject);
        this.mapleService.profileProject().finally(
            () => HttpServiceContext.removeContextProject()
        ).subscribe(
            resp => {
                HttpServiceContext.removeContextProject()
                this.profileMediation();
            }
        );
    }

    /**
     * Local Projects
     */

    private selectProject(project: Project) {
        this.selectedProject = project;
        if (this.projectMetadataAvailabilityMap.has(this.selectedProject)) {
            //metadata availability has already been checked (the entry is in the map)
            this.profileMediationLocalProject();
        } else {
            //metadata availability has not been checked (the entry is not in the map) => check it
            HttpServiceContext.setContextProject(this.selectedProject);
            this.mapleService.checkProjectMetadataAvailability().finally(
                () => HttpServiceContext.removeContextProject()
            ).subscribe(
                available => {
                    HttpServiceContext.removeContextProject()
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

    private generateProjectMetadata() {
        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        HttpServiceContext.setContextProject(this.selectedProject);
        this.mapleService.profileProject().finally(
            () => HttpServiceContext.removeContextProject()
        ).subscribe(
            resp => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                HttpServiceContext.removeContextProject()
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
        if (this.datasetMetadataAvailabilityMap.has(this.selectedDataset)) {
            //metadata availability has already been checked (the entry is in the map)
            this.profileMediationRemoteDataset();
        } else {
            //metadata availability has not been checked (the entry is not in the map) => check it
            this.metadataRegistryService.getEmbeddedLexicalizationSets(new ARTURIResource(this.selectedDataset.identity)).subscribe(
                lexSet => {
                    this.datasetMetadataAvailabilityMap.set(this.selectedDataset, lexSet.length > 0);
                    this.profileMediationRemoteDataset();
                }
            )
        }
    }

    private addRemoteDataset() {
        var modalData = new NewCatalogRecordModalData("New Remote Dataset");
        const builder = new BSModalContextBuilder<NewCatalogRecordModalData>(
            modalData, undefined, NewCatalogRecordModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        this.modal.open(NewCatalogRecordModal, overlayConfig).result.then(
            ok => {
                this.initRemoteDatasets();
            },
            () => {}
        );
    }

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
            resourcePosition = new RemoteResourcePosition(this.selectedDataset.identity);
        }

        this.mapleService.profileSingleResourceMatchProblem(this.context.resource, resourcePosition).subscribe(
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
        this.searchModes.forEach(m => {
            if (m.checked) {
                checkedSearchModes.push(m.mode);
            }
        });
        return checkedSearchModes;
    }
    
    /**
     * Ok is clickable when there is at least a shared lexicalization checked.
     * Check also if a project is selected (in case of local project target) 
     * or a dataset is selected (in case of remote dataset target)
     */
    private isOkClickable(): boolean {
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
        })
        return ok;
    }

    private selectSearchResult(searchResult: ARTURIResource[]) {
        var modalData = new AssistedSearchResultModalData("Select search result", searchResult);
        const builder = new BSModalContextBuilder<AssistedSearchResultModalData>(
            modalData, undefined, AssistedSearchResultModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(AssistedSearchResultModal, overlayConfig).result;
    }

    /**
     * Remote Assisted-search requires to initialize the catalog records, so it needs that the user has the required capabilities
     */
    private isRemoteAuthorized() {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRegistryRead);
    }

    ok(event: Event) {
        let resourcePosition: string = this.targetPosition + ":" + 
            ((this.targetPosition == ResourcePositionEnum.local) ? this.selectedProject.getName() : this.selectedDataset.identity);

        let langsToLexModel: Map<string, ARTURIResource> = new Map();
        this.languagesToCheck.forEach(l => {
            if (l.checked) {
                langsToLexModel.set(l.lang, ResourceUtils.parseURI(l.lexModel));
            }
        });

        let searchModePar: SearchMode[] = this.getCheckedSearchMode();

        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.alignmentService.searchResources(this.context.resource, resourcePosition, [this.context.resource.getRole()], langsToLexModel, searchModePar).subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                if (searchResult.length == 0) {
                    this.basicModals.alert("Search", "No results found.", "warning");
                } else {
                    this.selectSearchResult(searchResult).then(
                        (selectedResource: ARTURIResource) => {
                            this.dialog.close(selectedResource);
                        }
                    );
                }
            },
            () => {}
        );
    }
    
    cancel() {
        this.dialog.dismiss();
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