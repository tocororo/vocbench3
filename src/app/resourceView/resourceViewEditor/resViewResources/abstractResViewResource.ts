import { EventEmitter, Input, Output } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";

export class AbstractResViewResource {
    @Input() subject: ARTResource; //subject of the triple which the "resource" represents the object (the resource represented in the RV)
    @Input() predicate: ARTURIResource; //property of the triple which the "resource" represents the object
    @Input() resource: ARTNode; //resource shown in the component. Represents the object of a triple shown in a ResourceView partition
    @Input() rendering: boolean;
    @Input() readonly: boolean;
    @Input() partition: ResViewPartition;

    @Output('delete') deleteOutput = new EventEmitter();
    @Output() dblClick: EventEmitter<void> = new EventEmitter();

    protected delete() {
        this.deleteOutput.emit();
    }

    protected resourceDblClick() {
        if (this.resource.isResource()) {
            this.dblClick.emit();
        }
    }
}