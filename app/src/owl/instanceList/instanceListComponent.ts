import {Component, Input, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {VBEventHandler} from "../../utils/VBEventHandler";
import {OwlServices} from "../../services/owlServices";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";

@Component({
	selector: "instance-list",
	templateUrl: "app/src/owl/instanceList/instanceListComponent.html",
    providers: [OwlServices],
	directives: [RdfResourceComponent]
})
export class InstanceListComponent {
    @Input('cls') cls:ARTURIResource;
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    private instanceList: ARTURIResource[];
    private selectedInstance: ARTURIResource;
    
    private eventSubscriptions = [];
    
    constructor(private owlServices: OwlServices, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.instanceDeletedEvent.subscribe(
            data => this.onInstanceDeleted(data.instance, data.clsURI)));
        this.eventSubscriptions.push(eventHandler.instanceCreatedEvent.subscribe(
            data => this.onInstanceCreated(data.instance, data.cls)));
    }
    
    ngOnChanges(changes) {
        this.selectedInstance = null;
        if (changes.cls.currentValue) {
            this.owlServices.getClassAndInstancesInfo(this.cls.getURI()).subscribe(
                instances => {
                    this.instanceList = instances;
                },
                err => {
                    alert("Error: " + err);
                    console.error(err['stack']);
                }
            );
        }
    }
    
    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }
    
    selectInstance(instance: ARTURIResource) {
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
    
    //EVENT LISTENERS
    onInstanceDeleted(instance: ARTURIResource, clsURI) {
        if (this.cls.getURI() == clsURI) {
            for (var i = 0; i < this.instanceList.length; i++) {
                if (this.instanceList[i].getURI() == instance.getURI()) {
                    this.instanceList.splice(i, 1);
                    break;
                }
            }
        }
    }
    
    onInstanceCreated(instance: ARTURIResource, cls: ARTURIResource) {
        if (this.cls.getURI() == cls.getURI()) {
            this.instanceList.push(instance);
        }
    }
    
}