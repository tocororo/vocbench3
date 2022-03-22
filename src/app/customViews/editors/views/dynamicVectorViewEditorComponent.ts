import { Component, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CustomViewModel, CustomViewVariables, CvQueryUtils, CvSparqlEditorStruct, DynamicVectorViewDefinition, UpdateInfo, UpdateMode } from 'src/app/models/CustomViews';
import { QueryChangedEvent, QueryMode } from 'src/app/models/Sparql';
import { YasguiComponent } from 'src/app/sparql/yasguiComponent';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';
import { AbstractCustomViewEditor } from './abstractCustomViewEditor';
import { SingleValueEditor, UpdateInfoEnhanced } from './singleValueEditor';

@Component({
    selector: 'dynamic-vector-view-editor',
    templateUrl: "dynamicVectorViewEditorComponent.html",
    host: { class: "vbox" }
})
export class DynamicVectorViewEditorComponent extends AbstractCustomViewEditor {

    @Input() cvDef: DynamicVectorViewDefinition;

    @ViewChild(YasguiComponent) yasguiEditor: YasguiComponent;
    @ViewChildren(SingleValueEditor) singleValueEditors: QueryList<SingleValueEditor>

    model: CustomViewModel = CustomViewModel.dynamic_vector;

    activeMainTab: SparqlTabEnum = "retrieve";

