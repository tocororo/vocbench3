import { from, Observable, of } from "rxjs";
import { map, mergeMap } from "rxjs/operators";
import { ARTURIResource } from "src/app/models/ARTResources";
import { ClassesServices } from "src/app/services/classesServices";
import { LexicographerViewServices } from "src/app/services/lexicographerViewServices";
import { PropertyServices } from "src/app/services/propertyServices";
import { ResourceUtils, SortAttribute } from "src/app/utils/ResourceUtils";
import { VBContext } from "src/app/utils/VBContext";
import { SharedModalServices } from "src/app/widget/modal/sharedModal/sharedModalServices";
import { DefinitionCustomRangeConfig } from "../termView/definitionEnrichmentHelper";

export class LexViewCache {

    //cache about morphosyntactic properties
    private propCache: ARTURIResource[];
    private propValueCache: MorphosyntacticCacheEntry[] = [];

    //cache about definition range
    private defRangeConfigCache: DefinitionCustomRangeConfig;

    constructor(private lexicographerViewService: LexicographerViewServices, private propertyService: PropertyServices, private classService: ClassesServices,
        private sharedModals: SharedModalServices) {
        this.propValueCache = [];
    }

    getMorphosyntacticProperties(): Observable<ARTURIResource[]> {
        if (this.propCache == null) {
            return this.lexicographerViewService.getMorphosyntacticProperties(VBContext.getWorkingProjectCtx().getProjectPreferences().activeLexicon, null, true).pipe(
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

    getMorphosyntacticValues(property: ARTURIResource): Observable<ARTURIResource[]> {
        let entry = this.propValueCache.find(c => c.prop.equals(property));
        if (entry != null) {
            return of(entry.values);
        } else {
            return this.getRangeClass(property).pipe(
                mergeMap(data => {
                    if (data != null) { //range class selection completed/not canceled
                        return this.classService.getInstances(data.cls).pipe(
                            map(instances => {
                                ResourceUtils.sortResources(instances, SortAttribute.value);
                                let values = <ARTURIResource[]>instances;
                                if (data.storeInCache) {
                                    this.propValueCache.push({ prop: property, values: values }); //store in cache
                                }
                                return values;
                            })
                        );
                    } else { //range selection canceled
                        return of([]);
                    }
                })
            );
        }
    }

    /**
     * Returns the range class of the morphosyntactic property; null if no range is found 
     * or if the selection of the range class (in case of multiple range) has been canceled.
     * In addition returns also a boolean telling if the values should be cached 
     * (false in case the property has multiple range class, so it cannot be assumed that the values will be always chosen among that class instances)
     * @param property 
     */
    private getRangeClass(property: ARTURIResource): Observable<{ cls: ARTURIResource, storeInCache: boolean }> {
        return this.propertyService.getRange(property).pipe(
            mergeMap(range => {
                if (range.ranges != null && range.ranges.rangeCollection != null && range.ranges.rangeCollection.resources != null) {
                    let rangeColl = range.ranges.rangeCollection.resources;
                    if (rangeColl.length == 0) {
                        return of(null); //no classes in range collection
                    } else if (rangeColl.length == 1) {
                        return of({ cls: rangeColl[0], storeInCache: true });
                    } else {
                        //in case multiple range class are specified, ask user to select the range
                        return from(
                            this.sharedModals.selectResource({ key: "DATA.ACTIONS.SELECT_RANGE" }, null, rangeColl).then(
                                (selectedRange: ARTURIResource[]) => {
                                    return { cls: selectedRange[0], storeInCache: false };
                                },
                                () => {
                                    return null;
                                }
                            )
                        );
                    }
                } else {
                    return of(null); //no range collection
                }
            })
        );
    }

}

export interface MorphosyntacticCacheEntry {
    prop: ARTURIResource;
    values: ARTURIResource[];
}