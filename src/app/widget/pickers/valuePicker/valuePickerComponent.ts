import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ARTLiteral, ARTNode, ARTURIResource, RDFResourceRolesEnum, RDFTypesEnum } from '../../../models/ARTResources';
import { NTriplesUtil } from '../../../utils/ResourceUtils';

@Component({
    selector: 'value-picker',
    templateUrl: './valuePickerComponent.html',
})
export class ValuePickerComponent {
    
    @Input() value: ARTNode;
    @Input() roles: RDFResourceRolesEnum[]; //list of pickable resource roles
    // @Input() disabled: boolean = false;
    @Input() editable: boolean = false; //tells if the value can be manually edited (only for URI)
    @Input() disabled: boolean = false;
    @Output() valueChanged = new EventEmitter<ARTNode>();

    resTypes: { show: string, value: RDFTypesEnum }[] = [
        { show: "IRI", value: RDFTypesEnum.uri },
        { show: "Literal", value: RDFTypesEnum.literal }
    ];
    selectedResType: { show: string, value: RDFTypesEnum } = this.resTypes[0];

    constructor() { }

    ngOnInit() {
        this.init();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.init();
    }

    private init() {
        if (this.value) {
            if (typeof this.value == 'string') { //input si the NT serialization of the value => restore the ARTNode
                if ((<string>this.value).startsWith("<") && (<string>this.value).endsWith(">")) { //uri
                    this.value = NTriplesUtil.parseURI(this.value);
                } else if ((<string>this.value).startsWith("\"")) { //literal
                    this.value = NTriplesUtil.parseLiteral(this.value);
                }
            }
            //set the res type
            if (this.value.isURIResource()) {
                this.resTypes.forEach(rt => { if (rt.value == RDFTypesEnum.uri) { this.selectedResType = rt; } });
            } else if (this.value.isLiteral()) {
                this.resTypes.forEach(rt => { if (rt.value == RDFTypesEnum.literal) { this.selectedResType = rt; } }); 
            }
        }
    }

    onTypeChange() {
        this.value = null;
        this.valueChanged.emit(this.value);
    }

    updateIRI(value: ARTURIResource) {
        this.valueChanged.emit(value);
    }

    updateLiteral(value: ARTLiteral) {
        this.valueChanged.emit(value);
    }

}