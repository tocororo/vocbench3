import { Component, ViewChild } from "@angular/core";
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { ARTURIResource } from "../../../../models/ARTResources";
import { ImportType, OntologyImport, PrefixMapping } from "../../../../models/Metadata";
import { ResourceViewComponent } from "../../../../resourceView/resourceViewComponent";
import { MetadataServices } from "../../../../services/metadataServices";
import { RefactorServices } from "../../../../services/refactorServices";
import { AuthorizationEvaluator } from "../../../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../../../utils/UIUtils";
import { VBContext } from "../../../../utils/VBContext";
import { VBProperties } from "../../../../utils/VBProperties";
import { BasicModalServices } from "../../../../widget/modal/basicModal/basicModalServices";
import { SharedModalServices } from "../../../../widget/modal/sharedModal/sharedModalServices";
import { OntologyMirrorModal } from "./ontologyMirrorModal";
import { PrefixNamespaceModal, PrefixNamespaceModalData } from "./prefixNamespaceModal";

@Component({
    selector: "namespaces-imports-component",
    templateUrl: "./namespacesAndImportsComponent.html",
    host: { class: "pageComponent" },
})
export class NamespacesAndImportsComponent {

    @ViewChild(ResourceViewComponent) viewChildResView: ResourceViewComponent;

    // baseURI namespace section
    private pristineBaseURI: string;
    private pristineNamespace: string;
    private baseURI: string;
    private namespace: string;
    private bind: boolean = true; //keep bound the baseURI and the namespace
    private nsBaseURISubmitted: boolean = false; //tells if changes on namespace or baseURI have been submitted

    // namespace prefix section
    private nsPrefMappingList: PrefixMapping[];
    private selectedMapping: any; //the currently selected mapping {namespace: string, prefix: string}

    // Imports params section
    private importTree: OntologyImport[];

    //Ontology res view
    private baseUriRes: ARTURIResource;
    private baseUriResPosition: string;

    constructor(private metadataService: MetadataServices, private refactorService: RefactorServices, private preferences: VBProperties,
        private basicModals: BasicModalServices, private sharedModals: SharedModalServices, private modal: Modal) { }

