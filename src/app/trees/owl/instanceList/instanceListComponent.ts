import {Component, ViewChild, Input, Output, EventEmitter, ElementRef, SimpleChanges} from "@angular/core";
import {ARTURIResource, ResAttribute, RDFResourceRolesEnum} from "../../../models/ARTResources";
import {VBEventHandler} from "../../../utils/VBEventHandler";
import {OwlServices} from "../../../services/owlServices";
import {ClassesServices} from "../../../services/classesServices";
import {ModalServices} from "../../../widget/modal/modalServices";
import {SearchServices} from "../../../services/searchServices";

@Component({
	selector: "instance-list",
	templateUrl: "./instanceListComponent.html",
    host: { class: "blockingDivHost" }
})
export class InstanceListComponent {
    @Input() cls:ARTURIResource;
    @Input() hideSearch: boolean = false;
    @Input() rendering: boolean = true; //if true the nodes in the tree should be rendered with the show, with the qname otherwise
    @Output() nodeSelected = new EventEmitter<ARTURIResource>();
    
    //get the element in the view referenced with #blockDivTree
    @ViewChild('blockDivInstanceList') public blockDivElement: ElementRef;
    
    private pendingSearch: any = {
        pending: false, //tells if there is a pending search waiting that children view are initialized 
        instance: null, //searched instance
        cls: null //class of the searched instance
    }
    
    private viewInitialized: boolean = false;//useful to avoid ngOnChanges calls initList when the view is not initialized
    
    private instanceList: ARTURIResource[] = null;
    private selectedInstance: ARTURIResource;
    
    private eventSubscriptions: any[] = [];
    
    constructor(private owlServices: OwlServices, private clsService: ClassesServices, private searchService: SearchServices, 
        private modalService: ModalServices, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.instanceDeletedEvent.subscribe(
            (data: any) => this.onInstanceDeleted(data.instance, data.cls)));
        this.eventSubscriptions.push(eventHandler.instanceCreatedEvent.subscribe(
            (data: any) => this.onInstanceCreated(data.instance, data.cls)));
        this.eventSubscriptions.push(eventHandler.typeRemovedEvent.subscribe(
            (data: any) => this.onTypeRemoved(data.resource, data.type)));
        this.eventSubscriptions.push(eventHandler.resourceRenamedEvent.subscribe(
            (data: any) => this.onResourceRenamed(data.oldResource, data.newResource)));
    }
    
    ngOnChanges(changes: SimpleChanges) {
        this.selectedInstance = null;
        //viewInitialized needed to prevent the initialization of the list before view is initialized
        if (this.viewInitialized) {
            if (changes['cls']) {
                this.initList();
            }
        }
    }
    
    ngAfterViewInit() {
        this.viewInitialized = true;
        this.initList();
    }
    
    initList() {
        this.instanceList = null;
        if (this.cls != undefined) {
            this.blockDivElement.nativeElement.style.display = "block";
            // this.owlServices.getClassAndInstancesInfo(this.cls).subscribe(
            this.clsService.getInstances(this.cls).subscribe(
                instances => {
                    this.instanceList = instances;
                    //if there is some pending instance search and the searched instance is of the same type of the current class
                    if (this.pendingSearch.pending && this.cls.getURI() == this.pendingSearch.cls.getURI()) {
                        for (var i = 0; i < this.instanceList.length; i++) { //look for the searched instance
                            if (this.instanceList[i].getURI() == this.pendingSearch.instance.getURI()) {
                                //select the instance and reset the pending search
                                this.selectInstance(this.instanceList[i]);
                                this.pendingSearch.pending = false;
                                this.pendingSearch.cls = null;
                                this.pendingSearch.instance = null;
                                break;
                            }
                        }
                    }
                    this.blockDivElement.nativeElement.style.display = "none";
                },
                err => { this.blockDivElement.nativeElement.style.display = "none"; }
            );
        }
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

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
                                () => {}
                            );
                        }
                    }
                }
            );
        }
    }
    
    private selectInstance(instance: ARTURIResource) {
        if (this.selectedInstance == undefined) {
            this.selectedInstance = instance;
            this.selectedInstance.setAdditionalProperty(ResAttribute.SELECTED, true);    
        } else if (this.selectedInstance.getURI() != instance.getURI()) {
            this.selectedInstance.deleteAdditionalProperty(ResAttribute.SELECTED);
            this.selectedInstance = instance;
            this.selectedInstance.setAdditionalProperty(ResAttribute.SELECTED, true);
        }
        this.selectedInstance = instance;
        this.nodeSelected.emit(instance);
    }
    
    /**
     * cls is useful when the instance list is inside the classTreePanel and so this component need to 
     * be in sync with the class selected in the tree
     */
    public selectSearchedInstance(cls: ARTURIResource, instance: ARTURIResource) {
        //In the tree, input cls has still not been bound or not changed (cls has been bound previously with a different type) 
        if (this.cls == undefined || cls.getURI() != this.cls.getURI()) {//save the pending search
            this.pendingSearch.pending = true;
            this.pendingSearch.instance = instance;
            this.pendingSearch.cls = cls;
        } else if (this.cls.getURI() == cls.getURI()) {
            //Input cls has already bound and it is the type of the searched instance
            for (var i = 0; i < this.instanceList.length; i++) {//look for the searched instance and select it
                if (this.instanceList[i].getURI() == instance.getURI()) {
                    this.selectInstance(this.instanceList[i]);
                    // this.pendingSearch.pending = false;
                    // this.pendingSearch.cls = null;
                    // this.pendingSearch.instance = null;
                    break;
                }
            }
        }
    }
    
    //EVENT LISTENERS
    private onInstanceDeleted(instance: ARTURIResource, cls: ARTURIResource) {
        if (this.cls.getURI() == cls.getURI()) {
            for (var i = 0; i < this.instanceList.length; i++) {
                if (this.instanceList[i].getURI() == instance.getURI()) {
                    this.instanceList.splice(i, 1);
                    break;
                }
            }
        }
    }
    
    private onInstanceCreated(instance: ARTURIResource, cls: ARTURIResource) {
        if (this.cls.getURI() == cls.getURI()) {
            this.instanceList.push(instance);
        }
    }
    
    private onTypeRemoved(instance: ARTURIResource, cls: ARTURIResource) {
        //check of cls not undefined is required if instance list has never been initialized with an @Input class
        if (this.cls && this.cls.getURI() == cls.getURI()) {
            for (var i=0; i < this.instanceList.length; i++) {
                if (this.instanceList[i].getURI() == instance.getURI()) {
                    this.instanceList.splice(i, 1);
                    break;       
                }
            }
        }
    }

    private onResourceRenamed(oldResource: ARTURIResource, newResource: ARTURIResource) {
        for (var i = 0; i < this.instanceList.length; i++) {
            if (oldResource.getURI() == this.instanceList[i].getURI()) {
                this.instanceList[i][ResAttribute.SHOW] = newResource.getShow();
                this.instanceList[i]['uri'] = newResource.getURI();
            }
        }
    }

}