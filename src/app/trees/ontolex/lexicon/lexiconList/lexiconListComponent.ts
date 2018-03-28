import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, ViewChildren, QueryList } from "@angular/core";
import { AbstractList } from "../../../abstractList";
import { LexiconListNodeComponent } from "./lexiconListNodeComponent";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum, ResourceUtils, SortAttribute } from "../../../../models/ARTResources";
import { SemanticTurkey } from "../../../../models/Vocabulary";
import { SearchSettings } from "../../../../models/Properties";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { VBProperties } from "../../../../utils/VBProperties";
import { UIUtils, TreeListContext } from "../../../../utils/UIUtils";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBContext } from "../../../../utils/VBContext";
import { OntoLexLemonServices } from "../../../../services/ontoLexLemonServices";
import { SearchServices } from "../../../../services/searchServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";

@Component({
    selector: "lexicon-list",
    templateUrl: "./lexiconListComponent.html",
})
export class LexiconListComponent extends AbstractList {

    @Input() context: TreeListContext; //useful to determine if show the radio buttons

    @ViewChildren(LexiconListNodeComponent) viewChildrenNode: QueryList<LexiconListNodeComponent>;

    list: ARTURIResource[];

    private activeLexicon: ARTURIResource;

    constructor(private ontolexService: OntoLexLemonServices, private searchService: SearchServices, private vbProp: VBProperties,
        private basicModals: BasicModalServices, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.lexiconCreatedEvent.subscribe((node: ARTURIResource) => this.onListNodeCreated(node)));
        this.eventSubscriptions.push(eventHandler.lexiconDeletedEvent.subscribe((node: ARTURIResource) => this.onListNodeDeleted(node)));
    }

    ngOnInit() {
        if (!AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.ONTOLEX_GET_LEXICON)) {
            return;
        }
        this.initList();
    }

    initList() {
        this.list = [];
        this.selectedNode = null;
        this.nodeLimit = this.initialNodes;

        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.ontolexService.getLexicons().subscribe(
            lexicons => {
                //sort by show if rendering is active, uri otherwise
                ResourceUtils.sortResources(lexicons, this.rendering ? SortAttribute.show : SortAttribute.value);

                for (var i = 0; i < lexicons.length; i++) {
                    if (this.vbProp.isActiveLexicon(lexicons[i])) {
                        this.activeLexicon = lexicons[i];
                        break;
                    }
                }
                this.list = lexicons;

                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            }
        );
    }

    onListNodeCreated(node: ARTURIResource) {
        this.list.unshift(node);
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

    openListAt(node: ARTURIResource) {
        this.ensureNodeVisibility(node);
        setTimeout( //apply timeout in order to wait that the children node is rendered (in case the openPages has been increased)
            () => {
                var childrenNodeComponent = this.viewChildrenNode.toArray();
                for (var i = 0; i < childrenNodeComponent.length; i++) {
                    if (childrenNodeComponent[i].node.getURI() == node.getURI()) {
                        childrenNodeComponent[i].ensureVisible();
                        if (!childrenNodeComponent[i].node.getAdditionalProperty(ResAttribute.SELECTED)) {
                            childrenNodeComponent[i].selectNode();
                        }
                        break;
                    }
                }
            }
        );
    }

    private updateActiveLexiconPref() {
        this.vbProp.setActiveLexicon(this.activeLexicon);
    }


}