import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTLiteral, ARTNode, ARTURIResource, RDFResourceRolesEnum, RDFTypesEnum } from "../../models/ARTResources";
import { BindingTypeEnum, VariableBindings } from "../../models/Sparql";
import { DatatypesServices } from "../../services/datatypesServices";
import { NTriplesUtil, ResourceUtils } from "../../utils/ResourceUtils";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

@Component({
    selector: "query-parameterizer-modal",
    templateUrl: "./queryParameterizerModal.html"
})
export class QueryParameterizerModal {
    @Input() variableBindings: VariableBindings;

    bindings: BindingStruct[] = [];

    private bindingTypes: BindingTypeStruct[] = [
        { show: "Assignment", value: BindingTypeEnum.assignment },
        { show: "Constraint: role", value: BindingTypeEnum.constraint, specialization: "role" },
        { show: "Constraint: datatype", value: BindingTypeEnum.constraint, specialization: "datatype" }
    ];
    //for role constraint
    private roles: { show: string, value: RDFResourceRolesEnum }[] = [
        { show: "Annotation Property", value: RDFResourceRolesEnum.annotationProperty },
        { show: "Class", value: RDFResourceRolesEnum.cls },
        { show: "Collection", value: RDFResourceRolesEnum.skosCollection },
        { show: "Concept", value: RDFResourceRolesEnum.concept },
        { show: "ConceptScheme", value: RDFResourceRolesEnum.conceptScheme },
        { show: "Datatype Property", value: RDFResourceRolesEnum.datatypeProperty },
        { show: "Individual", value: RDFResourceRolesEnum.individual },
        { show: "Lexical Entry", value: RDFResourceRolesEnum.ontolexLexicalEntry },
        { show: "Lexicon", value: RDFResourceRolesEnum.limeLexicon },
        { show: "Object Property", value: RDFResourceRolesEnum.objectProperty },
        { show: "Ontology Property", value: RDFResourceRolesEnum.ontologyProperty },
        { show: "Property", value: RDFResourceRolesEnum.property },
    ];

    private datatypes: ARTURIResource[];

    constructor(public activeModal: NgbActiveModal, private datatypeService: DatatypesServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices,  private creationModals: CreationModalServices) {
    }

    ngOnInit() {
        if (this.variableBindings) { //edit mode
            let varBinds: VariableBindings = this.variableBindings;
            //restore variableBindings into bindings
            for (var varName in varBinds) {
                let bs: BindingStruct;
                let bindingType: BindingTypeStruct;
                let datatype: ARTURIResource;
                let resourceRole: RDFResourceRolesEnum;
                let value: string;

                if (varBinds[varName].bindingType == BindingTypeEnum.constraint) {
                    //distinguish from constraint with role and constraint with datatype
                    if (varBinds[varName].datatype != null) {
                        this.bindingTypes.forEach(bt => {
                            if (bt.value == BindingTypeEnum.constraint && bt.specialization == 'datatype') {
                                bindingType = bt;
                            }
                        })
                    } else if (varBinds[varName].resourceRole != null) {
                        this.bindingTypes.forEach(bt => {
                            if (bt.value == BindingTypeEnum.constraint && bt.specialization == 'role') {
                                bindingType = bt;
                            }
                        })
                        resourceRole = varBinds[varName].resourceRole;
                    }
                } else { //assignment
                    this.bindingTypes.forEach(bt => {
                        if (bt.value == BindingTypeEnum.assignment) {
                            bindingType = bt;
                        }
                    })
                    value = varBinds[varName].value;
                }

                bs = {
                    varName: varName,
                    displayName: varBinds[varName].displayName,
                    description: varBinds[varName].description,
                    bindingType: bindingType,
                    datatype: datatype,
                    resourceRole: resourceRole,
                    value: value
                }

                /**
                 * If the specialization is datatype, then I need to retrieve (asynchronously) the datatypes,
                 * then to set the datatype attribute in the BindingStruct, finally to push the bindingStruct.
                 */
                if (bs.bindingType.specialization == 'datatype') {
                    //init datatypes
                    this.initDatatypes().subscribe(
                        () => {
                            datatype = this.datatypes[ResourceUtils.indexOfNode(this.datatypes, NTriplesUtil.parseURI(varBinds[varName].datatype))]
                            bs.datatype = datatype
                            this.bindings.push(bs);
                        }
                    )
                } else { //specialization not datatype => simply push the bs
                    this.bindings.push(bs);
                }
            }
        } else { //create mode
            this.initDatatypes().subscribe();
        }
    }

