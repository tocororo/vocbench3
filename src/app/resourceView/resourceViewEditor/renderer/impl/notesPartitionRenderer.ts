import { Component } from "@angular/core";
import { from, Observable, of } from "rxjs";
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource } from "../../../../models/ARTResources";
import { CustomFormValue } from "../../../../models/CustomForms";
import { Language } from "../../../../models/LanguagesCountries";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { SkosServices } from "../../../../services/skosServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiActionFunction } from "../multipleActionHelper";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "notes-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class NotesPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.notes;
    addBtnImgTitle = "Add a note";
    addBtnImgSrc = "./assets/images/icons/actions/annotationProperty_create.png";

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private skosService: SkosServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add(predicate: ARTURIResource) {
        this.enrichProperty(predicate);
    }

    getPredicateToEnrich(): Observable<ARTURIResource> {
        return from(
            this.browsingModals.browsePropertyTree("Select a property", [this.rootProperty]).then(
                selectedProp => {
                    return selectedProp;
                },
                () => { return null }
            )
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(true); //notes accept all kinds of values
    }


    private copyLocaleHandler(predicate: ARTURIResource, eventData: { value: ARTNode, locales: Language[] }) {
        let addFunctions: MultiActionFunction[] = [];
        //this function is the handler of an event invoked in notes only when the value is a plain literal, so the cast is safe
        let value: ARTLiteral = <ARTLiteral>eventData.value;
        eventData.locales.forEach(l => {
            let note: ARTLiteral = new ARTLiteral(value.getValue(), null, l.tag);
            addFunctions.push({ 
                function: this.getAddPartitionAware(<ARTURIResource>this.resource, predicate, note), 
                value: note 
            });
        })
        this.addMultiple(addFunctions);
    }

    //@Override
    getAddPartitionAware(resource: ARTResource, predicate: ARTURIResource, value: ARTNode | CustomFormValue): Observable<void> {
        return this.skosService.addNote(resource, predicate, value);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunctionImpl(predicate, object).subscribe(
            () => this.update.emit(null)
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.skosService.removeNote(this.resource, predicate, object);
    }

}