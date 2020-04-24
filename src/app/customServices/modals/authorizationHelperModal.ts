import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { RDFResourceRolesEnum } from "../../models/ARTResources";
import { Language, Languages } from "../../models/LanguagesCountries";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class AuthorizationHelperModalData extends BSModalContext {
    constructor(public authorization?: string, public parameters?: string[]) {
        super();
    }
}

@Component({
    selector: "auth-helper-modal",
    templateUrl: "./authorizationHelperModal.html",
})
export class AuthorizationHelperModal implements ModalComponent<AuthorizationHelperModalData> {
    context: AuthorizationHelperModalData;

    /**
     * Currently custom services allow only creation of SPARQL operation, so limited to the only rdf capability area.
     * The following are not shown in the UI, so the rdf selection is hardcoded
     */
    private areas: AreaStruct[] = [
        { value: "rdf", label: "RDF", description: "Editing of content data"},
        // { value: "rbac", label: "RBAC", description: "Role Based Access Control management"},
        // { value: "pm", label: "PM", description: "Project management"},
        // { value: "um", label: "UM", description: "User management"},
        // { value: "cform", label: "CFORM", description: "Custom Form management"},
        // { value: "sys", label: "SYS", description: "System administration"}
    ];
    private selectedArea: AreaStruct = this.areas[0];

    //type restriction
    private readonly typeRestrictionNone: string = "None";
    private readonly typeRestrictionType: string = "Restrict to a specific type";
    private readonly typeRestrictionParam: string = "Restrict to the type of a parameter";
    private typeRestrictions: string[] = [ this.typeRestrictionNone, this.typeRestrictionType, this.typeRestrictionParam];
    private selectedTypeRestriction: string = this.typeRestrictionNone;
    private selectedType: RDFResourceRolesEnum;
    private selectedParamType: string;

    private scope: string;

    private roles: RDFResourceRolesEnum[] = [
        RDFResourceRolesEnum.annotationProperty,
        RDFResourceRolesEnum.cls,
        RDFResourceRolesEnum.concept,
        RDFResourceRolesEnum.conceptScheme,
        RDFResourceRolesEnum.dataRange,
        RDFResourceRolesEnum.datatypeProperty,
        RDFResourceRolesEnum.individual,
        RDFResourceRolesEnum.limeLexicon,
        RDFResourceRolesEnum.objectProperty,
        RDFResourceRolesEnum.ontolexForm,
        RDFResourceRolesEnum.ontolexLexicalEntry,
        RDFResourceRolesEnum.ontolexLexicalSense,
        RDFResourceRolesEnum.ontology,
        RDFResourceRolesEnum.ontologyProperty,
        RDFResourceRolesEnum.property,
        RDFResourceRolesEnum.skosCollection,
        RDFResourceRolesEnum.skosOrderedCollection,
        RDFResourceRolesEnum.xLabel,
    ];

    //language restriction
    private readonly langRequirementNone: string = "None";
    private readonly langRequirementLang: string = "Require a specific language";
    private readonly langRequirementParam: string = "Require the language of a parameter";
    private langRequirements: string[] = [ this.langRequirementNone, this.langRequirementLang, this.langRequirementParam];
    private selectedLangRequirement: string = this.langRequirementNone;
    private selectedLang: Language;
    private selectedParamLang: string;

    private languages: Language[];

    //crudv restriction
    private crudvStruct: { value: string, label: string, checked: boolean }[] = [
        { value : "C", label: "Create", checked: false },
        { value : "R", label: "Read", checked: false },
        { value : "U", label: "Update", checked: false },
        { value : "D", label: "Delete", checked: false },
        { value : "V", label: "Validate", checked: false }
    ];

    //validation pattern
    private scopePattern: string = "[a-zA-Z]+";

    private authValidStruct: { valid: boolean, errors?: string };
    private authSerialization: string;

