import { Injectable } from '@angular/core';
import { OverlayConfig } from 'ngx-modialog';
import { BSModalContextBuilder, Modal } from 'ngx-modialog/plugins/bootstrap';
import { CustomFormModal, CustomFormModalData } from "../../../customForms/customForm/customFormModal";
import { ARTBNode, ARTNode, ARTResource, ARTURIResource } from '../../../models/ARTResources';
import { Language } from '../../../models/LanguagesCountries';
import { AddManuallyValueData, AddManuallyValueModal } from "./addManuallyValueModal";
import { AddPropertyValueModal, AddPropertyValueModalData } from "./addPropertyValueModal";
import { BrowseExternalResourceModal, BrowseExternalResourceModalData } from './browseExternalResourceModal';
import { ClassListCreatorModal, ClassListCreatorModalData } from "./classListCreatorModal";
import { ConstituentListCreatorModal, ConstituentListCreatorModalData } from './constituentListCreatorModal';
import { CopyLocalesModal, CopyLocalesModalData } from './copyLocalesModal';
import { DataRangeEditorModal, DataRangeEditorModalData } from "./dataRangeEditorModal";
import { DataTypeRestrictionsModal, DataTypeRestrictionsModalData } from './datatypeRestrictionsModal';
import { InstanceListCreatorModal, InstanceListCreatorModalData } from "./instanceListCreatorModal";
import { PropertyChainCreatorModal, PropertyChainCreatorModalData } from './propertyChainCreatorModal';
import { RdfsMembersModal, RdfsMembersModalData } from './rdfsMembersModal';

/**
 * Service to open modals that allow to create a classes list or instances list
 */
@Injectable()
export class ResViewModalServices {

    constructor(private modal: Modal) { }

    /**
     * Opens a modal to create a list of classes (useful for class axioms)
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing an array of 
     * classes (ARTURIResource) and expressions (ARTBNode)
     */
    createClassList(title: string) {
        var modalData = new ClassListCreatorModalData(title);
        const builder = new BSModalContextBuilder<ClassListCreatorModalData>(
            modalData, undefined, ClassListCreatorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(ClassListCreatorModal, overlayConfig).result;
    }

    /**
     * Opens a modal to create a list of instance (useful for class axioms)
     * @param title the title of the modal
     * @return if the modal closes with ok returns a promise containing an array of instances
     */
    createInstanceList(title: string) {
        var modalData = new InstanceListCreatorModalData(title);
        const builder = new BSModalContextBuilder<InstanceListCreatorModalData>(
            modalData, undefined, InstanceListCreatorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(InstanceListCreatorModal, overlayConfig).result;
    }

    createPropertyChain(title: string, property: ARTURIResource, propChangeable?: boolean, chain?: ARTBNode) {
        var modalData = new PropertyChainCreatorModalData(title, property, propChangeable, chain);
        const builder = new BSModalContextBuilder<InstanceListCreatorModalData>(
            modalData, undefined, InstanceListCreatorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(PropertyChainCreatorModal, overlayConfig).result;
    }

    /**
     * Opens a modal with a custom form to enrich a property with a custom range.
     * @param title title of the dialog
     * @param creId custom range entry ID
     * @param language optional language that if provided "suggests" to initialize each lang-picker to it
     */
    enrichCustomForm(title: string, creId: string, language?: string) {
        var modalData = new CustomFormModalData(title, creId, language);
        const builder = new BSModalContextBuilder<CustomFormModalData>(
            modalData, undefined, CustomFormModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(CustomFormModal, overlayConfig).result;
    }

    /**
     * Opens a modal that allows to select a property and add a value to it.
     * Returns and object containing "property" and "value".
     * @param title title of the dialog
     * @param resource resource that is going to enrich with the property-value pair.
     * @param property property that the modal should allow to enrich
     * @param propChangeable tells whether the input property can be changed exploring the properties subtree.
     *  If false, the button to change property is hidden. Default is true
     * @param rootProperty root property that, in case propChangeable is true, the modal should show as root of the property change when changing
     * @param allowMultiselection tells whether the multiselection in the tree/list is allowed. Default is true. (some scenario may
     * require to disable the multiselection, like the addFirst/After...() in oreded collection).
     */
    addPropertyValue(title: string, resource: ARTResource, property: ARTURIResource, propChangeable?: boolean, rootProperty?: ARTURIResource, allowMultiselection?: boolean) {
        var modalData = new AddPropertyValueModalData(title, resource, property, propChangeable, rootProperty, allowMultiselection);
        const builder = new BSModalContextBuilder<AddPropertyValueModalData>(
            modalData, undefined, AddPropertyValueModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(AddPropertyValueModal, overlayConfig).result;
    }

    /**
     * 
     * @param property 
     * @param propChangeable 
     */
    addManualValue(property: ARTURIResource, propChangeable?: boolean) {
        var modalData = new AddManuallyValueData(property, propChangeable);
        const builder = new BSModalContextBuilder<AddManuallyValueData>(
            modalData, undefined, AddManuallyValueData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(AddManuallyValueModal, overlayConfig).result;
    }

    /**
     * 
     * @param property 
     * @param propChangeable 
     */
    addRdfsMembers(property: ARTURIResource, propChangeable?: boolean) {
        var modalData = new RdfsMembersModalData(property, propChangeable);
        const builder = new BSModalContextBuilder<RdfsMembersModalData>(
            modalData, undefined, RdfsMembersModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(RdfsMembersModal, overlayConfig).result;
    }

    /**
     * 
     * @param title 
     */
    createConstituentList(title: string) {
        var modalData = new ConstituentListCreatorModalData(title);
        const builder = new BSModalContextBuilder<ConstituentListCreatorModalData>(
            modalData, undefined, ConstituentListCreatorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.size('lg').keyboard(27).toJSON() };
        return this.modal.open(ConstituentListCreatorModal, overlayConfig).result;
    }

    /**
     * Opens a modal that allows to edit an existing datarange
     * @param datarangeNode node that represents the datarange
     */
    editDataRange(datarangeNode: ARTBNode) {
        var modalData = new DataRangeEditorModalData(datarangeNode);
        const builder = new BSModalContextBuilder<DataRangeEditorModalData>(
            modalData, undefined, DataRangeEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(DataRangeEditorModal, overlayConfig).result;
    }

    /**
     * 
     * @param title 
     * @param property 
     * @param propChangeable 
     */
    browseExternalResource(title: string, property?: ARTURIResource, propChangeable?: boolean) {
        var modalData = new BrowseExternalResourceModalData(title, property, propChangeable);
        const builder = new BSModalContextBuilder<BrowseExternalResourceModalData>(
            modalData, undefined, BrowseExternalResourceModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(BrowseExternalResourceModal, overlayConfig).result;
    }

    /**
     * 
     * @param value 
     * @param locales 
     */
    copyLocale(value: ARTNode, locales: Language[]) {
        var modalData = new CopyLocalesModalData(value, locales);
        const builder = new BSModalContextBuilder<CopyLocalesModalData>(
            modalData, undefined, CopyLocalesModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(CopyLocalesModal, overlayConfig).result;
    }

    /**
     * @param title 
     * @param datatype the datatype to which add/edit the restriction
     * @param restriction if provided, represents the restriction to edit
     */
    setDatatypeFacets(title: string, datatype: ARTURIResource, restriction?: ARTBNode) {
        var modalData = new DataTypeRestrictionsModalData(title, datatype, restriction);
        const builder = new BSModalContextBuilder<DataTypeRestrictionsModalData>(
            modalData, undefined, DataTypeRestrictionsModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(DataTypeRestrictionsModal, overlayConfig).result;
    }

}