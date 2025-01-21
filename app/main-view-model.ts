import { Observable, Frame } from '@nativescript/core';
import { SpeechRecognitionService } from './services/speech-recognition.service';
import { TranslatorService } from './services/translator.service';
import { AssistantService } from './services/assistant.service';
import { PermissionsService } from './services/permissions.service';
import { SettingsService } from './services/settings.service';
import { FeedbackService } from './services/feedback.service';

export class MainViewModel extends Observable {
    private speechService: SpeechRecognitionService;
    private translatorService: TranslatorService;
    private assistantService: AssistantService;
    private permissionsService: PermissionsService;
    private settingsService: SettingsService;
    private feedbackService: FeedbackService;
    
    private _isListening: boolean = false;
    private _status: string = "Kontrola oprávnění...";
    private _recognizedText: string = "";
    private _translatedText: string = "";
    private _hasPermission: boolean = false;

    constructor() {
        super();
        
        this.speechService = new SpeechRecognitionService();
        this.translatorService = new TranslatorService();
        this.assistantService = new AssistantService();
        this.permissionsService = new PermissionsService();
        this.settingsService = new SettingsService();
        this.feedbackService = new FeedbackService();
        
        this.checkPermissions();
        this.setupSpeechRecognition();
    }

    private async checkPermissions() {
        this._hasPermission = await this.permissionsService.checkMicrophonePermission();
        if (!this._hasPermission) {
            this._hasPermission = await this.permissionsService.requestMicrophonePermission();
        }
        
        if (this._hasPermission) {
            this.status = "Čekám na aktivační frázi...";
            this.speechService.startWakeWordDetection();
        } else {
            this.status = "Chybí oprávnění k mikrofonu";
        }
        this.notifyPropertyChange('hasPermission', this._hasPermission);
    }

    private setupSpeechRecognition() {
        this.speechService.on('wakeWordDetected', async () => {
            this.status = "Aktivační fráze rozpoznána!";
            if (this.settingsService.getSettings().feedbackEnabled) {
                await this.feedbackService.playStartSound();
            }
        });

        this.speechService.on('speechResult', async (args: any) => {
            this.recognizedText = args.text;
            this.status = "Překládám...";
            
            if (this.settingsService.getSettings().feedbackEnabled) {
                await this.feedbackService.playStopSound();
            }
            
            // Překlad textu
            const translated = await this.translatorService.translate(args.text);
            this.translatedText = translated;
            
            // Odeslání do Google Asistenta
            this.assistantService.sendToAssistant(translated);
            
            this.status = "Čekám na aktivační frázi...";
            this.isListening = false;
            
            // Obnovení detekce wake word
            setTimeout(() => this.speechService.startWakeWordDetection(), 1000);
        });

        this.speechService.on('speechError', async (args: any) => {
            this.status = "Chyba rozpoznávání řeči";
            this.isListening = false;
            
            if (this.settingsService.getSettings().feedbackEnabled) {
                await this.feedbackService.playErrorSound();
            }
            
            // Obnovení detekce wake word
            setTimeout(() => this.speechService.startWakeWordDetection(), 1000);
        });
    }

    get isListening(): boolean {
        return this._isListening;
    }

    set isListening(value: boolean) {
        if (this._isListening !== value) {
            this._isListening = value;
            this.notifyPropertyChange('isListening', value);
        }
    }

    get status(): string {
        return this._status;
    }

    set status(value: string) {
        if (this._status !== value) {
            this._status = value;
            this.notifyPropertyChange('status', value);
        }
    }

    get recognizedText(): string {
        return this._recognizedText;
    }

    set recognizedText(value: string) {
        if (this._recognizedText !== value) {
            this._recognizedText = value;
            this.notifyPropertyChange('recognizedText', value);
        }
    }

    get translatedText(): string {
        return this._translatedText;
    }

    set translatedText(value: string) {
        if (this._translatedText !== value) {
            this._translatedText = value;
            this.notifyPropertyChange('translatedText', value);
        }
    }

    get hasPermission(): boolean {
        return this._hasPermission;
    }

    public async toggleListening() {
        if (!this._hasPermission) {
            await this.checkPermissions();
            if (!this._hasPermission) {
                return;
            }
        }

        if (this.isListening) {
            this.speechService.stopListening();
            this.status = "Zastaveno";
            if (this.settingsService.getSettings().feedbackEnabled) {
                await this.feedbackService.playStopSound();
            }
        } else {
            this.speechService.startListening();
            this.status = "Poslouchám...";
            if (this.settingsService.getSettings().feedbackEnabled) {
                await this.feedbackService.playStartSound();
            }
        }
        this.isListening = !this.isListening;
    }

    public showSettings() {
        Frame.topmost().navigate({
            moduleName: "settings-page",
            transition: {
                name: "slide"
            }
        });
    }
}