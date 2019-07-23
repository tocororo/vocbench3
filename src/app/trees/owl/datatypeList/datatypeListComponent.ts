import { Component, Input, QueryList, ViewChildren } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum, ResAttribute } from "../../../models/ARTResources";
import { SemanticTurkey } from "../../../models/Vocabulary";
import { DatatypesServices } from "../../../services/datatypesServices";
import { AuthorizationEvaluator } from "../../../utils/AuthorizationEvaluator";
import { VBRequestOptions } from "../../../utils/HttpManager";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { UIUtils } from "../../../utils/UIUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { AbstractList } from "../../abstractList";
import { DatatypeListNodeComponent } from "./datatypeListNodeComponent";

@Component({
    selector: "datatype-list",
    templateUrl: "./datatypeListComponent.html",
    host: { class: "treeListComponent" }
})
export class DatatypeListComponent extends AbstractList {

    @Input() full: boolean = false; //if true show all the datatypes (also the owl2 that are not declared as rdfs:Datatype)

    @ViewChildren(DatatypeListNodeComponent) viewChildrenNode: QueryList<DatatypeListNodeComponent>;

    structRole = RDFResourceRolesEnum.dataRange;

    list: ARTURIResource[];

    constructor(private datatypeService: DatatypesServices, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.datatypeCreatedEvent.subscribe((node: ARTURIResource) => this.onListNodeCreated(node)));
        this.eventSubscriptions.push(eventHandler.datatypeDeletedEvent.subscribe((node: ARTURIResource) => this.onListNodeDeleted(node)));
    }

    ngOnInit() {
        if (!AuthorizationEvaluator.isAuthorized(VBActionsEnum.datatypesGetDatatype)) {
            return;
        }
        this.init();
    }

    initImpl() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        if (this.full) {
            this.datatypeService.getDatatypes(VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
                datatypes => {
                    this.getDatatyepsRespHandler(datatypes);
                }
            );
        } else {
            this.datatypeService.getDeclaredDatatypes(VBRequestOptions.getRequestOptions(this.projectCtx)).subscribe(
                datatypes => {
                    this.getDatatyepsRespHandler(datatypes);
                }
            );
        }
    }

    private getDatatyepsRespHandler(datatypes: ARTURIResource[]) {
        //sort by show if rendering is active, uri otherwise
        ResourceUtils.sortResources(datatypes, this.rendering ? SortAttribute.show : SortAttribute.value);
        this.list = datatypes
        UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
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
        this.selectedNode = null;
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