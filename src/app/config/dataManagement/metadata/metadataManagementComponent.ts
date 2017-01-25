import { Component } from "@angular/core";
import { Modal, BSModalContextBuilder } from 'angular2-modal/plugins/bootstrap';
import { OverlayConfig } from 'angular2-modal';

import { MetadataServices } from "../../../services/metadataServices";
import { RefactorServices } from "../../../services/refactorServices";
import { OntoManagerServices } from '../../../services/ontoManagerServices';
import { VocbenchCtx } from "../../../utils/VocbenchCtx";
import { ModalServices } from "../../../widget/modal/modalServices";
import { ReplaceBaseURIModal, ReplaceBaseURIModalData } from "./replaceBaseURIModal";
import { PrefixNamespaceModal, PrefixNamespaceModalData } from "./prefixNamespaceModal";
import { ImportOntologyModal, ImportOntologyModalData, ImportType } from "./importOntologyModal";

@Component({
    selector: "metadata-management-component",
    templateUrl: "./metadataManagementComponent.html",
    host: { class: "pageComponent" },
})
export class MetadataManagementComponent {

    // baseURI namespace section
    private pristineBaseURI: string;
    private pristineNamespace: string;
    private baseURI: string;
    private namespace: string;
    private bind: boolean = true; //keep bound the baseURI and the namespace
    private nsBaseURISubmitted: boolean = false; //tells if changes on namespace or baseURI have been submitted

    // namespace prefix section
    private nsPrefMappingList: Array<any>;
    private selectedMapping: any; //the currently selected mapping {namespace: string, prefix: string}

    // Imports params section
    private importList: Array<any>; //{status:string, uri:string, localfile: string}

    // Ontology mirror management section
    private mirrorList: Array<any>; //array of {file: string, namespace: string}

    constructor(private metadataService: MetadataServices, private ontoMgrService: OntoManagerServices,
        private refactorService: RefactorServices, private vbCtx: VocbenchCtx, private modalService: ModalServices,
        private modal: Modal) { }

    ngOnInit() {
        this.refreshBaseURI();
        this.refreshDefaultNamespace();
        this.refreshImports();
        this.refreshNSPrefixMappings();
        this.refreshOntoMirror();
    }

    //inits or refreshes baseURI
    private refreshBaseURI() {
        this.metadataService.getBaseuri().subscribe(
            baseURI => {
                this.pristineBaseURI = baseURI;
                this.baseURI = baseURI;
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
                this.importList = importedOntologies;
            }
        );
    }

    //inits or refreshes namespace prefix mappings
    private refreshNSPrefixMappings() {
        this.metadataService.getNSPrefixMappings().subscribe(
            mappings => {
                this.nsPrefMappingList = mappings;
            }
        );
    }

