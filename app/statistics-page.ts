import { EventData, Page } from '@nativescript/core';
import { StatisticsViewModel } from './statistics-view-model';

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    page.bindingContext = new StatisticsViewModel();
}
