export class ModalContext {

    /**
     * In order to prevent navigation while a modal is open, CanDeactivateModalGuard has been implemented.
     * This guard block navigation in there is one or more dialog open.
     * ProjectListModal need to change navigation even when it is open, so it uses navigationEnabled to enable temporarily the navigation 
     */
    private static navigationEnabled: boolean = false;
    public static enableNavigation() {
        this.navigationEnabled = true;
    }
    public static disableNavigation() {
        this.navigationEnabled = false;
    }
    public static isNavigationEnabled() {
        return this.navigationEnabled;
    }

}