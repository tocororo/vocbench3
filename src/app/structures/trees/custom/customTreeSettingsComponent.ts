import { Component, EventEmitter, forwardRef, Input, Output } from "@angular/core";
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ARTURIResource } from 'src/app/models/ARTResources';
import { Project } from 'src/app/models/Project';
import { CustomTreeRootSelection, CustomTreeSettings } from 'src/app/models/Properties';
import { ResourcesServices } from 'src/app/services/resourcesServices';
import { VBContext } from 'src/app/utils/VBContext';

@Component({
    selector: "custom-tree-settings",
    templateUrl: "./customTreeSettingsComponent.html",
    styles: [":host { display: block; }"],
    providers: [{
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CustomTreeSettingsComponent), multi: true,
    }]
})
export class CustomTreeSettingsComponent {
    @Input() project: Project;
    @Input() context: CustomTreeSettingsCtx = CustomTreeSettingsCtx.data;

    @Output() submit: EventEmitter<void> = new EventEmitter();
    @Output() reset: EventEmitter<void> = new EventEmitter();

    enabled: boolean;
    type: ARTURIResource;
    rootSelection: CustomTreeRootSelection = CustomTreeRootSelection.all;
    roots: ARTURIResource[] = [];
    includeSubtype: boolean;
    property: ARTURIResource;
    includeSubProp: boolean;
    invDirection: boolean = false; //explicitly initialized to false in order to let initialize correctly the selection in the view
        //(otherwise it would be undef and the selector, which has two options true/false, would not show any choices)

    rootSelectionList: { id: CustomTreeRootSelection, labelTranslationKey: string }[] = [
        { id: CustomTreeRootSelection.all, labelTranslationKey: "DATA.CUSTOM_TREE.ROOTS_SELECTION_OPT_ALL" },
        { id: CustomTreeRootSelection.with_child_only, labelTranslationKey: "DATA.CUSTOM_TREE.ROOTS_SELECTION_OPT_W_CHILD_ONLY" },
        { id: CustomTreeRootSelection.enumeration, labelTranslationKey: "DATA.CUSTOM_TREE.ROOTS_SELECTION_OPT_ENUMERATION" },
    ];

    projectAccessed: boolean;

    constructor(private resourceService: ResourcesServices) { }

    ngOnInit() {
        /* if the current settings is shown in
        - Data page or
        - Project settings page for the current accessed project
        allow operation on current project (browsing trees and annotating resources)
        */
        let projCtx = VBContext.getWorkingProjectCtx();
        this.projectAccessed = this.context == CustomTreeSettingsCtx.data || 
            (projCtx != null && this.project != null && projCtx.getProject().getName() == this.project.getName());
    }

    onTypeChanged(type: ARTURIResource) {
        this.type = type;
        this.onChanges();
    }

    onPropertyChanged(prop: ARTURIResource) {
        this.property = prop;
        this.onChanges();
    }

    onRootsChanged(roots: ARTURIResource[]) {
        this.roots = roots;
        this.onChanges();
    }

    onChanges() {
        let ctSettings: CustomTreeSettings = new CustomTreeSettings();
        ctSettings.enabled = this.enabled;
        ctSettings.type = this.type ? this.type.toNT() : null;
        ctSettings.rootSelection = this.rootSelection;
        ctSettings.roots = this.rootSelection == CustomTreeRootSelection.enumeration ? this.roots.map(r => r.toNT()) : null;
        ctSettings.includeSubtype = this.includeSubtype;
        ctSettings.includeSubProp = this.includeSubProp;
        ctSettings.hierarchicalProperty = this.property ? this.property.toNT() : null;
        ctSettings.inverseHierarchyDirection = this.invDirection;
        this.propagateChange(ctSettings);
    }

    doSubmit() {
        this.submit.emit();
    }

    doReset() {
        this.reset.emit();
    }


    //---- method of ControlValueAccessor and Validator interfaces ----
    /**
     * Write a new value to the element.
     */
    writeValue(settings: CustomTreeSettings) {
        if (settings) {
            this.enabled = settings.enabled;
            this.type = settings.type ? new ARTURIResource(settings.type) : null;
            this.rootSelection = settings.rootSelection ? settings.rootSelection : CustomTreeRootSelection.with_child_only;
            this.roots = settings.roots ? settings.roots.map(r => new ARTURIResource(r)) : [];
            this.includeSubtype = settings.includeSubtype;
            this.includeSubProp = settings.includeSubProp;
            this.property = settings.hierarchicalProperty ? new ARTURIResource(settings.hierarchicalProperty) : null;
            this.invDirection = settings.inverseHierarchyDirection == true;

            if (this.projectAccessed && this.roots && this.roots.length > 0) {
                this.resourceService.getResourcesInfo(this.roots).subscribe(
                    annotatedRes => {
                        annotatedRes.forEach(ann => {
                            this.roots.forEach((r, idx, self) => {
                                if (r.equals(ann)) {
                                    self[idx] = <ARTURIResource>ann;
                                }
                            });
                        });
                    }
                );
            }
        }
    }
    /**
     * Set the function to be called when the control receives a change event.
     */
    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }
    /**
     * Set the function to be called when the control receives a touch event. Not used.
     */
    registerOnTouched(fn: any): void { }

    //--------------------------------------------------

    // the method set in registerOnChange, it is just a placeholder for a method that takes one parameter, 
    // we use it to emit changes back to the parent
    private propagateChange = (_: any) => { };


}

/**
 * This component is used in multiple places (Settings of tree/list in Data page, Project Settings in Administration).
 * According the context the component might slightly change
 */
export enum CustomTreeSettingsCtx {
    data = "data",
    administration = "administration",
}