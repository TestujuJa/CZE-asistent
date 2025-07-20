import { Observable } from '@nativescript/core';
import { SettingsService, Webhook } from './services/settings.service';

export class SettingsViewModel extends Observable {
    private settingsService: SettingsService;

    // Stávající vlastnosti
    private _currentPhrase: string = '';
    private _wakePhrases: string[] = [];
    private _feedbackEnabled: boolean = true;
    private _sensitivity: number = 0.5;

    // Vlastnosti pro webhooky
    private _webhooks: Webhook[] = [];
    private _newWebhookName: string = '';
    private _newWebhookPhrase: string = '';
    private _newWebhookUrl: string = '';

    constructor() {
        super();
        this.settingsService = new SettingsService();
        this.loadSettings();
    }

    private loadSettings() {
        const settings = this.settingsService.getSettings();
        this._wakePhrases = [...settings.wakePhrases];
        this._feedbackEnabled = settings.feedbackEnabled;
        this._sensitivity = settings.sensitivity;
        this._webhooks = [...settings.webhooks];
        
        this.notifyPropertyChange('wakePhrases', this._wakePhrases);
        this.notifyPropertyChange('feedbackEnabled', this._feedbackEnabled);
        this.notifyPropertyChange('sensitivity', this._sensitivity);
        this.notifyPropertyChange('webhooks', this._webhooks);
    }

    // Gettery a Settery pro stávající vlastnosti
    get currentPhrase(): string { return this._currentPhrase; }
    set currentPhrase(value: string) {
        if (this._currentPhrase !== value) {
            this._currentPhrase = value;
            this.notifyPropertyChange('currentPhrase', value);
        }
    }

    get wakePhrases(): string[] { return this._wakePhrases; }
    set wakePhrases(value: string[]) {
        this._wakePhrases = value;
        this.notifyPropertyChange('wakePhrases', value);
    }

    get feedbackEnabled(): boolean { return this._feedbackEnabled; }
    set feedbackEnabled(value: boolean) {
        if (this._feedbackEnabled !== value) {
            this._feedbackEnabled = value;
            this.settingsService.updateFeedback(value);
            this.notifyPropertyChange('feedbackEnabled', value);
        }
    }

    get sensitivity(): number { return this._sensitivity; }
    set sensitivity(value: number) {
        if (this._sensitivity !== value) {
            this._sensitivity = value;
            this.settingsService.updateSensitivity(value);
            this.notifyPropertyChange('sensitivity', value);
        }
    }

    // Gettery a Settery pro webhooky
    get webhooks(): Webhook[] { return this._webhooks; }
    set webhooks(value: Webhook[]) {
        this._webhooks = value;
        this.notifyPropertyChange('webhooks', value);
    }

    get newWebhookName(): string { return this._newWebhookName; }
    set newWebhookName(value: string) {
        this._newWebhookName = value;
        this.notifyPropertyChange('newWebhookName', value);
    }

    get newWebhookPhrase(): string { return this._newWebhookPhrase; }
    set newWebhookPhrase(value: string) {
        this._newWebhookPhrase = value;
        this.notifyPropertyChange('newWebhookPhrase', value);
    }

    get newWebhookUrl(): string { return this._newWebhookUrl; }
    set newWebhookUrl(value: string) {
        this._newWebhookUrl = value;
        this.notifyPropertyChange('newWebhookUrl', value);
    }

    // Metody pro správu
    public addPhrase() {
        if (this.currentPhrase && !this.wakePhrases.includes(this.currentPhrase)) {
            const updatedPhrases = [...this.wakePhrases, this.currentPhrase];
            this.settingsService.updateWakePhrases(updatedPhrases);
            this.wakePhrases = updatedPhrases;
            this.currentPhrase = '';
        }
    }

    public removePhrase(args: any) {
        const phraseToRemove = args.object.bindingContext;
        const updatedPhrases = this.wakePhrases.filter(p => p !== phraseToRemove);
        this.settingsService.updateWakePhrases(updatedPhrases);
        this.wakePhrases = updatedPhrases;
    }

    public addWebhook() {
        if (this.newWebhookName && this.newWebhookPhrase && this.newWebhookUrl) {
            const newWebhook: Webhook = {
                name: this.newWebhookName,
                phrase: this.newWebhookPhrase,
                url: this.newWebhookUrl
            };
            this.settingsService.addWebhook(newWebhook);
            this.webhooks = [...this.settingsService.getWebhooks()]; // Znovu načteme

            // Vyčistíme formulář
            this.newWebhookName = '';
            this.newWebhookPhrase = '';
            this.newWebhookUrl = '';
        }
    }

    public removeWebhook(args: any) {
        const webhookToRemove = args.object.bindingContext;
        const index = this.webhooks.findIndex(wh => wh === webhookToRemove);
        if (index !== -1) {
            this.settingsService.deleteWebhook(index);
            this.webhooks = [...this.settingsService.getWebhooks()]; // Znovu načteme
        }
    }
}