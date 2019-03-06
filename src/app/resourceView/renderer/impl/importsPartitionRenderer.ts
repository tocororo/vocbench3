import { Component } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { ImportFromDatasetCatalogModalReturnData } from "../../../config/dataManagement/metadata/namespacesAndImports/importFromDatasetCatalogModal";
import { ARTNode, ARTURIResource } from "../../../models/ARTResources";
import { ImportType } from "../../../models/Metadata";
import { ResViewPartition } from "../../../models/ResourceView";
import { CustomFormsServices } from "../../../services/customFormsServices";
import { MetadataServices } from "../../../services/metadataServices";
import { PropertyServices } from "../../../services/propertyServices";
import { ResourcesServices } from "../../../services/resourcesServices";
import { BasicModalServices } from "../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../widget/modal/creationModal/creationModalServices";
import { SharedModalServices } from "../../../widget/modal/sharedModal/sharedModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "imports-renderer",
    templateUrl: "./importsPartitionRenderer.html",
})
export class ImportsPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.imports;
    addBtnImgTitle = "Add import";
    addBtnImgSrc = require("../../../../assets/images/icons/actions/ontologyProperty_create.png");

    constructor(propService: PropertyServices, resourcesService: ResourcesServices, cfService: CustomFormsServices,
        basicModals: BasicModalServices, browsingModals: BrowsingModalServices, creationModal: CreationModalServices, 
        resViewModals: ResViewModalServices, private metadataService: MetadataServices, private sharedModals: SharedModalServices) {
        super(propService, resourcesService, cfService, basicModals, browsingModals, creationModal, resViewModals);
    }

    ngOnInit() {
        super.ngOnInit();
    }

    /**
     * Needed to be implemented since this Component extends PartitionRenderSingleRoot, but not used.
     * Use importFrom...() methods instead
     */
    add() { }

    /**
     * The following importFrom...() methods are mostly copied from namespacesAndImportsComponent
     */

    /**
     * Opens a modal to import an ontology from web,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    private importFromWeb() {
        this.sharedModals.importOntology("Import from web", ImportType.fromWeb).then(
            (data: any) => {
                this.metadataService.addFromWeb(data.baseURI, data.transitiveImportAllowance, data.altURL, data.rdfFormat).subscribe(
                    stResp => {
                        this.update.emit();
                    }
                )
            },
            () => { }
        );
    }

    /**
     * Opens a modal to import an ontology from web and copies it to a mirror file,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    private importFromWebToMirror() {
        this.sharedModals.importOntology("Import from web to mirror", ImportType.fromWebToMirror).then(
            (data: any) => {
                this.metadataService.addFromWebToMirror(data.baseURI, data.mirrorFile, data.transitiveImportAllowance, data.altURL, data.rdfFormat).subscribe(
                    stResp => {
                        this.update.emit();
                    }
                )
            },
            () => { }
        );
    }

    /**
     * Opens a modal to import an ontology from a local file and copies it to a mirror file,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    private importFromLocalFile() {
        this.sharedModals.importOntology("Import from local file", ImportType.fromLocalFile).then(
            (data: any) => {
                this.metadataService.addFromLocalFile(data.baseURI, data.localFile, data.mirrorFile, data.transitiveImportAllowance).subscribe(
                    stResp => {
                        this.update.emit();
                    }
                )
            },
            () => { }
        );
    }

    /**
     * Opens a modal to import an ontology from a mirror file,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    private importFromOntologyMirror() {
        this.sharedModals.importOntology("Import from ontology mirror", ImportType.fromOntologyMirror).then(
            (data: any) => {
                this.metadataService.addFromMirror(data.mirror.baseURI, data.mirror.file, data.transitiveImportAllowance).subscribe(
                    stResp => {
                        this.update.emit();
                    }
                )
            },
            () => { }
        );
    }

    /**
     * Opens a modal to import an ontology from the dataset catalog. This uses the addFromWeb import.
     * Once done refreshes the imports list and the namespace prefix mapping
     */
    private importFromDatasetCatalog() {
        this.sharedModals.importFromDatasetCatalog("Import from Dataset Catalog").then(
            (data: ImportFromDatasetCatalogModalReturnData) => {
                this.metadataService.addFromWeb(data.ontologyIRI, data.transitiveImportAllowance, data.dataDump, data.rdfFormat).subscribe(
                    stResp => {
                        this.update.emit();
                    }
                );
            },
            () => {}
        );
    }

    checkTypeCompliantForManualAdd(predicate: ARTURIResource, value: ARTNode): Observable<boolean> {
        return Observable.of(value instanceof ARTURIResource);
    }

    removePredicateObject(predicate: ARTURIResource, object: ARTNode) {
        this.getRemoveFunction(predicate, object).subscribe(
            stResp => {
                this.update.emit();
            }
        );
    }

    getRemoveFunctionImpl(predicate: ARTURIResource, object: ARTNode): Observable<any> {
        return this.metadataService.removeImport(object.getNominalValue())
    }

}