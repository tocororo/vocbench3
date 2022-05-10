import { EventEmitter, Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { finalize } from 'rxjs/operators';
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";
import { ModalType } from "src/app/widget/modal/Modals";
import { ARTLiteral, ARTURIResource } from "../../../models/ARTResources";
import { SKOS, SKOSXL } from "../../../models/Vocabulary";
import { SkosServices } from "../../../services/skosServices";
import { SkosxlServices } from "../../../services/skosxlServices";
import { HttpServiceContext } from "../../../utils/HttpManager";

@Injectable()
export class LexicalizationEnrichmentHelper {

    constructor(private skosService: SkosServices, private skosxlService: SkosxlServices, private basicModals: BasicModalServices, private translateService: TranslateService) { }

    /**
     * Returns the Observable function for setting/adding a label in SKOS or SKOSXL lexicalization model.
     * @param concept 
     * @param predicate 
     * @param label 
     * @param xLabelCls optional, provided only in SKOSXL
     * @param checkClash if true, the services setPrefLabel will check for same resources with the same label
     * @param forceBlacklist if true, the services will ignore the blacklisted labels
     */
    getAddLabelFn(concept: ARTURIResource, predicate: ARTURIResource, label: ARTLiteral, xLabelCls?: ARTURIResource, checkEsistingAlt?: boolean, checkEsistingPref?: boolean, forceBlacklist?: boolean): Observable<void> {
        if (forceBlacklist) {
            HttpServiceContext.setContextForce(true);
        }
        let fn: Observable<void>;
        if (predicate.equals(SKOS.prefLabel)) {
            fn = this.skosService.setPrefLabel(concept, label, checkEsistingAlt, checkEsistingPref);
        } else if (predicate.equals(SKOS.altLabel)) {
            fn = this.skosService.addAltLabel(concept, label);
        } else if (predicate.equals(SKOS.hiddenLabel)) {
            fn = this.skosService.addHiddenLabel(concept, label);
        } else if (predicate.equals(SKOSXL.prefLabel)) {
            fn = this.skosxlService.setPrefLabel(concept, label, xLabelCls, checkEsistingAlt, checkEsistingPref);
        } else if (predicate.equals(SKOSXL.altLabel)) {
            fn = this.skosxlService.addAltLabel(concept, label, xLabelCls);
        } else if (predicate.equals(SKOSXL.hiddenLabel)) {
            fn = this.skosxlService.addHiddenLabel(concept, label, xLabelCls);
        }
        return fn.pipe(
            finalize(() => {
                if (forceBlacklist) {
                    HttpServiceContext.setContextForce(false);
                }
            })
        );
    }

    handleForceAddLexicalizationError(error: Error, resource: ARTURIResource, predicate: ARTURIResource, value: ARTLiteral, cls?: ARTURIResource, checkAlt?: boolean, checkPref?: boolean, forceBlacklist?: boolean, emitter?: { eventEmitter: EventEmitter<any>, value?: any }) {
        let msg = error.message + " " + this.translateService.instant("MESSAGES.FORCE_OPERATION_CONFIRM");
        this.basicModals.confirm({ key: "STATUS.WARNING" }, msg, ModalType.warning).then(
            () => {
                if (error.name.endsWith("PrefPrefLabelClashException")) {
                    checkPref = false; //user is forcing the addition after a pref-pref clash, so disable checkPref
                } else if (error.name.endsWith("PrefAltLabelClashException")) {
                    checkAlt = false; //user is forcing the addition after a pref-alt clash, so disable checkAlt
                } else if (error.name.endsWith("BlacklistForbiddendException")) {
                    forceBlacklist = true; //user is forcing the addition after a blacklisting error
                }
                this.getAddLabelFn(
                    resource, predicate, value, cls, checkAlt, checkPref, forceBlacklist
                ).subscribe(
                    () => emitter.eventEmitter.emit(emitter.value),
                    (err: Error) => this.handleForceAddLexicalizationError(err, resource, predicate, value, cls, checkAlt, checkPref, forceBlacklist)
                );
            }
        );
    }


}