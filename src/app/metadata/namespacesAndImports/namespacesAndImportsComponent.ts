import { Component, ViewChild } from "@angular/core";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalOptions, ModalType } from 'src/app/widget/modal/Modals';
import { ARTURIResource } from "../../models/ARTResources";
import { ImportType, OntologyImport, PrefixMapping } from "../../models/Metadata";
import { ResourceViewEditorComponent } from "../../resourceView/resourceViewEditor/resourceViewEditorComponent";
import { MetadataServices } from "../../services/metadataServices";
import { RefactorServices } from "../../services/refactorServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { ResourceUtils } from "../../utils/ResourceUtils";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../widget/modal/sharedModal/sharedModalServices";
import { ImportFromDatasetCatalogModalReturnData } from "./importFromDatasetCatalogModal";
import { ImportFromLocalFileData, ImportFromMirrorData, ImportFromWebData, ImportFromWebToMirrorData } from "./importOntologyModal";
import { OntologyMirrorModal } from "./ontologyMirrorModal";

@Component({
    selector: "namespaces-imports-component",
    templateUrl: "./namespacesAndImportsComponent.html",
    host: { class: "pageComponent" },
})
export class NamespacesAndImportsComponent {

    @ViewChild(ResourceViewEditorComponent) viewChildResView: ResourceViewEditorComponent;

    // baseURI namespace section
    private pristineBaseURI: string;
    private pristineNamespace: string;
    baseURI: string;
    namespace: string;
    bind: boolean = true; //keep bound the baseURI and the namespace
    nsBaseURISubmitted: boolean = false; //tells if changes on namespace or baseURI have been submitted

    // namespace prefix section
    nsPrefMappingList: PrefixMapping[];
    selectedMapping: any; //the currently selected mapping {namespace: string, prefix: string}

    // Imports params section
    importTree: OntologyImport[];

    //Ontology res view
    baseUriRes: ARTURIResource;

    constructor(private metadataService: MetadataServices, private refactorService: RefactorServices,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modalService: NgbModal) { }

    ngOnInit() {
        this.refreshBaseURI();
        this.refreshDefaultNamespace();
        this.refreshImports();
        this.refreshNSPrefixMappings();
    }

    //inits or refreshes baseURI
    private refreshBaseURI() {
        this.metadataService.getBaseURI().subscribe(
            baseURI => {
                this.pristineBaseURI = baseURI;
                this.baseURI = baseURI;
                this.baseUriRes = new ARTURIResource(this.baseURI);
            }
        );
    }

    //inits or refreshes default namespace
    private refreshDefaultNamespace() {
        this.metadataService.getDefaultNamespace().subscribe(
            ns => {
                this.pristineNamespace = ns;
                this.namespace = ns;
            }
        );
    }

    //inits or refreshes imports
    private refreshImports() {
        this.metadataService.getImports().subscribe(
            importedOntologies => {
                this.importTree = importedOntologies;
            }
        );
    }

    //inits or refreshes namespace prefix mappings
    private refreshNSPrefixMappings() {
        this.metadataService.getNamespaceMappings().subscribe(
            mappings => {
                this.nsPrefMappingList = mappings;
                this.selectedMapping = null;
            }
        );
    }

    //======= NAMESPACE AND BASEURI MANAGEMENT =======

    /**
     * Bind/unbind namespace baseURI.
     * If they're bound, changing one of them will change the other
     */
    bindNamespaceBaseURI() {
        this.bind = !this.bind;
    }

    /**
     * When baseURI changes updates the namespace if they are bound 
     */
    onBaseURIChanged(newBaseURI: string) {
        this.baseURI = newBaseURI;
        if (this.bind) {
            this.namespace = this.baseURI;
            if (!(this.baseURI.endsWith("/") || this.baseURI.endsWith("#"))) {
                this.namespace = this.namespace + "#";
            }
        }
    }

    /**
     * When namespace changes updates the baseURI if they are bound
     */
    onNamespaceChanged(newNamespace: string) {
        this.namespace = newNamespace;
        if (this.bind) {
            if (this.namespace.endsWith("#")) {
                this.baseURI = this.namespace.slice(0, -1);
            } else {
                this.baseURI = this.namespace;
            }
        }
    }

    /**
     * Tells if namespace or baseURI have been changed
     */
    areNamespaceBaseURIChanged() {
        return (this.baseURI != this.pristineBaseURI || this.namespace != this.pristineNamespace);
    }

    /**
     * Tells if baseURI is valid. BaseURI is valid if startsWith http://
     */
    isBaseURIValid() {
        return (this.baseURI && ResourceUtils.testIRI(this.baseURI));
    }

    /**
     * Tells if namespace is valid. Namespace is valid if starts with http:// and ends with #
     */
    isNamespaceValid() {
        return (this.namespace && ResourceUtils.testIRI(this.namespace) && (this.namespace.endsWith("#") || this.namespace.endsWith("/")));
    }

