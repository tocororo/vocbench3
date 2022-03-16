import { Component, Input, ViewChild } from '@angular/core';
import { RDFTypesEnum } from 'src/app/models/ARTResources';
import { AdvSingleValueViewDefinition, CustomViewModel, CustomViewVariables, ValueUpdateMode } from 'src/app/models/CustomViews';
import { QueryChangedEvent, QueryMode } from 'src/app/models/Sparql';
import { YasguiComponent } from 'src/app/sparql/yasguiComponent';
import { AbstractCustomViewEditor } from './abstractCustomViewEditor';
import { VariableInfoStruct } from './abstractSparqlBasedViewEditor';
import { SingleValueEditor, SingleValueUpdateEnhanced } from './singleValueEditor';

@Component({
    selector: 'adv-single-value-view-editor',
    templateUrl: "advSingleValueViewEditorComponent.html",
    host: { class: "vbox" }
})
export class AdvSingleValueViewEditorComponent extends AbstractCustomViewEditor {

    @Input() cvDef: AdvSingleValueViewDefinition;

    @ViewChild(SingleValueEditor) singleValueEditor: SingleValueEditor;
    @ViewChild('retrieveYasgui', { static: false }) retrieveYasgui: YasguiComponent;

    model: CustomViewModel = CustomViewModel.adv_single_value;

    activeTab: SparqlTabEnum = "retrieve";

    retrieveEditor: SparqlEditorStruct = { mode: QueryMode.query, query: "", valid: true };

    retrieveRequiredReturnVariables: CustomViewVariables[] = [CustomViewVariables.value];
    retrieveDescrIntro: string = "The retrieve query for this kind of view must return the following variables:"
    retrieveVariablesInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.value, descrTranslationKey: "The value to be represented" },
        { id: CustomViewVariables.show, descrTranslationKey: "(Optional) Specifies how the value has to be shown" },
    ];
    retrieveQuerySkeleton: string = "SELECT ?value WHERE {\n" +
        "    $resource $trigprop ?obj .\n" +
        "    ...\n" +
        "}";

    retrievePlaceholdersInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.resource, descrTranslationKey: "represents the resource being described in ResourceView where the Custom View is shown" },
        { id: CustomViewVariables.trigprop, descrTranslationKey: "represents the predicate that will be associated to the Custom View" },
    ];


    updateRequiredVariables: CustomViewVariables[] = [CustomViewVariables.value];
    updateDescrIntro: string = "The update query for this kind of view must specify how to update the value. The value will be selected/entered according the Update mode selected above. " + 
        "This query can use the same variables and placeholders described in the Retrieve one. In particular:";
    updateVariablesInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.value, descrTranslationKey: "Will be bound to the new value" },
    ];
    updateQuerySkeleton: string = "DELETE { ... }\n" +
        "INSERT { ... }\n" +
        "WHERE { ... }\n";

    singleValueData: SingleValueUpdateEnhanced = {
        updateMode: ValueUpdateMode.none,
    };

    updateQueryInfo: string;

    constructor() {
        super();
    }

    ngOnInit() {
        super.ngOnInit();
        this.updateQueryInfo = this.updateDescrIntro +
            "<ul>" + 
            this.updateVariablesInfo.map(v => "<li><code>" + v.id + "</code>: " + v.descrTranslationKey + "</li>") + 
            "</ul>";
    }

    protected initCustomViewDef(): void {
        this.cvDef = {
            retrieve: this.retrieveQuerySkeleton,
            update: { 
                field: "value",
                updateMode: this.singleValueData.updateMode
            },
            suggestedView: this.suggestedView,
        }
    }

    protected restoreEditor(): void {
        this.retrieveEditor.query = this.cvDef.retrieve;
        this.suggestedView = this.cvDef.suggestedView;
        this.singleValueData = {
            updateMode: this.cvDef.update.updateMode,
            updateData: { query: this.cvDef.update.updateQuery, mode: QueryMode.update, valid: true },
            valueType: this.cvDef.update.valueType,
            classes: this.cvDef.update.classes,
            datatype: this.cvDef.update.datatype,
        }
        this.refreshYasguiEditors();
    }

    // switchTab(tabId: 'retrieve' | 'update'): void {
    //     super.switchTab(tabId);
    //     setTimeout(() => {
    //         this.singleValueEditor.refreshYasguiEditor();
    //     });
    // }
    switchTab(tabId: SparqlTabEnum) {
        this.activeTab = tabId;
        this.refreshYasguiEditors();
    }

    onRetrieveChanged(event: QueryChangedEvent) {
        this.retrieveEditor.query = event.query;
        this.retrieveEditor.mode = event.mode;
        this.retrieveEditor.valid = event.valid;
        this.emitChanges();
    }

    onSingleValueDataChanged(data: SingleValueUpdateEnhanced) {
        this.singleValueData = data;
        this.emitChanges();
    }

    private refreshYasguiEditors() {
        setTimeout(() => {
            this.retrieveYasgui.forceContentUpdate();
            this.singleValueEditor.refreshYasguiEditor();
        });
    }

    emitChanges(): void {
        this.cvDef.retrieve = this.retrieveEditor.query;
        this.cvDef.suggestedView = this.suggestedView;
        // this.cvDef.updateMode = this.singleValueData.updateMode;
        // if (this.singleValueData.updateMode != ValueUpdateMode.none) {
        //     this.cvDef.update = this.singleValueData.updateData.query;
        //     if (this.singleValueData.updateMode == ValueUpdateMode.picker) { //if value is specified through a picker, provide restrictions
        //         this.cvDef.valueType = this.singleValueData.valueType;
        //         this.cvDef.classes = this.singleValueData.valueType == RDFTypesEnum.resource ? this.singleValueData.classes : null;
        //         this.cvDef.datatype = this.singleValueData.valueType == RDFTypesEnum.literal ? this.singleValueData.datatype : null;
        //     }
        // }
        this.cvDef.update = { 
            field: "value", 
            updateMode: this.singleValueData.updateMode
        };
        if (this.singleValueData.updateMode != ValueUpdateMode.none) {
            this.cvDef.update.updateQuery = this.singleValueData.updateData.query;
            if (this.singleValueData.updateMode == ValueUpdateMode.picker) { //if value is specified through a picker, provide restrictions
                this.cvDef.update.valueType = this.singleValueData.valueType;
                this.cvDef.update.classes = this.singleValueData.valueType == RDFTypesEnum.resource ? this.singleValueData.classes : null;
                this.cvDef.update.datatype = this.singleValueData.valueType == RDFTypesEnum.literal ? this.singleValueData.datatype : null;
            }
        }
        this.changed.emit(this.cvDef);
    }

    public isDataValid(): boolean {
        //TODO put validation stuff from abstract sparql editor to a common utils class
        /* Here I can call:
        - for retrieve: a method in such utils class
        - for update: a public method in the single-value-editor which in turn uses the method in the util class
        */ 
        //true if retrieve info are ok and update is disabled or its data are ok
        // return this.isRetrieveOk() && (!this.updateMode || this.isUpdateOk());
        return true;
    }

}

type SparqlTabEnum = "retrieve" | "update";

interface SparqlEditorStruct {
    query: string;
    mode: QueryMode;
    valid: boolean;
}