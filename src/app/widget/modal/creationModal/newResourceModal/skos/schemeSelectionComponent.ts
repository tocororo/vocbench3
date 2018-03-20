import { Component, Input, Output, EventEmitter, SimpleChanges } from "@angular/core";
import { SkosServices } from "../../../../../services/skosServices";
import { BrowsingModalServices } from "../../../../../widget/modal/browsingModal/browsingModalServices";
import { VBProperties } from "../../../../../utils/VBProperties";
import { ARTURIResource, ResourceUtils, ResAttribute } from "../../../../../models/ARTResources";

@Component({
    selector: "scheme-selection",
    templateUrl: "./schemeSelectionComponent.html",
})
export class SchemeSelectionComponent {
    @Input() concept: ARTURIResource; //useful to limit the schemeList to the only schemes of a concept
    @Input() schemes: ARTURIResource[]; //to force the initialization of schemes
    @Output() update = new EventEmitter<ARTURIResource[]>();

    private addBtnImgSrc = require("../../../../../../assets/images/icons/actions/conceptScheme_create.png");

    private collapsed: boolean = false;

    private schemeList: ARTURIResource[] = [];
    private selectedScheme: ARTURIResource;

    constructor(private skosService: SkosServices, private preferences: VBProperties, private browsingModals: BrowsingModalServices) {}

    ngOnInit() {
        // this.initSchemeList(); //init in ngOnChanges
    }

    initSchemeList() {
        this.schemeList = [];
        if (this.concept == null) {
            /**
             * Init schemeList with all the active schemes (retrieve them from the getAllSchemes result since the 
             * active_schemes preference contains just the URIs, not all the info (show, role...))
             */
            this.skosService.getAllSchemes().subscribe(
                schemes => {
                    if (this.schemes == null) {
                        this.schemes = this.preferences.getActiveSchemes();
                    }
                    for (var i = 0; i < this.schemes.length; i++) {
                        for (var j = 0; j < schemes.length; j++) {
                            if (this.schemes[i].getURI() == schemes[j].getURI()) {
                                this.schemeList.push(schemes[j]);
                                break;
                            }
                        }
                    }
                    this.update.emit(this.schemeList);
                }
            );
        } else {
            //init schemeList with the schemes of the given concept (broader of the new creating)
            this.skosService.getSchemesMatrixPerConcept(this.concept).subscribe(
                schemes => {
                    for (var i = 0; i < schemes.length; i++) {
                        if (schemes[i].getAdditionalProperty(ResAttribute.IN_SCHEME)) {
                            this.schemeList.push(schemes[i]);
                        }
                    }
                    this.update.emit(this.schemeList);
                }
            )
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['concept']) {
            this.initSchemeList();
        }
    }

    private addScheme() {
        this.browsingModals.browseSchemeList("Add skos:ConceptScheme").then(
            (scheme: any) => {
                //add the chosen scheme only if not already in list
                if (!ResourceUtils.containsNode(this.schemeList, scheme)) {
                    this.schemeList.push(scheme);
                    this.update.emit(this.schemeList);
                }
            }
        );
    }

    private removeScheme(scheme: ARTURIResource) {
        this.schemeList.splice(this.schemeList.indexOf(scheme), 1);
        this.selectedScheme = null;
        this.update.emit(this.schemeList);
    }

}