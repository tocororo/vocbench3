import { ChangeDetectorRef, Component } from '@angular/core';
import { CustomViewModel, CustomViewVariables } from 'src/app/models/CustomViews';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { AbstractSparqlBasedViewEditor, VariableInfoStruct } from './abstractSparqlBasedViewEditor';

@Component({
    selector: 'area-view-editor',
    templateUrl: "sparqlBasedViewEditor.html",
    host: { class: "vbox" }
})
export class AreaViewEditorComponent extends AbstractSparqlBasedViewEditor {

    model: CustomViewModel = CustomViewModel.area;

    retrieveRequiredReturnVariables: CustomViewVariables[] = [CustomViewVariables.route_id, CustomViewVariables.location, CustomViewVariables.latitude, CustomViewVariables.longitude];
    updateRequiredVariables: CustomViewVariables[] = [CustomViewVariables.location, CustomViewVariables.latitude, CustomViewVariables.longitude];

    retrieveDescrIntro: string = "The retrieve query for this kind of view must return the following variables:";
    retrieveVariablesInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.route_id, descrTranslationKey: "The resource representing the route/perimeter of the area" },
        { id: CustomViewVariables.location, descrTranslationKey: "A resource representing a single point of the area perimeter" },
        { id: CustomViewVariables.latitude, descrTranslationKey: "The latitude of the location. This is supposed to be bound to a literal numeric value (likely an xsd:double)" },
        { id: CustomViewVariables.longitude, descrTranslationKey: "The longitude of the location. This is supposed to be bound to a literal numeric value (likely an xsd:double)" },
    ];
    retrieveQuerySkeleton: string = "SELECT ?route_id ?location ?latitude ?longitude WHERE {\n" +
        "    $resource $trigprop ?route_id .\n" +
        "    ...\n" +
        "}";

    updateDescrIntro: string = "The update query for this kind of view must specify how to update a single location coordinates. " + 
        "This query can use the same variables and placeholders described in the Retrieve one. In particular:";
    updateVariablesInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.route_id, descrTranslationKey: "Will be bound to the resource representing the route/perimeter of the area" },
        { id: CustomViewVariables.location, descrTranslationKey: "Will be bound to the resource representing the updating point" },
        { id: CustomViewVariables.latitude, descrTranslationKey: "Will be bound to the new latitude of the updating point" },
        { id: CustomViewVariables.longitude, descrTranslationKey: "Will be bound to the new longitude of the updating point" },
    ];

    constructor(basicModals: BasicModalServices, changeDetectorRef: ChangeDetectorRef) {
        super(basicModals, changeDetectorRef);
    }

    ngOnInit() {
        super.ngOnInit();
    }

}
