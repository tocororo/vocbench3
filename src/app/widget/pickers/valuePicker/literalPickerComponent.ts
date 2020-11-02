import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ARTLiteral, ARTURIResource } from '../../../models/ARTResources';
import { ResourceUtils } from '../../../utils/ResourceUtils';
import { CreationModalServices } from '../../modal/creationModal/creationModalServices';

@Component({
    selector: 'literal-picker',
    templateUrl: './literalPickerComponent.html',
})
export class LiteralPickerComponent {
    
    @Input() literal: ARTLiteral;
    @Input() plain: boolean = true; //if true, the component allows to create/pick plain literal
    @Input() typed: boolean = true; //if true, the component allows to create/pick typed literal
    @Input() datatypes: ARTURIResource[]; //list of allowed datatypes
    @Input() disabled: boolean = false;
    @Output() literalChanged = new EventEmitter<ARTLiteral>();

    private literalNT: string;

    constructor(private creationModals: CreationModalServices) { }

    ngOnInit() {
        this.init();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.init();
    }

    private init() {
        if (this.literal) {
            if (typeof this.literal == 'string') {
                this.literal = ResourceUtils.parseLiteral(this.literal);
            }
            this.literalNT = this.literal.toNT();
        }
    }

    private pickLiteral() {
        this.creationModals.newTypedLiteral("Create literal", null, this.datatypes).then(
            (values: ARTLiteral[]) => {
                this.literal = values[0];
                this.literalNT = this.literal.toNT();
                this.literalChanged.emit(this.literal);
            },
            () => {}
        );
    }

}