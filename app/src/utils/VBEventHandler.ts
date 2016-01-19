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
    
    public conceptTreeNodeSelectedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    public conceptCreatedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    public conceptDeletedEvent: EventEmitter<ARTURIResource> = new EventEmitter();
    
	constructor() {}
    
}