import { Component, ElementRef, ViewChild } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from "../../../../models/ARTResources";
import { ConceptTreePreference } from "../../../../models/Properties";
import { SkosServices } from "../../../../services/skosServices";
import { UIUtils } from "../../../../utils/UIUtils";
import { VBContext } from "../../../../utils/VBContext";

export class AddToSchemeModalData extends BSModalContext {
    constructor(
        public title: string = 'Modal Title',
        public concept: ARTURIResource, //if provided, add only this concept and its descendants to the scheme, otherwise add all the concepts
        public scheme: ARTURIResource
    ) {
        super();
    }
}

@Component({
    selector: "add-to-scheme-modal",
    templateUrl: "./addToSchemeModal.html",
})
export class AddToSchemeModal implements ModalComponent<AddToSchemeModalData> {
    context: AddToSchemeModalData;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private setTopConcept: boolean = true;

    private schemeList: { scheme: ARTURIResource, checked: boolean }[] =[];
    private collapsed: boolean = true;

    constructor(public dialog: DialogRef<AddToSchemeModalData>, private skosService: SkosServices) {
        this.context = dialog.context;
    }

    ngOnInit() {
        this.skosService.getSchemesOfConcept(this.context.concept).subscribe(
            schemes => {
                schemes.forEach(s => {
                    this.schemeList.push({ scheme: s, checked: true });
                });
            }
        );
    }

    private isOkEnabled() {
        if (this.schemeList.length > 0) {
            for (let i = 0; i < this.schemeList.length; i++) {
                if (this.schemeList[i].checked) {
                    return true;
                }
            }
            return false; //no scheme checked found
        }
        return true;
    }

    ok(event: Event) {
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
        })

        UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
        this.skosService.addMultipleConceptsToScheme(this.context.scheme, this.context.concept, null, broaderProps, narrowerProps,
            includeSubProps, filterSchemes, this.setTopConcept).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                event.stopPropagation();
                event.preventDefault();
                this.dialog.close();
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }

}