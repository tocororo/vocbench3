import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTResource, ResAttribute } from "../../models/ARTResources";
import { ResourceUtils } from "../../utils/ResourceUtils";

@Component({
    selector: "resource-triple-editor",
    templateUrl: "./resourceTripleEditorComponent.html",
    host: { class: "vbox" }
})
export class ResourceTripleEditorComponent {

    @Input() resource: ARTResource;
    @Input() readonly: boolean;
    @Output() switchEditor: EventEmitter<void> = new EventEmitter();

    private disabled: boolean;

    private description: string = `<http://Sub1>     <http://pred1>     <http://obj> .
<http://Sub2>     <http://pred2#an2> "literal 1" .
<http://Sub3#an3> <http://pred3>     _:bnode3 .
_:bnode4          <http://pred4>     "literal 2"@lang .
_:bnode5          <http://pred5>     "literal 3"^^<http://type> .`;

    constructor() {}

    ngOnInit() {
        /**
         * editor disabled if:
         * - it is readonly (precisely, the panel that contains this editor is readonly) 
         * - the resource is not explicit
         * - the resource is staged
         */
        this.disabled = !this.resource.getAdditionalProperty(ResAttribute.EXPLICIT) ||
            ResourceUtils.isResourceInStaging(this.resource) ||
            this.readonly;
    }

    private switchEditorMode() {
        this.switchEditor.emit();
    }
}