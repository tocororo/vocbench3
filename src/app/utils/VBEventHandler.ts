import { EventEmitter, Injectable } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { ARTResource, ARTURIResource, RDFResourceRolesEnum } from '../models/ARTResources';
import { Project } from '../models/Project';
import { ResourceViewMode } from '../models/Properties';
import { VBContext } from '../utils/VBContext';

/**
 * This class need to be injected in constructor of every Component that throws or subscribes to an event.
 * To throw an event just call the emit() method of the EventEmitter instance, to subscribes add something like
 * eventHandler.<eventEmitterInstanceName>.subscribe(data => this.<callback>(data));
 * in the constructor of the Component
 */

@Injectable()
export class VBEventHandler {

    //CONCEPT EVENTS
    public topConceptCreatedEvent: EventEmitter<{ concept: ARTURIResource, schemes: ARTURIResource[] }> = new VBEventEmitter("topConceptCreatedEvent");
    public narrowerCreatedEvent: EventEmitter<{ narrower: ARTURIResource, broader: ARTURIResource }> = new VBEventEmitter("narrowerCreatedEvent");
    public broaderAddedEvent: EventEmitter<{ narrower: ARTURIResource, broader: ARTURIResource }> = new VBEventEmitter("broaderAddedEvent");
    public conceptDeletedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter<ARTURIResource>("conceptDeletedEvent");
    public conceptRemovedFromSchemeEvent: EventEmitter<{ concept: ARTURIResource, scheme: ARTURIResource }> = new VBEventEmitter("conceptRemovedFromSchemeEvent");
    public conceptRemovedAsTopConceptEvent: EventEmitter<{ concept: ARTURIResource, scheme: ARTURIResource }> = new VBEventEmitter("conceptRemovedAsTopConceptEvent");
    public broaderRemovedEvent: EventEmitter<{ concept: ARTURIResource, broader: ARTURIResource }> = new VBEventEmitter("broaderRemovedEvent");
    public broaderUpdatedEvent: EventEmitter<{ child: ARTURIResource, oldParent: ARTURIResource, newParent: ARTURIResource }> = new VBEventEmitter("broaderConceptUpdatedEvent");

    //SCHEME EVENTS
    public schemeCreatedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter("schemeCreatedEvent");
    public schemeDeletedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter("schemeDeletedEvent");
    public schemeChangedEvent: EventEmitter<{ schemes: ARTURIResource[], project: Project }> = new VBEventEmitter("schemeChangedEvent");
    public multischemeModeChangedEvent: EventEmitter<void> = new VBEventEmitter("multischemeModeChangedEvent");

    //COLLECTION EVENTS
    public rootCollectionCreatedEvent: EventEmitter<ARTResource> = new VBEventEmitter<ARTURIResource>("rootCollectionCreatedEvent");
    public nestedCollectionCreatedEvent: EventEmitter<{ nested: ARTResource, container: ARTResource }> = new VBEventEmitter("nestedCollectionCreatedEvent");
    public nestedCollectionAddedEvent: EventEmitter<{ nested: ARTResource, container: ARTResource }> = new VBEventEmitter("nestedCollectionAddedEvent");
    public nestedCollectionAddedFirstEvent: EventEmitter<{ nested: ARTResource, container: ARTResource }> = new VBEventEmitter("nestedCollectionAddedFirstEvent");
    public nestedCollectionAddedLastEvent: EventEmitter<{ nested: ARTResource, container: ARTResource }> = new VBEventEmitter("nestedCollectionAddedLastEvent");
    public nestedCollectionAddedInPositionEvent: EventEmitter<{ nested: ARTResource, container: ARTResource, position: number }> = new VBEventEmitter("nestedCollectionAddedInPositionEvent");
    public nestedCollectionRemovedEvent: EventEmitter<{ nested: ARTResource, container: ARTResource }> = new VBEventEmitter("nestedCollectionRemovedEvent");
    public collectionDeletedEvent: EventEmitter<ARTResource> = new VBEventEmitter<ARTResource>("collectionDeletedEvent");

    //CLASS EVENTS
    public subClassCreatedEvent: EventEmitter<{ subClass: ARTResource, superClass: ARTResource }> = new VBEventEmitter("subClassCreatedEvent");
    public superClassAddedEvent: EventEmitter<{ subClass: ARTResource, superClass: ARTResource }> = new VBEventEmitter("superClassAddedEvent");
    public classDeletedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter<ARTURIResource>("classDeletedEvent");
    public typeRemovedEvent: EventEmitter<{ resource: ARTResource, type: ARTResource }> = new VBEventEmitter("typeRemovedEvent");
    public typeAddedEvent: EventEmitter<{ resource: ARTResource, type: ARTResource }> = new VBEventEmitter("typeAddedEvent");
    public superClassRemovedEvent: EventEmitter<{ superClass: ARTResource, subClass: ARTResource }> = new VBEventEmitter("superClassRemovedEvent");
    public superClassUpdatedEvent: EventEmitter<{ child: ARTURIResource, oldParent: ARTURIResource, newParent: ARTURIResource }> = new VBEventEmitter("superClassUpdatedEvent");
    public classFilterChangedEvent: EventEmitter<any> = new VBEventEmitter("classFilterChangedEvent");

    //INSTANCE EVENTS
    public instanceCreatedEvent: EventEmitter<{ instance: ARTResource, cls: ARTResource }> = new VBEventEmitter("instanceCreatedEvent");
    public instanceDeletedEvent: EventEmitter<{ instance: ARTResource, cls: ARTResource }> = new VBEventEmitter("instanceDeletedEvent");

