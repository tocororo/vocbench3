import { Component, Input, SimpleChanges } from "@angular/core";
import { Subscription } from "rxjs";
import { Language } from "../../models/LanguagesCountries";
import { Theme, UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "lang-item",
    templateUrl: "./languageItemComponent.html",
    styles: [`
        :host { display: inline-block }
        .flag-xs { zoom: 100%; }
        .flag-sm { zoom: 130%; }
        .flag-md { zoom: 150%; }
        .flag-lg { zoom: 170%; }
    `]
})
export class LanguageItemComponent {
    @Input() language: Language;
    @Input() showName: boolean = true; //tells whether to show the language name nearby the flag
    @Input() showTag: boolean; //tells whether to show the language tag nearby the flag
    @Input() disabled: boolean;
    @Input() size: "xs" | "sm" | "md" | "lg";

    flagImgSrc: string;
    flagCls: string;

    private unkownFlagBackground: string;

    eventSubscriptions: Subscription[] = [];

    constructor(private preferences: VBProperties, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(eventHandler.showFlagChangedEvent.subscribe(
            (showFlag: boolean) => this.initFlagImgSrc()));
    }

    ngOnInit() {
        if (this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.flagCls = "flag-" + this.size;
        } else {
            this.flagCls = "flag-xs";
        }

        let theme: Theme;
        if (VBContext.getWorkingProjectCtx() != null) {
            let activeThemeId: number = VBContext.getWorkingProjectCtx().getProjectPreferences().projectThemeId;
            theme = UIUtils.themes.find(t => t.id == activeThemeId);
        }
        if (theme == null) {
            theme = UIUtils.themes[0];
        }
        this.unkownFlagBackground = theme.mainColor;
    }

    ngOnChanges(changes: SimpleChanges) {
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



