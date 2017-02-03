import { Component, Input, Output, EventEmitter, ViewChildren, QueryList, SimpleChanges } from "@angular/core";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../utils/ARTResources";
import { OWL } from "../../../utils/Vocabulary";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { OwlServices } from "../../../services/owlServices";
import { SearchServices } from "../../../services/searchServices";
import { ClassTreeNodeComponent } from "./classTreeNodeComponent";
import { ModalServices } from "../../../widget/modal/modalServices";
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

    constructor(private owlService: OwlServices, private searchService: SearchServices, private modalService: ModalServices,
        eventHandler: VBEventHandler) {
        super(eventHandler);
        this.eventSubscriptions.push(eventHandler.classDeletedEvent.subscribe(
            (cls: ARTURIResource) => this.onClassDeleted(cls)));
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

        this.blockDivElement.nativeElement.style.display = "block";
        this.owlService.getClassesInfo(this.rootClasses).subscribe(
            roots => {
                this.roots = this.roots.concat(roots);
                this.blockDivElement.nativeElement.style.display = "none";
            },
            err => { this.blockDivElement.nativeElement.style.display = "none"; }
        );
    }

    doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.cls], true, true, "contain").subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.openTreeAt(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
                                    this.openTreeAt(selectedResource);
                                },
                                () => { }
                            );
                        }
                    }
                }
            );
        }
    }

    openTreeAt(node: ARTURIResource) {
        this.searchService.getPathFromRoot(node, RDFResourceRolesEnum.cls).subscribe(
            path => {
                var childrenNodeComponent = this.viewChildrenNode.toArray();
                //open tree from root to node
                for (var i = 0; i < childrenNodeComponent.length; i++) {//looking for first node (root) to expand
                    if (path[0].getURI() != OWL.thing.getURI() && childrenNodeComponent[i].node.getURI() == OWL.thing.getURI()) {
                        /* Workaround to resolve an issue:
                        some classes (e.g. skos:Concept, skos:Collection,...) are visible in class tree of SKOS projects,
                        but they are not subClassOf owl:Thing, so getPathFromRoot does not return the path up to owl:Thing.
                        Here I perform a check to skip this scenario. If first node of path is not owl:Thing, I expand owl:Thing
                        anyway when encountered in this for loop (without splice the first node of the path). */
                        childrenNodeComponent[i].expandPath(path);
                        break;
                    } else if (childrenNodeComponent[i].node.getURI() == path[0].getURI()) {
                        //let the found node expand itself and the remaining path
                        path.splice(0, 1);
                        childrenNodeComponent[i].expandPath(path);
                        break;
                    }
                }
            }
        );
    }


    //EVENT LISTENERS

    private onClassDeleted(cls: ARTURIResource) {
        //check if the class to delete is a root
        for (var i = 0; i < this.roots.length; i++) {
            if (this.roots[i].getURI() == cls.getURI()) {
                this.roots.splice(i, 1);
                break;
            }
        }
        //reset the selected node
        this.nodeSelected.emit(undefined);
    }

}