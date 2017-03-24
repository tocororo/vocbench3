import { Component, Input, Output, EventEmitter } from "@angular/core";
import { ARTNode, ARTResource, ARTBNode, ARTURIResource, ARTLiteral, ResAttribute, RDFTypesEnum, ResourceUtils } from "../../models/ARTResources";
import { SKOSXL } from "../../models/Vocabulary";
import { ResourcesServices } from "../../services/resourcesServices";
import { PropertyServices } from "../../services/propertyServices";
import { ModalServices } from "../../widget/modal/modalServices";
import { VocbenchCtx } from "../../utils/VocbenchCtx";

@Component({
	selector: "editable-resource",
	templateUrl: "./editableResourceComponent.html",
})
export class EditableResourceComponent {

	@Input() subject: ARTResource; //subject of the triple which the "resource" represents the object
	@Input() property: ARTURIResource; //property of the triple which the "resource" represents the object
	@Input() resource: ARTNode; //resource shown in the component. Represents the object of a triple shown in a ResourceView partition
	@Output('delete') deleteOutput = new EventEmitter();
	@Output() dblClick = new EventEmitter();

	//useful to perform a check on the type of the edited value.
	//The check isn't too deep, it just distinguishes between resource, literal or any (undetermined)
	private rangeType: RDFTypesEnum = RDFTypesEnum.undetermined;

	// @Output() edited = new EventEmitter();

	private editInProgress: boolean = false;
	private resourceStringValue: string; //editable representation of the resource

	constructor(private resourcesService: ResourcesServices, private propService: PropertyServices,
		private modalService: ModalServices, private vbCtx: VocbenchCtx) { }

	ngOnInit() {
		console.log(this.resource);
	}

	private edit() {
		this.propService.getRange(this.property).subscribe(
			range => {
				if (range.ranges.type == "resource") {
					this.rangeType = RDFTypesEnum.resource;
				} else if (range.ranges.type.toLowerCase().includes("literal")) {
					this.rangeType = RDFTypesEnum.literal;
				}
			}
		)
		this.resourceStringValue = this.resource.toNT();
		this.editInProgress = true;
	}

	private confirmEdit() {
		if (this.resourceStringValue != this.resource.toNT()) {
			try {
				let newValue: ARTNode;
				//parse the string typed by the user
				if (this.resourceStringValue.startsWith("<") && this.resourceStringValue.endsWith(">")) { //uri
					newValue = ResourceUtils.parseURI(this.resourceStringValue);
				} else if (this.resourceStringValue.startsWith("_:")) { //bnode
					newValue = ResourceUtils.parseBNode(this.resourceStringValue);
				} else if (this.resourceStringValue.startsWith("\"")) { //literal
					newValue = ResourceUtils.parseLiteral(this.resourceStringValue);
				} else if (ResourceUtils.isQName(this.resourceStringValue, this.vbCtx.getPrefixMappings())) { //qname
					newValue = ResourceUtils.parseQName(this.resourceStringValue, this.vbCtx.getPrefixMappings());
				} else {
					throw new Error("Not a valid N-Triples representation: " + this.resourceStringValue);
				}
				newValue.setAdditionalProperty(ResAttribute.EXPLICIT, true);

				console.log("oldValue", this.resource);
				console.log("newValue", newValue);

				// let newValue: ARTNode = this.resource.clone(); //clone so the newValue maintain additional attributes of the old value
				// if (this.resource.isURIResource()) {
				// 	let uriRes: ARTURIResource = ResourceUtils.parseURI(this.resourceStringValue);
				// 	(<ARTURIResource>newValue).setURI(uriRes.getURI());
				// 	(<ARTURIResource>newValue).setShow(null);
				// } else if (this.resource.isBNode()) {
				// 	let bNodeRes: ARTBNode = ResourceUtils.parseBNode(this.resourceStringValue);
				// 	(<ARTBNode>newValue).setId(bNodeRes.getId());
				// 	(<ARTBNode>newValue).setShow(null);
				// } else if (this.resource.isLiteral()) {
				// 	let literal: ARTLiteral = ResourceUtils.parseLiteral(this.resourceStringValue);
				// 	(<ARTLiteral>newValue).setValue(literal.getValue());
				// 	(<ARTLiteral>newValue).setLang(literal.getLang());
				// 	(<ARTLiteral>newValue).setDatatype(literal.getDatatype());
				// }

				// let newValue: ARTNode;
				// if (this.resource.isURIResource()) {
				// 	newValue = ResourceUtils.parseURI(this.resourceStringValue);
				// 	(<ARTURIResource>newValue).setShow((<ARTURIResource>newValue).getURI());
				// } else if (this.resource.isBNode()) {
				// 	newValue = ResourceUtils.parseBNode(this.resourceStringValue);
				// 	(<ARTBNode>newValue).setShow((<ARTBNode>newValue).getId());
				// } else if (this.resource.isLiteral()) {
				// 	newValue = ResourceUtils.parseLiteral(this.resourceStringValue);
				// }
				// newValue.setAdditionalProperty(ResAttribute.EXPLICIT, true);

				let warningMsg = ""
				if ((this.rangeType == RDFTypesEnum.literal && !newValue.isLiteral()) ||
					this.rangeType == RDFTypesEnum.resource && !newValue.isResource()) {
					warningMsg = "The type of the new value is not compliant with the range of the property " + this.property.getShow()
						+ ". The change may cause an inconsistency. Do you want to apply the change? ";
					this.modalService.confirm("Warning", warningMsg, "warning").then(
						confirm => { this.applyManualEdit(newValue); },
						reject => { this.editInProgress = false; }
					);
				} else {
					this.applyManualEdit(newValue)
				}
			} catch (err) {
				this.modalService.alert("Edit", err, "error");
				this.editInProgress = false;
			}
		} else {
			this.editInProgress = false;
		}
	}

	private applyManualEdit(newValue: ARTNode) {
		this.resourcesService.updateTriple(this.subject, this.property, this.resource, newValue).subscribe(
			stResp => {
				this.resource = newValue;
				this.editInProgress = false;
				/** I'm not sure whether emit an event (here toward the parent or broadcasting in updateTriple()?)
				 * in order to refresh the ResourceView or let the user decide to refresh.
				 * Note that refreshing the resource view programmatically could be heavy since getResourceView()
				 * for big resources takes a lot of time (~40s for agrovoc concepts */
			}
		);
	}

	private cancelEdit() {
		this.editInProgress = false;
	}

	private replace() {
		alert("Not yet available");
	}

	private delete() {
		this.deleteOutput.emit();
	}

	private resourceDblClick() {
		if (this.resource.isResource()) {
			this.dblClick.emit(<ARTResource>this.resource);
		}
	}

}