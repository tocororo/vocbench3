import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource, ResourcePositionEnum, ResourceUtils } from "../../models/ARTResources";
import { DatasetMetadata } from "../../models/Metadata";
import { Project } from "../../models/Project";
import { SearchMode } from "../../models/Properties";
import { OntoLex, RDFS, SKOS, SKOSXL } from "../../models/Vocabulary";
import { AlignmentServices } from "../../services/alignmentServices";
import { MapleServices } from "../../services/mapleServices";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { ProjectServices } from "../../services/projectServices";
import { HttpServiceContext } from "../../utils/HttpManager";
import { VBContext } from "../../utils/VBContext";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

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

    private sourceProject: Project;

    private positions: ResourcePositionEnum[] = [ResourcePositionEnum.local, ResourcePositionEnum.remote];
    private targetPosition: ResourcePositionEnum = this.positions[0];

    private projectList: Project[] = [];
    private selectedProject: Project;
    private projectMetadataAvailabilityMap: Map<Project, boolean> = new Map();

    private remoteDatasets: DatasetMetadata[] = [];
    private selectedDataset: DatasetMetadata;
    private datasetMetadataAvailabilityMap: Map<DatasetMetadata, boolean> = new Map();

    private sharedLexicalizationSets: LexicalizationSet[][]; //set of bidimensional array of LexicalizationSet (1st element info about 1st dataset)
    private languagesToCheck: { lang: string, lexModel: string, checked: boolean }[] = [];

    private searchModes: { mode: SearchMode, show: string, checked: boolean }[] = [
        { mode: SearchMode.startsWith, show: "Starts with", checked: false },
        { mode: SearchMode.contains, show: "Contains", checked: false },
        { mode: SearchMode.endsWith, show: "Ends with", checked: false },
        { mode: SearchMode.exact, show: "Exact", checked: false },
        { mode: SearchMode.fuzzy, show: "Fuzzy", checked: false }
    ]
    
    constructor(public dialog: DialogRef<AssistedSearchModalData>, private projectService: ProjectServices, private alignmentService: AlignmentServices,
        private metadataRegistryService: MetadataRegistryServices, private mapleService: MapleServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {

        this.sourceProject = VBContext.getWorkingProject();
        this.projectService.listProjects(this.sourceProject, true, true).subscribe(
            projects => {
                //keep only the projects different from the current
                for (var i = 0; i < projects.length; i++) {
                    if (projects[i].getName() != this.sourceProject.getName()) {
                        this.projectList.push(projects[i])
                    }
                }
            }
        );

        this.metadataRegistryService.getCatalogRecords().subscribe(
            catalogs => {
                catalogs.forEach(c => this.remoteDatasets.push(c.abstractDataset));
            }
        );
    }

    private changeTargetPosition(position: ResourcePositionEnum) {
        this.targetPosition = position;
        this.sharedLexicalizationSets = null;
        this.languagesToCheck = [];
        if (this.targetPosition == ResourcePositionEnum.local && this.selectedProject != null) {
            this.selectProject(this.selectedProject);
        } else if (this.targetPosition == ResourcePositionEnum.remote && this.selectedDataset != null) {
            this.selectDataset(this.selectedDataset);
        }
    }

    private refreshSourceMetadata() {
        this.mapleService.profileProject().subscribe(
            resp => {
                this.profileMediation();
            }
        );
    }

    private refreshTargetMetadata() {
        HttpServiceContext.setContextProject(this.selectedProject);
        this.mapleService.profileProject().subscribe(
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
        if (this.projectMetadataAvailabilityMap.has(this.selectedProject)) {
            //metadata availability has already been checked (the entry is in the map)
            this.profileMediationLocalProject();
        } else {
            //metadata availability has not been checked (the entry is not in the map) => check it
            HttpServiceContext.setContextProject(this.selectedProject);
            this.mapleService.checkProjectMetadataAvailability().subscribe(
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

    private generateProjectMetadata() {
        HttpServiceContext.setContextProject(this.selectedProject);
        this.mapleService.profileProject().subscribe(
            resp => {
                HttpServiceContext.removeContextProject();
                this.projectMetadataAvailabilityMap.set(this.selectedProject, true);
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
        this.sharedLexicalizationSets = null;
        this.languagesToCheck = [];
        let resourcePosition: string = this.targetPosition + ":" + 
            ((this.targetPosition == ResourcePositionEnum.local) ? this.selectedProject.getName() : this.selectedDataset.identity);
        this.mapleService.profileMediationProblem(resourcePosition).subscribe(
            resp => {
                this.sharedLexicalizationSets = resp.sharedLexicalizationSets;
                this.sharedLexicalizationSets.sort((s1, s2) => {
                    return s1[0].languageTag.localeCompare(s2[0].languageTag);
                });
                this.sharedLexicalizationSets.forEach(sls => {
                    this.languagesToCheck.push({ lang: sls[1].languageTag, lexModel: sls[1].lexicalizationModel, checked: false });
                })
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

    ok(event: Event) {
        let resourcePosition: string = this.targetPosition + ":" + 
            ((this.targetPosition == ResourcePositionEnum.local) ? this.selectedProject.getName() : this.selectedDataset.identity);

        let langsToLexModel: Map<string, ARTURIResource> = new Map();
        this.languagesToCheck.forEach(l => {
            if (l.checked) {
                langsToLexModel.set(l.lang, ResourceUtils.parseURI(l.lexModel));
            }
        });

        let searchModePar: SearchMode[] = [];
        this.searchModes.forEach(m => {
            if (m.checked) {
                searchModePar.push(m.mode);
            }
        });

        this.alignmentService.searchResources(this.context.resource, resourcePosition, [this.context.resource.getRole()], langsToLexModel, searchModePar).subscribe(
            searchResult => {
                this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                    (selectedResource: any) => {
                        this.dialog.close(selectedResource);
                    },
                    () => { }
                );
            }
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