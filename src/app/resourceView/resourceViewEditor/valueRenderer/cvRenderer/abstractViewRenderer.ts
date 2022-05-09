import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { ARTNode, ARTResource, ARTURIResource } from "src/app/models/ARTResources";
import { ResViewPartition } from "src/app/models/ResourceView";
import { CRUDEnum, ResourceViewAuthEvaluator } from "src/app/utils/AuthorizationEvaluator";

@Directive()
export abstract class AbstractViewRendererComponent {

    @Input() subject: ARTResource;
    @Input() predicate: ARTURIResource;
    @Input() partition: ResViewPartition;
    @Input() readonly: boolean;

    @Output() doubleClick: EventEmitter<ARTNode> = new EventEmitter();
    @Output() update: EventEmitter<void> = new EventEmitter();
    @Output() delete: EventEmitter<ARTNode> = new EventEmitter();

    editAuthorized: boolean = true;
    deleteAuthorized: boolean = true;


    constructor() { }

    ngOnInit() {
        this.initActionStatus();
    }

    protected initActionStatus(): void {
        this.editAuthorized = ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.U, this.subject) && !this.readonly;
        this.deleteAuthorized = ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.D, this.subject) && !this.readonly;
    }

    /**
     * normalizes the input data in a format compliant for the view renderer
     */
    protected abstract processInput(): void;


    protected abstract deleteHandler(arg?: any): void;


}