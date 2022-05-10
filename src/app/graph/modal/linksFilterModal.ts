import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTPredicateObjects, ARTURIResource } from "../../models/ARTResources";
import { ResViewPartition, ResViewUtils } from "../../models/ResourceView";

@Component({
    selector: "links-filter-modal",
    templateUrl: "./linksFilterModal.html"
})
export class LinksFilterModal {
    @Input() predObjListMap: { [partition: string]: ARTPredicateObjects[] };

    filters: LinkFilter[];
    totalObjCount: number = 0;

    constructor(public activeModal: NgbActiveModal) {}

    ngOnInit() {
        this.filters = [];
        for (let p in this.predObjListMap) {
            let polList: ARTPredicateObjects[] = this.predObjListMap[p];
            let predicates: { res: ARTURIResource, checked: boolean, count: number }[] = [];
            polList.forEach(pol => {
                predicates.push({ res: pol.getPredicate(), checked: true, count: pol.getObjects().length });
                this.totalObjCount += pol.getObjects().length;
            });
            if (predicates.length > 0) {
                this.filters.push({
                    partition: { id: <ResViewPartition>p, labelTranslationKey: ResViewUtils.getResourceViewPartitionLabelTranslationKey(<ResViewPartition>p) },
                    predicates: predicates 
                });
            }
        }
    }

    private checkAll(filter: LinkFilter, check: boolean) {
        filter.predicates.forEach(p => {
            p.checked = check;
        });
    }

    private getPartitionCount(filter: LinkFilter): number {
        let count = 0;
        filter.predicates.forEach(p => {
            if (p.checked) count += p.count;
        });
        return count;
    }

    getVisibleCount(): number {
        let count = 0;
        this.filters.forEach(f => {
            f.predicates.forEach(p => {
                if (p.checked) count += p.count;
            });
        });
        return count;
    }

    ok() {
        let predicatesToHide: ARTURIResource[] = [];
        this.filters.forEach(f => {
            f.predicates.forEach(p => {
                if (!p.checked) predicatesToHide.push(p.res);
            });
        });
        this.activeModal.close(predicatesToHide);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

class LinkFilter {
    partition: { id: ResViewPartition, labelTranslationKey: string };
    predicates: { res: ARTURIResource, checked: boolean, count: number }[];
}