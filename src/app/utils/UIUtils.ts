import {
    ARTNode, ARTResource, ARTURIResource, ARTBNode, ARTLiteral,
    ARTPredicateObjects, ResAttribute, RDFResourceRolesEnum
} from "../models/ARTResources";
import { Languages } from "../models/LanguagesCountries"
import { XmlSchema } from "../models/Vocabulary"
import { VBContext } from "../utils/VBContext"


export class UIUtils {

    /* Loading div should be shown only after 500ms after an http request is sent.
     * If a request is resolved before 500ms (the response is recieved in 500ms) the div doesn't need to be shown.
     * The following list contains the divs that should be shown.
     */
    private static pendingBlockingDiv: HTMLElement[] = []; //list of div that is waiting to show

    public static blockDivFullScreen: HTMLElement = document.getElementById("blockDivFullScreen");

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

    /**
     * Hides all the blocking divs and remove them from the list of pending blocking divs.
     */
    static stopAllLoadingDiv() {
        //hide all the blocking divs
        for (var i = 0; i < UIUtils.pendingBlockingDiv.length; i++) {
            UIUtils.pendingBlockingDiv[i].style.display = "none";
        }
        UIUtils.pendingBlockingDiv = []; //empty the blocking div list
    }




    private static availableFlagLang = ["ar", "bg", "cs", "da", "de", "el", "en", "en-GB", "en-US", "es", "et", "fa", "fr", "fi", "ga", 
        "hi", "hr", "hu", "id", "it", "ja", "ka", "km", "ko", "lv", "nl", "no", "pl", "pt", "ro", "ru", "sk", "sl", "sq", "sr", "sv", "th", "tr",
        "uk", "vi", "zh"];

