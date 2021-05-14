import { Component, forwardRef } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { MemoizeContext, MemoizeData } from "src/app/models/Sheet2RDF";
import { BasicModalServices } from "src/app/widget/modal/basicModal/basicModalServices";


@Component({
    selector: "memoization-editor",
    templateUrl: "./memoizationEditor.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MemoizationEditor), multi: true,
    }],
})
export class MemoizationEditor {

    memoizeIds: string[];
    memoizeData: MemoizeData;
       
    constructor(private basicModals: BasicModalServices) {}

    ngOnInit() {
        this.memoizeData = new MemoizeData();
        this.memoizeIds = MemoizeContext.idList;
    }

    addMap() {
        this.basicModals.prompt({ key: "SHEET2RDF.HEADER_EDITOR.MEMOIZE_INFO" }, { value: "ID" }, null, null, false, true).then(
            id => {
                if (!this.memoizeIds.includes(id)) {
                    this.memoizeIds.push(id);
                }
                this.memoizeData.id = id;
                this.onModelChange();
            },
            () => {}
        )
    }

    onModelChange() {
        this.propagateChange(this.memoizeData);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
     writeValue(obj: MemoizeData) {
        if (obj) {
            this.memoizeData = obj;
        } else {
            this.memoizeData = new MemoizeData();
        }
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    //--------------------------------------------------

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

}