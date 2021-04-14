import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ARTLiteral, ARTNode, ARTResource, ResAttribute } from "src/app/models/ARTResources";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { ResourceUtils } from "src/app/utils/ResourceUtils";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { VBContext } from "src/app/utils/VBContext";

@Component({
    selector: "inline-def",
    templateUrl: "./inlineDefinitionComponent.html",
    host: { class: "d-flex align-items-center" }
})
export class InlineDefinitionComponent {
    @Input() readonly: boolean = false;
    @Input() resource: ARTResource; //resource to which the definition is attached
    @Input() definition: ARTNode;
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    private lang: string;

    //actions auth
    editDefAuthorized: boolean;
    deleteDefAuthorized: boolean;

    constructor(private ontolexService: OntoLexLemonServices) {}

    ngOnInit() {
        this.lang = this.definition.getAdditionalProperty(ResAttribute.LANG);
        let langAuthorized = VBContext.getLoggedUser().isAdmin() || VBContext.getProjectUserBinding().getLanguages().find(l => l.toLocaleLowerCase() == this.lang.toLocaleLowerCase());

        this.editDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexUpdateDefinition, this.resource) && 
            langAuthorized && !this.readonly && !ResourceUtils.isTripleInStaging(this.definition);
        this.deleteDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexRemoveDefinition, this.resource) && 
            langAuthorized && !this.readonly && !ResourceUtils.isTripleInStaging(this.definition);
    }

    deleteDefinition() {
        let lexicon = VBContext.getWorkingProjectCtx().getProjectPreferences().activeLexicon;
        this.ontolexService.removeDefinition(this.resource, this.definition, lexicon).subscribe(
            () => this.update.emit()
        )
    }

    onDefinitionEdited(newValue: string) {
        let newDef: ARTLiteral = new ARTLiteral(newValue, null, this.definition.getAdditionalProperty(ResAttribute.LANG));
        let lexicon = VBContext.getWorkingProjectCtx().getProjectPreferences().activeLexicon;
        this.ontolexService.updateDefinition(this.resource, this.definition, newDef, lexicon).subscribe(
            () => this.update.emit()
        )
    }


}