import { Component } from "@angular/core";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { Triple } from "src/app/models/Shared";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";

@Component({
    selector: "owl-consistency-violations",
    templateUrl: "./owlConsistencyViolationsComponent.html",
    host: { class: "pageComponent" },
})
export class OwlConsistencyViolationsComponent {

    violations: ConsistencyViolation[];

    constructor(private icvService: IcvServices, private resourceService: ResourcesServices) { }

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

                let triplesToAnnotate: Triple[] = [];
                this.violations.forEach(v => triplesToAnnotate.push(...v.inconsistentTriples));
                this.annotateTripleResources(triplesToAnnotate);
            }
        );
    }

    private annotateTripleResources(triples: Triple[]) {
        let resources: ARTResource[] = [];
        triples.forEach(t => {
            if (t.subject instanceof ARTURIResource && !resources.some(r => r.equals(t.subject))) {
                resources.push(t.subject);
            }
            if (!resources.some(r => r.equals(t.predicate))) {
                resources.push(t.predicate);
            }
            if (t.object instanceof ARTURIResource && !resources.some(r => r.equals(t.object))) {
                resources.push(t.object);
            }
        });
        if (resources.length > 0) {
            this.resourceService.getResourcesInfo(resources).subscribe(
                annotatedRes => {
                    triples.forEach(t => {
                        let annotatedSubj = annotatedRes.find(a => a.equals(t.subject));
                        if (annotatedSubj != null) {
                            t.subject = annotatedSubj;
                        }
                        let annotatedPred = annotatedRes.find(a => a.equals(t.predicate));
                        if (annotatedPred != null) {
                            t.predicate = <ARTURIResource>annotatedPred;
                        }
                        let annotatedObj = annotatedRes.find(a => a.equals(t.object));
                        if (annotatedObj != null) {
                            t.object = annotatedObj;
                        }
                    })
                }
            )
        }
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
