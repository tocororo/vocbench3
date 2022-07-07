import { ChangeDetectorRef, Component, Input, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CustomFormPickerModal } from 'src/app/customForms/editors/customFormPickerModal';
import { CustomForm } from 'src/app/models/CustomForms';
import { CustomViewModel, CustomViewVariables, CvQueryUtils, CvSparqlEditorStruct, DynamicVectorViewDefinition, UpdateInfo, UpdateMode } from 'src/app/models/CustomViews';
import { QueryChangedEvent, QueryMode } from 'src/app/models/Sparql';
import { CustomViewsServices } from 'src/app/services/customViewsServices';
import { YasguiComponent } from 'src/app/sparql/yasguiComponent';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalOptions, ModalType, TranslationUtils } from 'src/app/widget/modal/Modals';
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
    @ViewChildren(SingleValueEditor) singleValueEditors: QueryList<SingleValueEditor>;

    model: CustomViewModel = CustomViewModel.dynamic_vector;

    activeMainTab: SparqlTabEnum = "retrieve";

    retrieveRequiredPlaceholders: CustomViewVariables[] = [CustomViewVariables.resource, CustomViewVariables.trigprop];
    retrievePlaceholdersInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.resource, descrTranslationKey: "represents the resource being described in ResourceView where the Custom View is shown" },
        { id: CustomViewVariables.trigprop, descrTranslationKey: "represents the predicate that will be associated to the Custom View" },
    ];

    retrieveEditor: CvSparqlEditorStruct = { mode: QueryMode.query, query: "", valid: true };
    retrieveFields: string[] = []; //list of ?SOMETHING_value matched values

    retrieveQuerySkeleton: string = "SELECT ?field_value ?obj WHERE {\n" +
        "    $resource $trigprop ?obj .\n" +
        "    ...\n" +
        "}";

    updateRequiredVariables: CustomViewVariables[] = [CustomViewVariables.value];

    updateDescrIntro: string = "An update query for this kind of view must specify how to update a single value for the current field. The value will be selected/entered according the Update mode selected above.<br/>" +
        "This query can use the same variables and placeholders described in the Retrieve one. In particular:";
    updateVariablesInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.value, descrTranslationKey: "Will be bound to the new value" },
    ];
    updateQueryInfo: string;

    updateTabs: UpdateTabStruct[] = [];
    activeUpdateTab: UpdateTabStruct;

    constructor(private customViewService: CustomViewsServices, private basicModals: BasicModalServices, private modalService: NgbModal, 
        private translateService: TranslateService, private changeDetectorRef: ChangeDetectorRef) {
        super();
    }

    ngOnInit() {
        super.ngOnInit();
        this.updateQueryInfo = this.updateDescrIntro +
            "<ul>" +
            this.updateVariablesInfo.map(v => "<li><code>?" + v.id + "</code>: " + v.descrTranslationKey + "</li>") +
            "</ul>" +
            "It is possible to refer to any <code>$pivot</code> placeholder eventually defined into the Retrieve query.<br/>" +
            "It is strongly recommended to use a dedicated placeholder <code>$oldValue</code> for referencing to the old value to be edited. " +
            "Such placeholder will be bound to the edited value during an edit operation.";
    }

    ngAfterViewInit() {
        this.refreshYasguiEditors();
    }

    initCustomViewDef() {
        this.cvDef = {
            retrieve: this.retrieveQuerySkeleton,
            update: [],
            suggestedView: this.suggestedView,
        };
    }

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
        });
        this.activeUpdateTab = this.updateTabs[0];
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
        this.retrieveFields = CvQueryUtils.listFieldVariables(this.retrieveEditor.query);
    }

    suggestFromCF() {
        const modalRef: NgbModalRef = this.modalService.open(CustomFormPickerModal, new ModalOptions());
        modalRef.componentInstance.title = TranslationUtils.getTranslatedText({ key: "ACTIONS.SELECT_CUSTOM_FORM" }, this.translateService);
        modalRef.result.then(
            (cf: CustomForm) => {
                this.customViewService.suggestDynamicVectorCVFromCustomForm(cf.getId()).subscribe(
                    query => {
                        this.retrieveEditor.query = query;
                        this.refreshYasguiEditors();
                    }
                );
            },
            () => {}
        );
    }


    // ========== UPDATE TABS =========

    private initUpdateEditors() {
        if (this.updateTabs.length != 0) { //update editors were already initialized before
            //check if all the editors initialized before has a field which is still valid
            for (let i = this.updateTabs.length - 1; i >= 0; i--) {
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
            });
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
        this.changeDetectorRef.detectChanges();
        this.emitChanges();
    }

    isAnyUpdateError(): boolean {
        //check if there is a tab which the single value editor is providing an update procedure with an invalid query 
        return this.updateTabs.some(t => {
            if (t.singleValueData != null) {
                return t.singleValueData.updateMode != UpdateMode.none && !t.singleValueData.updateData.valid;
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
            };
            if (updateValue.updateMode != UpdateMode.none) {
                updateValue.updateQuery = t.singleValueData.updateData.query;
                updateValue.valueType = t.singleValueData.valueType;
                updateValue.classes = t.singleValueData.classes;
                updateValue.datatype = t.singleValueData.datatype;
            }
            update.push(updateValue);
        });
        this.cvDef.update = update;
        this.changed.emit(this.cvDef);
    }

    public isDataValid(): boolean {
        return this.isRetrieveOk() && this.isUpdateOk();
    }

    private isRetrieveOk(): boolean {
        //- syntactic check
        if (!this.retrieveEditor.valid) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "CUSTOM_VIEWS.MESSAGES.RETRIEVE_QUERY_SYNTAX_ERROR" }, ModalType.warning);
            return false;
        }
        let retrieveQuery = this.retrieveEditor.query;
        //- fields: select must returns at least a <field>_value variable
        if (this.retrieveFields.length == 0) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "CUSTOM_VIEWS.MESSAGES.NO_FIELD_VARIABLE_IN_RETRIEVE" }, ModalType.warning);
            return false;
        }
        //- object: select must returns the object of the $resource $trigprop ?obj triple
        if (CvQueryUtils.getReturnedObjectVariable(retrieveQuery) == null) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "CUSTOM_VIEWS.MESSAGES.OBJ_VAR_NOT_DETECTED" }, ModalType.warning);
            return false;
        }
        //- placeholders
        for (let v of this.retrieveRequiredPlaceholders) {
            if (!CvQueryUtils.isPlaceholderInWhere(retrieveQuery, v)) {
                this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "CUSTOM_VIEWS.MESSAGES.MISSING_REQUIRED_PLACEHOLDER", params: { ph: v } }, ModalType.warning);
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
                    this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "CUSTOM_VIEWS.MESSAGES.FIELD_UPDATE_QUERY_SINTAX_ERROR", params: { field: t.field } }, ModalType.warning);
                    return false;
                }
                if (t.singleValueData.updateData.mode == QueryMode.query) {
                    this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "CUSTOM_VIEWS.MESSAGES.FIELD_UPDATE_QUERY_INVALID_TYPE", params: { field: t.field } }, ModalType.warning);
                    return false;
                }
                //variables
                for (let v of this.updateRequiredVariables) {
                    if (!CvQueryUtils.isVariableUsed(t.singleValueData.updateData.query, "?" + v)) {
                        this.basicModals.alert({ key: "STATUS.ERROR" }, { key: "CUSTOM_VIEWS.MESSAGES.FIELD_UPDATE_QUERY_MISSING_VAR", params: { field: t.field, var: v } }, ModalType.warning);
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
        this.changeDetectorRef.detectChanges(); //wait yasgui to be initialized the first time
        this.yasguiEditor.forceContentUpdate();
        this.singleValueEditors.forEach(e => e.refreshYasguiEditor());
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