import { Component, ViewChild } from "@angular/core";
import { GraphModalServices } from "../../../../graph/modal/graphModalServices";
import { ARTURIResource, RDFResourceRolesEnum } from "../../../../models/ARTResources";
import { SearchSettings } from "../../../../models/Properties";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { SearchServices } from "../../../../services/searchServices";
import { ResourceUtils, SortAttribute } from "../../../../utils/ResourceUtils";
import { RoleActionResolver } from "../../../../utils/RoleActionResolver";
import { UIUtils } from "../../../../utils/UIUtils";
import { VBActionFunctionCtx } from "../../../../utils/VBActions";
import { VBContext } from "../../../../utils/VBContext";
import { VBEventHandler } from "../../../../utils/VBEventHandler";
import { VBProperties } from "../../../../utils/VBProperties";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { AbstractTreePanel } from "../../../abstractTreePanel";
import { MultiSubjectEnrichmentHelper } from "../../../multiSubjectEnrichmentHelper";
import { CollectionTreeComponent } from "../collectionTree/collectionTreeComponent";

@Component({
    selector: "collection-tree-panel",
    templateUrl: "./collectionTreePanelComponent.html",
    host: { class: "vbox" }
})
export class CollectionTreePanelComponent extends AbstractTreePanel {
    @ViewChild(CollectionTreeComponent) viewChildTree: CollectionTreeComponent

    panelRole: RDFResourceRolesEnum = RDFResourceRolesEnum.skosCollection;

    constructor(private searchService: SearchServices,
        cfService: CustomFormsServices, resourceService: ResourcesServices, basicModals: BasicModalServices, graphModals: GraphModalServices,
        eventHandler: VBEventHandler, vbProp: VBProperties, actionResolver: RoleActionResolver, multiEnrichment: MultiSubjectEnrichmentHelper) {
        super(cfService, resourceService, basicModals, graphModals, eventHandler, vbProp, actionResolver, multiEnrichment);
    }

    //top bar commands handlers

    getActionContext(role?: RDFResourceRolesEnum): VBActionFunctionCtx {
        let metaClass: ARTURIResource = role ? ResourceUtils.convertRoleToClass(role) : ResourceUtils.convertRoleToClass(this.selectedNode.getRole())
        let actionCtx: VBActionFunctionCtx = { metaClass: metaClass, loadingDivRef: this.viewChildTree.blockDivElement }
        return actionCtx;
    }


    // createRoot(role: RDFResourceRolesEnum) {
    //     let collectionType: ARTURIResource;
    //     if (role == RDFResourceRolesEnum.skosCollection) {
    //         collectionType = SKOS.collection;
    //     } else if (role == RDFResourceRolesEnum.skosOrderedCollection) {
    //         collectionType = SKOS.orderedCollection;
    //     }
    //     this.createCollection(collectionType);
    // }

    // createChild(role: RDFResourceRolesEnum) {
    //     let collectionType: ARTURIResource;
    //     if (role == RDFResourceRolesEnum.skosCollection) {
    //         collectionType = SKOS.collection;
    //     } else if (role == RDFResourceRolesEnum.skosOrderedCollection) {
    //         collectionType = SKOS.orderedCollection;
    //     }
    //     this.createNestedCollection(collectionType);
    // }

    // private createCollection(collectionType: ARTURIResource) {
    //     this.creationModals.newResourceWithLiteralCf("Create new " + collectionType.getShow(), collectionType, true).then(
    //         (data: NewResourceWithLiteralCfModalReturnData) => {
    //             UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
    //             this.skosService.createCollection(collectionType, data.literal, data.uriResource, null, data.cls, data.cfValue).subscribe(
    //                 stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
    //                 (err: Error) => {
    //                     if (err.name.endsWith('PrefAltLabelClashException')) {
    //                         this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
    //                             confirm => {
    //                                 this.skosService.createCollection(collectionType, data.literal, data.uriResource, null, data.cls, data.cfValue, false).subscribe(
    //                                     stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
    //                                 );
    //                             },
    //                             () => {}
    //                         );
    //                     }
    //                 }
    //             );
    //         },
    //         () => { }
    //     );
    // }

    // private createNestedCollection(collectionType: ARTURIResource) {
    //      this.creationModals.newResourceWithLiteralCf("Create a nested" + collectionType.getShow(), collectionType, true).then(
    //         (data: NewResourceWithLiteralCfModalReturnData) => {
    //             UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
    //                 this.skosService.createCollection(collectionType, data.literal, data.uriResource, this.selectedNode, data.cls, data.cfValue).subscribe(
    //                     stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
    //                     (err: Error) => {
    //                         if (err.name.endsWith('PrefAltLabelClashException')) {
    //                             this.basicModals.confirm("Warning", err.message + " Do you want to force the creation?", "warning").then(
    //                                 confirm => {
    //                                     this.skosService.createCollection(collectionType, data.literal, data.uriResource, this.selectedNode, data.cls, data.cfValue, false).subscribe(
    //                                         stResp => UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement),
    //                                     );
    //                                 },
    //                                 () => {}
    //                             );
    //                         }
    //                     }
    //                 );
    //         },
    //         () => { }
    //     );
    // }

    // delete() {
    //     UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
    //     if (this.selectedNode.getRole() == RDFResourceRolesEnum.skosCollection) {
    //         this.skosService.deleteCollection(this.selectedNode).subscribe(
    //             stResp => {
    //                 this.selectedNode = null;
    //                 UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
    //             }
    //         );
    //     } else { //skosOrderedCollection
    //         this.skosService.deleteOrderedCollection(this.selectedNode).subscribe(
    //             stResp => {
    //                 this.selectedNode = null;
    //                 UIUtils.stopLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
    //             }
    //         );
    //     }
    // }

    refresh() {
        this.viewChildTree.init();
    }

    //search handlers

    doSearch(searchedText: string) {
        let searchSettings: SearchSettings = VBContext.getWorkingProjectCtx().getProjectPreferences().searchSettings;
        let searchLangs: string[];
        let includeLocales: boolean;
        if (searchSettings.restrictLang) {
            searchLangs = searchSettings.languages;
            includeLocales = searchSettings.includeLocales;
        }
        UIUtils.startLoadingDiv(this.viewChildTree.blockDivElement.nativeElement);
        this.searchService.searchResource(searchedText, [RDFResourceRolesEnum.skosCollection], searchSettings.useLocalName, 
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
                                this.openTreeAt(selectedResource); //then open the tree on the searched resource
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

}