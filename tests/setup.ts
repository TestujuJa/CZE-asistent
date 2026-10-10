// Jest setup file
// Mock @nativescript/core module
jest.mock('@nativescript/core', () => ({
    ApplicationSettings: require('./mocks/application-settings.mock').ApplicationSettings,
    knownFolders: require('./mocks/nativescript-core.mock').knownFolders,
    Frame: require('./mocks/nativescript-core.mock').Frame,
    Observable: require('./mocks/nativescript-core.mock').Observable,
    EventData: require('./mocks/nativescript-core.mock').EventData,
    Page: require('./mocks/nativescript-core.mock').Page
}));

// Mock fetch for testing
if (!global.fetch) {
    global.fetch = jest.fn();
}

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(() => {
    console.log = jest.fn();
    console.error = jest.fn();
});

afterAll(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
});

// Reset mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});
