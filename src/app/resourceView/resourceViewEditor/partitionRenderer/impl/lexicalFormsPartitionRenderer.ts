import { Component } from "@angular/core";
import { from, Observable, of } from 'rxjs';
import { PropertyServices } from "src/app/services/propertyServices";
import { ModalType } from 'src/app/widget/modal/Modals';
import { ARTNode, ARTResource, ARTURIResource } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { OntoLex } from "../../../../models/Vocabulary";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../../services/ontoLexLemonServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { NewResourceWithLiteralCfModalReturnData } from "../../../../widget/modal/creationModal/newResourceModal/shared/newResourceWithLiteralCfModal";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRendererMultiRoot } from "../partitionRendererMultiRoot";

@Component({
    selector: "lexical-forms-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class LexicalFormsPartitionRenderer extends PartitionRendererMultiRoot {

    partition = ResViewPartition.lexicalForms;
    addBtnImgSrc = "./assets/images/icons/actions/objectProperty_create.png";

    private lexiconLang: string; //cache the language of the lexicon

    constructor(resourcesService: ResourcesServices, propService: PropertyServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, creationModals: CreationModalServices, resViewModals: ResViewModalServices,
        private ontolexService: OntoLexLemonServices, private browsingModals: BrowsingModalServices) {
        super(resourcesService, propService, cfService, basicModals, creationModals, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    add(predicate: ARTURIResource, propChangeable: boolean) {
        if (!this.isKnownProperty(predicate)) {
            this.basicModals.alert({key:"STATUS.WARNING"}, {key:"MESSAGES.UNHANDLED_LEXICAL_FORM_PROPERTY", params:{property: predicate.getShow()}}, ModalType.warning);
            return;
        }

        this.getLexiconLang().subscribe(
            lang => {
                this.lexiconLang = lang;
                this.creationModals.newResourceWithLiteralCf({key: "ACTIONS.CREATE_X", params: {x: predicate.getShow()}}, OntoLex.form, true, "Written rep", this.lexiconLang, { constrain: true, locale: true }).then(
                    (data: NewResourceWithLiteralCfModalReturnData) => {
                        if (predicate.getURI() == OntoLex.canonicalForm.getURI()) {
                            this.ontolexService.setCanonicalForm(<ARTURIResource>this.resource, data.literal, data.uriResource, data.cfValue).subscribe(
                                () => this.update.emit(null)
                            );
                        } else if (predicate.getURI() == OntoLex.otherForm.getURI()) {
                            this.ontolexService.addOtherForm(<ARTURIResource>this.resource, data.literal, data.uriResource, data.cfValue).subscribe(
                                () => this.update.emit(null)
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
            return of(this.lexiconLang);
        }
    }


    getPredicateToEnrich(): Observable<ARTURIResource> {
        return from(
            this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}, this.rootProperties).then(
                (selectedProp: any) => {
                    return selectedProp;
                },
                () => {}
            )
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTURIResource);
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