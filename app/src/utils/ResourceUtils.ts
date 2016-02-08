import {Injectable} from 'angular2/core';
import {ARTNode, ARTResource, ARTURIResource, ARTBNode, ARTLiteral, ARTPredicateObjects} from "./ARTResources";

@Injectable()
export class ResourceUtils {
    
    private availableFlagLang = ["ar", "cs", "de", "el", "en", "es", "fr", "hi", "it", "ja", 
            "ko", "nl", "pt", "ru", "th", "tr", "uk", "zh"];

    getImageSrc(rdfResource: ARTNode): string {
        var imgSrc;
        if (rdfResource.isResource()) {
            var role = (<ARTResource>rdfResource).getRole().toLowerCase();
            var explicit = rdfResource.getAdditionalProperty("explicit");
            var deleteForbidden = rdfResource.getAdditionalProperty("deleteForbidden");//TEMP untill refactor of Property service server side
            if (role == "cls") {
                if (explicit) {
                    imgSrc = "app/assets/images/class.png";
                } else {
                    imgSrc = "app/assets/images/class_imported.png";
                }
            } else if (role == "concept") {
                if (explicit) {
                    imgSrc = "app/assets/images/concept.png";
                } else {
                    imgSrc = "app/assets/images/concept_imported.png";
                }
            } else if (role == "individual") {
                if (explicit) {
                    imgSrc = "app/assets/images/individual.png";
                } else {
                    imgSrc = "app/assets/images/individual_imported.png";
                }
            } else if (role == "conceptscheme") {
                imgSrc = "app/assets/images/conceptScheme.png";
            } else if (role.indexOf("objectproperty") != -1) {
                if (explicit || (deleteForbidden != undefined && !deleteForbidden)) {
                    imgSrc = "app/assets/images/propObject.png";
                } else {
                    imgSrc = "app/assets/images/propObject_imported.png";       
                }
            } else if (role.indexOf("datatypeproperty") != -1) {
                if (explicit || (deleteForbidden != undefined && !deleteForbidden)) {
                    imgSrc = "app/assets/images/propDatatype.png";
                } else {
                    imgSrc = "app/assets/images/propDatatype_imported.png";
                }
            } else if (role.indexOf("annotationproperty") != -1) {
                if (explicit || (deleteForbidden != undefined && !deleteForbidden)) {
                    imgSrc = "app/assets/images/propAnnotation.png";
                } else {
                    imgSrc = "app/assets/images/propAnnotation_imported.png";
                }
            } else if (role.indexOf("ontologyproperty") != -1) {
                if (explicit || (deleteForbidden != undefined && !deleteForbidden)) {
                    imgSrc = "app/assets/images/propOntology.png";
                } else {
                    imgSrc = "app/assets/images/propOntology_imported.png";
                }
            } else if (role.indexOf("property") != -1) {
                if (explicit || (deleteForbidden != undefined && !deleteForbidden)) {
                    imgSrc = "app/assets/images/prop.png";
                } else {
                    imgSrc = "app/assets/images/prop_imported.png";
                }
            } else if (role == "xlabel") {
                var lang = rdfResource.getAdditionalProperty("lang");
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
            if (lang != undefined && lang != null) {
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
    getActionPropImageSrc(rdfResource: ARTURIResource, action: string): string {
        var imgSrc;
        var role = rdfResource.getRole().toLowerCase();
        if (role == "cls") {
            imgSrc = "app/assets/images/class_" + action + ".png";    
        } else if (role == "concept") {
            imgSrc = "app/assets/images/concept_" + action + ".png";
        } else if (role == "individual") {
            imgSrc = "app/assets/images/individual_" + action + ".png";
        } else if (role == "conceptscheme") {
            imgSrc = "app/assets/images/conceptScheme_" + action + ".png";
        } else if (role.indexOf("objectproperty") != -1) {
            imgSrc = "app/assets/images/propObject_" + action + ".png";
        } else if (role.indexOf("datatypeproperty") != -1) {
            imgSrc = "app/assets/images/propDatatype_" + action + ".png";
        } else if (role.indexOf("annotationproperty") != -1) {
            imgSrc = "app/assets/images/propAnnotation_" + action + ".png";
        } else if (role.indexOf("ontologyproperty") != -1) {
            imgSrc = "app/assets/images/propOntology_" + action + ".png";
        } else if (role.indexOf("property") != -1) {
            imgSrc = "app/assets/images/prop_" + action + ".png";
        }
        return imgSrc
    }

}