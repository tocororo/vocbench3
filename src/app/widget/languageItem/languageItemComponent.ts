import { Component, Input, SimpleChanges } from "@angular/core";
import { Subscription } from "rxjs";
import { Language, Languages } from "../../models/LanguagesCountries";
import { UIUtils } from "../../utils/UIUtils";
import { VBContext } from "../../utils/VBContext";
import { VBEventHandler } from "../../utils/VBEventHandler";
import { VBProperties } from "../../utils/VBProperties";

@Component({
    selector: "lang-item",
    templateUrl: "./languageItemComponent.html",
    styleUrls: ["./languageItemComponent.css"],
})
export class LanguageItemComponent {
    @Input() language: Language;
    @Input() showName: boolean = true; //tells whether to show the language name nearby the flag
    @Input() showTag: boolean; //tells whether to show the language tag nearby the flag
    @Input() disabled: boolean;
    @Input() size: "xs" | "sm" | "md" | "lg";

    flagImgSrc: string;
    flagCls: string;

    langTagWidth: number; //compute dynamically the width of the flag in case of no-flag available (or don't diplay flag option)

    private themeId: number;

    eventSubscriptions: Subscription[] = [];

    constructor(private preferences: VBProperties, private eventHandler: VBEventHandler) {
        this.eventSubscriptions.push(this.eventHandler.showFlagChangedEvent.subscribe(
            (showFlag: boolean) => this.initFlagImgSrc()));
        this.eventSubscriptions.push(this.eventHandler.themeChangedEvent.subscribe(
            (theme: number) => this.initTheme()));
    }

    ngOnInit() {
        if (this.size == "sm" || this.size == "md" || this.size == "lg") {
            this.flagCls = "flag-" + this.size;
        } else {
            this.flagCls = "flag-xs";
        }
        this.initTheme();
    }

    private initTheme() {
        if (VBContext.getWorkingProjectCtx() != null) {
            this.themeId = VBContext.getWorkingProjectCtx().getProjectPreferences().projectThemeId;
        } 
        if (this.themeId == null) {
            this.themeId = 0; //default theme
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.initFlagImgSrc();
    }

    ngOnDestroy() {
        this.eventSubscriptions.forEach(s => s.unsubscribe());
    }

    onImgError() {
        this.initFlagImgSrc(true);
    }

    private initFlagImgSrc(error?: boolean) {
        if (this.language.tag == Languages.NO_LANG.tag) {
            this.flagImgSrc = "./assets/images/icons/res/string.png";
        } else {
            if (this.preferences.getShowFlags() && !error) {
                this.flagImgSrc = "./assets/images/flags/flag_" + this.language.tag + ".png";
            } else {
                this.flagImgSrc = UIUtils.getFlagImgSrc(null); //null makes return unknown flag => do not show flag
            }
        }
        this.langTagWidth = this.language.tag ? ((this.language.tag.length * 6) + 2) : 0; //6px for each char + 2px of padding
    }

}



