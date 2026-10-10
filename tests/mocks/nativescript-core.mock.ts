// Mock for @nativescript/core
import { ApplicationSettings as AppSettingsMock } from './application-settings.mock';

export const ApplicationSettings = AppSettingsMock;

export const knownFolders = {
    documents: () => ({
        path: '/mock/documents',
        getFile: (name: string) => ({
            path: `/mock/documents/${name}`,
            readText: async () => '',
            writeText: async (content: string) => content,
            getFile: (n: string) => ({
                path: `/mock/documents/${n}`,
                readText: async () => '',
                writeText: async (c: string) => c
            })
        })
    }),
    currentApp: () => ({
        path: '/mock/app'
    })
};

export const Frame = {
    topmost: () => ({
        navigate: (options: any) => {},
        goBack: () => {},
        currentPage: null
    })
};

export const Observable = class {
    private _handlers: Record<string, Function[]> = {};

    notifyPropertyChange(propertyName: string, value: any) {
        if (this._handlers[propertyName]) {
            this._handlers[propertyName].forEach(handler => handler(value));
        }
    }

    on(propertyName: string, callback: Function) {
        if (!this._handlers[propertyName]) {
            this._handlers[propertyName] = [];
        }
        this._handlers[propertyName].push(callback);
    }
};

export class EventData {
    object: any;
    constructor(obj: any) {
        this.object = obj;
    }
}

export class Page {
    bindingContext: any;
}
