import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource } from "../../../models/ARTResources";
import { CustomFormValue } from "../../../models/CustomForms";
import { Language } from "../../../models/LanguagesCountries";
import { ResViewPartition } from "../../../models/ResourceView";
import { SKOS } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SkosServices } from "../../../services/skosServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiAddFunction } from "../partitionRenderer";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

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
    addBtnImgSrc = require("../../../../assets/images/icons/actions/annotationProperty_create.png");

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

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(true); //notes accept all kinds of values
    }


    private copyLocaleHandler(predicate: ARTURIResource, eventData: { value: ARTNode, locales: Language[] }) {
        let addFunctions: MultiAddFunction[] = [];
        //this function is the handler of an event invoked in notes only when the value is a plain literal, so the cast is safe
        let value: ARTLiteral = <ARTLiteral>eventData.value;
        eventData.locales.forEach(l => {
            let note: ARTLiteral = new ARTLiteral(value.getValue(), null, l.tag);
            addFunctions.push({ 
                function: this.resourcesService.addValue(<ARTURIResource>this.resource, predicate, note), 
                value: note 
            });
        })
        this.addMultiple(addFunctions);
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