import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource, RDFResourceRolesEnum } from '../../models/ARTResources';
import { PropertyServices } from "../../services/propertyServices";
import { VBProperties } from '../../utils/VBProperties';
import { BasicModalServices } from '../../widget/modal/basicModal/basicModalServices';
import { BrowsingModalServices } from '../../widget/modal/browsingModal/browsingModalServices';

export class PropertyChainCreatorModalData extends BSModalContext {
    /**
     * @param title title of the dialog
     * @param property root property that the modal should allow to enrich
     * @param propChangeable tells whether the input property can be changed exploring the properties subtree.
     */
    constructor(
        public title: string = 'Create a property chain',
        public property: ARTURIResource,
        public propChangeable: boolean = true
    ) {
        super();
    }
}

@Component({
    selector: "property-chain-creator-modal",
    templateUrl: "./propertyChainCreatorModal.html",
})
export class PropertyChainCreatorModal implements ModalComponent<PropertyChainCreatorModalData> {
    context: PropertyChainCreatorModalData;

    private rootProperty: ARTURIResource; //root property of the partition that invoked this modal
    private selectedProperty: ARTURIResource;

    private inverseProp: boolean = false;

    private propChain: PropertyChainItem[] = []
    private selectedChainProperty: PropertyChainItem;

    constructor(public dialog: DialogRef<PropertyChainCreatorModalData>, private propService: PropertyServices, 
        private browsingModals: BrowsingModalServices, private basicModals: BasicModalServices, private preferences: VBProperties) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.rootProperty = this.context.property;
        this.selectedProperty = this.rootProperty;
    }

    private changeProperty() {
        this.browsingModals.browsePropertyTree("Select a property", [this.rootProperty]).then(
            (selectedProp: any) => {
                if (this.selectedProperty.getURI() != selectedProp.getURI()) {
                    this.selectedProperty = selectedProp;
                }
            },
            () => { }
        );
    }

    private onPropertySelected(property: ARTURIResource) {
        this.selectedProperty = property;
        if (property.getRole() != RDFResourceRolesEnum.objectProperty) {
            this.inverseProp = false;
        }
    }

    private onChainPropertySelected(propChainItem: PropertyChainItem) {
        if (this.selectedChainProperty == propChainItem) {
            this.selectedChainProperty = null;
        } else {
            this.selectedChainProperty = propChainItem;
        }
    }

    private addPropertyToChain() {
        //add only if not already in
        let alreadyIn: boolean = false;
        this.propChain.forEach(propChainItem => {
            if (propChainItem.property.getURI() == this.selectedProperty.getURI()) {
                alreadyIn = true;
            }
        });
        if (!alreadyIn) {
            let propToAdd: ARTURIResource = this.selectedProperty.clone();
            if (this.inverseProp) {
                propToAdd.setShow("INVERSE " + propToAdd.getShow());
            }
            this.propChain.push({ property: propToAdd, inverse: this.inverseProp });
        }
    }

    private removePropertyFromChain() {
        this.propChain.splice(this.propChain.indexOf(this.selectedChainProperty), 1);
        this.selectedChainProperty = null;
    }

    private moveDown() {
        var prevIndex = this.propChain.indexOf(this.selectedChainProperty);
        this.propChain.splice(prevIndex, 1); //remove from current position
        this.propChain.splice(prevIndex + 1, 0, this.selectedChainProperty);
    }
    private moveUp() {
        var prevIndex = this.propChain.indexOf(this.selectedChainProperty);
        this.propChain.splice(prevIndex, 1); //remove from current position
        this.propChain.splice(prevIndex - 1, 0, this.selectedChainProperty);
    }
    private isSelectedPropFirst(): boolean {
        return (this.selectedChainProperty == this.propChain[0]);
    }
    private isSelectedPropLast(): boolean {
        return (this.selectedChainProperty == this.propChain[this.propChain.length - 1]);
    }

    /**
     * User can click on OK button just if there is a manchester expression (in case property allows and user choose to add it)
     * or if there is a resource selected in the tree
     */
    private isOkEnabled() {
        return this.propChain.length > 0;
    }

    ok(event: Event) {
        event.stopPropagation();
        event.preventDefault();

        let chain: string[] = [];
        this.propChain.forEach(item => {
            if (item.inverse) {
                chain.push("INVERSE " + item.property.toNT());
            } else {
                chain.push(item.property.toNT());
            }
        })

        let returnData: PropertyListCreatorModalReturnData = {
            property: this.selectedProperty,
            chain: chain
        }
        this.dialog.close(returnData);
    }

    cancel() {
        this.dialog.dismiss();
    }

}

export class PropertyListCreatorModalReturnData {
    property: ARTURIResource;
    chain: string[]; //array of property IRI with optionally leading "INVERSE "
}

class PropertyChainItem {
    property: ARTURIResource;
    inverse: boolean;
}