    retrieveRequiredPlaceholders: CustomViewVariables[] = [CustomViewVariables.resource, CustomViewVariables.trigprop];
    retrievePlaceholdersInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.resource, descrTranslationKey: "represents the resource being described in ResourceView where the Custom View is shown" },
        { id: CustomViewVariables.trigprop, descrTranslationKey: "represents the predicate that will be associated to the Custom View" },
    ];

    retrieveEditor: CvSparqlEditorStruct = { mode: QueryMode.query, query: "", valid: true };
    retrieveFields: string[] = []; //list of ?SOMETHING_value matched values

    updateRequiredVariables: CustomViewVariables[] = [CustomViewVariables.value];

    updateTabs: UpdateTabStruct[] = [];
    activeUpdateTab: UpdateTabStruct;

    private readonly FIELD_REGEX: RegExp = /[\?|$]([a-zA-Z0-9_]+)_value\b/gi;
    private readonly OBJ_REGEX: RegExp = /\$resource\s*\$trigprop\s*([$|?][a-zA-Z0-9_]+)\s*\./gi;

    constructor(private basicModals: BasicModalServices) {
        super()
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngAfterViewInit() {
        this.refreshYasguiEditors();
    }

    initCustomViewDef() {
        this.cvDef = {
            retrieve: "",
            update: [],
            suggestedView: this.suggestedView,
        }
    };

    restoreEditor() {
        this.retrieveEditor.query = this.cvDef.retrieve;
        this.cvDef.update.forEach(u => {
            let tab: UpdateTabStruct = {
                field: u.field,
                singleValueData: {
                    updateMode: u.updateMode,
                    valueType: u.valueType,
                    updateData: { mode: QueryMode.update, query: u.updateQuery, valid: true },
                    classes: u.classes,
                    datatype: u.datatype
                }
            };
            this.updateTabs.push(tab);
        })
        this.activeUpdateTab = this.updateTabs[0]
        this.suggestedView = this.cvDef.suggestedView;
        this.refreshYasguiEditors();
    }

    switchMainTab(tabId: SparqlTabEnum) {
        this.activeMainTab = tabId;
        if (tabId == 'update') {
            this.initUpdateEditors();
        }
        this.refreshYasguiEditors();
    }

    // ========== RETRIEVE TAB =========

    onRetrieveChanged(event: QueryChangedEvent) {
        this.retrieveEditor.query = event.query;
        this.retrieveEditor.mode = event.mode;
        this.retrieveEditor.valid = event.valid;
        this.emitChanges();
        this.detectFields();
    }

    private detectFields() {
        this.retrieveFields = [];

        let retrieveQuery = this.retrieveEditor.query;
        let select = CvQueryUtils.getSelectReturnStatement(retrieveQuery);

        let queryFragment: string;
        if (select.includes("*")) {
            queryFragment = CvQueryUtils.getSelectWhereBlock(retrieveQuery);
        } else {
            queryFragment = select;
        }
        let matchArray: RegExpExecArray;
        while ((matchArray = this.FIELD_REGEX.exec(queryFragment)) !== null) {
            this.retrieveFields.push(matchArray[1]); //0 is the whole expression, 1 is the 1st group (any word between ? and _value)
        }
        this.retrieveFields = this.retrieveFields.filter((s, idx, list) => list.indexOf(s) == idx); //remove eventual duplicates
    }


    // ========== UPDATE TABS =========

    private initUpdateEditors() {
        if (this.updateTabs.length != 0) { //update editors were already initialized before
            //check if all the editors initialized before has a field which is still valid
            for (let i = this.updateTabs.length-1; i >= 0; i--) {
                let t = this.updateTabs[i];
                if (!this.retrieveFields.includes(t.field)) { //no field with the one in the current tab => remove tab 
                    this.updateTabs.splice(i, 1);
                }
            }
            //check if all the fields in the retrieve have a related update tab
            this.retrieveFields.forEach(f => {
                if (!this.updateTabs.some(t => t.field == f)) { //no tab for the current field => init tab
                    this.updateTabs.push({ field: f, singleValueData: null });
                }
            })
            if (!this.updateTabs.includes(this.activeUpdateTab)) { //previous active tab doesn't exist anymore => active the first tab
                this.activeUpdateTab = this.updateTabs[0];
            }
        } else { //no update editor initialized before
            this.updateTabs = [];
            this.retrieveFields.forEach(f => {
                this.updateTabs.push({ field: f, singleValueData: null });
            });
            this.activeUpdateTab = this.updateTabs[0];
        }
    }

    switchUpdateTab(field: string) {
        this.activeUpdateTab = this.updateTabs.find(t => t.field == field);
        this.refreshYasguiEditors();
    }

    onUpdateDataChanged(tab: UpdateTabStruct, data: UpdateInfoEnhanced) {
        tab.singleValueData = data;
        setTimeout(() => {
            this.emitChanges();
        });
    }

    isAnyUpdateError(): boolean {
        //check if there is a tab which the single value editor is providing an update procedure with an invalid query 
        return this.updateTabs.some(t => {
            if (t.singleValueData != null) {
                return t.singleValueData.updateMode != UpdateMode.none && !t.singleValueData.updateData.valid
            } else {
                return false;
            }
        });
    }


    emitChanges(): void {
        this.cvDef.suggestedView = this.suggestedView;
        this.cvDef.retrieve = this.retrieveEditor.query;
        let update: UpdateInfo[] = [];
        this.updateTabs.forEach(t => {
            let updateValue: UpdateInfo = {
                field: t.field,
                updateMode: t.singleValueData.updateMode,
            }
            if (updateValue.updateMode != UpdateMode.none) {
                updateValue.updateQuery = t.singleValueData.updateData.query;
                updateValue.valueType = t.singleValueData.valueType;
                updateValue.classes = t.singleValueData.classes;
                updateValue.datatype = t.singleValueData.datatype;
            }
            update.push(updateValue);
        })
        this.cvDef.update = update;
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
        let retrieveQuery = this.retrieveEditor.query;
        let select = CvQueryUtils.getSelectReturnStatement(retrieveQuery);
        let where = CvQueryUtils.getSelectWhereBlock(retrieveQuery);
        //- fields: select must returns at least <field>_value variable
        let missingFields: boolean;
        //1) select returns *, look for fields in query
        if (select.includes("*")) {
            missingFields = !this.FIELD_REGEX.test(retrieveQuery); //if regex fails test against all the query, it means that no <field>-value is found
        } else { //2) field returned in select?
            missingFields = !this.FIELD_REGEX.test(select); //if regex fails test against select, it means that no <field>-value is returned
        }
        if (missingFields) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, "No field variable (?<field>_value) returned by Retrieve query", ModalType.warning);
            return false;
        }
        //- object: select must returns the object of the $resource $trigprop ?obj triple
        let matchArray: RegExpExecArray = this.OBJ_REGEX.exec(where);
        console.log("match", matchArray);
        if (matchArray != null) {
            let objVar = matchArray[1];
            console.log("obj", objVar);
            if (!select.includes("*") && !select.includes(objVar)) {
                this.basicModals.alert({ key: "STATUS.ERROR" }, "Object variable " + objVar + ", of pair $resource $trigprop, not returned in Retrieve query", ModalType.warning);
                return false;
            }
        }
        //- placeholders
        for (let v of this.retrieveRequiredPlaceholders) {
            if (!where.includes("$" + v + " ")) {
                this.basicModals.alert({ key: "STATUS.ERROR" }, "Required placeholder $" + v + " missing in Retrieve query.", ModalType.warning);
                return false;
            }    
        }
        return true;
    }

    private isUpdateOk(): boolean {
        //for each tab, check if query (if any) is ok
        for (let t of this.updateTabs) {
            if (t.singleValueData.updateMode != UpdateMode.none) {
                //syntactic check
                if (!t.singleValueData.updateData.valid) {
                    this.basicModals.alert({ key: "STATUS.ERROR" }, "Update query of field " + t.field + " contains syntactic error(s)", ModalType.warning);
                    return false;
                }
                if (t.singleValueData.updateData.mode == QueryMode.query) {
                    this.basicModals.alert({ key: "STATUS.ERROR" }, "Update query of field " + t.field + " cannot be a select/construct/ask query", ModalType.warning);
                    return false;
                }
                //variables
                for (let v of this.updateRequiredVariables) {
                    if (!t.singleValueData.updateData.query.includes("?" + v + " ")) {
                        this.basicModals.alert({ key: "STATUS.ERROR" }, "Unable to find variable ?" + v + " in Update query of field " + t.field, ModalType.warning);
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * This method forces content update of yasgui editor, so that valid attributes is updated by queryChanged event,
     * moreover forces the editor to refresh preventing strange UI issues with yasgui editor (left part of the textarea is covered by a gray vertical stripe)
     */
    private refreshYasguiEditors() {
        setTimeout(() => {
            this.yasguiEditor.forceContentUpdate();
            this.singleValueEditors.forEach(e => e.refreshYasguiEditor());
        });
    }

}

type SparqlTabEnum = "retrieve" | "update";

export interface VariableInfoStruct {
    id: CustomViewVariables;
    descrTranslationKey: string;
}

interface UpdateTabStruct {
    field: string;
    singleValueData: UpdateInfoEnhanced;
}