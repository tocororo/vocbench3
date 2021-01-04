import { Injectable } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DatasetCatalogModal } from 'src/app/config/dataManagement/datasetCatalog/datasetCatalogModal';
import { ImportFromDatasetCatalogModal } from 'src/app/metadata/namespacesAndImports/importFromDatasetCatalogModal';
import { ImportOntologyModal } from 'src/app/metadata/namespacesAndImports/importOntologyModal';
import { PrefixNamespaceModal } from 'src/app/metadata/namespacesAndImports/prefixNamespaceModal';
import { ImportType } from 'src/app/models/Metadata';
import { ProjectListModal } from 'src/app/project/projectListModal';
import { ResourceViewModal } from 'src/app/resourceView/resourceViewModal';
import { ARTNode, ARTResource, RDFResourceRolesEnum } from "../../../models/ARTResources";
import { RDFCapabilityType } from "../../../models/Coda";
import { Reference } from '../../../models/Configuration';
import { Settings } from "../../../models/Plugins";
import { RemoteRepositoryAccessConfig } from "../../../models/Project";
import { User } from '../../../models/User';
import { ProjectContext } from '../../../utils/VBContext';
import { ResourceSelectionModal } from '../basicModal/selectionModal/resourceSelectionModal';
import { ModalOptions, TextOrTranslation } from '../Modals';
import { LoadConfigurationModal } from "./configurationStoreModal/loadConfigurationModal";
import { StoreConfigurationModal } from "./configurationStoreModal/storeConfigurationModal";
import { ConverterPickerModal } from "./converterPickerModal/converterPickerModal";
import { LanguageSelectorModal } from "./languagesSelectorModal/languageSelectorModal";
import { ManchesterExprModal } from './manchesterExprModal/manchesterExprModal';
import { PluginConfigModal } from "./pluginConfigModal/pluginConfigModal";
import { RemoteAccessConfigModal } from "./remoteAccessConfigModal/remoteAccessConfigModal";
import { RemoteRepoSelectionModal } from "./remoteRepoSelectionModal/remoteRepoSelectionModal";
import { ResourcePickerModal } from './resourcePickerModal/resourcePickerModal';
import { UserSelectionModal } from './userSelectionModal/userSelectionModal';

@Injectable()
export class SharedModalServices {

    constructor(private modalService: NgbModal, private translateService: TranslateService) { }

    /**
     * Opens a modal to change a plugin configuration.
     * Returns a new PluginConfiguration, the input configuration doesn't mutate.
     * @param configuration
     */
    configurePlugin(configuration: Settings) {
        const modalRef: NgbModalRef = this.modalService.open(PluginConfigModal, new ModalOptions());
        modalRef.componentInstance.configuration = configuration;
        return modalRef.result;
    }

    /**
     * Opens a modal to change a remote repository access configuration (serverURL, username and password).
     * @param configuration
     */
    configureRemoteRepositoryAccess() {
        const modalRef: NgbModalRef = this.modalService.open(RemoteAccessConfigModal, new ModalOptions());
        return modalRef.result;
    }