    ngOnInit() {
        this.refreshBaseURI();
        this.refreshDefaultNamespace();
        this.refreshImports();
        this.refreshNSPrefixMappings();

        this.baseUriResPosition = "local:" + VBContext.getWorkingProject().getName();
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
    private bindNamespaceBaseURI() {
        this.bind = !this.bind;
    }

    /**
     * When baseURI changes updates the namespace if they are bound 
     */
    private onBaseURIChanged(newBaseURI: string) {
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
    private onNamespaceChanged(newNamespace: string) {
        this.namespace = newNamespace;
        if (this.bind) {
            if (this.namespace.endsWith("#")) {
                this.baseURI = this.namespace.slice(0, -1);
                this.baseUriRes = new ARTURIResource(this.baseURI);
            } else {
                this.baseURI = this.namespace;
                this.baseUriRes = new ARTURIResource(this.baseURI);
            }
        }
    }

    /**
     * Tells if namespace or baseURI have been changed
     */
    private areNamespaceBaseURIChanged() {
        return (this.baseURI != this.pristineBaseURI || this.namespace != this.pristineNamespace);
    }

    /**
     * Tells if baseURI is valid. BaseURI is valid if startsWith http://
     */
    private isBaseURIValid() {
        return (this.baseURI && this.baseURI.startsWith("http://"));
    }

    /**
     * Tells if namespace is valid. Namespace is valid if starts with http:// and ends with #
     */
    private isNamespaceValid() {
        return (this.namespace && this.namespace.startsWith("http://") && (this.namespace.endsWith("#") || this.namespace.endsWith("/")));
    }

    /**
     * Updates the namespace and baseURI
     */
    private applyNamespaceBaseURI() {
        this.nsBaseURISubmitted = true;
        if (this.isBaseURIValid() && this.isNamespaceValid()) {
            var message = "Save change of ";
            if (this.baseURI != this.pristineBaseURI && this.namespace != this.pristineNamespace) {//changed both baseURI and namespace
                message += "baseURI and namespace? (Attention, baseURI refactoring could be a long process)";
                this.basicModals.confirm("Refactor", message, "warning").then(
                    confirm => {
                        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                        this.metadataService.setDefaultNamespace(this.namespace).subscribe(
                            stResp => {
                                this.refactorService.replaceBaseURI(this.baseURI).subscribe(
                                    stResp => {
                                        UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                                        this.basicModals.alert("Refactor", "BaseURI and namespace have been updated successfully");
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
                this.basicModals.confirm("Refactor", message, "warning").then(
                    confirm => {
                        UIUtils.startLoadingDiv(UIUtils.blockDivFullScreen);
                        this.refactorService.replaceBaseURI(this.baseURI).subscribe(
                            stResp => {
                                UIUtils.stopLoadingDiv(UIUtils.blockDivFullScreen);
                                this.basicModals.alert("Refactor", "BaseURI has been updated successfully and refactor complete.");
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
                this.basicModals.confirm("Save changes", message, "warning").then(
                    confirm => {
                        this.metadataService.setDefaultNamespace(this.namespace).subscribe(
                            stResp => {
                                this.basicModals.alert("Refactor", "Mamespace has been updated successfully");
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
            this.basicModals.alert("Error", "Please insert valid namespace and baseURI", "error");
        }
    }

    //======= PREFIX NAMESPACE MAPPINGS MANAGEMENT =======

    /**
     * Set the given prefix namespace mapping as selected
     */
    private selectMapping(mapping: any) {
        if (this.selectedMapping == mapping) {
            this.selectedMapping = null;
        } else {
            this.selectedMapping = mapping;
        }
    }

    /**
     * Adds a new prefix namespace mapping
     */
    private addMapping() {
        this.openMappingModal("Add prefix namespace mapping").then(
            (mapping: any) => {
                this.metadataService.setNSPrefixMapping(mapping.prefix, mapping.namespace).subscribe(
                    stResp => {
                        this.refreshNSPrefixMappings();
                    }
                )
            },
            () => { }
        )
    }

    /**
     * Removes the selected mapping
     */
    private removeMapping() {
        this.metadataService.removeNSPrefixMapping(this.selectedMapping.namespace).subscribe(
            stResp => {
                this.refreshNSPrefixMappings();
            }
        )
    }

    /**
     * Changes the prefix of a prefix namespace mapping
     */
    private changeMapping() {
        this.openMappingModal("Change prefix namespace mapping", this.selectedMapping.prefix, this.selectedMapping.namespace, true).then(
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

    /**
     * Opens a modal to create/edit a prefix namespace mapping.
     * @param title the title of the modal
     * @param prefix the prefix to change. Optional, to provide only to change a mapping.
     * @param namespace the namespace to change. Optional, to provide only to change a mapping.
     * @param namespaceReadonly tells if namespace value can be changed
     * @return returns a mapping object containing "prefix" and "namespace"
     */
    private openMappingModal(title: string, prefix?: string, namespace?: string, namespaceReadonly?: boolean) {
        var modalData = new PrefixNamespaceModalData(title, prefix, namespace, namespaceReadonly);
        const builder = new BSModalContextBuilder<PrefixNamespaceModalData>(
            modalData, undefined, PrefixNamespaceModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(PrefixNamespaceModal, overlayConfig).result;
    }

    //======= IMPORTS MANAGEMENT =======

    /**
     * Opens a modal to import an ontology from web,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    private importFromWeb() {
        this.sharedModals.importOntology("Import from web", ImportType.fromWeb).then(
            (data: any) => {
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
    private importFromWebToMirror() {
        this.sharedModals.importOntology("Import from web to mirror", ImportType.fromWebToMirror).then(
            (data: any) => {
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
    private importFromLocalFile() {
        this.sharedModals.importOntology("Import from local file", ImportType.fromLocalFile).then(
            (data: any) => {
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
    private importFromOntologyMirror() {
        this.sharedModals.importOntology("Import from ontology mirror", ImportType.fromOntologyMirror).then(
            (data: any) => {
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
        )
    }

    /**
     * Removes the given imported ontology, then update the prefix namespace mapping and the imports list
     */
    private removeImport(importedOntology: {id: string, status: string, imports: any[]}) {
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

    private onInportTreeUpdate() {
        this.refreshImports();
    }


    private openOntologyMirror() {
        const builder = new BSModalContextBuilder<any>();
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        this.modal.open(OntologyMirrorModal, overlayConfig).result.then(
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

    //Authorizations

    private isAddNsPrefixMappingAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.METADATA_SET_NS_PREFIX_MAPPING);
    }
    private isRemoveNsPrefixMappingAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.METADATA_REMOVE_NS_PREFIX_MAPPING);
    }
    private isChangeNsPrefixMappingAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.METADATA_CHANGE_NS_PREFIX_MAPPING);   
    }
    private isBaseuriNsEditAuthorized(): boolean {
        return (
            AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.METADATA_SET_DEFAULT_NS) &&
            AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.REFACTOR_REPLACE_BASEURI));
    }
    private isAddImportAuthorized(): boolean {
        return AuthorizationEvaluator.isAuthorized(AuthorizationEvaluator.Actions.METADATA_ADD_IMPORT);
    }

}