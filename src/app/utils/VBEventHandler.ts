import {Injectable, EventEmitter} from '@angular/core';
import {ARTURIResource, ARTResource} from './ARTResources';
import {Project} from './Project';

/**
 * This class need to be injected in constructor of every Component that throws or subscribes to an event.
 * To throw an event just call the emit() method of the EventEmitter instance, to subscribes add something like
 * eventHandler.<eventEmitterInstanceName>.subscribe(data => this.<callback>(data));
 * in the constructor of the Component
 */

@Injectable()
export class VBEventHandler {
    
    //CONCEPT EVENTS
    //event should contain an object with "concept" and "scheme"
    public topConceptCreatedEvent: EventEmitter<any> = new VBEventEmitter("topConceptCreatedEvent");
    //event should contain an object with "narrower" (the narrower created) and "broader"
    public narrowerCreatedEvent: EventEmitter<any> = new VBEventEmitter("narrowerCreatedEvent");
    //event should contain an object with "narrower" and "broader"
    public broaderAddedEvent: EventEmitter<any> = new VBEventEmitter("broaderAddedEvent");
    //event should contain the deleted concept
    public conceptDeletedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter<ARTURIResource>("conceptDeletedEvent");
    //event should contain an object with "concept" and "scheme"
    public conceptRemovedFromSchemeEvent: EventEmitter<any> = new VBEventEmitter("conceptRemovedFromSchemeEvent");
    //event should contain an object with "concept" and "scheme"
    public conceptRemovedAsTopConceptEvent: EventEmitter<any> = new VBEventEmitter("conceptRemovedAsTopConceptEvent");
    //event should contain an object with "concept" and "broader"
    public broaderRemovedEvent: EventEmitter<any> = new VBEventEmitter("broaderRemovedEvent");

    //SCHEME EVENTS
    //event should contain the selected scheme
    public schemeChangedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter("schemeChangedEvent");

    //COLLECTION EVENTS
    //event should contain the created collection
    public rootCollectionCreatedEvent: EventEmitter<ARTResource> = new VBEventEmitter<ARTURIResource>("rootCollectionCreatedEvent");
    //event should contain an object with "nested" (the nested coll created) and "container"
    public nestedCollectionCreatedEvent: EventEmitter<any> = new VBEventEmitter("nestedCollectionCreatedEvent");
    //event should contain an object with "nested" (the nested coll added) and "container"
    public nestedCollectionAddedEvent: EventEmitter<any> = new VBEventEmitter("nestedCollectionAddedEvent");
    //event should contain an object with "nested" (the nested coll added), "container"
    public nestedCollectionAddedFirstEvent: EventEmitter<any> = new VBEventEmitter("nestedCollectionAddedFirstEvent");
    //event should contain an object with "nested" (the nested coll added), "container"
    public nestedCollectionAddedLastEvent: EventEmitter<any> = new VBEventEmitter("nestedCollectionAddedLastEvent");
    //event should contain an object with "nested" (the nested coll added), "container" and "position"
    public nestedCollectionAddedInPositionEvent: EventEmitter<any> = new VBEventEmitter("nestedCollectionAddedInPositionEvent");
    //event should contain an object with "nested" (the nested coll removed) and "container"
    public nestedCollectionRemovedEvent: EventEmitter<any> = new VBEventEmitter("nestedCollectionRemovedEvent");
    //event should contain the deleted collection
    public collectionDeletedEvent: EventEmitter<ARTResource> = new VBEventEmitter<ARTResource>("collectionDeletedEvent");
    
    //CLASS EVENTS
    //event should contain an object with "subClass" (the subClass created) and "superClass"
    public subClassCreatedEvent: EventEmitter<any> = new VBEventEmitter("subClassCreatedEvent");
    //event should contain an object with "subClass" and "superClass"
    public superClassAddedEvent: EventEmitter<any> = new VBEventEmitter("superClassAddedEvent");
    //event should contain the deleted class
    public classDeletedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter<ARTURIResource>("classDeletedEvent");
    //event should contain an object with "resource" and "type"
    public typeRemovedEvent: EventEmitter<any> = new VBEventEmitter("typeRemovedEvent");
    //event should contain an object with "resource" and "type"
    public typeAddedEvent: EventEmitter<any> = new VBEventEmitter("typeAddedEvent");
    //event should contain an object with "cls" and "subClass"
    public subClassRemovedEvent: EventEmitter<any> = new VBEventEmitter("subClassRemovedEvent");
    
    //INSTANCE EVENTS
    //event should contain an object with "instance" and "cls" (the class of the instance)
    public instanceCreatedEvent: EventEmitter<any> = new VBEventEmitter("instanceCreatedEvent");
    //event should contain an object with "instance" and "cls"
    public instanceDeletedEvent: EventEmitter<any> = new VBEventEmitter("instanceDeletedEvent");
    
    //PROPERTY EVENTS
    public topPropertyCreatedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter<ARTURIResource>("topPropertyCreatedEvent");
    //event should contain an object with "subProperty" (the subproperty created) and "superProperty"
    public subPropertyCreatedEvent: EventEmitter<any> = new VBEventEmitter("subPropertyCreatedEvent");
    //event should contain an object with "subProperty" and "superProperty"
    public superPropertyAddedEvent: EventEmitter<any> = new VBEventEmitter("superPropertyAddedEvent");
    //event should contain the deleted property
    public propertyDeletedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter<ARTURIResource>("propertyDeletedEvent");
    //event should contain an object with "property" and "superProperty"
    public superPropertyRemovedEvent: EventEmitter<any> = new VBEventEmitter("superPropertyRemovedEvent");
    
    //LABEL EVENTS
    //event should contain an object with "resource" (resource which the label has been set) "label" and "lang"
    public skosPrefLabelSetEvent: EventEmitter<any> = new VBEventEmitter("skosPrefLabelSetEvent");
    //event should contain an object with "resource" (resource which the label has been set) "label" and "lang"
    public skosPrefLabelRemovedEvent: EventEmitter<any> = new VBEventEmitter("skosPrefLabelRemovedEvent");
    //event should contain an object with "resource" (resource which the label has been set) "label" and "lang"
    public skosxlPrefLabelSetEvent: EventEmitter<any> = new VBEventEmitter("skosxlPrefLabelSetEvent");
    //event should contain an object with "resource" (resource which the label has been set) "label" and "lang"
    public skosxlPrefLabelRemovedEvent: EventEmitter<any> = new VBEventEmitter("skosxlPrefLabelRemovedEvent");
    
    
    //MISC EVENTS 
    
    //event should contain an object with "oldResource" and "newResource"
    public resourceRenamedEvent: EventEmitter<any> = new VBEventEmitter("resourceRenamedEvent");
    
    //event contains the new content language
    public contentLangChangedEvent: EventEmitter<string> = new VBEventEmitter<string>("contentLangChangedEvent");
    
    //event contains the project closed
    public projectClosedEvent: EventEmitter<Project> = new VBEventEmitter<Project>("projectClosedEvent"); 
    
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

class VBEventEmitter<T> extends EventEmitter<T> {

    private eventName: string

    constructor(eventName: string, isAsync?: boolean) {
        super(isAsync);
        this.eventName = eventName;
    }
    
    emit(value?: T): void {
        console.debug("[", this.eventName, "]", value);
        super.emit(value);
    }

    // subscribe(generatorOrNext?: any, error?: any, complete?: any): any {
    //     super.subscribe(generatorOrNext, error, complete);
    // }

}