    /**
     * Opens a modal to pick a remote repository. Note, this modal doesn't check if the remote repo configuration provided
     * is ok, the check of serverURL must be done previously.
     * @param title
     * @param remoteRepoConfig contains serverURL, username and password
     */
    selectRemoteRepository(title: TextOrTranslation, remoteRepoConfig: RemoteRepositoryAccessConfig) {
        const modalRef: NgbModalRef = this.modalService.open(RemoteRepoSelectionModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.repoConfig = remoteRepoConfig;
        return modalRef.result;
    }

    /**
     * Opens a resource view in a modal
     * @param resource 
     */
    openResourceView(resource: ARTResource, readonly: boolean, projectCtx?: ProjectContext) {
        const modalRef: NgbModalRef = this.modalService.open(ResourceViewModal, new ModalOptions('lg'));
        modalRef.componentInstance.resource = resource;
        modalRef.componentInstance.readonly = readonly;
        if (projectCtx != null) modalRef.componentInstance.projectCtx = projectCtx;
        return modalRef.result;
    }

    /**
     * Opens a modal to select multiple languages
     * @param title
     * @param languages languages already selected
     * @param radio if true, exactly one language should be selected
     * @param projectAware if true, allow selection only of languages available in the current project
     * @param projectCtx allow to customize the available languages for the contextual project
     */
    selectLanguages(title: TextOrTranslation, languages?: string[], radio?: boolean, projectAware?: boolean, projectCtx?: ProjectContext) {
        const modalRef: NgbModalRef = this.modalService.open(LanguageSelectorModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (languages != null) modalRef.componentInstance.languages = languages;
        if (radio != null) modalRef.componentInstance.radio = radio;
        if (projectAware != null) modalRef.componentInstance.projectAware = projectAware;
        if (projectCtx != null) modalRef.componentInstance.projectCtx = projectCtx;
        return modalRef.result;
    }

    /**
     * Opens a modal that allow to select a converter
     * @param title 
     * @param message 
     */
    selectConverter(title: TextOrTranslation, message?: string, capabilities?: RDFCapabilityType[]) {
        const modalRef: NgbModalRef = this.modalService.open(ConverterPickerModal, new ModalOptions('lg'));
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (message != null) modalRef.componentInstance.message = message;
        if (capabilities != null) modalRef.componentInstance.capabilities = capabilities;
        return modalRef.result;
    }


    /**
     * Open a modal that allows to store a configuration. If the configuration is succesfully stored, returns it relativeReference.
     * @param title 
     * @param configurationComponent 
     * @param configurationObject 
     * @param relativeRef if provided suggest to override a previously saved configuration
     * @return the relativeReference of the stored configuration
     */
    storeConfiguration(title: TextOrTranslation, configurationComponent: string, configurationObject: { [key: string]: any }, relativeRef?: string) {
        const modalRef: NgbModalRef = this.modalService.open(StoreConfigurationModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.configurationComponent = configurationComponent;
        modalRef.componentInstance.configurationObject = configurationObject;
        if (relativeRef != null) modalRef.componentInstance.relativeRef = relativeRef;
        return modalRef.result;
    }

    /**
     * @param title 
     * @param configurationComponent 
     * @param allowLoad 
     *      if true (default), the dialog loads and returns the selected configuration;
     *      if false just returns the selected configuration without loading it.
     * @param allowDelete
     *      if true (default) the UI provides buttons for deleting the configuration;
     *      if false the deletion of the configuration is disabled.
     * @param additionalReferences additional references not deletable. 
     *  If one of these references is chosen, it is just returned, its configuration is not loaded
     * 
     * 
     * @return returns a LoadConfigurationModalReturnData object with configuration and relativeReference
     */
    loadConfiguration(title: TextOrTranslation, configurationComponent: string, allowLoad?: boolean, allowDelete?: boolean, additionalReferences?: Reference[]) {
        const modalRef: NgbModalRef = this.modalService.open(LoadConfigurationModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.configurationComponent = configurationComponent;
        if (allowLoad !== undefined) modalRef.componentInstance.allowLoad = allowLoad;
        if (allowDelete !== undefined) modalRef.componentInstance.allowDelete = allowDelete;
        if (additionalReferences !== undefined) modalRef.componentInstance.additionalReferences = additionalReferences;
        return modalRef.result;
    }

    /**
     * 
     * @param title 
     * @param roles 
     * @param editable 
     */
    pickResource(title: TextOrTranslation, roles?: RDFResourceRolesEnum[], editable?: boolean) {
        const modalRef: NgbModalRef = this.modalService.open(ResourcePickerModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (roles != null) modalRef.componentInstance.roles = roles;
        if (editable != null) modalRef.componentInstance.editable = editable;
        return modalRef.result;
    }

    /**
     * 
     * @param title 
     * @param importType 
     */
    importOntology(title: TextOrTranslation, importType: ImportType) {
        const modalRef: NgbModalRef = this.modalService.open(ImportOntologyModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.importType = importType;
        return modalRef.result;
    }

    /**
     * 
     * @param title 
     */
    importFromDatasetCatalog(title: TextOrTranslation) {
        const modalRef: NgbModalRef = this.modalService.open(ImportFromDatasetCatalogModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        return modalRef.result;
    }

    /**
     * Selects and returns a user
     * @param title 
     * @param projectDependent if true, the modal allows to select only users bound to the current project
     * @param unselectableUsers a (optional) list of user not selectable (disabled). This list can be useful in order to
     * disable the selection of some users when the modal is used to enrich an existing list of users
     */
    selectUser(title: TextOrTranslation, projectDependent?: boolean, unselectableUsers?: User[]) {
        const modalRef: NgbModalRef = this.modalService.open(UserSelectionModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (projectDependent != null) modalRef.componentInstance.projectDepending = projectDependent;
        if (unselectableUsers != null) modalRef.componentInstance.unselectableUsers = unselectableUsers;
        return modalRef.result;
    }

    /**
     * 
     */
    datasetCatalog() {
        const modalRef: NgbModalRef = this.modalService.open(DatasetCatalogModal, new ModalOptions('xl'));
        return modalRef.result;
    }

    /**
     * Opens a modal to create/edit a prefix namespace mapping.
     * @param title the title of the modal
     * @param prefix the prefix to change. Optional, to provide only to change a mapping.
     * @param namespace the namespace to change. Optional, to provide only to change a mapping.
     * @param namespaceReadonly tells if namespace value can be changed
     * @return returns a mapping object containing "prefix" and "namespace"
     */
    prefixNamespace(title: TextOrTranslation, prefix?: string, namespace?: string, namespaceReadonly?: boolean): Promise<{ prefix: string, namespace: string }> {
        const modalRef: NgbModalRef = this.modalService.open(PrefixNamespaceModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (prefix != null) modalRef.componentInstance.prefixInput = prefix;
        if (namespace != null) modalRef.componentInstance.namespaceInput = namespace;
        if (namespaceReadonly != null) modalRef.componentInstance.namespaceReadonly = namespaceReadonly;
        return modalRef.result;
    }

    /**
     * Opens a modal to create/edit a manchester expression
     * @param title 
     * @param expression 
     * @return returns a manchester expression
     */
    manchesterExpression(title: TextOrTranslation, expression?: string): Promise<string> {
        const modalRef: NgbModalRef = this.modalService.open(ManchesterExprModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        if (expression != null) modalRef.componentInstance.expression = expression;
        return modalRef.result;
    }


    /**
     * Opens a modal for accessing a project
     */
    changeProject() {
        const modalRef: NgbModalRef = this.modalService.open(ProjectListModal, new ModalOptions('lg'));
        return modalRef.result;
    }

    /**
     * Opens a modal with an message and a list of selectable options.
     * @param title the title of the modal dialog
     * @param message the message to show in the modal dialog body. If null no message will be in the modal
     * @param resourceList array of available resources
     * @param rendering in case of array of resources, it tells whether the resources should be rendered
     * @return if the modal closes with ok returns a promise containing the selected resource
     */
    selectResource(title: TextOrTranslation, message: TextOrTranslation, resourceList: Array<ARTNode>, rendering?: boolean) {
        const modalRef: NgbModalRef = this.modalService.open(ResourceSelectionModal, new ModalOptions());
        modalRef.componentInstance.title = (typeof title == "string") ? title : this.translateService.instant(title.key, title.params);
        modalRef.componentInstance.message = (typeof message == "string") ? message : this.translateService.instant(message.key, message.params);
        modalRef.componentInstance.resourceList = resourceList;
        if (rendering != null) modalRef.componentInstance.rendering = rendering;
        return modalRef.result;
    }

}