import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { CustomFormValueTable, CustomFormValueTableRow } from "src/app/models/CustomForms";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { ARTNode, ARTResource, ARTURIResource } from "../../../models/ARTResources";

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

    @Input() table: CustomFormValueTable;
    @Input() rendering: boolean;

    headers: ARTURIResource[];
    rows: CustomFormValueTableRow[];

    // @Output() delete = new EventEmitter(); //request to delete the object ("delete" action of the editable-resource or "-" button of reified-resource)
    // @Output() update = new EventEmitter(); //a change has been done => request to update the RV
    // @Output() edit = new EventEmitter(); //request to edit the object ("edit" action of the editable-resource)
    @Output() dblClick: EventEmitter<ARTResource> = new EventEmitter(); //object dbl clicked

    constructor(private resourceService: ResourcesServices) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['table']) {
            this.headers = this.table.rows[0].cells.map(c => c.pred);
            this.rows = this.table.rows;

            let values: ARTResource[] = [];
            this.rows.forEach(r => {
                r.cells.forEach(c => {
                    if (c.value instanceof ARTResource) {
                        values.push(c.value);
                    }
                })
            });
            this.resourceService.getResourcesInfo(values).subscribe(
                annValues => {
                    this.rows.forEach(r => {
                        for (let c of r.cells) {
                            let annotated = annValues.find(a => a.equals(c.value));
                            if (annotated != null) {
                                c.value = annotated;
                            }
                        }
                    })
                }
            )
        }
    }

    valueDblClick(value: ARTNode) {
        if (value instanceof ARTResource) {
            this.dblClick.emit(value);
        }
    }

}