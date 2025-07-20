import { Observable } from '@nativescript/core';
import { SettingsService, Action, ActionType } from './services/settings.service';

export class SettingsViewModel extends Observable {
    private settingsService: SettingsService;

    // Stávající vlastnosti
    private _currentPhrase: string = '';
    private _wakePhrases: string[] = [];
    private _feedbackEnabled: boolean = true;
    private _sensitivity: number = 0.5;

    // Vlastnosti pro akce
    private _actions: Action[] = [];
    private _newActionName: string = '';
    private _newActionPhrase: string = '';
    private _newActionUrl: string = '';
    private _newActionTaskName: string = '';
    private _newActionType: ActionType = 'webhook'; // Výchozí typ

    constructor() {
        super();
        this.settingsService = new SettingsService();
        this.loadSettings();
    }

    private loadSettings() {
        const settings = this.settingsService.getSettings();
        this.wakePhrases = [...settings.wakePhrases];
        this.feedbackEnabled = settings.feedbackEnabled;
        this.sensitivity = settings.sensitivity;
        this.actions = [...settings.actions];
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

    // Gettery a Settery pro akce
    get actions(): Action[] { return this._actions; }
    set actions(value: Action[]) {
        this._actions = value;
        this.notifyPropertyChange('actions', value);
    }

    get newActionName(): string { return this._newActionName; }
    set newActionName(value: string) {
        this._newActionName = value;
        this.notifyPropertyChange('newActionName', value);
    }

    get newActionPhrase(): string { return this._newActionPhrase; }
    set newActionPhrase(value: string) {
        this._newActionPhrase = value;
        this.notifyPropertyChange('newActionPhrase', value);
    }

    get newActionUrl(): string { return this._newActionUrl; }
    set newActionUrl(value: string) {
        this._newActionUrl = value;
        this.notifyPropertyChange('newActionUrl', value);
    }

    get newActionTaskName(): string { return this._newActionTaskName; }
    set newActionTaskName(value: string) {
        this._newActionTaskName = value;
        this.notifyPropertyChange('newActionTaskName', value);
    }

    get newActionType(): ActionType { return this._newActionType; }
    set newActionType(value: ActionType) {
        if (this._newActionType !== value) {
            this._newActionType = value;
            this.notifyPropertyChange('newActionType', value);
        }
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

    public addAction() {
        const isWebhookValid = this.newActionType === 'webhook' && this.newActionUrl;
        const isTaskerValid = this.newActionType === 'tasker' && this.newActionTaskName;

        if (this.newActionName && this.newActionPhrase && (isWebhookValid || isTaskerValid)) {
            const newAction: Action = {
                name: this.newActionName,
                phrase: this.newActionPhrase,
                type: this.newActionType,
                url: this.newActionType === 'webhook' ? this.newActionUrl : undefined,
                taskName: this.newActionType === 'tasker' ? this.newActionTaskName : undefined,
            };
            this.settingsService.addAction(newAction);
            this.actions = [...this.settingsService.getActions()];

            // Vyčistíme formulář
            this.newActionName = '';
            this.newActionPhrase = '';
            this.newActionUrl = '';
            this.newActionTaskName = '';
        }
    }

    public removeAction(args: any) {
        const actionToRemove = args.object.bindingContext;
        const index = this.actions.findIndex(a => a === actionToRemove);
        if (index !== -1) {
            this.settingsService.deleteAction(index);
            this.actions = [...this.settingsService.getActions()];
        }
    }
}