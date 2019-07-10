import { Component, Input } from "@angular/core";
import { Subscription } from "rxjs";
import { Language } from "../../models/LanguagesCountries";
import { UIUtils } from "../../utils/UIUtils";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "lang-item",
    templateUrl: "./languageItemComponent.html"
})
export class LanguageItemComponent {
    @Input() language: Language;
    @Input() showTag: boolean;
    @Input() disabled: boolean;

    flagImgSrc: string;

    eventSubscriptions: Subscription[] = [];

    constructor(private preferences: VBProperties, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.showFlagChangedEvent.subscribe(
            (showFlag: boolean) => this.initFlagImgSrc()));
    }

    ngOnInit() {
        this.initFlagImgSrc();
    }

    ngOnDestroy() {
        this.eventHandler.unsubscribeAll(this.eventSubscriptions);
    }

    private initFlagImgSrc() {
        if (this.preferences.getShowFlags()) {
            this.flagImgSrc = UIUtils.getFlagImgSrc(this.language.tag);
        } else {
            this.flagImgSrc = UIUtils.getFlagImgSrc(null); //null makes return unknown flag => do not show flag
        }
    }

}



