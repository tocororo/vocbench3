import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import { UserServices } from "../../services/userServices";
import { AdministrationServices } from "../../services/administrationServices";
import { User, Role } from "../../models/User";

export class CapabilityEditorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title', public capability?: string) {
        super();
    }
}

@Component({
    selector: "capability-editor-modal",
    templateUrl: "./capabilityEditorModal.html",
})
export class CapabilityEditorModal implements ModalComponent<CapabilityEditorModalData> {
    context: CapabilityEditorModalData;

    private crudvList: string[] = ["C", "R", "U", "D", "V"];
    

    private extendedCapability: string; //"capablity(<topic>, <CRUDV>)" where <topic> is <area>(<subject> [, <scope>])

    private areaStruct = [
        { value: "rdf", label: "RDF", description: "???"}, 
        { value: "rbac", label: "RBAC", description: "Role Based Access Control management"},
        { value: "pm", label: "PM", description: "Project management"},
        { value: "um", label: "UM", description: "User management"},
        { value: "cform", label: "CFORM", description: "Custom Form management"},
        { value: "sys", label: "SYS", description: "System administration"}
    ];
    private area: string;
    private subjectScope: string;
    private crudvStruct: { value: string, label: string, checked: boolean }[] = [
        { value : "C", label: "Create", checked: false },
        { value : "R", label: "Read", checked: false },
        { value : "U", label: "Update", checked: false },
        { value : "D", label: "Delete", checked: false },
        { value : "V", label: "Validation", checked: false }
    ];

    constructor(public dialog: DialogRef<CapabilityEditorModalData>) {
        this.context = dialog.context;
    }

    ngOnInit() {
        if (this.context.capability != null) { // edit mode
            let capability = this.context.capability;
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
            for (var i = 0; i < this.crudvList.length; i++) {
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
        for (var i = 0; i < this.crudvStruct.length; i++) {
            if (this.crudvStruct[i].value == crudvValue) {
                this.crudvStruct[i].checked = checked;
                return;
            }
        }
    }

    private changeAllCrudvStatus(checked: boolean) {
        for (var i = 0; i < this.crudvStruct.length; i++) {
            this.crudvStruct[i].checked = checked;
        }
        this.updateExtendedCapability();
    }

    private updateArea(area: string) {
        this.area = area;
        this.updateExtendedCapability();
    }

    private updateExtendedCapability() {
        let printCrudv: string = "";
        for (var i = 0; i < this.crudvStruct.length; i++) {
            if (this.crudvStruct[i].checked) {
                printCrudv = printCrudv + this.crudvStruct[i].value;
            }
        }
        if (this.subjectScope != null && this.subjectScope.trim() != "") {
            this.extendedCapability = "capability(" + this.area + "(" + this.subjectScope + "),'" + printCrudv + "')";
        } else {
            this.extendedCapability = "capability(" + this.area + ",'" + printCrudv + "')";
        }
        
    }

    private isDataValid(): boolean {
        for (var i = 0; i < this.crudvStruct.length; i++) {
            if (this.crudvStruct[i].checked) { //if there is at least one checked CRUDV
                return true;
            }
        }
        return false; //if none CRUDV is checked => error
    }

    ok(event: Event) {
        if (!this.isDataValid()) {
            return;
        }

        event.stopPropagation();
        event.preventDefault();
        
        this.dialog.close(this.extendedCapability);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}