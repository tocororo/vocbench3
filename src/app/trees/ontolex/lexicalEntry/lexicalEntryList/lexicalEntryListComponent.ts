import { Component, Input, QueryList, SimpleChanges, ViewChildren } from "@angular/core";
import { Observable } from "rxjs";
import { ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../../../models/ARTResources";
import { LexEntryVisualizationMode, LexicalEntryListPreference, SafeToGoMap } from "../../../../models/Properties";
import { SemanticTurkey } from "../../../../models/Vocabulary";
import { OntoLexLemonServices } from "../../../../services/ontoLexLemonServices";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { VBRequestOptions } from "../../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../../utils/ResourceUtils";
import { TreeListContext, UIUtils } from "../../../../utils/UIUtils";
import { VBActionsEnum } from "../../../../utils/VBActions";
import { VBContext } from "../../../../utils/VBContext";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { AbstractList } from "../../../abstractList";
import { LexicalEntryListNodeComponent } from "./lexicalEntryListNodeComponent";

@Component({
    selector: "lexical-entry-list",
    templateUrl: "./lexicalEntryListComponent.html",
    host: { class: "treeListComponent" }
})
export class LexicalEntryListComponent extends AbstractList {

    @ViewChildren(LexicalEntryListNodeComponent) viewChildrenNode: QueryList<LexicalEntryListNodeComponent>;

    @Input() index: string; //initial letter of the entries to show
    @Input() lexicon: ARTURIResource;

    structRole = RDFResourceRolesEnum.ontolexLexicalEntry;

    private safeToGoLimit: number = 1000;
    private safeToGo: boolean = true;
    private unsafeScenario: UnsafeScenario; //describe the scenario where the usafeness happened (useful for customizing the warning alert)

    constructor(private ontolexService: OntoLexLemonServices, eventHandler: VBEventHandler) {
        super(eventHandler);
        
        this.eventSubscriptions.push(eventHandler.lexicalEntryCreatedEvent.subscribe(
            (data: { entry: ARTURIResource, lexicon: ARTURIResource }) => {
                if (data.lexicon.getURI() == this.lexicon.getURI()) this.onListNodeCreated(data.entry); 
            } 
        ));
        //here there is no need to check for the index (leading char of the entry) since if the entry uri is not found it is not deleted
        this.eventSubscriptions.push(eventHandler.lexicalEntryDeletedEvent.subscribe(
            (lexEntry: ARTURIResource) => this.onListNodeDeleted(lexEntry)));
    }

    ngOnInit() {
        if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexGetLexicalEntry)) {
            return;
        }
        this.init();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['index'] && !changes['index'].firstChange || changes['lexicon'] && !changes['lexicon'].firstChange) {
            this.init();
        }
    }

    initImpl() {
        let visualization: LexEntryVisualizationMode = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().lexEntryListPreferences.visualization;
        if (visualization == LexEntryVisualizationMode.indexBased && this.index != undefined) {
            this.checkInitializationSafe().subscribe(
                () => {
                    if (this.safeToGo) {
                        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
                        this.ontolexService.getLexicalEntriesByAlphabeticIndex(this.index, this.lexicon, VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
                            entries => {
                                //sort by show if rendering is active, uri otherwise
                                ResourceUtils.sortResources(entries, this.rendering ? SortAttribute.show : SortAttribute.value);
                                this.list = entries;
                                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                                if (this.pendingSearchRes) {
                                    this.openListAt(this.pendingSearchRes);
                                }
                            }
                        );
                    }
                }
            );
        } else if (visualization == LexEntryVisualizationMode.searchBased) {
            //don't do nothing
        }
    }

    /**
     * Forces the safeness of the structure even if it was reported as not safe, then re initialize it
     */
    private forceSafeness() {
        this.safeToGo = true;
        let lexEntryListPreference: LexicalEntryListPreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().lexEntryListPreferences;
        let safeToGoMap: SafeToGoMap = lexEntryListPreference.safeToGoMap;
        let checksum = this.getInitRequestChecksum();
        safeToGoMap[checksum] = this.safeToGo;
        this.initImpl();
    }

    /**
     * Perform a check in order to prevent the initialization of the structure with too many elements.
     * Update the safeToGo flag and the cached map
     */
    private checkInitializationSafe(): Observable<void> {
        let lexEntryListPreference: LexicalEntryListPreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().lexEntryListPreferences;
        if (this.lexicon == null) {
            this.unsafeScenario = UnsafeScenario.noLexiconMode;
        } else { //lexicon selected
            if (lexEntryListPreference.indexLength == 1) {
                this.unsafeScenario = UnsafeScenario.oneCharIndex;
            } else {
                this.unsafeScenario = UnsafeScenario.twoCharIndex;
            }
        }

        let safeToGoMap: SafeToGoMap = lexEntryListPreference.safeToGoMap;

        let checksum = this.getInitRequestChecksum();
        
        let safe: boolean = safeToGoMap[checksum];
        if (safe != null) { //found safeness in cache
            this.safeToGo = safe;
            return Observable.of(null)
        } else { //never initialized/cahced => count
            UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
            return this.ontolexService.countLexicalEntriesByAlphabeticIndex(this.index, this.lexicon, VBRequestOptions.getRequestOptions(this.projectCtx)).flatMap(
                count => {
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                    safe = count < this.safeToGoLimit;
                    safeToGoMap[checksum] = safe; //cache the safeness
                    this.safeToGo = safe;
                    return Observable.of(null)
                }
            );
        }
    }

    private getInitRequestChecksum() {
        let checksum = "lexicon:" + ((this.lexicon != null) ? this.lexicon.toNT() : null) + "&index:" + this.index;
        return checksum;
    }

    public forceList(list: ARTURIResource[]) {
        this.safeToGo = true; //prevent the list not showing if a previous index-based initialization set the safeToGo to false
        this.setInitialStatus();
        this.list = list;
    }

    onListNodeCreated(node: ARTURIResource) {
        if (VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().lexEntryListPreferences.visualization = LexEntryVisualizationMode.indexBased) {
            if (node.getShow().toLocaleLowerCase().startsWith(this.index.toLocaleLowerCase())) {
                this.list.unshift(node);
                if (this.context == TreeListContext.addPropValue) {
                    this.selectNode(node);
                }
            }
        }
    }

    onListNodeDeleted(node: ARTURIResource) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i].getURI() == node.getURI()) {
                if (VBContext.getWorkingProject().isValidationEnabled()) {
                    //replace the resource instead of simply change the graphs, so that the rdfResource detect the change
                    let stagedRes: ARTURIResource = this.list[i].clone();
                    stagedRes.setGraphs([new ARTURIResource(SemanticTurkey.stagingRemoveGraph + VBContext.getWorkingProject().getBaseURI())]);
                    stagedRes.setAdditionalProperty(ResAttribute.EXPLICIT, false);
                    stagedRes.setAdditionalProperty(ResAttribute.SELECTED, false);
                    this.list[i] = stagedRes;
                } else {
                    this.list.splice(i, 1);
                }
                break;
            }
        }
    }

    selectNode(node: ARTURIResource) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }


}

enum UnsafeScenario {
    noLexiconMode = "noLexiconMode", //when there is no lexicon selected => suggest to select a lexicon or to switch to search based
    oneCharIndex = "oneCharIndex", //index-based mode with 1-char => suggest to increase the index length or to switch to search based
    twoCharIndex = "twoCharIndex", //index-based mode with 2-char => suggest to switch to search based
    //for each case it is also provided the possibility to force the initialization
}