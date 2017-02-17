import { Component } from "@angular/core";
import { ResourceUtils } from "../utils/ResourceUtils";
import { UnsavedChangesGuard, CanDeactivateOnChangesComponent } from "../utils/CanActivateGuards";
import { PreferencesServices } from "../services/preferencesServices";
import { PropertyLevel, ResourceViewMode } from "../models/Preferences";
import { Languages } from "../models/LanguagesCountries";

@Component({
    selector: "vb-settings-component",
    templateUrl: "./vocbenchSettingsComponent.html",
    host: { class: "pageComponent" }
})
export class VocbenchSettingsComponent implements CanDeactivateOnChangesComponent {

    //TODO when resViewMode change, emit event and refresh the resource view in Data

    private resViewMode: ResourceViewMode;
    private pristineResViewMode: ResourceViewMode;

    private pristineRenderingLangs: { lang: { name: string, tag: string }, checked: boolean }[];
    private renderingLangs: { lang: { name: string, tag: string }, checked: boolean }[];

    constructor(private prefService: PreferencesServices) { }

    ngOnInit() {
        this.prefService.getLanguages(PropertyLevel.USER).subscribe(
            langs => {
                this.renderingLangs = [];
                if (langs.length == 1 && langs[0] == "*") { //"*" stands for all languages
                    //set as selected renderingLangs all the available langs
                    for (var i = 0; i < Languages.languageList.length; i++) {
                        this.renderingLangs.push({ lang: Languages.languageList[i], checked: true });
                    }
                } else {
                    //set as selected renderingLangs only the listed by the preference
                    for (var i = 0; i < Languages.languageList.length; i++) {
                        this.renderingLangs.push({
                            lang: Languages.languageList[i],
                            checked: (langs.indexOf(Languages.languageList[i].tag) != -1)
                        });
                    }
                }
                this.pristineRenderingLangs = JSON.parse(JSON.stringify(this.renderingLangs));
            }
        );
        this.prefService.getResourceViewMode(PropertyLevel.USER).subscribe(
            rvMode => {
                this.resViewMode = rvMode;
                this.pristineResViewMode = rvMode;
            }
        );
    }

    //res view mode handlers

    private isResViewModeChanged(): boolean {
        return this.pristineResViewMode != this.resViewMode;
    }

    //languages handlers

    private changeAllLangStatus(checked: boolean) {
        for (var i = 0; i < this.renderingLangs.length; i++) {
            this.renderingLangs[i].checked = checked;
        }
    }

    private areAllLangDeselected(): boolean {
        if (this.renderingLangs != null) {
            for (var i = 0; i < this.renderingLangs.length; i++) {
                if (this.renderingLangs[i].checked) {
                    return false;
                }
            }
        }
        return true;
    }

    private getFlagImgSrc(langTag: string): string {
        return ResourceUtils.getFlagImgSrc(langTag);
    }

    private isRenderingLanguagesChanged(): boolean {
        for (var i = 0; i < this.renderingLangs.length; i++) {
            if (this.renderingLangs[i].checked != this.pristineRenderingLangs[i].checked) {
                return true;
            }
        }
    }


    private save() {
        if (this.isResViewModeChanged()) {
            this.prefService.setResourceViewMode(this.resViewMode, PropertyLevel.USER).subscribe(
                //update the pristine value
                stResp => { this.pristineResViewMode = this.resViewMode; }
            );
        }
        if (this.isRenderingLanguagesChanged()) {
            //collect the checked languages
            var checkedLangs: string[] = [];
            for (var i = 0; i < this.renderingLangs.length; i++) {
                if (this.renderingLangs[i].checked) {
                    checkedLangs.push(this.renderingLangs[i].lang.tag);
                }
            }
            //no language checked or all languages checked
            if (checkedLangs.length == 0 || checkedLangs.length == Languages.languageList.length) {
                checkedLangs = ["*"];
            }
            this.prefService.setLanguages(checkedLangs, PropertyLevel.USER).subscribe(
                //update the pristine value
                stResp => { this.pristineRenderingLangs = JSON.parse(JSON.stringify(this.renderingLangs)); }
            );
        }
    }

    hasUnsavedChanges(): boolean {
        return (this.isResViewModeChanged() || this.isRenderingLanguagesChanged());
    }

}