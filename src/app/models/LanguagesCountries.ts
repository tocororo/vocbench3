export class Countries {
    
    static countryList = ["Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla",
        "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas",
        "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia",
        "Bosnia and Herzegovina", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Territory", "Brunei Darussalam",
        "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands",
        "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros",
        "Congo", "Congo, the Democratic Republic of the", "Cook Islands", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
        "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea",
        "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana",
        "French Polynesia", "French Southern Territories", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece",
        "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti",
        "Heard Island and McDonald Islands", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iraq", "Ireland",
        "Islamic Republic of Iran", "Isle of Man", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan",
        "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Lao", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya",
        "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
        "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of",
        "Moldova", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
        "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea",
        "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territory, Occupied", "Panama", "Papua New Guinea",
        "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "Réunion", "Romania",
        "Russian Federation", "Rwanda", "Saint Helena", "Saint Kitts and Nevis", "Saint Lucia", "Saint Pierre and Miquelon",
        "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
        "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
        "South Africa", "South Georgia and the South Sandwich Islands", "South Korea", "Spain", "Sri Lanka", "Sudan", "Suriname",
        "Svalbard and Jan Mayen", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan", "Tajikistan", "Tanzania",
        "Thailand", "Timor-Leste", "Togo", "Tokelau", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan",
        "Turks and Caicos Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
        "United States Minor Outlying Islands", "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City State",
        "Venezuela", "Viet Nam", "Virgin Islands British", "Virgin Islands U.S.", "Wallis and Futuna", "Western Sahara", "Yemen",
        "Zambia", "Zimbabwe"];
    
}

export class Languages {

    private static systemLanguages: Language[];
    static priorityLangs = ["en", "fr", "it", "es", "de"];
    
    static setSystemLanguages(langs: Language[]) {
        this.systemLanguages = langs;
    }

    static getSystemLanguages(): Language[] {
        return this.systemLanguages;
    }

    static sortLanguages(languages: Language[]) {
        languages.sort(
            function (l1: Language, l2: Language) {
                if (l1.tag > l2.tag) return 1;
                if (l1.tag < l2.tag) return -1;
                return 0;
            }
        );
    }

    static containsLanguage(languages: Language[], lang: Language): boolean {
        for (var i = 0; i < languages.length; i++) {
            if (languages[i].tag == lang.tag) {
                return true;
            }
        }
        return false;
    }

    /**
     * If the given language tag (lang) is a locale, returns the other locales and the "main" language (e.g. en-GB -> [en, en-US]).
     * Otherwise, if the given tag is a language, returns all the locales (e.g. en -> [en-GB, en-US])
     * @param languages 
     * @param lang 
     */
    static getLocales(languages: Language[], lang: string): Language[] {
        let locales: Language[] = [];
        let localePrefix: string = lang;
        if (lang.indexOf("-") != -1) { //lang is a locale
            localePrefix = lang.substring(0, lang.indexOf("-"));
        }
        languages.forEach(l => {
            if (l.tag.startsWith(localePrefix) && l.tag != lang) {
                locales.push(l);
            }
        });
        return locales;
    }

    static indexOf(languages: Language[], lang: Language): number {
        for (var i = 0; i < languages.length; i++) {
            if (languages[i].tag == lang.tag) {
                return i;
            }
        }
        return -1;
    }

    static fromTagsToLanguages(tags: string[]): Language[] {
        let languages: Language[] = [];
        for (var i = 0; i < tags.length; i++) {
            let lang: Language = Languages.getLanguageFromTag(tags[i]);
            if (lang != null) {
                languages.push(lang)
            }
        }
        return languages;
    }

    static fromLanguagesToTags(languages: Language[]) {
        let tags: string[] = [];
        for (var i = 0; i < languages.length; i++) {
            tags.push(languages[i].tag);
        }
        return tags;
    }

    static getLanguageFromTag(tag: string): Language {
        for (var i = 0; i < Languages.systemLanguages.length; i++) {
            if (Languages.systemLanguages[i].tag == tag) {
                return Languages.systemLanguages[i];
            }
        }
    }

}

export class Language {
    public name: string;
    public tag: string;
    public mandatory?: boolean;
}

/**
 * Class useful to customize the language selection in the lang-picker
 */
export class LanguageConstraint {
    public constrain: boolean; //if true, constrain the selection of a language only to a given language
    public locale: boolean; //if true, allow the selection of also the locale of a given language
}