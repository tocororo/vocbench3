import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ARTURIResource } from "../../../models/ARTResources";
import { ConceptTreePreference } from "../../../models/Properties";
import { SkosServices } from "../../../services/skosServices";
import { UIUtils } from "../../../utils/UIUtils";
import { VBContext } from "../../../utils/VBContext";

@Component({
    selector: "add-to-scheme-modal",
    templateUrl: "./addToSchemeModal.html",
})
export class AddToSchemeModal {
    @Input() concept: ARTURIResource; //if provided, add only this concept and its descendants to the scheme, otherwise add all the concepts
    @Input() scheme: ARTURIResource;

    @ViewChild('blockingDiv', { static: true }) public blockingDivElement: ElementRef;

    setTopConcept: boolean = true;

    schemeList: { scheme: ARTURIResource, checked: boolean }[] =[];
    collapsed: boolean = false;

    translationParam: { concept: string, scheme: string };

    constructor(public activeModal: NgbActiveModal, private skosService: SkosServices) {}

    ngOnInit() {
        this.skosService.getSchemesOfConcept(this.concept).subscribe(
            schemes => {
                schemes.forEach(s => {
                    if (!s.equals(this.scheme)) { 
                        //exclude target scheme from filter (it doesn't have sense to allow adding to the target scheme concepts that already belong to it)
                        this.schemeList.push({ scheme: s, checked: false });
                    }
                });
            }
        );
        this.translationParam = {
            concept: this.concept != null ? this.concept.getShow() : null,
            scheme: this.scheme != null ? this.scheme.getShow() : null,
        };
    }

    ok() {
        let prefs: ConceptTreePreference = VBContext.getWorkingProjectCtx().getProjectPreferences().conceptTreePreferences;
        let broaderProps: ARTURIResource[] = [];
        prefs.broaderProps.forEach((prop: string) => broaderProps.push(new ARTURIResource(prop)));
        let narrowerProps: ARTURIResource[] = [];
        prefs.narrowerProps.forEach((prop: string) => narrowerProps.push(new ARTURIResource(prop)));
        let includeSubProps: boolean = prefs.includeSubProps;

        let filterSchemes: ARTURIResource[] = [];
        this.schemeList.forEach(s => {
            if (s.checked) {
                filterSchemes.push(s.scheme);
            }
        });

        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.skosService.addMultipleConceptsToScheme(this.scheme, this.concept, null, broaderProps, narrowerProps,
            includeSubProps, filterSchemes, this.setTopConcept).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                this.activeModal.close();
            }
        );
    }

    cancel() {
        this.activeModal.dismiss();
    }

}