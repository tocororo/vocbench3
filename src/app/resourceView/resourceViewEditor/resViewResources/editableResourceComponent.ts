import { Component, EventEmitter, Output } from "@angular/core";
import { ARTBNode, ARTLiteral, ARTNode, ARTResource, ARTURIResource, RDFResourceRolesEnum, RDFTypesEnum, ResAttribute, ShowInterpretation } from "../../../models/ARTResources";
import { Language, Languages } from "../../../models/LanguagesCountries";
import { ResViewPartition } from "../../../models/ResourceView";
import { RDFS, SKOS, SKOSXL } from "../../../models/Vocabulary";
import { ExpressionCheckResponse, ManchesterServices } from "../../../services/manchesterServices";
import { PropertyServices } from "../../../services/propertyServices";
import { RefactorServices } from "../../../services/refactorServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { AuthorizationEvaluator, CRUDEnum, ResourceViewAuthEvaluator } from "../../../utils/AuthorizationEvaluator";
import { DatatypeValidator } from "../../../utils/DatatypeValidator";
import { ResourceUtils } from "../../../utils/ResourceUtils";
import { VBActionsEnum } from "../../../utils/VBActions";
import { VBContext } from "../../../utils/VBContext";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { ResViewModalServices } from "../resViewModals/resViewModalServices";
import { AbstractResViewResource } from "./abstractResViewResource";

@Component({
    selector: "editable-resource",
    templateUrl: "./editableResourceComponent.html",
})
export class EditableResourceComponent extends AbstractResViewResource {

    @Output() update = new EventEmitter();
    @Output('edit') editOutput = new EventEmitter(); //fire a request for the renderer to edit the value
    @Output('copyLocale') copyLocaleOutput = new EventEmitter<Language[]>(); //fire a request for the renderer to copy the value to different locales

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

    private isImage: boolean = false;

    private editActionScenario: EditActionScenarioEnum = EditActionScenarioEnum.default;

    //actions authorizations
    private editMenuDisabled: boolean = false;
    private editAuthorized: boolean = false;
    private bulkEditAuthorized: boolean = false;
    private deleteAuthorized: boolean = false;
    private bulkDeleteAuthorized: boolean = false;
    private spawnFromLabelAuthorized: boolean = false;
    private moveLabelAuthorized: boolean = false;
    private assertAuthorized: boolean = false;
    private copyLocalesAuthorized: boolean = false;

    private isInferred: boolean = false;
    private isXLabelMenuItemAvailable: boolean = false;
    private isReplaceMenuItemAvailable: boolean = true;
    private isBulkActionMenuItemAvailable: boolean = true;
    private copyLocalesAction: { available: boolean, locales: Language[] } = { available: false, locales: [] };

    private editInProgress: boolean = false;
    private bulkEditInProgress: boolean = false;
    private editLiteralInProgress: boolean = false;
    private resourceStringValuePristine: string;
    private resourceStringValue: string; //editable representation of the resource

    constructor(private resourcesService: ResourcesServices, private propService: PropertyServices,
        private manchesterService: ManchesterServices, private refactorService: RefactorServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, 
        private creationModals: CreationModalServices, private browsingModals: BrowsingModalServices, 
        private rvModalService: ResViewModalServices, private dtValidator: DatatypeValidator) {
        super();
    }

