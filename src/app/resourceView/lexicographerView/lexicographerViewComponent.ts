import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Form, LexicographerView, Sense } from "src/app/models/LexicographerView";
import { OntoLex } from "src/app/models/Vocabulary";
import { LexicographerViewServices } from "src/app/services/lexicographerViewServices";
import { OntoLexLemonServices } from "src/app/services/ontoLexLemonServices";
import { ResourcesServices } from "src/app/services/resourcesServices";
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
    styleUrls: ["./lexicographerViewComponent.css"],
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

    private lemmaStyle = "font-family: serif; font-style: italic; font-weight: bold; font-size: 2rem;"
    private formStyle = "font-family: serif; font-style: italic;";

    lemma: Form[]; //in case of validation the staging-add is at pos.0, staging-remove at 1 (TODO verify and force it when it will be supported)
    otherForms: Form[];
    senses: Sense[];

    pendingOtherForm: ARTLiteral; //written rep of an other form that is going to be added

    constructor(private lexicographerViewService: LexicographerViewServices, private ontolexService: OntoLexLemonServices, private resourceService: ResourcesServices,
        private modalService: NgbModal) {}

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
                this.lemma = lv.lemma;
                this.otherForms = lv.otherForms;
                this.sortForms(this.otherForms);
                this.senses = lv.senses;
                this.sortSenses(this.senses);
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            }
        );
    }

    private sortForms(forms: Form[]) {
        forms.sort((f1, f2) => {
            return f1.writtenRep[0].getShow().localeCompare(f2.writtenRep[0].getShow())
        })
    }
    private sortSenses(senses: Sense[]) {
        senses.sort((s1, s2) => {
            return s1.reference[0].getShow().localeCompare(s2.reference[0].getShow())
        })
    }

    onLemmaEdited(oldWrittenRep: ARTLiteral, newValue: string) {
        let newWrittenRep = new ARTLiteral(newValue, null, oldWrittenRep.getLang());
        this.ontolexService.setCanonicalForm(this.resource, newWrittenRep).subscribe(
            () => {
                this.buildLexicographerView();
            }
        )
    }

    onOtherFormEdited(form: Form, oldWrittenRep: ARTLiteral, newValue: string) {
        let newWrittenRep: ARTLiteral = new ARTLiteral(newValue, null, oldWrittenRep.getLang());
        this.resourceService.updateTriple(form.id, OntoLex.writtenRep, oldWrittenRep, newWrittenRep).subscribe(
            () => {
                this.buildLexicographerView();
            }
        )
    }
    
    addOtherForm() {
        this.pendingOtherForm = new ARTLiteral("", null, this.lemma[0].writtenRep[0].getLang());
    }
    deleteOtherForm(form: Form) {
        this.ontolexService.removeForm(this.resource, OntoLex.otherForm, form.id).subscribe(
            () => {
                this.buildLexicographerView();
            }
        )
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
    onPendingOtherFormCanceled() {
        this.pendingOtherForm = null;
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