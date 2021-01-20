import { Component, ElementRef, EventEmitter, Input, Output, SimpleChanges, ViewChild } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Form, LexicographerView, Sense } from "src/app/models/LexicographerView";
import { LexicographerViewServices } from "src/app/services/lexicographerViewServices";
import { ModalOptions } from "src/app/widget/modal/Modals";
import { ARTResource } from "../../models/ARTResources";
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
    @Input() resource: ARTResource;
    @Input() readonly: boolean = false;
    @Input() context: ResourceViewCtx;
    @Input() projectCtx: ProjectContext;
    @Output() dblclickObj: EventEmitter<ARTResource> = new EventEmitter<ARTResource>();
    @Output() update: EventEmitter<ARTResource> = new EventEmitter<ARTResource>(); //(useful to notify resourceViewTabbed that resource is updated)

    @ViewChild('blockDiv', { static: true }) blockDivElement: ElementRef;
    private viewInitialized: boolean = false; //in order to wait blockDiv to be ready

    lemma: Form[]; //in case of validation the staging-add is at pos.0, staging-remove at 1 (TODO verify and force it when it will be supported)
    otherForms: Form[];
    senses: Sense[];

    constructor(private lexicographerViewService: LexicographerViewServices, private modalService: NgbModal) {}

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
                this.buildLexicographerView(this.resource);//refresh resource view when Input resource changes
            }
        }
    }

    ngOnInit() {
        this.readonly = this.readonly || HttpServiceContext.getContextVersion() != null; //if it is working on an old dump version, disable the updates
    }

    ngAfterViewInit() {
        this.viewInitialized = true;
        this.buildLexicographerView(this.resource);
    }

    buildLexicographerView(res: ARTResource) {
        UIUtils.startLoadingDiv(this.blockDivElement.nativeElement);
        this.lexicographerViewService.getLexicalEntryView(res).subscribe(
            resp => {
                let lv = LexicographerView.parse(resp);
                console.log(lv);
                this.lemma = lv.lemma;
                this.otherForms = lv.otherForms;
                this.senses = lv.senses;
                UIUtils.stopLoadingDiv(this.blockDivElement.nativeElement);
            }
        );
    }

    /**
     * Opens a modal that allows to edit the resource view settings
     */
    openSettings() {
        const modalRef: NgbModalRef = this.modalService.open(ResViewSettingsModal, new ModalOptions('lg'));
        return modalRef.result;
    }


}