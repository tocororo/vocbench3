import { Component, Input } from '@angular/core';
import { ARTURIResource, RDFTypesEnum } from 'src/app/models/ARTResources';
import { AdvSingleValueUpdateMode, AdvSingleValueViewDefinition, CustomViewModel, CustomViewVariables } from 'src/app/models/CustomViews';
import { RDF } from 'src/app/models/Vocabulary';
import { DatatypesServices } from 'src/app/services/datatypesServices';
import { NTriplesUtil, ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';
import { BasicModalServices } from 'src/app/widget/modal/basicModal/basicModalServices';
import { AbstractSparqlBasedViewEditor, VariableInfoStruct } from './abstractSparqlBasedViewEditor';

@Component({
    selector: 'adv-single-value-view-editor',
    templateUrl: "advSingleValueViewEditorComponent.html",
})
export class AdvSingleValueViewEditorComponent extends AbstractSparqlBasedViewEditor {

    @Input() cvDef: AdvSingleValueViewDefinition;

    model: CustomViewModel = CustomViewModel.adv_single_value;

    
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


    updateRequiredVariables: CustomViewVariables[] = [CustomViewVariables.value];
    updateDescrIntro: string = "The update query for this kind of view must specify how to update the value. The value will be selected/entered according the Update mode selected above. " + 
        "This query can use the same variables and placeholders described in the Retrieve one. In particular:";
    updateVariablesInfo: VariableInfoStruct[] = [
        { id: CustomViewVariables.value, descrTranslationKey: "Will be bound to the new value" },
    ];
    updateQuerySkeleton: string = "DELETE { ... }\n" +
        "INSERT { ... }\n" +
        "WHERE { ... }\n";


    updateModes: { id: AdvSingleValueUpdateMode, translationKey: string }[] = [
        { id: AdvSingleValueUpdateMode.none, translationKey: "No update" },
        { id: AdvSingleValueUpdateMode.inline, translationKey: "Inline edit (NT format)" },
        { id: AdvSingleValueUpdateMode.picker, translationKey: "Value picker" },
    ]
    updateMode: AdvSingleValueUpdateMode = AdvSingleValueUpdateMode.none;

    valueTypes: { id: RDFTypesEnum, translationKey: string }[] = [
        { id: null, translationKey: "Any" },
        { id: RDFTypesEnum.resource, translationKey: "Resource" },
        { id: RDFTypesEnum.literal, translationKey: "Literal" },
    ];
    valueType: RDFTypesEnum.resource | RDFTypesEnum.literal;

    pickerClasses: ARTURIResource[] = []; //classes of picker, in case user wants restrict value selection

    datatypes: ARTURIResource[];
    restrictDatatype: boolean;
    datatype: ARTURIResource = RDF.langString;


    constructor(private datatypeService: DatatypesServices, basicModals: BasicModalServices) {
        super(basicModals);
    }

    ngOnInit() {
        super.ngOnInit();

        this.datatypeService.getDatatypes().subscribe(
            datatypes => {
                this.datatypes = datatypes;
                ResourceUtils.sortResources(this.datatypes, SortAttribute.show);
                if (this.datatype) { //in case a datatype was selected, initialize the selection with the same dt from the datatypes list
                    this.datatype = this.datatypes.find(d => d.equals(this.datatype));
                }
            }
        )
    }

    protected initCustomViewDef(): void {
        this.cvDef = {
            retrieve: this.retrieveQuerySkeleton,
            updateMode: this.updateMode,
            suggestedView: this.suggestedView,
        }
    }

    protected initEditor(): void {
        this.retrieveEditor.query = this.cvDef.retrieve;
        this.suggestedView = this.cvDef.suggestedView;
        this.updateMode = this.cvDef.updateMode;
        if (this.updateMode != AdvSingleValueUpdateMode.none) {
            this.updateEditor.query = this.cvDef.update;
            this.valueType = this.cvDef.valueType;
            if (this.valueType == RDFTypesEnum.resource) {
                this.pickerClasses = this.cvDef.classes ? this.cvDef.classes.map(c => NTriplesUtil.parseURI(c)) : null;
            } else if (this.valueType == RDFTypesEnum.literal && this.cvDef.datatype) {
                this.restrictDatatype = true;
                this.datatype = NTriplesUtil.parseURI(this.cvDef.datatype);
            }
        }
        this.refreshYasguiEditors();
    }

    onPickerClassesChanged(classes: ARTURIResource[]) {
        this.pickerClasses = classes;
        this.emitChanges();
    }

    emitChanges(): void {
        this.cvDef.retrieve = this.retrieveEditor.query;
        this.cvDef.suggestedView = this.suggestedView;
        this.cvDef.updateMode = this.updateMode;
        if (this.updateMode != AdvSingleValueUpdateMode.none) {
            this.cvDef.update = this.updateEditor.query;
            if (this.updateMode == AdvSingleValueUpdateMode.picker) { //if value is specified through a picker, provide restrictions
                this.cvDef.valueType = this.valueType;
                this.cvDef.classes = this.valueType == RDFTypesEnum.resource ? this.pickerClasses.map(c => c.toNT()) : null;
                this.cvDef.datatype = this.valueType == RDFTypesEnum.literal ? this.datatype.toNT() : null;
            }
        }
        this.changed.emit(this.cvDef);
    }

    public isDataValid(): boolean {
        //true if retrieve info are ok and update is disabled or its data are ok
        return this.isRetrieveOk() && (!this.updateMode || this.isUpdateOk());
    }

}