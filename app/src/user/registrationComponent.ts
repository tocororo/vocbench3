import {Component} from "@angular/core";
import {ModalServices} from "../widget/modal/modalServices";

@Component({
    selector: "registration-component",
    templateUrl: "app/src/user/registrationComponent.html",
    host: { class : "pageComponent" }
})
export class RegistrationComponent {
    
    private countries = ["Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla",
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
        "Islamic Republic ofIran", "Isle of Man", "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jersey", "Jordan", "Kazakhstan",
        "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Lao", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya",
        "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali",
        "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "Mexico", "Micronesia, Federated States of",
        "Moldova", "Monaco", "Mongolia", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
        "Netherlands Antilles", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "North Korea",
        "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territory, Occupied", "Panama", "Papua New Guinea",
        "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Puerto Rico", "Qatar", "R?union", "Romania",
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
       
    private genders = ["Male", "Female"]; 
    
    private submitted: boolean = false;
        
    private email: string;
    private username: string;
    private password: string;
    private confirmedPassword: string;
    private firstName: string;
    private lastName: string;
    private birthday: Date;
    private gender: string;
    private country: string;
    private address: string;
    private affiliation: string;
    private url: string;
    private phone: string;
    
    private EMAIL_PATTERN = "[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$";
    
    constructor(private modalService: ModalServices) {}
    
    private isConfirmPwdOk(): boolean {
        return this.password == this.confirmedPassword;
    }
    
    private submit() {
        this.submitted = true;
        if (this.email && this.email.trim() != "" && new RegExp(this.EMAIL_PATTERN).test(this.email) &&
            this.username && this.username.trim() != "" && this.password && this.password.trim() != "" && this.isConfirmPwdOk() &&
            this.firstName && this.firstName.trim() != "" && this.lastName && this.lastName.trim() != "") {
            //call service
            console.log("email:", this.email, "\nusername", this.username, "\npassword", this.password, 
                "\nfirstName:", this.firstName, "\nlastName:", this.lastName, "\nbirthday:", this.birthday,
                "\ngender:", this.gender, "\ncountry:", this.country, "\naddress:", this.address,
                "\naffiliation:", this.affiliation, "\nurl:", this.url, "\nphone:", this.phone);
        } else {
            this.modalService.alert("Registration error", "Please, check the inserted data.", "warning");
        }
    }
    
    
}