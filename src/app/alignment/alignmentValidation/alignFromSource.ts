import { Directive, OnInit } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { map } from 'rxjs/operators';
import { AlignmentOverview } from "../../models/Alignment";
import { Project } from "../../models/Project";
import { EDOAL } from "../../models/Vocabulary";
import { EdoalServices } from "../../services/edoalServices";
import { ProjectServices } from "../../services/projectServices";
import { VBContext } from "../../utils/VBContext";

@Directive()
export abstract class AlignFromSource implements OnInit {

    alignmentOverview: AlignmentOverview;
    leftProject: Project;
    rightProject: Project;

    protected edoalService: EdoalServices;
    protected projectService: ProjectServices
    constructor(edoalService: EdoalServices, projectService: ProjectServices) {
        this.edoalService = edoalService;
        this.projectService = projectService;
    }

    ngOnInit() {
        if (this.isEdoalProject()) {
            this.edoalService.getAlignedProjects().subscribe(
                projects => {
                    let leftProjectName: string = projects[0];
                    let rightProjectName: string = projects[1];
                    let initProjectsFn: Observable<void>[] = [
                        this.projectService.getProjectInfo(leftProjectName).pipe(
                            map(proj => {
                                this.leftProject = proj;
                            })
                        ),
                        this.projectService.getProjectInfo(rightProjectName).pipe(
                            map(proj => {
                                this.rightProject = proj;
                            })
                        )
                    ];
                    forkJoin(initProjectsFn).subscribe(
                        () => {
                            this.init();
                        }
                    );
                }
            );
        } else {
            this.leftProject = VBContext.getWorkingProject();
            this.init();
        }
    }

    isEdoalProject() {
        return VBContext.getWorkingProject().getModelType() == EDOAL.uri;
    }

    abstract init(): void;

}