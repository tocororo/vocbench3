import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SharedModule } from "./sharedModule";
import { TreeAndListModule } from "./treeAndListModule";
import { CustomFormModule } from "./customFormModule";
import { UserModule } from "./userModule";

//services to open modals
import { BasicModalServices } from "../widget/modal/basicModal/basicModalServices";
import { BrowsingModalServices } from "../widget/modal/browsingModal/browsingModalServices";
import { CreationModalServices } from "../widget/modal/creationModal/creationModalServices";
import { SharedModalServices } from "../widget/modal/sharedModal/sharedModalServices";

//basic modals
import { AlertModal } from '../widget/modal/basicModal/alertModal/alertModal';
import { ConfirmModal } from '../widget/modal/basicModal/confirmModal/confirmModal';
import { ConfirmCheckModal } from '../widget/modal/basicModal/confirmModal/confirmCheckModal';
import { DownloadModal } from '../widget/modal/basicModal/downloadModal/downloadModal';
import { FilePickerModal } from '../widget/modal/basicModal/filePickerModal/filePickerModal';
import { PromptModal } from '../widget/modal/basicModal/promptModal/promptModal';
import { PromptPrefixedModal } from '../widget/modal/basicModal/promptModal/promptPrefixedModal';
import { SelectionModal } from '../widget/modal/basicModal/selectionModal/selectionModal';
import { ResourceSelectionModal } from '../widget/modal/basicModal/selectionModal/resourceSelectionModal';
import { CustomFormSelectionModal } from '../widget/modal/basicModal/selectionModal/customFormSelectionModal';

//shared modals
import { PluginConfigModal } from "../widget/modal/sharedModal/pluginConfigModal/pluginConfigModal";
import { RemoteAccessConfigModal } from "../widget/modal/sharedModal/remoteAccessConfigModal/remoteAccessConfigModal";
import { RemoteRepoSelectionModal } from "../widget/modal/sharedModal/remoteRepoSelectionModal/remoteRepoSelectionModal";

//browsing modals
import { ClassTreeModal } from '../widget/modal/browsingModal/classTreeModal/classTreeModal';
import { ClassIndividualTreeModal } from "../widget/modal/browsingModal/classIndividualTreeModal/classIndividualTreeModal";
import { ConceptTreeModal } from '../widget/modal/browsingModal/conceptTreeModal/conceptTreeModal';
import { InstanceListModal } from '../widget/modal/browsingModal/instanceListModal/instanceListModal';
import { PropertyTreeModal } from '../widget/modal/browsingModal/propertyTreeModal/propertyTreeModal';
import { SchemeListModal } from '../widget/modal/browsingModal/schemeListModal/schemeListModal';
import { CollectionTreeModal } from '../widget/modal/browsingModal/collectionTreeModal/collectionTreeModal';

//creation modals
import { NewPlainLiteralModal } from '../widget/modal/creationModal/newPlainLiteralModal/newPlainLiteralModal';
import { NewResourceModal } from '../widget/modal/creationModal/newResourceModal/newResourceModal';
import { NewResourceCfModal } from '../widget/modal/creationModal/newResourceModal/newResourceCfModal';
import { NewSkosResourceCfModal } from '../widget/modal/creationModal/newResourceModal/newSkosResourceCfModal';
import { NewTypedLiteralModal } from '../widget/modal/creationModal/newTypedLiteralModal/newTypedLiteralModal';
import { NewConceptFromLabelModal } from '../widget/modal/creationModal/newResourceModal/newConceptFromLabelModal';

//metadata modals
import { ImportOntologyModal } from '../config/dataManagement/metadata/importOntologyModal';
import { PrefixNamespaceModal } from '../config/dataManagement/metadata/prefixNamespaceModal';
import { ReplaceBaseURIModal } from '../config/dataManagement/metadata/replaceBaseURIModal';

//alignment modals
import { ValidationSettingsModal } from '../alignment/alignmentValidation/validationSettingsModal/validationSettingsModal';
import { ValidationReportModal } from '../alignment/alignmentValidation/validationReportModal/validationReportModal';
import { ResourceAlignmentModal } from '../alignment/resourceAlignment/resourceAlignmentModal';
import { BrowseExternalResourceModal } from '../alignment/resourceAlignment/browseExternalResourceModal';

