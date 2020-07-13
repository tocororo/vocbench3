import { Component, ElementRef, EventEmitter, Input, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from "@angular/core";
import { Modal } from "ngx-modialog";
import { ARTResource, ARTURIResource } from "../../models/ARTResources";
import { VersionInfo } from "../../models/History";
import { PropertyServices } from "../../services/propertyServices";
import { HttpServiceContext } from "../../utils/HttpManager";
import { UIUtils } from "../../utils/UIUtils";
import { AbstractResourceView } from "../resourceViewEditor/abstractResourceView";
import { ARTNode, ARTPredicateObjects, ResAttribute } from '../../models/ARTResources';
import { Language, Languages } from '../../models/LanguagesCountries';
import { ResViewPartition } from '../../models/ResourceView';
import { OntoLex, SKOS, SKOSXL } from '../../models/Vocabulary';
import { ResourceViewServices } from '../../services/resourceViewServices';
import { Deserializer } from '../../utils/Deserializer';
import { ResourceUtils, SortAttribute } from '../../utils/ResourceUtils';
import { ProjectContext, VBContext } from '../../utils/VBContext';
import { LanguageBoxComponent } from "./languageBox/languageBoxComponent";

@Component({
    selector: "term-view",
    templateUrl: "./termViewComponent.html",
    styleUrls: ["./termViewComponent.css"],
    host: { class: "vbox" }
})
export class TermViewComponent extends AbstractResourceView {

    @Input() resource: ARTResource;
    @Input() projectCtx: ProjectContext;
    @Input() readonly: boolean = false;
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    @ViewChildren('langBox') langBoxViews: QueryList<LanguageBoxComponent>;
    @ViewChild('blockDiv') blockDivElement: ElementRef;

    private resViewResponse: any = null;
    private unknownHost: boolean = false; //tells if the resource view of the current resource failed to be fetched due to a UnknownHostException
    private unexistingResource: boolean = false; //tells if the requested resource does not exist (empty description)

    private activeVersion: VersionInfo;

    private langStruct: { [key: string]: ARTPredicateObjects[] } = {}; // new struct to map server response where key is a flag.
    private objectKeys: string[]; // takes langStruct keys

    private userAssignedLangs: string[] = VBContext.getProjectUserBinding().getLanguages();
    private allProjectLangs = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectSettings().projectLanguagesSetting // all language to manage case in which user is admin without flags assigned
   
    private broaders: ARTNode[]; // conteins object with broader predicate (skos:broader)
    private definitions: DefinitionStructView[] = [];  // conteins object with definitions predicate (skos:definition) and its lang
    private languages: LangStructView[] = []; // it is used to assign flag status(active/disabled) to flags list (top page under first box)

    private definitionHasCustomRange: boolean; //tells if skos:definition is mapped to CustomRange
    
    private lexicalizationModelType: string;

    constructor(resViewService: ResourceViewServices, modal: Modal, private propService: PropertyServices) {
        super(resViewService, modal);
    }

    ngOnInit() {
        this.lexicalizationModelType = VBContext.getWorkingProject().getLexicalizationModelType();//it's useful to understand project lexicalization

        this.activeVersion = VBContext.getContextVersion();
        /*
        in readonly mode if:
        - specified from outside (@Input readonly already set)
        - the RV is working on an old dump version
        */
        this.readonly = this.readonly || (this.activeVersion != null || HttpServiceContext.getContextVersion() != null);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource'] && changes['resource'].currentValue) {
            //if not the first change, avoid to refresh res view if resource is not changed
            if (!changes['resource'].firstChange) { 
                let prevRes: ARTResource = changes['resource'].previousValue;
                if (prevRes.equals(this.resource)) {
                    return;
                }
            }
            this.buildResourceView(this.resource);//refresh resource view when Input resource changes
        }
    }

    /**
     * This method takes data from server (about resource).
     * @param res 
     */
    public buildResourceView(res: ARTResource) {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        if (this.activeVersion != null) {
            HttpServiceContext.setContextVersion(this.activeVersion); //set temprorarly version
        }
        this.resViewService.getResourceView(res).subscribe(
            stResp => {
                HttpServiceContext.removeContextVersion();
                this.resViewResponse = stResp;
                this.fillPartitions();
                this.initLanguages();
                this.unknownHost = false;
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            },
            (err: Error) => {
                if (err.name.endsWith("UnknownHostException")) {
                    this.unknownHost = true;
                }
            }
        );
    }


    /**
    * Fill broader, lexicalization and notes partitions of the RV and creates a new stuct (called langStruct)
    * 
    */
    private fillPartitions() {
        let resourcePartition: any = this.resViewResponse.resource;
        this.resource = Deserializer.createRDFResource(resourcePartition);
        this.update.emit(this.resource);

        let broadersColl: ARTPredicateObjects[] = this.initPartition(ResViewPartition.broaders, true);
        if (broadersColl != null) {
            let broaderPredObj: ARTPredicateObjects = broadersColl.find(po => po.getPredicate().equals(SKOS.broader));
            if (broaderPredObj != null) {
                this.broaders = broaderPredObj.getObjects();
            }
        }

        this.langStruct = {};

        let lexicalizationsColl: ARTPredicateObjects[] = this.initPartition(ResViewPartition.lexicalizations, false); //the sort is performed in the partition according the language
        if (lexicalizationsColl != null) {
            lexicalizationsColl.forEach(lex => {
                let predicate: ARTURIResource = lex.getPredicate();
                //check if predicate belongs to the lexicalization model (otherwise there will be problems editing values e.g. editing a skos:prefLabel through skosxl service)
                if (!predicate.getURI().startsWith(this.lexicalizationModelType)) return;

                lex.getObjects().forEach((obj: ARTNode) => {
                    let lang = obj.getAdditionalProperty(ResAttribute.LANG);
                    if (lang == null) return;

                    let nodes: ARTNode[] = [];
                    //case in which there are no existing keys equals to that language
                    if (!(lang in this.langStruct) && this.langStruct[lang] == null) {
                        this.langStruct[lang] = [];
                        nodes.push(obj);
                        let predObj = new ARTPredicateObjects(predicate, nodes);
                        this.langStruct[lang].push(predObj);
                    } else { // case in which a key equal to that language already exists 
                        if (!this.langStruct[lang].some(item => item.getPredicate().equals(predicate))) { //case in which there are no objects with that type of predicate
                            nodes.push(obj);
                            let predObj = new ARTPredicateObjects(predicate, nodes);
                            this.langStruct[lang].push(predObj);
                            this.sortPredicates(this.langStruct[lang])
                        } else { // case in which objects with that predicate already exist and I can add others (example: I can have more altLabel)
                            if (!this.langStruct[lang].some(item => { return item.getObjects().some(o => o.equals(obj)) })) { // I check if the object I am analyzing is not present
                                this.langStruct[lang].forEach(item => {
                                    if (item.getPredicate().equals(predicate)) {
                                        item.getObjects().push(obj);
                                    }
                                })
                            }
                        }

                    }
                })

            })
        }

        this.definitions = []
        let notesColl: ARTPredicateObjects[] = this.initPartition(ResViewPartition.notes, true);
        if (notesColl != null) {
            let nodes: ARTNode[] = [];
            let definitionPredObj: ARTPredicateObjects = notesColl.find(po => po.getPredicate().equals(SKOS.definition)); //  here takes only objects with skos:definition predicate
            if (definitionPredObj) { //if there are definitions
                // this.definitions = definitionPredObj.getObjects(); 
                definitionPredObj.getObjects().forEach(def => {
                    this.definitions.push({ definition: def.getShow(), lang: def.getAdditionalProperty(ResAttribute.LANG) }) // it is useful to show "definition + lang" in first box in the UI 
                    this.definitions.sort((a: DefinitionStructView, b: DefinitionStructView) => { // order about lang
                        if (a.lang > b.lang) {
                            return 1
                        }
                        if (a.lang < b.lang) {
                            return -1
                        }
                        return 0;
                    })
                })

            }
            notesColl.forEach(def => {
                if (def.getPredicate().equals(SKOS.definition)) { // there could be several types (editorialNote, changeNote, example etc ..)
                    def.getObjects().forEach((obj: ARTNode) => {
                        let lang = obj.getAdditionalProperty(ResAttribute.LANG);
                        if (lang == null) return;

                        //case in which there are no existing keys equal to the language of the considered definition
                        if (!(lang in this.langStruct) && this.langStruct[lang] == null) {
                            this.langStruct[lang] = [];
                            nodes = [];
                            nodes.push(obj);
                            let predObj = new ARTPredicateObjects(def.getPredicate(), nodes);
                            this.langStruct[lang].push(predObj);
                        } else { // case in which there is already a key equals to the language of the considered definition
                            if (!this.langStruct[lang].some(item => item.getPredicate().equals(SKOS.definition))) { //case in which there are no objects with that type of predicate
                                nodes = [];
                                nodes.push(obj);
                                let predObj = new ARTPredicateObjects(def.getPredicate(), nodes);
                                this.langStruct[lang].push(predObj);
                            } else if (!this.langStruct[lang].some(item => { return item.getObjects().some(o => o.equals(obj)) })) { // case in which objects with that predicate already exist and I can add others
                                this.langStruct[lang].forEach(item => {
                                    if (item.getPredicate().equals(def.getPredicate())) {
                                        item.getObjects().push(obj);
                                    }
                                })
                            }
                        }
                    })
                }
            })

            if (definitionPredObj != null) {
                this.definitionHasCustomRange = definitionPredObj.getPredicate().getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE)
            } else {
                this.propService.getRange(SKOS.definition).subscribe(
                    range => {
                        this.definitionHasCustomRange = range.formCollection && range.formCollection.getForms().length > 0
                    }
                )
            }
        }

        if (
            //these partitions are always returned, even when resource is not defined, so I need to check also if length == 0
            (!this.resViewResponse[ResViewPartition.lexicalizations] || this.resViewResponse[ResViewPartition.lexicalizations].length == 0) &&
            (!this.resViewResponse[ResViewPartition.properties] || this.resViewResponse[ResViewPartition.properties].length == 0) &&
            (!this.resViewResponse[ResViewPartition.types] || this.resViewResponse[ResViewPartition.types].length == 0) &&
            //partitions optional
            !this.resViewResponse[ResViewPartition.broaders] &&
            !this.resViewResponse[ResViewPartition.classaxioms] &&
            !this.resViewResponse[ResViewPartition.constituents] &&
            !this.resViewResponse[ResViewPartition.datatypeDefinitions] &&
            !this.resViewResponse[ResViewPartition.denotations] &&
            !this.resViewResponse[ResViewPartition.disjointProperties] &&
            !this.resViewResponse[ResViewPartition.domains] &&
            !this.resViewResponse[ResViewPartition.equivalentProperties] &&
            !this.resViewResponse[ResViewPartition.evokedLexicalConcepts] &&
            !this.resViewResponse[ResViewPartition.facets] &&
            !this.resViewResponse[ResViewPartition.formBasedPreview] &&
            !this.resViewResponse[ResViewPartition.formRepresentations] &&
            !this.resViewResponse[ResViewPartition.imports] &&
            !this.resViewResponse[ResViewPartition.labelRelations] &&
            !this.resViewResponse[ResViewPartition.lexicalForms] &&
            !this.resViewResponse[ResViewPartition.lexicalSenses] &&
            !this.resViewResponse[ResViewPartition.members] &&
            !this.resViewResponse[ResViewPartition.membersOrdered] &&
            !this.resViewResponse[ResViewPartition.notes] &&
            !this.resViewResponse[ResViewPartition.ranges] &&
            !this.resViewResponse[ResViewPartition.rdfsMembers] &&
            !this.resViewResponse[ResViewPartition.subPropertyChains] &&
            !this.resViewResponse[ResViewPartition.schemes] &&
            !this.resViewResponse[ResViewPartition.subterms] &&
            !this.resViewResponse[ResViewPartition.superproperties] &&
            !this.resViewResponse[ResViewPartition.topconceptof]
        ) {
            this.unexistingResource = true;
        } else {
            this.unexistingResource = false;
        }
        this.objectKeys = Object.keys(this.langStruct).sort();
        // console.log("langStruct", this.langStruct);
    }

    /**
     * Take in input a list of ARTPredicateObjects and sort their predicates:
     *  - skos and skosxl cases: first prefLabel and then altLabel
     * @param list 
     */
    private sortPredicates(list: ARTPredicateObjects[]) {
        if (this.lexicalizationModelType == SKOS.uri) {
            list.sort((second: ARTPredicateObjects, first: ARTPredicateObjects) => {
                if (first.getPredicate().equals(SKOS.prefLabel) && second.getPredicate().equals(SKOS.altLabel)) {
                    return 1;
                }
                if (second.getPredicate().equals(SKOS.prefLabel) && first.getPredicate().equals(SKOS.altLabel)) {
                    return -1;
                }
                return 0;
            })
        } else if (this.lexicalizationModelType == SKOSXL.uri) {
            list.sort((second: ARTPredicateObjects, first: ARTPredicateObjects) => {
                if (first.getPredicate().equals(SKOSXL.prefLabel) && second.getPredicate().equals(SKOSXL.altLabel)) {
                    return 1;
                }
                if (second.getPredicate().equals(SKOSXL.prefLabel) && first.getPredicate().equals(SKOSXL.altLabel)) {
                    return -1;
                }
                return 0;
            })

        } else if (this.lexicalizationModelType == OntoLex.uri) {
            // ontolex
        }

    }


    private initPartition(partition: ResViewPartition, sort: boolean): ARTPredicateObjects[] {
        let poList: ARTPredicateObjects[];
        let partitionJson: any = this.resViewResponse[partition];
        poList = Deserializer.createPredicateObjectsList(partitionJson);
        if (sort) {
            this.sortObjects(poList);
        }
        return poList;
    }


    private sortObjects(predObjList: ARTPredicateObjects[]) {
        let attribute: SortAttribute = SortAttribute.show;
        for (var i = 0; i < predObjList.length; i++) {
            let objList: ARTNode[] = predObjList[i].getObjects();
            ResourceUtils.sortResources(<ARTResource[]>objList, attribute);
        }
    }

    /**
     * This method initializes the languages ​​to be displayed in the list of flags as follows:
     * 1) first those for which there is a value received from the server
     * 2) then those assigned to the user (filtered in such a way that there are no duplicates with those of point 1)
     * If the user is an Admin type and there are no languages ​​assigned to the user, then all languages ​​are taken, always putting first those that have a value
     */
    private initLanguages() {
        this.languages = []
        let langListFromServer = this.objectKeys;
        if (langListFromServer.length != 0) {
            langListFromServer.forEach(lang => {
                this.languages.push({ lang: Languages.getLanguageFromTag(lang), disabled: false })
            })
        }
        if (!this.readonly) { //add further languages (those for adding new boxes) only if the TermView is not in readonly mode
            if (VBContext.getLoggedUser().isAdmin() && this.userAssignedLangs.length == 0) {
                this.allProjectLangs = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectSettings().projectLanguagesSetting
                this.allProjectLangs.forEach(lang => {
                    if (!langListFromServer.some(l => l == lang.tag)) {
                        this.languages.push({ lang: lang, disabled: true })
                    }
                })
            } else {
                if (this.userAssignedLangs.length != 0) {
                    this.userAssignedLangs.forEach(lang => {
                        if (!langListFromServer.some(l => l == lang)) {
                            this.languages.push({ lang: Languages.getLanguageFromTag(lang), disabled: true })
                        }
                    })
                }
            }
        }

    }

    /**
     * This method manages click on flags list:
     * 1) click on flag(from Server) does scroll down to specific element because this flag cames from server
     * 2) click on flag(not in server but user assigned) adds new lang definition and term because this flag is not present in server but is present or in userAssignedLang or in allProjectLangs(particular case)
     * @param flagClicked 
     */
    private onLanguageClicked(flagClicked: LangStructView) {
        if (this.objectKeys.some(l => l == flagClicked.lang.tag)) { //(1)
            this.langBoxViews.forEach(l => {
                if (l.lang == flagClicked.lang.tag) {
                    l.el.nativeElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            })
        } else if (this.userAssignedLangs.some(l => l == flagClicked.lang.tag) || this.allProjectLangs.some(l => l == flagClicked.lang)) { //(2) 
            for (let i = 0; i < this.languages.length; i++) {
                if (this.languages[i] == flagClicked) {
                    this.languages[i].disabled = false;
                }
            }
            let nodes: ARTNode[] = [];
            let predObj;
            if (this.lexicalizationModelType == SKOS.uri) {
                predObj = new ARTPredicateObjects(SKOS.prefLabel, nodes);
            } else if (this.lexicalizationModelType == SKOSXL.uri) {
                predObj = new ARTPredicateObjects(SKOSXL.prefLabel, nodes);
            } else if (this.lexicalizationModelType == OntoLex.uri) {
            }
            this.langStruct[flagClicked.lang.tag] = [];
            this.langStruct[flagClicked.lang.tag].push(predObj)
            this.objectKeys = Object.keys(this.langStruct); // here there is not .sort() because so it manteins actual order
        }
    }

    private deleteLangBox(lang: string) {
        delete this.langStruct[lang];
        this.objectKeys = Object.keys(this.langStruct);
    }

}



interface LangStructView {
    lang: Language;
    disabled: boolean;

}

interface DefinitionStructView {
    definition: string
    lang: Language
}