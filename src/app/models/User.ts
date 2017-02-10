export class User {
    private email: string;
    private firstName: string;
    private lastName: string
    // private roles: string[];
    private birthday: Date;
    private phone: string;
    private gender: string;
    private country: string;
    private address: string;
    private registrationDate: Date;
    private affiliation: string;
    private url: string;
    private status: UserStatusEnum;

    constructor(email: string, firstName: string, lastName: string) {
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
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

    // listRoles(): string[] {
    //     return this.roles;
    // }

    // hasRole(role: string): boolean {
    //     return this.roles.includes(role);
    // }

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

    setStatus(status: UserStatusEnum) {
        this.status = status;
    }

    getStatus(): UserStatusEnum {
        return this.status;
    }

}

export class ProjectUserBinding {

    private projectName: string;
    private userEmail: string;
    private roles: string[];

    constructor(projectName: string, userEmail: string, roles?: string[]) {
        this.projectName = projectName;
        this.userEmail = userEmail;
        if (roles != undefined) {
            this.roles = roles;
        } else {
            this.roles = [];
        }
    }

    setProjectName(projectName: string) {
        this.projectName = projectName;
    }

    getProjectName(): string {
        return this.projectName;
    }

    setUserEmail(userEmail: string) {
        this.userEmail = userEmail;
    }

    getUserEmail(): string  {
        return this.userEmail;
    }
    
    setRoles(roles: string[]) {
        this.roles = roles;
    }

    getRoles(): string[] {
        return this.roles;
    }

    addRole(role: string) {
        this.roles.push(role);
    }

    removeRole(role: string) {
        this.roles.splice(this.roles.indexOf(role), 1);
    }
}

export class Role {

    private name: string;
    private capabilities: string[]; //TODO later this should be an array of enum in sync with the UserCapabilitiesEnum in ST

    constructor(name: string, capabilities?: string[]) {
        this.name = name;
        if (capabilities != undefined) {
            this.capabilities = capabilities;
        } else {
            this.capabilities = [];
        }
    }

    public setName(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setCapabilities(capabilities: string[]) {
        this.capabilities = capabilities;
    }

    public getCapabilities(): string[] {
        return this.capabilities;
    }

    public addCapability(capability: string) {
        if (this.capabilities.indexOf(capability) == -1) {
            this.capabilities.push(capability);
        }
    }

    public removeCapability(capability: string) {
        var idx = this.capabilities.indexOf(capability);
        if (idx != -1) {
            this.capabilities.splice(idx, 1);
        }
    }

}

export type UserStatusEnum = "REGISTERED" | "DISABLED" | "ENABLED";

export const UserStatusEnum = {
    REGISTERED: "REGISTERED" as UserStatusEnum,
    DISABLED: "DISABLED" as UserStatusEnum,
    ENABLED: "ENABLED" as UserStatusEnum
}
