import { Component, ElementRef, Input, SimpleChanges, ViewChild } from "@angular/core";
import { Reference } from "../../models/Configuration";
import { InvokableReporter, ServiceInvocationDefinition } from "../../models/InvokableReporter";
import { SettingsProp } from "../../models/Plugins";
import { InvokableReportersServices } from "../../services/invokableReportersServices";
import { AuthorizationEvaluator } from "../../utils/AuthorizationEvaluator";
import { UIUtils } from "../../utils/UIUtils";
import { VBActionsEnum } from "../../utils/VBActions";
import { BasicModalServices } from "../../widget/modal/basicModal/basicModalServices";
import { InvokableReporterModalServices } from "./modals/invokableReporterModalServices";

@Component({
    selector: "invokable-reporter",
    templateUrl: "./invokableReporterComponent.html",
    host: { class: "vbox" },
    styleUrls: ["../customServices.css"]
})
export class InvokableReporterComponent {
    @Input() ref: Reference;

    @ViewChild('blockingDiv') public blockingDivElement: ElementRef;

    private reporter: InvokableReporter;
    private selectedServiceInvocation: ServiceInvocationDefinition;
    private selectedServiceInvocationIdx: number;

    private reportFormats: ReportFormatStruct[] = [
        { label: "HTML", value: null }, { label: "PDF", value: "application/pdf" }
    ]
    private selectedReportFormat: ReportFormatStruct = this.reportFormats[0];

    private form: InvokableReporterForm;

    private editReporterAuthorized: boolean;
    private createInvocationAuthorized: boolean;
    private deleteInvocationAuthorized: boolean;

    constructor(private invokableReporterService: InvokableReportersServices, private invokableReporterModals: InvokableReporterModalServices,
        private basicModals: BasicModalServices) { }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['ref'] && changes['ref'].currentValue) {
            this.initReporter(false);
        }
    }

    ngOnInit() {
        this.editReporterAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.invokableReporterUpdate);
        this.createInvocationAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.invokableReporterSectionCreate);
        this.deleteInvocationAuthorized = AuthorizationEvaluator.isAuthorized(VBActionsEnum.invokableReporterSectionDelete);
    }

    private initReporter(restoreInvocation: boolean) {
        this.invokableReporterService.getInvokableReporter(this.ref.relativeReference).subscribe(
            (reporter: InvokableReporter) => {
                this.reporter = reporter;
                this.form = {
                    label: this.reporter.getProperty("label"),
                    description: this.reporter.getProperty("description"),
                    sections: this.reporter.getProperty("sections"),
                    template: this.reporter.getProperty("template"),
                    mimeType: this.reporter.getProperty("mimeType")
                }
                if (restoreInvocation) {
                    //try to restore the selected service invocation (if any)
                    if (this.selectedServiceInvocationIdx != null && this.form.sections.value != null && this.form.sections.value.length > this.selectedServiceInvocationIdx) {
                        this.selectedServiceInvocation = this.form.sections.value[this.selectedServiceInvocationIdx];
                    } else {
                        this.selectedServiceInvocation = null;
                    }
                } else {
                    this.selectedServiceInvocation = null;
                    this.selectedServiceInvocationIdx = null;
                }
            }
        );
    }

    private edit() {
        this.invokableReporterModals.openInvokableReporterEditor("Edit Invokable Report", [], this.ref).then(
            () => {
                this.initReporter(true);
            },
            () => {}
        )
    }

    private compileReport() {
        if (this.form.sections.value == null || this.form.sections.value.length == 0) {
            this.basicModals.alert("Compile report", "The reporter cannot be compiled since it has no service invocation provided", "warning");
        } else {
            UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
            this.invokableReporterService.compileReport(this.ref.relativeReference, false).subscribe(
                report => {
                    UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                    this.invokableReporterModals.showReport(report);
                },
                (err: Error) => {
                    this.compilationErrorHandler(err);
                }
            );
        }
    }

    private compileAndDownloadReport() {
        if (this.form.sections.value == null || this.form.sections.value.length == 0) {
            this.basicModals.alert("Download report", "The reporter cannot be compiled since it has no service invocation provided", "warning");
        } else {
            UIUtils.startLoadingDiv(this.blockingDivElement.nativeElement);
            this.invokableReporterService.compileAndDownloadReport(this.ref.relativeReference, this.selectedReportFormat.value).subscribe(
                report => {
                    UIUtils.stopLoadingDiv(this.blockingDivElement.nativeElement);
                    let url = window.URL.createObjectURL(report);
                    window.open(url);
                },
                (err: Error) => {
                    this.compilationErrorHandler(err);
                }
            );
        }
    }

    private compilationErrorHandler(error: Error) {
        if (error.name.endsWith("InvokableReporterException") && error.message.includes("AccessDeniedException")) { //not enough privileges
            this.basicModals.alert("Error", "You have not enough priviledges for invoking one (or more) service invocation performed by this report.", "error", error.message);
        } else { //if not due to access denied show in error modal
            this.basicModals.alert("Error", error.message, "error", error.stack);
        }
    }
    
    private selectServiceInvocation(index: number) {
        if (this.selectedServiceInvocationIdx != index) {
            this.selectedServiceInvocationIdx = index;
            this.selectedServiceInvocation = this.form.sections.value[index];
            //set the reference of the reporter which the invocation belongs to (usefult when editing the service invocation)
            this.selectedServiceInvocation.reporterRef = this.ref;
        }
    }

    private createServiceInvocation() {
        this.invokableReporterModals.openServiceInvocationEditor("Create Service invocation", this.ref).then(
            () => { //operation created => require update
                this.initReporter(true);
            },
            () => { }
        )
    }

    private deleteServiceInvocation() {
        this.invokableReporterService.removeSectionFromReporter(this.ref.relativeReference, this.selectedServiceInvocationIdx).subscribe(
            () => {
                this.initReporter(false)
            }
        )
    }

    private onServiceInvocationUpdate() {
        //a service invocation of the reporter changed => require update
        this.initReporter(true);
    }

}


export class InvokableReporterForm {
    label: InvokableReporterFormEntry<string>;
    description: InvokableReporterFormEntry<string>;
    sections: InvokableReporterFormEntry<ServiceInvocationDefinition[]>;
    template: InvokableReporterFormEntry<string>;
    mimeType: InvokableReporterFormEntry<string>;
}

export class InvokableReporterFormEntry<T> extends SettingsProp {
    value: T;
}

export interface ReportFormatStruct { 
    label: string; 
    value: string;
}