    private initDatatypes(): Observable<void> {
        if (this.datatypes == null) {
            return this.datatypeService.getDatatypes().pipe(
                map(datatypes => {
                    datatypes.sort((dt1: ARTURIResource, dt2: ARTURIResource) => {
                        return dt1.getShow().localeCompare(dt2.getShow());
                    });
                    this.datatypes = datatypes;
                })
            );
        } else {
            return of(null);
        }
    }

    addBinding() {
        this.bindings.push({ varName: null, bindingType: this.bindingTypes[0] });
    }

    removeBinding(binding: BindingStruct) {
        this.bindings.splice(this.bindings.indexOf(binding), 1);
    }

    onBindingTypeChange() {
        this.initDatatypes().subscribe();
    }

    setAssignemntValue(binding: BindingStruct, type: RDFTypesEnum) {
        if (type == RDFTypesEnum.resource) {
            this.sharedModals.pickResource({key:"ACTIONS.SELECT_RESOURCE"}).then(
                (value: ARTNode) => {
                    binding.value = value.toNT();
                },
                () => {}
            );
        } else if (type == RDFTypesEnum.literal) {
            this.creationModals.newTypedLiteral({key:"DATA.ACTIONS.CREATE_LITERAL"}).then(
                (values: ARTLiteral[]) => {
                    binding.value = values[0].toNT();
                },
                () => {}
            );
        }
    }

    updateValue(binding: BindingStruct, value: ARTNode) {
        if (value != null) {
            binding.value = value.toNT();
        } else {
            binding.value = null;
        }
    }

    ok() {
        let varBindings: VariableBindings = {};
        for (var i = 0; i < this.bindings.length; i++) {
            let b: BindingStruct = this.bindings[i];

            if (b.varName == null || b.varName.trim() == "") { //check if name is not set
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.MISSING_BINDING_NAME", params:{position: i+1}}, ModalType.warning);
                return;
            }
            
            if (varBindings[b.varName] != null) {
                this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.DUPLICATED_BINDING_NAME", params:{binding: b.varName}}, ModalType.warning);
                return;
            }

            varBindings[b.varName] = {
                bindingType: b.bindingType.value,
                displayName: b.displayName,
                description: b.description
            }
            if (b.bindingType.value == BindingTypeEnum.assignment) {
                if (b.value == null) {//check if type is assignment and the resource is not set
                    this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.INCOMPLETE_BINDING_PARAMETERIZATION_VALUE", params:{binding: b.varName}}, ModalType.warning);
                    return;
                }
                varBindings[b.varName].value = b.value;
            } else if (b.bindingType.value == BindingTypeEnum.constraint) {
                if (b.bindingType.specialization == "role") {
                    if (b.resourceRole == null) { //check if type is constraint and the role is not set
                        this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.INCOMPLETE_BINDING_PARAMETERIZATION_ROLE", params:{binding: b.varName}}, ModalType.warning);
                        return;
                    } 
                    varBindings[b.varName].resourceRole = b.resourceRole;
                } else if (b.bindingType.specialization == "datatype") {
                    if (b.datatype == null) { //check if type is constraint and the datatype is not set
                        this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.INCOMPLETE_BINDING_PARAMETERIZATION_DATATYPE", params:{binding: b.varName}}, ModalType.warning);
                        return;
                    } 
                    varBindings[b.varName].datatype = b.datatype.toNT();
                }
            }
        };
        this.activeModal.close(varBindings);
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

class BindingStruct {
    varName: string;
    displayName?: string;
    description?: string;
    bindingType: BindingTypeStruct;
    resourceRole?: RDFResourceRolesEnum; //if type is constraint
    datatype?: ARTURIResource; //if type is constraint
    value?: string; //if type is assignment (NT representation)
}

class BindingTypeStruct {
    show: string; 
    value: BindingTypeEnum;
    specialization?: "role" | "datatype" //useful in case of type="constraint" to determine which is the value between role and datatype
}
