import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from "@angular/core";
import { DomSanitizer, SafeStyle } from "@angular/platform-browser"
import { ClassTreePanelComponent } from "../classTreePanel/classTreePanelComponent";
import { InstanceListPanelComponent } from "../instanceListPanel/instanceListPanelComponent";
import { SearchServices } from "../../../services/searchServices";
import { IndividualsServices } from "../../../services/individualsServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { ARTURIResource, ResAttribute, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { RDF, OWL } from "../../../models/Vocabulary";
import { UIUtils } from "../../../utils/UIUtils";

/**
 * While classTreeComponent has as @Input rootClasses this componente cannot
 * because if it allows multiple roots, when the user wants to add a class (not a sublcass)
 * I don't know wich class consider as superClass of the new added class
 */

@Component({
    selector: "class-individual-tree-panel",
    templateUrl: "./classIndividualTreePanelComponent.html",
    host: { class: "blockingDivHost" }
})
export class ClassIndividualTreePanelComponent {
    @Input() readonly: boolean;
    @Output() classSelected = new EventEmitter<ARTURIResource>();
    @Output() instanceSelected = new EventEmitter<ARTURIResource>();

    @ViewChild('blockDivClsIndList') public blockDivElement: ElementRef;

    @ViewChild(ClassTreePanelComponent) viewChildTree: ClassTreePanelComponent;
    @ViewChild(InstanceListPanelComponent) viewChildInstanceList: InstanceListPanelComponent;

    private rendering: boolean = false; //if true the nodes in the tree should be rendered with the show, with the qname otherwise

    private classTreeFlex = 3;
    private classTreeStyle: SafeStyle;
    private instanceListStyle: SafeStyle;

    private selectedClass: ARTURIResource;
    private selectedInstance: ARTURIResource;

    constructor(private individualService: IndividualsServices, private searchService: SearchServices,
        private basicModals: BasicModalServices, private sanitizer: DomSanitizer) { }

    ngOnInit() {
        this.refreshTreeListStyles();
    }

    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.basicModals.alert("Search", "Please enter a valid string to search", "error");
        } else {
            UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
            this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.cls, RDFResourceRolesEnum.individual], true, true, "contain").subscribe(
                searchResult => {
                    UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
                    if (searchResult.length == 0) {
                        this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.selectSearchedResource(searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
                                    this.selectSearchedResource(selectedResource);
                                },
                                () => { }
                            );
                        }
                    }
                }
            );
        }
    }

    /**
     * If resource is a class expands the class tree and select the resource,
     * otherwise (resource is an instance) expands the class tree to the class of the instance and
     * select the instance in the instance list
     */
    private selectSearchedResource(resource: ARTURIResource) {
        if (resource.getRole() == RDFResourceRolesEnum.cls) {
            this.viewChildTree.openTreeAt(resource);
        } else { // resource is an instance
            //get type of instance, then open the tree to that class
            this.individualService.getNamedTypes(resource).subscribe(
                types => {
                    this.viewChildTree.openTreeAt(types[0]);
                    //center instanceList to the individual
                    this.viewChildInstanceList.selectSearchedInstance(types[0], resource);
                }
            )
        }
    }

    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(key: number, searchedText: string) {
        if (key == 13) {
            this.doSearch(searchedText);
        }
    }

    private reduceClassTree() {
        if (this.classTreeFlex > 1) {
            this.classTreeFlex--;
            this.refreshTreeListStyles()
        }
    }

    private expandClassTree() {
        if (this.classTreeFlex < 3) {
            this.classTreeFlex++;
            this.refreshTreeListStyles()
        }
    }

    private refreshTreeListStyles() {
        this.classTreeStyle = this.sanitizer.bypassSecurityTrustStyle("flex: " + this.classTreeFlex);
        this.instanceListStyle = this.sanitizer.bypassSecurityTrustStyle("flex: " + (4 - this.classTreeFlex));
    }

    // private onMousedown() {
    //     this.onMousemove = this.draggingHandler;
    // }
    // private onMouseup() {
    //     this.onMousemove = (event: MouseEvent) => {};
    // }
    // private onMousemove(event: MouseEvent) {}
    // private draggingHandler(event: MouseEvent) {
    //     console.log(event.clientY);
    //     //TODO change dimension of classtree and instancetree
    // }

    //EVENT LISTENERS
    private onClassSelected(cls: ARTURIResource) {
        this.selectedClass = cls;
        if (this.selectedInstance != null) {
            this.selectedInstance.setAdditionalProperty(ResAttribute.SELECTED, false);
            this.selectedInstance = null;
        }
        this.classSelected.emit(cls);
    }

    private onInstanceSelected(instance: ARTURIResource) {
        this.selectedInstance = instance;
        //event could be fired after a refresh on the list, in that case, instance is null
        if (instance != null) { //forward the event only if instance is not null
            this.instanceSelected.emit(instance);
        }
    }

}