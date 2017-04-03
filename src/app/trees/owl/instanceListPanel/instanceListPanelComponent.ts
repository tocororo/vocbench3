import { Component, Input, Output, EventEmitter, ViewChild } from "@angular/core";
import { InstanceListComponent } from "../instanceList/instanceListComponent";
import { SearchServices } from "../../../services/searchServices";
import { OwlServices } from "../../../services/owlServices";
import { DeleteServices } from "../../../services/deleteServices";
import { ModalServices } from "../../../widget/modal/modalServices";
import { ARTURIResource } from "../../../models/ARTResources";
import { UIUtils } from "../../../utils/UIUtils";

@Component({
    selector: "instance-list-panel",
    templateUrl: "./instanceListPanelComponent.html",
})
export class InstanceListPanelComponent {
    @Input() editable: boolean = true; //if true show the buttons to edit the list
    @Input() hideSearch: boolean = false; //if true hide the search bar
    @Input() cls: ARTURIResource;
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();

    @ViewChild(InstanceListComponent) viewChildInstanceList: InstanceListComponent;

    private rendering: boolean = false; //if true the nodes in the tree should be rendered with the show, with the qname otherwise

    private selectedInstance: ARTURIResource;

    constructor(private owlService: OwlServices, private deleteService: DeleteServices, private searchService: SearchServices, 
        private modalService: ModalServices) { }

    private createInstance() {
        //currently uses prompt instead of newResource since createInstance service doesn't allow to provide a label
        this.modalService.prompt("Create new instance", "Name", null, null, false, true).then(
            (result: any) => {
                UIUtils.startLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement);
                this.owlService.createInstance(this.cls, result).subscribe(
                    stResp => UIUtils.stopLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement),
                    err => UIUtils.stopLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement)
                );
            },
            () => { }
        );
    }

    private deleteInstance() {
        UIUtils.startLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement);
        this.deleteService.removeInstance(this.selectedInstance, this.cls).subscribe(
            stResp => {
                this.selectedInstance = null;
                this.nodeSelected.emit(this.selectedInstance);
                UIUtils.stopLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement);
            },
            err => { UIUtils.stopLoadingDiv(this.viewChildInstanceList.blockDivElement.nativeElement); }
        )
    }

    private refresh() {
        this.selectedInstance = null;
        this.nodeSelected.emit(this.selectedInstance);
        this.viewChildInstanceList.initList();
    }

    //search handlers

    /**
     * Handles the keydown event in search text field (when enter key is pressed execute the search)
     */
    private searchKeyHandler(key: number, searchedText: string) {
        if (key == 13) {
            this.doSearch(searchedText);
        }
    }

    private doSearch(searchedText: string) {
        if (searchedText.trim() == "") {
            this.modalService.alert("Search", "Please enter a valid string to search", "error");
        } else {
            this.searchService.searchInstancesOfClass(this.cls, searchedText, true, true, "contain").subscribe(
                searchResult => {
                    if (searchResult.length == 0) {
                        this.modalService.alert("Search", "No results found for '" + searchedText + "'", "warning");
                    } else { //1 or more results
                        if (searchResult.length == 1) {
                            this.selectSearchedInstance(this.cls, searchResult[0]);
                        } else { //multiple results, ask the user which one select
                            this.modalService.selectResource("Search", searchResult.length + " results found.", searchResult).then(
                                (selectedResource: any) => {
                                    this.selectSearchedInstance(this.cls, selectedResource);
                                },
                                () => { }
                            );
                        }
                    }
                }
            );
        }
    }

    //this is public so it can be invoked from classIndividualTreePanelComponent
    selectSearchedInstance(cls: ARTURIResource, instance: ARTURIResource) {
        this.viewChildInstanceList.selectSearchedInstance(cls, instance);
    }


    private onNodeSelected(instance: ARTURIResource) {
        this.selectedInstance = instance;
        this.nodeSelected.emit(instance);
    }

}