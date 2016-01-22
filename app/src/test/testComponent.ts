import {Component} from "angular2/core";
// import {DialogService} from "../widget/dialogs/DialogService";

@Component({
	selector: "test-component",
	templateUrl: "app/src/test/testComponent.html",
    // providers: [DialogService]
})
export class TestComponent {
    
	// constructor(private dialogServ:DialogService) {}
    constructor() {}
    
    public test() {
        var name = prompt("Insert concept name");
        if (name != null) {
            console.log("name " + name);
        }
    }
    
}