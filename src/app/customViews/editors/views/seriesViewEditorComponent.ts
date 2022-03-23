import { Component } from '@angular/core';
import { CustomViewModel, CustomViewVariables } from 'src/app/models/CustomViews';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { AbstractSparqlBasedViewEditor, VariableInfoStruct } from './abstractSparqlBasedViewEditor';

@Component({
    selector: 'series-view-editor',
    templateUrl: "sparqlBasedViewEditor.html",
    host: { class: "vbox" }
})
export class SeriesViewEditorComponent extends AbstractSparqlBasedViewEditor {

    model: CustomViewModel = CustomViewModel.series;

    retrieveRequiredReturnVariables: CustomViewVariables[] = [CustomViewVariables.series_id, CustomViewVariables.name, CustomViewVariables.value];
    updateRequiredVariables: CustomViewVariables[] = [CustomViewVariables.name, CustomViewVariables.value];

    retrieveDescrIntro: string = "The retrieve query for this kind of view must return the following variables:"
    retrieveVariablesInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.series_id, descrTranslationKey: "The resource representing the series" },
        { id: CustomViewVariables.series_label, descrTranslationKey: "(optional) Where admitted, this value is used for identifying the X axis in the chart" },
        { id: CustomViewVariables.value_label, descrTranslationKey: "(optional) Where admitted, this value is used for identifying the Y axis in the chart" },
        { id: CustomViewVariables.name, descrTranslationKey: "Name of a single value" },
        { id: CustomViewVariables.value, descrTranslationKey: "Value to be represented on the chart. This is supposed to be bound to a literal numeric value" },
    ];
    retrieveQuerySkeleton: string = "SELECT ?series_id ?series_label ?value_label ?name ?value WHERE {\n" +
        "    $resource $trigprop ?series_id .\n" +
        "    ...\n" +
        "}";

    updateDescrIntro: string = "The update query for this kind of view must specify how to update a single value. " +
        "This query can use the same variables and placeholders described in the Retrieve one. In particular:";
    updateVariablesInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.series_id, descrTranslationKey: "Will be bound to the resource representing the series" },
        { id: CustomViewVariables.name, descrTranslationKey: "Will be bound to the resource representing the name of the updating value" },
        { id: CustomViewVariables.value, descrTranslationKey: "Will be bound to the new value" },
    ];
    updateQuerySkeleton: string = "DELETE { ... }\n" +
        "INSERT { ... }\n" +
        "WHERE { ... }\n";

    constructor(basicModals: BasicModalServices) {
        super(basicModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

}
