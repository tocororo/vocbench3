import { Component, Input, QueryList, ViewChildren } from "@angular/core";
import { ARTResource } from "../../models/ARTResources";
import { ARTNode, ARTPredicateObjects, ResAttribute } from './../../models/ARTResources';
import { Language, Languages } from './../../models/LanguagesCountries';
import { ResViewPartition } from './../../models/ResourceView';
import { OntoLex, SKOS, SKOSXL } from './../../models/Vocabulary';
import { ResourceViewServices } from './../../services/resourceViewServices';
import { Deserializer } from './../../utils/Deserializer';
import { ResourceUtils, SortAttribute } from './../../utils/ResourceUtils';
import { ProjectContext, VBContext } from './../../utils/VBContext';
import { ShowLanguageDefinitionComponent } from './showLanguageDefinition/showLanguageDefinition';

@Component({
    selector: "resource-view-simple",
    templateUrl: "./resourceViewSimpleComponent.html",
    styleUrls: ["./resourceViewSimpleComponent.css"],
    host: { class: "vbox" }
})
export class ResourceViewSimpleComponent {

    @Input() resource: ARTResource;
    @Input() projectCtx: ProjectContext;
    @Input() readonly: boolean = false;
    //objectKeys = Object.keys;
    @ViewChildren('langItem') langItemsView: QueryList<ShowLanguageDefinitionComponent>;

    constructor(private resViewService: ResourceViewServices) { }


    partitionCollapsed: boolean = false;
    private resViewResponse: any = null;
    private rendering: boolean = true; //tells if the resource shown inside the partitions should be rendered
    private broadersColl: ARTPredicateObjects[] = null;
    private lexicalizationsColl: ARTPredicateObjects[] = null;
    private notesColl: ARTPredicateObjects[] = null;
    private unexistingResource: boolean = false; //tells if the requested resource does not exist (empty description)
    private definitions: ARTNode[]; // conteins object with definitions predicate (skos:definition)
    private broaders: ARTNode[]; // conteins object with broader predicate (skos:broader)
    private langStruct: { [key: string]: ARTPredicateObjects[] } = {}; // new struct to map server response where key is a flag.
    private languages: LangStructView[] = []; // it is used to assign flag status(active/disabled) to flags list (top page under first box)
    private userAssignedLangs: string[] = VBContext.getProjectUserBinding().getLanguages();
    private allProjectLangs = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectSettings().projectLanguagesSetting // all language to manage case in which user is admin without flags assigned
    private lexicalizationModelType: string;
    private objectKeys: string[]; // takes langStruct keys



    ngOnInit() {
        this.buildResourceSimpleView(this.resource)
        this.lexicalizationModelType = VBContext.getWorkingProject().getLexicalizationModelType();// mi serve per capire che tipo di lessicalizzazione ha quel progetto
    }


    /**
     * This method takes data from server (about resource).
     * @param res 
     */
    public buildResourceSimpleView(res: ARTResource) {
        this.resViewService.getResourceView(res).subscribe(
            stResp => {
                this.langStruct = {}
                this.languages = []
                this.resViewResponse = stResp;
                this.fillPartitions();
                this.initLanguages();
            }

        );
    }


