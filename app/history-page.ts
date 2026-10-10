import { EventData, Page } from '@nativescript/core';
import { HistoryViewModel } from './history-view-model';

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new HistoryViewModel();
}
