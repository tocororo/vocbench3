import { Component, Input, Output, EventEmitter } from "@angular/core";
import {
	ARTNode, ARTResource, ARTBNode, ARTURIResource, ARTLiteral, ResAttribute,
	RDFTypesEnum, RDFResourceRolesEnum, ResourceUtils
} from "../../models/ARTResources";
import { SKOSXL } from "../../models/Vocabulary";
import { ResourcesServices } from "../../services/resourcesServices";
import { PropertyServices } from "../../services/propertyServices";
import { ManchesterServices } from "../../services/manchesterServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { VBContext } from "../../utils/VBContext";

@Component({
	selector: "editable-resource",
	templateUrl: "./editableResourceComponent.html",
})
export class EditableResourceComponent {

	@Input() subject: ARTResource; //subject of the triple which the "resource" represents the object
	@Input() predicate: ARTURIResource; //property of the triple which the "resource" represents the object
	@Input() resource: ARTNode; //resource shown in the component. Represents the object of a triple shown in a ResourceView partition
	@Output('delete') deleteOutput = new EventEmitter();
	@Output() update = new EventEmitter();
	@Output() dblClick = new EventEmitter();

	//useful to perform a check on the type of the edited value.
	//The check isn't too deep, it just distinguishes between resource, literal or any (undetermined)
	private rangeType: RDFTypesEnum;
	private ranges: { type: string, rangeCollection: ARTURIResource[] }; //stores response.ranges of getRange service

	private editInProgress: boolean = false;
	private resourceStringValuePristine: string;
	private resourceStringValue: string; //editable representation of the resource

	constructor(private resourcesService: ResourcesServices, private propService: PropertyServices, private manchesterService: ManchesterServices,
		private basicModals: BasicModalServices, private rvModalService: ResViewModalServices) { }

	private edit() {
		if (this.rangeType == null) { //check to avoid repeating of getRange in case it's not the first time that user edits the value
			this.propService.getRange(this.predicate).subscribe(
				range => {
					this.ranges = range.ranges;
					this.computeResourceStringValue();
				}
			);
		} else {
			this.computeResourceStringValue();
		}
		this.editInProgress = true;
	}

	private computeResourceStringValue() {
		if (this.ranges != null) { //check to void error in case the property has custom ranges that replace the "classic" range
			let type: string = this.ranges.type;
			if (type == "resource") {
				this.rangeType = RDFTypesEnum.resource;
				// special case: if user is editing an xLabel, the widget should allow to edit the literal form, not the uri
				if (this.resource.getAdditionalProperty(ResAttribute.ROLE) == RDFResourceRolesEnum.xLabel) {
					let literalForm: ARTLiteral = new ARTLiteral(
						this.resource.getShow(), null, this.resource.getAdditionalProperty(ResAttribute.LANG));
					this.resourceStringValue = literalForm.toNT();
				}
				//special case: if user is editing a class restriction, the widget should allow to edit the manchester expression
				else if (this.resource.isBNode() && this.resource.getShow().startsWith("(") && this.resource.getShow().endsWith(")")) {
					this.resourceStringValue = this.resource.getShow();
				} else {
					this.resourceStringValue = this.resource.toNT();
				}
			} else if (type.toLowerCase().includes("literal")) {
				this.rangeType = RDFTypesEnum.literal;
				this.resourceStringValue = this.resource.toNT();
			} else {
				this.rangeType = RDFTypesEnum.undetermined; //default
				this.resourceStringValue = this.resource.toNT();
			}
		}
		this.resourceStringValuePristine = this.resourceStringValue;
	}

	private confirmEdit() {
		console.log(this.resourceStringValue, this.resourceStringValuePristine);
		if (this.resourceStringValue != this.resourceStringValuePristine) { //apply edit only if the representation is changed
			try {
				let newValue: ARTNode;
				//parse the string typed by the user
				if (this.resourceStringValue.startsWith("<") && this.resourceStringValue.endsWith(">")) { //uri
					newValue = ResourceUtils.parseURI(this.resourceStringValue);
				} else if (this.resourceStringValue.startsWith("_:")) { //bnode
					newValue = ResourceUtils.parseBNode(this.resourceStringValue);
				} else if (this.resourceStringValue.startsWith("\"")) { //literal
					newValue = ResourceUtils.parseLiteral(this.resourceStringValue);
				} else if (ResourceUtils.isQName(this.resourceStringValue, VBContext.getPrefixMappings())) { //qname
					newValue = ResourceUtils.parseQName(this.resourceStringValue, VBContext.getPrefixMappings());
				} else if (this.resource.isBNode() && this.resourceStringValue.startsWith("(") && this.resourceStringValue.endsWith(")")) {
					this.applyManchesterUpdate(<ARTBNode>this.resource, this.resourceStringValue);
					return;
				} else {
					throw new Error("Not a valid N-Triples representation: " + this.resourceStringValue);
				}

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

				//special case: update of literal form of a skosxl label (role of value is xLabel && new value is a literal)
				if (this.resource.getAdditionalProperty(ResAttribute.ROLE) == RDFResourceRolesEnum.xLabel && newValue.isLiteral()) {
					let oldLitForm: ARTLiteral = new ARTLiteral(this.resource.getShow(), null, this.resource.getAdditionalProperty(ResAttribute.LANG));
					this.applyUpdate(<ARTResource>this.resource, SKOSXL.literalForm, oldLitForm, newValue);
					//case new value has a nature not compliant with the range type
				} else if ((this.rangeType == RDFTypesEnum.literal && !newValue.isLiteral()) ||
					this.rangeType == RDFTypesEnum.resource && !newValue.isResource()) {
					let warningMsg = "The type of the new value is not compliant with the range of the property " + this.predicate.getShow()
						+ ". The change may cause an inconsistency. Do you want to apply the change? ";
					this.basicModals.confirm("Warning", warningMsg, "warning").then(
						confirm => { this.applyUpdate(this.subject, this.predicate, this.resource, newValue); },
						reject => { this.editInProgress = false; }
					);
				} else {
					this.applyUpdate(this.subject, this.predicate, this.resource, newValue);
				}
			} catch (err) {
				this.basicModals.alert("Edit", err, "error");
				this.editInProgress = false;
			}
		} else {
			this.editInProgress = false;
		}
	}

	private applyUpdate(subject: ARTResource, predicate: ARTURIResource, oldValue: ARTNode, newValue: ARTNode) {
		this.resourcesService.updateTriple(subject, predicate, oldValue, newValue).subscribe(
			stResp => {
				this.editInProgress = false;
				/** Event propagated to the resView that refreshes.
				 * I cannot simply update the rdf-resource since the URI of the resource
				 * in the predicate objects list stored in the partition render is still the same */
				this.update.emit(); 
			}
		);
	}

	private applyManchesterUpdate(node: ARTBNode, expression: string) {
		this.manchesterService.updateExpression(this.resourceStringValue, <ARTBNode>this.resource).subscribe(
			stResp => {
				this.editInProgress = false;
				this.update.emit(); 
			}
		);
	}

	private cancelEdit() {
		this.editInProgress = false;
	}

	private replace() {
		this.rvModalService.addPropertyValue("Replace", this.subject, this.predicate, false).then(
			(data: any) => {
				this.applyUpdate(this.subject, this.predicate, this.resource, data.value);
			},
			() => { }
		)
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