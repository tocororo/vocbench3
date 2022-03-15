import { Directive, EventEmitter, Input, Output } from '@angular/core';
import { CustomViewConst, CustomViewDefinition, CustomViewModel, ViewsEnum } from 'src/app/models/CustomViews';

@Directive()
export abstract class AbstractCustomViewEditor {

    @Input() readonly: boolean;
    @Input() cvDef: CustomViewDefinition;
    @Output() changed: EventEmitter<CustomViewDefinition> = new EventEmitter();

    abstract model: CustomViewModel;

    availableViews: { id: ViewsEnum, translationKey: string }[];
    suggestedView: ViewsEnum;

    constructor() { }

    ngOnInit() {
        this.availableViews = CustomViewConst.modelToViewMap[this.model];
        this.suggestedView = this.availableViews[0].id;
        if (this.cvDef == null) {
            this.initCustomViewDef();
        }
        this.restoreEditor();
    }


    /**
     * Returns true if the required data in the CV def in valid.
     * False otherwise (in such case, an alert informing what's wrong is expected)
     */
    public abstract isDataValid(): boolean;

    /**
     * Initializes an empty CV definition (invoked when the input cvDef is not provided)
     */
    protected abstract initCustomViewDef(): void;

    /**
     * Restore the UI according the CV definition
     */
    protected abstract restoreEditor(): void;

    /**
     * Uses update EventEmitter to propagate the updated CV def to parent component
     */
    protected abstract emitChanges(): void;

}
