import {Component} from "angular2/core";
import {InnerComponent} from "./innerComponent";

@Component({
	selector: "test-component",
	templateUrl: "app/src/test/testComponent.html",
    directives: [InnerComponent],
})
export class TestComponent {
    
	constructor() {}
    
    testOutput(event) {
        console.log("test output called " + JSON.stringify(event));
    }
    
}