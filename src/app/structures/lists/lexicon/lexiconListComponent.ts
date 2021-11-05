import { Component, QueryList, ViewChildren } from "@angular/core";
import { ARTResource, ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../../models/ARTResources";
import { Project } from "../../../models/Project";
import { SemanticTurkey } from "../../../models/Vocabulary";
import { OntoLexLemonServices } from "../../../services/ontoLexLemonServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { TreeListContext, UIUtils } from "../../../utils/UIUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBProperties } from "../../../utils/VBProperties";
import { AbstractList } from "../abstractList";
import { LexiconListNodeComponent } from "./lexiconListNodeComponent";

@Component({
    selector: "lexicon-list",
    templateUrl: "./lexiconListComponent.html",
    host: { class: "treeListComponent" }
})
export class LexiconListComponent extends AbstractList {

    @ViewChildren(LexiconListNodeComponent) viewChildrenNode: QueryList<LexiconListNodeComponent>;

    structRole = RDFResourceRolesEnum.limeLexicon;

    list: ARTURIResource[];

    private activeLexicon: ARTURIResource;

    constructor(private ontolexService: OntoLexLemonServices, private vbProp: VBProperties, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.lexiconCreatedEvent.subscribe((node: ARTURIResource) => this.onListNodeCreated(node)));
        this.eventSubscriptions.push(eventHandler.lexiconDeletedEvent.subscribe((node: ARTURIResource) => this.onListNodeDeleted(node)));
        this.eventSubscriptions.push(eventHandler.lexiconDeletedUndoneEvent.subscribe((node: ARTURIResource) => this.onDeletedUndo(node)));
        //handler when active lexicon is changed programmatically when a searched entry belong to a non active lexicon
        this.eventSubscriptions.push(eventHandler.lexiconChangedEvent.subscribe(
            (data: { lexicon: ARTURIResource, project: Project }) => {
                if (data.project.getName() == VBContext.getWorkingProjectCtx(this.projectCtx).getProject().getName()) {
                    if (data.lexicon != null) {
                        this.activeLexicon = this.list.find(n => n.equals(data.lexicon));
                    } else {
                        this.activeLexicon = null;
                    }
                }
            })
        );
    }

    ngOnInit() {
        if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexGetLexicon)) {
            this.unauthorized = true;
            return;
        }
        this.init();
    }

    initImpl() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.ontolexService.getLexicons(VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
            lexicons => {
                //sort by show if rendering is active, uri otherwise
                ResourceUtils.sortResources(lexicons, this.rendering ? SortAttribute.show : SortAttribute.value);

                for (let i = 0; i < lexicons.length; i++) {
                    let activeLexicon = VBContext.getWorkingProjectCtx(this.projectCtx).getProjectPreferences().activeLexicon;
                    if (activeLexicon != null && lexicons[i].equals(activeLexicon)) {
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
        if (this.context == TreeListContext.addPropValue) {
            this.selectNode(node);
        }
    }

    onListNodeDeleted(node: ARTURIResource) {
        for (let i = 0; i < this.list.length; i++) {
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

    onResourceCreatedUndone(node: ARTResource) {
        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].equals(node)) {
                this.list.splice(i, 1);
                break;
            }
        }
    }

    onDeletedUndo(node: ARTURIResource) {
        this.list.push(node);
    }

    selectNode(node: ARTURIResource) {
        if (this.selectedNode != undefined) {
            this.selectedNode.deleteAdditionalProperty(ResAttribute.SELECTED);
        }
        this.selectedNode = node;
        this.selectedNode.setAdditionalProperty(ResAttribute.SELECTED, true);
        this.nodeSelected.emit(node);
    }

    private toggleLexicon(lexicon: ARTURIResource) {
        if (this.activeLexicon == lexicon) {
            this.activeLexicon = null;
        } else {
            this.activeLexicon = lexicon;
        }
        this.vbProp.setActiveLexicon(VBContext.getWorkingProjectCtx(this.projectCtx), this.activeLexicon);
    }

}