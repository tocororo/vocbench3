import {Component, Output, EventEmitter} from "angular2/core";
import {ARTURIResource} from "../../../utils/ARTResources";
import {SkosServices} from "../../../services/skosServices";
import {RdfResourceComponent} from "../../../widget/rdfResource/rdfResourceComponent";

@Component({
	selector: "scheme-list",
	templateUrl: "app/src/skos/scheme/schemeList/schemeListComponent.html",
    providers: [SkosServices],
	directives: [RdfResourceComponent],
})
export class SchemeListComponent {
    @Output() itemSelected = new EventEmitter<ARTURIResource>();
    
    private schemeList: ARTURIResource[];
    private selectedScheme: ARTURIResource;
    
    constructor(private skosService: SkosServices) {}
    
    ngOnInit() {
        this.skosService.getAllSchemesList().subscribe(
            schemeList => {
                this.schemeList = schemeList;
            },
            err => { }
        );
    }
    
    private selectScheme(scheme: ARTURIResource) {
        if (this.selectedScheme == undefined) {
            this.selectedScheme = scheme;
            this.selectedScheme.setAdditionalProperty("selected", true);    
        } else if (this.selectedScheme.getURI() != scheme.getURI()) {
            this.selectedScheme.deleteAdditionalProperty("selected");
            this.selectedScheme = scheme;
            this.selectedScheme.setAdditionalProperty("selected", true);
        }
        this.selectedScheme = scheme;
        this.itemSelected.emit(scheme);
    }
    
}