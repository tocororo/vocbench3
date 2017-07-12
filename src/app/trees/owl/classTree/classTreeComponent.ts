import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, SimpleChanges } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum, ResourceUtils } from "../../../models/ARTResources";
import { OWL } from "../../../models/Vocabulary";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { UIUtils } from "../../../utils/UIUtils";
import { ClassesServices } from "../../../services/classesServices";
import { SearchServices } from "../../../services/searchServices";
import { ClassTreeNodeComponent } from "./classTreeNodeComponent";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { AbstractTree } from "../../abstractTree";

@Component({
    selector: "class-tree",
    templateUrl: "./classTreeComponent.html",
    host: { class: "blockingDivHost" }
})
export class ClassTreeComponent extends AbstractTree {
    @Input('roots') rootClasses: ARTURIResource[];

    //ClassTreeNodeComponent children of this Component (useful to open tree during the search)
    @ViewChildren(ClassTreeNodeComponent) viewChildrenNode: QueryList<ClassTreeNodeComponent>;

    private viewInitialized: boolean = false;//useful to avoid ngOnChanges calls initTree when the view is not initialized

    constructor(private clsService: ClassesServices, private searchService: SearchServices, 
        private basicModals: BasicModalServices, eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(
            (cls: ARTURIResource) => this.onTreeNodeDeleted(cls)));
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['rootClasses']) {
            this.initTree();
        }
    }

    initTree() {
        this.selectedNode = null;
        if (this.rootClasses == undefined || this.rootClasses.length == 0) {
            this.rootClasses = [OWL.thing];
        }
        this.roots = [];

        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement)
        this.clsService.getClassesInfo(this.rootClasses).subscribe(
            roots => {
                //sort by show if rendering is active, uri otherwise
                let attribute: "show" | "value" = this.rendering ? "show" : "value";
                ResourceUtils.sortResources(roots, attribute);
                this.roots = this.roots.concat(roots);
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            },
            err => { UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement); }
        );
    }

    openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.cls).subscribe(
            path => {
                if (path.length == 0) {
                    this.basicModals.alert("Search", "Node " + node.getShow() + " is not reachable in the current tree");
                    return;
                };
                var childrenNodeComponent = this.viewChildrenNode.toArray();
                //open tree from root to node
                for (var i = 0; i < childrenNodeComponent.length; i++) {//looking for first node (root) to expand
                    // console.log("looking for ", path[0].getURI());
                    if (path[0].getURI() != OWL.thing.getURI() && childrenNodeComponent[i].node.getURI() == OWL.thing.getURI()) {
                        /* Workaround to resolve an issue:
                        some classes (e.g. skos:Concept, skos:Collection,...) are visible in class tree of SKOS projects,
                        but they are not subClassOf owl:Thing, so getPathFromRoot does not return the path up to owl:Thing.
                        Here I perform a check to skip this scenario. If first node of path is not owl:Thing, I expand owl:Thing
                        anyway when encountered in this for loop (without splice the first node of the path). */
                        childrenNodeComponent[i].expandPath(path);
                        return;
                    } else if (childrenNodeComponent[i].node.getURI() == path[0].getURI()) {
                        //let the found node expand itself and the remaining path
                        path.splice(0, 1);
                        childrenNodeComponent[i].expandPath(path);
                        return;
                    }
                }
                //if this line is reached it means that the first node of the path has not been found
                this.basicModals.alert("Search", "Node " + node.getShow() + " is not reachable in the current tree");
            }
        );
    }

}