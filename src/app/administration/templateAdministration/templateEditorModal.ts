import { Component } from "@angular/core";
import { DialogRef, ModalComponent } from "ngx-modialog";
import { BSModalContext } from 'ngx-modialog/plugins/bootstrap';
import { ConfigurationsServices } from "../../services/configurationsServices";
import { PartitionFilterPreference } from "../../models/Properties";
import { ConfigurationComponents, Reference } from "../../models/Configuration";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";

export class TemplateEditorModalData extends BSModalContext {
    constructor(public title: string = 'Modal Title') {
        super();
    }
}

@Component({
    selector: "template-editor-modal",
    templateUrl: "./templateEditorModal.html",
})
export class TemplateEditorModal implements ModalComponent<TemplateEditorModalData> {
    context: TemplateEditorModalData;

    private templateId: string;

    private filter: PartitionFilterPreference;

    constructor(public dialog: DialogRef<TemplateEditorModalData>, private configurationService: ConfigurationsServices, private basicModals: BasicModalServices) {
        this.context = dialog.context;
    }

    ngOnInit() {}

    ok() {
        let config: { [key: string]: any } = {
            template: this.filter
        }
        this.configurationService.getConfigurationReferences(ConfigurationComponents.TEMPLATE_STORE).subscribe(
            references => {
                if (references.some(r => r.identifier == this.templateId)) { //check if already exists a template with the same ID
                    this.basicModals.alert("Duplicated template", "A template with the ID '" + this.templateId + "' already exists", "warning");
                    return;
                } else {
                    this.configurationService.storeConfiguration(ConfigurationComponents.TEMPLATE_STORE, "sys:" + this.templateId, config).subscribe(
                        () => {
                            this.dialog.close();
                        }
                    );
                }
            }
        );
    }

    cancel() {
        this.dialog.dismiss();
    }
    
}