    /**
     * Updates the namespace and baseURI
     */
    applyNamespaceBaseURI() {
        this.nsBaseURISubmitted = true;
        if (this.isBaseURIValid() && this.isNamespaceValid()) {
            var message = "Save change of ";
            if (this.baseURI != this.pristineBaseURI && this.namespace != this.pristineNamespace) {//changed both baseURI and namespace
                message += "baseURI and namespace? (Attention, baseURI refactoring could be a long process)";
                this.basicModals.confirm({key:"DATA_MANAGEMENT.REFACTOR.REFACTOR"}, message, ModalType.warning).then(
                    confirm => {
                        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                        this.metadataService.setDefaultNamespace(this.namespace).subscribe(
                            stResp => {
                                this.refactorService.replaceBaseURI(this.baseURI).subscribe(
                                    stResp => {
                                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                                        this.basicModals.alert({key:"DATA_MANAGEMENT.REFACTOR.REFACTOR"}, "BaseURI and namespace have been updated successfully");
                                        this.refreshBaseURI();
                                        this.refreshDefaultNamespace();
                                        this.nsBaseURISubmitted = true;
                                    }
                                )
                            }
                        )
                    },
                    rejected => {
                        //restore both
                        this.namespace = this.pristineNamespace;
                        this.baseURI = this.pristineBaseURI;
                        this.nsBaseURISubmitted = true;
                    }
                );
            } else if (this.baseURI != this.pristineBaseURI) { //changed only baseURI
                message += "baseURI? (Attention, baseURI refactoring could be a long process)";
                this.basicModals.confirm({key:"DATA_MANAGEMENT.REFACTOR.REFACTOR"}, message, ModalType.warning).then(
                    confirm => {
                        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                        this.refactorService.replaceBaseURI(this.baseURI).subscribe(
                            stResp => {
                                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                                this.basicModals.alert({key:"DATA_MANAGEMENT.REFACTOR.REFACTOR"}, "BaseURI has been updated successfully and refactor complete.");
                                this.refreshBaseURI();
                                this.nsBaseURISubmitted = true;
                            }
                        )
                    },
                    rejected => {
                        //restore baseURI
                        this.baseURI = this.pristineBaseURI;
                        this.nsBaseURISubmitted = true;
                    }
                )
            } else if (this.namespace != this.pristineNamespace) {//changed only namespace
                message += "namespace?";
                this.basicModals.confirm({key:"ACTIONS.SAVE_CHANGES"}, message, ModalType.warning).then(
                    confirm => {
                        this.metadataService.setDefaultNamespace(this.namespace).subscribe(
                            stResp => {
                                this.basicModals.alert({key:"DATA_MANAGEMENT.REFACTOR.REFACTOR"}, "Mamespace has been updated successfully");
                                this.refreshDefaultNamespace();
                                this.nsBaseURISubmitted = true;
                            }
                        );
                    },
                    rejected => {
                        //restore namespace
                        this.namespace = this.pristineNamespace;
                        this.nsBaseURISubmitted = true;
                    }
                )
            }
        } else {
            this.basicModals.alert({key:"STATUS.ERROR"}, "Please insert valid namespace and baseURI", ModalType.warning);
        }
    }

    //======= PREFIX NAMESPACE MAPPINGS MANAGEMENT =======

    /**
     * Set the given prefix namespace mapping as selected
     */
    selectMapping(mapping: any) {
        if (this.selectedMapping == mapping) {
            this.selectedMapping = null;
        } else {
            this.selectedMapping = mapping;
        }
    }

    /**
     * Adds a new prefix namespace mapping
     */
    addMapping() {
        this.sharedModals.prefixNamespace({key:"ACTIONS.ADD_PREFIX_NAMESPACE_MAPPING"}).then(
            (mapping: any) => {
                this.metadataService.setNSPrefixMapping(mapping.prefix, mapping.namespace).subscribe(
                    stResp => {
                        this.refreshNSPrefixMappings();
                    },
                    (err: Error) => {
                        if (err.name.endsWith("NSPrefixMappingUpdateException")) {
                            this.basicModals.alert({key:"STATUS.INVALID_VALUE"}, "The provided prefix is not valid, try a different one", ModalType.warning);
                        }
                    }
                )
            },
            () => { }
        )
    }

    /**
     * Removes the selected mapping
     */
    removeMapping() {
        this.metadataService.removeNSPrefixMapping(this.selectedMapping.namespace).subscribe(
            stResp => {
                this.refreshNSPrefixMappings();
            }
        )
    }

    /**
     * Changes the prefix of a prefix namespace mapping
     */
    changeMapping() {
        this.sharedModals.prefixNamespace({key:"ACTIONS.EDIT_PREFIX_NAMESPACE_MAPPING"}, this.selectedMapping.prefix, this.selectedMapping.namespace, true).then(
            (mapping: any) => {
                this.metadataService.changeNSPrefixMapping(mapping.prefix, mapping.namespace).subscribe(
                    stResp => {
                        this.refreshNSPrefixMappings();
                    }
                );
            },
            () => { }
        )
    }

    //======= IMPORTS MANAGEMENT =======

