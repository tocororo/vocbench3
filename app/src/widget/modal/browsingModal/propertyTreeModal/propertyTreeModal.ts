import {Component} from "angular2/core";
import {ICustomModal, ICustomModalComponent, ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {ARTURIResource} from '../../../../utils/ARTResources';
import {PropertyTreeComponent} from '../../../../property/propertyTree/propertyTreeComponent';

export class PropertyTreeModalContent {
    public title: string = 'Modal Title';
    public resource: ARTURIResource;
    /**
     * @param resource optional, if provided the returned propertyTree contains 
     * just the properties that have as domain the type of the resource 
     */
    constructor(title: string, resource?: ARTURIResource) {
        this.title = title;
        this.resource = resource;
    }
}

@Component({
    selector: "class-tree-modal",
    templateUrl: "app/src/widget/modal/browsingModal/propertyTreeModal/propertyTreeModal.html",
    directives: [PropertyTreeComponent]
})
export class PropertyTreeModal implements ICustomModalComponent {
    
    private selectedProperty;
    private domainRes: ARTURIResource;
    
    dialog: ModalDialogInstance;
    context: PropertyTreeModalContent;

    constructor(dialog: ModalDialogInstance, modelContentData: ICustomModal) {
        this.dialog = dialog;
        this.context = <PropertyTreeModalContent>modelContentData;
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