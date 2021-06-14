import { Component, EventEmitter, Input, Output } from "@angular/core";
import { Observable } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { ARTBNode, ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { Triple } from "src/app/models/Shared";
import { IcvServices } from "src/app/services/icvServices";
import { ManchesterServices } from "src/app/services/manchesterServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { SharedModalServices } from "src/app/widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "explainable-triple",
    templateUrl: "./explainableTripleComponent.html",
})
export class ExplainableTripleComponent {
    @Input() triple: Triple;
    @Input() deletable: boolean;
    @Input() rendering: boolean;
    @Input() explainAtInit: boolean;
    @Output() delete: EventEmitter<void> = new EventEmitter();

    explanation: InferenceExplanation;
    showExplanation: boolean;

    constructor(private icvService: IcvServices, private resourceService: ResourcesServices, private manchesterService: ManchesterServices,
        private sharedModals: SharedModalServices) {}

    ngOnInit() {
        if (this.explainAtInit) {
            this.explain();
        }
    }

    explain() {
        //if the explanation has been already retrieved, simply show/hide the explanation
        if (this.explanation != null) {
            this.showExplanation = !this.showExplanation;
        } else { //otherwise init the explanation
            this.icvService.explain(this.triple.subject, this.triple.predicate, this.triple.object).subscribe(
                stResp => {
                    this.showExplanation = true;
                    let premises: Triple[] = [];
                    for (let p of stResp.premises) {
                        premises.push(Triple.parse(p));
                    }
                    this.explanation = {
                        ruleName: stResp.ruleName,
                        premises: premises
                    }
                }
            );
        }
    }

    deleteTriple() {
        this.getDeleteFn(this.triple).subscribe(
            () => {
                this.delete.emit();
            }
        );
    }

    private getDeleteFn(triple: Triple): Observable<void> {
        if (triple.object instanceof ARTBNode) {
            return this.manchesterService.isClassAxiom(triple.object).pipe(
                mergeMap(
                    isAxiom => {
                        if (isAxiom) {
                            return this.manchesterService.removeExpression(<ARTURIResource>triple.subject, triple.predicate, triple.object)
                        } else {
                            return this.resourceService.removeValue(triple.subject, triple.predicate, triple.object);
                        }
                    }
                )
            )
        } else {
            return this.resourceService.removeValue(triple.subject, triple.predicate, triple.object);
        }
    }

    onResourceDblClick(resource: ARTNode) {
        if (resource instanceof ARTResource) {
            this.sharedModals.openResourceView(resource, true);
        }
    }

    onDelete() {
        this.delete.emit();
    }

}

interface InferenceExplanation {
    ruleName: string;
    premises: Triple[];
}