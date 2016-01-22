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
    
    //CLASS EVENTS
    public classTreeNodeSelectedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contains an object with "resource" (the subClass created) and "parent"
    public subClassCreatedEvent: EventEmitter<any> = new EventEmitter();
    public classDeletedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    
    //PROPERTY EVENTS
    public propertyTreeNodeSelectedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    public topPropertyCreatedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    //event should contains an object with "resource" (the subproperty created) and "parent"
    public subPropertyCreatedEvent: EventEmitter<any> = new EventEmitter();
    public propertyDeletedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    
	constructor() {}
    
}