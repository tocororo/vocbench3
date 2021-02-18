import { Component } from "@angular/core";
import { Observable, of } from "rxjs";
import { ImportFromDatasetCatalogModalReturnData } from "../../../../metadata/namespacesAndImports/importFromDatasetCatalogModal";
import { ARTNode, ARTURIResource } from "../../../../models/ARTResources";
import { ImportType } from "../../../../models/Metadata";
import { ResViewPartition } from "../../../../models/ResourceView";
import { CustomFormsServices } from "../../../../services/customFormsServices";
import { MetadataServices } from "../../../../services/metadataServices";
import { PropertyServices } from "../../../../services/propertyServices";
import { ResourcesServices } from "../../../../services/resourcesServices";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../../../../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../../../../widget/modal/creationModal/creationModalServices";
import { SharedModalServices } from "../../../../widget/modal/sharedModal/sharedModalServices";
import { ResViewModalServices } from "../../resViewModals/resViewModalServices";
import { PartitionRenderSingleRoot } from "../partitionRendererSingleRoot";

@Component({
    selector: "imports-renderer",
    templateUrl: "./importsPartitionRenderer.html",
})
export class ImportsPartitionRenderer extends PartitionRenderSingleRoot {

    partition = ResViewPartition.imports;
    addBtnImgSrc = "./assets/images/icons/actions/ontologyProperty_create.png";

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
    importFromWeb() {
        this.sharedModals.importOntology({key:"METADATA.NAMESPACES_AND_IMPORTS.ACTIONS.IMPORT_FROM_WEB"}, ImportType.fromWeb).then(
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
    importFromWebToMirror() {
        this.sharedModals.importOntology({key:"METADATA.NAMESPACES_AND_IMPORTS.ACTIONS.IMPORT_FROM_WEB_TO_MIRROR"}, ImportType.fromWebToMirror).then(
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
    importFromLocalFile() {
        this.sharedModals.importOntology({key:"METADATA.NAMESPACES_AND_IMPORTS.ACTIONS.IMPORT_FROM_LOCAL_FILE"}, ImportType.fromLocalFile).then(
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
    importFromOntologyMirror() {
        this.sharedModals.importOntology({key:"METADATA.NAMESPACES_AND_IMPORTS.ACTIONS.IMPORT_FROM_ONTOLOGY_MIRROR"}, ImportType.fromOntologyMirror).then(
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
    importFromDatasetCatalog() {
        this.sharedModals.importFromDatasetCatalog({key:"METADATA.NAMESPACES_AND_IMPORTS.ACTIONS.IMPORT_FROM_DATASET_CATALOG"}).then(
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
        return of(value instanceof ARTURIResource);
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