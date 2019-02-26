import { Component, Input, ViewChild } from "@angular/core";
import { GraphMode } from "../../../graph/abstractGraph";
import { GraphModalServices } from "../../../graph/modal/graphModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { SearchSettings } from "../../../models/Properties";
import { OWL, RDF } from "../../../models/Vocabulary";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { SearchServices } from "../../../services/searchServices";
import { ResourceUtils, SortAttribute } from "../../../utils/ResourceUtils";
import { RoleActionResolver } from "../../../utils/RoleActionResolver";
import { UIUtils } from "../../../utils/UIUtils";
import { VBActionFunctionCtx } from "../../../utils/VBActions";
import { VBEventHandler } from "../../../utils/VBEventHandler";
import { VBProperties } from "../../../utils/VBProperties";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { AbstractTreePanel } from "../../abstractTreePanel";
import { PropertyTreeComponent } from "../propertyTree/propertyTreeComponent";

@Component({
    selector: "property-tree-panel",
    templateUrl: "./propertyTreePanelComponent.html",
    host: { class: "vbox" }
})
export class PropertyTreePanelComponent extends AbstractTreePanel {
    @Input() resource: ARTURIResource;//provide to show just the properties with domain the type of the resource
    @Input() type: RDFResourceRolesEnum; //tells the type of the property to show in the tree
    @Input('roots') rootProperties: ARTURIResource[]; //in case the roots are provided to the component instead of being retrieved from server

    @ViewChild(PropertyTreeComponent) viewChildTree: PropertyTreeComponent;

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.property;
    rendering: boolean = false; //override the value in AbstractPanel

    graphMode: GraphMode = GraphMode.modelOriented;

    constructor(private propService: PropertyServices, private searchService: SearchServices, private creationModals: CreationModalServices,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, graphModals: GraphModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties, actionResolver: RoleActionResolver) {
        super(cfService, resourceService, basicModals, graphModals, eventHandler, vbProp, actionResolver);
    }


    getActionContext(role?: RDFResourceRolesEnum): VBActionFunctionCtx {
        let metaClass: ARTURIResource = role ? this.convertRoleToClass(role) : this.convertRoleToClass(this.selectedNode.getRole());
        let actionCtx: VBActionFunctionCtx = { metaClass: metaClass, loadingDivRef: this.viewChildTree.blockDivElement }
        return actionCtx;
    }

    // createRoot(role: RDFResourceRolesEnum) {
    //     let propertyType: ARTURIResource = this.convertRoleToClass(role);
    //     this.creationModals.newResourceCf("Create a new " + propertyType.getShow(), propertyType, false).then(
    //         (data: any) => {
    //             this.propService.createProperty(data.cls, data.uriResource, null, data.cfValue).subscribe();
    //         },
    //         () => {}
    //     );
    // }

    // createChild() {
    //     let parentRole: RDFResourceRolesEnum = this.selectedNode.getRole();
    //     let propertyType: ARTURIResource = this.convertRoleToClass(parentRole);
    //     this.creationModals.newResourceCf("Create subProperty of " + this.selectedNode.getShow(), propertyType, false).then(
    //         (data: any) => {
    //             this.propService.createProperty(data.cls, data.uriResource, this.selectedNode, data.cfValue).subscribe();
    //         },
    //         () => {}
    //     );
    // }

    // delete() {
    //     if (this.selectedNode.getAdditionalProperty(ResAttribute.MORE)) {
    //         this.basicModals.alert("Operation denied", "Cannot delete " + this.selectedNode.getURI() + 
    //             " since it has subProperty(ies). Please delete the subProperty(ies) and retry", "warning");
    //         return;
    //     }
    //     this.propService.deleteProperty(this.selectedNode).subscribe(
    //         stResp => {
    //             this.selectedNode = null;
    //         }
    //     )
    // }

    refresh() {
        this.viewChildTree.init();
    }

    //search handlers

    doSearch(searchedText: string) {
        let searchSettings: SearchSettings = this.vbProp.getSearchSettings();
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
        this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.property], searchSettings.useLocalName, 
            searchSettings.useURI, searchSettings.useNotes, searchSettings.stringMatchMode, searchLangs, includeLocales).subscribe(
            searchResult => {
                UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
                if (searchResult.length == 0) {
                    this.basicModals.alert("Search", "No results found for '" + searchedText + "'", "warning");
                } else { //1 or more results
                    if (searchResult.length == 1) {
                        this.openTreeAt(searchResult[0]);
                    } else { //multiple results, ask the user which one select
                        ResourceUtils.sortResources(searchResult, this.rendering ? SortAttribute.show : SortAttribute.value);
                        this.basicModals.selectResource("Search", searchResult.length + " results found.", searchResult, this.rendering).then(
                            (selectedResource: any) => {
                                this.openTreeAt(selectedResource);
                            },
                            () => { }
                        );
                    }
                }
            }
        );
    }

    openTreeAt(resource: ARTURIResource) {
        this.viewChildTree.openTreeAt(resource);
    }

    //I don't know why, if I move this in ResourceUtils I get a strange error
    private convertRoleToClass(role: RDFResourceRolesEnum): ARTURIResource {
        let roleClass: ARTURIResource;
        if (role == RDFResourceRolesEnum.property) {
            roleClass = RDF.property;
        } else if (role == RDFResourceRolesEnum.datatypeProperty) {
            roleClass = OWL.datatypeProperty;
        } else if (role == RDFResourceRolesEnum.objectProperty) {
            roleClass = OWL.objectProperty;
        } else if (role == RDFResourceRolesEnum.annotationProperty) {
            roleClass = OWL.annotationProperty;
        } else if (role == RDFResourceRolesEnum.ontologyProperty) {
            roleClass = OWL.ontologyProperty;
        }
        return roleClass;
    }

}