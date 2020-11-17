import { Component, EventEmitter, Input, Output, SimpleChanges } from "@angular/core";
import { ARTURIResource } from "../../../../../models/ARTResources";
import { SkosServices } from "../../../../../services/skosServices";
import { ResourceUtils } from "../../../../../utils/ResourceUtils";
import { VBContext } from "../../../../../utils/VBContext";
import { BrowsingModalServices } from "../../../../../widget/modal/browsingModal/browsingModalServices";

@Component({
    selector: "scheme-selection",
    templateUrl: "./schemeSelectionComponent.html",
})
export class SchemeSelectionComponent {
    @Input() concept: ARTURIResource; //useful to limit the schemeList to the only schemes of a concept
    @Input() schemes: ARTURIResource[]; //to force the initialization of schemes
    @Output() update = new EventEmitter<ARTURIResource[]>();

    addBtnImgSrc = "./assets/images/icons/actions/conceptScheme_create.png";

    collapsed: boolean = false;

    private schemeList: ARTURIResource[] = [];
    private selectedScheme: ARTURIResource;

    constructor(private skosService: SkosServices, private browsingModals: BrowsingModalServices) {}

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
                        this.schemes = VBContext.getWorkingProjectCtx().getProjectPreferences().activeSchemes;
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
            this.skosService.getSchemesOfConcept(this.concept).subscribe(
                schemes => {
                    this.schemeList = schemes;
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
            },
            () => {}
        );
    }

    private removeScheme(scheme: ARTURIResource) {
        this.schemeList.splice(this.schemeList.indexOf(scheme), 1);
        this.selectedScheme = null;
        this.update.emit(this.schemeList);
    }

}