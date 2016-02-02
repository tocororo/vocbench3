import {Component} from "angular2/core";

@Component({
	selector: "test-component",
	templateUrl: "app/src/test/testComponent.html",
})
export class TestComponent {
    
    constructor() {}
    
    public test() {
        var name = prompt("Insert concept name");
        if (name != null) {
            console.log("name " + name);
        }
    }
    
}