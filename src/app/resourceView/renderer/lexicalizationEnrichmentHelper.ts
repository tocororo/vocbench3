import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ARTLiteral, ARTURIResource } from "../../models/ARTResources";
import { SKOS, SKOSXL } from "../../models/Vocabulary";
import { SkosServices } from "../../services/skosServices";
import { SkosxlServices } from "../../services/skosxlServices";
import { HttpServiceContext } from "../../utils/HttpManager";

@Injectable()
export class LexicalizationEnrichmentHelper {

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices) { }

    /**
     * Returns the Observable function for setting/adding a label in SKOS or SKOSXL lexicalization model.
     * @param concept 
     * @param predicate 
     * @param label 
     * @param xLabelCls optional, provided only in SKOSXL
     * @param checkClash if true, the services setPrefLabel will check for same resources with the same label
     * @param forceBlacklist if true, the services will ignore the blacklisted labels
     */
    getAddLabelFn(concept: ARTURIResource, predicate: ARTURIResource, label: ARTLiteral, xLabelCls?: ARTURIResource, checkClash?: boolean, forceBlacklist?: boolean): Observable<void> {
        if (forceBlacklist) {
            HttpServiceContext.setContextForce(true);
        }
        let fn: Observable<void>;
        if (predicate.equals(SKOS.prefLabel)) {
            fn = this.skosService.setPrefLabel(concept, label, checkClash);
        } else if (predicate.equals(SKOS.altLabel)) {
            fn = this.skosService.addAltLabel(concept, label);
        } else if (predicate.equals(SKOS.hiddenLabel)) {
            fn = this.skosService.addHiddenLabel(concept, label);
        } else if (predicate.equals(SKOSXL.prefLabel)) {
            fn = this.skosxlService.setPrefLabel(concept, label, xLabelCls, checkClash);
        } else if (predicate.equals(SKOSXL.altLabel)) {
            fn = this.skosxlService.addAltLabel(concept, label, xLabelCls);
        } else if (predicate.equals(SKOSXL.hiddenLabel)) {
            fn = this.skosxlService.addHiddenLabel(concept, label, xLabelCls);
        }
        return fn.finally(
            () => {
                if (forceBlacklist) {
                    HttpServiceContext.setContextForce(false);
                }
            }
        );
    }


}