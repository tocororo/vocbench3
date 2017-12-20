import {
    ARTNode, ARTResource, ARTURIResource, ARTBNode, ARTLiteral,
    ARTPredicateObjects, ResAttribute, RDFResourceRolesEnum
} from "../models/ARTResources";
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




    private static availableFlagLang = ["ar", "be", "bg", "bn", "cs", "da", "de", "el", "en", "en-GB", "en-US", "es", "et", "fa", "fr", "fi", "ga", 
        "hi", "hr", "hu", "hy", "id", "it", "ja", "ka", "km", "ko", "lv", "nl", "no", "pl", "pt", "ro", "ru", "sk", "sl", "sq", "sr", "sv",
        "th", "tr", "uk", "vi", "zh"];


    private static classImgSrc = require("../../assets/images/icons/res/class.png");
    private static classImportedImgSrc = require("../../assets/images/icons/res/class_imported.png");
    private static classDeprecatedImgSrc = require("../../assets/images/icons/res/class_deprecated.png");
    private static classImportedDeprecatedImgSrc = require("../../assets/images/icons/res/class_imported_deprecated.png");
    private static classDefVocImgSrc = require("../../assets/images/icons/res/class_defvoc.png");//how to use?
    private static classDefVocDeprecatedImgSrc = require("../../assets/images/icons/res/class_defvoc_deprecated.png");//how to use?
    
    private static individualImgSrc = require("../../assets/images/icons/res/individual.png");
    private static individualImportedImgSrc = require("../../assets/images/icons/res/individual_imported.png");
    private static individualDeprecatedImgSrc = require("../../assets/images/icons/res/individual_deprecated.png");
    private static individualImportedDeprecatedImgSrc = require("../../assets/images/icons/res/individual_imported_deprecated.png");
    
    private static conceptImgSrc = require("../../assets/images/icons/res/concept.png");
    private static conceptImportedImgSrc = require("../../assets/images/icons/res/concept_imported.png");
    private static conceptDeprecatedImgSrc = require("../../assets/images/icons/res/concept_deprecated.png");
    private static conceptImportedDeprecatedImgSrc = require("../../assets/images/icons/res/concept_imported_deprecated.png");
    
    private static conceptSchemeImgSrc = require("../../assets/images/icons/res/conceptScheme.png");
    private static conceptSchemeImportedImgSrc = require("../../assets/images/icons/res/conceptScheme_imported.png");
    private static conceptSchemeDeprecatedImgSrc = require("../../assets/images/icons/res/conceptScheme_deprecated.png");
    private static conceptSchemeImportedDeprecatedImgSrc = require("../../assets/images/icons/res/conceptScheme_imported_deprecated.png");
    
    private static collectionImgSrc = require("../../assets/images/icons/res/collection.png");
    private static collectionImportedImgSrc = require("../../assets/images/icons/res/collection_imported.png");
    private static collectionDeprecatedImgSrc = require("../../assets/images/icons/res/collection_deprecated.png");
    private static collectionImportedDeprecatedImgSrc = require("../../assets/images/icons/res/collection_imported_deprecated.png");

    private static orderedCollectionImgSrc = require("../../assets/images/icons/res/orderedCollection.png");
    private static orderedCollectionImportedImgSrc = require("../../assets/images/icons/res/orderedCollection_imported.png");
    private static orderedCollectionDeprecatedImgSrc = require("../../assets/images/icons/res/orderedCollection_deprecated.png");
    private static orderedCollectionImportedDeprecatedImgSrc = require("../../assets/images/icons/res/orderedCollection_imported_deprecated.png");

    private static xLabelImgSrc = require("../../assets/images/icons/res/xLabel.png");
    private static xLabelImportedImgSrc = require("../../assets/images/icons/res/xLabel_imported.png");
    private static xLabelDeprecatedImgSrc = require("../../assets/images/icons/res/xLabel_deprecated.png");
    private static xLabelImportedDeprecatedImgSrc = require("../../assets/images/icons/res/xLabel_imported_deprecated.png");
    
    private static ontologyImgSrc = require("../../assets/images/icons/res/ontology.png");
    
    private static propImgSrc = require("../../assets/images/icons/res/prop.png");
    private static propImportedImgSrc = require("../../assets/images/icons/res/prop_imported.png");
    private static propDeprecatedImgSrc = require("../../assets/images/icons/res/prop_deprecated.png");
    private static propImportedDeprecatedImgSrc = require("../../assets/images/icons/res/prop_imported_deprecated.png");
    
    private static propObjectImgSrc = require("../../assets/images/icons/res/propObject.png");
    private static propObjectImportedImgSrc = require("../../assets/images/icons/res/propObject_imported.png");
    private static propObjectDeprecatedImgSrc = require("../../assets/images/icons/res/propObject_deprecated.png");
    private static propObjectImportedDeprecatedImgSrc = require("../../assets/images/icons/res/propObject_imported_deprecated.png");
    
    private static propDatatypeImgSrc = require("../../assets/images/icons/res/propDatatype.png");
    private static propDatatypeImportedImgSrc = require("../../assets/images/icons/res/propDatatype_imported.png");
    private static propDatatypeDeprecatedImgSrc = require("../../assets/images/icons/res/propDatatype_deprecated.png");
    private static propDatatypeImportedDeprecatedImgSrc = require("../../assets/images/icons/res/propDatatype_imported_deprecated.png");
    
    private static propAnnotationImgSrc = require("../../assets/images/icons/res/propAnnotation.png");
    private static propAnnotationImportedImgSrc = require("../../assets/images/icons/res/propAnnotation_imported.png");
    private static propAnnotationDeprecatedImgSrc = require("../../assets/images/icons/res/propAnnotation_deprecated.png");
    private static propAnnotationImportedDeprecatedImgSrc = require("../../assets/images/icons/res/propAnnotation_imported_deprecated.png");
    
    private static propOntologyImgSrc = require("../../assets/images/icons/res/propOntology.png");
    private static propOntologyImportedImgSrc = require("../../assets/images/icons/res/propOntology_imported.png");
    private static propOntologyDeprecatedImgSrc = require("../../assets/images/icons/res/propOntology_deprecated.png");
    private static propOntologyImportedDeprecatedImgSrc = require("../../assets/images/icons/res/propOntology_imported_deprecated.png");

    private static mentionImgSrc = require("../../assets/images/icons/res/mention.png"); 

    static getImageSrc(rdfResource: ARTNode): string {
        var imgSrc: string;
        if (rdfResource.isResource()) {
            var role = rdfResource.getRole().toLowerCase();
            var deprecated: boolean = rdfResource.getAdditionalProperty(ResAttribute.DEPRECATED);
            var explicit: boolean = rdfResource.getAdditionalProperty(ResAttribute.EXPLICIT) ||
                rdfResource.getAdditionalProperty(ResAttribute.EXPLICIT) == undefined;
            if (role == RDFResourceRolesEnum.cls.toLowerCase()) {
                imgSrc = this.classImgSrc;
                if (!explicit) {
                    imgSrc = this.classImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.classImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.classDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.concept.toLowerCase()) {
                imgSrc = this.conceptImgSrc;
                if (!explicit) {
                    imgSrc = this.conceptImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.conceptImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.conceptDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.individual.toLowerCase()) {
                imgSrc = this.individualImgSrc;
                if (!explicit) {
                    imgSrc = this.individualImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.individualImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.individualDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.conceptScheme.toLowerCase()) {
                imgSrc = this.conceptSchemeImgSrc;
                if (!explicit) {
                    imgSrc = this.conceptSchemeImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.conceptSchemeImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.conceptSchemeDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.objectProperty.toLowerCase()) {
                imgSrc = this.propObjectImgSrc;
                if (!explicit) {
                    imgSrc = this.propObjectImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propObjectImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propObjectDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.skosCollection.toLowerCase()) {
                imgSrc = this.collectionImgSrc;
                if (!explicit) {
                    imgSrc = this.collectionImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.collectionImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.collectionDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.skosOrderedCollection.toLowerCase()) {
                imgSrc = this.orderedCollectionImgSrc;
                if (!explicit) {
                    imgSrc = this.orderedCollectionImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.orderedCollectionImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.orderedCollectionDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.datatypeProperty.toLowerCase()) {
                imgSrc = this.propDatatypeImgSrc;
                if (!explicit) {
                    imgSrc = this.propDatatypeImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propDatatypeImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propDatatypeDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.annotationProperty.toLowerCase()) {
                imgSrc = this.propAnnotationImgSrc;
                if (!explicit) {
                    imgSrc = this.propAnnotationImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propAnnotationImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propAnnotationDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontologyProperty.toLowerCase()) {
                imgSrc = this.propOntologyImgSrc;
                if (!explicit) {
                    imgSrc = this.propOntologyImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propOntologyImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propOntologyDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.property.toLowerCase()) {
                imgSrc = this.propImgSrc;
                if (!explicit) {
                    imgSrc = this.propImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontology.toLowerCase()) {
                imgSrc = this.ontologyImgSrc;
            } else if (role == RDFResourceRolesEnum.xLabel.toLowerCase()) {
                let lang: string = rdfResource.getAdditionalProperty(ResAttribute.LANG);
                if (lang != null) {
                    imgSrc = this.getFlagImgSrc(lang);
                } else {
                    imgSrc = this.xLabelImgSrc;
                    if (!explicit) {
                        imgSrc = this.xLabelImportedImgSrc;
                        if (deprecated) {
                            imgSrc = this.xLabelImportedDeprecatedImgSrc;
                        }
                    } else if (deprecated) {
                        imgSrc = this.xLabelDeprecatedImgSrc;
                    }
                }
            } else if (role == RDFResourceRolesEnum.mention.toLocaleLowerCase()) {
                imgSrc = this.mentionImgSrc;
                // if role is not defined and rdfResource is a URIRes which baseURI is not the project baseURI
                if (rdfResource instanceof ARTURIResource && !rdfResource.getURI().startsWith(VBContext.getWorkingProject().getBaseURI())) {
                    imgSrc = this.mentionImgSrc; //it is a mentrion
                } else { //else set individual image as default
                    imgSrc = this.individualImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.dataRange.toLocaleLowerCase()) {
                imgSrc = this.classImgSrc;
                if (!explicit) {
                    imgSrc = this.classImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.classImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.classDeprecatedImgSrc;
                }
            } else { //unknown role (none of the previous roles)
                imgSrc = this.individualImgSrc;
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

    static getRoleImageSrc(role: RDFResourceRolesEnum) {
        if (role == RDFResourceRolesEnum.concept) {
            return this.conceptImgSrc;
        } else if (role == RDFResourceRolesEnum.conceptScheme) {
            return this.conceptSchemeImgSrc
        } else if (role == RDFResourceRolesEnum.cls) {
            return this.classImgSrc;
        } else if (role == RDFResourceRolesEnum.individual) {
            return this.individualImgSrc;
        } else if (role == RDFResourceRolesEnum.skosCollection) {
            return this.collectionImgSrc;
        } else if (role == RDFResourceRolesEnum.skosOrderedCollection) {
            return this.orderedCollectionImgSrc;
        } else if (role == RDFResourceRolesEnum.property) {
            return this.propImgSrc;
        } else if (role == RDFResourceRolesEnum.annotationProperty) {
            return this.propAnnotationImgSrc;
        } else if (role == RDFResourceRolesEnum.datatypeProperty) {
            return this.propDatatypeImgSrc;
        } else if (role == RDFResourceRolesEnum.objectProperty) {
            return this.propObjectImgSrc;
        } else if (role == RDFResourceRolesEnum.ontologyProperty) {
            return this.propOntologyImgSrc;
        } else if (role == RDFResourceRolesEnum.xLabel) {
            return this.xLabelImgSrc;
        }
    }

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
            //look for something like http://<hostname>:<port>/app.<hash>.css (hash is optional)
            if (sheets.item(i).href.includes("app.") && sheets.item(i).href.endsWith(".css")) {
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

/**
 * Useful for trees and nodes to be aware of the context where they are
 */
export enum TreeListContext {
    clsIndTree = 'clsIndTree'
}