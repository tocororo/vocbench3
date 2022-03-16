import { Component, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CustomViewModel, CustomViewVariables, DynamicVectorViewDefinition, SingleValueUpdate, ValueUpdateMode } from 'src/app/models/CustomViews';
import { QueryChangedEvent, QueryMode } from 'src/app/models/Sparql';
import { YasguiComponent } from 'src/app/sparql/yasguiComponent';
import { AbstractCustomViewEditor } from './abstractCustomViewEditor';
import { SingleValueEditor, SingleValueUpdateEnhanced } from './singleValueEditor';

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

    retrieveEditor: SparqlEditorStruct = { mode: QueryMode.query, query: "", valid: true };
    retrieveFields: string[] = []; //list of ?SOMETHING_value matched values

    updateTabs: UpdateTabStruct[] = [];
    activeUpdateTab: UpdateTabStruct;

    constructor() {
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
        let select = retrieveQuery.substring(retrieveQuery.toLocaleLowerCase().indexOf("select"), retrieveQuery.toLocaleLowerCase().indexOf("where"));
        
        // let headersRegex: RegExp = /[\?|$](\w+)_value\b/gi;
        let headersRegex: RegExp = /[\?|$]([a-zA-Z0-9_]+)_value\b/gi;
        
        let matchArray: RegExpExecArray;
        while ((matchArray = headersRegex.exec(select)) !== null) {
            this.retrieveFields.push(matchArray[1]); //0 is the whole expression, 1 is the 1st group (any word between ? and _value)
        }
        this.retrieveFields = this.retrieveFields.filter((s, idx, list) => list.indexOf(s) == idx); //remove eventual duplicates
    }


    // ========== UPDATE TABS =========

    private initUpdateEditors() {
        if (this.updateTabs.length != 0) { //update editors were already initialized before
            //check if all the editors initialized before has a field which is still valid
            this.updateTabs.forEach((e, idx, list) => {
                if (!this.retrieveFields.includes(e.field)) { //no field with the one in the current tab => remove tab 
                    list.splice(idx, 1);
                }
            })
            //check if all the fields in the retrieve have a related update tab
            this.retrieveFields.forEach(f => {
                if (!this.updateTabs.some(t => t.field == f)) { //no tab for the current field => init tab
                    this.updateTabs.push({ field: f, singleValueData: null });
                }
            })
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

    onUpdateDataChanged(tab: UpdateTabStruct, data: SingleValueUpdateEnhanced) {
        tab.singleValueData = data;
        setTimeout(() => {
            this.emitChanges();
        });
    }

    isAnyUpdateError(): boolean {
        //check if there is a tab which the single value editor is providing an update procedure with an invalid query 
        return this.updateTabs.some(t => {
            if (t.singleValueData != null) {
                return t.singleValueData.updateMode != ValueUpdateMode.none && !t.singleValueData.updateData.valid
            } else {
                return false;
            }
        });
    }


    emitChanges(): void {
        this.cvDef.suggestedView = this.suggestedView;
        this.cvDef.retrieve = this.retrieveEditor.query;
        let update: SingleValueUpdate[] = [];
        this.updateTabs.forEach(t => {
            let updateValue: SingleValueUpdate = {
                field: t.field,
                updateMode: t.singleValueData.updateMode,
            }
            if (updateValue.updateMode != ValueUpdateMode.none) {
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
        return true; //TODO
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

interface SparqlEditorStruct {
    query: string;
    mode: QueryMode;
    valid: boolean;
}

type SparqlTabEnum = "retrieve" | "update";

export interface VariableInfoStruct {
    id: CustomViewVariables;
    descrTranslationKey: string;
}

interface UpdateTabStruct {
    field: string;
    singleValueData: SingleValueUpdateEnhanced;
    // updateMode: ValueUpdateMode;
    // editor?: SparqlEditorStruct;
    // valueType?: RDFTypesEnum.resource | RDFTypesEnum.literal;
    // datatype?: string;
    // classes?: string[];
}