    constructor(public dialog: DialogRef<AuthorizationHelperModalData>, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.languages = Languages.getSystemLanguages();

        if (this.context.authorization) { //edit => restore the form with the given authorization
            let auth = this.context.authorization;
            auth = auth.replace(/\s+/g,""); //removes all the whitespaces
            //type restriction

            /* Group for capturing the restriction on type (subject of the capability).
             * The type can be restricted through:
             * - a @typeof annotation
             * - the specific type name
             * so I need two groups in OR "|".
             * Both of them are capturing, the external group that is used just for the OR is not capturing (?:)
             */
            let typeofGroup = "(?:@typeof\\(#([a-zA-Z0-9_]+)\\))"; //2 groups: external not capturing for "@typeof(#param)", internal capturing for "param"
            let typesGroup = "(" + this.roles.join("|") + ")"; //(annotationProperty|cls|concept|...), a capturing group for the role.
            let subjectGroup = "(?:" + typeofGroup + "|" + typesGroup + ")"; //OR between the two above

            /* Group for capturing the scope. A scope can be optionally provided beside the subject like (subject, scope)
             * Its group (optional) is composed by an external not capturing group (?:) and an inner capturing group for the sole scope,
             * Thus the match() will returns only the scope, without the trailing ","
             */
            let scopeGroup = "(?:,(" + this.scopePattern + "))?";

            /* The subject of a capability (e.g. rdf(...)) is optional, so the group that represents it is in an optional group ()?
             * In addition to the subject, a scope can be provided like: (subject, scope) */
            let rdfArgGroup = "(?:\\(" + subjectGroup + scopeGroup + "\\))?";

            let capabilityPattern = "rdf" + rdfArgGroup;

            //lang restriction
            /* Group for capturing the lang requirement
             * The lang can be restricted through:
             * - a @langOf annotation
             * - the specific lang tag
             * so I need two groups in OR "|".
             * Both of them are capturing, the external group that is used just for the OR is not capturing (?:)
             */
            let langofGroup = "(?:@langOf\\(#([a-zA-Z0-9_]+)\\))"; //2 groups => external not capturing for "@langOf(#param)", internal capturing for "param"
            let langTagGroup = "([a-zA-Z-]+)"; //capturing group for the language tag
            let langGroup = "(?:" + langofGroup + "|" + langTagGroup + ")"; //OR between the two above
            /* the whole language requirement is optional, so use an optional not capturing group
            * (not captturing in order to ignore ", {lang:...}" and capture just the lang) */
            let langReqPattern = "(?:,{lang:" + langGroup + "})?";

            //crudv
            let crudvGroup = "([CRUDV]+)";
            let crudvPattern = "(?:," + crudvGroup + ")"; //external not capturing (for capturing the whole ", CR"), internal capturing for the sole crudv

            //build the whole pattern with the preious
            let authPattern = "^" + capabilityPattern + langReqPattern + crudvPattern + "$";
            let authMatch = auth.match(authPattern);

            if (authMatch == null) {
                //cannot parse the input authorizations
                this.basicModals.alert("Operation authorization", "Unable to parse authorization you're trying to edit (" + 
                    this.context.authorization + "). The form has not been restored.", "warning");
            } else {
                /* 
                * authMatch should contain 7 groups:
                * 0 - the whole matched expression (authorization itself)
                * 1 - the parameter of the @typeof expression (if used)
                * 2 - the type (if explicitly specified)
                * 3 - the scope (if provided)
                * 4 - the parameter of the @langOf expression (if used)
                * 5 - the langTag (if explicitly specified)
                * 6 - the crudv
                */
                //restore type restriction form
                if (authMatch[1] != null) { //param specified for the @typeof annotation
                    this.selectedTypeRestriction = this.typeRestrictionParam;
                    //restore the selected parameter
                    if (this.context.parameters != null) {
                        this.selectedParamType = this.context.parameters.find(p => p == authMatch[1]);
                    }
                } else if (authMatch[2] != null) { //type specified
                    this.selectedTypeRestriction = this.typeRestrictionType;
                    //restore the selected type
                    this.selectedType = this.roles.find(r => r == authMatch[2]);
                } else { //none type restriction
                    this.selectedTypeRestriction = this.typeRestrictionNone;
                }
                if (authMatch[3] != null) { //scope provided
                    this.scope = authMatch[3];
                }

                //restore the lang requirement
                if (authMatch[4] != null) { //param specified for @langOf
                    this.selectedLangRequirement = this.langRequirementParam;
                    //restore the selected parameter
                    if (this.context.parameters != null) {
                        this.selectedParamLang = this.context.parameters.find(p => p == authMatch[4]);
                    }
                } else if (authMatch[5] != null) { //langTag specified
                    this.selectedLangRequirement = this.langRequirementLang;
                    //restore the selected lang
                    this.selectedLang = this.languages.find(l => l.tag == authMatch[5])
                } else { //none lang requirement
                    this.selectedLangRequirement = this.langRequirementNone;
                }

                //restore the CRUDV
                let matchedCrudv = authMatch[6];
                this.crudvStruct.forEach(s => {
                    s.checked = matchedCrudv.toUpperCase().indexOf(s.value) != -1
                })
            }
        }

        this.update();
    }

