import { Component, Input, Output, EventEmitter } from "@angular/core";
import {
	ARTNode, ARTResource, ARTBNode, ARTURIResource, ARTLiteral, ResAttribute,
	RDFTypesEnum, RDFResourceRolesEnum, ResourceUtils
} from "../../models/ARTResources";
import { SKOSXL, SKOS, RDFS, SemanticTurkey } from "../../models/Vocabulary";
import { ResViewPartition } from "../../models/ResourceView";
import { ResourcesServices } from "../../services/resourcesServices";
import { PropertyServices } from "../../services/propertyServices";
import { ManchesterServices } from "../../services/manchesterServices";
import { RefactorServices } from "../../services/refactorServices";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { VBContext } from "../../utils/VBContext";
import { VBProperties } from "../../utils/VBProperties";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";

@Component({
	selector: "editable-resource",
	templateUrl: "./editableResourceComponent.html",
})
export class EditableResourceComponent {

	@Input() subject: ARTResource; //subject of the triple which the "resource" represents the object
	@Input() predicate: ARTURIResource; //property of the triple which the "resource" represents the object
	@Input() resource: ARTNode; //resource shown in the component. Represents the object of a triple shown in a ResourceView partition
	@Input() rendering: boolean;
	@Input() readonly: boolean;
	@Input() partition: ResViewPartition;
	@Output('delete') deleteOutput = new EventEmitter();
	@Output() update = new EventEmitter();
	@Output() dblClick = new EventEmitter();

	//useful to perform a check on the type of the edited value.
	//The check isn't too deep, it just distinguishes between resource, literal or any (undetermined)
	private rangeType: RDFTypesEnum;
	private ranges: {
		type: string,
		rangeCollection: {
			resources: ARTURIResource[],
			dataRanges: (ARTLiteral[])[] 
		}
	}; //stores response.ranges of getRange service

	private isClassAxiom: boolean = false;
	private isPlainLiteral: boolean = false;

	private editMenuDisabled: boolean = false;
	private isInferred: boolean = false;
	private isXLabelMenuItemAvailable: boolean = false;
	private editInProgress: boolean = false;
	private resourceStringValuePristine: string;
	private resourceStringValue: string; //editable representation of the resource

	constructor(private resourcesService: ResourcesServices, private propService: PropertyServices,
		private manchesterService: ManchesterServices, private refactorService: RefactorServices,
		private basicModals: BasicModalServices, private creationModals: CreationModalServices, 
		private browsingModals: BrowsingModalServices, private rvModalService: ResViewModalServices, 
		private vbProp: VBProperties) { }

	ngOnInit() {
		this.isPlainLiteral = (
			(this.resource instanceof ARTLiteral && this.resource.getDatatype() == null) || 
			this.resource.getRole() == RDFResourceRolesEnum.xLabel
		);

		/**
		 * Determines if the menu items about xlabels should be visible.
		 * Visible only if:
		 * the subject is a concept, the object is a xLabel and if it is in the lexicalizations partition
		 * (so avoid "spawn new concept..." from xLabel in labelRelation partition of an xLabel ResView)
		 */
		this.isXLabelMenuItemAvailable = (
			this.partition == ResViewPartition.lexicalizations &&
			this.subject.getRole() == RDFResourceRolesEnum.concept &&
			this.resource.isResource() && (<ARTResource>this.resource).getRole() == RDFResourceRolesEnum.xLabel
		);

		this.isInferred = ResourceUtils.containsNode(this.resource.getGraphs(), new ARTURIResource(SemanticTurkey.inferenceGraph));

		let inMainGraph: boolean = ResourceUtils.containsNode(this.resource.getGraphs(), new ARTURIResource(VBContext.getWorkingProject().getBaseURI()));

		this.editMenuDisabled = (
			(!this.isInferred && !inMainGraph) || //neither in the main graph nor in inference graph
			// (!this.resource.getAdditionalProperty(ResAttribute.EXPLICIT)) || 
			this.readonly || 
			(this.resource.isResource() && ResourceUtils.isReourceInStaging(<ARTResource>this.resource))
		);
	}

	//======== "edit" HANDLER ========

