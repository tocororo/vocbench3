import { Component, forwardRef, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { OperationType, TypeUtils } from "../../../models/CustomService";
import { type } from "os";

@Component({
    selector: "type-editor",
    templateUrl: "./operationTypeEditor.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => OperationTypeEditor), multi: true,
    }],
})
export class OperationTypeEditor implements ControlValueAccessor {
    //tells if the type is for parameter, useful for excluding from the selection some types (e.g. AnnotatedValue, void)
    @Input() parameter: boolean;
    //if provided, the current type is argument of the given generics, useful for excluding some types that cannot represents arg
    @Input() generic: string;

    private type: OperationType; //ngModel bound variable

    types: TypeStruct[];
    selectedType: string;

    genericArgsList: ArgStruct[]; //the list of arguments of a generic type (to keep updated each time the selectedType changes)

    ngOnInit() {
        //init the TypeStruct for all the known types
        this.types = TypeStruct.toTypeStructList(TypeUtils.getAllTypes());

        if (this.parameter) { 
            //if the editor represents a parameter, limit the available types to a subset (e.g. void cannot be a method param)
            this.types = TypeStruct.toTypeStructList([
                TypeUtils.Types.boolean,
                TypeUtils.Types.double,
                TypeUtils.Types.float,
                TypeUtils.Types.integer,
                TypeUtils.Types.IRI,
                TypeUtils.Types.List,
                TypeUtils.Types.Literal,
                TypeUtils.Types.long,
                TypeUtils.Types.Map,
                TypeUtils.Types.Resource,
                TypeUtils.Types.short,
                TypeUtils.Types.String,
                TypeUtils.Types.RDFValue
            ]);
        }
        if (this.generic != null) {
            //if the editor represents the arg of a generic, limit the available types to a subset (e.g. void cannot be a generic param)
            let genericArgs: string[] = TypeUtils.getAllowedGenericArgsMap(this.generic);
            //filter further the types list
            this.types = this.types.filter(t => genericArgs.indexOf(t.type) != -1);
        }
    }

    onSelectedTypeChange() {
        //Each time the selected type changes, update the genericArgsList
        let args = TypeUtils.getGenericTypeArgs(this.selectedType);
        if (args != null) {
            this.genericArgsList = [];
            args.forEach(arg => {
                this.genericArgsList.push({ name: arg, arg: null })
            })
        } else {
            this.genericArgsList = null;
        }
        //then propagate changes
        this.buildTypeAndPropagate();
    }

    private buildTypeAndPropagate() {
        let oType: OperationType = {
            name: this.selectedType
        };
        //if the type is generic, handle the arguments
        if (TypeUtils.getGenericTypes().indexOf(this.selectedType) != -1) {
            let args: OperationType[] = [];
            this.genericArgsList.forEach(a => {
                args.push(a.arg);
            })
            oType.typeArguments = args;
        }
        this.type = oType;
        this.propagateChange(this.type);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: OperationType) {
        if (obj) {
            this.type = obj;
            //restore the selected type...
            this.selectedType = this.types.find(t => t.type == this.type.name).type;
            //and in case also the args 
            let args = TypeUtils.getGenericTypeArgs(this.selectedType);
            if (args != null) {
                this.genericArgsList = [];
                args.forEach((arg: string, i: number) => {
                    this.genericArgsList.push({ name: arg, arg: this.type.typeArguments[i] })
                })
            } else {
                this.genericArgsList = null;
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

    //--------------------------------------------------

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };


}

interface ArgStruct {
    name: string;
    arg: OperationType;
}

class TypeStruct {
    type: string;
    show: string;

    static toTypeStructList(types: string[]): TypeStruct[] {
        return types.map(t => TypeStruct.toTypeStruct(t));
    }

    static toTypeStruct(type: string): TypeStruct {
        let show: string;
        if (type.indexOf(".") != -1) {
            show = type.substr(type.lastIndexOf(".")+1);
        } else {
            show = type;
        }
        let args = TypeUtils.getGenericTypeArgs(type);
        if (args != null) {
            show += "<" + args.join(",") +">";
        }
        return { type: type, show: show };
    }
}