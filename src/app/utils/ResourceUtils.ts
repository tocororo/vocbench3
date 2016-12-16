import {ARTNode, ARTResource, ARTURIResource, ARTBNode, ARTLiteral,
    ARTPredicateObjects, ResAttribute, RDFResourceRolesEnum} from "./ARTResources";

export class ResourceUtils {

    // private static classImgSrc = require("../../assets/images/class.png");
    // private static classImportedImgSrc = require("../../assets/images/class_imported.png");

    private static availableFlagLang = ["ar", "cs", "de", "el", "en", "en-US", "en-GB", "es", "fr", "hi", "it", "ja", 
            "ko", "nl", "pt", "ru", "th", "tr", "uk", "zh"];

    static getImageSrc(rdfResource: ARTNode): string {

        var classImgSrc = require("../../assets/images/class.png");
        var classImportedImgSrc = require("../../assets/images/class_imported.png");
        var individualImgSrc = require("../../assets/images/individual.png");
        var individualImportedImgSrc = require("../../assets/images/individual_imported.png");
        var conceptImgSrc = require("../../assets/images/concept.png");
        var conceptImportedImgSrc = require("../../assets/images/concept_imported.png");
        var conceptSchemeImgSrc = require("../../assets/images/conceptScheme.png");
        var collectionImgSrc = require("../../assets/images/collection.png");
        var collectionImportedImgSrc = require("../../assets/images/collection_imported.png");
        var xLabelImgSrc = require("../../assets/images/xLabel.png");
        var xLabelImportedImgSrc = require("../../assets/images/xLabel_imported.png");
        var propImgSrc = require("../../assets/images/prop.png");
        var propImportedImgSrc = require("../../assets/images/prop_imported.png");
        var propObjectImgSrc = require("../../assets/images/propObject.png");
        var propObjectImportedImgSrc = require("../../assets/images/propObject_imported.png");       
        var propDatatypeImgSrc = require("../../assets/images/propDatatype.png");
        var propDatatypeImportedImgSrc = require("../../assets/images/propDatatype_imported.png");
        var propAnnotationImgSrc = require("../../assets/images/propAnnotation.png");
        var propAnnotationImportedImgSrc = require("../../assets/images/propAnnotation_imported.png");
        var propOntologyImgSrc = require("../../assets/images/propOntology.png");
        var propOntologyImportedImgSrc = require("../../assets/images/propOntology_imported.png");

        var imgSrc: string;
        if (rdfResource.isResource()) {
            var role = (<ARTResource>rdfResource).getRole().toLowerCase();
            var explicit: boolean = rdfResource.getAdditionalProperty(ResAttribute.EXPLICIT) ||
                    rdfResource.getAdditionalProperty(ResAttribute.EXPLICIT) == undefined;
            if (role == RDFResourceRolesEnum.cls.toLowerCase()) {
                if (!explicit) {
                    imgSrc = classImportedImgSrc;
                } else {
                    imgSrc = classImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.concept.toLowerCase()) {
                if (!explicit) {
                    imgSrc = conceptImportedImgSrc;
                } else {
                    imgSrc = conceptImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.individual.toLowerCase()) {
                if (!explicit) {
                    imgSrc = individualImportedImgSrc;
                } else {
                    imgSrc = individualImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.conceptScheme.toLowerCase()) {
                imgSrc = conceptSchemeImgSrc;
            } else if (role == RDFResourceRolesEnum.objectProperty.toLowerCase()) {
                if (!explicit) {
                    imgSrc = propObjectImportedImgSrc;
                } else {
                    imgSrc = propObjectImgSrc;       
                }
            } else if (role == RDFResourceRolesEnum.skosCollection.toLowerCase()) {
                if (!explicit) {
                    imgSrc = collectionImportedImgSrc;
                } else {
                    imgSrc = collectionImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.skosOrderedCollection.toLowerCase()) {
                if (!explicit) {
                    imgSrc = collectionImportedImgSrc;
                } else {
                    imgSrc = collectionImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.datatypeProperty.toLowerCase()) {
                if (!explicit) {
                    imgSrc = propDatatypeImportedImgSrc;
                } else {
                    imgSrc = propDatatypeImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.annotationProperty.toLowerCase()) {
                if (!explicit) {
                    imgSrc = propAnnotationImportedImgSrc;
                } else {
                    imgSrc = propAnnotationImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontologyProperty.toLowerCase()) {
                if (!explicit) {
                    imgSrc = propObjectImportedImgSrc;
                } else {
                    imgSrc = propObjectImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.property.toLowerCase()) {
                if (!explicit) {
                    imgSrc = propImportedImgSrc;
                } else {
                    imgSrc = propImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.xLabel.toLowerCase()) {
                let lang: string = rdfResource.getAdditionalProperty(ResAttribute.LANG);
                if (lang != undefined && lang != null) {
                    if (this.availableFlagLang.indexOf(lang) != -1) {
                        imgSrc = require("../../assets/images/flags/flag_" + lang + ".png");    
                    } else {
                        imgSrc = require("../../assets/images/flags/flag_unknown.png");    
                    }
                } else {
                    if (!explicit) {
                        imgSrc = xLabelImportedImgSrc;
                    } else {
                        imgSrc = xLabelImgSrc;
                    }
                }
            }
        } else if (rdfResource.isLiteral()) {
            let lang: string = (<ARTLiteral>rdfResource).getLang();
            if (lang != undefined && lang != null && lang != "") {
                if (this.availableFlagLang.indexOf(lang) != -1) {
                    imgSrc = require("../../assets/images/flags/flag_" + lang + ".png");
                } else {
                    imgSrc = require("../../assets/images/flags/flag_unknown.png");
                }
            }
        }
        return imgSrc;
    };
    
    /**
     * Available values for action are: "create" and "delete"
     */
    static getActionPropImageSrc(rdfResource: ARTURIResource, action: string): string {
        var imgSrc: string;
        var role = rdfResource.getRole().toLowerCase();
        if (role == RDFResourceRolesEnum.cls.toLowerCase()) {
            imgSrc = require("../../assets/images/class_" + action + ".png");    
        } else if (role == RDFResourceRolesEnum.concept.toLowerCase()) {
            imgSrc = require("../../assets/images/concept_" + action + ".png");
        } else if (role == RDFResourceRolesEnum.individual.toLowerCase()) {
            imgSrc = require("../../assets/images/individual_" + action + ".png");
        } else if (role == RDFResourceRolesEnum.conceptScheme.toLowerCase()) {
            imgSrc = require("../../assets/images/conceptScheme_" + action + ".png");
        } else if (role.indexOf(RDFResourceRolesEnum.objectProperty.toLowerCase()) != -1) {
            imgSrc = require("../../assets/images/propObject_" + action + ".png");
        } else if (role.indexOf(RDFResourceRolesEnum.datatypeProperty.toLowerCase()) != -1) {
            imgSrc = require("../../assets/images/propDatatype_" + action + ".png");
        } else if (role.indexOf(RDFResourceRolesEnum.annotationProperty.toLowerCase()) != -1) {
            imgSrc = require("../../assets/images/propAnnotation_" + action + ".png");
        } else if (role.indexOf(RDFResourceRolesEnum.ontologyProperty.toLowerCase()) != -1) {
            imgSrc = require("../../assets/images/propOntology_" + action + ".png");
        } else if (role.indexOf(RDFResourceRolesEnum.property.toLowerCase()) != -1) {
            imgSrc = require("../../assets/images/prop_" + action + ".png");
        }
        return imgSrc;
    }
    
    static getFlagImgSrc(langTag: string): string {
        return require("../../assets/images/flags/flag_" + langTag + ".png");
    }

}