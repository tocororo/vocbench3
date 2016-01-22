import {Component, OnInit} from "angular2/core";
import {RdfResourceComponent} from "../../../widget/rdfResource/rdfResourceComponent";
import {SkosServices} from "../../../services/skosServices";
import {Deserializer} from "../../../utils/Deserializer";
import {ARTURIResource} from "../../../utils/ARTResources";
import {VocbenchCtx} from '../../../utils/VocbenchCtx';

@Component({
	selector: "concept-scheme-panel",
	templateUrl: "app/src/skos/scheme/conceptSchemePanel/conceptSchemePanelComponent.html",
	directives: [RdfResourceComponent],
    providers: [SkosServices],
})
export class ConceptSchemePanelComponent implements OnInit {
    
    public schemeList:ARTURIResource[];
    public selectedScheme:ARTURIResource;
    private focusedScheme:ARTURIResource;
    
	constructor(private skosService:SkosServices, public deserializer:Deserializer, public vbCtx:VocbenchCtx) {}
    
    ngOnInit() {
        this.skosService.getAllSchemesList()
            .subscribe(
                stResp => {
                    this.schemeList = this.deserializer.createRDFArray(stResp);
                }
            );
        this.selectedScheme = this.vbCtx.getScheme();
    }
    
    public createScheme() {
        alert("creating scheme");    
    }
    
    public deleteScheme() {
        alert("deleting scheme " + this.focusedScheme.getURI());    
    }
    
    //this is not Angular-way, is a workaround, radio button is not still fully supported, check it again in the future
    public selectScheme(selSchemeUri) {
        for (var i=0; i < this.schemeList.length; i++) {
            if (this.schemeList[i].getURI() == selSchemeUri) {
                this.selectedScheme = this.schemeList[i];
                this.vbCtx.setScheme(this.selectedScheme);
                break;
            }
        }
    }
    
    /**
     * Called when a scheme is clicked. Set the clicked scheme as focused. Useful to select a scheme to delete
     */
    public focusScheme(scheme:ARTURIResource) {
        this.focusedScheme = scheme;
    }
    
    /**
     * Check if a scheme is focused. Useful to apply style (show the scheme item as higlighted)
     */
    public isFocused(scheme:ARTURIResource) {
        if (this.focusedScheme != undefined && scheme != undefined) {
            return this.focusedScheme.getURI() == scheme.getURI();    
        } else {
            return false;
        }
        
    }
    
}