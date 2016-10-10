import {Component} from "@angular/core";
import {BSModalContext} from 'angular2-modal/plugins/bootstrap';
import {DialogRef, ModalComponent} from "angular2-modal";
import {ARTResource, ARTURIResource, ARTBNode, ResAttribute, RDFResourceRolesEnum} from '../../utils/ARTResources';
import {ManchesterServices} from "../../services/manchesterServices";

export class ClassListCreatorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title') {
        super();
        this.size = "lg";
    }
}

@Component({
    selector: "class-list-creator-modal",
    templateUrl: "./classListCreatorModal.html",
})
export class ClassListCreatorModal implements ModalComponent<ClassListCreatorModalData> {
    context: ClassListCreatorModalData;
    
    private selectedTreeClass: ARTURIResource; //class selected in the class tree
    private selectedListElement: ARTResource; //class or expression selected in the class list
    private manchExpr: string; //manchester expression written in input field
    private classList: Array<ARTResource> = []; //classes (ARTURIResource) or expression (ARTBNode)
    
    private duplicateResource: ARTResource; //resource tried to add to the classList but already there 
    
    constructor(public dialog: DialogRef<ClassListCreatorModalData>, public manchService: ManchesterServices) {
        this.context = dialog.context;
    }
    
    /**
     * Adds a class of the class tree to the list of classes to return
     */
    private addClassToList() {
        //check if the class is already in the list
        for (var i = 0; i < this.classList.length; i++) {
            if (this.classList[i].getNominalValue() == this.selectedTreeClass.getNominalValue()) {
                this.duplicateResource = this.classList[i];
                return;
            }
        }
        //push a copy of the selected class in tree to avoid problem with "selected" attribute
        var cls = new ARTURIResource(
            this.selectedTreeClass.getURI(), this.selectedTreeClass.getShow(), this.selectedTreeClass.getRole());
        cls.setAdditionalProperty(ResAttribute.EXPLICIT, this.selectedTreeClass.getAdditionalProperty(ResAttribute.EXPLICIT)); 
        this.classList.push(cls);
        this.duplicateResource = null;
    }
    
    /**
     * Validates the manchester expression and then adds it to the classList
     */
    private addExpressionToList() {
        this.manchService.checkExpression(this.manchExpr).subscribe(
            stResp => {
                //check if the expression is already in the list
                for (var i = 0; i < this.classList.length; i++) {
                    if (this.classList[i].getShow() == this.manchExpr) {
                        this.duplicateResource = this.classList[i];
                        return;
                    }
                }
                //adds the expression as ARTBNode to the list 
                var exprCls = new ARTBNode(this.manchExpr, this.manchExpr, RDFResourceRolesEnum.cls);
                exprCls.setAdditionalProperty(ResAttribute.EXPLICIT, true);
                this.classList.push(exprCls);
                this.manchExpr = null;
                this.duplicateResource = null;
            }
        )
    }
    
    /**
     * Removes a class or an expression from the list of classes to return
     */
    private removeFromList() {
        this.classList.splice(this.classList.indexOf(this.selectedListElement), 1);
        this.selectedListElement = null;
        this.duplicateResource = null;
    }
    
    /**
     * Listener to the event nodeSelected thrown by the class-tree. Updates the selectedTreeClass
     */
    private onTreeClassSelected(cls: ARTURIResource) {
        this.selectedTreeClass = cls;
    }
    
    /**
     * Listener to click on element in the classes list. Updates the selectedListElement
     */
    private onListElementSelected(element: ARTResource) {
        this.selectedListElement = element;
    }
    
    /**
     * Returns true if the given element is the current selectedListElement. Useful in the view to apply
     * style to the selected element in the classes list
     */
    private isListElementSelected(element: ARTResource) {
        return this.selectedListElement == element;
    }
    
    ok(event) {
        event.stopPropagation();
        event.preventDefault();
        this.dialog.close(this.classList);
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}