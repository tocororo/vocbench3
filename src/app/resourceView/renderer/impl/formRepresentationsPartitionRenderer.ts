import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ARTLiteral, ARTNode, ARTURIResource } from "../../../models/ARTResources";
import { ResViewPartition } from "../../../models/ResourceView";
import { OntoLex } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../services/ontoLexLemonServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "form-representations-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class FormRepresentationsPartitionRenderer extends PartitionRenderSingleRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.formRepresentations;
    rootProperty: ARTURIResource = OntoLex.representation;
    label = "Form Representations";
    addBtnImgTitle = "Add a representation";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/propDatatype_create.png");

    private lexiconLang: string; //cache the language of the lexicon

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private ontolexService: OntoLexLemonServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    //add as top concept
    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.getLexiconLang().subscribe(
            lang => {
                this.lexiconLang = lang;
                this.creationModals.newPlainLiteral("Add " + predicate.getShow(), null, false, this.lexiconLang, false, { constrain: true, locale: true }).then(
                    (literal: ARTLiteral) => {
                        this.ontolexService.addFormRepresentation(this.resource, literal, predicate).subscribe(
                            stResp => this.update.emit()
                        )
                    },
                    () => {}
                );
            }
        );
    }

    private getLexiconLang(): Observable<string> {
        if (this.lexiconLang == null) {
            return this.ontolexService.getFormLanguage(this.resource);
        } else {
            return Observable.of(this.lexiconLang);
        }
    }

    getPredicateToEnrich(): Observable<ARTURIResource> {
        return Observable.fromPromise(
            this.browsingModals.browsePropertyTree("Select a property", [this.rootProperty]).then(
                selectedProp => {
                    return selectedProp;
                },
                () => { }
            )
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(value instanceof ARTLiteral);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => {
                this.update.emit(null)
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.ontolexService.removeFormRepresentation(this.resource, <ARTLiteral> object, predicate);
    }

}