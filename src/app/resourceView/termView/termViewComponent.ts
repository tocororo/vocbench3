import { Component, ElementRef, EventEmitter, Input, Output, QueryList, SimpleChanges, ViewChild, ViewChildren } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, of } from "rxjs";
import { map } from 'rxjs/operators';
import { ARTNode, ARTPredicateObjects, ARTResource, ARTURIResource, ResAttribute } from "../../models/ARTResources";
import { CustomForm } from "../../models/CustomForms";
import { VersionInfo } from "../../models/History";
import { Language, Languages } from '../../models/LanguagesCountries';
import { ResViewPartition } from '../../models/ResourceView';
import { OntoLex, SKOS, SKOSXL } from '../../models/Vocabulary';
import { PropertyServices } from "../../services/propertyServices";
import { ResourceViewServices } from '../../services/resourceViewServices';
import { Deserializer } from '../../utils/Deserializer';
import { HttpServiceContext } from "../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from '../../utils/ResourceUtils';
import { UIUtils } from "../../utils/UIUtils";
import { ProjectContext, VBContext } from '../../utils/VBContext';
import { AbstractResourceView } from "../resourceViewEditor/abstractResourceView";
import { DefinitionCustomRangeConfig } from "./definitionEnrichmentHelper";
import { LanguageBoxComponent } from "./languageBox/languageBoxComponent";

@Component({
    selector: "term-view",
    templateUrl: "./termViewComponent.html",
    styleUrls: ["./termViewComponent.css"],
    host: { class: "vbox" },
    styles: [`
    .clamp {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
    `]
})
export class TermViewComponent extends AbstractResourceView {

    @Input() resource: ARTResource;
    @Input() projectCtx: ProjectContext;
    @Input() readonly: boolean = false;
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    @ViewChildren('langBox') langBoxViews: QueryList<LanguageBoxComponent>;
    @ViewChild('blockDiv', { static: true }) blockDivElement: ElementRef;

    private resViewResponse: any = null;
    unknownHost: boolean = false; //tells if the resource view of the current resource failed to be fetched due to a UnknownHostException
    unexistingResource: boolean = false; //tells if the requested resource does not exist (empty description)

    private activeVersion: VersionInfo;

    private langStruct: { [key: string]: ARTPredicateObjects[] } = {}; // new struct to map server response where key is a flag.
    private langsWithValue: string[]; // takes langStruct keys, namely those languages for which exist at leas a value (lexicalization or definition)

    private userAssignedLangs: string[];
    private allProjectLangs: Language[]; // all language to manage case in which user is admin without flags assigned

    ellipsedResShow: boolean; //tells if the show of the resource has been truncated since it was too long
    broaders: ARTNode[]; // conteins object with broader predicate (skos:broader)
    definitions: ARTNode[] = [];  // contains object with definitions predicate (skos:definition) and its lang
    schemes: ARTNode[] = [];  // schemes where the concept belongs to
    private languages: LangStructView[] = []; // it is used to assign flag status(active/disabled) to flags list (top page under first box)

    private defCustomRangeConfig: DefinitionCustomRangeConfig; //tells if skos:definition is mapped to CustomRange

    private lexicalizationModelType: string;

