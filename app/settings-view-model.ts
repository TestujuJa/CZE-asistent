import { Observable } from '@nativescript/core';
import { SettingsService, AppSettings } from './services/settings.service';

export class SettingsViewModel extends Observable {
    private settingsService: SettingsService;
    private _currentPhrase: string = '';
    private _wakePhrases: string[] = [];
    private _feedbackEnabled: boolean = true;
    private _sensitivity: number = 0.5;

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
        
        this.notifyPropertyChange('wakePhrases', this._wakePhrases);
        this.notifyPropertyChange('feedbackEnabled', this._feedbackEnabled);
        this.notifyPropertyChange('sensitivity', this._sensitivity);
    }

    get currentPhrase(): string {
        return this._currentPhrase;
    }

    set currentPhrase(value: string) {
        if (this._currentPhrase !== value) {
            this._currentPhrase = value;
            this.notifyPropertyChange('currentPhrase', value);
        }
    }

    get wakePhrases(): string[] {
        return this._wakePhrases;
    }

    get feedbackEnabled(): boolean {
        return this._feedbackEnabled;
    }

    set feedbackEnabled(value: boolean) {
        if (this._feedbackEnabled !== value) {
            this._feedbackEnabled = value;
            this.settingsService.updateFeedback(value);
            this.notifyPropertyChange('feedbackEnabled', value);
        }
    }

    get sensitivity(): number {
        return this._sensitivity;
    }

    set sensitivity(value: number) {
        if (this._sensitivity !== value) {
            this._sensitivity = value;
            this.settingsService.updateSensitivity(value);
            this.notifyPropertyChange('sensitivity', value);
        }
    }

    public addPhrase() {
        if (this._currentPhrase && !this._wakePhrases.includes(this._currentPhrase)) {
            this._wakePhrases.push(this._currentPhrase);
            this.settingsService.updateWakePhrases(this._wakePhrases);
            this.currentPhrase = '';
            this.notifyPropertyChange('wakePhrases', this._wakePhrases);
        }
    }

    public removePhrase(args: any) {
        const index = args.index;
        if (index >= 0 && index < this._wakePhrases.length) {
            this._wakePhrases.splice(index, 1);
            this.settingsService.updateWakePhrases(this._wakePhrases);
            this.notifyPropertyChange('wakePhrases', this._wakePhrases);
        }
    }
}