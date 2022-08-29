import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VBContext } from "src/app/utils/VBContext";
import { ModalType } from 'src/app/widget/modal/Modals';
import { RDFResourceRolesEnum } from "../../../models/ARTResources";
import { Language } from "../../../models/LanguagesCountries";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "auth-helper-modal",
    templateUrl: "./authorizationHelperModal.html",
})
export class AuthorizationHelperModal {
    @Input() authorization: string;
    @Input() parameters: string[];

    /**
     * Currently custom services allow only creation of SPARQL operation, so limited to the only rdf capability area.
     * The following are not shown in the UI, so the rdf selection is hardcoded
     */
    private areas: AreaStruct[] = [
        { value: "rdf", label: "RDF", description: "Editing of content data" },
    ];
    private selectedArea: AreaStruct = this.areas[0];

    //type restriction
    typeRestrictions: { restriction: TypeRestriction, translationKey: string }[] = [
        { restriction: TypeRestriction.none, translationKey: "CUSTOM_SERVICES.AUTH_HELPER.TYPE_RESTR.RESTRICTION_NONE" },
        { restriction: TypeRestriction.type, translationKey: "CUSTOM_SERVICES.AUTH_HELPER.TYPE_RESTR.RESTRICTION_TO_SPECIFIC_TYPE" },
        { restriction: TypeRestriction.param, translationKey: "CUSTOM_SERVICES.AUTH_HELPER.TYPE_RESTR.RESTRICTION_TO_PARAMETER_TYPE" }
    ];
    selectedTypeRestriction: TypeRestriction = TypeRestriction.none;
    selectedType: RDFResourceRolesEnum;
    selectedParamType: string;

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
        "resource" as RDFResourceRolesEnum, //dedicated "special" generic role (not an actual one)
        RDFResourceRolesEnum.skosCollection,
        RDFResourceRolesEnum.skosOrderedCollection,
        RDFResourceRolesEnum.xLabel,
    ];

    //language restriction
    readonly langRequirementNone: string = "CUSTOM_SERVICES.AUTH_HELPER.LANG_REQUIREMENT.REQUIRE_NONE";
    readonly langRequirementLang: string = "CUSTOM_SERVICES.AUTH_HELPER.LANG_REQUIREMENT.REQUIRE_SPECIFIC_LANG";
    readonly langRequirementParam: string = "CUSTOM_SERVICES.AUTH_HELPER.LANG_REQUIREMENT.REQUIRE_PARAMETER_LANG";
    langRequirements: string[] = [this.langRequirementNone, this.langRequirementLang, this.langRequirementParam];
    selectedLangRequirement: string = this.langRequirementNone;
    private selectedLang: Language;
    private selectedParamLang: string;

    private languages: Language[];

    //crudv restriction
    crudvStruct: { value: string, label: string, checked: boolean }[] = [
        { value: "C", label: "Create", checked: false },
        { value: "R", label: "Read", checked: false },
        { value: "U", label: "Update", checked: false },
        { value: "D", label: "Delete", checked: false },
        { value: "V", label: "Validate", checked: false }
    ];

    //validation pattern
    private scopePattern: string = "[a-zA-Z]+";

    authValidStruct: { valid: boolean, errors?: string };
    authSerialization: string;

    constructor(public activeModal: NgbActiveModal, private basicModals: BasicModalServices) { }

    ngOnInit() {
        this.languages = VBContext.getSystemSettings().languages;

        if (this.authorization) { //edit => restore the form with the given authorization
            let auth = this.authorization;

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
            let scopeGroup = "(?:,\\s*(" + this.scopePattern + "))?";

            /* The subject of a capability (e.g. rdf(...)) is optional, so the group that represents it is in an optional group ()?
             * In addition to the subject, a scope can be provided like: (subject, scope) */
            let rdfArgGroup = "(?:\\(" + subjectGroup + scopeGroup + "\\))?";

            let capabilityPattern = "rdf" + rdfArgGroup;

            //lang restriction
            /* Group for capturing the lang requirement
             * The lang can be restricted through:
             * - a @langof annotation
             * - the specific lang tag
             * so I need two groups in OR "|".
             * Both of them are capturing, the external group that is used just for the OR is not capturing (?:)
             */
            let langofGroup = "(?:@langof\\(#([a-zA-Z0-9_]+)\\))"; //2 groups => external not capturing for "@langof(#param)", internal capturing for "param"
            let langTagGroup = "([a-zA-Z-]+)"; //capturing group for the language tag
            let langGroup = "(?:" + langofGroup + "|" + langTagGroup + ")"; //OR between the two above
            /* the whole language requirement is optional, so use an optional not capturing group
            * (not captturing in order to ignore ", {lang:...}" and capture just the lang) */
            let langReqPattern = "(?:,\\s*{\\s*lang:\\s*" + langGroup + "\\s*})?";

            //crudv
            let crudvGroup = "([CRUDV]+)";
            let crudvPattern = "(?:,\\s*" + crudvGroup + ")"; //external not capturing (for capturing the whole ", CR"), internal capturing for the sole crudv

            //build the whole pattern with the preious
            let authPattern = "^" + capabilityPattern + langReqPattern + crudvPattern + "$";
            let authMatch = auth.match(authPattern);

            if (authMatch == null) {
                //cannot parse the input authorizations
                this.basicModals.alert({ key: "STATUS.INVALID_VALUE" }, { key: "MESSAGES.CANNOT_PARSE_AUTH", params: { auth: this.authorization } }, ModalType.warning);
            } else {
                /* 
                * authMatch should contain 7 groups:
                * 0 - the whole matched expression (authorization itself)
                * 1 - the parameter of the @typeof expression (if used)
                * 2 - the type (if explicitly specified)
                * 3 - the scope (if provided)
                * 4 - the parameter of the @langof expression (if used)
                * 5 - the langTag (if explicitly specified)
                * 6 - the crudv
                */
                //restore type restriction form
                if (authMatch[1] != null) { //param specified for the @typeof annotation
                    this.selectedTypeRestriction = TypeRestriction.param;
                    //restore the selected parameter
                    if (this.parameters != null) {
                        this.selectedParamType = this.parameters.find(p => p == authMatch[1]);
                    }
                } else if (authMatch[2] != null) { //type specified
                    this.selectedTypeRestriction = TypeRestriction.type;
                    //restore the selected type
                    this.selectedType = this.roles.find(r => r == authMatch[2]);
                } else { //none type restriction
                    this.selectedTypeRestriction = TypeRestriction.none;
                }
                if (authMatch[3] != null) { //scope provided
                    this.scope = authMatch[3];
                }

                //restore the lang requirement
                if (authMatch[4] != null) { //param specified for @langof
                    this.selectedLangRequirement = this.langRequirementParam;
                    //restore the selected parameter
                    if (this.parameters != null) {
                        this.selectedParamLang = this.parameters.find(p => p == authMatch[4]);
                    }
                } else if (authMatch[5] != null) { //langTag specified
                    this.selectedLangRequirement = this.langRequirementLang;
                    //restore the selected lang
                    this.selectedLang = this.languages.find(l => l.tag == authMatch[5]);
                } else { //none lang requirement
                    this.selectedLangRequirement = this.langRequirementNone;
                }

                //restore the CRUDV
                let matchedCrudv = authMatch[6];
                this.crudvStruct.forEach(s => {
                    s.checked = matchedCrudv.toUpperCase().indexOf(s.value) != -1;
                });
            }
        }

        this.update();
    }

    update() {
        this.updateSerialization();
        this.updateAuthValid();
    }

    private updateSerialization() {
        this.authSerialization = this.selectedArea.value; //rdf
        //type of rdf()
        if (this.selectedTypeRestriction != TypeRestriction.none) {
            this.authSerialization += "(";
            //type
            if (this.selectedTypeRestriction == TypeRestriction.param) { //using param
                this.authSerialization += "@typeof(";
                if (this.selectedParamType != null) {
                    this.authSerialization += "#" + this.selectedParamType;
                } else {
                    this.authSerialization += "?";
                }
                this.authSerialization += ")";
            } else if (this.selectedTypeRestriction == TypeRestriction.type) { //selecting a role
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
                this.authSerialization += "@langof(";
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
        if (this.selectedTypeRestriction == TypeRestriction.param && this.selectedParamType == null) {
            errors.push("A parameter for the type restriction has not been selected");
        } else if (this.selectedTypeRestriction == TypeRestriction.type && this.selectedType == null) {
            errors.push("A type for the type restriction has not been selected");
        }
        if (this.selectedTypeRestriction != TypeRestriction.none && this.selectedParamType != null || this.selectedType != null) { //scope enabled
            if (this.scope != null && this.scope.trim() != "") {
                if (!new RegExp("^" + this.scopePattern + "$").test(this.scope)) {
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
            this.activeModal.close(this.authSerialization);
        }
    }

    cancel() {
        this.activeModal.dismiss();
    }

}

class AreaStruct {
    value: string;
    label: string;
    description: string;
}

enum TypeRestriction {
    none = "none",
    param = "param",
    type = "type",
}