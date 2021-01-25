import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { ARTLiteral, ARTNode, ARTResource, ARTURIResource } from '../../../models/ARTResources';
import { CustomForm, CustomFormValue } from '../../../models/CustomForms';
import { SKOS } from '../../../models/Vocabulary';
import { CustomFormsServices } from '../../../services/customFormsServices';
import { PropertyServices } from '../../../services/propertyServices';
import { ResourcesServices } from '../../../services/resourcesServices';
import { SkosServices } from '../../../services/skosServices';
import { SkosxlServices } from '../../../services/skosxlServices';
import { AuthorizationEvaluator } from '../../../utils/AuthorizationEvaluator';
import { ResourceUtils } from '../../../utils/ResourceUtils';
import { VBActionsEnum } from '../../../utils/VBActions';
import { VBContext } from '../../../utils/VBContext';
import { BasicModalServices } from '../../../widget/modal/basicModal/basicModalServices';
import { CreationModalServices } from '../../../widget/modal/creationModal/creationModalServices';
import { ResViewModalServices } from '../../resourceViewEditor/resViewModals/resViewModalServices';
import { DefEnrichmentType, DefinitionEnrichmentHelper, DefinitionEnrichmentInfo } from '../definitionEnrichmentHelper';
import { DefinitionCustomRangeConfig } from '../languageBox/languageBoxComponent';

@Component({
    selector: "lang-def",
    templateUrl: "./languageDefinition.html",
    styleUrls: ["./languageDefinition.css"]
})

export class LanguageDefinitionComponent {

    @Input() def: ARTNode;
    @Input() resource: ARTResource;
    @Input() lang: string;
    @Input() readonly: boolean;
    @Input() defCrConfig: DefinitionCustomRangeConfig;
    @Output() delete: EventEmitter<void> = new EventEmitter();
    @Output() update = new EventEmitter();
    
    //action auth
    addDefAuthorized: boolean;
    editDefAuthorized: boolean;
    deleteDefAuthorized: boolean;

    constructor(public el: ElementRef, private skosService: SkosServices, private skosxlService: SkosxlServices,
        private resourcesService: ResourcesServices, private customFormsServices: CustomFormsServices,
        private propService: PropertyServices, private resViewModals: ResViewModalServices, 
        private basicModals: BasicModalServices, private creationModals: CreationModalServices) { }


    ngOnChanges(changes: SimpleChanges) {
        if (changes['def'] || changes['resource'] || changes['lang']) {
            let tripleInStaging = (this.def != null) ? ResourceUtils.isTripleInStaging(this.def) : false;
            let langAuthorized = VBContext.getLoggedUser().isAdmin() || VBContext.getProjectUserBinding().getLanguages().indexOf(this.lang) != -1;
            this.addDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.skosAddNote, this.resource) && langAuthorized && !tripleInStaging;
            this.editDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesUpdateTriple, this.resource) && langAuthorized && !tripleInStaging;
            this.deleteDefAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.resourcesRemoveValue, this.resource) && langAuthorized && !tripleInStaging;
        }
    }


    /**
    * This method manages update and add for definition
    * @param newDefValue (taken from view)
    */
    onDefinitionEdited(newDefValue: string, oldDefValue: ARTNode) {
        if (oldDefValue != null && oldDefValue.getShow() != newDefValue) { // update case 
            let newLitForm: ARTLiteral = new ARTLiteral(newDefValue, null, this.lang);
            if (oldDefValue.isLiteral()) { // if standard
                this.resourcesService.updateTriple(this.resource, SKOS.definition, oldDefValue, newLitForm).subscribe(
                    stResp => this.update.emit()
                )
            } else if (oldDefValue.isResource() && this.defCrConfig.hasCustomRange) { // if reified
                this.customFormsServices.updateReifiedResourceShow(this.resource, SKOS.definition, <ARTResource>oldDefValue, newLitForm).subscribe(
                    stResp => this.update.emit()
                )
            }
        } else if (newDefValue != null) { // new case
            let newLitForm: ARTLiteral = new ARTLiteral(newDefValue, null, this.lang);
            this.resourcesService.addValue(this.resource, SKOS.definition, newLitForm).subscribe(
                stResp => this.update.emit()
            )
        }
    }


    deleteDefinition() {
        if (this.def != null) {
            this.delete.emit();
        }
    }

    /**
     * in case skos:definition has CR, click on and empty inline-editable-value triggers a CF
     * @param event 
     */
    onInlineValueClick() {
        if (this.def == null && this.defCrConfig.hasCustomRange && this.addDefAuthorized && !this.readonly) {
            //create a new definition through CF
            DefinitionEnrichmentHelper.getDefinitionEnrichmentInfo(this.propService, this.basicModals, this.defCrConfig).subscribe(
                (info: DefinitionEnrichmentInfo) => {
                    if (info.type == DefEnrichmentType.literal) {
                        this.addPlainDefinition();
                    } else if (info.type == DefEnrichmentType.customForm) {
                        this.addCustomFormDefinition(info.form);
                    }
                }
            );
        }
    }

    /**
     * Open a modal for entering a new plain definition
     */
    private addPlainDefinition() {
        this.creationModals.newPlainLiteral("Add a definition", null, false, this.lang, true).then(
            (literalDef: ARTLiteral) => {
                this.skosService.addNote(this.resource, SKOS.definition, literalDef).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            }
        )
    }

    /**
     * Create a definition through a CF
     * @param cf 
     */
    private addCustomFormDefinition(cf: CustomForm) {
        this.resViewModals.enrichCustomForm({key:"DATA.ACTIONS.ADD_DEFINITION"}, cf.getId(), this.lang).then(
            (entryMap: { [key: string]: any }) => {
                let cfValue: CustomFormValue = new CustomFormValue(cf.getId(), entryMap);
                this.skosService.addNote(this.resource, SKOS.definition, cfValue).subscribe(
                    () => {
                        this.update.emit();
                    }
                )
            },
            () => { }
        );
    }

}