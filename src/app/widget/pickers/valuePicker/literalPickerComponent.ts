import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ARTLiteral, ARTURIResource, RDFTypesEnum, ResourceUtils } from '../../../models/ARTResources';
import { XmlSchema } from '../../../models/Vocabulary';
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

    private menuAsButton: boolean = false; //if there is just a role => do not show a dropdown menu, just a button
    
    constructor(private creationModals: CreationModalServices) { }

    ngOnInit() {
        this.init();
    }

    ngOnChanges(changes: SimpleChanges) {
        this.init();
    }

    private init() {
        if (this.literal) {
            this.literalNT = this.literal.toNT();
        }

        /**
         * menu for choosing among typed and plain literal is visible as button only if
         * is true just one of plain or typed (xor between plain and typed)
         */
        this.menuAsButton = (this.plain && !this.typed) || (!this.plain && this.typed);
    }

    private pickLiteral(type?: RDFTypesEnum) {
        if (type == null) { //pickLiteral from button => create the only literal allowed
            if (this.plain) {
                this.pickLiteral(RDFTypesEnum.plainLiteral);
            } else if (this.typed) {
                this.pickLiteral(RDFTypesEnum.typedLiteral);
            }
        } else if (type == RDFTypesEnum.typedLiteral) {
            this.creationModals.newTypedLiteral("Create typed literal", this.datatypes).then(
                (value: ARTLiteral) => {
                    this.literal = value;
                    this.literalNT = this.literal.toNT();
                    this.literalChanged.emit(this.literal);
                },
                () => {}
            );
        } else if (type == RDFTypesEnum.plainLiteral) {
            this.creationModals.newPlainLiteral("Create literal").then(
                (value: ARTLiteral) => {
                    this.literal = value;
                    this.literalNT = this.literal.toNT();
                    this.literalChanged.emit(this.literal);
                },
                () => {}
            );
        }
    }


}