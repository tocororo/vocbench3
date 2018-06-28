import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from 'ngx-modialog';
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ResourcePositionEnum, ARTURIResource } from "../../models/ARTResources";
import { Project } from "../../models/Project";
import { ProjectServices } from "../../services/projectServices";
import { VBContext } from "../../utils/VBContext";
import { MetadataRegistryServices } from "../../services/metadataRegistryServices";
import { DatasetMetadata } from "../../models/Metadata";
import { MapleServices } from "../../services/mapleServices";
import { HttpServiceContext } from "../../utils/HttpManager";
import { AlignmentServices } from "../../services/alignmentServices";

// export class ResourceAlignmentModalData extends BSModalContext {
//     constructor(public resource: ARTResource) {
//         super();
//     }
// }

@Component({
    selector: "assiste-search-modal",
    templateUrl: "./assistedSearchModal.html",
})
export class AssistedSearchModal implements ModalComponent<BSModalContext> {
    context: BSModalContext;

    private targetPosition: ResourcePositionEnum = ResourcePositionEnum.local;

    private projectList: Project[] = [];
    private selectedProject: Project;
    private projectMetadataAvailabilityMap: Map<Project, boolean> = new Map();

    private remoteDatasets: DatasetMetadata[] = [];
    private selectedDataset: DatasetMetadata;
    private datasetMetadataAvailabilityMap: Map<DatasetMetadata, boolean> = new Map();

    private sharedLexicalizationSets: LexicalizationSet[][]; //set of bidimensional array of LexicalizationSet (1st element info about 1st dataset)
    private languagesToCheck: { lang: string, check: boolean }[] = [];
    
    constructor(public dialog: DialogRef<BSModalContext>, private projectService: ProjectServices, private alignmentService: AlignmentServices,
        private metadataRegistryService: MetadataRegistryServices, private mapleService: MapleServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.projectService.listProjects(VBContext.getWorkingProject(), true, true).subscribe(
            projects => {
                //keep only the projects different from the current
                for (var i = 0; i < projects.length; i++) {
                    if (projects[i].getName() != VBContext.getWorkingProject().getName()) {
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
        let resourcePosition: string = this.targetPosition + ":";
        if (this.targetPosition == ResourcePositionEnum.local) {
            resourcePosition += this.selectedProject.getName();
        } else { //remote
            resourcePosition += this.selectedDataset.identity;
        }
        this.mapleService.profileMediationProblem(resourcePosition).subscribe(
            resp => {
                this.sharedLexicalizationSets = resp.sharedLexicalizationSets;
                this.sharedLexicalizationSets.sort((s1, s2) => {
                    return s1[0].languageTag.localeCompare(s2[0].languageTag);
                });
                this.sharedLexicalizationSets.forEach(sls => {
                    this.languagesToCheck.push({ lang: sls[0].languageTag, check: false });
                })
            }
        );
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
            if (l.check) {
                ok = true;
            }
        })
        return ok;
    }

    ok(event: Event) {
        //TODO
        // this.alignmentService.searchResources()
        this.dialog.close();
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