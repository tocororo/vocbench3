import { Component } from "@angular/core";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ARTResource, RDFResourceRolesEnum, ResAttribute } from "../../models/ARTResources";
import { Language, Languages } from "../../models/LanguagesCountries";
import { SKOS, OWL } from "../../models/Vocabulary";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { UIUtils } from "../../utils/UIUtils";
import { IcvServices } from "../../services/icvServices";

@Component({
    selector: "no-mandatory-label-component",
    templateUrl: "./noMandatoryLabelComponent.html",
    host: { class: "pageComponent" }
})
export class NoMandatoryLabelComponent {

    private checkRoles: RoleCheckItem[];
    private checkLanguages: LanguageCheckItem[];

    private brokenRecordList: { resource: ARTResource, langs: Language[] }[];

    constructor(private icvService: IcvServices, private vbProp: VBProperties, private basicModals: BasicModalServices, 
        private sharedModals: SharedModalServices) { }

    ngOnInit() {
        this.checkLanguages = [];
        let projectLangs = this.vbProp.getProjectLanguages();
        for (var i = 0; i < projectLangs.length; i++) {
            this.checkLanguages.push({ lang: projectLangs[i], check: projectLangs[i].mandatory });
        }

        let modelType: string = VBContext.getWorkingProject().getModelType();
        this.checkRoles = [
            { role: RDFResourceRolesEnum.concept, show: "Concept", img: UIUtils.getRoleImageSrc(RDFResourceRolesEnum.concept), check: modelType == SKOS.uri },
            { role: RDFResourceRolesEnum.conceptScheme, show: "ConceptScheme", img: UIUtils.getRoleImageSrc(RDFResourceRolesEnum.conceptScheme), check: false },
            { role: RDFResourceRolesEnum.skosCollection, show: "Collection", img: UIUtils.getRoleImageSrc(RDFResourceRolesEnum.skosCollection), check: false },
            { role: RDFResourceRolesEnum.cls, show: "Class", img: UIUtils.getRoleImageSrc(RDFResourceRolesEnum.cls), check: modelType == OWL.uri },
            { role: RDFResourceRolesEnum.individual, show: "Individual", img: UIUtils.getRoleImageSrc(RDFResourceRolesEnum.individual), check: false },
            { role: RDFResourceRolesEnum.property, show: "Property", img: UIUtils.getRoleImageSrc(RDFResourceRolesEnum.property), check: false }
        ];
    }

    private checkAllRoles(check: boolean) {
        for (var i = 0; i < this.checkRoles.length; i++) {
            this.checkRoles[i].check = check;
        }
    }

    private checkAllLangs(check: boolean) {
        for (var i = 0; i < this.checkLanguages.length; i++) {
            this.checkLanguages[i].check = check;
        }
    }

    private checkAllLangsMandatory() {
        for (var i = 0; i < this.checkLanguages.length; i++) {
            this.checkLanguages[i].check = this.checkLanguages[i].lang.mandatory;
        }
    }

    /**
     * Run the check
     */
    runIcv() {
        let roles: RDFResourceRolesEnum[] = [];
        for (var i = 0; i < this.checkRoles.length; i++) {
            if (this.checkRoles[i].check) {
                roles.push(this.checkRoles[i].role);
            }
        }
        let langs: string[] = [];
        for (var i = 0; i < this.checkLanguages.length; i++) {
            if (this.checkLanguages[i].check) {
                langs.push(this.checkLanguages[i].lang.tag);
            }
        }
        if (roles.length == 0) {
            this.basicModals.alert("Missing resource type", "You need to select at least a resource type in order to run the ICV", "warning");
            return;
        } else if (langs.length == 0) {
            this.basicModals.alert("Missing language", "You need to select at least a language in order to run the ICV", "warning");
            return;
        }

        UIUtils.startLoadingDiv(document.getElementById("blockDivIcv"));
        this.icvService.listResourcesNoLexicalization(roles, langs).subscribe(
            resources => {
                UIUtils.stopLoadingDiv(document.getElementById("blockDivIcv"));
                this.brokenRecordList = [];
                resources.forEach(r => {
                    let langs: Language[] = Languages.fromTagsToLanguages(r.getAdditionalProperty("missingLang").split(","));
                    this.brokenRecordList.push({ resource: r, langs: langs });
                })
            }
        );
    }

    private onResourceClick(res: ARTResource) {
        this.sharedModals.openResourceView(res, false);
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