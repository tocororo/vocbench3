import {ARTNode, ARTResource, ARTURIResource, ARTBNode, ARTLiteral, ARTPredicateObjects, ResAttribute} from "./ARTResources";
import {RDFResourceRolesEnum} from "./Enums";

export class ResourceUtils {
    
    private static availableFlagLang = ["ar", "cs", "de", "el", "en", "es", "fr", "hi", "it", "ja", 
            "ko", "nl", "pt", "ru", "th", "tr", "uk", "zh"];

    static getImageSrc(rdfResource: ARTNode): string {
        var imgSrc;
        //for property roles use indexOf untill property service will be refactored and returns
        //enum roles instead of "owl:ObjectProperty", "owl:DatatypeProperty", ...
        if (rdfResource.isResource()) {
            var role = (<ARTResource>rdfResource).getRole().toLowerCase();
            var explicit = rdfResource.getAdditionalProperty(ResAttribute.EXPLICIT);
            if (role == RDFResourceRolesEnum.cls.toLowerCase()) {
                if (explicit) {
                    imgSrc = "app/assets/images/class.png";
                } else {
                    imgSrc = "app/assets/images/class_imported.png";
                }
            } else if (role == RDFResourceRolesEnum.concept.toLowerCase()) {
                if (explicit) {
                    imgSrc = "app/assets/images/concept.png";
                } else {
                    imgSrc = "app/assets/images/concept_imported.png";
                }
            } else if (role == RDFResourceRolesEnum.individual.toLowerCase()) {
                if (explicit) {
                    imgSrc = "app/assets/images/individual.png";
                } else {
                    imgSrc = "app/assets/images/individual_imported.png";
                }
            } else if (role == RDFResourceRolesEnum.conceptScheme.toLowerCase()) {
                imgSrc = "app/assets/images/conceptScheme.png";
            } else if (role.indexOf(RDFResourceRolesEnum.objectProperty.toLowerCase()) != -1) {
                if (explicit) {
                    imgSrc = "app/assets/images/propObject.png";
                } else {
                    imgSrc = "app/assets/images/propObject_imported.png";       
                }
            } else if (role.indexOf(RDFResourceRolesEnum.datatypeProperty.toLowerCase()) != -1) {
                if (explicit) {
                    imgSrc = "app/assets/images/propDatatype.png";
                } else {
                    imgSrc = "app/assets/images/propDatatype_imported.png";
                }
            } else if (role.indexOf(RDFResourceRolesEnum.annotationProperty.toLowerCase()) != -1) {
                if (explicit) {
                    imgSrc = "app/assets/images/propAnnotation.png";
                } else {
                    imgSrc = "app/assets/images/propAnnotation_imported.png";
                }
            } else if (role.indexOf(RDFResourceRolesEnum.ontologyProperty.toLowerCase()) != -1) {
                if (explicit) {
                    imgSrc = "app/assets/images/propOntology.png";
                } else {
                    imgSrc = "app/assets/images/propOntology_imported.png";
                }
            } else if (role.indexOf(RDFResourceRolesEnum.property.toLowerCase()) != -1) {
                if (explicit) {
                    imgSrc = "app/assets/images/prop.png";
                } else {
                    imgSrc = "app/assets/images/prop_imported.png";
                }
            } else if (role == RDFResourceRolesEnum.xLabel.toLowerCase()) {
                var lang = rdfResource.getAdditionalProperty(ResAttribute.LANG);
                if (lang != undefined && lang != null) {
                    if (this.availableFlagLang.indexOf(lang) != -1) {
                        imgSrc = "app/assets/images/flags/flag_" + lang + ".png";    
                    } else {
                        imgSrc = "app/assets/images/flags/flag_unknown.png";    
                    }
                }
            }
        } else if (rdfResource.isLiteral()) {
            var lang = (<ARTLiteral>rdfResource).getLang();
            if (lang != undefined && lang != null && lang != "") {
                if (this.availableFlagLang.indexOf(lang) != -1) {
                    imgSrc = "app/assets/images/flags/flag_" + lang + ".png";
                } else {
                    imgSrc = "app/assets/images/flags/flag_unknown.png";
                }
            }
        }
        return imgSrc;
    };
    
    /**
     * Available values for action are: "create" and "delete"
     */
    static getActionPropImageSrc(rdfResource: ARTURIResource, action: string): string {
        var imgSrc;
        var role = rdfResource.getRole().toLowerCase();
        if (role == RDFResourceRolesEnum.cls.toLowerCase()) {
            imgSrc = "app/assets/images/class_" + action + ".png";    
        } else if (role == RDFResourceRolesEnum.concept.toLowerCase()) {
            imgSrc = "app/assets/images/concept_" + action + ".png";
        } else if (role == RDFResourceRolesEnum.individual.toLowerCase()) {
            imgSrc = "app/assets/images/individual_" + action + ".png";
        } else if (role == RDFResourceRolesEnum.conceptScheme.toLowerCase()) {
            imgSrc = "app/assets/images/conceptScheme_" + action + ".png";
        } else if (role.indexOf(RDFResourceRolesEnum.objectProperty.toLowerCase()) != -1) {
            imgSrc = "app/assets/images/propObject_" + action + ".png";
        } else if (role.indexOf(RDFResourceRolesEnum.datatypeProperty.toLowerCase()) != -1) {
            imgSrc = "app/assets/images/propDatatype_" + action + ".png";
        } else if (role.indexOf(RDFResourceRolesEnum.annotationProperty.toLowerCase()) != -1) {
            imgSrc = "app/assets/images/propAnnotation_" + action + ".png";
        } else if (role.indexOf(RDFResourceRolesEnum.ontologyProperty.toLowerCase()) != -1) {
            imgSrc = "app/assets/images/propOntology_" + action + ".png";
        } else if (role.indexOf(RDFResourceRolesEnum.property.toLowerCase()) != -1) {
            imgSrc = "app/assets/images/prop_" + action + ".png";
        }
        return imgSrc
    }
    
    static getFlagImgSrc(langTag: string): string {
        return "app/assets/images/flags/flag_" + langTag + ".png";
    }

}