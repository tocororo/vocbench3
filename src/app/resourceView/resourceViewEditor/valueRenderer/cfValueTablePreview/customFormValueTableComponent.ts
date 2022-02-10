import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { CustomFormValueTable, CustomFormValueTableRow } from "src/app/models/CustomForms";
import { ResViewPartition } from "src/app/models/ResourceView";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { AuthorizationEvaluator, CRUDEnum, ResourceViewAuthEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { ARTResource, ARTURIResource } from "../../../../models/ARTResources";

@Component({
    selector: "cf-value-table",
    templateUrl: "./customFormValueTableComponent.html",
    host: { class: "d-block" },
    styles: [`
        .cf-table {
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 4px;
        }
        .cf-table th { border-top: 0px }
    `],
})
export class CustomFormValueTableComponent {

    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;
    @Input() table: CustomFormValueTable;
    @Input() rendering: boolean;
    @Input() readonly: boolean;
    @Input() partition: ResViewPartition;

    @Output() update = new EventEmitter(); //a change has been done => request to update the RV
    @Output() delete: EventEmitter<ARTResource> = new EventEmitter(); //request to delete an object of the table
    @Output() dblClick: EventEmitter<ARTResource> = new EventEmitter(); //object dbl clicked

    headers: ARTURIResource[];
    rows: CustomFormValueTableRow[];

    deleteRowDisabled: boolean;

    constructor(private resourceService: ResourcesServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['table']) {
            this.initTable();
            this.deleteRowDisabled = this.readonly || !ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.D, this.subject);
        }
    }

    initTable() {
        this.headers = this.table.rows[0].cells.map(c => c.pred);
        this.rows = this.table.rows;

        //collect resources to annotate
        let resToAnnotate: ARTResource[] = [];
        resToAnnotate.push(...this.headers);
        this.rows.forEach(r => {
            r.cells.forEach(c => {
                if (c.value instanceof ARTResource) {
                    resToAnnotate.push(c.value);
                }
            })
        });
        //remove duplicate
        let noDuplicate: ARTResource[] = [];
        resToAnnotate.forEach(r => {
            if (!noDuplicate.some(nd => nd.equals(r))) {
                noDuplicate.push(r);
            }
        });

        this.resourceService.getResourcesInfo(noDuplicate).subscribe(
            annValues => {
                this.headers.forEach((h, i, self) => {
                    let annotated = annValues.find(a => a.equals(h));
                    if (annotated != null) {
                        self[i] = <ARTURIResource>annotated;
                    }
                })
                this.rows.forEach(r => {
                    for (let c of r.cells) {
                        let annotatedValue = annValues.find(a => a.equals(c.value));
                        if (annotatedValue != null) {
                            c.value = annotatedValue;
                        }
                        let annotatedPred = annValues.find(a => a.equals(c.pred));
                        if (annotatedPred != null) {
                            c.pred = <ARTURIResource>annotatedPred;
                        }
                    }
                })
            }
        )
    }

    deleteRow(row: CustomFormValueTableRow) {
        this.delete.emit(row.describedObject);
    }

    valueDblClick(value: ARTResource) {
        this.dblClick.emit(value);
    }

    onUpdate() {
        this.update.emit();
    }

}