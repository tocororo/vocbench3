import { Component, EventEmitter, Input, Output, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ARTURIResource, RDFTypesEnum } from 'src/app/models/ARTResources';
import { ValueUpdateMode } from 'src/app/models/CustomViews';
import { QueryChangedEvent, QueryMode } from 'src/app/models/Sparql';
import { RDF } from 'src/app/models/Vocabulary';
import { YasguiComponent } from 'src/app/sparql/yasguiComponent';
import { NTriplesUtil } from 'src/app/utils/ResourceUtils';
import { DatatypeCacheService } from './datatypeCacheService';

@Component({
    selector: 'single-value-editor',
    templateUrl: "singleValueEditor.html",
    host: { class: "vbox" }
})
export class SingleValueEditor {

    @Input() data: SingleValueUpdateEnhanced;
    @Input() queryInfo: string;
    @Output() dataChange: EventEmitter<SingleValueUpdateEnhanced> = new EventEmitter();

    @ViewChild(YasguiComponent, { static: false }) yasguiEditor: YasguiComponent;

    queryInfoSafe: SafeHtml;

    updateModes: { id: ValueUpdateMode, translationKey: string }[] = [
        { id: ValueUpdateMode.none, translationKey: "No update" },
        { id: ValueUpdateMode.inline, translationKey: "Inline edit (NT format)" },
        { id: ValueUpdateMode.picker, translationKey: "Value picker" },
    ]
    updateMode: ValueUpdateMode = ValueUpdateMode.none;

    queryEditor: SparqlQueryData = { mode: QueryMode.update, query: "", valid: true };

    valueTypes: { id: RDFTypesEnum.literal | RDFTypesEnum.resource, translationKey: string }[] = [
        { id: null, translationKey: "Any" },
        { id: RDFTypesEnum.resource, translationKey: "Resource" },
        { id: RDFTypesEnum.literal, translationKey: "Literal" },
    ];
    valueType: RDFTypesEnum.literal | RDFTypesEnum.resource = this.valueTypes[0].id;

    pickerClasses: ARTURIResource[] = []; //classes of picker, in case user wants restrict value selection

    datatypes: ARTURIResource[];
    restrictDatatype: boolean;
    datatype: ARTURIResource = RDF.langString;


    constructor(private datatypeCache: DatatypeCacheService, private sanitizer: DomSanitizer) {
    }

    ngOnInit() {
        if (this.data) {
            this.updateMode = this.data.updateMode;
            if (this.updateMode != ValueUpdateMode.none) {
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

        console.log("init single-value-editor", this.data)
        this.datatypeCache.getDatatypes().subscribe(
            datatypes => {
                this.datatypes = datatypes;
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
        let emittedData: SingleValueUpdateEnhanced = {
            updateMode: this.updateMode
        }
        if (this.updateMode != ValueUpdateMode.none) {
            emittedData.updateData = this.queryEditor;
            if (this.updateMode == ValueUpdateMode.picker) { //if value is specified through a picker, provide restrictions
                emittedData.valueType = this.valueType;
                emittedData.classes = this.valueType == RDFTypesEnum.resource ? this.pickerClasses.map(c => c.toNT()) : null;
                emittedData.datatype = this.valueType == RDFTypesEnum.literal ? this.datatype.toNT() : null;
            }
        }
        this.dataChange.emit(emittedData)
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

//extends SingleValueUpdate with updateData (containing further info like valid and mode) instead of the simple query (string)
export interface SingleValueUpdateEnhanced {
    updateMode: ValueUpdateMode; //tells if and how the new value can be edited/chosen (through a resource picker or with edit inline)
    updateData?: SparqlQueryData;
    valueType?: RDFTypesEnum.resource | RDFTypesEnum.literal;
    datatype?: string; //NT IRI representation
    classes?: string[]; //NT IRI representation
}