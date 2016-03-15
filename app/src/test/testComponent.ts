import {Component, ViewChild} from "angular2/core";
import {ModalDialogInstance} from 'angular2-modal/angular2-modal';
import {ModalService} from "../widget/modal/modalService";

@Component({
    selector: "test-component",
    templateUrl: "app/src/test/testComponent.html",
    providers: [ModalService],
    host: { class : "pageComponent" }
})
export class TestComponent {
    
    constructor(public modalService: ModalService) {}
    
    yesNo() {
        this.modalService.confirm("Warning", "This operation bla bla bla, are you sure?").then(
            resultPromise => {
                return resultPromise.result.then((result) => {
                    alert("accepted");
                },
                    () => alert("rejected")
                );
            }
        );
    }

    prompt() {
        this.modalService.prompt("Insert your name here", "Name:").then(
            resultPromise => {
                return resultPromise.result.then((result) => {
                    alert("you insert " + result);
                },
                    () => alert("you canceled")
                );
            }
        );
    }
    
    alert() {
        this.modalService.alert("Alert", "Concept created successfully", "error");
    }
    
}