    /**
    * Fill broader, lexicalization and notes partitions of the RV and creates a new stuct (called langStruct)
    * 
    */
    private fillPartitions() {
        //list of partition filtered out for the role of the current described resource
        let partitionFilter: ResViewPartition[] = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPartitionFilter[this.resource.getRole()];
        if (partitionFilter == null) {
            partitionFilter = []; //to prevent error later (in partitionFilter.indexOf(partition))
        }
        this.broadersColl = this.initPartition(ResViewPartition.broaders, partitionFilter, true);
        this.lexicalizationsColl = this.initPartition(ResViewPartition.lexicalizations, partitionFilter, false); //the sort is performed in the partition according the language
        this.notesColl = this.initPartition(ResViewPartition.notes, partitionFilter, true);
        if (this.broadersColl.length != 0) {
            this.broaders = this.broadersColl.find(po => { return po.getPredicate().equals(SKOS.broader) }).getObjects();
        }
        if (this.lexicalizationsColl.length != 0) {
            // var langStruct: { [key: string]: ARTPredicateObjects[] } = {};
            let nodes: ARTNode[] = [];
            this.lexicalizationsColl.forEach(lex => {
                lex.getObjects().forEach((obj: ARTNode) => {
                    if (obj.getAdditionalProperty(ResAttribute.LANG) != null) {
                        //case in which there are no existing keys equals to that language
                        if (!(obj.getAdditionalProperty(ResAttribute.LANG) in this.langStruct) && this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)] == null) {
                            this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)] = [];
                            nodes = [];
                            nodes.push(obj);
                            let predObj = new ARTPredicateObjects(lex.getPredicate(), nodes);
                            this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)].push(predObj);
                        } else { // case in which a key equal to that language already exists 
                            if (!this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)].some(item => item.getPredicate().equals(lex.getPredicate()))) { //case in which there are no objects with that type of predicate
                                nodes = [];
                                nodes.push(obj);
                                let predObj = new ARTPredicateObjects(lex.getPredicate(), nodes);
                                this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)].push(predObj);
                                this.sortPredicates(this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)])
                            } else { // case in which objects with that predicate already exist and I can add others (example: I can have more altLabel)
                                if (!this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)].some(item => { return item.getObjects().some(o => o.equals(obj)) })) { // I check if the object I am analyzing is not present
                                    this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)].forEach(item => {
                                        if (item.getPredicate().equals(lex.getPredicate())) {
                                            item.getObjects().push(obj);
                                        }
                                    })

                                }
                            }

                        }
                    }
                })

            })

        }
        if (this.notesColl.length != 0) {
            let nodes: ARTNode[] = [];
            this.definitions = this.notesColl.find(po => { return po.getPredicate().equals(SKOS.definition) }).getObjects(); // it is util for first box in the UI ( here takes only objects with skos:definition predicate)
            this.notesColl.forEach(def => {
                if (def.getPredicate().equals(SKOS.definition)) { // there could be several types (editorialNote, changeNote, example etc ..)
                    def.getObjects().forEach((obj: ARTNode) => {
                        //case in which there are no existing keys equal to the language of the considered definition
                        if (!(obj.getAdditionalProperty(ResAttribute.LANG) in this.langStruct) && this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)] == null) {
                            this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)] = [];
                            nodes = [];
                            nodes.push(obj);
                            let predObj = new ARTPredicateObjects(def.getPredicate(), nodes);
                            this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)].push(predObj);
                        } else { // case in which there is already a key equals to the language of the considered definition
                            if (!this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)].some(item => item.getPredicate().equals(SKOS.definition))) {
                                nodes = [];
                                nodes.push(obj);
                                let predObj = new ARTPredicateObjects(def.getPredicate(), nodes);
                                this.langStruct[obj.getAdditionalProperty(ResAttribute.LANG)].push(predObj);
                            }
                        }
                    })
                }
            })
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


    private initPartition(partition: ResViewPartition, partitionFilter: ResViewPartition[], sort: boolean): ARTPredicateObjects[] {
        let poList: ARTPredicateObjects[];
        let partitionJson: any = this.resViewResponse[partition];
        poList = Deserializer.createPredicateObjectsList(partitionJson);
        if (sort) {
            this.sortObjects(poList);
        }
        return poList;
    }


    private sortObjects(predObjList: ARTPredicateObjects[]) {
        //sort by show if rendering is active, uri otherwise
        let attribute: SortAttribute = this.rendering ? SortAttribute.show : SortAttribute.value;
        for (var i = 0; i < predObjList.length; i++) {
            let objList: ARTNode[] = predObjList[i].getObjects();
            ResourceUtils.sortResources(<ARTResource[]>objList, attribute);
        }
    }

    /**
     * This method initializes the languages ​​to be displayed in the list of flags as follows:
     * 1) first those for which there is a value received from the server
     * 2) then those assigned to the user (filtered in such a way that there are no duplicates with those of point 1)
     * If the user is un Admin type and there are no languages ​​assigned to the user, then all languages ​​are taken, always putting first those that have a value
     */
    private initLanguages() {
        let langListFromServer = this.objectKeys;
        if (langListFromServer.length != 0) {
            langListFromServer.forEach(lang => {
                this.languages.push({ lang: Languages.getLanguageFromTag(lang), disabled: false })
            })
        }
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

    /**
     * This method manages click on flags list:
     * 1) click on flag(from Server) does scroll down to specific element because this flag cames from server
     * 2) click on flag(not in server but user assigned) adds new lang definition and term because this flag is not present in server but is present or in userAssignedLang or in allProjectLangs(particular case)
     * @param flagClicked 
     */
    private onClick(flagClicked: LangStructView) {
        console.log(flagClicked, this.objectKeys)
        if (this.objectKeys.some(l => l == flagClicked.lang.tag)) { //(1)
            this.langItemsView.forEach(l => {
                if (l.langFromServer == flagClicked.lang.tag) {
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
            // this.lexicalizationModelType = VBContext.getWorkingProject().getLexicalizationModelType(); 
            if (this.lexicalizationModelType == SKOS.uri) {
                predObj = new ARTPredicateObjects(SKOS.prefLabel, nodes);
            } else if (this.lexicalizationModelType == SKOSXL.uri) {
                predObj = new ARTPredicateObjects(SKOSXL.prefLabel, nodes);
            } else if (this.lexicalizationModelType == OntoLex.uri) {
                // predObj = new ARTPredicateObjects(RDFS.label, nodes);
            }
            this.langStruct[flagClicked.lang.tag] = [];
            this.langStruct[flagClicked.lang.tag].push(predObj)
            this.objectKeys = Object.keys(this.langStruct); // here there is not .sort() because so it manteins actual order


        }
    }

}



interface LangStructView {
    lang: Language;
    disabled: boolean;

}