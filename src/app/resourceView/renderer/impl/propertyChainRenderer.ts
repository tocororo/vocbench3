import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTNode, ARTResource, ARTURIResource } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";
import { OWL } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { PropertyListCreatorModalReturnData } from "../../resViewModals/propertyChainCreatorModal";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "property-chain-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class PropertyChainRenderer extends PartitionRenderSingleRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.subPropertyChains;
    rootProperty: ARTURIResource = OWL.propertyChainAxiom;
    label = "Property chain axioms";
    addBtnImgTitle = "Add a property chain axion";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/prop_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.resViewModals.createPropertyChain("Create a property chain", predicate, propChangeable).then(
            (data: PropertyListCreatorModalReturnData) => {
                let prop: ARTURIResource = data.property;
                let chain: string[] = data.chain;
                this.propService.addPropertyChainAxiom(<ARTURIResource>this.resource, chain.join(","), prop).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }

    //not used since this partition doesn't allow manual add operation
    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(true);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => {
                this.update.emit(null);
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.propService.removePropertyChainAxiom(<ARTURIResource>this.resource, <ARTResource>object, predicate);
    }

}