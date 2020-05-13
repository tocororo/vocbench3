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
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
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

    constructor(private ontolexService: OntoLexLemonServices, private basicModals: BasicModalServices, eventHandler: VBEventHandler) {
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
        if (this.lexicon != undefined) {
            let visualization: LexEntryVisualizationMode = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().lexEntryListPreferences.visualization;
            if (visualization == LexEntryVisualizationMode.indexBased && this.index != undefined) {
                this.checkInitializationSafe().subscribe(
                    proceed => {
                        if (proceed) {
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
    }

    /**
     * Perform a check in order to prevent the initialization of the structure with too many elements.
     * Return true if the initialization is safe or if the user agreed to init the structure anyway
     */
    private checkInitializationSafe(): Observable<boolean> {
        let lexEntryListPreference: LexicalEntryListPreference = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().lexEntryListPreferences;
        let unsafetyMessage: string = "The LexicalEntry list has too many elements. " + 
            "Retrieving them all could be a long process, you might experience performance decrease or it might even hang the system. ";
        if (LexEntryVisualizationMode.indexBased && lexEntryListPreference.indexLength == 1) {
            unsafetyMessage += "It is highly recommended to improve the index length or to switch from 'index' to 'search-based' visualization mode.\n";
        } else { //length 2
            unsafetyMessage += "It is highly recommended to switch from 'index' to 'search-based' visualization mode.\n";
        }
        unsafetyMessage += "Do you want to force the list initialization anyway?";

        let safeToGoMap: SafeToGoMap = lexEntryListPreference.safeToGoMap;
        let checksum = "lexicon:" + this.lexicon.toNT() + "&index:" + this.index;
        let safe: boolean = safeToGoMap[checksum];
        if (safe === true) {
            return Observable.of(true); //cached to be safe => allow the initalization
        } else if (safe === false) { //cached to be not safe => warn the user
            return Observable.fromPromise(
                this.basicModals.confirm("LexicalEntry list", unsafetyMessage, "warning").then(
                    () => { return true; },
                    () => { return false; }
                )
            );
        } else { //never initialized => count
            UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
            return this.ontolexService.countLexicalEntriesByAlphabeticIndex(this.index, this.lexicon, VBRequestOptions.getRequestOptions(this.projectCtx)).flatMap(
                count => {
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                    safe = count < this.safeToGoLimit;
                    safeToGoMap[checksum] = safe; //cache the safetyness
                    if (safe) { //safe => proceed
                        return Observable.of(true);
                    } else { //limit exceeded, not safe => warn the user
                        return Observable.fromPromise(
                            this.basicModals.confirm("LexicalEntry list", unsafetyMessage, "warning").then(
                                () => { return true; },
                                () => { return false; }
                            )
                        );
                    }
                }
            );
        }
    }

    public forceList(list: ARTURIResource[]) {
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