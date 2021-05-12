import { Component, forwardRef, Input } from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { RDFResourceRolesEnum } from "src/app/models/ARTResources";
import { Project } from "src/app/models/Project";
import { OntoLex, SKOS, SKOSXL } from "src/app/models/Vocabulary";
import { ResourceUtils } from "src/app/utils/ResourceUtils";
import { VBContext } from "src/app/utils/VBContext";

@Component({
    selector: "role-selector",
    templateUrl: "./roleSelector.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RoleSelector), multi: true,
    }],
})
export class RoleSelector {

    @Input() projectAware: boolean = true; //if true the selectable roles should be determined according the project type

    roles: RoleStruct[] = [];

    ngOnInit() {
        let roleList: RDFResourceRolesEnum[] = [
            RDFResourceRolesEnum.annotationProperty,
            RDFResourceRolesEnum.cls,
            RDFResourceRolesEnum.datatypeProperty,
            RDFResourceRolesEnum.individual,
            RDFResourceRolesEnum.objectProperty,
            RDFResourceRolesEnum.ontologyProperty,
            RDFResourceRolesEnum.property
        ];
        let project: Project = VBContext.getWorkingProject();
        if (!this.projectAware || project.getModelType() == SKOS.uri || project.getModelType() == OntoLex.uri) {
            roleList.push(RDFResourceRolesEnum.concept, RDFResourceRolesEnum.conceptScheme, RDFResourceRolesEnum.skosCollection);
        }
        if (!this.projectAware || project.getModelType() == OntoLex.uri) {
            roleList.push(RDFResourceRolesEnum.limeLexicon, RDFResourceRolesEnum.ontolexForm, RDFResourceRolesEnum.ontolexLexicalEntry, RDFResourceRolesEnum.ontolexLexicalSense);
        }
        if (!this.projectAware || project.getLexicalizationModelType() == SKOSXL.uri) {
            roleList.push(RDFResourceRolesEnum.xLabel);
        }
        roleList.sort();
        roleList.forEach(r => {
            this.roles.push({ id: r, show: ResourceUtils.getResourceRoleLabel(r), checked: false });
        });
    }

    onModelChange() {
        let checkedRoles: RDFResourceRolesEnum[] = this.roles.filter(r => r.checked).map(r => r.id);
        this.propagateChange(checkedRoles);
    }

    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(obj: RDFResourceRolesEnum[]) {
        if (obj) {
            this.roles.forEach(r => {
                r.checked = obj.includes(r.id);
            });
        }
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    //--------------------------------------------------

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };

}

interface RoleStruct {
    id: RDFResourceRolesEnum;
    show: string;
    checked: boolean;
}
