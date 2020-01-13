import { Component } from "@angular/core";
import { OverlayConfig } from "ngx-modialog";
import { BSModalContextBuilder, Modal } from "ngx-modialog/plugins/bootstrap";
import { ConfigurationComponents } from "../../models/Configuration";
import { SettingsProp } from "../../models/Plugins";
import { PartitionFilterPreference } from "../../models/Properties";
import { ConfigurationsServices } from "../../services/configurationsServices";
import { TemplateEditorModal, TemplateEditorModalData } from "./templateEditorModal";

@Component({
    selector: "templates-admin-component",
    templateUrl: "./templatesAdministrationComponent.html",
    host: { class: "pageComponent" }
})
export class TemplatesAdministrationComponent {

    private templates: TemplateEntry[];
    private selectedTemplate: TemplateEntry;

    private selectedTemplateFilter: PartitionFilterPreference;

    constructor(private configurationService: ConfigurationsServices, private modal: Modal) { }

    ngOnInit() {
        this.initTemplates();
    }

    private initTemplates() {
        this.configurationService.getConfigurationReferences(ConfigurationComponents.TEMPLATE_STORE).subscribe(
            references => {
                this.templates = [];
                references.forEach(r => {
                    this.templates.push({
                        reference: r.relativeReference,
                        id: r.relativeReference.substring(r.relativeReference.indexOf(":")+1)
                    })
                })
            }
        )
    }

    private selectTemplate(template: TemplateEntry) {
        if (this.selectedTemplate != template) {
            this.selectedTemplate = template;
            this.configurationService.getConfiguration(ConfigurationComponents.TEMPLATE_STORE, this.selectedTemplate.reference).subscribe(
                conf => {
                    let templateProp: SettingsProp = conf.properties.find(p => p.name == "template");
                    if (templateProp != null) {
                        this.selectedTemplateFilter = templateProp.value;
                    }
                }
            );
        }
    }

    private createTemplate() {
        this.openTemplateEditor("Create template").then(
            () => {
                this.initTemplates();
            },
            () => {}
        );
    }

    private updateTemplate() {
        let config: { [key: string]: any } = {
            template: this.selectedTemplateFilter
        }
        this.configurationService.storeConfiguration(ConfigurationComponents.TEMPLATE_STORE, this.selectedTemplate.reference, config).subscribe();
    }

    private deleteTemplate() {
        this.configurationService.deleteConfiguration(ConfigurationComponents.TEMPLATE_STORE, this.selectedTemplate.reference).subscribe(
            () => {
                this.initTemplates();
            }
        );
    }

    private openTemplateEditor(title: string) {
        var modalData = new TemplateEditorModalData(title);
        const builder = new BSModalContextBuilder<TemplateEditorModalData>(
            modalData, undefined, TemplateEditorModalData
        );
        let overlayConfig: OverlayConfig = { context: builder.keyboard(27).toJSON() };
        return this.modal.open(TemplateEditorModal, overlayConfig).result;
    }

}


class TemplateEntry {
    reference: string;
    id: string;
}