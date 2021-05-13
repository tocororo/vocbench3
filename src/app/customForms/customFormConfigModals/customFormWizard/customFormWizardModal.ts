import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ARTLiteral, ARTNode, ARTURIResource, RDFResourceRolesEnum } from "src/app/models/ARTResources";
import { Language } from "src/app/models/LanguagesCountries";
import { XmlSchema } from "src/app/models/Vocabulary";
import { DatatypesServices } from "src/app/services/datatypesServices";
import { ConverterConfigStatus } from "src/app/sheet2rdf/s2rdfModals/converterConfig/converterConfigurationComponent";
import { ModalOptions, ModalType } from "src/app/widget/modal/Modals";
import { ConverterContractDescription, RequirementLevels } from "../../../models/Coda";
import { AnnotationName, CustomForm, FormFieldType } from "../../../models/CustomForms";
import { UIUtils } from "../../../utils/UIUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { GraphEntryPointModal } from "./graphEntryPointModal";

@Component({
    selector: "custom-form-wizard-modal",
    templateUrl: "./customFormWizardModal.html",
})
export class CustomFormWizardModal {

    /*
    TODO:
    - dare la possibilità per tutti i field di editare il converter
    - definizione legami tra i field
    - considerare anche i CustomConstructor (quindi con stdForm)
        - entry point non è necessario
        - nella parte graph posso utilizzare 
            - stdForm (solo per progetti skos e skosxl):
                - resource
                - labelLang
                - label //in SKOS
                - xlabel, lexicalForm //in SKOSXL
            - session
                - user
    */

    @Input() formId: string = "FORM_ID";

    //nodes/fields
    fields: WizardField[];
    selectedField: WizardField;

    //selectors options
    constraintTypes: { [key: string]: ConstraintType[] } = { //map the type of the field with the allowed constraint types
        [FormFieldType.literal]: [ConstraintType.Enumeration, ConstraintType.Datatype, ConstraintType.LangString],
        [FormFieldType.uri]: [ConstraintType.Enumeration, ConstraintType.Role, ConstraintType.Range],
    };
    datatypes: ARTURIResource[];
    languages: Language[];

    //graph
    entryPoint: CustomRangeEntryPoint;


    pearl: string;

    constructor(private activeModal: NgbActiveModal, private modalService: NgbModal, private elementRef: ElementRef,
        private datatypeService: DatatypesServices, private basicModals: BasicModalServices) {
    }

    ngOnInit() {
        this.fields = [];
        this.entryPoint = new CustomRangeEntryPoint();
        this.datatypeService.getDatatypes().subscribe(
            datatypes => {
                this.datatypes = datatypes;
            }
        )
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
    }

    /* ====================
    * FIELDS
    * ==================== */

    selectField(field: WizardField) {
        this.selectedField = field;
    }

    addFieldUri() {
        this.fields.push(new WizardFieldUri())
        this.updatePearl()
    }
    addFieldLiteral() {
        this.fields.push(new WizardFieldLiteral())
        this.updatePearl()
    }

    removeField() {
        this.fields.splice(this.fields.indexOf(this.selectedField), 1);
        this.selectedField = null;
        this.updatePearl()
    }

    onCollMinChange() {
        if (this.selectedField.collection.min > this.selectedField.collection.max) {
            this.selectedField.collection.max = this.selectedField.collection.min
        }
        this.updatePearl()
    }
    onCollMaxChange() {
        if (this.selectedField.collection.max < this.selectedField.collection.min) {
            this.selectedField.collection.min = this.selectedField.collection.max
        }
        this.updatePearl()
    }

    /* ====================
    * GRAPH
    * ==================== */

    editEntryPointConverter() {
        const modalRef: NgbModalRef = this.modalService.open(GraphEntryPointModal, new ModalOptions('xl'));
        modalRef.componentInstance.converter = this.entryPoint.converterStatus != null ? this.entryPoint.converterStatus.converter : null;
        modalRef.result.then(
            (data: ConverterConfigStatus) => {
                this.entryPoint.converterStatus = data;
                this.entryPoint.converterSerialization = this.entryPoint.converterStatus.converterDesc.getSerialization(
                    this.entryPoint.converterStatus.signatureDesc);
                this.updatePearl();
            },
            () => {}
        );
    }


    //==========================

    updatePearl() {
        this.pearl =
            "prefix\txsd:\t<" + XmlSchema.namespace + ">\n" +
            "prefix\tcoda:\t<" + ConverterContractDescription.NAMESPACE + ">\n" +
            "\n" +
            "rule it.uniroma2.art.semanticturkey.customform.form." + this.formId + " id:" + this.formId + " {\n";
        this.pearl += "\tnodes = {\n"; //open nodes
        this.pearl += "\t\t" + this.entryPoint.getNodeSerialization() + "\n";
        this.fields.forEach(f => {
            f.getPlaceholderDefinitions().forEach(phDef => {
                if (phDef.annotations != null) {
                    phDef.annotations.forEach(a => {
                        this.pearl += "\t\t" + a + "\n";
                    })
                }
                this.pearl += "\t\t" + phDef.nodeDefinition + " .\n";
            })
        })
        this.pearl += "\t}\n"; //close nodes
        this.pearl += "\tgraph = {\n" //open graph

        // this.pearl += "\t\t//todo\n";
        this.pearl += "\t}\n"; //close graph
        this.pearl += "}"; //close rule
    }

