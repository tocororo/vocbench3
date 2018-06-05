import { Component, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { Observable } from "rxjs/Observable";
import { ARTLiteral, ARTNode, ARTURIResource, RDFResourceRolesEnum, RDFTypesEnum, ResourceUtils } from "../../models/ARTResources";
import { Configuration, ConfigurationComponents } from "../../models/Configuration";
import { SettingsProp } from "../../models/Plugins";
import { BindingTypeEnum, VariableBindings } from "../../models/Sparql";
import { ConfigurationsServices } from "../../services/configurationsServices";
import { DatatypesServices } from "../../services/datatypesServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { LoadConfigurationModalReturnData } from "../../widget/modal/sharedModal/configurationStoreModal/loadConfigurationModal";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { YasguiComponent } from "../yasguiComponent";

export class QueryParameterizerModalData extends BSModalContext {
    constructor(public relativeRef?: string) {
        super();
    }
}

@Component({
    selector: "query-parameterizer-modal",
    templateUrl: "./queryParameterizerModal.html"
})
export class QueryParameterizerModal implements ModalComponent<QueryParameterizerModalData> {
    context: QueryParameterizerModalData;

    //QUERY PREVIEW
    @ViewChild(YasguiComponent) viewChildYasgui: YasguiComponent;

    private storedQueryReference: string;
    private query: string;

    //QUERY PARAMETERIZER
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
    //----------------------------

    constructor(public dialog: DialogRef<QueryParameterizerModalData>, private configurationService: ConfigurationsServices, 
        private datatypeService: DatatypesServices, private basicModals: BasicModalServices, private sharedModals: SharedModalServices, 
        private creationModals: CreationModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.relativeRef) { //edit mode
            this.configurationService.getConfiguration(ConfigurationComponents.SPARQL_PARAMETERIZATION_STORE, this.context.relativeRef).subscribe(
                (conf: Configuration) => {

                    let relativeRef: string; //ref of the parameterized stored query
                    let variableBindings: VariableBindings; //binding of the parameterization

                    let properties: SettingsProp[] = conf.properties;
                    for (var i = 0; i < properties.length; i++) {
                        if (properties[i].name == "relativeReference") {
                            relativeRef = properties[i].value;
                        } else if (properties[i].name == "variableBindings") {
                            variableBindings = properties[i].value;
                        }
                    }

                    //load query
                    this.configurationService.getConfiguration(ConfigurationComponents.SPARQL_STORE, relativeRef).subscribe(
                        (conf: Configuration) => {
                            this.storedQueryReference = relativeRef;
                            this.setLoadedQueryConf(conf);
                        }
                    );
                    
                    //restore variableBindings into bindings
                    for (var varName in variableBindings) {
                        let bs: BindingStruct;
                        let bindingType: BindingTypeStruct;
                        let datatype: ARTURIResource;
                        let resourceRole: RDFResourceRolesEnum;
                        let value: string;

                        if (variableBindings[varName].bindingType == BindingTypeEnum.constraint) {
                            //distinguish from constraint with role and constraint with datatype
                            if (variableBindings[varName].datatype != null) {
                                this.bindingTypes.forEach(bt => {
                                    if (bt.value == BindingTypeEnum.constraint && bt.specialization == 'datatype') {
                                        bindingType = bt;
                                    }
                                })
                            } else if (variableBindings[varName].resourceRole != null) {
                                this.bindingTypes.forEach(bt => {
                                    if (bt.value == BindingTypeEnum.constraint && bt.specialization == 'role') {
                                        bindingType = bt;
                                    }
                                })
                                resourceRole = variableBindings[varName].resourceRole;
                            }
                        } else { //assignment
                            this.bindingTypes.forEach(bt => {
                                if (bt.value == BindingTypeEnum.assignment) {
                                    bindingType = bt;
                                }
                            })
                            value = variableBindings[varName].value;
                        }

                        bs = {
                            varName: varName,
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
                                    datatype = this.datatypes[ResourceUtils.indexOfNode(this.datatypes, ResourceUtils.parseURI(variableBindings[varName].datatype))]
                                    bs.datatype = datatype
                                    this.bindings.push(bs);
                                }
                            )
                        } else { //specialization not datatype => simply push the bs
                            this.bindings.push(bs);
                        }
                    }
                }
            );
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

    private selectStoredQuery() {
        this.sharedModals.loadConfiguration("Select stored SPARQL query", ConfigurationComponents.SPARQL_STORE).then(
            (data: LoadConfigurationModalReturnData) => {
                this.storedQueryReference = data.relativeReference;
                this.setLoadedQueryConf(data.configuration);
            }
        );
    }

    private setLoadedQueryConf(conf: Configuration) {
        conf.properties.forEach(p => {
            if (p.name == "sparql") {
                this.query = p.value;
                setTimeout(() => {
                    //in order to detect the change of @Input query in the child YasguiComponent
                    this.viewChildYasgui.forceContentUpdate();
                });
            }
        });
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

    // private storeConfiguration() {
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
                bindingType: b.bindingType.value
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

        let config: { [key: string]: any } = {
            relativeReference: this.storedQueryReference,
            variableBindings: varBindings
        }

        this.sharedModals.storeConfiguration("Save SPARQL query parameterization", ConfigurationComponents.SPARQL_PARAMETERIZATION_STORE, config).then(
            () => {
                event.preventDefault();
                event.stopPropagation();
                this.dialog.close();
            },
            () => {}
        )

    }

    cancel() {
        this.dialog.dismiss();
    }

}

class BindingStruct {
    varName: string;
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
