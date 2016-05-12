import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTURIResource} from '../../../../utils/ARTResources';
import {PropertyTreeComponent} from '../../../../property/propertyTree/propertyTreeComponent';

export class PropertyTreeModalData extends BSModalContext {
    /**
     * @param resource optional, if provided the returned propertyTree contains 
     * just the properties that have as domain the type of the resource 
     */
    constructor(
        public title: string = 'Modal Title',
        public resource: ARTURIResource
    ) {
        super()
    }
}

@Component({
    selector: "class-tree-modal",
    templateUrl: "app/src/widget/modal/browsingModal/propertyTreeModal/propertyTreeModal.html",
    directives: [PropertyTreeComponent]
})
export class PropertyTreeModal implements ModalComponent<PropertyTreeModalData> {
    context: PropertyTreeModalData;
    
    private selectedProperty;
    private domainRes: ARTURIResource;
    
    constructor(public dialog: DialogRef<PropertyTreeModalData>) {
        this.context = dialog.context;
    }
    
    ngOnInit() {
        document.getElementById("toFocus").focus();
        this.domainRes = this.context.resource;
    }
    
    private onPropertySelected(property: ARTURIResource) {
        this.selectedProperty = property;
    }
    
    /**
     * When the checkbox "select all properties" changes status
     * Resets the selectedProperty and update the domainRes that represents 
     * the resource which its type should be the domain of the properties in the tree
     */
    private onCheckboxChange(checked: boolean) {
        this.selectedProperty = null;
        if (checked) {
            this.domainRes = null;
        } else {
            this.domainRes = this.context.resource;
        }
    }

    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.selectedProperty);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}