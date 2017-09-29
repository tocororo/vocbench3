import { Injectable } from '@angular/core';
import { Modal, BSModalContextBuilder } from 'ngx-modialog/plugins/bootstrap';
import { OverlayConfig } from 'ngx-modialog';
import { ClassListCreatorModal, ClassListCreatorModalData } from "./classListCreatorModal";
import { InstanceListCreatorModal, InstanceListCreatorModalData } from "./instanceListCreatorModal";
import { EnrichPropertyModal, EnrichPropertyModalData } from "./enrichPropertyModal";
import { AddPropertyValueModal, AddPropertyValueModalData } from "./addPropertyValueModal";
import { DataRangeEditorModal, DataRangeEditorModalData } from "./dataRangeEditorModal";
import { CustomFormModal, CustomFormModalData } from "../../customForms/customForm/customFormModal";
import { ARTResource, ARTBNode, ARTURIResource, ARTLiteral } from '../../models/ARTResources';

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
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
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
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(InstanceListCreatorModal, overlayConfig).result;
    }

    /**
     * Opens a modal to select a resource to set as value of a property with range "resource"
     * @param title the title of the modal
     * @param property property to enrich with a resource
     * @param ranges admitted range classes of the property
     * @return if the modal closes with ok returns a promise containing the selected resource
     */
    enrichProperty(title: string, property: ARTURIResource, ranges?: ARTURIResource[]) {
        var modalData = new EnrichPropertyModalData(title, property, ranges);
        const builder = new BSModalContextBuilder<EnrichPropertyModalData>(
            modalData, undefined, EnrichPropertyModalData
        );
        builder.size("lg").keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(EnrichPropertyModal, overlayConfig).result;
    }

    /**
     * Opens a modal with a custom form to enrich a property with a custom range.
     * @param title title of the dialog
     * @param creId custom range entry ID
     */
    enrichCustomForm(title: string, creId: string) {
        var modalData = new CustomFormModalData(title, creId);
        const builder = new BSModalContextBuilder<CustomFormModalData>(
            modalData, undefined, CustomFormModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(null).toJSON() };
        return this.modal.open(CustomFormModal, overlayConfig).result;
    }

    /**
     * Opens a modal that allows to select a property and add a value to it.
     * Returns and object containing "property" and "value".
     * @param title title of the dialog
     * @param resource resource that is going to enrich with the property-value pair.
     * @param property root property that the modal should allow to enrich
     * @param propChangeable tells whether the input property can be changed exploring the properties subtree.
     *  If false, the button to change property is hidden. Default is true
     */
    addPropertyValue(title: string, resource: ARTResource, property: ARTURIResource, propChangeable?: boolean) {
        var modalData = new AddPropertyValueModalData(title, resource, property, propChangeable);
        const builder = new BSModalContextBuilder<AddPropertyValueModalData>(
            modalData, undefined, AddPropertyValueModalData
        );
        builder.keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(AddPropertyValueModal, overlayConfig).result;
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
        builder.keyboard(null);
        let overlayConfig: OverlayConfig = { context: builder.toJSON() };
        return this.modal.open(DataRangeEditorModal, overlayConfig).result;
    }

}