    //PROPERTY EVENTS
    public topPropertyCreatedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter<ARTURIResource>("topPropertyCreatedEvent");
    public subPropertyCreatedEvent: EventEmitter<{ subProperty: ARTURIResource, superProperty: ARTURIResource }> = new VBEventEmitter("subPropertyCreatedEvent");
    public superPropertyAddedEvent: EventEmitter<{ subProperty: ARTURIResource, superProperty: ARTURIResource }> = new VBEventEmitter("superPropertyAddedEvent");
    public propertyDeletedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter<ARTURIResource>("propertyDeletedEvent");
    public superPropertyRemovedEvent: EventEmitter<{ property: ARTURIResource, superProperty: ARTURIResource }> = new VBEventEmitter("superPropertyRemovedEvent");
    public superPropertyUpdatedEvent: EventEmitter<{ child: ARTURIResource, oldParent: ARTURIResource, newParent: ARTURIResource }> = new VBEventEmitter("superPropertyUpdatedEvent");

    //LEXICON EVENTS
    public lexiconCreatedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter("lexiconCreatedEvent");
    public lexiconDeletedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter("lexiconDeletedEvent");
    public lexiconChangedEvent: EventEmitter<{ lexicon: ARTURIResource, project: Project }> = new VBEventEmitter("lexiconChangedEvent");
    public lexicalEntryCreatedEvent: EventEmitter<{ entry: ARTURIResource, lexicon: ARTURIResource }> = new VBEventEmitter("lexicalEntryCreatedEvent");
    public lexicalEntryDeletedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter("lexicalEntryDeletedEvent");

    //DATATYPE EVENTS
    public datatypeCreatedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter("datatypeCreatedEvent");
    public datatypeDeletedEvent: EventEmitter<ARTURIResource> = new VBEventEmitter("datatypeDeletedEvent");

    //PREFERENCES EVENTS

    /**
     * user changes resourceViewMode preference => resource view panel need to be updated
     * (fromVbPref param is true when the mode is changed from 'Vocbench Preferences' page, false if it's changed from 'ResourceView settings' modal)
     */
    public resViewModeChangedEvent: EventEmitter<{ mode: ResourceViewMode, fromVbPref: boolean }> = new VBEventEmitter("resViewModeChangedEvent");
    public resViewTabSyncChangedEvent: EventEmitter<boolean> = new VBEventEmitter("resViewTabSyncChangedEvent");

    public showDeprecatedChangedEvent: EventEmitter<boolean> = new VBEventEmitter("showDeprecatedChangedEvent");

    public showFlagChangedEvent: EventEmitter<boolean> = new VBEventEmitter("showFlagChangedEvent");

    public searchPrefsUpdatedEvent: EventEmitter<Project> = new VBEventEmitter("searchPrefsUpdatedEvent");

    public notificationStatusChangedEvent: EventEmitter<void> = new VBEventEmitter("notificationStatusChangedEvent");

    //MISC EVENTS 
    //data loaded/imported/removed/refactored => trees/lists need to be resfreshed
    public refreshDataBroadcastEvent: EventEmitter<any> = new VBEventEmitter("refreshDataBroadcastEvent", true);
    public refreshTreeListEvent: EventEmitter<RDFResourceRolesEnum[]> = new VBEventEmitter("refreshTreeEvent");

    public resourceRenamedEvent: EventEmitter<{ oldResource: ARTURIResource, newResource: ARTURIResource }> = new VBEventEmitter("resourceRenamedEvent");
    public resourceDeprecatedEvent: EventEmitter<ARTResource> = new VBEventEmitter<ARTResource>("resourceDeprecatedEvent");
    //useful to refresh the ResourceView when a resource is updated from outside the RV
    public resourceUpdatedEvent: EventEmitter<ARTResource> = new VBEventEmitter<ARTResource>("resourceUpdatedEvent");

    public collaborationSystemStatusChanged: EventEmitter<any> = new VBEventEmitter("collaborationSystemStatusChanged");

    constructor() { }

    /**
     * utility method to make a component unsubscribe from all the event to which has subscribed
     */
    public unsubscribeAll(subscriptions: Subscription[]) {
        for (var i = 0; i < subscriptions.length; i++) {
            subscriptions[i].unsubscribe();
        }
    }

}

class VBEventEmitter<T> extends EventEmitter<T> {
    private eventName: string
    private onlyIfProjectNotChanged: boolean; //if true the event is fired only if project is not changed

    /**
     * 
     * @param eventName 
     * @param onlyIfProjectNotChanged if true the event is fired only if the project is not changed. Useful for example in 
     *      refreshDataBroadcastEvent (if project is changed, firing the event would cause exception since the refresh of data is based
     *      on scheme of old project)
     * @param isAsync 
     */
    constructor(eventName: string, onlyIfProjectNotChanged?: boolean, isAsync?: boolean) {
        super(isAsync);
        this.eventName = eventName;
        this.onlyIfProjectNotChanged = onlyIfProjectNotChanged;
    }

    emit(value?: T): void {
        //if the project is changed and onlyIfProjectNotChanged is true don't emit event 
        if (this.onlyIfProjectNotChanged && VBContext.isProjectChanged()) {
            return;
        }
        console.log("[", this.eventName, "]", value);
        super.emit(value);
    }

}