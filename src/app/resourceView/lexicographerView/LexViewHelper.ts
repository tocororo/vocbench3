import { Injectable } from "@angular/core";
import { from, Observable, of } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { ConstituentListCreatorModalReturnData } from "../resourceViewEditor/resViewModals/constituentListCreatorModal";
import { ResViewModalServices } from "../resourceViewEditor/resViewModals/resViewModalServices";

/**
 * Contains methods shared in the lex view
 */
@Injectable()
export class LexViewHelper {

    constructor(private ontolexService: OntoLexLemonServices, private resViewModals: ResViewModalServices) { }

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

}