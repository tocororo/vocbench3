import { ARTURIResource } from "./ARTResources";

export class User {
    private email: string;
    private givenName: string;
    private familyName: string
    private iri: string;
    private birthday: Date;
    private phone: string;
    private gender: string;
    private country: string;
    private address: string;
    private registrationDate: Date;
    private affiliation: string;
    private url: string;
    private avatarUrl: string;
    private languageProficiencies: string[];
    private status: UserStatusEnum;
    private admin: boolean = false;
    private online: boolean = false;

    constructor(email: string, givenName: string, familyName: string, iri: string) {
        this.email = email;
        this.givenName = givenName;
        this.familyName = familyName;
        this.iri = iri;
    }

    getEmail(): string {
        return this.email;
    }

    getGivenName(): string {
        return this.givenName;
    }

    getFamilyName(): string {
        return this.familyName;
    }

    getIri(): string {
        return this.iri;
    }

    setBirthday(birthday: Date) {
        this.birthday = birthday;
    }

    getBirthday(): Date {
        return this.birthday;
    }

    setPhone(phone: string) {
        this.phone = phone;
    }

    getPhone(): string {
        return this.phone;
    }

    setGender(gender: string) {
        this.gender = gender;
    }

    getGender(): string {
        return this.gender;
    }

    setCountry(country: string) {
        this.country = country;
    }

    getCountry(): string {
        return this.country;
    }

    setAddress(address: string) {
        this.address = address;
    }

    getAddress(): string {
        return this.address;
    }

    setRegistrationDate(registrationDate: Date) {
        this.registrationDate = registrationDate;
    }

    getRegistrationDate(): Date {
        return this.registrationDate;
    }

    setAffiliation(affiliation: string) {
        this.affiliation = affiliation;
    }

    getAffiliation(): string {
        return this.affiliation;
    }

    setUrl(url: string) {
        this.url = url;
    }

    getUrl(): string {
        return this.url;
    }

    setAvatarUrl(avatarUrl: string) {
        this.avatarUrl = avatarUrl;
    }

    getAvatarUrl(): string {
        return this.avatarUrl;
    }

    setLanguageProficiencies(languageProficiencies: string[]) {
        this.languageProficiencies = languageProficiencies;
    }

    getLanguageProficiencies(): string[] {
        return this.languageProficiencies;
    }

    setStatus(status: UserStatusEnum) {
        this.status = status;
    }

    getStatus(): UserStatusEnum {
        return this.status;
    }

    setAdmin(admin: boolean) {
        this.admin = admin;
    }

    isAdmin(): boolean {
        return this.admin;
    }

    setOnline(online: boolean) {
        this.online = online;
    }

    isOnline(): boolean {
        return this.online;
    }
}

export class ProjectUserBinding {

    private projectName: string;
    private userEmail: string;
    private roles: string[] = [];
    private group: UsersGroup;
    private groupLimitations: boolean;
    private languages: string[] = [];

    constructor(projectName: string, userEmail: string, roles?: string[], group?: UsersGroup, groupLimitations?: boolean, languages?: string[]) {
        this.projectName = projectName;
        this.userEmail = userEmail;
        if (roles != undefined) {
            this.roles = roles;
        }
        this.group = group;
        this.groupLimitations = groupLimitations;
        if (languages != undefined) {
            this.languages = languages
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

    setGroup(group: UsersGroup) {
        this.group = group;
    }

    getGroup(): UsersGroup {
        return this.group;
    }

    removeGroup() {
        this.group = null;
    }

    setGroupLimitations(limitations: boolean) {
        this.groupLimitations = limitations
    }

    isSubjectToGroupLimitations(): boolean {
        return this.groupLimitations;
    }

    setLanguages(languages: string[]) {
        this.languages = languages;
    }

    getLanguages(): string[] {
        return this.languages;
    }

    addLanguage(language: string) {
        this.languages.push(language);
    }

    removeLanguage(language: string) {
        this.languages.splice(this.languages.indexOf(language), 1);
    }
}

export class Role {

    private name: string;
    private level: RoleLevel;

    constructor(name: string, level: RoleLevel) {
        this.name = name;
        this.level = level;
    }

    public setName(name: string) {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setLevel(level: RoleLevel) {
        this.level = level;
    }

    public getLevel(): RoleLevel {
        return this.level;
    }

}

export class UsersGroup {
    public shortName: string;
    public fullName: string;
    public description: string;
    public webPage: string;
    public logoUrl: string;
    public iri: ARTURIResource;

    private static iriRegexp = new RegExp("\\b(https?|ftp|file)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]");

    constructor(iri: ARTURIResource, shortName: string, fullName?: string, description?: string, webPage?: string, logoUrl?: string) {
        this.iri = iri;
        this.shortName = shortName;
        this.fullName = fullName;
        this.description = description;
        this.webPage = webPage;
        this.logoUrl = logoUrl;
    }

    public static deserialize(usersGroupJson: any): UsersGroup {
        return new UsersGroup(new ARTURIResource(usersGroupJson.iri), usersGroupJson.shortName, usersGroupJson.fullName, 
            usersGroupJson.description, usersGroupJson.webPage, usersGroupJson.logoUrl);
    }

    public static isIriValid(iri: string) {
        return UsersGroup.iriRegexp.test(iri);
    }
}

export class ProjectGroupBinding {
    public projectName: string;
    public groupIri: string;
    public ownedSchemes: string[];
}

export enum UserStatusEnum {
    NEW = "NEW",
    INACTIVE = "INACTIVE",
    ACTIVE = "ACTIVE"
}

export enum RoleLevel {
    system = "system",
    project = "project"
}

export class UserForm {

    email: string;
    username: string;
    password: string;
    confirmedPassword: string;
    givenName: string;
    familyName: string;
    birthday: Date;
    gender: string;
    country: string;
    address: string;
    phone: string;
    affiliation: string;
    url: string;
    avatarUrl: string;
    iri: string;
    urlAsIri: boolean;
    languageProficiencies: string[];

    static emailRegexp = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    static iriRegexp = new RegExp("\\b(https?|ftp|file)://[-a-zA-Z0-9+&@#/%?=~_|!:,.;]*[-a-zA-Z0-9+&@#/%=~_|]");

    constructor() { }

    static isValidEmail(email: string) {
        return UserForm.emailRegexp.test(email);
    }

    static isIriValid(iri: string) {
        return UserForm.iriRegexp.test(iri);
    }
}
