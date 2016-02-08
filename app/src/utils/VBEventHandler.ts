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
    //event should contains an object with "resource" (the narrower created) and "parent"
    public narrowerCreatedEvent: EventEmitter<any> = new EventEmitter();
    public conceptDeletedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contains an object with "concept" and "scheme"
    public conceptRemovedFromSchemeEvent: EventEmitter<any> = new EventEmitter();
    //event should contains an object with "concept" and "scheme"
    public conceptRemovedAsTopConceptEvent: EventEmitter<any> = new EventEmitter();
    //event should contains an object with "resource" and "parent"
    public broaderRemovedEvent: EventEmitter<any> = new EventEmitter();
    
    //CLASS EVENTS
    public classTreeNodeSelectedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contains an object with "resource" (the subClass created) and "parent"
    public subClassCreatedEvent: EventEmitter<any> = new EventEmitter();
    public classDeletedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contains an object with "cls" and "type"
    public typeDeletedEvent: EventEmitter<any> = new EventEmitter();
    //event should contains an object with "resource" and "parent"
    public subClassRemovedEvent: EventEmitter<any> = new EventEmitter();
    
    //PROPERTY EVENTS
    public propertyTreeNodeSelectedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    public topPropertyCreatedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contains an object with "resource" (the subproperty created) and "parent"
    public subPropertyCreatedEvent: EventEmitter<any> = new EventEmitter();
    public propertyDeletedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contains an object with "resource" and "parent"
    public superPropertyRemovedEvent: EventEmitter<any> = new EventEmitter();
    
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