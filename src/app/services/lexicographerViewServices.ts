import { Injectable } from '@angular/core';
import { ARTResource } from "../models/ARTResources";
import { HttpManager } from "../utils/HttpManager";

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


}