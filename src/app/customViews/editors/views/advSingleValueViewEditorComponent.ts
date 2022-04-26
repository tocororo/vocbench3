import { Component, Input, ViewChild } from '@angular/core';
import { RDFTypesEnum } from 'src/app/models/ARTResources';
import { AdvSingleValueViewDefinition, CustomViewModel, CustomViewVariables, CvQueryUtils, CvSparqlEditorStruct, UpdateMode } from 'src/app/models/CustomViews';
import { QueryChangedEvent, QueryMode } from 'src/app/models/Sparql';
import { YasguiComponent } from 'src/app/sparql/yasguiComponent';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';
import { AbstractCustomViewEditor } from './abstractCustomViewEditor';
import { VariableInfoStruct } from './abstractSparqlBasedViewEditor';
import { SingleValueEditor, UpdateInfoEnhanced } from './singleValueEditor';

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

    retrieveEditor: CvSparqlEditorStruct = { mode: QueryMode.query, query: "", valid: true };

    retrieveRequiredReturnVariables: CustomViewVariables[] = [CustomViewVariables.value];
    retrieveDescrIntro: string = "The retrieve query for this kind of view must return the following variables:";
    retrieveVariablesInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.value, descrTranslationKey: "The value to be represented" },
        // { id: CustomViewVariables.show, descrTranslationKey: "(Optional) Specifies how the value has to be shown" },
    ];
    retrieveQuerySkeleton: string = "SELECT ?value ?obj WHERE {\n" +
        "    $resource $trigprop ?obj .\n" +
        "    ...\n" +
        "}";

    retrieveRequiredPlaceholders: CustomViewVariables[] = [CustomViewVariables.resource, CustomViewVariables.trigprop];
    retrievePlaceholdersInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.resource, descrTranslationKey: "represents the resource being described in ResourceView where the Custom View is shown" },
        { id: CustomViewVariables.trigprop, descrTranslationKey: "represents the predicate that will be associated to the Custom View" },
    ];


    updateRequiredVariables: CustomViewVariables[] = [CustomViewVariables.value];

    updateDescrIntro: string = "The update query for this kind of view must specify how to update the value. The value will be selected/entered according the Update mode selected above.<br/>" + 
        "This query can use the same variables and placeholders described in the Retrieve one. In particular:";
    updateVariablesInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.value, descrTranslationKey: "Will be bound to the new value" },
    ];
    updateQueryInfo: string;

    updateQuerySkeleton: string = "DELETE { ... }\n" +
        "INSERT { ... }\n" +
        "WHERE { ... }\n";

    singleValueData: UpdateInfoEnhanced = {
        updateMode: UpdateMode.none,
    };

    

    constructor(private basicModals: BasicModalServices) {
        super();
    }

    ngOnInit() {
        super.ngOnInit();
        this.updateQueryInfo = this.updateDescrIntro +
            "<ul>" + 
            this.updateVariablesInfo.map(v => "<li><code>?" + v.id + "</code>: " + v.descrTranslationKey + "</li>") + 
            "</ul>" + 
            "It is possible to refer to any <code>$pivot</code> placeholder eventually defined into the Retrieve query.<br/>" + 
            "It is strongly recommended to use a dedicated placeholder <code>$oldValue</code> for referencing to the old value to be edited." + 
            "Such placeholder will be bound to the edited value during an edit operation.";
    }

    protected initCustomViewDef(): void {
        this.cvDef = {
            retrieve: this.retrieveQuerySkeleton,
            update: { 
                field: "value",
                updateMode: this.singleValueData.updateMode
            },
            suggestedView: this.suggestedView,
        };
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
        };
        this.refreshYasguiEditors();
    }

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

    onSingleValueDataChanged(data: UpdateInfoEnhanced) {
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
        this.cvDef.update = { 
            field: "value", 
            updateMode: this.singleValueData.updateMode
        };
        if (this.singleValueData.updateMode != UpdateMode.none) {
            this.cvDef.update.updateQuery = this.singleValueData.updateData.query;
            if (this.singleValueData.updateMode == UpdateMode.picker) { //if value is specified through a picker, provide restrictions
                this.cvDef.update.valueType = this.singleValueData.valueType;
                this.cvDef.update.classes = this.singleValueData.valueType == RDFTypesEnum.resource ? this.singleValueData.classes : null;
                this.cvDef.update.datatype = this.singleValueData.valueType == RDFTypesEnum.literal ? this.singleValueData.datatype : null;
            }
        }
        this.changed.emit(this.cvDef);
    }

    public isDataValid(): boolean {
        return this.isRetrieveOk() && this.isUpdateOk();
    }

    private isRetrieveOk(): boolean {
        //- syntactic check
        if (!this.retrieveEditor.valid) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, "Retrieve query contains syntactic error(s)", ModalType.warning);
            return false;
        }
        //- variables
        let retrieveQuery = this.retrieveEditor.query;
        for (let v of this.retrieveRequiredReturnVariables) {
            if (!CvQueryUtils.isVariableReturned(retrieveQuery, "?" + v)) {
                this.basicModals.alert({ key: "STATUS.ERROR" }, "Required variable ?" + v + " missing in Retrieve query.", ModalType.warning);
                return false;
            }
        }
        //- object: select must returns the object of the $resource $trigprop ?obj triple
        if (CvQueryUtils.getReturnedObjectVariable(retrieveQuery) == null) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, "Object variable of pair $resource $trigprop either not detected or not returned in Retrieve query", ModalType.warning);
            return false;
        }
        //- placeholders
        for (let v of this.retrieveRequiredPlaceholders) {
            if (!CvQueryUtils.isPlaceholderInWhere(retrieveQuery, v)) {
                this.basicModals.alert({ key: "STATUS.ERROR" }, "Required placeholder $" + v + " missing in Retrieve query.", ModalType.warning);
                return false;
            }    
        }
        return true;
    }

    private isUpdateOk(): boolean {
        if (this.singleValueData.updateMode != UpdateMode.none) { //only if update is provided, do the checks on query
            //semantic check
            if (this.singleValueData.updateData.mode == QueryMode.query) {
                this.basicModals.alert({ key: "STATUS.ERROR" }, "Update query cannot be a select/construct/ask query", ModalType.warning);
                return false;
            }
            //syntactic check
            if (!this.singleValueData.updateData.valid) {
                this.basicModals.alert({ key: "STATUS.ERROR" }, "Update query contains syntactic error(s)", ModalType.warning);
                return false;
            }
            for (let v of this.updateRequiredVariables) {
                if (!CvQueryUtils.isVariableUsed(this.singleValueData.updateData.query, "?" + v)) {
                    this.basicModals.alert({ key: "STATUS.ERROR" }, "Unable to find variable ?" + v + "in Update query.", ModalType.warning);
                    return false;
                }
            }
        }
        return true;
    }


}

type SparqlTabEnum = "retrieve" | "update";