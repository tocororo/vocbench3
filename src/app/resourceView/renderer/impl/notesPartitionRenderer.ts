import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { SkosServices } from "../../../services/skosServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { VBEventHandler } from "../../../utils/VBEventHandler"
import { ARTResource, ARTURIResource, ARTNode, ARTPredicateObjects, ResAttribute, RDFTypesEnum } from "../../../models/ARTResources";
import { CustomFormValue } from "../../../models/CustomForms"
import { SKOS } from "../../../models/Vocabulary"
import { ResViewPartition } from "../../../models/ResourceView";

@Component({
    selector: "notes-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class NotesPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTURIResource> = new EventEmitter<ARTURIResource>();

    partition = ResViewPartition.notes;
    addManuallyAllowed: boolean = false;
    rootProperty: ARTURIResource = SKOS.note;
    label = "Notes";
    addBtnImgTitle = "Add a note";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/propAnnotation_create.png");
    removeBtnImgTitle = "Remove note";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private skosService: SkosServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    add(predicate: ARTURIResource) {
        this.enrichProperty(predicate);
    }

    getPredicateToEnrich(): Observable<ARTURIResource> {
        return Observable.fromPromise(
            this.browsingModals.browsePropertyTree("Select a property", [this.rootProperty]).then(
                selectedProp => {
                    return selectedProp;
                },
                () => { }
            )
        );
    }

    //not used since this partition doesn't allow manual add operation
    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(true);
    }

    //@Override
    addPartitionAware(resource: ARTResource, predicate: ARTURIResource, value: ARTNode | CustomFormValue) {
        this.skosService.addNote(<ARTURIResource>resource, predicate, value).subscribe(
            stResp => this.update.emit()
        );
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => this.update.emit(null)
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.resourcesService.removeValue(this.resource, predicate, object);
    }

}