    /**
     * Opens a modal to import an ontology from web,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    importFromWeb() {
        this.sharedModals.importOntology({key:"ACTIONS.IMPORT_FROM_WEB"}, ImportType.fromWeb).then(
            (data: ImportFromWebData) => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.metadataService.addFromWeb(data.baseURI, data.transitiveImportAllowance, data.altURL, data.rdfFormat).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        //Refreshes the imports and the namespace prefix mapping
                        this.refreshImports();
                        this.refreshNSPrefixMappings();
                        this.refreshBaseUriResView();
                    }
                )
            },
            () => { }
        )
    }

    /**
     * Opens a modal to import an ontology from web and copies it to a mirror file,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    importFromWebToMirror() {
        this.sharedModals.importOntology({key:"ACTIONS.IMPORT_FROM_WEB_TO_MIRROR"}, ImportType.fromWebToMirror).then(
            (data: ImportFromWebToMirrorData) => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.metadataService.addFromWebToMirror(data.baseURI, data.mirrorFile, data.transitiveImportAllowance, data.altURL, data.rdfFormat).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        //Refreshes the imports and the namespace prefix mapping
                        this.refreshImports();
                        this.refreshNSPrefixMappings();
                        this.refreshBaseUriResView();
                    }
                )
            },
            () => { }
        )
    }

    /**
     * Opens a modal to import an ontology from a local file and copies it to a mirror file,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    importFromLocalFile() {
        this.sharedModals.importOntology({key:"ACTIONS.IMPORT_FROM_LOCAL_FILE"}, ImportType.fromLocalFile).then(
            (data: ImportFromLocalFileData) => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.metadataService.addFromLocalFile(data.baseURI, data.localFile, data.mirrorFile, data.transitiveImportAllowance).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        //Refreshes the imports and the namespace prefix mapping
                        this.refreshImports();
                        this.refreshNSPrefixMappings();
                        this.refreshBaseUriResView();
                    }
                )
            },
            () => { }
        )
    }

    /**
     * Opens a modal to import an ontology from a mirror file,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    importFromOntologyMirror() {
        this.sharedModals.importOntology({key:"ACTIONS.IMPORT_FROM_ONTOLOGY_MIRROR"}, ImportType.fromOntologyMirror).then(
            (data: ImportFromMirrorData) => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.metadataService.addFromMirror(data.mirror.baseURI, data.mirror.file, data.transitiveImportAllowance).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        //Refreshes the imports and the namespace prefix mapping
                        this.refreshImports();
                        this.refreshNSPrefixMappings();
                        this.refreshBaseUriResView();
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
        this.sharedModals.importFromDatasetCatalog({key:"ACTIONS.IMPORT_FROM_DATASET_CATALOG"}).then(
            (data: ImportFromDatasetCatalogModalReturnData) => {
                UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                this.metadataService.addFromWeb(data.ontologyIRI, data.transitiveImportAllowance, data.dataDump, data.rdfFormat).subscribe(
                    stResp => {
                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                        //Refreshes the imports and the namespace prefix mapping
                        this.refreshImports();
                        this.refreshNSPrefixMappings();
                        this.refreshBaseUriResView();
                    }
                );
            },
            () => {}
        );
    }

    /**
     * Removes the given imported ontology, then update the prefix namespace mapping and the imports list
     */
    removeImport(importedOntology: {id: string, status: string, imports: any[]}) {
        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
        this.metadataService.removeImport(importedOntology.id).subscribe(
            stResp => {
                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                //Refreshes the imports and the namespace prefix mapping
                this.refreshImports();
                this.refreshNSPrefixMappings();
                this.refreshBaseUriResView();
            }
        );
    }

    onInportTreeUpdate() {
        this.refreshImports();
    }


    openOntologyMirror() {
        this.modalService.open(OntologyMirrorModal, new ModalOptions()).result.then(
            (changed: boolean) => {
                if (changed) {
                    this.refreshImports();
                }
            },
            () => {}
        );
    }

    //======= BASE URI RES VIEW =======

    private refreshBaseUriResView() {
        this.viewChildResView.buildResourceView(this.baseUriRes);
    }

    private ontoInitialized: boolean = false;
    onOntologyUpdated() {
        //when the ResView of the ontology is initialized, emits an "update" event.
        //This check is in order to prevent the refresh of imports and prefix-ns mappings (that is already done in ngOnInit) when ontology ResView in initialized
        if (!this.ontoInitialized) {
            this.ontoInitialized = true;
            return;
        }
        this.refreshImports();
        this.refreshNSPrefixMappings();
    }

    //Authorizations

    isAddNsPrefixMappingAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataSetNsPrefixMapping);
    }
    isRemoveNsPrefixMappingAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataRemoveNsPrefixMapping);
    }
    isChangeNsPrefixMappingAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataChangeNsPrefixMapping);   
    }
    isBaseuriNsEditAuthorized(): boolean {
        return (
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataSetDefaultNs) &&
            AuthorizationEvaluator.isAuthorized(VBActionsEnum.refactorReplaceBaseUri));
    }
    isAddImportAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(VBActionsEnum.metadataAddImport);
    }

}