import { AssistantService } from '../../app/services/assistant.service';
import { SettingsService } from '../../app/services/settings.service';
import { HistoryService } from '../../app/services/history.service';
import { TextToSpeechService } from '../../app/services/text-to-speech.service';
import { Action } from '../../app/services/settings.service';
import { ApplicationSettings } from '@nativescript/core';
import { mockReset } from '../mocks/application-settings.mock';

// Mock fetch for webhook testing
global.fetch = jest.fn();

describe('AssistantService', () => {
    let assistantService: AssistantService;
    let mockSettingsService: any;
    let mockHistoryService: any;
    let mockTaskerService: any;
    let mockTtsService: any;

    beforeEach(() => {
        mockReset();
        
        // Create mock services
        mockSettingsService = {
            getActions: () => [
                { name: 'Light On', phrase: 'rozsviť světlo', type: 'webhook', url: 'https://example.com/light-on' },
                { name: 'Music', phrase: 'pusť hudbu', type: 'tasker', taskName: 'PlayMusic' }
            ]
        };

        mockHistoryService = {
            addCommand: jest.fn()
        };

        mockTaskerService = {
            executeTask: jest.fn(() => true)
        };

        mockTtsService = {
            isEnabled: () => false,
            speak: jest.fn(),
            setEnabled: jest.fn(),
            setLanguage: jest.fn(),
            setPitch: jest.fn(),
            setRate: jest.fn()
        };

        // Override service creation
        assistantService = new AssistantService();
        (assistantService as any).settingsService = mockSettingsService;
        (assistantService as any).historyService = mockHistoryService;
        (assistantService as any).taskerService = mockTaskerService;
        (assistantService as any).ttsService = mockTtsService;
    });

    describe('processCommand', () => {
        it('should return false for no matching action', async () => {
            const result = await assistantService.processCommand('unknown command');
            expect(result).toBe(false);
        });

        it('should execute webhook for matching action', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                statusText: 'OK'
            });

            const result = await assistantService.processCommand('rozsviť světlo');
            expect(result).toBe(true);
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/light-on', { method: 'POST' });
        });

        it('should return false for failed webhook', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                statusText: 'Not Found'
            });

            const result = await assistantService.processCommand('rozsviť světlo');
            expect(result).toBe(false);
        });

        it('should handle network errors', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            const result = await assistantService.processCommand('rozsviť světlo');
            expect(result).toBe(false);
        });

        it('should execute tasker task for matching action', async () => {
            const result = assistantService.processCommand('pusť hudbu');
            expect(result).toBe(true);
            expect(mockTaskerService.executeTask).toHaveBeenCalledWith('PlayMusic');
        });

        it('should add command to history on success', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                statusText: 'OK'
            });

            await assistantService.processCommand('rozsviť světlo');
            expect(mockHistoryService.addCommand).toHaveBeenCalled();
        });

        it('should add command to history on failure', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                statusText: 'Not Found'
            });

            await assistantService.processCommand('rozsviť světlo');
            expect(mockHistoryService.addCommand).toHaveBeenCalled();
        });
    });

    describe('Webhook execution', () => {
        it('should log success for successful webhook', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                statusText: 'OK'
            });

            const result = await assistantService.processCommand('rozsviť světlo');
            expect(result).toBe(true);
        });

        it('should log error for failed webhook', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                statusText: 'Internal Server Error'
            });

            const result = await assistantService.processCommand('rozsviť světlo');
            expect(result).toBe(false);
        });

        it('should log network error for network failure', async () => {
            (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Connection timeout'));

            const result = await assistantService.processCommand('rozsviť světlo');
            expect(result).toBe(false);
        });
    });

    describe('Tasker execution', () => {
        it('should return true for successful tasker execution', () => {
            mockTaskerService.executeTask.mockReturnValueOnce(true);
            const result = assistantService.processCommand('pusť hudbu');
            expect(result).toBe(true);
        });

        it('should return false for failed tasker execution', () => {
            mockTaskerService.executeTask.mockReturnValueOnce(false);
            const result = assistantService.processCommand('pusť hudbu');
            expect(result).toBe(false);
        });

        it('should add command to history for tasker execution', () => {
            assistantService.processCommand('pusť hudbu');
            expect(mockHistoryService.addCommand).toHaveBeenCalled();
        });
    });

    describe('TTS Integration', () => {
        beforeEach(() => {
            mockTtsService.isEnabled = () => true;
        });

        it('should speak on successful command when TTS is enabled', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                statusText: 'OK'
            });

            await assistantService.processCommand('rozsviť světlo');
            expect(mockTtsService.speak).toHaveBeenCalled();
        });

        it('should speak error message on failed command when TTS is enabled', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                statusText: 'Not Found'
            });

            await assistantService.processCommand('rozsviť světlo');
            expect(mockTtsService.speak).toHaveBeenCalled();
        });

        it('should speak on no matching action when TTS is enabled', async () => {
            await assistantService.processCommand('unknown command');
            expect(mockTtsService.speak).toHaveBeenCalled();
        });
    });

    describe('Case insensitivity', () => {
        it('should match commands case insensitively', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                statusText: 'OK'
            });

            const result = await assistantService.processCommand('ROZSVIŤ SVĚTLO');
            expect(result).toBe(true);
        });

        it('should match partial phrases', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                statusText: 'OK'
            });

            const result = await assistantService.processCommand('rozsviť světlo v obýváku');
            expect(result).toBe(true);
        });
    });
});
