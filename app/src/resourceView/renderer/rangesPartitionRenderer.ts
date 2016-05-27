import {Component, Input, Output, EventEmitter} from "@angular/core";
import {ARTResource, ARTNode, ARTURIResource, RDFResourceRolesEnum} from "../../utils/ARTResources";
import {RDFS, XmlSchema} from "../../utils/Vocabulary";
import {RdfResourceComponent} from "../../widget/rdfResource/rdfResourceComponent";
import {BrowsingServices} from "../../widget/modal/browsingModal/browsingServices";
import {ModalServices} from "../../widget/modal/modalServices";
import {PropertyServices} from "../../services/propertyServices";
import {ManchesterServices} from "../../services/manchesterServices";

@Component({
	selector: "ranges-renderer",
	templateUrl: "app/src/resourceView/renderer/rangesPartitionRenderer.html",
	directives: [RdfResourceComponent],
    providers: [PropertyServices, ManchesterServices, BrowsingServices],
})
export class RangesPartitionRenderer {
    
    @Input('object-list') objectList:ARTURIResource[];
    @Input() resource:ARTURIResource;
    @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    
    constructor(private propService:PropertyServices, private manchService: ManchesterServices,
        private browsingService: BrowsingServices, private modalService: ModalServices) {}
    
    /**
     * Returns true if the current described resource is a datatype property. Useful to
     * render the add function as simple button ("add existing class") or as dropbdown list with two choices
     * "add existing class" or "Create and add class expression" 
     */
    isDatatypeProperty(): boolean {
        return this.resource.getRole() == RDFResourceRolesEnum.datatypeProperty;
    }
    
    private addExistingClass() {
        this.browsingService.browseClassTree("Select a range class").then(
            selectedClass => {
                this.propService.addPropertyRange(this.resource, selectedClass).subscribe(
                    stResp => this.update.emit(null)
                );
            },
            () => {}
        );
    }
    
    private addClassExpression() {
        this.modalService.prompt("Class Expression (Manchester Syntax)").then(
            manchExpr => {
                this.manchService.checkExpression(manchExpr).subscribe(
                    stResp => {
                        this.manchService.createRestriction(this.resource, RDFS.range, manchExpr).subscribe(
                            stResp => this.update.emit(null)
                        );
                    }
                )
            },
            () => {}
        );
    }
    
    /**
     * Invokable just for datatype properties
     */
    private addRangeDatatype() {
        var datatypes: Array<ARTURIResource> = [XmlSchema.boolean, XmlSchema.date,
            XmlSchema.dateTime, XmlSchema.float, XmlSchema.integer, XmlSchema.string]; 
            
        this.modalService.selectResource("Select range datatype", null, datatypes).then(
            selection => {
                this.propService.addPropertyRange(this.resource, selection).subscribe(
                    stResp => this.update.emit(null)
                )
            },
            () => {}
        );
    }
    
    private remove(range: ARTNode) {
        if (range.isBNode()) {
            this.manchService.removeExpression(this.resource, RDFS.range, range).subscribe(
                stResp => this.update.emit(null)
            )
        } else {
            this.propService.removePropertyRange(this.resource, <ARTURIResource>range).subscribe(
                stResp => {
                    this.update.emit(null);
                }
            );
        }
    }
    
    private objectDblClick(obj: ARTResource) {
        //clicked object (range class) can be a URIResource or BNode
        this.dblclickObj.emit(obj);
    }
    
}