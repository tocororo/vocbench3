import {Injectable, EventEmitter} from 'angular2/core';
import {ARTURIResource} from './ARTResources';

/**
 * This class need to be injected in constructor of every Component that throws or subscribes to an event.
 * To throw an event just call the emit() method of the EventEmitter instance, to subscribes add something like
 * eventHandler.<eventEmitterInstanceName>.subscribe(data => this.<callback>(data));
 * in the constructor of the Component
 */

@Injectable()
export class VBEventHandler {
    
    //CONCEPT EVENTS
    public conceptTreeNodeSelectedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    public topConceptCreatedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contain an object with "narrower" (the narrower created) and "broader"
    public narrowerCreatedEvent: EventEmitter<any> = new EventEmitter();
    //event should contain the deleted concept
    public conceptDeletedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contain an object with "concept" and "scheme"
    public conceptRemovedFromSchemeEvent: EventEmitter<any> = new EventEmitter();
    //event should contain an object with "concept" and "scheme"
    public conceptRemovedAsTopConceptEvent: EventEmitter<any> = new EventEmitter();
    //event should contain an object with "concept" and "broader"
    public broaderRemovedEvent: EventEmitter<any> = new EventEmitter();
    
    //CLASS EVENTS
    public classTreeNodeSelectedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contain an object with "subClass" (the subClass created) and "superClass"
    public subClassCreatedEvent: EventEmitter<any> = new EventEmitter();
    //event should contain the deleted class
    public classDeletedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contain an object with "cls" and "type"
    public typeDeletedEvent: EventEmitter<any> = new EventEmitter();
    //event should contain an object with "cls" and "subClass"
    public subClassRemovedEvent: EventEmitter<any> = new EventEmitter();
    
    //INSTANCE EVENTS
    //event should contain an object with "instance" and "cls" (the class of the instance)
    public instanceCreatedEvent: EventEmitter<any> = new EventEmitter();
    //event should contain an object with "instance" and "cls"
    public instanceDeletedEvent: EventEmitter<any> = new EventEmitter();
    
    //PROPERTY EVENTS
    public propertyTreeNodeSelectedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    public topPropertyCreatedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contain an object with "subProperty" (the subproperty created) and "superProperty"
    public subPropertyCreatedEvent: EventEmitter<any> = new EventEmitter();
    //event should contain the deleted property
    public propertyDeletedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contain an object with "property" and "superProperty"
    public superPropertyRemovedEvent: EventEmitter<any> = new EventEmitter();
    
    //event should contain an object with "oldResource" and "newResource"
    public resourceRenamedEvent: EventEmitter<any> = new EventEmitter();
    
	constructor() {}
    
    /**
     * utility method to make a component unsubscribe from all the event to which has subscribed
     */
    public unsubscribeAll(subscriptions: any[]) {
        for (var i=0; i<subscriptions.length; i++) {
            subscriptions[i].unsubscribe();
        }
    }
    
}