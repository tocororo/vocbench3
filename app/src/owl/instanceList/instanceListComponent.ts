import {Component, ViewChild, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {OwlServices} from "../../services/owlServices";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";

@Component({
	selector: "instance-list",
	templateUrl: "app/src/owl/instanceList/instanceListComponent.html",
    providers: [OwlServices],
	directives: [RdfResourceComponent],
    host: { class: "blockingDivHost" }
})
export class InstanceListComponent {
    @Input('cls') cls:ARTURIResource;
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    //get the element in the view referenced with #blockDivTree
    @ViewChild('blockDivInstanceList') blockDivElement;
    
    private pendingSearch = {
        pending: false, //tells if there is a pending search waiting that children view are initialized 
        instance: null, //searched instance
        cls: null //class of the searched instance
    }
    
    private viewInitialized: boolean = false;//useful to avoid ngOnChanges calls initList when the view is not initialized
    
    private instanceList: ARTURIResource[];
    private selectedInstance: ARTURIResource;
    
    private eventSubscriptions = [];
    
    constructor(private owlServices: OwlServices, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.instanceDeletedEvent.subscribe(
            data => this.onInstanceDeleted(data.instance, data.cls)));
        this.eventSubscriptions.push(eventHandler.instanceCreatedEvent.subscribe(
            data => this.onInstanceCreated(data.instance, data.cls)));
        this.eventSubscriptions.push(eventHandler.typeDeletedEvent.subscribe(
            data => this.onTypeDeleted(data.resource, data.type)));
    }
    
    ngOnChanges(changes) {
        this.selectedInstance = null;
        //viewInitialized needed to avoid to initialize list before view is initialized
        if (changes.cls.currentValue && this.viewInitialized) {
            this.initList();
        }
    }
    
    ngAfterViewInit() {
        this.viewInitialized = true;
        if (this.cls != undefined) {
            this.initList();
        }
    }
    
    initList() {
        this.blockDivElement.nativeElement.style.display = "block";
        this.owlServices.getClassAndInstancesInfo(this.cls).subscribe(
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
            },
            err => { },
            () => this.blockDivElement.nativeElement.style.display = "none"
        );
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    private selectInstance(instance: ARTURIResource) {
        if (this.selectedInstance == undefined) {
            this.selectedInstance = instance;
            this.selectedInstance.setAdditionalProperty("selected", true);    
        } else if (this.selectedInstance.getURI() != instance.getURI()) {
            this.selectedInstance.deleteAdditionalProperty("selected");
            this.selectedInstance = instance;
            this.selectedInstance.setAdditionalProperty("selected", true);
        }
        this.selectedInstance = instance;
        this.itemSelected.emit(instance);
    }
    
    public selectSearchedInstance(cls: ARTURIResource, instance: ARTURIResource) {
        //Input cls has still not been bound or not changed (cls has been bound previously with a different type) 
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
    
    private onTypeDeleted(instance: ARTURIResource, cls: ARTURIResource) {
        if (this.cls.getURI() == cls.getURI()) {
            for (var i=0; i < this.instanceList.length; i++) {
                if (this.instanceList[i].getURI() == instance.getURI()) {
                    this.instanceList.splice(i, 1);
                    break;       
                }
            }
        }
    }
    
}