	private edit() {
		//special case: resource is a data range => don't edit inline dataranges, but open the editor instead
		if (this.resource instanceof ARTBNode && this.resource.getRole() == RDFResourceRolesEnum.dataRange) {
			this.rvModalService.editDataRange(this.resource).then(
				ok => { this.update.emit(); },
				() => {}
			);
			return;
		}
		if (this.rangeType == null) { //check to avoid repeating of getRange in case it's not the first time that user edits the value
			this.propService.getRange(this.predicate).subscribe(
				range => {
					this.ranges = range.ranges;
					/**
					 * special case:
					 * if range is typed literal and range ha restriction (datarange or datatype), allow to edit only with enumeration of datarange
					 */
					if (this.ranges != null && this.ranges.type == RDFTypesEnum.typedLiteral) {
						if (this.ranges.rangeCollection.dataRanges != null || this.ranges.rangeCollection.resources != null) {
							this.creationModals.newTypedLiteral("Edit " + this.predicate.getShow(),
								this.ranges.rangeCollection.resources, this.ranges.rangeCollection.dataRanges).then(
								newValue => {
									this.applyUpdate(this.subject, this.predicate, this.resource, newValue);
								},
								() => { }
							);
						}
					} else {
						this.computeResourceStringValue();
						this.editInProgress = true;
					}
				}
			);
		} else {
			this.computeResourceStringValue();
			this.editInProgress = true;
		}
	}

	private editPlainLiteral() {
		if (this.resource instanceof ARTLiteral) {
			this.resourceStringValue = this.resource.getValue();
		} else if (this.resource.getRole() == RDFResourceRolesEnum.xLabel) {
			this.resourceStringValue = this.resource.getShow()
		}
		this.resourceStringValuePristine = this.resourceStringValue;
		this.editInProgress = true;
	}

	private computeResourceStringValue() {
		this.resourceStringValue = this.resource.toNT();//default string value (in the follow if-else override it eventually)
		if (this.ranges != null) { //check to avoid error in case the property has custom ranges that replace the "classic" range
			let type: string = this.ranges.type;
			if (type == RDFTypesEnum.resource) {
				this.rangeType = RDFTypesEnum.resource;
				// special case: if user is editing an xLabel, the widget should allow to edit the literal form, not the uri
				if (this.resource.getRole() == RDFResourceRolesEnum.xLabel) {
					let literalForm: ARTLiteral = new ARTLiteral(
						this.resource.getShow(), null, this.resource.getAdditionalProperty(ResAttribute.LANG));
					this.resourceStringValue = literalForm.toNT();
				}
				//special case: if user is editing a class restriction, the widget should allow to edit the manchester expression
				else if (this.resource.isBNode()) {
					this.manchesterService.isClassAxiom(<ARTBNode>this.resource).subscribe(
						isClassAxiom => {
							if (isClassAxiom) {
								this.isClassAxiom = true;
								this.resourceStringValue = this.resource.getShow();
							}
						}
					)
				}
			} else if (type.toLowerCase().includes("literal")) {
				this.rangeType = RDFTypesEnum.literal;
			} else {
				this.rangeType = RDFTypesEnum.undetermined; //default
			}
			this.resourceStringValuePristine = this.resourceStringValue;
		}
	}

