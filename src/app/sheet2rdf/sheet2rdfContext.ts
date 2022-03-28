import { Injectable } from "@angular/core";
import { RDFFormat } from "../models/RDFFormat";
import { S2RDFModel } from "../models/Sheet2RDF";

@Injectable()
export class Sheet2RdfContextService {

    memoizeIdList: string[]; //id of memoize maps. Unique for all S2RDF, so maps are shared across all sheets
    exportFormats: RDFFormat[]; //stored here so that they are shared among the sheets (without initializing them in all sheets)
    sheetModelMap: Map<string, S2RDFModel>;

}