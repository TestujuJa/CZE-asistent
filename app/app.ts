import { Application } from '@nativescript/core';
import './app.css';
import { ThemeService } from './services/theme.service';

// Initialize theme service
const themeService = new ThemeService();

// Apply theme based on saved settings
const settings = themeService.getSettings();
if (settings.mode === 'dark' || (settings.mode === 'system' && themeService.isSystemDarkMode())) {
    document.documentElement?.classList.add('dark');
} else {
    document.documentElement?.classList.remove('dark');
}

// Export theme service for use in other modules
export { themeService };

Application.run({ moduleName: 'app-root' });
