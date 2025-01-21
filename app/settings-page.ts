import { EventData, Page } from '@nativescript/core';
import { SettingsViewModel } from './settings-view-model';

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new SettingsViewModel();
}