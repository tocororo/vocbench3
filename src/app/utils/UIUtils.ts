import { ElementRef } from "@angular/core";
import { ARTLiteral, ARTNode, ARTResource, RDFResourceRolesEnum, ResAttribute } from "../models/ARTResources";
import { OWL, RDF, XmlSchema } from "../models/Vocabulary";
import { ResAction } from "./RoleActionResolver";


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
        for (let i = 0; i < UIUtils.pendingBlockingDiv.length; i++) {
            UIUtils.pendingBlockingDiv[i].style.display = "none";
        }
        UIUtils.pendingBlockingDiv = []; //empty the blocking div list
    }

    private static classImgSrc = "./assets/images/icons/res/class.png";
    private static classImportedImgSrc = "./assets/images/icons/res/class_imported.png";
    private static classDeprecatedImgSrc = "./assets/images/icons/res/class_deprecated.png";
    private static classImportedDeprecatedImgSrc = "./assets/images/icons/res/class_imported_deprecated.png";
    private static classDefVocImgSrc = "./assets/images/icons/res/class_defvoc.png";//how to use?
    private static classDefVocDeprecatedImgSrc = "./assets/images/icons/res/class_defvoc_deprecated.png";//how to use?

    private static conceptImgSrc = "./assets/images/icons/res/concept.png";
    private static conceptImportedImgSrc = "./assets/images/icons/res/concept_imported.png";
    private static conceptDeprecatedImgSrc = "./assets/images/icons/res/concept_deprecated.png";
    private static conceptImportedDeprecatedImgSrc = "./assets/images/icons/res/concept_imported_deprecated.png";

    private static conceptSchemeImgSrc = "./assets/images/icons/res/conceptScheme.png";
    private static conceptSchemeImportedImgSrc = "./assets/images/icons/res/conceptScheme_imported.png";
    private static conceptSchemeDeprecatedImgSrc = "./assets/images/icons/res/conceptScheme_deprecated.png";
    private static conceptSchemeImportedDeprecatedImgSrc = "./assets/images/icons/res/conceptScheme_imported";

    private static collectionImgSrc = "./assets/images/icons/res/collection.png";
    private static collectionImportedImgSrc = "./assets/images/icons/res/collection_imported.png";
    private static collectionDeprecatedImgSrc = "./assets/images/icons/res/collection_deprecated.png";
    private static collectionImportedDeprecatedImgSrc = "./assets/images/icons/res/collection_imported_deprecated.png";

    private static datatypeImgSrc = "./assets/images/icons/res/datatype.png";
    private static datatypeImportedImgSrc = "./assets/images/icons/res/datatype_imported.png";
    private static datatypeDeprecatedImgSrc = "./assets/images/icons/res/datatype_deprecated.png";
    private static datatypeImportedDeprecatedImgSrc = "./assets/images/icons/res/datatype_imported_deprecated.png";
    
    private static individualImgSrc = "./assets/images/icons/res/individual.png";
    private static individualImportedImgSrc = "./assets/images/icons/res/individual_imported.png";
    private static individualDeprecatedImgSrc = "./assets/images/icons/res/individual_deprecated.png";
    private static individualImportedDeprecatedImgSrc = "./assets/images/icons/res/individual_imported_deprecated.png";

    private static lexiconImgSrc = "./assets/images/icons/res/lexicon.png";
    private static lexiconImportedImgSrc = "./assets/images/icons/res/lexicon_imported.png";
    private static lexiconDeprecatedImgSrc = "./assets/images/icons/res/lexicon_deprecated.png";
    private static lexiconImportedDeprecatedImgSrc = "./assets/images/icons/res/lexicon_imported_deprecated.png";

    private static lexicEntryImgSrc = "./assets/images/icons/res/lexEntry.png";
    private static lexicEntryImportedImgSrc = "./assets/images/icons/res/lexEntry_imported.png";
    private static lexicEntryDeprecatedImgSrc = "./assets/images/icons/res/lexEntry_deprecated.png";
    private static lexicEntryImportedDeprecatedImgSrc = "./assets/images/icons/res/lexEntry_imported_deprecated.png";

    private static lexicSenseImgSrc = "./assets/images/icons/res/ontolexLexicalSense.png";
    private static lexicSenseImportedImgSrc = "./assets/images/icons/res/ontolexLexicalSense_imported.png";
    private static lexicSenseDeprecatedImgSrc = "./assets/images/icons/res/ontolexLexicalSense_deprecated.png";
    private static lexicSenseImportedDeprecatedImgSrc = "./assets/images/icons/res/ontolexLexicalSense_imported_deprecated.png";

    private static lexicalFormImgSrc = "./assets/images/icons/res/lexForm.png";
    private static lexicalFormImportedImgSrc = "./assets/images/icons/res/lexForm_imported.png";
    private static lexicalFormDeprecatedImgSrc = "./assets/images/icons/res/lexForm_deprecated.png";
    private static lexicalFormImportedDeprecatedImgSrc = "./assets/images/icons/res/lexForm_imported_deprecated.png";

    private static orderedCollectionImgSrc = "./assets/images/icons/res/orderedCollection.png";
    private static orderedCollectionImportedImgSrc = "./assets/images/icons/res/orderedCollection_imported.png";
    private static orderedCollectionDeprecatedImgSrc = "./assets/images/icons/res/orderedCollection_deprecated.png";
    private static orderedCollectionImportedDeprecatedImgSrc = "./assets/images/icons/res/orderedCollection_imported_deprecated.png";

    private static xLabelImgSrc = "./assets/images/icons/res/xLabel.png";
    private static xLabelImportedImgSrc = "./assets/images/icons/res/xLabel_imported.png";
    private static xLabelDeprecatedImgSrc = "./assets/images/icons/res/xLabel_deprecated.png";
    private static xLabelImportedDeprecatedImgSrc = "./assets/images/icons/res/xLabel_imported_deprecated.png";
    
    private static ontologyImgSrc = "./assets/images/icons/res/ontology.png";
    
    private static propImgSrc = "./assets/images/icons/res/prop.png";
    private static propImportedImgSrc = "./assets/images/icons/res/prop_imported.png";
    private static propDeprecatedImgSrc = "./assets/images/icons/res/prop_deprecated.png";
    private static propImportedDeprecatedImgSrc = "./assets/images/icons/res/prop_imported_deprecated.png";
    
    private static propObjectImgSrc = "./assets/images/icons/res/propObject.png";
    private static propObjectImportedImgSrc = "./assets/images/icons/res/propObject_imported.png";
    private static propObjectDeprecatedImgSrc = "./assets/images/icons/res/propObject_deprecated.png";
    private static propObjectImportedDeprecatedImgSrc = "./assets/images/icons/res/propObject_imported_deprecated.png";
    
    private static propDatatypeImgSrc = "./assets/images/icons/res/propDatatype.png";
    private static propDatatypeImportedImgSrc = "./assets/images/icons/res/propDatatype_imported.png";
    private static propDatatypeDeprecatedImgSrc = "./assets/images/icons/res/propDatatype_deprecated.png";
    private static propDatatypeImportedDeprecatedImgSrc = "./assets/images/icons/res/propDatatype_imported_deprecated.png";
    
    private static propAnnotationImgSrc = "./assets/images/icons/res/propAnnotation.png";
    private static propAnnotationImportedImgSrc = "./assets/images/icons/res/propAnnotation_imported.png";
    private static propAnnotationDeprecatedImgSrc = "./assets/images/icons/res/propAnnotation_deprecated.png";
    private static propAnnotationImportedDeprecatedImgSrc = "./assets/images/icons/res/propAnnotation_imported_deprecated.png";
    
    private static propOntologyImgSrc = "./assets/images/icons/res/propOntology.png";
    private static propOntologyImportedImgSrc = "./assets/images/icons/res/propOntology_imported.png";
    private static propOntologyDeprecatedImgSrc = "./assets/images/icons/res/propOntology_deprecated.png";
    private static propOntologyImportedDeprecatedImgSrc = "./assets/images/icons/res/propOntology_imported_deprecated.png";

    private static mentionImgSrc = "./assets/images/icons/res/mention.png"; 

    private static untypedIndividualImgSrc = "./assets/images/icons/res/untyped_individual.png"; 

    static getImageSrc(rdfResource: ARTNode): string {
        let imgSrc: string;
        if (rdfResource instanceof ARTResource) {
            let role: RDFResourceRolesEnum = rdfResource.getRole();
            let deprecated: boolean = rdfResource.getAdditionalProperty(ResAttribute.DEPRECATED);
            let explicit: boolean = rdfResource.getAdditionalProperty(ResAttribute.EXPLICIT) ||
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
                if (rdfResource.getAdditionalProperty(ResAttribute.LANG) != null) { //has a language => use the flag icon
                    imgSrc = this.getFlagImgSrc(rdfResource.getAdditionalProperty(ResAttribute.LANG));
                } else if (rdfResource.getAdditionalProperty(ResAttribute.DATA_TYPE) != null) {
                    imgSrc = this.getDatatypeImgSrc(rdfResource.getAdditionalProperty(ResAttribute.DATA_TYPE));
                } else {
                    if (!explicit) {
                        imgSrc = this.individualImportedImgSrc;
                        if (deprecated) {
                            imgSrc = this.individualImportedDeprecatedImgSrc;
                        }
                    } else if (deprecated) {
                        imgSrc = this.individualDeprecatedImgSrc;
                    }
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
                 * If the role is mention, it means that the resource has no nature.
                 * In this case the resource is not necessary a mention, in fact it could be a reified resource in a custom form preview, 
                 * so check if it has a language or a datatype
                 */
                if (rdfResource.getAdditionalProperty(ResAttribute.LANG) != null) { //has a language => use the flag icon
                    imgSrc = this.getFlagImgSrc(rdfResource.getAdditionalProperty(ResAttribute.LANG));
                } else if (rdfResource.getAdditionalProperty(ResAttribute.DATA_TYPE) != null) {
                    imgSrc = this.getDatatypeImgSrc(rdfResource.getAdditionalProperty(ResAttribute.DATA_TYPE));
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
        } else if (rdfResource instanceof ARTLiteral) {
            let lang: string = rdfResource.getLang();
            let datatype: string = rdfResource.getDatatype();
            if (lang != null) {
                imgSrc = this.getFlagImgSrc(lang);
            } else if (datatype != null) {
                if (datatype == XmlSchema.language.getURI()) {
                    imgSrc = this.getFlagImgSrc(rdfResource.getValue());
                } else {
                    imgSrc = this.getDatatypeImgSrc(datatype);
                }
            } else { //no lang or datatype => return the unknown datatype icon
                imgSrc = this.getDatatypeImgSrc(null);
            }
        }
        return imgSrc;
    }

    static getRoleImageSrc(role: RDFResourceRolesEnum) {
        if (role == RDFResourceRolesEnum.concept) {
            return this.conceptImgSrc;
        } else if (role == RDFResourceRolesEnum.conceptScheme) {
            return this.conceptSchemeImgSrc;
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
        if (role == RDFResourceRolesEnum.vartransTranslationSet) { //translationSet has no actions icon => fallback to individual icons
            role = RDFResourceRolesEnum.individual;
        }
        return "./assets/images/icons/actions/" + role + "_" + action + ".png";
    }

    static getFlagImgSrc(langTag: string): string {
        langTag = langTag != null ? langTag.toLowerCase() : null;
        let imgSrc: string;
        if (langTag != null) {
            imgSrc = "./assets/images/flags/flag_" + langTag + ".png";
        } else {
            imgSrc = "./assets/images/flags/flag_unknown.png";
        }
        return imgSrc;
    }

    static getDatatypeImgSrc(datatype: string): string {
        let imgSrc: string;
        if (datatype == XmlSchema.dateTime.getURI() || datatype == XmlSchema.dateTimeStamp.getURI()) {
            imgSrc = "./assets/images/icons/res/datetime.png";
        } else if (datatype == XmlSchema.date.getURI()) {
            imgSrc = "./assets/images/icons/res/date.png";
        } else if (datatype == XmlSchema.time.getURI()) {
            imgSrc = "./assets/images/icons/res/time.png";
        } else if (datatype == RDF.xmlLiteral.getURI() || datatype == XmlSchema.string.getURI() || 
            datatype == XmlSchema.normalizedString.getURI()) {
            imgSrc = "./assets/images/icons/res/string.png";
        } else if (datatype == XmlSchema.boolean.getURI()) {
            imgSrc = "./assets/images/icons/res/boolean.png";
        } else if (datatype == OWL.rational.getURI() || datatype == OWL.real.getURI() ||
            datatype == XmlSchema.byte.getURI() || datatype == XmlSchema.decimal.getURI() || datatype == XmlSchema.double.getURI() || 
            datatype == XmlSchema.float.getURI() || datatype == XmlSchema.int.getURI() || datatype == XmlSchema.integer.getURI() || 
            datatype == XmlSchema.long.getURI() || datatype == XmlSchema.negativeInteger.getURI() || 
            datatype == XmlSchema.nonNegativeInteger.getURI() || datatype == XmlSchema.nonPositiveInteger.getURI() || 
            datatype == XmlSchema.positiveInteger.getURI() || datatype == XmlSchema.short.getURI() || 
            datatype == XmlSchema.unsignedByte.getURI() || datatype == XmlSchema.unsignedInt.getURI() || 
            datatype == XmlSchema.unsignedLong.getURI() || datatype == XmlSchema.unsignedShort.getURI()) {
            imgSrc = "./assets/images/icons/res/number.png";
        } else {
            imgSrc = "./assets/images/icons/res/unknown_datatype.png";
        }
        return imgSrc;
    }

    /**
     * 6 themes for which exist 6 css class pairs: .bg-theme-IDX, .bg-theme-alt-IDX
     */
    public static themes: number[] = [0, 1, 2, 3, 4, 5, 6];

    /**
     * This method is needed in order to face cross-browser compatibility with full size modals (modals that stretch to fill up to 95vh).
     * Note: This method must be called only after the view is initialized, so preferrable in ngAfterViewInit()
     * @param elementRef 
     * @param full if false, undo the full size previously set (in case)
     */
    public static setFullSizeModal(elementRef: ElementRef, full: boolean = true) {
        let modalContentElement: HTMLElement = elementRef.nativeElement.parentElement;
        if (full) {
            modalContentElement.style.setProperty("flex", "1");
        } else {
            modalContentElement.style.removeProperty("flex");
        }
        
    }

}

/**
 * Useful for trees and nodes to be aware of the context where they are
 */
export enum TreeListContext {
    clsIndTree = 'clsIndTree', //usefull to show instance number in some context
    dataPanel = 'dataPanel', //context for trees and lists inside the "multi-panel" (Class, Concept, Scheme,...) in Data page
    addPropValue = 'addPropValue', //for trees and lists inside the addPropertyValue modal (useful to select the new added resource in this context)
}