    constructor(resViewService: ResourceViewServices, modalService: NgbModal, private propService: PropertyServices) {
        super(resViewService, modalService);
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
        this.userAssignedLangs = VBContext.getProjectUserBinding().getLanguages();
        this.allProjectLangs = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectSettings().projectLanguagesSetting // all language to manage case in which user is admin without flags assigned
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        if (this.activeVersion != null) {
            HttpServiceContext.setContextVersion(this.activeVersion); //set temprorarly version
        }
        this.resViewService.getResourceView(res).subscribe(
            stResp => {
                HttpServiceContext.removeContextVersion();
                this.resViewResponse = stResp;
                this.fillPartitions();
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
     * Fill broader, lexicalization and notes partitions of the RV and creates a new struct (called langStruct)
     */
    private fillPartitions() {
        let resourcePartition: any = this.resViewResponse.resource;
        this.resource = Deserializer.createRDFResource(resourcePartition);
        this.update.emit(this.resource);

        let resShowEl = document.getElementById('resShowEl');
        this.ellipsedResShow = resShowEl.scrollWidth > resShowEl.clientWidth;

        if (VBContext.getWorkingProject().isValidationEnabled()) {
            this.pendingValidation.emit(ResourceUtils.isResourceInStaging(this.resource));
        }

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

        //definitions
        this.definitions = []
        let renderingLangs = VBContext.getWorkingProjectCtx().getProjectPreferences().renderingLanguagesPreference;
        let notesColl: ARTPredicateObjects[] = this.initPartition(ResViewPartition.notes, true);

        //no need to check if notesColl != null since for concept the partition notes is always returned by getResourceView()
        let definitionPredObj: ARTPredicateObjects = notesColl.find(po => po.getPredicate().equals(SKOS.definition)); //get only skos:definition
        if (definitionPredObj) { //if there are definitions
            definitionPredObj.getObjects().forEach(def => { //collect those with language among the the rendering ones
                if (renderingLangs[0] == Languages.ALL_LANG || renderingLangs.some(l => l.toLocaleLowerCase() == def.getAdditionalProperty(ResAttribute.LANG).toLocaleLowerCase())) {
                    this.definitions.push(def);
                }
            });
        }
        this.definitions.sort((a: ARTNode, b: ARTNode) => { //sort by lang
            let langA: string = a.getAdditionalProperty(ResAttribute.LANG);
            let langB: string = b.getAdditionalProperty(ResAttribute.LANG);
            return langA.localeCompare(langB);
        });

        //schemes
        this.schemes = [];
        let schemesPredObjLists: ARTPredicateObjects[] = this.initPartition(ResViewPartition.schemes, true);
        schemesPredObjLists.forEach(po => {
            po.getObjects().forEach(scheme => {
                if (!this.schemes.some(s => s.equals(scheme))) { //prevent duplicate in case a scheme is linked multiple time with the concept through subProp of skos:inScheme
                    this.schemes.push(scheme);
                }
            })
        })

        //init info about skos:definition custom range
        this.initSkosDefinitionCustomRange(definitionPredObj).subscribe(
            () => {
                //eventually filter out reified definition if skos:definition has not custom range
                if (!this.defCustomRangeConfig.hasCustomRange) {
                    this.definitions = this.definitions.filter(d => d.isLiteral());
                }
                //update the lang struct
                this.definitions.forEach(def => {
                    let lang = def.getAdditionalProperty(ResAttribute.LANG);
                    if (lang == null) return;

                    //case in which in langStruct the language has not yet ARTPredicateObjects in it
                    if (!(lang in this.langStruct) && this.langStruct[lang] == null) {
                        let predObj = new ARTPredicateObjects(SKOS.definition, [def]);
                        this.langStruct[lang] = [predObj];
                    } else { //in langStruct there is already ARTPredicateObjects for the current language
                        let defPredObj: ARTPredicateObjects = this.langStruct[lang].find(pol => pol.getPredicate().equals(SKOS.definition));
                        if (defPredObj == null) { //case in which there is no ARTPredicateObjects about skos:definition
                            let predObj = new ARTPredicateObjects(SKOS.definition, [def]);
                            this.langStruct[lang].push(predObj);
                        } else { //there is already ARTPredicateObjects about skos:definition, simply add the definition
                            defPredObj.getObjects().push(def);
                        }
                    }
                });

                //now that lexicalizations and definitions are initialized, initialize the languages list too
                this.initLanguages();
            }
        )

        //init every partition (except those already initialized) just for detecting if the resource description is under validation
        if (VBContext.getWorkingProject().isValidationEnabled()) {
            for (let p in ResViewPartition) {
                if (p != ResViewPartition.broaders && p != ResViewPartition.lexicalizations && p != ResViewPartition.notes) {
                    this.initPartition(this.resViewResponse[p], false)
                }
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
    }

    /**
     * initialize configuration for custom range of skos:definition. Attribute hasCustomRange can be initialized in two ways:
     * - by checking if a pred-obj list for skos:definition is provided. In this case get the hasCustomRange attribute of the predicate
     * - in the previous attribute cannot be retrieved, invokes getRange(). In this case fill the config also with the CFs retrieve (if any)
     * In this way the children components, in case hasCustomRange is true and the CFs are provided, it could be possible to not 
     * invoke getRange again since all the needed info are already in the DefinitionCustomRangeConfig object. Otherwise invokes getRange
     * only when enriching a skos:definition.
     */
    private initSkosDefinitionCustomRange(definitionPredObj: ARTPredicateObjects): Observable<void> {
        this.defCustomRangeConfig = new DefinitionCustomRangeConfig();
        if (definitionPredObj != null) {
            this.defCustomRangeConfig.hasCustomRange = definitionPredObj.getPredicate().getAdditionalProperty(ResAttribute.HAS_CUSTOM_RANGE);
            return of(null);
        } else {
            return this.propService.getRange(SKOS.definition).pipe(
                map(range => {
                    if (range.formCollection != null) {
                        let cForms: CustomForm[] = range.formCollection.getForms();
                        if (cForms.length > 0) {
                            this.defCustomRangeConfig.hasCustomRange = true;
                            this.defCustomRangeConfig.customForms = cForms;
                        }
                        if (range.ranges == null) { //standard range replaced by the custom one
                            this.defCustomRangeConfig.hasLiteralRange = false;
                        }
                    }
                })
            );
        }
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
        if (partitionJson != null) {
            poList = Deserializer.createPredicateObjectsList(partitionJson);

            //if the there is a value under validation emit a pendingValidation event
            if (VBContext.getWorkingProject().isValidationEnabled()) {
                if (poList.some(po => po.getObjects().some(obj => ResourceUtils.isTripleInStaging(obj)))) {
                    this.pendingValidation.emit(true);
                }
            }

            if (sort) {
                this.sortObjects(poList);
            }
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
        this.langsWithValue = Object.keys(this.langStruct).sort();
        this.languages = []
        let langListFromServer = this.langsWithValue;
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
                    this.userAssignedLangs.sort();
                    this.userAssignedLangs.forEach(lang => {
                        if (!langListFromServer.some(l => l.toLocaleLowerCase() == lang.toLocaleLowerCase())) {
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
    onLanguageClicked(flagClicked: LangStructView) {
        if (this.langsWithValue.some(l => l == flagClicked.lang.tag)) { //(1)
            this.langBoxViews.forEach(l => {
                if (l.lang == flagClicked.lang.tag) {
                    l.el.nativeElement.scrollIntoView({ block: 'center', behavior: 'smooth' });
                }
            })
        } else if (this.userAssignedLangs.some(l => l.toLocaleLowerCase() == flagClicked.lang.tag.toLocaleLowerCase()) || this.allProjectLangs.some(l => l == flagClicked.lang)) { //(2) 
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
            this.langsWithValue = Object.keys(this.langStruct); // here there is not .sort() because so it manteins actual order
        }
    }

    private deleteLangBox(lang: string) {
        delete this.langStruct[lang];
        this.langsWithValue = Object.keys(this.langStruct);
        this.initLanguages();
    }

}


interface LangStructView {
    lang: Language;
    disabled: boolean;

}