	private confirmEdit() {
		if (this.resourceStringValue != this.resourceStringValuePristine) { //apply edit only if the representation is changed
			if (this.isPlainLiteral) {
				let newValue: ARTLiteral;
				if (this.resource.getRole() == RDFResourceRolesEnum.xLabel) {
					let oldLitForm: ARTLiteral = new ARTLiteral(this.resource.getShow(), null, this.resource.getAdditionalProperty(ResAttribute.LANG));
					let newValue: ARTLiteral = new ARTLiteral(this.resourceStringValue, null, this.resource.getAdditionalProperty(ResAttribute.LANG));
					this.applyUpdate(<ARTResource>this.resource, SKOSXL.literalForm, oldLitForm, newValue);
				} else if (this.resource instanceof ARTLiteral) {
					newValue = new ARTLiteral(this.resourceStringValue, null, this.resource.getLang());
					this.applyUpdate(this.subject, this.predicate, this.resource, newValue);
				}
			} else {
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
					} else if (this.resource.isBNode() && this.isClassAxiom) {
						/** If the editing resource is a bnode and if it represents class axiom,
						 * I can assume that the user has typed a new manchester expression to represent a class axiom */
						this.isClassAxiom = false;
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
					if (this.resource.getRole() == RDFResourceRolesEnum.xLabel && newValue.isLiteral()) {
						let oldLitForm: ARTLiteral = new ARTLiteral(this.resource.getShow(), null, this.resource.getAdditionalProperty(ResAttribute.LANG));
						this.applyUpdate(<ARTResource>this.resource, SKOSXL.literalForm, oldLitForm, newValue);
						//case new value has a nature not compliant with the range type
					// } else if ((this.rangeType == RDFTypesEnum.literal && !newValue.isLiteral()) ||
					// 	this.rangeType == RDFTypesEnum.resource && !newValue.isResource()) {
					} else if (this.isPropertyRangeInconsistentWithNewValue(newValue)) {
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
			}
		} else {
			this.editInProgress = false;
		}
	}

	private isPropertyRangeInconsistentWithNewValue(newValue: ARTNode): boolean {
		if (this.rangeType == RDFTypesEnum.literal && !newValue.isLiteral()) {
			return true;
		} else if (this.rangeType == RDFTypesEnum.resource) {
			/**
			 * special case: if range of property is resource, it is still compliant with literal newValue in case 
			 * in rangeCollection there is rdfs:Literal
			 */
			if (ResourceUtils.containsNode(this.ranges.rangeCollection.resources, RDFS.literal) && newValue.isLiteral()) {
				return false;
			}
			if (!newValue.isResource()) {
				return true;
			}
		}
		return false;
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
		this.manchesterService.checkExpression(expression).subscribe(
			valid => {
				if (valid) {
					this.manchesterService.updateExpression(this.resourceStringValue, <ARTBNode>this.resource).subscribe(
						stResp => {
							this.editInProgress = false;
							this.update.emit();
						}
					);
				} else {
					this.basicModals.alert("Invalid Expression", "'" + expression + "' is not a valid Manchester Expression", "error");
				}
			}
		)
	}

	private cancelEdit() {
		this.editInProgress = false;
	}

	//================================

	/**
	 * "Replace with existing resource" menu item
	 */
	private replace() {
		this.rvModalService.addPropertyValue("Replace", this.subject, this.predicate, false).then(
			(data: any) => {
				this.applyUpdate(this.subject, this.predicate, this.resource, data.value);
			},
			() => { }
		)
	}


	//====== "Spawn new concept from this xLabel" HANDLER

	private spawnNewConceptWithLabel() {
		//here I can cast resource since this method is called only on object with role "xLabel" that are ARTResource
		this.creationModals.newConceptFromLabel("Spawn new concept", <ARTResource>this.resource, SKOS.concept, true, <ARTURIResource>this.subject).then(
			data => {
				let oldConcept: ARTURIResource = <ARTURIResource>this.subject;
				this.refactorService.spawnNewConceptFromLabel(<ARTResource>this.resource, data.schemes, oldConcept,
					data.uriResource, data.broader, data.cfValue).subscribe(
					stResp => {
						this.update.emit();
					}
				);
			},
			() => { }
		);
	}

	private moveLabelToConcept() {
		this.browsingModals.browsePropertyTree("Select a lexicalization predicate", [SKOSXL.prefLabel, SKOSXL.altLabel, SKOSXL.hiddenLabel]).then(
			predicate => {
				this.browsingModals.browseConceptTree("Select a concept", this.vbProp.getActiveSchemes(), false).then(
					newConcept => {
						this.refactorService.moveXLabelToResource(this.subject, predicate, <ARTResource>this.resource, newConcept).subscribe(
							stResp => {
								this.update.emit();
							},
							(err: Error) => {
								if (err.name.endsWith("AlreadyExistingLiteralFormForResourceException")) {
									this.basicModals.confirm("Operation denied", err.message + ". Do you want to force the operation?", "warning").then(
										confirm => {
											this.refactorService.moveXLabelToResource(this.subject, predicate, <ARTResource>this.resource, newConcept, true).subscribe(
												stResp => {
													this.update.emit();
												}
											);			
										},
										() => {}
									);
								}
							}
						)
					},
					() => {}
				)
			},
			() => {}
		)
	}

	//====== Assert inferred statement =============

	private assertInferred() {
		this.resourcesService.addValue(this.subject, this.predicate, this.resource).subscribe(
			stResp => {
				this.update.emit();
			}
		)
	}

	/**
	 * "Delete" menu item
	 */
	private delete() {
		this.deleteOutput.emit();
	}

	private resourceDblClick() {
		if (this.resource.isResource()) {
			this.dblClick.emit(<ARTResource>this.resource);
		}
	}


	//menu item authorizations
	private isEditAuthorized(): boolean {
		return AuthorizationEvaluator.ResourceView.isEditAuthorized(this.partition, this.subject);
	}
	private isDeleteAuthorized(): boolean {
		return AuthorizationEvaluator.ResourceView.isRemoveAuthorized(this.partition, this.subject);
	}
	private isSpawnFromLabelAuthorized(): boolean {
		return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.REFACTOR_SPAWN_NEW_CONCEPT_FROM_LABEL);
	}
	private isMoveLabelAuthorized(): boolean {
		return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.REFACTOR_MOVE_XLABEL_TO_RESOURCE);
	}
	private isAssertAuthorized(): boolean {
		return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.RESOURCES_ADD_VALUE, this.subject);
	}

}