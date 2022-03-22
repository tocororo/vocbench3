import { Directive, Input, ViewChild } from '@angular/core';
import { CustomViewVariables, CvQueryUtils, CvSparqlEditorStruct, SparqlBasedCustomViewDefinition } from 'src/app/models/CustomViews';
import { QueryChangedEvent, QueryMode } from 'src/app/models/Sparql';
import { YasguiComponent } from 'src/app/sparql/yasguiComponent';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { ModalType } from 'src/app/widget/modal/Modals';
import { AbstractCustomViewEditor } from './abstractCustomViewEditor';

/**
 * Base component for the custom views with model based on sparql for both retrieve and update actions, namely:
 * - Geospatial
 *  - point
 *  - area
 *  - route
 * - Statistical series
 *  - series
 *  - series-collection
 */
@Directive()
export abstract class AbstractSparqlBasedViewEditor extends AbstractCustomViewEditor {

    @Input() cvDef: SparqlBasedCustomViewDefinition;
    @ViewChild('retrieveYasgui', { static: false }) retrieveYasgui: YasguiComponent;
    @ViewChild('updateYasgui', { static: false }) updateYasgui: YasguiComponent;

    activeTab: SparqlTabEnum = "retrieve";

    retrieveEditor: CvSparqlEditorStruct = { mode: QueryMode.query, query: "", valid: true };

    abstract retrieveRequiredReturnVariables: CustomViewVariables[];
    abstract retrieveDescrIntro: string;
    abstract retrieveVariablesInfo: VariableInfoStruct[];
    abstract retrieveQuerySkeleton: string;

    updateEditor: CvSparqlEditorStruct = { mode: QueryMode.update, query: "", valid: true };

    abstract updateRequiredVariables: CustomViewVariables[];
    abstract updateDescrIntro: string;
    abstract updateVariablesInfo: VariableInfoStruct[];
    abstract updateQuerySkeleton: string;

    retrieveRequiredPlaceholders: CustomViewVariables[] = [CustomViewVariables.resource, CustomViewVariables.trigprop];
    retrievePlaceholdersInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.resource, descrTranslationKey: "represents the resource being described in ResourceView where the Custom View is shown" },
        { id: CustomViewVariables.trigprop, descrTranslationKey: "represents the predicate that will be associated to the Custom View" },
    ];

    protected basicModals: BasicModalServices;
    constructor(basicModals: BasicModalServices) {
        super();
        this.basicModals = basicModals;
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngAfterViewInit() {
        this.refreshYasguiEditors();
    }

    protected initCustomViewDef(): void {
        this.cvDef = {
            retrieve: this.retrieveQuerySkeleton,
            update: this.updateQuerySkeleton,
            suggestedView: this.suggestedView,
        }
    }

    protected restoreEditor(): void {
        this.retrieveEditor.query = this.cvDef.retrieve;
        this.updateEditor.query = this.cvDef.update ? this.cvDef.update : "";
        this.suggestedView = this.cvDef.suggestedView;
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

    onUpdateChanged(event: QueryChangedEvent) {
        this.updateEditor.query = event.query;
        this.updateEditor.mode = event.mode;
        this.updateEditor.valid = event.valid;
        this.emitChanges();
    }

    emitChanges() {
        this.cvDef.retrieve = this.retrieveEditor.query;
        this.cvDef.update = this.updateEditor.query;
        this.cvDef.suggestedView = this.suggestedView;
        this.changed.emit(this.cvDef);
    }

    public isDataValid(): boolean {
        //note if isRetrieveOk return false, isUpdateOk is not executed, so it grants that no multiple error message are shown
        return this.isRetrieveOk() && this.isUpdateOk();
    }

    protected isRetrieveOk(): boolean {
        //- syntactic check
        if (!this.retrieveEditor.valid) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, "Retrieve query contains syntactic error(s)", ModalType.warning);
            return false;
        }
        //- variables
        let retrieveQuery = this.retrieveEditor.query;
        let select = CvQueryUtils.getSelectReturnStatement(retrieveQuery);
        for (let v of this.retrieveRequiredReturnVariables) {
            if (!select.includes("?" + v + " ")) {
                this.basicModals.alert({ key: "STATUS.ERROR" }, "Required variable ?" + v + " missing in Retrieve query.", ModalType.warning);
                return false;
            }
        }
        //- placeholders
        let where = CvQueryUtils.getSelectWhereBlock(retrieveQuery);
        for (let v of this.retrieveRequiredPlaceholders) {
            if (!where.includes("$" + v + " ")) {
                this.basicModals.alert({ key: "STATUS.ERROR" }, "Required placeholder $" + v + " missing in Retrieve query.", ModalType.warning);
                return false;
            }    
        }
        return true;
    }

    protected isUpdateOk(): boolean {
        if (this.updateEditor.query == null || this.updateEditor.query.trim() == "") return true; //if not provided, just return true/valid
        //- syntactic check
        if (!this.updateEditor.valid) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, "Update query contains syntactic error(s)", ModalType.warning);
            return false;
        }
        if (this.updateEditor.mode == QueryMode.query) {
            this.basicModals.alert({ key: "STATUS.ERROR" }, "Update query cannot be a select/construct/ask query", ModalType.warning);
            return false;
        }
        // - variables
        let updateQuery = this.updateEditor.query;
        for (let v of this.updateRequiredVariables) {
            if (!updateQuery.includes("?" + v + " ")) {
                this.basicModals.alert({ key: "STATUS.ERROR" }, "Unable to find variable ?" + v + "in Update query.", ModalType.warning);
                return false;
            }
        }
        return true;
    }

    /**
     * This method forces content update of yasgui editor, so that valid attributes is updated by queryChanged event,
     * moreover forces the editor to refresh preventing strange UI issues with yasgui editor (left part of the textarea is covered by a gray vertical stripe)
     */
    protected refreshYasguiEditors() {
        if (this.retrieveYasgui && this.retrieveEditor.query != null) {
            setTimeout(() => { //prevent ExpressionChangedAfterItHasBeenCheckedError
                this.retrieveYasgui.forceContentUpdate();
            })
        }
        if (this.updateYasgui && this.updateEditor.query != null) {
            setTimeout(() => { //prevent ExpressionChangedAfterItHasBeenCheckedError
                this.updateYasgui.forceContentUpdate();
            })
        }
    }

}

type SparqlTabEnum = "retrieve" | "update";

export interface VariableInfoStruct {
    id: CustomViewVariables;
    descrTranslationKey: string;
}