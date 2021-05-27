import { Component } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { Deserializer } from "src/app/utils/Deserializer";
import { IcvServices } from "../../services/icvServices";
import { UIUtils } from "../../utils/UIUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "owl-consistency-violations",
    templateUrl: "./owlConsistencyViolationsComponent.html",
    host: { class: "pageComponent" }
})
export class OwlConsistencyViolationsComponent {

    violations: ConsistencyViolation[];

    constructor(private icvService: IcvServices, private basicModals: BasicModalServices) { }

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
                    let triples: Triple[] = []
                    for (let t of violation.inconsistentTriples) {
                        triples.push({
                            s: Deserializer.createRDFResource(t[0]),
                            p: Deserializer.createURI(t[1]),
                            o: Deserializer.createRDFNode(t[2])
                        })
                    }
                    let cv: ConsistencyViolation = {
                        conditionName: violation.conditionName,
                        inconsistentTriples: triples
                    };
                    this.violations.push(cv);
                }
                console.log(this.violations);
            }
        );

    }

}

class ConsistencyViolation {
    conditionName: string;
    inconsistentTriples: Triple[];
}

interface Triple {
    s: ARTResource;
    p: ARTURIResource;
    o: ARTNode;
}