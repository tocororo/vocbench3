import { Component, Input } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: "capability-editor-modal",
    templateUrl: "./capabilityEditorModal.html",
})
export class CapabilityEditorModal {
    @Input() title: string;
    @Input() capability: string;

    private crudvList: string[] = ["C", "R", "U", "D", "V"];
    

    extendedCapability: string; //"capablity(<topic>, <CRUDV>)" where <topic> is <area>(<subject> [, <scope>])

    areaStruct = [
        { value: "rdf", description: "Editing of content data" }, 
        { value: "rbac", description: "Role Based Access Control management" },
        { value: "pm", description: "Project management" },
        { value: "um", description: "User management" },
        { value: "cform", description: "Custom Form management" },
        { value: "customService", description: "Custom Services management" },
        { value: "invokableReporter", description: "Invokable Reports management" },
        { value: "sys", description: "System administration" }
    ];
    area: string;
    subjectScope: string;
    crudvStruct: { value: string, label: string, checked: boolean }[] = [
        { value: "C", label: "Create", checked: false },
        { value: "R", label: "Read", checked: false },
        { value: "U", label: "Update", checked: false },
        { value: "D", label: "Delete", checked: false },
        { value: "V", label: "Validate", checked: false }
    ];

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        if (this.capability != null) { // edit mode
            let capability = this.capability;
            capability = capability.substring(capability.indexOf("(")+1, capability.lastIndexOf(")")); //take the arg of capability(...)

            //split <topic> from <CRUDV>
            let topic = capability.substring(0, capability.lastIndexOf(","));
            let capabCrudv = capability.substring(capability.lastIndexOf(",") + 1);

            //parse topic
            if (topic.indexOf("(") != -1 && topic.indexOf(")") != -1) { //if there is area arguments (subject and scope) parse it
                this.area = topic.substring(0, topic.indexOf("("));
                this.subjectScope = topic.substring(topic.indexOf("(")+1, topic.indexOf(")"));
            } else { //otherwise the topic is just the area
                this.area = topic;
            }
            
            //parse CRUDV
            for (let i = 0; i < this.crudvList.length; i++) {
                if (capabCrudv.toUpperCase().indexOf(this.crudvList[i]) != -1) {
                    this.setCRUDV(this.crudvList[i], true);
                }
            }
        } else { //creation mode
            this.area = this.areaStruct[0].value;
            this.subjectScope = "";
        }
        this.updateExtendedCapability();
    }

    private setCRUDV(crudvValue: string, checked: boolean) {
        for (let i = 0; i < this.crudvStruct.length; i++) {
            if (this.crudvStruct[i].value == crudvValue) {
                this.crudvStruct[i].checked = checked;
                return;
            }
        }
    }

    changeAllCrudvStatus(checked: boolean) {
        for (let i = 0; i < this.crudvStruct.length; i++) {
            this.crudvStruct[i].checked = checked;
        }
        this.updateExtendedCapability();
    }

    updateExtendedCapability() {
        let printCrudv: string = "";
        for (let i = 0; i < this.crudvStruct.length; i++) {
            if (this.crudvStruct[i].checked) {
                printCrudv += this.crudvStruct[i].value;
            }
        }
        if (this.subjectScope != null && this.subjectScope.trim() != "") {
            this.extendedCapability = 'capability(' + this.area + '(' + this.subjectScope + '),"' + printCrudv + '")';
        } else {
            this.extendedCapability = 'capability(' + this.area + ',"' + printCrudv + '")';
        }
        
    }

    isDataValid(): boolean {
        for (let i = 0; i < this.crudvStruct.length; i++) {
            if (this.crudvStruct[i].checked) { //if there is at least one checked CRUDV
                return true;
            }
        }
        return false; //if none CRUDV is checked => error
    }

    ok() {
        if (!this.isDataValid()) {
            return;
        }

        this.activeModal.close(this.extendedCapability);
    }

    cancel() {
        this.activeModal.dismiss();
    }
    
}