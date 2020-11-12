import { Component } from '@angular/core';
import { AlignmentOverview } from '../../models/Alignment';
import { AlignmentServices } from '../../services/alignmentServices';
import { EdoalServices } from '../../services/edoalServices';
import { ProjectServices } from '../../services/projectServices';
import { UIUtils } from '../../utils/UIUtils';
import { AlignFromSource } from './alignFromSource';
import { VBContext } from '../../utils/VBContext';
import { Project } from '../../models/Project';
import { EDOAL } from '../../models/Vocabulary';

@Component({
    selector: 'alignment-file',
    templateUrl: './alignFromFileComponent.html',
    host: { class: "vbox" }
})
export class AlignFromFileComponent extends AlignFromSource {

    alignmentFile: File;
    sourceBaseURI: string;
    targetBaseURI: string;

    constructor(edoalService: EdoalServices, projectService: ProjectServices, private alignmentService: AlignmentServices) {
        super(edoalService, projectService);
    }


    init() {}

    /**
     * Updates the file to load when user change file on from filepicker
     */
    fileChangeEvent(file: File) {
        this.alignmentFile = file;
        this.loadAlignment();
    }

    /**
     * Loads the alignment file and the mapping cells
     */
    loadAlignment() {
        //restore initial status
        this.sourceBaseURI = null;
        this.targetBaseURI = null;

        let leftProject: Project;
        let rightProject: Project;
        if (this.isEdoalProject()) {
            this.edoalService.getAlignedProjects().subscribe(
                projects => {
                    leftProject = new Project(projects[0]);
                    rightProject = new Project(projects[1]);
                    this.loadAlignmentImpl(leftProject, rightProject);
                }
            )
        } else {
            this.loadAlignmentImpl();
        }
    }

    private loadAlignmentImpl(leftProject?: Project, rightProject?: Project) {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.alignmentService.loadAlignment(this.alignmentFile, leftProject, rightProject).subscribe(
            (overview: AlignmentOverview) => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                this.sourceBaseURI = overview.onto1;
                this.targetBaseURI = overview.onto2;

                this.alignmentOverview = overview;
            }
        );
    }

}