import { Component, Input } from "@angular/core";
import { Language } from "../../models/LanguagesCountries";
import { UIUtils } from "../../utils/UIUtils";
import { VBProperties } from "../../utils/VBProperties";

@Component({
	selector: "lang-item",
	templateUrl: "./languageItemComponent.html"
})
export class LanguageItemComponent {
	@Input() language: Language;
	@Input() showTag: boolean;
	@Input() disabled: boolean;

	constructor(private preferences: VBProperties) { }

	private getFlagImgSrc(langTag: string): string {
		if (this.preferences.getShowFlags()) {
			return UIUtils.getFlagImgSrc(langTag);
		} else {
			return UIUtils.getFlagImgSrc(null); //null makes return unknown flag => do not show flag
		}
    }

}



