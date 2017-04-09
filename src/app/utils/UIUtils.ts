import {
    ARTNode, ARTResource, ARTURIResource, ARTBNode, ARTLiteral,
    ARTPredicateObjects, ResAttribute, RDFResourceRolesEnum
} from "../models/ARTResources";
import { Languages } from "../models/LanguagesCountries"
import { XmlSchema } from "../models/Vocabulary"


export class UIUtils {

    /* Loading div should be shown only after 500ms after an http request is sent.
     * If a request is resolved before 500ms (the response is recieved in 500ms) the div doesn't need to be shown.
     * The following list contains the divs that should be shown.
     */
    private static pendingBlockingDiv: HTMLElement[] = []; //list of div that is waiting to show

    /**
     * This method should be invoked when a request is sent.
     * The blocking div is added to the list of pending blocking div.
     * After 500ms if the blocking div is still in the list, show the div
     */
    static startLoadingDiv(blockingDiv: HTMLElement) {
        UIUtils.pendingBlockingDiv.push(blockingDiv); //add the blocking div to the pending blocking div
        setInterval(
            () => {
                if (UIUtils.pendingBlockingDiv.indexOf(blockingDiv) != -1) {
                    blockingDiv.style.display = "block";
                }
            },
            500);
    }

    /**
     * This method should be invoked when a request is resolved
     * The blocking div is hidden and removed from the list of pending blocking div,
     * so after the 500ms in startLoadingDiv the div is not shown
     */
    static stopLoadingDiv(blockingDiv: HTMLElement) {
        UIUtils.pendingBlockingDiv.splice(UIUtils.pendingBlockingDiv.indexOf(blockingDiv));
        blockingDiv.style.display = "none";
    }




    private static availableFlagLang = ["ar", "cs", "da", "de", "el", "en", "en-GB", "en-US",
        "es", "fa", "fr", "hi", "hu", "it", "ja", "ko", "nl", "pl", "pt", "ro", "ru", "sk",
        "sv", "th", "tr", "uk", "zh"];

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
        var ontologyImgSrc = require("../../assets/images/ontology.png");
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
            } else if (role == RDFResourceRolesEnum.ontology.toLowerCase()) {
                imgSrc = ontologyImgSrc;
            } else if (role == RDFResourceRolesEnum.xLabel.toLowerCase()) {
                let lang: string = rdfResource.getAdditionalProperty(ResAttribute.LANG);
                if (lang != null) {
                    imgSrc = this.getFlagImgSrc(lang);
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
            let datatype: string = (<ARTLiteral>rdfResource).getDatatype();
            if (lang != null) {
                imgSrc = this.getFlagImgSrc(lang);
            } else if (datatype != null) {
                imgSrc = this.getDatatypeImgSrc(datatype);
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
        var imgSrc: string;
        if (langTag != null && this.availableFlagLang.indexOf(langTag) != -1) {
            imgSrc = require("../../assets/images/flags/flag_" + langTag + ".png");
        } else {
            imgSrc = require("../../assets/images/flags/flag_unknown.png");
        }
        return imgSrc;
    }

    static getDatatypeImgSrc(datatype: string): string {
        var imgSrc: string;
        if (datatype == XmlSchema.dateTime.getURI()) {
            imgSrc = require("../../assets/images/datetime.png");
        } else if (datatype == XmlSchema.date.getURI()) {
            imgSrc = require("../../assets/images/date.png");
        } else if (datatype == XmlSchema.time.getURI()) {
            imgSrc = require("../../assets/images/time.png");
        }
        return imgSrc;
    }

}