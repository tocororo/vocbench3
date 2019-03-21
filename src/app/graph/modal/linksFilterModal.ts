import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTPredicateObjects, ARTURIResource } from "../../models/ARTResources";
import { ResViewPartition, ResViewUtils } from "../../models/ResourceView";

export class LinksFilterModalData extends BSModalContext {
    constructor(public predObjListMap: { [partition: string]: ARTPredicateObjects[] }) {
        super();
    }
}

@Component({
    selector: "links-filter-modal",
    templateUrl: "./linksFilterModal.html"
})
export class LinksFilterModal implements ModalComponent<LinksFilterModalData> {
    context: LinksFilterModalData;

    private filters: LinkFilter[];
    private totalObjCount: number = 0;

    constructor(public dialog: DialogRef<LinksFilterModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.filters = [];
        for (let p in this.context.predObjListMap) {
            let polList: ARTPredicateObjects[] = this.context.predObjListMap[p];
            let predicates: { res: ARTURIResource, checked: boolean, count: number }[] = [];
            polList.forEach(pol => {
                predicates.push({ res: pol.getPredicate(), checked: true, count: pol.getObjects().length });
                this.totalObjCount += pol.getObjects().length;
            });
            if (predicates.length > 0) {
                this.filters.push({
                    partition: { id: <ResViewPartition>p, show: ResViewUtils.getResourceViewPartitionLabel(<ResViewPartition>p) },
                    predicates: predicates }
                );
            }
        }
    }

    private checkAll(filter: LinkFilter, check: boolean) {
        filter.predicates.forEach(p => {
            p.checked = check;
        })
    }

    private getPartitionCount(filter: LinkFilter): number {
        let count = 0;
        filter.predicates.forEach(p => {
            if (p.checked) count += p.count;
        })
        return count;
    }

    private getVisibleCount(): number {
        let count = 0;
        this.filters.forEach(f => {
            f.predicates.forEach(p => {
                if (p.checked) count += p.count;
            });
        });
        return count;
    }

    ok(event: Event) {
        let predicatesToHide: ARTURIResource[] = [];
        this.filters.forEach(f => {
            f.predicates.forEach(p => {
                if (!p.checked) predicatesToHide.push(p.res);
            });
        });
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(predicatesToHide);
    }

    cancel() {
        this.dialog.dismiss();
    }

}

class LinkFilter {
    partition: { id: ResViewPartition, show: string };
    predicates: { res: ARTURIResource, checked: boolean, count: number }[];
}