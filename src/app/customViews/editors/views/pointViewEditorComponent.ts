import { Component } from '@angular/core';
import { CustomViewModel, CustomViewVariables } from 'src/app/models/CustomViews';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { AbstractSparqlBasedViewEditor, VariableInfoStruct } from './abstractSparqlBasedViewEditor';

@Component({
    selector: 'point-view-editor',
    templateUrl: "sparqlBasedViewEditor.html",
    host: { class: "vbox" }
})
export class PointViewEditorComponent extends AbstractSparqlBasedViewEditor {

    model: CustomViewModel = CustomViewModel.point;

    retrieveRequiredReturnVariables: CustomViewVariables[] = [CustomViewVariables.location, CustomViewVariables.latitude, CustomViewVariables.longitude];
    retrieveDescrIntro: string = "The retrieve query for this kind of view must return the following variables:";
    retrieveVariablesInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.location, descrTranslationKey: "The resource representing the point" },
        { id: CustomViewVariables.latitude, descrTranslationKey: "The latitude of the location. This is supposed to be bound to a literal numeric value (likely an xsd:double)" },
        { id: CustomViewVariables.longitude, descrTranslationKey: "The longitude of the location. This is supposed to be bound to a literal numeric value (likely an xsd:double)" },
    ];
    retrieveQuerySkeleton: string = "SELECT ?location ?latitude ?longitude WHERE {\n" +
        "    $resource $trigprop ?location .\n" +
        "    ...\n" +
        "}";


    updateRequiredVariables: CustomViewVariables[] = [CustomViewVariables.location, CustomViewVariables.latitude, CustomViewVariables.longitude];
    updateDescrIntro: string = "The update query for this kind of view must specify how to update the location coordinates. " +
        "This query can use the same variables and placeholders described in the Retrieve one. In particular:";
    updateVariablesInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.location, descrTranslationKey: "Will be bound to the resource representing the point" },
        { id: CustomViewVariables.latitude, descrTranslationKey: "Will be bound to the new latitude" },
        { id: CustomViewVariables.longitude, descrTranslationKey: "Will be bound to the new longitude" },
    ];

    constructor(basicModals: BasicModalServices) {
        super(basicModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

}
