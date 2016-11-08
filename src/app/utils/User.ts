export class User {
    private email: string;
    private firstName: string;
    private lastName: string
    private roles: string[];
    private birthday: Date;
    private phone: string;
    private gender: string;
    private country: string;
    private address: string;
    private registrationDate: Date;
    private affiliation: string;
    private url: string;

    constructor(email: string, firstName, lastName, roles: string[]) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.roles = roles;
    }

    getEmail(): string {
        return this.email;
    }

    getFirstName(): string {
        return this.firstName;
    }

    getLastName(): string {
        return this.lastName;
    }

    listRoles(): string[] {
        return this.roles;
    }

    hasRole(role: string): boolean {
        return this.roles.includes(role);
    }

    setBirthday(birthday: Date) {
        this.birthday = birthday;
    }

    getBirthday() {
        return this.birthday;
    }

    setPhone(phone: string) {
        this.phone = phone;
    }

    getPhone() {
        return this.phone;
    }

    setGender(gender: string) {
        this.gender = gender;
    }

    getGender() {
        return this.gender;
    }

    setCountry(country: string) {
        this.country = country;
    }

    getCountry() {
        return this.country;
    }

    setAddress(address: string) {
        this.address = address;
    }

    getAddress() {
        return this.address;
    }

    setRegistrationDate(registrationDate: Date) {
        this.registrationDate = registrationDate;
    }

    getRegistrationDate() {
        return this.registrationDate;
    }

    setAffiliation(affiliation: string) {
        this.affiliation = affiliation;
    }

    getAffiliation() {
        return this.affiliation;
    }

    setUrl(url: string) {
        this.url = url;
    }

    getUrl() {
        return this.url;
    }

}
