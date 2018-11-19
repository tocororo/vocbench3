import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ARTLiteral, ARTURIResource, RDFTypesEnum } from '../../../models/ARTResources';
import { BasicModalServices } from '../../modal/basicModal/basicModalServices';
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

    constructor(private creationModals: CreationModalServices, private basicModals: BasicModalServices) { }

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
    }

    private pickLiteral() {
        let resourceTypes: {[key: string]: RDFTypesEnum} = {
            "Plain Literal": RDFTypesEnum.plainLiteral,
            "Typed Literal": RDFTypesEnum.typedLiteral
        };

        if (this.plain && this.typed) {
            this.basicModals.select("Create literal", "Select the type of literal to create", Object.keys(resourceTypes)).then(
                (type: string) => {
                    this.createLiteral(resourceTypes[type]);
                },
                () => {}
            ); 
        } else {
            if (this.plain) {
                this.createLiteral(RDFTypesEnum.plainLiteral);
            } else if (this.typed) {
                this.createLiteral(RDFTypesEnum.typedLiteral);
            }
        }
    }

    private createLiteral(type: RDFTypesEnum) {
        if (type == RDFTypesEnum.typedLiteral) {
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
                (value: ARTLiteral[]) => {
                    this.literal = value[0];
                    this.literalNT = this.literal.toNT();
                    this.literalChanged.emit(this.literal);
                },
                () => {}
            );
        }
    }

}