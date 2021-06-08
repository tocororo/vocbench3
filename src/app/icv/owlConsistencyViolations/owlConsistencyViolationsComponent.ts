import { Component } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ARTResource, ARTURIResource, TripleScopes } from "src/app/models/ARTResources";
import { Triple, TupleTriple } from "src/app/models/Shared";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { ModalOptions } from "src/app/widget/modal/Modals";
import { SharedModalServices } from "src/app/widget/modal/sharedModal/sharedModalServices";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";
import { InferenceExplanationModal } from "./inferenceExplanationModal";

@Component({
    selector: "owl-consistency-violations",
    templateUrl: "./owlConsistencyViolationsComponent.html",
    host: { class: "pageComponent" },
})
export class OwlConsistencyViolationsComponent {

    violations: ConsistencyViolation[];

    constructor(private icvService: IcvServices, private resourceService: ResourcesServices,
        private sharedModals: SharedModalServices, private modalService: NgbModal) { }

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
                    let inconsistentTriples: TupleTriple[] = []
                    for (let t of violation.inconsistentTriples) {
                        inconsistentTriples.push(TupleTriple.parse(t));
                    }
                    let inconsistentTriple2: Triple[] = [];
                    for (let t of violation.inconsistentTriple2) {
                        inconsistentTriple2.push(Triple.parse(t));
                    }
                    inconsistentTriple2.sort((t1, t2) => { //sort triples pushing the inferred after
                        if (t1.tripleScope == t2.tripleScope) {
                            return 0;
                        } else if (t1.tripleScope == TripleScopes.inferred) {
                            return 1; 
                        } else {
                            return -1;
                        }
                    })
                    let cv: ConsistencyViolation = {
                        conditionName: violation.conditionName,
                        inconsistentTriples: inconsistentTriples,
                        inconsistentTriple2: inconsistentTriple2
                    };
                    this.violations.push(cv);
                }

                let triplesToAnnotate: Triple[] = [];
                this.violations.forEach(v => triplesToAnnotate.push(...v.inconsistentTriple2));
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

    showExplanation(triple: Triple) {
        const modalRef: NgbModalRef = this.modalService.open(InferenceExplanationModal, new ModalOptions('lg'));
        modalRef.componentInstance.triple = triple;

    }

    onResourceClick(resource: ARTResource) {
        this.sharedModals.openResourceView(resource, true);
    }

}

class ConsistencyViolation {
    conditionName: string;
    inconsistentTriples: TupleTriple[];
    inconsistentTriple2: Triple[];
}
