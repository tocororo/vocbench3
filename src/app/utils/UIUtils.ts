import { ARTLiteral, ARTNode, ARTURIResource, RDFResourceRolesEnum, ResAttribute, ARTResource } from "../models/ARTResources";
import { OWL, RDF, XmlSchema } from "../models/Vocabulary";
import { VBContext } from "./VBContext";
import { ResAction } from "./RoleActionResolver";
import { ElementRef } from "@angular/core";


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

    private static datatypeImgSrc = require("../../assets/images/icons/res/datatype.png");
    private static datatypeImportedImgSrc = require("../../assets/images/icons/res/datatype_imported.png");
    private static datatypeDeprecatedImgSrc = require("../../assets/images/icons/res/datatype_deprecated.png");
    private static datatypeImportedDeprecatedImgSrc = require("../../assets/images/icons/res/datatype_imported_deprecated.png");

    private static lexiconImgSrc = require("../../assets/images/icons/res/lexicon.png");
    private static lexiconImportedImgSrc = require("../../assets/images/icons/res/lexicon_imported.png");
    private static lexiconDeprecatedImgSrc = require("../../assets/images/icons/res/lexicon_deprecated.png");
    private static lexiconImportedDeprecatedImgSrc = require("../../assets/images/icons/res/lexicon_imported_deprecated.png");

    private static lexicEntryImgSrc = require("../../assets/images/icons/res/lexEntry.png");
    private static lexicEntryImportedImgSrc = require("../../assets/images/icons/res/lexEntry_imported.png");
    private static lexicEntryDeprecatedImgSrc = require("../../assets/images/icons/res/lexEntry_deprecated.png");
    private static lexicEntryImportedDeprecatedImgSrc = require("../../assets/images/icons/res/lexEntry_imported_deprecated.png");

    private static lexicSenseImgSrc = require("../../assets/images/icons/res/ontolexLexicalSense.png");
    private static lexicSenseImportedImgSrc = require("../../assets/images/icons/res/ontolexLexicalSense_imported.png");
    private static lexicSenseDeprecatedImgSrc = require("../../assets/images/icons/res/ontolexLexicalSense_deprecated.png");
    private static lexicSenseImportedDeprecatedImgSrc = require("../../assets/images/icons/res/ontolexLexicalSense_imported_deprecated.png");

    private static lexicalFormImgSrc = require("../../assets/images/icons/res/lexForm.png");
    private static lexicalFormImportedImgSrc = require("../../assets/images/icons/res/lexForm_imported.png");
    private static lexicalFormDeprecatedImgSrc = require("../../assets/images/icons/res/lexForm_deprecated.png");
    private static lexicalFormImportedDeprecatedImgSrc = require("../../assets/images/icons/res/lexForm_imported_deprecated.png");

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

    private static untypedIndividualImgSrc = require("../../assets/images/icons/res/untyped_individual.png"); 

    static getImageSrc(rdfResource: ARTNode): string {
        var imgSrc: string;
        if (rdfResource instanceof ARTResource) {
            var role: RDFResourceRolesEnum = rdfResource.getRole();
            var deprecated: boolean = rdfResource.getAdditionalProperty(ResAttribute.DEPRECATED);
            var explicit: boolean = rdfResource.getAdditionalProperty(ResAttribute.EXPLICIT) ||
                rdfResource.getAdditionalProperty(ResAttribute.EXPLICIT) == undefined;
            if (role == RDFResourceRolesEnum.annotationProperty) {
                imgSrc = this.propAnnotationImgSrc;
                if (!explicit) {
                    imgSrc = this.propAnnotationImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propAnnotationImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propAnnotationDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.cls) {
                imgSrc = this.classImgSrc;
                if (!explicit) {
                    imgSrc = this.classImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.classImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.classDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.concept) {
                imgSrc = this.conceptImgSrc;
                if (!explicit) {
                    imgSrc = this.conceptImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.conceptImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.conceptDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.conceptScheme) {
                imgSrc = this.conceptSchemeImgSrc;
                if (!explicit) {
                    imgSrc = this.conceptSchemeImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.conceptSchemeImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.conceptSchemeDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.dataRange) {
                imgSrc = this.datatypeImgSrc;
                if (!explicit) {
                    imgSrc = this.datatypeImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.datatypeImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.datatypeDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.datatypeProperty) {
                imgSrc = this.propDatatypeImgSrc;
                if (!explicit) {
                    imgSrc = this.propDatatypeImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propDatatypeImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propDatatypeDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.individual) {
                imgSrc = this.individualImgSrc;
                if (!explicit) {
                    imgSrc = this.individualImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.individualImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.individualDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.limeLexicon) {
                imgSrc = this.lexiconImgSrc;
                if (!explicit) {
                    imgSrc = this.lexiconImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.lexiconImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.lexiconDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.mention) {
                imgSrc = this.mentionImgSrc;
                /**
                 * If the role is mention, it means that the serialized resource has no nature.
                 * In this case the resource is not necessary a mention, in fact:
                 * - it is a untyped individual in case the resource is a local IRI
                 * - it could be a custom form preview, so check if it has a language
                 */
                if (rdfResource instanceof ARTURIResource && rdfResource.getURI().startsWith(VBContext.getWorkingProject().getBaseURI())) { 
                    imgSrc = this.untypedIndividualImgSrc; //local IRI => untyped individual
                }
                if (rdfResource.getAdditionalProperty(ResAttribute.LANG) != null) { //has a language => use the flag icon
                    imgSrc = this.getFlagImgSrc(rdfResource.getAdditionalProperty(ResAttribute.LANG));
                }
            } else if (role == RDFResourceRolesEnum.objectProperty) {
                imgSrc = this.propObjectImgSrc;
                if (!explicit) {
                    imgSrc = this.propObjectImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propObjectImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propObjectDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontolexForm) {
                imgSrc = this.lexicalFormImgSrc;
                if (!explicit) {
                    imgSrc = this.lexicalFormImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.lexicalFormImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.lexicalFormDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontolexLexicalEntry) {
                imgSrc = this.lexicEntryImgSrc;
                if (!explicit) {
                    imgSrc = this.lexicEntryImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.lexicEntryImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.lexicEntryDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontolexLexicalSense) {
                imgSrc = this.lexicSenseImgSrc;
                if (!explicit) {
                    imgSrc = this.lexicSenseImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.lexicSenseImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.lexicSenseDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.ontology) {
                imgSrc = this.ontologyImgSrc;
            } else if (role == RDFResourceRolesEnum.ontologyProperty) {
                imgSrc = this.propOntologyImgSrc;
                if (!explicit) {
                    imgSrc = this.propOntologyImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propOntologyImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propOntologyDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.property) {
                imgSrc = this.propImgSrc;
                if (!explicit) {
                    imgSrc = this.propImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.propImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.propDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.skosCollection) {
                imgSrc = this.collectionImgSrc;
                if (!explicit) {
                    imgSrc = this.collectionImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.collectionImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.collectionDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.skosOrderedCollection) {
                imgSrc = this.orderedCollectionImgSrc;
                if (!explicit) {
                    imgSrc = this.orderedCollectionImportedImgSrc;
                    if (deprecated) {
                        imgSrc = this.orderedCollectionImportedDeprecatedImgSrc;
                    }
                } else if (deprecated) {
                    imgSrc = this.orderedCollectionDeprecatedImgSrc;
                }
            } else if (role == RDFResourceRolesEnum.xLabel) {
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
        } else { //default
            return this.individualImgSrc;
        }
    }

    static getActionImageSrc(role: RDFResourceRolesEnum, action: ResAction): string {
        return require("../../assets/images/icons/actions/" + role + "_" + action + ".png");
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
        if (datatype == XmlSchema.dateTime.getURI() || datatype == XmlSchema.dateTimeStamp.getURI()) {
            imgSrc = require("../../assets/images/icons/res/datetime.png");
        } else if (datatype == XmlSchema.date.getURI()) {
            imgSrc = require("../../assets/images/icons/res/date.png");
        } else if (datatype == XmlSchema.time.getURI()) {
            imgSrc = require("../../assets/images/icons/res/time.png");
        } else if (datatype == RDF.xmlLiteral.getURI() || datatype == XmlSchema.string.getURI() || 
            datatype == XmlSchema.normalizedString.getURI()) {
            imgSrc = require("../../assets/images/icons/res/string.png");
        } else if (datatype == XmlSchema.boolean.getURI()) {
            imgSrc = require("../../assets/images/icons/res/boolean.png");
        } else if (datatype == OWL.rational.getURI() || datatype == OWL.real.getURI() ||
            datatype == XmlSchema.byte.getURI() || datatype == XmlSchema.decimal.getURI() || datatype == XmlSchema.double.getURI() || 
            datatype == XmlSchema.float.getURI() || datatype == XmlSchema.int.getURI() || datatype == XmlSchema.integer.getURI() || 
            datatype == XmlSchema.long.getURI() || datatype == XmlSchema.negativeInteger.getURI() || 
            datatype == XmlSchema.nonNegativeInteger.getURI() || datatype == XmlSchema.nonPositiveInteger.getURI() || 
            datatype == XmlSchema.positiveInteger.getURI() ||  datatype == XmlSchema.short.getURI() || 
            datatype == XmlSchema.unsignedByte.getURI() || datatype == XmlSchema.unsignedInt.getURI() || 
            datatype == XmlSchema.unsignedLong.getURI() || datatype == XmlSchema.unsignedShort.getURI()) {
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

    /**
     * This method is needed in order to face cross-browser compatibility with full size modals (modals that stretch to fill up to 95vh).
     * Note: This method must be called only after the view is initialized, so preferrable in ngAfterViewInit()
     * @param elementRef 
     */
    public static setFullSizeModal(elementRef: ElementRef) {
        let modalContentElement: HTMLElement = elementRef.nativeElement.parentElement;
        modalContentElement.style.setProperty("flex", "1");
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
    clsIndTree = 'clsIndTree', //usefull to show instance number in some context
    dataPanel = 'dataPanel' //context for trees and list inside the "multi-panel" (Class, Concept, Scheme,...) in Data page
}