    ngOnInit() {
        let displayImg: boolean = VBContext.getWorkingProjectCtx().getProjectPreferences().resViewPreferences.displayImg;
        if (displayImg && this.resource.getAdditionalProperty(ResAttribute.IS_IMAGE)) {
            this.isImage = true;
        }

        /**
         * Initializes the editActionScenario: this tells how to handle the "edit" action.
         * For details see the comments written to the enum definitions of the EditActionScenarioEnum.
         */
        if (this.resource instanceof ARTLiteral && this.resource.getDatatype() == null) {
            this.editActionScenario = EditActionScenarioEnum.langTaggedLiteral;
        } else if (this.resource instanceof ARTLiteral && this.resource.getDatatype() != null) {
            this.editActionScenario = EditActionScenarioEnum.typedLiteral;
        } else if (this.resource instanceof ARTResource && this.resource.getRole() == RDFResourceRolesEnum.xLabel) {
            this.editActionScenario = EditActionScenarioEnum.xLabel;
        } else if (
            //in datatypeDefinitions and subPropertyChains partitions the edit is delegated to the PartitionRenderer.
            this.partition == ResViewPartition.datatypeDefinitions || this.partition == ResViewPartition.subPropertyChains ||
            //in facets (precisely inverseOf in property facets) the edit of ObjectProperty expression is delegated to the PartitionRenderer
            (this.partition == ResViewPartition.facets && this.resource.isBNode() && 
            this.resource.getAdditionalProperty(ResAttribute.SHOW_INTERPR) == ShowInterpretation.ope)
        ) {
            this.editActionScenario = EditActionScenarioEnum.partition;
        } else if (this.partition == ResViewPartition.classaxioms && this.resource.isBNode() && 
            this.resource.getAdditionalProperty(ResAttribute.SHOW_INTERPR) == ShowInterpretation.descr) {
            this.editActionScenario = EditActionScenarioEnum.manchesterDescr;
        }

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

        /**
         * Determines if the menu item "Replace with existing resource" should be visible.
         * Visible:
         * in classaxioms partition if object is an IRI
         * in any partitions (except from classaxioms, datatypeFacets, subPropertyChains) if the object is a resource
        */
        this.isReplaceMenuItemAvailable = (
            (this.partition == ResViewPartition.classaxioms && this.resource.isURIResource()) ||
            (this.partition != ResViewPartition.subPropertyChains && this.partition != ResViewPartition.classaxioms &&
                this.partition != ResViewPartition.datatypeDefinitions && this.resource.isResource())
        );

        /**
         * Bulk edit items are available only if those partition where it's safe to update/remove directly the PO in the SPO triple
         */
        this.isBulkActionMenuItemAvailable = (
            this.partition == ResViewPartition.broaders ||
            (this.partition == ResViewPartition.classaxioms && this.resource instanceof ARTURIResource) ||
            // this.partition == ResViewPartition.constituents ||
            // this.partition == ResViewPartition.denotations ||
            this.partition == ResViewPartition.disjointProperties ||
            (this.partition == ResViewPartition.domains && this.resource instanceof ARTURIResource) ||
            this.partition == ResViewPartition.equivalentProperties ||
            // this.partition == ResViewPartition.evokedLexicalConcepts ||
            this.partition == ResViewPartition.labelRelations ||
            // this.partition == ResViewPartition.lexicalForms ||
            // this.partition == ResViewPartition.lexicalSenses ||
            this.partition == ResViewPartition.members ||
            (this.partition == ResViewPartition.ranges && this.resource instanceof ARTURIResource) ||
            this.partition == ResViewPartition.schemes ||
            this.partition == ResViewPartition.subterms ||
            this.partition == ResViewPartition.superproperties ||
            this.partition == ResViewPartition.topconceptof ||
            this.partition == ResViewPartition.types
        );

        this.isInferred = ResourceUtils.isTripleInferred(this.resource);

        //init actions authorization
        let inMainGraph: boolean = ResourceUtils.containsNode(this.resource.getTripleGraphs(), new ARTURIResource(VBContext.getWorkingProject().getBaseURI()));
        this.editMenuDisabled = (
            (!this.isInferred && !inMainGraph) || //neither in the main graph nor in inference graph
            // (!this.resource.getAdditionalProperty(ResAttribute.EXPLICIT)) || 
            this.readonly ||
            ResourceUtils.isTripleInStaging(this.resource)
        );
        this.editAuthorized = ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.U, this.subject, this.resource);
        this.deleteAuthorized = ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.D, this.subject, this.resource);
        this.spawnFromLabelAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.refactorSpawnNewConceptFromLabel, null, this.resource);
        this.moveLabelAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.refactorMoveXLabelToResource, this.subject, this.resource);
        this.assertAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesAddValue, this.subject);
        this.copyLocalesAuthorized = ResourceViewAuthEvaluator.isAuthorized(this.partition, CRUDEnum.C, this.subject, this.resource);
        //bulk actions visible in every partition exept: subPropertyChains that 
        this.bulkEditAuthorized = this.editAuthorized && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdatePredicateObject);
        this.bulkDeleteAuthorized = this.deleteAuthorized && AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemovePredicateObject);

		/**
		 * Copy to locales option is available only in lexicalizations, notes and properties partitions
		 * (currenlty only for simplicity, I will see later if it can be enabled also in other partitions) if:
		 * - in lexicalizations if the value is a plain literal or an xlabel with a language
		 * - in notes if the value is a plain literal with a language
		 * - in proeprties if the value is a plain literal with a language
		 */
        if (
            this.resource.getAdditionalProperty(ResAttribute.LANG) != null && (
                (this.partition == ResViewPartition.properties && this.editActionScenario == EditActionScenarioEnum.langTaggedLiteral) || //plain in notes
                (this.partition == ResViewPartition.notes && this.editActionScenario == EditActionScenarioEnum.langTaggedLiteral) || //plain in notes
                (this.partition == ResViewPartition.lexicalizations && //plain or xlabel in lexicalizations
                    (this.editActionScenario == EditActionScenarioEnum.langTaggedLiteral || this.editActionScenario == EditActionScenarioEnum.xLabel)
                )
            )) {
            let projectLangs: Language[] = VBContext.getWorkingProjectCtx().getProjectSettings().projectLanguagesSetting;
            let userAssignedLangs: string[] = VBContext.getProjectUserBinding().getLanguages();
            let intersection: Language[];
            if (userAssignedLangs.length == 0 && VBContext.getLoggedUser().isAdmin()) {
                intersection = projectLangs; //admin with no lang assigned => assign all project langs
            } else {
                intersection = projectLangs.filter((l: Language) => { return userAssignedLangs.indexOf(l.tag) != -1 });
            }
            let locales = Languages.getLocales(intersection, this.resource.getAdditionalProperty(ResAttribute.LANG));
            this.copyLocalesAction = {
                available: locales.length > 0,
                locales: locales
            }
        }

    }

    //======== "edit" HANDLER ========

    private editLiteral() {
        if (this.editActionScenario == EditActionScenarioEnum.xLabel) {
            this.resourceStringValue = this.resource.getShow()
        } else if (this.editActionScenario == EditActionScenarioEnum.typedLiteral || this.editActionScenario == EditActionScenarioEnum.langTaggedLiteral) {
            this.resourceStringValue = (<ARTLiteral>this.resource).getValue();
        }
        this.resourceStringValuePristine = this.resourceStringValue;
        this.editLiteralInProgress = true;
    }

    private edit() {
        if (this.editActionScenario == EditActionScenarioEnum.partition) {
            this.editOutput.emit();
        } else if (this.editActionScenario == EditActionScenarioEnum.manchesterDescr) {
            this.sharedModals.manchesterExpression("Edit expression", this.resource.getShow()).then(
                expr => {
                    if (expr == this.resource.getShow()) return; //if expression didn't change, don't do nothing
                    this.manchesterService.updateExpression(expr, <ARTBNode>this.resource).subscribe(
                        () => { this.update.emit(); }
                    );
                },
                () => {}
            )
        } else { //default
            //special case: resource is a data range => don't edit inline dataranges, but open the editor instead
            if (this.resource instanceof ARTBNode && this.resource.getRole() == RDFResourceRolesEnum.dataRange) {
                this.rvModalService.editDataRange(this.resource).then(
                    ok => { this.update.emit(); },
                    () => { }
                );
            }
            else {
                if (this.rangeType == null) { //check to avoid repeating of getRange in case it's not the first time that user edits the value
                    this.propService.getRange(this.predicate).subscribe(
                        range => {
                            this.ranges = range.ranges;
                            /**
                            * special case: if range is literal and has restriction (datarange), allow to edit only with datarange
                            */
                            if (
                                this.ranges != null && this.ranges.type == RDFTypesEnum.literal && 
                                this.ranges.rangeCollection != null && this.ranges.rangeCollection.dataRanges != null
                            ) {
                                this.creationModals.newTypedLiteral("Edit " + this.predicate.getShow(), this.predicate,
                                    this.ranges.rangeCollection.resources, this.ranges.rangeCollection.dataRanges, true).then(
                                    (literals: ARTLiteral[]) => {
                                        this.updateTriple(this.subject, this.predicate, this.resource, literals[0]);
                                    },
                                    () => { }
                                );
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
        }
    }

    private bulkEdit() {
        this.computeResourceStringValue();
        this.bulkEditInProgress = true;
    }

    private computeResourceStringValue() {
        this.resourceStringValue = this.resource.toNT();//default string value (in the follow if-else override it eventually)
        if (this.ranges != null) { //check to avoid error in case the property has custom ranges that replace the "classic" range
            let type: string = this.ranges.type;
            if (type == RDFTypesEnum.resource) {
                this.rangeType = RDFTypesEnum.resource;
                // special case: if user is editing an xLabel, the widget should allow to edit the literal form, not the uri
                if (this.resource instanceof ARTResource && this.resource.getRole() == RDFResourceRolesEnum.xLabel) {
                    let literalForm: ARTLiteral = new ARTLiteral(
                        this.resource.getShow(), null, this.resource.getAdditionalProperty(ResAttribute.LANG));
                    this.resourceStringValue = literalForm.toNT();
                }
                //special case: if user is editing a class restriction, the widget should allow to edit the manchester expression
                else if (this.resource instanceof ARTBNode && this.resource.getAdditionalProperty(ResAttribute.SHOW_INTERPR) != null) {
                    this.resourceStringValue = this.resource.getShow();
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
            if (this.editLiteralInProgress) {
                if (this.editActionScenario == EditActionScenarioEnum.langTaggedLiteral) {
                    let newValue: ARTLiteral = new ARTLiteral(this.resourceStringValue, null, (<ARTLiteral>this.resource).getLang());
                    if (this.partition == ResViewPartition.lexicalizations) {
                        this.updateLexicalization(this.subject, this.predicate, <ARTLiteral>this.resource, newValue);
                    } else {
                        this.updateTriple(this.subject, this.predicate, this.resource, newValue);
                    }
                } else if (this.editActionScenario == EditActionScenarioEnum.typedLiteral) {
                    let newValue: ARTLiteral = new ARTLiteral(this.resourceStringValue, (<ARTLiteral>this.resource).getDatatype(), null);
                    if (!this.isTypedLiteralValid(newValue)) {
                        this.basicModals.alert("Invalid value", newValue.getValue() + " is not a valid value for the given datatype: " + newValue.getDatatype(), "warning");
                        this.cancelEdit();
                        return;
                    }
                    this.updateTriple(this.subject, this.predicate, this.resource, newValue);
                } else if (this.editActionScenario == EditActionScenarioEnum.xLabel) {
                    let oldLitForm: ARTLiteral = new ARTLiteral(this.resource.getShow(), null, this.resource.getAdditionalProperty(ResAttribute.LANG));
                    let newValue: ARTLiteral = new ARTLiteral(this.resourceStringValue, null, this.resource.getAdditionalProperty(ResAttribute.LANG));
                    if (this.partition == ResViewPartition.lexicalizations) {
                        this.updateLexicalization(<ARTResource>this.resource, SKOSXL.literalForm, oldLitForm, newValue);
                    } else {
                        this.updateTriple(<ARTResource>this.resource, SKOSXL.literalForm, oldLitForm, newValue);
                    }
                }
            } else if (this.bulkEditInProgress) {
                try {
                    let newValue: ARTNode = this.parseEditedValue();
                    //check consistency of the new value
                    if (this.isPropertyRangeInconsistentWithNewValue(newValue)) {
                        let warningMsg = "The type of the new value is not compliant with the range of the property " + this.predicate.getShow()
                            + ". The change may cause an inconsistency. Do you want to apply the change? ";
                        this.basicModals.confirm("Warning", warningMsg, "warning").then(
                            confirm => {
                                this.resourcesService.updatePredicateObject(this.predicate, this.resource, newValue).subscribe(
                                    stResp => this.update.emit()
                                );
                            },
                            reject => { this.cancelEdit(); }
                        );
                    } else {
                        this.basicModals.confirm("Bulk edit", "Warning. You are updating the value for every resource that has this predicate-value relation. Are you sure?").then(
                            () => {
                                this.resourcesService.updatePredicateObject(this.predicate, this.resource, newValue).subscribe(
                                    stResp => this.update.emit()
                                );
                            },
                            () => {
                                this.cancelEdit();
                            }
                        );
                    }
                } catch (err) {
                    this.basicModals.alert("Edit", err, "warning");
                    this.cancelEdit();
                }
            } else if (this.editInProgress) {
                try {
                    try {
                        let newValue: ARTNode = this.parseEditedValue();
                        //check consistency of the new value
                        if (this.isPropertyRangeInconsistentWithNewValue(newValue)) {
                            let warningMsg = "The type of the new value is not compliant with the range of the property " + this.predicate.getShow()
                                + ". The change may cause an inconsistency. Do you want to apply the change?";
                            this.basicModals.confirm("Warning", warningMsg, "warning").then(
                                confirm => { this.updateTriple(this.subject, this.predicate, this.resource, newValue); },
                                reject => { this.cancelEdit(); }
                            );
                        } else {
                            this.updateTriple(this.subject, this.predicate, this.resource, newValue);
                        }
                    } catch (err) { //if resourceStringValue is not a NTriple representation, check if it is a manchester expr. 
                        if (this.resource.isBNode() && this.resource.getAdditionalProperty(ResAttribute.SHOW_INTERPR) != null) {
                            //If the editing resource is a bnode and it has a show interpretation, it means that it is a manch expr,
                            this.applyManchesterUpdate(<ARTBNode>this.resource, this.resourceStringValue);
                            return;
                        } else { //if neither a manchester expression, re-throw the exception
                            throw err;
                        }
                    }
                } catch (err) {
                    this.basicModals.alert("Edit", err, "warning");
                    this.cancelEdit();
                }
            }
        } else {
            this.cancelEdit();
        }
    }

    private parseEditedValue(): ARTNode {
        let newValue: ARTNode;
        //parse the string typed by the user
        if (this.resourceStringValue.startsWith("<") && this.resourceStringValue.endsWith(">")) { //uri
            newValue = ResourceUtils.parseURI(this.resourceStringValue);
        } else if (this.resourceStringValue.startsWith("_:")) { //bnode
            newValue = ResourceUtils.parseBNode(this.resourceStringValue);
        } else if (this.resourceStringValue.startsWith("\"")) { //literal
            newValue = ResourceUtils.parseLiteral(this.resourceStringValue);
            let litValue: ARTLiteral = <ARTLiteral>newValue;
            if (litValue.getDatatype() != null && !this.isTypedLiteralValid(litValue)) {
                throw new Error(litValue.getValue() + " is not a valid value for the given datatype: " + litValue.getDatatype());
            }
        } else if (ResourceUtils.isQName(this.resourceStringValue, VBContext.getPrefixMappings())) { //qname
            newValue = ResourceUtils.parseQName(this.resourceStringValue, VBContext.getPrefixMappings());
        } else {
            throw new Error("Not a valid N-Triples representation: " + this.resourceStringValue);
        }
        return newValue;
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

    private updateTriple(subject: ARTResource, predicate: ARTURIResource, oldValue: ARTNode, newValue: ARTNode) {
        this.resourcesService.updateTriple(subject, predicate, oldValue, newValue).subscribe(
            stResp => {
                this.cancelEdit;
				/** Event propagated to the resView that refreshes.
				 * I cannot simply update the rdf-resource since the URI of the resource
				 * in the predicate objects list stored in the partition render is still the same */
                this.update.emit();
            }
        );
    }

    /**
     * This method handles the edit of a value (EditScenario xlabel or langTaggedLiteral) in the lexicalizations partition.
     * For the moment this is a "workaround" to allow a more specific authorization check with the lexicalization edit
     * (which has a dedicated service, more specific than the general updateTriple).
     * In the future (if more specific/dedicated services will be provided for the triples update) 
     * it could be handled differently, namely an edit event is propagated up to the renderer that handles ad hoc the edit.
     * @param subject 
     * @param predicate 
     * @param oldValue 
     * @param newValue 
     */
    private updateLexicalization(subject: ARTResource, predicate: ARTURIResource, oldValue: ARTLiteral, newValue: ARTLiteral) {
        this.resourcesService.updateLexicalization(subject, predicate, oldValue, newValue).subscribe(
            stResp => {
                this.cancelEdit;
                this.update.emit();
            }
        );
    }

    /**
     * Theoretically this should be never invoked since every resource that represents a manchester expression
     * should be handled by the proper partition renderer. Anyway I leave it as it is a fallback handling mechanism
     */
    private applyManchesterUpdate(node: ARTBNode, expression: string) {
        this.manchesterService.checkExpression(expression).subscribe(
            (checkResp: ExpressionCheckResponse) => {
                if (checkResp.valid) {
                    this.manchesterService.updateExpression(this.resourceStringValue, node).subscribe(
                        stResp => {
                            this.cancelEdit();
                            this.update.emit();
                        }
                    );
                } else {
                    let detailsMsg: string[] = checkResp.details.map(d => d.msg);
                    this.basicModals.alert("Invalid Expression", "'" + expression + "' is not a valid Manchester Expression", "warning", detailsMsg.join("\n"));
                }
            }
        )
    }

    private cancelEdit() {
        this.editInProgress = false;
        this.bulkEditInProgress = false;
        this.editLiteralInProgress = false;
    }

    private isTypedLiteralValid(literal: ARTLiteral): boolean {
        let dt: ARTURIResource = new ARTURIResource(literal.getDatatype());
        let valid = this.dtValidator.isValid(literal, dt);
        return valid;
    }

    //====== "Replace with existing resource" HANDLER =====

    private replace() {
        this.rvModalService.addPropertyValue("Replace", this.subject, this.predicate, false, null, false).then(
            (data: any) => {
                this.updateTriple(this.subject, this.predicate, this.resource, data.value[0]);
            },
            () => { }
        )
    }

    //====== "Spawn new concept from this xLabel" HANDLER =====

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

    //====== "Move xLabel to another concept" HANDLER =====

    private moveLabelToConcept() {
        this.browsingModals.browsePropertyTree("Select a lexicalization predicate", [SKOSXL.prefLabel, SKOSXL.altLabel, SKOSXL.hiddenLabel]).then(
            predicate => {
                let activeSchemes: ARTURIResource[] = VBContext.getWorkingProjectCtx().getProjectPreferences().activeSchemes;
                this.browsingModals.browseConceptTree("Select a concept", activeSchemes, false).then(
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
                                        () => { }
                                    );
                                }
                            }
                        )
                    },
                    () => { }
                )
            },
            () => { }
        )
    }

    //====== "Assert inferred statement" HANDLER =====

    private assertInferred() {
        this.resourcesService.addValue(this.subject, this.predicate, this.resource).subscribe(
            stResp => {
                this.update.emit();
            }
        )
    }

    //====== "Copy value to other locales" HANDLER =====

    private copyLocales() {
        this.rvModalService.copyLocale(this.resource, this.copyLocalesAction.locales).then(
            locales => {
                this.copyLocaleOutput.emit(locales);
            },
            () => { }
        )
    }

    //====== "Delete" HANDLER =====

    private bulkDelete() {
        this.basicModals.confirm("Bulk delete", "Warning. You are deleting the value for every resource that has this predicate-value relation. Are you sure?").then(
            () => {
                this.resourcesService.removePredicateObject(this.predicate, this.resource).subscribe(
                    stResp => {
                        this.update.emit();
                    }
                );
            },
            () => { }
        );
    }

    //==============================

}


/**
 * Enum that tells how to handle the "edit" action.
 */
enum EditActionScenarioEnum {
    xLabel = "xLabel", //edit should allow to change the literal form
    langTaggedLiteral = "langTaggedLiteral", //edit should allow to change the content of the literal without langTag
    typedLiteral = "typedLiteral", //edit should allow to change the content of the literal without datatype
    manchesterDescr = "manchesterDescr", //class axiom description expressed in manchester => edit handled through a manchester editor modal
    partition = "partition", //edit should be handled ad hoc by the partition (an event is emitted) which should implements an editHandler method
    default = "default" //edit should allow to edit the NT form (iri/bnode/...)
}