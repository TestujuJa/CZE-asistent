// Mock for @nativescript/core ApplicationSettings
const mockStorage: Record<string, string> = {};

export const ApplicationSettings = {
    getString: (key: string): string | undefined => {
        return mockStorage[key];
    },
    setString: (key: string, value: string): void => {
        mockStorage[key] = value;
    },
    remove: (key: string): void => {
        delete mockStorage[key];
    },
    getBoolean: (key: string): boolean | undefined => {
        const value = mockStorage[key];
        return value ? value.toLowerCase() === 'true' : undefined;
    },
    setBoolean: (key: string, value: boolean): void => {
        mockStorage[key] = value.toString();
    },
    getNumber: (key: string): number | undefined => {
        const value = mockStorage[key];
        return value ? parseFloat(value) : undefined;
    },
    setNumber: (key: string, value: number): void => {
        mockStorage[key] = value.toString();
    },
    clear: (): void => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    },
    allKeys: (): string[] => {
        return Object.keys(mockStorage);
    }
};

export const mockReset = (): void => {
    Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
};