//project config modal
import { ProjectPropertiesModal } from "../project/projectPropertiesModal";
import { ProjectACLModal } from "../project/projectACL/projectACLModal";
import { ACLEditorModal } from "../project/projectACL/aclEditorModal";
import { ProjectListModal } from "../project/projectListModal";

//administration modal
import { UserProjBindingModal } from "../administration/administrationModals/userProjBindingModal";
import { CapabilityEditorModal } from "../administration/administrationModals/capabilityEditorModal";
import { ImportRoleModal } from "../administration/administrationModals/importRoleModal";
import { UserCreateModal } from "../administration/administrationModals/userCreateModal";

//config modals
import { FilterGraphsModal } from "../config/dataManagement/exportData/filterGraphsModal/filterGraphsModal";
import { DumpCreationModal } from "../config/dataManagement/versioning/dumpCreationModal";

//this is used only in newResource modals, if it will be useful elsewhere, it can be moved in sharedModule
import { EditableNsInput } from '../widget/modal/creationModal/newResourceModal/editableNsInput';

@NgModule({
    imports: [CommonModule, FormsModule, SharedModule, TreeAndListModule, CustomFormModule, UserModule],
    declarations: [
        AlertModal, ConfirmModal, ConfirmCheckModal, DownloadModal, FilePickerModal,
        NewPlainLiteralModal, NewResourceModal, NewResourceCfModal, 
        NewSkosResourceCfModal, NewTypedLiteralModal, NewConceptFromLabelModal,
        PromptModal, PromptPrefixedModal, SelectionModal, ResourceSelectionModal, CustomFormSelectionModal,
        ClassTreeModal, ClassIndividualTreeModal, ConceptTreeModal, InstanceListModal,
        PropertyTreeModal, SchemeListModal, CollectionTreeModal,
        ImportOntologyModal, PrefixNamespaceModal, ReplaceBaseURIModal,
        ValidationSettingsModal, ValidationReportModal, ResourceAlignmentModal, BrowseExternalResourceModal,
        RemoteAccessConfigModal, RemoteRepoSelectionModal, ProjectPropertiesModal, ProjectACLModal, ACLEditorModal, ProjectListModal,
        UserProjBindingModal, CapabilityEditorModal, ImportRoleModal, UserCreateModal,
        PluginConfigModal, FilterGraphsModal, DumpCreationModal,
        EditableNsInput
    ],
    exports: [],
    providers: [BasicModalServices, BrowsingModalServices, CreationModalServices, SharedModalServices],
    //components never used outside the module (so not in exports array), but rendered (loaded) dynamically
    /**
     * (From ngModule FAQ https://angular.io/docs/ts/latest/cookbook/ngmodule-faq.html#!#q-what-not-to-export)
     * What should I not export?
     * Components that are only loaded dynamically by the router or by bootstrapping.
     * Such entry components can never be selected in another component's template.
     * There's no harm in exporting them but no benefit either. 
     */
    entryComponents: [
        AlertModal, ConfirmModal, ConfirmCheckModal, DownloadModal, FilePickerModal,
        NewPlainLiteralModal, NewResourceModal, NewResourceCfModal, 
        NewSkosResourceCfModal, NewTypedLiteralModal, NewConceptFromLabelModal,
        PromptModal, PromptPrefixedModal, SelectionModal, ResourceSelectionModal, CustomFormSelectionModal,
        ClassTreeModal, ClassIndividualTreeModal, ConceptTreeModal, InstanceListModal,
        PropertyTreeModal, SchemeListModal, CollectionTreeModal,
        ImportOntologyModal, PrefixNamespaceModal, ReplaceBaseURIModal,
        ValidationSettingsModal, ValidationReportModal, ResourceAlignmentModal, BrowseExternalResourceModal,
        RemoteAccessConfigModal, RemoteRepoSelectionModal, ProjectPropertiesModal, ProjectACLModal, ACLEditorModal, ProjectListModal,
        UserProjBindingModal, CapabilityEditorModal, ImportRoleModal, UserCreateModal,
        PluginConfigModal, FilterGraphsModal, DumpCreationModal
    ]
})
export class VBModalModule { }