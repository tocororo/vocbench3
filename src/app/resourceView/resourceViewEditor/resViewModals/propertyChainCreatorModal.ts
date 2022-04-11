import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTBNode, ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from '../../../models/ARTResources';
import { NTriplesUtil, ResourceUtils } from "../../../utils/ResourceUtils";
import { UIUtils } from "../../../utils/UIUtils";
import { VBContext } from "../../../utils/VBContext";
import { BasicModalServices } from '../../../widget/modal/basicModal/basicModalServices';
import { BrowsingModalServices } from '../../../widget/modal/browsingModal/browsingModalServices';

@Component({
    selector: "property-chain-creator-modal",
    templateUrl: "./propertyChainCreatorModal.html",
})
export class PropertyChainCreatorModal {
    @Input() title: string = 'Create a property chain';
    @Input() property: ARTURIResource;
    @Input() propChangeable: boolean = true;
    @Input() chain: ARTBNode; //if provided, the dialog works in edit mode

    private rootProperty: ARTURIResource; //root property of the partition that invoked this modal
    enrichingProperty: ARTURIResource;

    selectedTreeProperty: ARTURIResource;
    inverseProp: boolean = false;

    propChain: PropertyChainItem[] = [];
    selectedChainProperty: PropertyChainItem;

    private readonly inversePrefix: string = "INVERSE ";

    constructor(public activeModal: NgbActiveModal, private elementRef: ElementRef,
        private browsingModals: BrowsingModalServices, private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        this.rootProperty = this.property;
        this.enrichingProperty = this.rootProperty;

        if (this.chain != null) { //edit mode
            let chainMembers: ARTResource[] = this.chain.getAdditionalProperty(ResAttribute.MEMBERS);
            chainMembers.forEach(chainMember => {
                let property: ARTResource;
                let inverse: boolean = false;
                if (chainMember.getShow().startsWith(this.inversePrefix)) {
                    inverse = true;
                    let propShow = chainMember.getShow().substring(this.inversePrefix.length);
                    if (ResourceUtils.isQName(propShow, VBContext.getPrefixMappings())) {
                        property = ResourceUtils.parseQName(propShow, VBContext.getPrefixMappings());
                    } else {
                        property = NTriplesUtil.parseURI(propShow);
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

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    changeProperty() {
        this.browsingModals.browsePropertyTree({ key: "DATA.ACTIONS.SELECT_PROPERTY" }, [this.rootProperty]).then(
            (selectedProp: any) => {
                if (this.enrichingProperty.getURI() != selectedProp.getURI()) {
                    this.enrichingProperty = selectedProp;
                }
            },
            () => { }
        );
    }

    onPropertySelected(property: ARTURIResource) {
        this.selectedTreeProperty = property;
        if (property != null && property.getRole() != RDFResourceRolesEnum.objectProperty) {
            this.inverseProp = false;
        }
    }

    onChainPropertySelected(propChainItem: PropertyChainItem) {
        if (this.selectedChainProperty == propChainItem) {
            this.selectedChainProperty = null;
        } else {
            this.selectedChainProperty = propChainItem;
        }
    }

    addPropertyToChain() {
        let propToAdd: ARTURIResource = this.selectedTreeProperty.clone();
        if (this.inverseProp) {
            propToAdd.setShow(this.inversePrefix + propToAdd.getShow());
        }
        this.propChain.push({ property: propToAdd, inverse: this.inverseProp });
    }

    removePropertyFromChain() {
        this.propChain.splice(this.propChain.indexOf(this.selectedChainProperty), 1);
        this.selectedChainProperty = null;
    }

    moveDown() {
        let prevIndex = this.propChain.indexOf(this.selectedChainProperty);
        this.propChain.splice(prevIndex, 1); //remove from current position
        this.propChain.splice(prevIndex + 1, 0, this.selectedChainProperty);
    }
    moveUp() {
        let prevIndex = this.propChain.indexOf(this.selectedChainProperty);
        this.propChain.splice(prevIndex, 1); //remove from current position
        this.propChain.splice(prevIndex - 1, 0, this.selectedChainProperty);
    }
    isSelectedPropFirst(): boolean {
        return (this.selectedChainProperty == this.propChain[0]);
    }
    isSelectedPropLast(): boolean {
        return (this.selectedChainProperty == this.propChain[this.propChain.length - 1]);
    }

    /**
     * User can click on OK button just if there is a manchester expression (in case property allows and user choose to add it)
     * or if there is a resource selected in the tree
     */
    isOkEnabled() {
        return this.propChain.length > 0;
    }

    ok() {
        if (this.propChain.length < 2) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "MESSAGES.PROPERTY_CHAIN_NEEDS_AT_LEAST_TWO_PROPS" }, ModalType.warning);
            return;
        }

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
        };
        this.activeModal.close(returnData);
    }

    cancel() {
        this.activeModal.dismiss();
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