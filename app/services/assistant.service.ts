import { Application } from '@nativescript/core';

export class AssistantService {
    public sendToAssistant(command: string) {
        if (Application.android) {
            const context = Application.android.context;
            const intent = new android.content.Intent(android.service.voice.VoiceInteractionService.SERVICE_INTERFACE);
            
            intent.putExtra(android.app.SearchManager.QUERY, command);
            
            context.startActivity(intent);
        }
    }
}