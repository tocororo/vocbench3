import { Component, ElementRef, Input } from "@angular/core";
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { ARTNode, ARTURIResource } from "src/app/models/ARTResources";
import { PrefixMapping } from "src/app/models/Metadata";
import { CustomFormsServices } from "src/app/services/customFormsServices";
import { VBContext } from "src/app/utils/VBContext";
import { ConverterConfigStatus } from "src/app/widget/converterConfigurator/converterConfiguratorComponent";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";
import { ModalOptions, ModalType } from "src/app/widget/modal/Modals";
import { ConverterContractDescription, ConverterUtils, PearlValidationResult, RequirementLevels } from "../../../models/Coda";
import { CustomForm } from "../../../models/CustomForms";
import { ResourceUtils } from "../../../utils/ResourceUtils";
import { UIUtils } from "../../../utils/UIUtils";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { ConstraintType, LangConstraintType, WizardField, WizardFieldLiteral, WizardFieldUri } from "./CustomFormWizard";
import { GraphEntryPointModal } from "./graphEntryPointModal";

@Component({
    selector: "custom-form-wizard-modal",
    templateUrl: "./customFormWizardModal.html",
})
export class CustomFormWizardModal {

    /*
    TODO:
    - dare la possibilità per tutti i field di editare il converter
    - dare la possibilità di creare triple più complesse nella parte graph
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

    customRange: boolean = true; //tells if the wizard creates a CustomRange or a CustomConstructor

    prefixMappings: PrefixMapping[];

    //nodes/fields
    fields: WizardField[];

    //graph
    entryPoint: CustomRangeEntryPoint;

    graphs: GraphEntry[];
    selectedGraph: GraphEntry;

    pearl: string;

    constructor(private activeModal: NgbActiveModal, private modalService: NgbModal, private elementRef: ElementRef,
        private cfService: CustomFormsServices,
        private basicModals: BasicModalServices, private browsingModals: BrowsingModalServices) {
    }

    ngOnInit() {
        this.prefixMappings = VBContext.getWorkingProjectCtx().getPrefixMappings();
        this.fields = [];
        this.entryPoint = new CustomRangeEntryPoint();
        this.graphs = [];
    }

    ngAfterViewInit() {
        UIUtils.setFullSizeModal(this.elementRef);
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

    addGraph() {
        let g: GraphEntry = new GraphEntry(this.entryPoint);
        this.graphs.push(g);
        this.updatePearl();
    }

    removeGraph() {
        this.graphs.splice(this.graphs.indexOf(this.selectedGraph), 1);
        this.selectedGraph = null;
        this.updatePearl();
    }

    selectPredicate(graph: GraphEntry) {
        this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}).then(
            (property: ARTURIResource) => {
                graph.predicate = property;
                this.updatePearl();
            },
            () => {}
        )
    }


    //==========================

    updatePearl() {
        let indentCount: number = 0;
        this.pearl = "rule it.uniroma2.art.semanticturkey.customform.form." + this.formId + " id:" + this.formId + " {\n";

        //NODES
        indentCount++;
        this.pearl += this.getIndent(indentCount) + "nodes = {\n"; //open nodes
        indentCount++;
        this.pearl += this.getIndent(indentCount) + this.entryPoint.getNodeSerialization() + " .\n";
        this.fields.forEach(f => {
            f.getPlaceholderDefinitions().forEach(phDef => {
                if (phDef.annotations != null) {
                    phDef.annotations.forEach(a => {
                        this.pearl += this.getIndent(indentCount) + a + "\n";
                    })
                }
                this.pearl += this.getIndent(indentCount) + phDef.nodeDefinition + " .\n";
            })
        })
        indentCount--;
        this.pearl += this.getIndent(indentCount) + "}\n"; //close nodes

        //GRAPH
        this.pearl += this.getIndent(indentCount) + "graph = {\n" //open graph
        indentCount++;

        this.graphs.forEach(g => {
            let s: GraphEntrySerialization = g.getSerialization(this.prefixMappings);
            if (s.optional) {
                this.pearl += this.getIndent(indentCount) + "OPTIONAL {\n"; //open optional
                indentCount++
            }
            s.triples.forEach(t => {
                this.pearl += this.getIndent(indentCount) + t + " .\n";
            })
            if (s.optional) {
                indentCount--;
                this.pearl += this.getIndent(indentCount) + "}\n"; //close optional
            }
        })
        indentCount--;
        this.pearl += this.getIndent(indentCount) + "}\n"; //close graph
        this.pearl += "}"; //close rule

        //PREFIX
        //collected at the end in order to declare only those used
        let prefixDeclaration = "";
        this.prefixMappings.forEach(m => {
            if (this.pearl.includes(m.prefix + ":")) {
                prefixDeclaration += "prefix\t" + m.prefix + ":\t<" + m.namespace + ">\n";
            }
        })
        //coda prefix is always declared (if not already in prefixMapping of the project)
        if (!this.prefixMappings.some(m => m.namespace == ConverterContractDescription.NAMESPACE)) { 
            prefixDeclaration += "prefix\tcoda:\t<" + ConverterContractDescription.NAMESPACE + ">\n";
        }

        this.pearl = prefixDeclaration + "\n" + this.pearl;
    }

    private getIndent(count: number) {
        let indent: string = "";
        for (let i = 0; i < count; i++) {
            indent += "\t";
        }
        return indent;
    }

    private checkData(): Observable<boolean> {
        for (let i = 0; i < this.fields.length; i++) {
            let field = this.fields[i];
            //check on names
            if (field.label.trim() == "") { //invalid name
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field at position " + (i + 1) + " has an invalid name", ModalType.warning);
                return of(false);
            }
            //look for duplicate
            if (this.fields.filter(f => f.label == field.label).length > 1) { //found more than 1 field with the name of the current one
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Found multiple fields with the same name (" + field.label + ")", ModalType.warning);
                return of(false);
            }
            //check if all constraints are ok
            if (field.constraint == ConstraintType.Datatype && (<WizardFieldLiteral>field).datatype == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.Datatype, ModalType.warning);
                return of(false);
            }
            if (field.constraint == ConstraintType.Enumeration && field.enumeration.length == 0) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.Enumeration, ModalType.warning);
                return of(false);
            }
            if (field.constraint == ConstraintType.LangString) {
                if ((<WizardFieldLiteral>field).languageConstraint.type == LangConstraintType.Fixed && (<WizardFieldLiteral>field).languageConstraint.language == null) {
                    this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.LangString, ModalType.warning);
                    return of(false);
                }
            }
            if (field.constraint == ConstraintType.Range && (<WizardFieldUri>field).ranges.length == 0) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.Range, ModalType.warning);
                return of(false);
            }
            if (field.constraint == ConstraintType.Role && (<WizardFieldUri>field).roles.length == 0) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Field " + field.label + " has incomplete constraint " + ConstraintType.Role, ModalType.warning);
                return of(false);
            }
        }
        //check graph entry point node
        if (this.entryPoint.converterStatus != null) {
            if (this.entryPoint.converterStatus.signatureDesc.getRequirementLevels() == RequirementLevels.REQUIRED && this.entryPoint.feature == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Entry point converter require an input feature to be specified", ModalType.warning);
                return of(false);
            }
        } else { //MEMO: this check only if CF is for CustomRange
            this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Entry point converter missing", ModalType.warning);
            return of(false);
        }
        //check on graph
        for (let i = 0; i < this.graphs.length; i++) {
            let g: GraphEntry = this.graphs[i];
            if (i == 0 && g.object instanceof WizardField && g.object.optional) { //first usage of graph entry point node cannot be optional
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "The first usage of the " + g.subject.nodeId + " in the graph section cannot use an optional field", ModalType.warning);
                return of(false);
            }
            if (g.predicate == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Graph entry at position " + (i+1) + " has a missing predicate", ModalType.warning);
                return of(false);
            }
            if (g.object == null) {
                this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, "Graph entry at position " + (i+1) + " has a missing object", ModalType.warning);
                return of(false);
            }
        }

        //every check is ok, so returns the validity of the pearl
        return this.cfService.validatePearl(this.pearl, "graph").pipe(
            map((result: PearlValidationResult) => {
                if (result.details) {
                    this.basicModals.alert({ key: "STATUS.INVALID_DATA" }, result.details, ModalType.warning);
                }
                return result.valid;
            })
        );
    }



    ok() {
        this.checkData().subscribe(
            valid => {
                if (valid) {
                    this.activeModal.close(this.pearl);
                }
            }
        )
    }

    cancel() {
        this.activeModal.dismiss();
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
            converterSerialization = ConverterUtils.getConverterProjectionOperator(this.converterStatus.converterDesc, this.converterStatus.signatureDesc, 
                this.converterStatus.converter.type, this.converterStatus.converter.params);
        }
        s += converterSerialization + " ";
        let feature: string = "%FEATURE%";
        if (this.converterStatus != null && this.converterStatus.signatureDesc.getRequirementLevels() == RequirementLevels.REQUIRED) {
            if (this.feature != null) {
                feature = CustomForm.USER_PROMPT_PREFIX + this.feature.label;
            }
        }
        return s;
    }
}

class GraphEntry {
    subject: CustomRangeEntryPoint | WizardFieldUri;
    predicate: ARTURIResource;
    object: WizardField | ARTNode;

    constructor(subject: CustomRangeEntryPoint | WizardFieldUri) {
        this.subject = subject;
    }

    getSerialization(prefixMapping: PrefixMapping[]): GraphEntrySerialization {
        let triples: string[] = [];
        let optional: boolean = this.object instanceof WizardField && this.object.optional;

        let subject: string = "$" + this.subject.nodeId;

        let predicate: string;
        if (this.predicate != null) {
            predicate = ResourceUtils.getQName(this.predicate.getURI(), prefixMapping);
            if (predicate == this.predicate.getURI()) {
                predicate = "<" + predicate + ">"; //failed to get QName, so sorround the URI with <>
            }
        } else {
            predicate = "%PREDICATE%";
        }

        let object: string;
        if (this.object != null) {
            if (this.object instanceof WizardField) {
                object = "$" + this.object.nodeId;
            } else if (this.object instanceof ARTNode) {
                if (this.object instanceof ARTURIResource) {
                    object = ResourceUtils.getQName(this.predicate.getURI(), prefixMapping);
                    if (object == this.object.getURI()) {
                        object = "<" + object + ">"; //failed to get QName, so sorround the URI with <>
                    }
                } else {
                    object = this.object.toNT();
                }
            }
        } else {
            object = "%OBJECT%";
        }

        triples.push(subject + " " + predicate + " " + object);

        let ges: GraphEntrySerialization = {
            triples: triples,
            optional: optional
        }
        return ges;
    }
}

interface GraphEntrySerialization {
    triples: string[];
    optional: boolean;
}