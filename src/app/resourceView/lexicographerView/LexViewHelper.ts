import { Injectable } from "@angular/core";
import { from, Observable, of } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { Vartrans } from "src/app/models/Vocabulary";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";
import { ConstituentListCreatorModalReturnData } from "../resourceViewEditor/resViewModals/constituentListCreatorModal";
import { ResViewModalServices } from "../resourceViewEditor/resViewModals/resViewModalServices";

/**
 * Contains methods shared in the lex view
 */
@Injectable()
export class LexViewHelper {

    constructor(private resourceService: ResourcesServices, private ontolexService: OntoLexLemonServices, 
        private browsingModals: BrowsingModalServices, private resViewModals: ResViewModalServices) { }

    addSubterm(sourceEntry: ARTResource): Observable<boolean> {
        return this.selectLexicalEntry().pipe(
            mergeMap(targetEntry => {
                if (targetEntry) {
                    return this.ontolexService.addSubterm(<ARTURIResource>sourceEntry, targetEntry).pipe(
                        map(() => true)
                    );
                } else {
                    return of(false);
                }
            })
        );
    }

    /**
     * Returns true if the workflow for adding relation has been completed (so the lex view will be refreshed)
     * @param sourceEntry 
     */
    addRelated(sourceEntry: ARTResource): Observable<boolean> {
        return this.selectLexicalRelProp().pipe(
            mergeMap((prop: ARTURIResource) => {
                if (prop != null) {
                    return this.selectLexicalEntry().pipe(
                        mergeMap(targetEntry => {
                            if (targetEntry) {
                                return this.resourceService.addValue(sourceEntry, prop, targetEntry).pipe(
                                    map(() => true)
                                );
                            } else {
                                return of(false);
                            }
                        })
                    );
                } else {
                    return of(false);
                }
            })
        )
    }

    /**
     * Returns true if the workflow for adding translation has been completed (so the lex view will be refreshed)
     * @param sourceEntry 
     */
    addTranslation(sourceEntry: ARTResource): Observable<boolean> {
        return this.selectLexicalEntry().pipe(
            mergeMap(targetEntry => {
                if (targetEntry) {
                    return this.resourceService.addValue(sourceEntry, Vartrans.translatableAs, targetEntry).pipe(
                        map(() => true)
                    );
                } else {
                    return of(false);
                }
            })
        );
    }

    setConstituents(sourceEntry: ARTResource): Observable<boolean> {
        return from(
            this.resViewModals.createConstituentList({key:"DATA.ACTIONS.CREATE_CONSTITUENTS_LIST"}).then(
                (data: ConstituentListCreatorModalReturnData) => {
                    return this.ontolexService.setLexicalEntryConstituents(<ARTURIResource>sourceEntry, data.list, data.ordered).pipe(
                        map(() => true)
                    )
                },
                () => of(false)
            )
        ).pipe( //for flattening Observable<Observable<boolean>> returned above
            mergeMap(done => done)
        )
    }

    private selectLexicalRelProp(): Observable<ARTURIResource> {
        return from(
            this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}, [Vartrans.lexicalRel]).then(
                (prop: ARTURIResource) => {
                    return prop;
                },
                () => {
                    return null;
                }
            )
        )
    }

    private selectLexicalEntry(): Observable<ARTURIResource> {
        return from(
            this.browsingModals.browseLexicalEntryList({key:"DATA.ACTIONS.SELECT_LEXICAL_ENTRY"}).then(
                (targetEntry: ARTURIResource) => {
                    return targetEntry;
                },
                () => {
                    return null;
                }
            )
        )
    }


}