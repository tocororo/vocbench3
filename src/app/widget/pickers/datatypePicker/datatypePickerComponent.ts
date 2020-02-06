import { Component, forwardRef, Input, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ARTURIResource } from '../../../models/ARTResources';
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
    private allDatatypes: ARTURIResource[]; //list of all datatypes defined
    private datatypeList: ARTURIResource[]; //list of datatypes that the user can pick (could be all datatypes, or a subset restricted by allowedDatatypes)
    private datatype: ARTURIResource; //default datatype if it is not provided as ngModel

    constructor(private datatypeService: DatatypesServices) { }

    ngOnInit() {
        if (this.size == "xs" || this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.selectClass += this.size;
        } else {
            this.selectClass += "sm";
        }
        //initialize all the available datatypes
        this.datatypeService.getDatatypes().subscribe(
            datatypes => {
                datatypes.sort((dt1: ARTURIResource, dt2: ARTURIResource) => {
                    return dt1.getShow().localeCompare(dt2.getShow());
                });
                this.allDatatypes = datatypes;
                this.initSelectableDatatypes();
            }
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['allowedDatatypes']) {
            if (this.allDatatypes != null) { //ensure that the list of all datatypes has been already initialized
                this.initSelectableDatatypes();
            }
        }
    }

    /**
     * Initializes the datatypeList, namely those datatypes that the user can pick:
     * they could be all datatypes, or a subset restricted according by allowedDatatypes
     */
    private initSelectableDatatypes() {
        if (this.allowedDatatypes == null || this.allowedDatatypes.length == 0) { //datatypes not filtered => take them all
            this.datatypeList = this.allDatatypes.slice();
        } else {
            this.datatypeList = [];
            this.allDatatypes.forEach(dt => {
                if (ResourceUtils.containsNode(this.allowedDatatypes, dt)) { //if datatype is allowed => add to datatypeList
                    this.datatypeList.push(dt);
                }
            });        
        }
        if (this.datatype != null) { //initialize the datatype with the value in input
            this.datatype = this.datatypeList.find(dt => dt.equals(this.datatype));
            setTimeout(() => {
                this.propagateChange(this.datatype);
            });
        }
    }

    onDatatypeChange() {
        this.propagateChange(this.datatype);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: ARTURIResource) {
        if (this.datatypeList != null) { //if the datatype list is initialized, find in the list the datatype in input 
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