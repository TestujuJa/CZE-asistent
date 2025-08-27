import { AndroidApplication, Application } from '@nativescript/core';
import { Observable } from '@nativescript/core';
declare var android: any;
declare var java: any;
import { SettingsService } from './settings.service';

export class SpeechRecognitionService extends Observable {
    private speechRecognizer: any;
    private isListening: boolean = false;
    private settingsService: SettingsService;
    private continuousListening: boolean = false;

    constructor() {
        super();
        this.settingsService = new SettingsService();
        this.initializeSpeechRecognizer();
        this.startWakeWordDetection();
    }

    private initializeSpeechRecognizer() {
        if (Application.android) {
            const context = Application.android.context;
            this.speechRecognizer = new android.speech.SpeechRecognizer(context);
            
            const recognitionListener = new android.speech.RecognitionListener({
                onResults: (results: any) => {
                    const matches = results.getStringArrayList(android.speech.SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches && matches.size() > 0) {
                        const recognizedText = matches.get(0);
                        
                        if (this.continuousListening) {
                            // Kontrola wake phrases
                            const settings = this.settingsService.getSettings();
                            const isWakePhrase = settings.wakePhrases.some(phrase => 
                                recognizedText.toLowerCase().includes(phrase.toLowerCase())
                            );

                            if (isWakePhrase) {
                                this.continuousListening = false;
                                this.notify({
                                    eventName: 'wakeWordDetected',
                                    object: this
                                });
                                // Začneme skutečné nahrávání
                                setTimeout(() => this.startListening(), 500);
                            } else {
                                // Pokračujeme v detekci wake word
                                this.startWakeWordDetection();
                            }
                        } else {
                            // Běžné rozpoznávání řeči
                            this.notify({
                                eventName: 'speechResult',
                                object: this,
                                text: recognizedText
                            });
                        }
                    }
                },
                onError: (error: number) => {
                    if (this.continuousListening) {
                        // Při chybě v detekci wake word znovu spustíme poslech
                        setTimeout(() => this.startWakeWordDetection(), 1000);
                    } else {
                        this.notify({
                            eventName: 'speechError',
                            object: this,
                            error: error
                        });
                    }
                },
                onReadyForSpeech: () => {
                    this.notify({
                        eventName: 'readyForSpeech',
                        object: this
                    });
                },
                onEndOfSpeech: () => {
                    this.notify({
                        eventName: 'endOfSpeech',
                        object: this
                    });
                }
            });

            this.speechRecognizer.setRecognitionListener(recognitionListener);
        }
    }

    public startWakeWordDetection() {
        if (Application.android && !this.isListening) {
            const intent = new android.speech.RecognizerIntent();
            intent.putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE, "cs-CZ");
            intent.putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE_MODEL, 
                          android.speech.RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(android.speech.RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            
            this.continuousListening = true;
            this.speechRecognizer.startListening(intent);
            this.isListening = true;
        }
    }

    public startListening() {
        if (Application.android && !this.isListening) {
            const intent = new android.speech.RecognizerIntent();
            intent.putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE, "cs-CZ");
            intent.putExtra(android.speech.RecognizerIntent.EXTRA_LANGUAGE_MODEL, 
                          android.speech.RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            
            this.continuousListening = false;
            this.speechRecognizer.startListening(intent);
            this.isListening = true;
        }
    }

    public stopListening() {
        if (this.isListening) {
            this.speechRecognizer.stopListening();
            this.isListening = false;
            this.continuousListening = false;
        }
    }

    public destroy() {
        if (this.speechRecognizer) {
            this.speechRecognizer.destroy();
        }
    }
}