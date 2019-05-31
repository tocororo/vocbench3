import { OnInit } from "@angular/core";
import { AlignmentOverview } from "../../models/Alignment";
import { Project } from "../../models/Project";
import { VBContext } from "../../utils/VBContext";

export class AlignFromSource implements OnInit {

    alignmentOverview: AlignmentOverview;
    leftProject: Project;
    rightProject: Project;

    constructor() {}

    ngOnInit() {
        this.leftProject = VBContext.getWorkingProject();
    }

}