import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Observable, Subscription } from "rxjs";
import { Form, LexicalEntry, LexicalResourceUtils, Sense } from "src/app/models/LexicographerView";
import { OntoLex, Vartrans } from "src/app/models/Vocabulary";
import { ClassesServices } from "src/app/services/classesServices";
import { LexicographerViewServices } from "src/app/services/lexicographerViewServices";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { PropertyServices } from "src/app/services/propertyServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { AuthorizationEvaluator } from "src/app/utils/AuthorizationEvaluator";
import { VBActionsEnum } from "src/app/utils/VBActions";
import { VBEventHandler } from "src/app/utils/VBEventHandler";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";
import { NewConceptualizationCfModalReturnData } from "src/app/widget/modal/creationModal/newResourceModal/ontolex/newConceptualizationCfModal";
import { NewOntoLexicalizationCfModalReturnData } from "src/app/widget/modal/creationModal/newResourceModal/ontolex/newOntoLexicalizationCfModal";
import { ModalOptions } from "src/app/widget/modal/Modals";
import { SharedModalServices } from "src/app/widget/modal/sharedModal/sharedModalServices";
import { ARTLiteral, ARTResource, ARTURIResource } from "../../models/ARTResources";
import { HttpServiceContext } from "../../utils/HttpManager";
import { UIUtils } from "../../utils/UIUtils";
import { ProjectContext } from "../../utils/VBContext";
import { ResViewSettingsModal } from "../resViewSettingsModal";
import { LexicoRelationModalReturnData } from "./lexicalRelation/lexicalRelationModal";
import { LexViewCache } from "./LexViewChache";
import { LexViewHelper } from "./LexViewHelper";
import { LexViewModalService } from "./lexViewModalService";

@Component({
    selector: "lexicographer-view",
    templateUrl: "./lexicographerViewComponent.html",
    host: { class: "vbox" }
})
export class LexicographerViewComponent {
    @Input() resource: ARTURIResource;
    @Input() readonly: boolean = false;
    @Input() projectCtx: ProjectContext;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    @ViewChild('blockDiv', { static: true }) blockDivElement: ElementRef;
    private viewInitialized: boolean = false; //in order to wait blockDiv to be ready

    private eventSubscriptions: Subscription[] = [];

    lexEntry: LexicalEntry;

    lemma: Form[];
    otherForms: Form[];
    senses: Sense[];

    lang: string; //language of the writtenRep of the lemma

    pendingOtherForm: boolean;

    lexViewCache: LexViewCache; //cache of lex view, provided to the child components

    //auth
    addOtherFormAuthorized: boolean;
    addRelatedAuthorized: boolean;
    addTranslationAuthorized: boolean;
    addLexicalizationAuthorized: boolean;
    addConceptualizationAuthorized: boolean;
    addSubtermAuthorized: boolean;
    addConstituentAuthorized: boolean;

