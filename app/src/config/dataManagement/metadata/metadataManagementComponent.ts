import {Component, ReflectiveInjector, provide} from "@angular/core";
import {Router} from '@angular/router-deprecated';
import {Modal, ModalConfig, ModalDialogInstance, ICustomModal} from 'angular2-modal/angular2-modal';
import {MetadataServices} from "../../../services/metadataServices";
import {RefactorServices} from "../../../services/refactorServices";
import {VocbenchCtx} from "../../../utils/VocbenchCtx";
import {ModalServices} from "../../../widget/modal/modalServices";
import {PrefixNamespaceModal, PrefixNamespaceModalContent} from "./prefixNamespaceModal";
import {ImportOntologyModal, ImportOntologyModalContent, ImportType} from "./importOntologyModal";

@Component({
	selector: "metadata-management-component",
	templateUrl: "app/src/config/dataManagement/metadata/metadataManagementComponent.html",
    providers: [MetadataServices, RefactorServices],
    host: { class : "pageComponent" },
    styles: [ ".greyText { color: #999 } .greenText { color: green }" ] //to grey the non-explicit mappings
})
export class MetadataManagementComponent {
    
    // baseURI namespace params
    private pristineBaseURI: string;
    private pristineNamespace: string;
    private baseURI: string;
    private namespace: string;
    private bind: boolean = true; //keep bound the baseURI and the namespace
    private nsBaseURISubmitted: boolean = false; //tells if changes on namespace or baseURI have been submitted
    
    // namespace prefix mapping params
    private nsPrefMappingList: Array<any>;
    private selectedMapping; //the currently selected mapping
    
    // Imports params
    private importList: Array<any>;
    
    constructor(private metadataService: MetadataServices, private refactorService: RefactorServices,
        private vbCtx: VocbenchCtx, private modalService: ModalServices, private router: Router, private modal: Modal) {
        //navigate to Home view if not authenticated
        if (vbCtx.getAuthenticationToken() == undefined) {
            router.navigate(['Home']);
        } else if (vbCtx.getWorkingProject() == undefined) {//navigate to Projects view if a project is not selected
            router.navigate(['Projects']);
        }
    }
    
    ngOnInit() {
        this.refreshBaseURI();
        this.refreshDefaultNamespace();
        this.refreshImports();
        this.refreshNSPrefixMappings();
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
    private onBaseURIChanged(newBaseURI) {
        this.baseURI = newBaseURI;
        if (this.bind) {
            this.namespace = this.baseURI + "#";
        }
    }
    
    /**
     * When namespace changes updates the baseURI if they are bound
     */
    private onNamespaceChanged(newNamespace) {
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
        return (this.namespace && this.namespace.startsWith("http://") && this.namespace.endsWith("#"));
    }
    
    /**
     * Updates the namespace and baseURI
     */
    private applyNamespaceBaseURI() {
        this.nsBaseURISubmitted = true;
        if (this.isBaseURIValid() && this.isNamespaceValid()) {
            this.modalService.confirm("Refactor", 
                "Attention, this refactoring operation could be a long process. Are you sure to proceed?", "warning").then(
                confirm => {
                    document.getElementById("blockDivFullScreen").style.display = "block";
                        this.refactorService.replaceBaseURI(this.baseURI).subscribe(
                            stResp => {
                                this.metadataService.setDefaultNamespace(this.namespace).subscribe(
                                    stResp => {
                                        document.getElementById("blockDivFullScreen").style.display = "none";
                                        this.modalService.alert("Refactor", "BaseURI and namespace have been updated successfully");
                                        //refreshes baseURI and namespace
                                        this.refreshBaseURI();
                                        this.refreshDefaultNamespace();
                                    },
                                    () => document.getElementById("blockDivFullScreen").style.display = "none"
                                );
                            }
                        )
                },
                () => {
                    //restore baseURI and namespace
                    this.baseURI = this.pristineBaseURI;
                    this.namespace = this.pristineNamespace;
                }
            );
        } else {
            this.modalService.alert("Error", "Please insert valid namespace and baseURI", "error");
        }
    }
    
    //======= PREFIX NAMESPACE MAPPINGS MANAGEMENT =======
    
    /**
     * Set the given prefix namespace mapping as selected
     */
    private selectMapping(mapping) {
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
            mapping => {
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
            () => {}
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
            mapping => {
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
            () => {}
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
        var modalContent = new PrefixNamespaceModalContent(title, prefix, namespace, namespaceReadonly);
        let resolvedBindings = ReflectiveInjector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>PrefixNamespaceModal,
                resolvedBindings,
                new ModalConfig(null, true, null)
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    
    //======= IMPORTS MANAGEMENT =======
    
    /**
     * Opens a modal to import an ontology from web,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    private importFromWeb() {
        this.openImportModal("Import from web", ImportType.fromWeb).then(
            data => {
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
            () => {}
        )
    }
    
    /**
     * Opens a modal to import an ontology from web and copies it to a mirror file,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    private importFromWebToMirror() {
        this.openImportModal("Import from web to mirror", ImportType.fromWebToMirror).then(
            data => {
                document.getElementById("blockDivFullScreen").style.display = "block";
                this.metadataService.addFromWebToMirror(data.baseURI, data.mirrorFile, data.altURL, data.rdfFormat).subscribe(
                    stResp => {
                        document.getElementById("blockDivFullScreen").style.display = "none";
                        //Refreshes the imports and the namespace prefix mapping
                        this.refreshImports();
                        this.refreshNSPrefixMappings();
                    },
                    () => document.getElementById("blockDivFullScreen").style.display = "none"
                )
            },
            () => {}
        )
    }
    
    /**
     * Opens a modal to import an ontology from a local file and copies it to a mirror file,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    private importFromLocalFile() {
        this.openImportModal("Import from local file", ImportType.fromLocalFile).then(
            data => {
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
            () => {}
        )
    }
    
    /**
     * Opens a modal to import an ontology from a mirror file,
     * once done refreshes the imports list and the namespace prefix mapping
     */
    private importFromOntologyMirror() {
        this.openImportModal("Import from ontology mirror", ImportType.fromOntologyMirror).then(
            mirror => {
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
            () => {}
        )
    }
    
    /**
     * Copies the imported ontology in a local mirror file, then updates the imports
     */
    private mirrorOntology(importedOntology) {
        this.modalService.prompt("Mirror ontology", "Mirror file name").then(
            mirrorFileName => {
                this.metadataService.mirrorOntology(importedOntology.uri, mirrorFileName).subscribe(
                    stResp => {
                        //Refreshes the imports and the namespace prefix mapping
                        this.refreshImports();
                        this.refreshNSPrefixMappings();
                    }
                );
            }
        )
    }
    
    /**
     * Removes the given imported ontology, then update the prefix namespace mapping and the imports list
     */
    private removeImport(importedOntology) {
        this.metadataService.removeImport(importedOntology.uri).subscribe(
            stResp => {
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
        var modalContent = new ImportOntologyModalContent(title, importType);
        let resolvedBindings = ReflectiveInjector.resolve(
            [provide(ICustomModal, {useValue: modalContent})]),
            dialog = this.modal.open(
                <any>ImportOntologyModal,
                resolvedBindings,
                new ModalConfig(null, true, null)
        );
        return dialog.then(resultPromise => resultPromise.result);
    }
    

}