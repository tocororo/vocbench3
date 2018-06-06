import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTBNode, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute, ResourceUtils } from '../../models/ARTResources';
import { VBContext } from "../../utils/VBContext";
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
        public propChangeable: boolean = true,
        public chain?: ARTBNode //if provided, the dialog works in edit mode
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
    private enrichingProperty: ARTURIResource;

    private selectedTreeProperty: ARTURIResource;
    private inverseProp: boolean = false;

    private propChain: PropertyChainItem[] = []
    private selectedChainProperty: PropertyChainItem;

    private readonly inversePrefix: string = "INVERSE ";

    constructor(public dialog: DialogRef<PropertyChainCreatorModalData>, private browsingModals: BrowsingModalServices, 
        private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.rootProperty = this.context.property;
        this.enrichingProperty = this.rootProperty;

        if (this.context.chain != null) { //edit mode
            let chainMembers: ARTResource[] = this.context.chain.getAdditionalProperty(ResAttribute.MEMBERS);
            chainMembers.forEach(chainMember => {
                let property: ARTResource;
                let inverse: boolean = false;
                if (chainMember.getShow().startsWith(this.inversePrefix)) {
                    inverse = true;
                    let propShow = chainMember.getShow().substring(this.inversePrefix.length);
                    if (ResourceUtils.isQName(propShow, VBContext.getPrefixMappings())) {
                        property = ResourceUtils.parseQName(propShow, VBContext.getPrefixMappings());
                    } else {
                        property = ResourceUtils.parseURI(propShow);
                    }
                    property.setShow(this.inversePrefix + propShow);
                    property.setRole(RDFResourceRolesEnum.objectProperty);
                } else {
                    property = chainMember;
                }
                this.propChain.push({ property: property, inverse: inverse });
            });
        }
    }

    private changeProperty() {
        this.browsingModals.browsePropertyTree("Select a property", [this.rootProperty]).then(
            (selectedProp: any) => {
                if (this.enrichingProperty.getURI() != selectedProp.getURI()) {
                    this.enrichingProperty = selectedProp;
                }
            },
            () => { }
        );
    }

    private onPropertySelected(property: ARTURIResource) {
        this.selectedTreeProperty = property;
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
        let propToAdd: ARTURIResource = this.selectedTreeProperty.clone();
        if (this.inverseProp) {
            propToAdd.setShow(this.inversePrefix + propToAdd.getShow());
        }
        this.propChain.push({ property: propToAdd, inverse: this.inverseProp });
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
        if (this.propChain.length < 2) {
            this.basicModals.alert("Invalid property chain", "The property chain must contain at least of two properties", "warning");
            return;
        }

        event.stopPropagation();
        event.preventDefault();

        let chain: string[] = [];
        this.propChain.forEach(item => {
            if (item.inverse) {
                chain.push(this.inversePrefix + item.property.toNT());
            } else {
                chain.push(item.property.toNT());
            }
        });

        let returnData: PropertyListCreatorModalReturnData = {
            property: this.enrichingProperty,
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
    property: ARTResource;
    inverse: boolean;
}