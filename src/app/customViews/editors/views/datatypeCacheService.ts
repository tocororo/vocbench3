import { Injectable } from "@angular/core";
import { Observable, Observer, of } from "rxjs";
import { map } from "rxjs/operators";
import { ARTURIResource } from "src/app/models/ARTResources";
import { DatatypesServices } from "src/app/services/datatypesServices";
import { ResourceUtils, SortAttribute } from "src/app/utils/ResourceUtils";

@Injectable()
export class DatatypeCacheService {

    private datatypes: ARTURIResource[];

    constructor(private datatypeService: DatatypesServices) {}

    resetCache() {
        this.datatypes = null;
    }

    getDatatypes(): Observable<ARTURIResource[]> {
        if (this.datatypes == null) {
            return this.datatypeService.getDatatypes().pipe(
                map(datatypes => {
                    this.datatypes = datatypes;
                    ResourceUtils.sortResources(this.datatypes, SortAttribute.show);
                    return this.datatypes;
                })
            );
        } else {
            return of(this.datatypes);
        }
    }

}