    private update() {
        this.updateSerialization();
        this.updateAuthValid();
    }

    private updateSerialization() {
        this.authSerialization = this.selectedArea.value; //rdf
        //type of rdf()
        if (this.selectedTypeRestriction != this.typeRestrictionNone) {
            this.authSerialization += "(";
            //type
            if (this.selectedTypeRestriction == this.typeRestrictionParam) { //using param
                this.authSerialization += "@typeof(";
                if (this.selectedParamType != null) {
                    this.authSerialization += "#" + this.selectedParamType;
                } else {
                    this.authSerialization += "?";
                }
            } else if (this.selectedTypeRestriction == this.typeRestrictionType) { //selecting a role
                if (this.selectedType != null) {
                    this.authSerialization += this.selectedType;
                } else {
                    this.authSerialization += "?";
                }
            }
            //optional scope
            if (this.scope != null && this.scope.trim() != "") {
                this.authSerialization += "," + this.scope;
            }
            this.authSerialization += ")";
        }
        //language restriction
        if (this.selectedLangRequirement != this.langRequirementNone) {
            this.authSerialization += ", { lang: ";
            if (this.selectedLangRequirement == this.langRequirementParam) { //using param
                this.authSerialization += "@langOf(";
                if (this.selectedParamLang != null) { 
                    this.authSerialization += "#" + this.selectedParamLang;
                } else {
                    this.authSerialization += "?";
                }
                this.authSerialization += ")";
            } else if (this.selectedLangRequirement == this.langRequirementLang) { //selecting a lang
                if (this.selectedLang != null) {
                    this.authSerialization += this.selectedLang.tag;
                } else {
                    this.authSerialization += "?";
                }
            }
            this.authSerialization += " }";
        }
        //CRUDV
        let crudv: string = "";
        this.crudvStruct.forEach(s => {
            if (s.checked) {
                crudv += s.value;
            }
        });
        if (crudv == "") {
            crudv = "?";
        }
        this.authSerialization += ", " + crudv;
    }

    /**
     * Used for determining if the ok button can be enabled (if everything is ok, thus returns a null string)
     * and for showing an error messasge about the missing configuration
     */
    private updateAuthValid() {
        let errors: string[] = [];
        //check on type restriction
        if (this.selectedTypeRestriction == this.typeRestrictionParam && this.selectedParamType == null) {
            errors.push("A parameter for the type restriction has not been selected");
        } else if (this.selectedTypeRestriction == this.typeRestrictionType && this.selectedType == null) {
            errors.push("A type for the type restriction has not been selected");
        }
        if (this.selectedTypeRestriction != this.typeRestrictionNone && this.selectedParamType != null || this.selectedType != null) { //scope enabled
            if (this.scope != null && this.scope.trim() != "") {
                if (!new RegExp("^"+this.scopePattern+"$").test(this.scope)) {
                    errors.push("Provided scope value is invalid");
                }
            }
        }
        //check on language requirement
        if (this.selectedLangRequirement == this.langRequirementParam && this.selectedParamLang == null) {
            errors.push("A parameter for the language requirement has not been selected");
        } else if (this.selectedLangRequirement == this.langRequirementLang && this.selectedLang == null) {
            errors.push("A language for the language requirement has not been selected");
        }
        //check on CRUDV
        if (!this.crudvStruct.some(s => s.checked)) {
            errors.push("No operation has been selected from the CRUDV");
        }

        if (errors.length > 0) {
            this.authValidStruct = { valid: false, errors: errors.join("\n") };
        } else {
            this.authValidStruct = { valid: true };
        }
    }

    ok() {
        if (this.authValidStruct.valid) {
            this.dialog.close(this.authSerialization);
        }
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}

class AreaStruct {
    value: string;
    label: string;
    description: string; 
}