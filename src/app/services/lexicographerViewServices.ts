import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from "../models/ARTResources";
import { Deserializer } from '../utils/Deserializer';
import { HttpManager } from "../utils/HttpManager";
import { ResourceUtils, SortAttribute } from '../utils/ResourceUtils';

@Injectable()
export class LexicographerViewServices {

    private serviceName = "LexicographerView";

    constructor(private httpMgr: HttpManager) { }

    getLexicalEntryView(lexicalEntry: ARTResource) {
        let params = {
            lexicalEntry: lexicalEntry,
        };
        return this.httpMgr.doGet(this.serviceName, "getLexicalEntryView", params);
    }

    getMorphosyntacticProperties(lexicon?: ARTResource, role?: RDFResourceRolesEnum, rootsIncluded?: boolean): Observable<ARTURIResource[]> {
        let params = {
            lexicon: lexicon,
            role: role,
            rootsIncluded: rootsIncluded
        };
        return this.httpMgr.doGet(this.serviceName, "getMorphosyntacticProperties", params).pipe(
            map(stResp => {
                let props = Deserializer.createURIArray(stResp);
                ResourceUtils.sortResources(props, SortAttribute.value);
                return props;
            })
        );
    }


}