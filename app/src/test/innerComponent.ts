import {Component, Output, EventEmitter} from "angular2/core";

@Component({
	selector: "inner",
	templateUrl: "app/src/test/innerComponent.html",
})
export class InnerComponent {
    
    public testo: string = "This is the text inside inner component";
    
	constructor(private eventHandler: EventEmitter<string>) {}
    
    onClick() {
        this.eventHandler.emit(this.testo);
    }
    
}