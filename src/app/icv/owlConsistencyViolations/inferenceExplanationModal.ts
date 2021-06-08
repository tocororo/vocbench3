import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTResource, ARTURIResource, TripleScopes } from "src/app/models/ARTResources";
import { Triple } from "src/app/models/Shared";
import { IcvServices } from "src/app/services/icvServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { SharedModalServices } from "src/app/widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "inference-explanation-modal",
    templateUrl: "./inferenceExplanationModal.html",
})
export class InferenceExplanationModal {
    @Input() triple: Triple;

    explanation: InferenceExplanation;

    constructor(public activeModal: NgbActiveModal, private icvService: IcvServices, private resourceService: ResourcesServices, private sharedModals: SharedModalServices) {}

    ngOnInit() {
        this.icvService.explain(this.triple.subject, this.triple.predicate, this.triple.object).subscribe(
            stResp => {
                let premises: Triple[] = [];
                for (let p of stResp.premises) {
                    premises.push(Triple.parse(p));
                }
                premises.sort((t1, t2) => { //sort triples pushing the inferred after
                    if (t1.tripleScope == t2.tripleScope) {
                        return 0;
                    } else if (t1.tripleScope == TripleScopes.inferred) {
                        return 1; 
                    } else {
                        return -1;
                    }
                });
                this.explanation = {
                    ruleName: stResp.ruleName,
                    premises: premises
                }
                this.annotateTripleResources(premises);
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

    onResourceClick(resource: ARTResource) {
        this.sharedModals.openResourceView(resource, true);
    }

    ok() {
        this.activeModal.close();
    }

}

interface InferenceExplanation {
    ruleName: string;
    premises: Triple[];
}