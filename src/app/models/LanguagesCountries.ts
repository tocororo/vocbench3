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
    
    static languageList: {name: string, tag: string}[] = [
        { name: "Arabic", tag: "ar" },
        { name: "Bulgarian", tag: "bg" },
        { name: "Czech", tag: "cs" },
        { name: "Danish", tag: "da" },
        { name: "German", tag: "de" },
        { name: "Greek", tag: "el" },
        { name: "English", tag: "en" },
        { name: "English American", tag: "en-US" },
        { name: "English British", tag: "en-GB" },
        { name: "Spanish", tag: "es" },
        { name: "Estonian", tag: "et" },
        { name: "Persian", tag: "fa" },
        { name: "Finnish", tag: "fi" },
        { name: "French", tag: "fr" },
        { name: "Irish", tag: "ga" },
        { name: "Hindi", tag: "hi" },
        { name: "Croatian", tag: "hr" },
        { name: "Hungarian", tag: "hu" },
        { name: "Indonesian", tag: "id" },
        { name: "Italian", tag: "it" },
        { name: "Japanese", tag: "ja" },
        { name: "Georgian", tag: "ka" },
        { name: "Khmer", tag: "km" },
        { name: "Korean", tag: "ko" },
        { name: "Lithuanian", tag: "lt" },
        { name: "Lao", tag: "lo" },
        { name: "Latvian", tag: "lv" },
        { name: "Macedonian", tag: "mk" },
        { name: "Moldavian", tag: "mo" },
        { name: "Maltese", tag: "mt" },
        { name: "Dutch", tag: "nl" },
        { name: "Norwegian", tag: "no" },
        { name: "Polish", tag: "pl" },
        { name: "Portuguese", tag: "pt" },
        { name: "Romanian", tag: "ro" },
        { name: "Russian", tag: "ru" },
        { name: "Slovak", tag: "sk" },
        { name: "Slovenian", tag: "sl" },
        { name: "Albanian", tag: "sq" },
        { name: "Serbain", tag: "sr" },
        { name: "Svedish", tag: "sv" },
        { name: "Thai", tag: "th" },
        { name: "Turkish", tag: "tr" },
        { name: "Ukrainian", tag: "uk" },
        { name: "Vietnamese", tag: "vi" },
        { name: "Chinese", tag: "zh" }
    ];

    static getLanguageTagList(): string[] {
        var langTags: string[] = [];
        for (var i = 0; i < Languages.languageList.length; i++) {
            langTags.push(Languages.languageList[i].tag);
        }
        return langTags;
    }
    
}