    static getImageSrc(rdfResource: ARTNode): string {

        var classImgSrc = require("../../assets/images/icons/res/class.png");
        var classImportedImgSrc = require("../../assets/images/icons/res/class_imported.png");
        var classDeprecatedImgSrc = require("../../assets/images/icons/res/class_deprecated.png");
        var classImportedDeprecatedImgSrc = require("../../assets/images/icons/res/class_imported_deprecated.png");
        var classDefVocImgSrc = require("../../assets/images/icons/res/class_defvoc.png");//how to use?
        var classDefVocDeprecatedImgSrc = require("../../assets/images/icons/res/class_defvoc_deprecated.png");//how to use?
        
        var individualImgSrc = require("../../assets/images/icons/res/individual.png");
        var individualImportedImgSrc = require("../../assets/images/icons/res/individual_imported.png");
        var individualDeprecatedImgSrc = require("../../assets/images/icons/res/individual_deprecated.png");
        var individualImportedDeprecatedImgSrc = require("../../assets/images/icons/res/individual_imported_deprecated.png");
        
        var conceptImgSrc = require("../../assets/images/icons/res/concept.png");
        var conceptImportedImgSrc = require("../../assets/images/icons/res/concept_imported.png");
        var conceptDeprecatedImgSrc = require("../../assets/images/icons/res/concept_deprecated.png");
        var conceptImportedDeprecatedImgSrc = require("../../assets/images/icons/res/concept_imported_deprecated.png");
        
        var conceptSchemeImgSrc = require("../../assets/images/icons/res/conceptScheme.png");
        var conceptSchemeImportedImgSrc = require("../../assets/images/icons/res/conceptScheme_imported.png");
        var conceptSchemeDeprecatedImgSrc = require("../../assets/images/icons/res/conceptScheme_deprecated.png");
        var conceptSchemeImportedDeprecatedImgSrc = require("../../assets/images/icons/res/conceptScheme_imported_deprecated.png");
        
        var collectionImgSrc = require("../../assets/images/icons/res/collection.png");
        var collectionImportedImgSrc = require("../../assets/images/icons/res/collection_imported.png");
        var collectionDeprecatedImgSrc = require("../../assets/images/icons/res/collection_deprecated.png");
        var collectionImportedDeprecatedImgSrc = require("../../assets/images/icons/res/collection_imported_deprecated.png");

        var orderedCollectionImgSrc = require("../../assets/images/icons/res/orderedCollection.png");
        var orderedCollectionImportedImgSrc = require("../../assets/images/icons/res/orderedCollection_imported.png");
        var orderedCollectionDeprecatedImgSrc = require("../../assets/images/icons/res/orderedCollection_deprecated.png");
        var orderedCollectionImportedDeprecatedImgSrc = require("../../assets/images/icons/res/orderedCollection_imported_deprecated.png");

        var xLabelImgSrc = require("../../assets/images/icons/res/xLabel.png");
        var xLabelImportedImgSrc = require("../../assets/images/icons/res/xLabel_imported.png");
        var xLabelDeprecatedImgSrc = require("../../assets/images/icons/res/xLabel_deprecated.png");
        var xLabelImportedDeprecatedImgSrc = require("../../assets/images/icons/res/xLabel_imported_deprecated.png");
        
        var ontologyImgSrc = require("../../assets/images/icons/res/ontology.png");
        
        var propImgSrc = require("../../assets/images/icons/res/prop.png");
        var propImportedImgSrc = require("../../assets/images/icons/res/prop_imported.png");
        var propDeprecatedImgSrc = require("../../assets/images/icons/res/prop_deprecated.png");
        var propImportedDeprecatedImgSrc = require("../../assets/images/icons/res/prop_imported_deprecated.png");
        
        var propObjectImgSrc = require("../../assets/images/icons/res/propObject.png");
        var propObjectImportedImgSrc = require("../../assets/images/icons/res/propObject_imported.png");
        var propObjectDeprecatedImgSrc = require("../../assets/images/icons/res/propObject_deprecated.png");
        var propObjectImportedDeprecatedImgSrc = require("../../assets/images/icons/res/propObject_imported_deprecated.png");
        
        var propDatatypeImgSrc = require("../../assets/images/icons/res/propDatatype.png");
        var propDatatypeImportedImgSrc = require("../../assets/images/icons/res/propDatatype_imported.png");
        var propDatatypeDeprecatedImgSrc = require("../../assets/images/icons/res/propDatatype_deprecated.png");
        var propDatatypeImportedDeprecatedImgSrc = require("../../assets/images/icons/res/propDatatype_imported_deprecated.png");
        
        var propAnnotationImgSrc = require("../../assets/images/icons/res/propAnnotation.png");
        var propAnnotationImportedImgSrc = require("../../assets/images/icons/res/propAnnotation_imported.png");
        var propAnnotationDeprecatedImgSrc = require("../../assets/images/icons/res/propAnnotation_deprecated.png");
        var propAnnotationImportedDeprecatedImgSrc = require("../../assets/images/icons/res/propAnnotation_imported_deprecated.png");
        
        var propOntologyImgSrc = require("../../assets/images/icons/res/propOntology.png");
        var propOntologyImportedImgSrc = require("../../assets/images/icons/res/propOntology_imported.png");
        var propOntologyDeprecatedImgSrc = require("../../assets/images/icons/res/propOntology_deprecated.png");
        var propOntologyImportedDeprecatedImgSrc = require("../../assets/images/icons/res/propOntology_imported_deprecated.png");

        var mentionImgSrc = require("../../assets/images/icons/res/mention.png");

        var imgSrc: string;
        if (rdfResource.isResource()) {
            var role = rdfResource.getRole().toLowerCase();
            var deprecated: boolean = rdfResource.getAdditionalProperty(ResAttribute.DEPRECATED);
            var explicit: boolean = rdfResource.getAdditionalProperty(ResAttribute.EXPLICIT) ||
                rdfResource.getAdditionalProperty(ResAttribute.EXPLICIT) == undefined;
            if (role == RDFResourceRolesEnum.cls.toLowerCase()) {
                imgSrc = classImgSrc;
                if (!explicit) {
                    imgSrc = classImportedImgSrc;
                    if (deprecated) {
                        imgSrc = classImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = classDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.concept.toLowerCase()) {
                imgSrc = conceptImgSrc;
                if (!explicit) {
                    imgSrc = conceptImportedImgSrc;
                    if (deprecated) {
                        imgSrc = conceptImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = conceptDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.individual.toLowerCase()) {
                imgSrc = individualImgSrc;
                if (!explicit) {
                    imgSrc = individualImportedImgSrc;
                    if (deprecated) {
                        imgSrc = individualImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = individualDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.conceptScheme.toLowerCase()) {
                imgSrc = conceptSchemeImgSrc;
                if (!explicit) {
                    imgSrc = conceptSchemeImportedImgSrc;
                    if (deprecated) {
                        imgSrc = conceptSchemeImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = conceptSchemeDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.objectProperty.toLowerCase()) {
                imgSrc = propObjectImgSrc;
                if (!explicit) {
                    imgSrc = propObjectImportedImgSrc;
                    if (deprecated) {
                        imgSrc = propObjectImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = propObjectDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.skosCollection.toLowerCase()) {
                imgSrc = collectionImgSrc;
                if (!explicit) {
                    imgSrc = collectionImportedImgSrc;
                    if (deprecated) {
                        imgSrc = collectionImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = collectionDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.skosOrderedCollection.toLowerCase()) {
                imgSrc = orderedCollectionImgSrc;
                if (!explicit) {
                    imgSrc = orderedCollectionImportedImgSrc;
                    if (deprecated) {
                        imgSrc = orderedCollectionImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = orderedCollectionDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.datatypeProperty.toLowerCase()) {
                imgSrc = propDatatypeImgSrc;
                if (!explicit) {
                    imgSrc = propDatatypeImportedImgSrc;
                    if (deprecated) {
                        imgSrc = propDatatypeImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = propDatatypeDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.annotationProperty.toLowerCase()) {
                imgSrc = propAnnotationImgSrc;
                if (!explicit) {
                    imgSrc = propAnnotationImportedImgSrc;
                    if (deprecated) {
                        imgSrc = propAnnotationImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = propAnnotationDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontologyProperty.toLowerCase()) {
                imgSrc = propOntologyImgSrc;
                if (!explicit) {
                    imgSrc = propOntologyImportedImgSrc;
                    if (deprecated) {
                        imgSrc = propOntologyImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = propOntologyDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.property.toLowerCase()) {
                imgSrc = propImgSrc;
                if (!explicit) {
                    imgSrc = propImportedImgSrc;
                    if (deprecated) {
                        imgSrc = propImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = propDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontology.toLowerCase()) {
                imgSrc = ontologyImgSrc;
            } else if (role == RDFResourceRolesEnum.xLabel.toLowerCase()) {
                let lang: string = rdfResource.getAdditionalProperty(ResAttribute.LANG);
                if (lang != null) {
                    imgSrc = this.getFlagImgSrc(lang);
                } else {
                    imgSrc = xLabelImgSrc;
                    if (!explicit) {
                        imgSrc = xLabelImportedImgSrc;
                        if (deprecated) {
                            imgSrc = xLabelImportedDeprecatedImgSrc;
                        }
                    } else if (deprecated) {
                        imgSrc = xLabelDeprecatedImgSrc;
                    }
                }
            } else if (role == RDFResourceRolesEnum.mention.toLocaleLowerCase()) {
                imgSrc = mentionImgSrc;
                // if role is not defined and rdfResource is a URIRes which baseURI is not the project baseURI
                if (rdfResource instanceof ARTURIResource && !rdfResource.getURI().startsWith(VBContext.getWorkingProject().getBaseURI())) {
                    imgSrc = mentionImgSrc; //it is a mentrion
                } else { //else set individual image as default
                    imgSrc = individualImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.dataRange.toLocaleLowerCase()) {
                imgSrc = classImgSrc;
            } else { //unknown role (none of the previous roles)
                imgSrc = individualImgSrc;
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
            imgSrc = require("../../assets/images/icons/actions/class_" + action + ".png");
        } else if (role == RDFResourceRolesEnum.concept.toLowerCase()) {
            imgSrc = require("../../assets/images/icons/actions/concept_" + action + ".png");
        } else if (role == RDFResourceRolesEnum.individual.toLowerCase()) {
            imgSrc = require("../../assets/images/icons/actions/individual_" + action + ".png");
        } else if (role == RDFResourceRolesEnum.conceptScheme.toLowerCase()) {
            imgSrc = require("../../assets/images/icons/actions/conceptScheme_" + action + ".png");
        } else if (role.indexOf(RDFResourceRolesEnum.objectProperty.toLowerCase()) != -1) {
            imgSrc = require("../../assets/images/icons/actions/propObject_" + action + ".png");
        } else if (role.indexOf(RDFResourceRolesEnum.datatypeProperty.toLowerCase()) != -1) {
            imgSrc = require("../../assets/images/icons/actions/propDatatype_" + action + ".png");
        } else if (role.indexOf(RDFResourceRolesEnum.annotationProperty.toLowerCase()) != -1) {
            imgSrc = require("../../assets/images/icons/actions/propAnnotation_" + action + ".png");
        } else if (role.indexOf(RDFResourceRolesEnum.ontologyProperty.toLowerCase()) != -1) {
            imgSrc = require("../../assets/images/icons/actions/propOntology_" + action + ".png");
        } else if (role.indexOf(RDFResourceRolesEnum.property.toLowerCase()) != -1) {
            imgSrc = require("../../assets/images/icons/actions/prop_" + action + ".png");
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
            imgSrc = require("../../assets/images/icons/res/datetime.png");
        } else if (datatype == XmlSchema.date.getURI()) {
            imgSrc = require("../../assets/images/icons/res/date.png");
        } else if (datatype == XmlSchema.time.getURI()) {
            imgSrc = require("../../assets/images/icons/res/time.png");
        } else if (datatype == XmlSchema.string.getURI()) {
            imgSrc = require("../../assets/images/icons/res/string.png");
        } else if (datatype == XmlSchema.boolean.getURI()) {
            imgSrc = require("../../assets/images/icons/res/boolean.png");
        } else if (datatype == XmlSchema.decimal.getURI() || datatype == XmlSchema.float.getURI() || datatype == XmlSchema.double.getURI()) {
            imgSrc = require("../../assets/images/icons/res/number.png");
        }
        return imgSrc;
    }


    public static themes: Theme[] = [
        { id: 0, mainColor: "#1e4387", altColor: "#7486ab" }, //default
        { id: 1, mainColor: "#283e4a", altColor: "#7aa2b8" },
        { id: 2, mainColor: "#1da1f2", altColor: "#75c6f7" },
        { id: 3, mainColor: "#367c36", altColor: "#5cb85c" },
        { id: 4, mainColor: "#5f5f5f", altColor: "#b3b3b3" },
        { id: 5, mainColor: "#cc181e", altColor: "#ec5f64" },
        { id: 6, mainColor: "#6f5499", altColor: "#a08cc0" }
    ]
    public static resetNavbarTheme() {
        UIUtils.changeNavbarTheme();
    }
    public static changeNavbarTheme(themeId: number = 0) {
        let theme: Theme = UIUtils.themes[0];
        UIUtils.themes.forEach(t => {
            if (t.id == themeId) { theme = t; return };
        });
        var cssRuleCode = document.all ? 'rules' : 'cssRules';
        var sheets: StyleSheetList = document.styleSheets;
        var sheet: StyleSheet;

        for (var i = 0; i < sheets.length; i++) {
            if (sheets.item(i).href.endsWith("app.css")) {
                sheet = sheets.item(i);
                break;
            }
        }

        let rules: CSSRuleList = sheet[cssRuleCode];
        for (var j = 0; j < rules.length; j++) {
            let rule: CSSRule = rules.item(j);
            if (rule instanceof CSSStyleRule) {
                if (rule.selectorText.includes(".navbar-default")) {
                    if (rule.selectorText == ".navbar-default" || 
                        rule.selectorText == ".navbar-default .navbar-collapse, .navbar-default .navbar-form" ||
                        rule.selectorText == ".navbar-default .navbar-brand" ||
                        rule.selectorText == ".navbar-default .navbar-brand:hover, .navbar-default .navbar-brand:focus" ||
                        rule.selectorText == ".navbar-default .navbar-nav > li > a" ||
                        rule.selectorText == ".navbar-default .navbar-toggle"
                    ) {
                        rule.style.backgroundColor = theme.mainColor;
                    } else if (
                        rule.selectorText == ".navbar-default .navbar-nav > li > a:hover, .navbar-default .navbar-nav > li > a:focus" ||
                        rule.selectorText == ".navbar-default .navbar-nav > .active > a, " +
                            ".navbar-default .navbar-nav > .active > a:hover, .navbar-default .navbar-nav > .active > a:focus" ||
                        rule.selectorText == ".navbar-default .navbar-link:hover" ||
                        rule.selectorText == ".navbar-default .navbar-nav > .open > a, " + 
                            ".navbar-default .navbar-nav > .open > a:hover, .navbar-default .navbar-nav > .open > a:focus" ||
                        rule.selectorText == ".navbar-default .navbar-nav .open .dropdown-menu > li > a:hover, " + 
                            ".navbar-default .navbar-nav .open .dropdown-menu > li > a:focus" ||
                        rule.selectorText == ".navbar-default .navbar-nav .open .dropdown-menu > .active > a, " + 
                            ".navbar-default .navbar-nav .open .dropdown-menu > .active > a:hover, " + 
                            ".navbar-default .navbar-nav .open .dropdown-menu > .active > a:focus" ||
                        rule.selectorText == ".navbar-default .navbar-toggle:hover, .navbar-default .navbar-toggle:focus"
                    ) {
                        rule.style.backgroundColor = theme.altColor;
                    }
                }
            }
            
        }
    }

}

export class Theme {
    id: number;
    mainColor: string;
    altColor: string
}