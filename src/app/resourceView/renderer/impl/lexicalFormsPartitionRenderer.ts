import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { PartitionRendererMultiRoot } from "../partitionRendererMultiRoot";
import { ARTResource, ARTURIResource, ARTNode, RDFTypesEnum, ResAttribute } from "../../../models/ARTResources";
import { OntoLex } from "../../../models/Vocabulary";
import { ResViewPartition } from "../../../models/ResourceView";
import { PropertyServices } from "../../../services/propertyServices";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../services/ontoLexLemonServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { NewResourceWithLiteralCfModalReturnData } from "../../../widget/modal/creationModal/newResourceModal/shared/newResourceWithLiteralCfModal";

@Component({
    selector: "lexical-forms-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class LexicalFormsPartitionRenderer extends PartitionRendererMultiRoot {

    //inherited from PartitionRenderSingleRoot
    // @Input('pred-obj-list') predicateObjectList: ARTPredicateObjects[];
    // @Input() resource:ARTURIResource;
    // @Output() update = new EventEmitter();//something changed in this partition. Tells to ResView to update
    // @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();

    partition = ResViewPartition.lexicalForms;
    rootProperties: ARTURIResource[] = [OntoLex.otherForm, OntoLex.canonicalForm];
    knownProperties: ARTURIResource[] = this.rootProperties;
    label = "Lexical forms";
    addBtnImgTitle = "Add a lexical form";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/propObject_create.png");

    private lexiconLang: string; //cache the language of the lexicon

    constructor(resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, resViewModals: ResViewModalServices, private creationModals: CreationModalServices,
        private ontolexService: OntoLexLemonServices, private browsingModals: BrowsingModalServices) {
        super(resourcesService, cfService, basicModals, resViewModals);
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        if (!this.isKnownProperty(predicate)) {
            this.basicModals.alert("Unknown property", predicate.getShow() + " is not a lexical form known property, it cannot be handled.", "error");
            return;
        }

        this.getLexiconLang().subscribe(
            lang => {
                this.lexiconLang = lang;
                this.creationModals.newResourceWithLiteralCf("Create " + predicate.getShow(), OntoLex.form, true, "Written rep", this.lexiconLang, { constrain: true, locale: true }).then(
                    (data: NewResourceWithLiteralCfModalReturnData) => {
                        if (predicate.getURI() == OntoLex.canonicalForm.getURI()) {
                            this.ontolexService.setCanonicalForm(<ARTURIResource>this.resource, data.literal, data.uriResource, data.cfValue).subscribe(
                                stResp => this.update.emit(null)
                            );
                        } else if (predicate.getURI() == OntoLex.otherForm.getURI()) {
                            this.ontolexService.addOtherForm(<ARTURIResource>this.resource, data.literal, data.uriResource, data.cfValue).subscribe(
                                stResp => this.update.emit(null)
                            );
                        }
                    },
                    () => {}
                );
            }
        );
    }

    private getLexiconLang(): Observable<string> {
        if (this.lexiconLang == null) {
            return this.ontolexService.getLexicalEntryLanguage(<ARTURIResource>this.resource);
        } else {
            return Observable.of(this.lexiconLang);
        }
    }


    getPredicateToEnrich(): Observable<ARTURIResource> {
        return Observable.fromPromise(
            this.browsingModals.browsePropertyTree("Select a property", this.rootProperties).then(
                (selectedProp: any) => {
                    return selectedProp;
                },
                () => {}
            )
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => this.update.emit()
        )
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.ontolexService.removeForm(this.resource, predicate, <ARTResource>object);
    }

}