    constructor(private lexicographerViewService: LexicographerViewServices, private lexViewHelper: LexViewHelper, private resourceService: ResourcesServices,
        private ontolexService: OntoLexLemonServices, private propertyService: PropertyServices, private classService: ClassesServices,
        private creationModals: CreationModalServices, private sharedModals: SharedModalServices, private lexViewModals: LexViewModalService,
        private browsingModals: BrowsingModalServices, private eventHandler: VBEventHandler, private modalService: NgbModal) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['resource'] && changes['resource'].currentValue) {
            //if not the first change, avoid to refresh res view if resource is not changed
            if (!changes['resource'].firstChange) { 
                let prevRes: ARTResource = changes['resource'].previousValue;
                if (prevRes.getNominalValue() == this.resource.getNominalValue()) {
                    return;
                }
            }
            if (this.viewInitialized) {
                this.buildLexicographerView();//refresh resource view when Input resource changes
            }
        }
    }

    ngOnInit() {
        this.readonly = this.readonly || HttpServiceContext.getContextVersion() != null; //if it is working on an old dump version, disable the updates

        this.lexViewCache = new LexViewCache(this.lexicographerViewService, this.propertyService, this.classService, this.sharedModals);

        this.eventSubscriptions.push(this.eventHandler.resourceUpdatedEvent.subscribe(
            (resource: ARTResource) => this.onResourceUpdated(resource)
        ));
    }

    ngAfterViewInit() {
        this.viewInitialized = true;
        this.buildLexicographerView();
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe());
    }

    buildLexicographerView() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.lexicographerViewService.getLexicalEntryView(this.resource).subscribe(
            resp => {
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);

                this.lexEntry = LexicalEntry.parse(resp);
                this.update.emit(this.lexEntry.id);
                
                this.lemma = this.lexEntry.lemma;
                this.sortForms(this.lemma);

                this.lang = this.lemma[0].writtenRep[0].getLang();

                this.otherForms = this.lexEntry.otherForms;
                this.sortForms(this.otherForms);

                this.senses = this.lexEntry.senses;
                this.sortSenses(this.senses);

                if (LexicalResourceUtils.isInStagingRemove(this.lexEntry)) {
                    this.readonly = true;
                }

                this.addOtherFormAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddOtherForm) && !this.readonly;
                this.addLexicalizationAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddLexicalization, this.lexEntry.id) && !this.readonly;
                this.addConceptualizationAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddConceptualization, this.lexEntry.id) && !this.readonly;
                this.addSubtermAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexAddSubterm) && !this.readonly;
                this.addConstituentAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexSetLexicalEntryConstituent) && !this.readonly;

                //TODO server side this service has a temp preauthorized, keep it updated when it will be changed
                this.addRelatedAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexCreateLexicoSemRelation) && !this.readonly;
                this.addTranslationAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.ontolexCreateLexicoSemRelation) && !this.readonly;
            }
        );
    }

    private sortForms(forms: Form[]) {
        //sort forms according the written rep
        forms.sort((f1, f2) => {
            return f1.writtenRep[0].getShow().localeCompare(f2.writtenRep[0].getShow())
        })
        //sort also the morphosyntactic properties
        forms.forEach(f => {
            //by predicate
            f.morphosyntacticProps.sort((mp1, mp2) => {
                return mp1.getPredicate().getLocalName().toLocaleLowerCase().localeCompare(mp2.getPredicate().getLocalName().toLocaleLowerCase());
            })
            //and for each of them sort the objects
            f.morphosyntacticProps.forEach(mp => {
                mp.getObjects().sort((o1, o2) => {
                    return o1.getNominalValue().toLocaleLowerCase().localeCompare(o2.getNominalValue().toLocaleLowerCase());
                })
            })
        })
    }
    
    private sortSenses(senses: Sense[]) {
        senses.sort((s1, s2) => {
            if (s1.reference.length != 0 && s2.reference.length != 0) {
                return s1.reference[0].getShow().localeCompare(s2.reference[0].getShow())
            } else if (s1.reference.length != 0 && s2.reference.length == 0) {
                return 1
            } else if (s1.reference.length == 0 && s2.reference.length != 0) {
                return -1
            } else {
                return s1.id.getNominalValue().localeCompare(s2.id.getNominalValue());
            }
        });
    }

    //==== Forms ====

    addOtherForm() {
        this.pendingOtherForm = true;
    }
    onPendingOtherFormCanceled() {
        this.pendingOtherForm = false;
    }
    onPendingOtherFormConfirmed(value: string) {
        let writtenRep: ARTLiteral = new ARTLiteral(value, null, this.lang);
        this.ontolexService.addOtherForm(this.resource, writtenRep).subscribe(
            () => {
                this.pendingOtherForm = null;
                this.buildLexicographerView();
            }
        )
    }

    //==== Subterm and constituents ====

    addSubterm() {
        this.browsingModals.browseLexicalEntryList({key:"DATA.ACTIONS.SELECT_LEXICAL_ENTRY"}).then(
            (targetEntry: ARTURIResource) => {
                this.ontolexService.addSubterm(<ARTURIResource>this.lexEntry.id, targetEntry).subscribe(
                    () => {
                        this.buildLexicographerView();
                    }
                )
            },
            () => {}
        )
    }

    setConstituents() {
        this.lexViewHelper.setConstituents(this.resource).subscribe(
            (done: boolean) => {
                if (done) {
                    this.buildLexicographerView();
                }
            }
        )
    }

    //==== Relations ====

    addRelated() {
        this.lexViewModals.createRelation({key: "DATA.ACTIONS.ADD_RELATED_LEX_ENTRY"}, this.lexEntry.id).then(
            (data: LexicoRelationModalReturnData) => {
                let addRelationFn: Observable<void>;
                if (data.reified) {
                    addRelationFn = this.ontolexService.createLexicoSemanticRelation(this.lexEntry.id, data.target, data.undirectional, Vartrans.LexicalRelation, data.category);
                } else {
                    addRelationFn = this.resourceService.addValue(this.lexEntry.id, data.category, data.target);
                }
                addRelationFn.subscribe(
                    () => {
                        this.buildLexicographerView();
                    }
                );
            },
            () => {}
        )
    }

    addTranslation() {
        this.lexViewModals.createRelation({key: "DATA.ACTIONS.ADD_TRANSLATION"}, this.lexEntry.id, true).then(
            (data: LexicoRelationModalReturnData) => {
                let addRelationFn: Observable<void>;
                if (data.reified) {
                    addRelationFn = this.ontolexService.createLexicoSemanticRelation(this.lexEntry.id, data.target, data.undirectional, Vartrans.Translation, data.category, data.tranlsationSet);
                } else {
                    addRelationFn = this.resourceService.addValue(this.lexEntry.id, Vartrans.translatableAs, data.target);
                }
                addRelationFn.subscribe(
                    () => {
                        this.buildLexicographerView();
                    }
                );
            },
            () => {}
        )
    }

    //==== Senses ====
    
    addLexicalization() {
        this.creationModals.newOntoLexicalizationCf({key:"DATA.ACTIONS.ADD_LEXICAL_SENSE"}, OntoLex.sense, false).then(
            (data: NewOntoLexicalizationCfModalReturnData) => {
                this.ontolexService.addLexicalization(this.resource, data.linkedResource, data.createPlain, data.createSense, data.cls, data.cfValue).subscribe(
                    () => {
                        this.buildLexicographerView();
                    }
                );
            },
            () => {}
        )
    }

    addConceptualization() {
        this.creationModals.newConceptualizationCf({key:"DATA.ACTIONS.ADD_CONCEPTUALIZATION"}, false).then(
            (data: NewConceptualizationCfModalReturnData) => {
                this.ontolexService.addConceptualization(this.resource, data.linkedResource, data.createPlain, true, data.cls, data.cfValue).subscribe(
                    () => {
                        this.buildLexicographerView();
                    }
                )
            }
        )
    }

    //==== Utils ====

    resourceDblClick(resource: ARTResource) {
        this.dblclickObj.emit(resource);
    }

    /**
     * Opens a modal that allows to edit the resource view settings
     */
    openSettings() {
        const modalRef: NgbModalRef = this.modalService.open(ResViewSettingsModal, new ModalOptions('lg'));
        return modalRef.result;
    }


    private onResourceUpdated(resource: ARTResource) {
        if (this.resource.equals(resource)) {
            this.buildLexicographerView();
        }
    }

}