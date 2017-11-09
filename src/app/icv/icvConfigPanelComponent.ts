import { Component, Input, Output, EventEmitter } from "@angular/core";
import { RDFResourceRolesEnum } from "../models/ARTResources";
import { Language, Languages } from "../models/LanguagesCountries";
import { SKOS, OWL } from "../models/Vocabulary";
import { VBContext } from "../utils/VBContext";
import { UIUtils } from "../utils/UIUtils";
import { VBProperties } from "../utils/VBProperties";

@Component({
    selector: "icv-config-panel",
    templateUrl: "./icvConfigPanelComponent.html",
    styles: ['.configPanel { max-height: 170px }']
})
export class IcvConfigPanelComponent {

    @Input() checkRoles: boolean = false;
    @Input() checkLanguages: boolean = false;

    @Output() rolesChange: EventEmitter<RDFResourceRolesEnum[]> = new EventEmitter();
    @Output() langsChange: EventEmitter<string[]> = new EventEmitter();

    private configPanelOpen: boolean = true;

    private roles: RoleCheckItem[];
    private languages: LanguageCheckItem[];

    constructor(private vbProp: VBProperties) {}

    ngOnInit() {
        if (this.checkLanguages) {
            this.languages = [];
            let projectLangs = this.vbProp.getProjectLanguages();
            for (var i = 0; i < projectLangs.length; i++) {
                this.languages.push({ lang: projectLangs[i], check: projectLangs[i].mandatory });
            }
            this.onLangsChange();
        }

        if (this.checkRoles) {
            let modelType: string = VBContext.getWorkingProject().getModelType();
            this.roles = [
                { role: RDFResourceRolesEnum.concept, show: "Concept", img: UIUtils.getRoleImageSrc(RDFResourceRolesEnum.concept), check: modelType == SKOS.uri },
                { role: RDFResourceRolesEnum.conceptScheme, show: "ConceptScheme", img: UIUtils.getRoleImageSrc(RDFResourceRolesEnum.conceptScheme), check: modelType == SKOS.uri },
                { role: RDFResourceRolesEnum.skosCollection, show: "Collection", img: UIUtils.getRoleImageSrc(RDFResourceRolesEnum.skosCollection), check: false },
                { role: RDFResourceRolesEnum.cls, show: "Class", img: UIUtils.getRoleImageSrc(RDFResourceRolesEnum.cls), check: modelType == OWL.uri },
                { role: RDFResourceRolesEnum.individual, show: "Individual", img: UIUtils.getRoleImageSrc(RDFResourceRolesEnum.individual), check: false },
                { role: RDFResourceRolesEnum.property, show: "Property", img: UIUtils.getRoleImageSrc(RDFResourceRolesEnum.property), check: false }
            ];
            this.onRolesChange();
        }
    }

    private checkAllRoles(check: boolean) {
        for (var i = 0; i < this.roles.length; i++) {
            this.roles[i].check = check;
        }
        this.onRolesChange();
    }

    private checkAllLangs(check: boolean) {
        for (var i = 0; i < this.languages.length; i++) {
            this.languages[i].check = check;
        }
        this.onLangsChange();
    }

    private checkAllLangsMandatory() {
        for (var i = 0; i < this.languages.length; i++) {
            this.languages[i].check = this.languages[i].lang.mandatory;
        }
        this.onLangsChange();
    }

    private onLangsChange() {
        let langsParam: string[] = [];
        for (var i = 0; i < this.languages.length; i++) {
            if (this.languages[i].check) {
                langsParam.push(this.languages[i].lang.tag);
            }
        }
        this.langsChange.emit(langsParam);
    }

    private onRolesChange() {
        let rolesParam: RDFResourceRolesEnum[] = [];
        for (var i = 0; i < this.roles.length; i++) {
            if (this.roles[i].check) {
                rolesParam.push(this.roles[i].role);
            }
        }
        this.rolesChange.emit(rolesParam);
    }

}

class LanguageCheckItem {
    lang: Language;
    check: boolean;
}

class RoleCheckItem {
    role: RDFResourceRolesEnum;
    show: string;
    img: string;
    check: boolean;
}