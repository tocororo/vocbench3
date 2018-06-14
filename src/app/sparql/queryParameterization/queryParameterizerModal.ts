import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs/Observable";
import { ARTLiteral, ARTNode, ARTURIResource, RDFResourceRolesEnum, RDFTypesEnum, ResourceUtils } from "../../models/ARTResources";
import { BindingTypeEnum, VariableBindings } from "../../models/Sparql";
import { DatatypesServices } from "../../services/datatypesServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";

export class QueryParameterizerModalData extends BSModalContext {
    constructor(public variableBindings?: VariableBindings) {
        super();
    }
}

@Component({
    selector: "query-parameterizer-modal",
    templateUrl: "./queryParameterizerModal.html"
})
export class QueryParameterizerModal implements ModalComponent<QueryParameterizerModalData> {
    context: QueryParameterizerModalData;

    private bindings: BindingStruct[] = [];

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

    constructor(public dialog: DialogRef<QueryParameterizerModalData>, private datatypeService: DatatypesServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices,  private creationModals: CreationModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.variableBindings) { //edit mode
            let varBinds: VariableBindings = this.context.variableBindings;
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
                            datatype = this.datatypes[ResourceUtils.indexOfNode(this.datatypes, ResourceUtils.parseURI(varBinds[varName].datatype))]
                            bs.datatype = datatype
                            this.bindings.push(bs);
                        }
                    )
                } else { //specialization not datatype => simply push the bs
                    this.bindings.push(bs);
                }
            }
        } else { //create mode
            this.initDatatypes().subscribe()
        }
    }

    private initDatatypes(): Observable<any> {
        if (this.datatypes == null) {
            return this.datatypeService.getDatatypes().map(
                datatypes => {
                    datatypes.sort((dt1: ARTURIResource, dt2: ARTURIResource) => {
                        return dt1.getShow().localeCompare(dt2.getShow());
                    });
                    this.datatypes = datatypes;
                }
            );
        } else {
            return Observable.of();
        }
    }

    private addBinding() {
        this.bindings.push({ varName: null, bindingType: this.bindingTypes[0] });
    }

    private removeBinding(binding: BindingStruct) {
        this.bindings.splice(this.bindings.indexOf(binding), 1);
    }

    private setAssignemntValue(binding: BindingStruct, type: RDFTypesEnum) {
        if (type == RDFTypesEnum.resource) {
            this.sharedModals.pickResource("Select a resource").then(
                (value: ARTNode) => {
                    binding.value = value.toNT();
                },
                () => {}
            );
        } else if (type == RDFTypesEnum.typedLiteral) {
            this.creationModals.newTypedLiteral("Create typed literal").then(
                (value: ARTLiteral) => {
                    binding.value = value.toNT();
                },
                () => {}
            );
        } else if (type == RDFTypesEnum.plainLiteral) {
            this.creationModals.newPlainLiteral("Create literal").then(
                (value: ARTLiteral) => {
                    binding.value = value.toNT();
                },
                () => {}
            );
        }
    }

    ok(event: Event) {
        let varBindings: VariableBindings = {};
        for (var i = 0; i < this.bindings.length; i++) {
            let b: BindingStruct = this.bindings[i];

            if (b.varName == null || b.varName.trim() == "") { //check if name is not set
                this.basicModals.alert("Missing binding name", "Missing binding name at position " + (i+1) + ", please insert a name", "warning");
                return;
            }
            
            if (varBindings[b.varName] != null) {
                this.basicModals.alert("Duplicated binding name", "Duplicated binding name '" + b.varName
                    + "', please change the name or delete the binding", "warning");
                return;
            }

            varBindings[b.varName] = {
                bindingType: b.bindingType.value,
                displayName: b.displayName,
                description: b.description
            }
            if (b.bindingType.value == BindingTypeEnum.assignment) {
                if (b.value == null) {//check if type is assignment and the resource is not set
                    this.basicModals.alert("Incomplete binding", "Incomplete parameterization for binding '" + b.varName 
                        + "', please set a value or delete the binding", "warning");
                    return;
                }
                varBindings[b.varName].value = b.value;
            } else if (b.bindingType.value == BindingTypeEnum.constraint) {
                if (b.bindingType.specialization == "role") {
                    if (b.resourceRole == null) { //check if type is constraint and the role is not set
                        this.basicModals.alert("Incomplete binding", "Incomplete parameterization for binding '" + b.varName 
                            + "', please set a role or delete the binding", "warning");
                        return;
                    } 
                    varBindings[b.varName].resourceRole = b.resourceRole;
                } else if (b.bindingType.specialization == "datatype") {
                    if (b.datatype == null) { //check if type is constraint and the datatype is not set
                        this.basicModals.alert("Incomplete binding", "Incomplete parameterization for binding '" + b.varName 
                            + "', please set a datatype or delete the binding", "warning");
                        return;
                    } 
                    varBindings[b.varName].datatype = b.datatype.toNT();
                }
            }
        };
        this.dialog.close(varBindings);
    }

    cancel() {
        this.dialog.dismiss();
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
