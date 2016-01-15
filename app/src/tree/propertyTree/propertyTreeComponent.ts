import {Component, OnInit} from "angular2/core";
import {ARTURIResource} from "../../utils/ARTResources";
import {Deserializer} from "../../utils/Deserializer";
import {PropertyServices} from "../../services/propertyServices";
import {PropertyTreeNodeComponent} from "./propertyTreeNodeComponent";

@Component({
	selector: "property-tree",
	templateUrl: "app/src/tree/propertyTree/propertyTreeComponent.html",
    providers: [PropertyServices, Deserializer],
    directives: [PropertyTreeNodeComponent],
})
export class PropertyTreeComponent implements OnInit {
    
    public propertyTree: ARTURIResource[] = [];
	
	constructor(private propertyService:PropertyServices) {}
    
    ngOnInit() {
        this.propertyService.getPropertiesTree()
            .subscribe(
                stResp => {
                    var propertiesXml = stResp.querySelectorAll("data > Property");
                    for (var i=0; i<propertiesXml.length; i++) {
                        var p = this.parseProperty(propertiesXml[i]);
                        this.propertyTree.push(p);
                    }
                }
            );
    }
    
    private parseProperty(propXml): ARTURIResource {
        var deleteForbidden = propXml.getAttribute("deleteForbidden");
        var show = propXml.getAttribute("name");
        var role = propXml.getAttribute("type").substring(4);
        var uri = propXml.getAttribute("uri");
        var p = new ARTURIResource(uri, show, role);
        //recursively parse children
        var subProperties: ARTURIResource[] = [];
        var subPropsXml = propXml.querySelectorAll(":scope > SubProperties > Property");
        for (var i=0; i<subPropsXml.length; i++) {
            var subP = this.parseProperty(subPropsXml[i]);
            subProperties.push(subP);
        }
        p.setAdditionalProperty("children", subProperties);
        return p;
    }
    
}