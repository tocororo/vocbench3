import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { ARTURIResource } from "src/app/models/ARTResources";
import { ClassesServices } from "src/app/services/classesServices";
import { LexicographerViewServices } from "src/app/services/lexicographerViewServices";
import { PropertyServices } from "src/app/services/propertyServices";
import { ResourceUtils, SortAttribute } from "src/app/utils/ResourceUtils";

@Injectable()
export class MorphosyntacticCache {

    private propCache: ARTURIResource[];
    private propValueCache: MorphosyntacticCacheEntry[] = [];

    constructor(private lexicographerViewService: LexicographerViewServices, private propertyService: PropertyServices, private classService: ClassesServices) {
        this.propValueCache = [];
    }

    getProperties(): Observable<ARTURIResource[]> {
        if (this.propCache == null) {
            return this.lexicographerViewService.getMorphosyntacticProperties().pipe(
                map(props => {
                    ResourceUtils.sortResources(props, SortAttribute.value);
                    this.propCache = props;
                    return props;
                })
            );
        } else {
            return of(this.propCache);
        }
    }

    getValues(property: ARTURIResource): Observable<ARTURIResource[]> {
        let entry = this.propValueCache.find(c => c.prop.equals(property));
        if (entry != null) {
            return of(entry.values);
        } else {
            return this.propertyService.getRange(property).pipe(
                mergeMap(range => {
                    if (range.ranges != null && range.ranges.rangeCollection != null && range.ranges.rangeCollection.resources != null) {
                        let rangeColl = range.ranges.rangeCollection.resources;
                        if (rangeColl.length == 1) {
                            let rangeCls = rangeColl[0];
                            return this.classService.getInstances(rangeCls).pipe(
                                map(instances => {
                                    ResourceUtils.sortResources(instances, SortAttribute.value);
                                    let values = <ARTURIResource[]>instances;
                                    this.propValueCache.push({ prop: property, values: values }); //store in cache
                                    return values;
                                })
                            )
                        }
                    }
                })
            )
        }
    }
}

export interface MorphosyntacticCacheEntry {
    prop: ARTURIResource;
    values: ARTURIResource[];
}