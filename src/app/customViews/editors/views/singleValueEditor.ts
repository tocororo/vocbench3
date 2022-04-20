import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ARTURIResource, RDFTypesEnum } from 'src/app/models/ARTResources';
import { UpdateMode } from 'src/app/models/CustomViews';
import { QueryChangedEvent, QueryMode } from 'src/app/models/Sparql';
import { RDF } from 'src/app/models/Vocabulary';
import { DatatypesServices } from 'src/app/services/datatypesServices';
import { YasguiComponent } from 'src/app/sparql/yasguiComponent';
import { NTriplesUtil, ResourceUtils, SortAttribute } from 'src/app/utils/ResourceUtils';

@Component({
    selector: 'single-value-editor',
    templateUrl: "singleValueEditor.html",
    host: { class: "vbox" }
})
export class SingleValueEditor {

    @Input() data: UpdateInfoEnhanced;
    @Input() queryInfo: string;
    @Output() dataChange: EventEmitter<UpdateInfoEnhanced> = new EventEmitter();

    @ViewChild(YasguiComponent, { static: false }) yasguiEditor: YasguiComponent;

    queryInfoSafe: SafeHtml;

    updateModes: { id: UpdateMode, translationKey: string }[] = [
        { id: UpdateMode.none, translationKey: "CUSTOM_VIEWS.UPDATE_MODES.NO_UPDATE" },
        { id: UpdateMode.inline, translationKey: "CUSTOM_VIEWS.UPDATE_MODES.VALUE_EDIT" },
        { id: UpdateMode.picker, translationKey: "CUSTOM_VIEWS.UPDATE_MODES.VALUE_PICKER" },
    ];
    updateMode: UpdateMode = UpdateMode.none;

    queryEditor: SparqlQueryData = { mode: QueryMode.update, query: "", valid: true };

    valueTypes: { id: RDFTypesEnum.literal | RDFTypesEnum.resource, translationKey: string }[] = [
        { id: null, translationKey: "COMMONS.ANY" },
        { id: RDFTypesEnum.resource, translationKey: "MODELS.RESOURCE.RESOURCE" },
        { id: RDFTypesEnum.literal, translationKey: "MODELS.RESOURCE.LITERAL" },
    ];
    valueType: RDFTypesEnum.literal | RDFTypesEnum.resource = this.valueTypes[0].id;

    pickerClasses: ARTURIResource[] = []; //classes of picker, in case user wants restrict value selection

    datatypes: ARTURIResource[];
    restrictDatatype: boolean;
    datatype: ARTURIResource = RDF.langString;


    constructor(private datatypeService: DatatypesServices, private sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        if (this.data) {
            this.updateMode = this.data.updateMode;
            if (this.updateMode != UpdateMode.none) {
                this.queryEditor = this.data.updateData;
                this.valueType = this.data.valueType;
                if (this.valueType == RDFTypesEnum.resource) {
                    this.pickerClasses = this.data.classes ? this.data.classes.map(c => NTriplesUtil.parseURI(c)) : null;
                } else if (this.valueType == RDFTypesEnum.literal && this.data.datatype) {
                    this.restrictDatatype = true;
                    this.datatype = NTriplesUtil.parseURI(this.data.datatype);
                }
                this.refreshYasguiEditor();
            }
        } else {
            this.data = { updateMode: this.updateMode };
            this.emitChanges();
        }

        this.datatypeService.getDatatypes().subscribe(
            datatypes => {
                this.datatypes = datatypes;
                ResourceUtils.sortResources(this.datatypes, SortAttribute.show);
                if (this.datatype != null) {
                    this.datatype = this.datatypes.find(d => d.equals(this.datatype));
                }
            }
        );

        if (this.queryInfo) {
            this.queryInfoSafe = this.sanitizer.bypassSecurityTrustHtml(this.queryInfo);
        }
    }

    onQueryChanged(event: QueryChangedEvent) {
        this.queryEditor.query = event.query;
        this.queryEditor.mode = event.mode;
        this.queryEditor.valid = event.valid;
        this.emitChanges();
    }

    onPickerClassesChanged(classes: ARTURIResource[]) {
        this.pickerClasses = classes;
        this.emitChanges();
    }

    emitChanges(): void {
        let emittedData: UpdateInfoEnhanced = {
            updateMode: this.updateMode
        };
        if (this.updateMode != UpdateMode.none) {
            emittedData.updateData = this.queryEditor;
            if (this.updateMode == UpdateMode.picker) { //if value is specified through a picker, provide restrictions
                emittedData.valueType = this.valueType;
                emittedData.classes = this.valueType == RDFTypesEnum.resource ? this.pickerClasses.map(c => c.toNT()) : null;
                emittedData.datatype = this.valueType == RDFTypesEnum.literal ? this.datatype.toNT() : null;
            }
        }
        this.dataChange.emit(emittedData);
    }

    public refreshYasguiEditor() {
        if (this.yasguiEditor) {
            setTimeout(() => {
                this.yasguiEditor.forceContentUpdate();
            });
        }
    }

}

export interface SparqlQueryData {
    query: string;
    mode: QueryMode;
    valid: boolean;
}

//extends UpdateInfo with updateData (containing further info like valid and mode) instead of the simple query (string)
export interface UpdateInfoEnhanced {
    updateMode: UpdateMode; //tells if and how the new value can be edited/chosen (through a resource picker or with edit inline)
    updateData?: SparqlQueryData;
    valueType?: RDFTypesEnum.resource | RDFTypesEnum.literal;
    datatype?: string; //NT IRI representation
    classes?: string[]; //NT IRI representation
}