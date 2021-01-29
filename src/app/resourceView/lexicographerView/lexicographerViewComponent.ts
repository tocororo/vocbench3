import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Form, LexicographerView, Sense } from "src/app/models/LexicographerView";
import { OntoLex, SKOS } from "src/app/models/Vocabulary";
import { LexicographerViewServices } from "src/app/services/lexicographerViewServices";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
import { BrowsingModalServices } from "src/app/widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "src/app/widget/modal/creationModal/creationModalServices";
import { NewOntoLexicalizationCfModalReturnData } from "src/app/widget/modal/creationModal/newResourceModal/ontolex/newOntoLexicalizationCfModal";
import { ModalOptions } from "src/app/widget/modal/Modals";
import { ARTLiteral, ARTResource, ARTURIResource } from "../../models/ARTResources";
import { ResourceViewCtx } from "../../models/ResourceView";
import { HttpServiceContext } from "../../utils/HttpManager";
import { UIUtils } from "../../utils/UIUtils";
import { ProjectContext } from "../../utils/VBContext";
import { ResViewSettingsModal } from "../resViewSettingsModal";

@Component({
    selector: "lexicographer-view",
    templateUrl: "./lexicographerViewComponent.html",
    host: { class: "vbox" }
})
export class LexicographerViewComponent {
    @Input() resource: ARTURIResource;
    @Input() readonly: boolean = false;
    @Input() context: ResourceViewCtx;
    @Input() projectCtx: ProjectContext;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    @ViewChild('blockDiv', { static: true }) blockDivElement: ElementRef;
    private viewInitialized: boolean = false; //in order to wait blockDiv to be ready

    private formStyle = "font-family: serif; font-style: italic;";

    lemma: Form[]; //in case of validation the staging-add is at pos.0, staging-remove at 1 (TODO verify and force it when it will be supported)
    otherForms: Form[];
    senses: Sense[];

    pendingOtherForm: boolean;

    constructor(private lexicographerViewService: LexicographerViewServices, private ontolexService: OntoLexLemonServices, 
        private creationModals: CreationModalServices, private modalService: NgbModal) {}

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
    }

    ngAfterViewInit() {
        this.viewInitialized = true;
        this.buildLexicographerView();
    }

    buildLexicographerView() {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.lexicographerViewService.getLexicalEntryView(this.resource).subscribe(
            resp => {
                let lv = LexicographerView.parse(resp);
                console.log("lv", lv);
                this.lemma = lv.lemma;
                this.sortForms(this.lemma);
                this.otherForms = lv.otherForms;
                this.sortForms(this.otherForms);
                this.senses = lv.senses;
                this.sortSenses(this.senses);
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);

                if (lv.isInStaging()) {
                    this.readonly = true;
                }
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
                return s1.id.getURI().localeCompare(s2.id.getURI());
            }
        });
    }

    //=== Other forms ===

    addOtherForm() {
        this.pendingOtherForm = true;
    }
    onPendingOtherFormCanceled() {
        this.pendingOtherForm = false;
    }

    onPendingOtherFormConfirmed(value: string) {
        let writtenRep: ARTLiteral = new ARTLiteral(value, null, this.lemma[0].writtenRep[0].getLang());
        this.ontolexService.addOtherForm(this.resource, writtenRep).subscribe(
            () => {
                this.pendingOtherForm = null;
                this.buildLexicographerView();
            }
        )
    }
    
    //=== Senses ===

    addSense() {
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


}