    private checkData(): boolean {
        for (let i = 0; i < this.fields.length; i++) {
            let field = this.fields[i];
            //check on names
            if (field.label.trim() == "") { //invalid name
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field at position " + (i + 1) + " has an invalid name", ModalType.warning);
                return false;
            }
            //look for duplicate
            if (this.fields.filter(f => f.label == field.label).length > 1) { //found more than 1 field with the name of the current one
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Found multiple fields with the same name (" + field.label + ")", ModalType.warning);
                return false;
            }
            //check if all constraints are ok
            if (field.constraint == ConstraintType.Datatype && (<WizardFieldLiteral>field).datatype == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.Datatype, ModalType.warning);
                return false;
            }
            if (field.constraint == ConstraintType.Enumeration && field.enumeration.length == 0) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.Enumeration, ModalType.warning);
                return false;
            }
            if (field.constraint == ConstraintType.LangString) {
                if ((<WizardFieldLiteral>field).languageConstraint.type == LangConstraintType.Fixed && (<WizardFieldLiteral>field).languageConstraint.language == null) {
                    this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.LangString, ModalType.warning);
                    return false;
                }
            }
            if (field.constraint == ConstraintType.Range && (<WizardFieldUri>field).ranges.length == 0) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.Range, ModalType.warning);
                return false;
            }
            if (field.constraint == ConstraintType.Role && (<WizardFieldUri>field).roles.length == 0) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.Role, ModalType.warning);
                return false;
            }
        }
        //check on graph
        if (this.entryPoint.converterStatus != null) {
            if (this.entryPoint.converterStatus.signatureDesc.getRequirementLevels() == RequirementLevels.REQUIRED && this.entryPoint.feature == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Entry point converter require an input feature to be specified", ModalType.warning);
                return false;
            }
        } else { //MEMO: this check only if CF is for CustomRange
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Entry point converter missing", ModalType.warning);
            return false;
        }
        return true;
    }



    ok() {
        if (this.checkData()) {
            this.updatePearl();
            this.activeModal.close(this.pearl);
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}




abstract class WizardField {
    abstract type: FormFieldType;
    label: string = "my_field";
    optional: boolean;

    abstract enumeration: ARTNode[] = [];

    //annotation related
    collection: CollectionConstraint = new CollectionConstraint(); //(annotation @Collection)
    constraint: ConstraintType = null;

    abstract getPlaceholderDefinitions(): PlaceholderDef[];

    protected getAnnotationSerializations(): string[] {
        //the only annotation in commons between uri and literal field is @Collection
        let annotations: string[] = [];
        if (this.collection.enabled) {
            let annotation = "@" + AnnotationName.Collection;
            let min: number = this.collection.minEnabled ? this.collection.min : null;
            let max: number = this.collection.maxEnabled ? this.collection.max : null;
            let annParams: string[] = [];
            if (min != null) {
                annParams.push("min=" + min);
            }
            if (max != null) {
                annParams.push("max=" + max);
            }
            if (annParams.length != 0) {
                annotation += "(" + annParams.join(",") + ")";
            }
            annotations.push(annotation);
        }
        return annotations;
    }
}

class WizardFieldLiteral extends WizardField {
    type: FormFieldType = FormFieldType.literal;
    languageConstraint: LangConstraint = new LangConstraint();
    datatype: ARTURIResource; //ConstraintType.Datatype
    enumeration: ARTLiteral[] = []; //ConstraintType.Enumeration => list of Literal (annotation @DataOneOf)

    getPlaceholderDefinitions(): PlaceholderDef[] {
        let placeholderDefs: PlaceholderDef[] = [];
        //1st: nodeID
        let nodeId: string = this.label + "_node";
        //2nd: converter
        let converter: string = this.type;
        if (this.constraint == ConstraintType.Datatype) {
            let dt: string = this.datatype != null ? this.datatype.getShow() : "%DATATYPE%";
            converter += "^^" + this.datatype.toNT();
        } else if (this.constraint == ConstraintType.LangString) {
            if (this.languageConstraint.type == LangConstraintType.Fixed) {
                let langTag: string = (this.languageConstraint.language != null) ? this.languageConstraint.language : "%LANG%";
                converter += "@" + langTag;
            } else { //UserPrompted
                //define and add a node definition for the language placeholder
                let langPhNodeId = this.label + "_lang_node";
                let langPhDef: PlaceholderDef = new PlaceholderDef(langPhNodeId + " " + FormFieldType.literal + " " + CustomForm.USER_PROMPT_PREFIX + this.label + "_lang");
                placeholderDefs.unshift(langPhDef);
                //then use it in the langString converter
                converter += "(coda:langString($" + langPhNodeId + "))";
            }
        }
        //3rd: feature
        let feature: string = CustomForm.USER_PROMPT_PREFIX + this.label;

        let phDef = new PlaceholderDef(nodeId + " " + converter + " " + feature, this.getAnnotationSerializations());
        placeholderDefs.push(phDef);
        return placeholderDefs;
    }

    protected getAnnotationSerializations(): string[] {
        let annotations: string[] = super.getAnnotationSerializations();
        //in addition to @Collection, Literal nodes accept also @DataOneOf that can be used in combo with @Collection
        let annotation: string;
        if (this.constraint == ConstraintType.Enumeration) {
            annotation = "@" + AnnotationName.DataOneOf;
            annotation += "(value={" + this.enumeration.map(e => e.toNT()).join(",") + "})";
        }
        if (annotation != null) {
            annotations.push(annotation);
        }
        return annotations;
    }
}
class WizardFieldUri extends WizardField {
    type: FormFieldType = FormFieldType.uri;
    roles: RDFResourceRolesEnum[] = []; //ConstraintType.Role => role of the value admitted by the field (annotation @Role)
    ranges: ARTURIResource[] = []; //ConstraintType.Range => class(es) of the value admitted by the field (annotation @Range or @RangeList)
    enumeration: ARTURIResource[] = []; //ConstraintType.Enumeration => list of Resource (annotation @ObjectOneOf)

    getPlaceholderDefinitions(): PlaceholderDef[] {
        let placeholderDefs: PlaceholderDef[] = [];
        //1st: nodeID
        let nodeId: string = this.label + "_node";
        //2nd: converter
        let converter: string = this.type;
        //TODO: eventually add the customization of the converter
        //3rd: feature
        let feature: string = CustomForm.USER_PROMPT_PREFIX + this.label;

        let phDef = new PlaceholderDef(nodeId + " " + converter + " " + feature, this.getAnnotationSerializations());
        placeholderDefs.push(phDef);
        return placeholderDefs;
    }

    getAnnotationSerializations(): string[] {
        let annotations: string[] = super.getAnnotationSerializations();
        /* 
        in addition to @Collection, URI nodes accept also @ObjectOneOf, @Range, @RangeList and @Role.
        even there is no constraint that prevent to use them together, logically (except for @Collection)
        they are mutually exclusive
        */
        let annotation: string;
        if (this.constraint == ConstraintType.Enumeration) {
            annotation = "@" + AnnotationName.ObjectOneOf;
            annotation += "(value={" + this.enumeration.map(e => e.toNT()).join(",") + "})";
        } else if (this.constraint == ConstraintType.Range) {
            if (this.ranges.length == 1) {
                annotation = "@" + AnnotationName.Range;
                annotation += "(value=" + this.ranges[0].toNT() + ")";
            } else if (this.ranges.length > 1) {
                annotation = "@" + AnnotationName.RangeList;
                annotation += "(value={" + this.ranges.map(r => r.toNT()).join(",") + "})";
            }
        } else if (this.constraint == ConstraintType.Role) {
            annotation = "@" + AnnotationName.Role;
            annotation += "(value={" + this.roles.map(r => "'" + r + "'").join(",") + "})";
        }
        if (annotation != null) {
            annotations.push(annotation);
        }
        return annotations;
    }
}

export enum ConstraintType {
    Enumeration = "Enumeration", //@ObjectOneOf (uri) or @DataOneOf (literal)
    Role = "Role", //@Role
    Range = "Range", //@Range or @RangeList
    Datatype = "Datatype", //no annotation, just add datatype to literal converter
    LangString = "LangString", //no annotation, just add language to literal converter
}

class LangConstraint {
    type: LangConstraintType = LangConstraintType.Fixed;
    language: string;
}
enum LangConstraintType {
    Fixed = "Fixed",
    UserPrompted = "UserPrompted",
}

class CollectionConstraint {
    enabled: boolean;
    minEnabled: boolean;
    min: number = 0;
    maxEnabled: boolean;
    max: number = 0;
}

class PlaceholderDef {
    annotations?: string[];
    nodeDefinition: string;

    constructor(nodeDef: string, annotations?: string[]) {
        this.nodeDefinition = nodeDef;
        this.annotations = annotations;
    }
}

class CustomRangeEntryPoint {
    nodeId: string = "entryPointNode";
    converterStatus: ConverterConfigStatus;
    converterSerialization: string = "";
    feature?: WizardField; //feature in input to converter (if required)

    getNodeSerialization() {
        let s: string = this.nodeId + " ";
        let converterSerialization: string = "%CONVERTER%";
        if (this.converterStatus != null) {
            converterSerialization = this.converterStatus.converterDesc.getSerialization(this.converterStatus.signatureDesc)
        }
        s += converterSerialization + " ";
        let feature: string = "%FEATURE%";
        if (this.converterStatus != null && this.converterStatus.signatureDesc.getRequirementLevels() == RequirementLevels.REQUIRED) {
            if (this.feature != null) {
                feature = CustomForm.USER_PROMPT_PREFIX + this.feature.label;
            }
            s += feature + " ";
        }
        s += ".";
        return s;
    }
}