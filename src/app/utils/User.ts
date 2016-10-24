export class User {
    private email: string;
    private firstName: string;
    private lastName: string
    private roles: string[];

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

}
