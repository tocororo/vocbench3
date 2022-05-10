import { Directive, EventEmitter, Output } from "@angular/core";
import { Subscription } from "rxjs";
import { ARTResource } from "../../models/ARTResources";
import { VBEventHandler } from "../../utils/VBEventHandler";

@Directive()
export abstract class AbstractResViewVisualizationMode {

    //tells to the parent component that there are no more RV open
    @Output() empty: EventEmitter<any> = new EventEmitter();

    eventSubscriptions: Subscription[] = [];

    /**
     * CONSTRUCTOR
     */
    protected eventHandler: VBEventHandler;
    constructor(eventHandler: VBEventHandler) {
        this.eventHandler = eventHandler;
        this.eventSubscriptions.push(eventHandler.refreshDataBroadcastEvent.subscribe(() => {
            this.onRefreshDataBroadcast();
        }));
    }

    /**
     * METHODS
     */
    abstract selectResource(resource: ARTResource): void;
    abstract deleteResource(resource: ARTResource): void;
    abstract getMainResource(): ARTResource;
    abstract objectDblClick(obj: ARTResource): void;

    abstract onRefreshDataBroadcast(): void;

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe());
    }

}