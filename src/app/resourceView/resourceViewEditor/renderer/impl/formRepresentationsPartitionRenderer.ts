import { Component } from "@angular/core";
import { from, Observable, of } from "rxjs";
import { ARTLiteral, ARTNode, ARTURIResource } from "../../../../models/ARTResources";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { OntoLexLemonServices } from "../../../../services/ontoLexLemonServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { MultiActionFunction } from "../multipleActionHelper";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "form-representations-renderer",
    templateUrl: "../partitionRenderer.html",
})
export class FormRepresentationsPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.formRepresentations;
    addBtnImgTitle = "Add a representation";
    addBtnImgSrc = "./assets/images/icons/actions/datatypeProperty_create.png";

    private lexiconLang: string; //cache the language of the lexicon

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices,
        resViewModals: ResViewModalServices, private ontolexService: OntoLexLemonServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    //add as top concept
    add(predicate: ARTURIResource, propChangeable: boolean) {
        this.getLexiconLang().subscribe(
            lang => {
                this.lexiconLang = lang;
                this.creationModals.newPlainLiteral({key: "ACTIONS.ADD_X", params:{x: predicate.getShow()}}, null, false, this.lexiconLang, false, { constrain: true, locale: true }, { enabled: true, allowSameLang: false }).then(
                    (literals: ARTLiteral[]) => {
                        let addFunctions: MultiActionFunction[] = [];
                        literals.forEach((literal: ARTLiteral) => {
                            addFunctions.push({ 
                                function: this.ontolexService.addFormRepresentation(this.resource, literal, predicate), 
                                value: literal
                            });
                        });
                        this.addMultiple(addFunctions);
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
            return of(this.lexiconLang);
        }
    }

    getPredicateToEnrich(): Observable<ARTURIResource> {
        return from(
            this.browsingModals.browsePropertyTree({key:"DATA.ACTIONS.SELECT_PROPERTY"}, [this.rootProperty]).then(
                selectedProp => {
                    return selectedProp;
                },
                () => { return null }
            )
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return of(value instanceof ARTLiteral);
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