    //inits or refreshes ontology mirror list
    private refreshOntoMirror() {
        this.ontoMgrService.getOntologyMirror().subscribe(
            mirrors => {
                this.mirrorList = mirrors;
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
            this.namespace = this.baseURI + "#";
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
            } else {
                this.baseURI = this.namespace;
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
                this.modalService.confirm("Refactor", message, "warning").then(
                    confirm => {
                        document.getElementById("blockDivFullScreen").style.display = "block";
                        this.metadataService.setDefaultNamespace(this.namespace).subscribe(
                            stResp => {
                                this.refactorService.replaceBaseURI(this.baseURI).subscribe(
                                    stResp => {
                                        document.getElementById("blockDivFullScreen").style.display = "none";
                                        this.modalService.alert("Refactor", "BaseURI and namespace have been updated successfully");
                                        this.refreshBaseURI();
                                        this.refreshDefaultNamespace();
                                        this.nsBaseURISubmitted = true;
                                        this.vbCtx.removeScheme(this.vbCtx.getWorkingProject());
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
                this.modalService.confirm("Refactor", message, "warning").then(
                    confirm => {
                        document.getElementById("blockDivFullScreen").style.display = "block";
                        this.refactorService.replaceBaseURI(this.baseURI).subscribe(
                            stResp => {
                                document.getElementById("blockDivFullScreen").style.display = "none";
                                this.modalService.alert("Refactor", "BaseURI has been updated successfully and refactor complete.");
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
                this.modalService.confirm("Save changes", message, "warning").then(
                    confirm => {
                        this.metadataService.setDefaultNamespace(this.namespace).subscribe(
                            stResp => {
                                this.modalService.alert("Refactor", "Mamespace has been updated successfully");
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
            this.modalService.alert("Error", "Please insert valid namespace and baseURI", "error");
        }
    }

    replaceBaseURI() {
        //open a modal to manage the baseURI replacement
        var modalData = new ReplaceBaseURIModalData(this.pristineBaseURI);
        const builder = new BSModalContextBuilder<ReplaceBaseURIModalData>(
            modalData, undefined, ReplaceBaseURIModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ReplaceBaseURIModal, overlayConfig).then(
            dialog => dialog.result.then(() => { }, () => { })
        );
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
                        this.metadataService.getNSPrefixMappings().subscribe(
                            mappings => {
                                this.nsPrefMappingList = mappings;
                            }
                        )
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
                this.metadataService.getNSPrefixMappings().subscribe(
                    mappings => {
                        this.nsPrefMappingList = mappings;
                        this.selectedMapping = null;
                    }
                )
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
                        this.metadataService.getNSPrefixMappings().subscribe(
                            mappings => {
                                this.nsPrefMappingList = mappings;
                            }
                        )
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
        return this.modal.open(PrefixNamespaceModal, overlayConfig).then(
            dialog => dialog.result
        );
    }

    //======= IMPORTS MANAGEMENT =======

    /**
     * Opens a modal to import an ontology from web,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    private importFromWeb() {
        this.openImportModal("Import from web", ImportType.fromWeb).then(
            (data: any) => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.metadataService.addFromWeb(data.baseURI, data.altURL, data.rdfFormat).subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                        //Refreshes the imports and the namespace prefix mapping
                        this.refreshImports();
                        this.refreshNSPrefixMappings();
                    },
                    () => document.getElementById("blockDivFullScreen").style.display = "none"
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
        this.openImportModal("Import from web to mirror", ImportType.fromWebToMirror).then(
            (data: any) => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.metadataService.addFromWebToMirror(data.baseURI, data.mirrorFile, data.altURL, data.rdfFormat).subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                        //Refreshes the imports and the namespace prefix mapping
                        this.refreshImports();
                        this.refreshNSPrefixMappings();
                        this.refreshOntoMirror();
                    },
                    () => document.getElementById("blockDivFullScreen").style.display = "none"
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
        this.openImportModal("Import from local file", ImportType.fromLocalFile).then(
            (data: any) => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.metadataService.addFromLocalFile(data.baseURI, data.localFile, data.mirrorFile).subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                        //Refreshes the imports and the namespace prefix mapping
                        this.refreshImports();
                        this.refreshNSPrefixMappings();
                    },
                    () => document.getElementById("blockDivFullScreen").style.display = "none"
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
        this.openImportModal("Import from ontology mirror", ImportType.fromOntologyMirror).then(
            (mirror: any) => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.metadataService.addFromOntologyMirror(mirror.namespace, mirror.file).subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                        //Refreshes the imports and the namespace prefix mapping
                        this.refreshImports();
                        this.refreshNSPrefixMappings();
                    },
                    () => document.getElementById("blockDivFullScreen").style.display = "none"
                )
            },
            () => { }
        )
    }

    /**
     * Copies the imported ontology in a local mirror file, then updates the imports
     */
    private mirrorOntology(importedOntology: any) {
        this.modalService.prompt("Mirror ontology", "Mirror file name").then(
            (mirrorFileName: any) => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.metadataService.mirrorOntology(importedOntology.uri, mirrorFileName).subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                        //Refreshes the imports and the namespace prefix mapping
                        this.refreshImports();
                        this.refreshNSPrefixMappings();
                        this.refreshOntoMirror();
                    }
                );
            },
            () => { }
        )
    }

    /**
     * Removes the given imported ontology, then update the prefix namespace mapping and the imports list
     */
    private removeImport(importedOntology: any) {
        document.getElementById("blockDivFullScreen").style.display = "block";
        this.metadataService.removeImport(importedOntology.uri).subscribe(
            stResp => {
                document.getElementById("blockDivFullScreen").style.display = "none";
                //Refreshes the imports and the namespace prefix mapping
                this.refreshImports();
                this.refreshNSPrefixMappings();
            }
        );
    }

    /**
     * Opens a modal to import an ontology
     * @param title the title of the modal
     * @param importType tells the type of the import. On this parameter depends the input fields of the modal.
     * Available values: fromWeb, fromWebToMirror, fromLocalFile, fromOntologyMirror
     * @return returned object depends on importType. If importType is:
     * fromWeb) object contains "baseURI", "altURL" and "rdfFormat";
     * fromWebToMirror) object contains "baseURI", "mirrorFile", "altURL" and "rdfFormat";
     * fromLocalFile) object contains "baseURI", "localFile" and "mirrorFile";
     * fromOntologyMirror) mirror object contains "namespace" and "file".
     */
    private openImportModal(title: string, importType: ImportType) {
        var modalData = new ImportOntologyModalData(title, importType);
        const builder = new BSModalContextBuilder<ImportOntologyModalData>(
            modalData, undefined, ImportOntologyModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(ImportOntologyModal, overlayConfig).then(
            dialog => dialog.result
        );
    }


    //======= ONTOLOGY MIRROR MANAGEMENT =======

    /**
     * Opens a modal in order to update the mirror by providing a new baseURI
     * @param mirror an ontology mirror entry, an object {file: string, namespace: string}
     */
    private updateMirrorFromWebWithUri(mirror: any) {
        this.modalService.prompt("Update ontology mirror from web", "BaseURI").then(
            (newNamespace: any) => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.ontoMgrService.updateOntMirrorEntry(newNamespace, mirror.file, "wbu").subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                        this.refreshOntoMirror();
                    },
                    () => document.getElementById("blockDivFullScreen").style.display = "none"
                );
            },
            () => { }
        );
    }

    /**
     * Opens a modal in order to update the mirror by providing an URL
     * @param mirror an ontology mirror entry, an object {file: string, namespace: string}
     */
    private updateMirrorFromWebFromAltUrl(mirror: any) {
        this.modalService.prompt("Update ontology mirror from web", "URL").then(
            (url: any) => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.ontoMgrService.updateOntMirrorEntry(mirror.namespace, mirror.file, "walturl", url).subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                        this.refreshOntoMirror();
                    },
                    () => document.getElementById("blockDivFullScreen").style.display = "none"
                );
            },
            () => { }
        );
    }

    /**
     * Opens a modal in order to update the mirror by providing a local file
     * @param mirror an ontology mirror entry, an object {file: string, namespace: string}
     */
    private updateMirrorFromLocalFile(mirror: any) {
        this.modalService.selectFile("Update mirror", null, null, null, ".rdf, .owl, .xml, .ttl, .nt, .n3").then(
            (file: any) => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.ontoMgrService.updateOntMirrorEntry(mirror.namespace, mirror.file, "lf", null, file).subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                    },
                    () => document.getElementById("blockDivFullScreen").style.display = "none"
                )
            },
            () => { }
        );
    }

    /**
     * Deletes an ontology mirror stored on server
     * @param mirror an ontology mirror entry, an object {file: string, namespace: string}
     */
    private deleteOntoMirror(mirror: any) {
        this.ontoMgrService.deleteOntMirrorEntry(mirror.namespace, mirror.file).subscribe(
            stReps => {
                this.refreshImports();
                this.refreshOntoMirror();
            }
        );
    }

}