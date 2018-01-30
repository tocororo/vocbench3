import { PluginConfiguration } from "./Plugins";

export class CollaborationCtx {

    public static jiraFactoryId: string = "it.uniroma2.art.semanticturkey.plugin.impls.collaboration.JiraBackendFactory";

    /* collaboration system could be enabled and configured (both settings and preferences) but not working:
    * settings or preferences could be invalid (invalid credentials or wrong serverURL), or the server could be unreachable */
    private working: boolean = false;
    private enabled: boolean = false;
    private linked: boolean = false; //if a collaboration project is linked to the VB project
    // private settings: PluginConfiguration;
    private settingsConfigured: boolean = false;
    // private preferences: PluginConfiguration;
    private preferencesConfigured: boolean = false;

    public isSettingsConfigured(): boolean {
        return this.settingsConfigured;
    }
    public setSettingsConfigured(configured: boolean) {
        this.settingsConfigured = configured;
    }

    public isPreferencesConfigured(): boolean {
        return this.preferencesConfigured;
    }
    public setPreferencesConfigured(configured: boolean) {
        this.preferencesConfigured = configured;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }
    public setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    public isWorking(): boolean {
        return this.working;
    }
    public setWorking(working: boolean) {
        this.working = working;
    }

    public isLinked(): boolean {
        return this.linked;
    }
    public setLinked(linked: boolean) {
        this.linked = linked;
    }
    
    // public setSettings(settings: PluginConfiguration) {
    //     this.settings = settings;
    //     if (this.settings != null) {
    //         this.settingsConfigured = !this.settings.requireConfiguration();
    //     }
    // }
    // public getSettings(): PluginConfiguration {
    //     return this.settings;
    // }

    // public setPreferences(preferences: PluginConfiguration) {
    //     this.preferences = preferences;
    //     if (this.preferences != null) {
    //         this.preferencesConfigured = !this.preferences.requireConfiguration();
    //     }
    // }
    // public getPreferences(): PluginConfiguration {
    //     return this.preferences;
    // }

    public reset() {
        this.working = false;
        this.enabled = false;
        this.linked = false;
        // this.settings = null;
        this.settingsConfigured = false;
        // this.preferences = null;
        this.preferencesConfigured = false;
    }
}

export class Issue {
    id: string;
    key: string;
    status: string;
    url: string;
    labels: string[];
    resolution: string;
    category: string;
}