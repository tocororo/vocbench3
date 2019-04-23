import { Component, forwardRef, Input, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ARTURIResource } from '../../../models/ARTResources';
import { XmlSchema } from '../../../models/Vocabulary';
import { DatatypesServices } from '../../../services/datatypesServices';
import { ResourceUtils } from '../../../utils/ResourceUtils';

@Component({
    selector: 'datatype-picker',
    templateUrl: './datatypePickerComponent.html',
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatatypePickerComponent), multi: true,
    }]
})
export class DatatypePickerComponent implements ControlValueAccessor {

    @Input() size: string = "sm";
    @Input() disabled: boolean = false;
    @Input() readonly: boolean = false;
    @Input() allowedDatatypes: ARTURIResource[]; //list of allowed datatypes. If null allows all datatypes

    private selectClass: string = "form-control input-";
    private datatypeList: ARTURIResource[];
    private datatype: ARTURIResource = XmlSchema.string; //default datatype if it is not provided as ngModel

    constructor(private datatypeService: DatatypesServices) { }

    ngOnInit() {
        if (this.size == "xs" || this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.selectClass += this.size;
        } else {
            this.selectClass += "sm";
        }
        //check needed in order to avoid that, if allowedDatatypes is provided, the datatype list is initialized twice: one here, one in ngOnChanges
        if (this.datatypeList == null) { 
            this.initDatatypes();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['allowedDatatypes']) {
            this.initDatatypes();
        }
    }

    private initDatatypes() {
        this.datatypeList = [];
        this.datatypeService.getDatatypes().subscribe(
            datatypes => {
                if (this.allowedDatatypes == null || this.allowedDatatypes.length == 0) { //datatypes not filtered => take them all
                    this.datatypeList = datatypes;
                } else {
                    datatypes.forEach(dt => {
                        if (ResourceUtils.containsNode(this.allowedDatatypes, dt)) {
                            this.datatypeList.push(dt);
                        }
                    });        
                }
                if (this.datatype != null) { //initialize the datatype with the value in input
                    this.datatype = this.datatypeList.find(dt => dt.equals(this.datatype));
                    this.propagateChange(this.datatype);
                }
            }
        );
    }

    onDatatypeChange() {
        this.propagateChange(this.datatype);
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: ARTURIResource) {
        if (this.datatypeList.length > 0) { //if the datatype list is initialized, find in the list the datatype in input 
            this.datatype = this.datatypeList.find(dt => dt.equals(obj));
        } else { //if the datatype is not inizialized, store the input datatype, it will be set once the initialization is complete
            if (obj != null) {
                this.datatype = obj;
            }
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

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

    //--------------------------------------------------

}