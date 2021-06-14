import { Component } from "@angular/core";
import { Triple } from "src/app/models/Shared";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "owl-consistency-violations",
    templateUrl: "./owlConsistencyViolationsComponent.html",
    host: { class: "pageComponent" },
})
export class OwlConsistencyViolationsComponent {

    rendering: boolean;

    violations: ConsistencyViolation[];

    constructor(private icvService: IcvServices) { }

    /**
     * Run the check
     */
    runIcv() {
        this.violations = [];
        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listConsistencyViolations().subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));

                for (let violation of stResp) {
                    let inconsistentTriples: Triple[] = [];
                    for (let t of violation.inconsistentTriples) {
                        inconsistentTriples.push(Triple.parse(t));
                    }
                    let cv: ConsistencyViolation = {
                        conditionName: violation.conditionName,
                        inconsistentTriples: inconsistentTriples,
                    };
                    this.violations.push(cv);
                }
            }
        );
    }

    /**
     * If a triple is deleted, run again the ICV for detecting again new inconcistency
     */
    onDelete() {
        this.runIcv();
    }

}

class ConsistencyViolation {
    conditionName: string;
    inconsistentTriples: Triple[];
}
