import { NativeScriptConfig } from '@nativescript/core';

export default {
  id: 'org.nativescript.czechvoiceassistant',
  appPath: 'app',
  appResourcesPath: 'App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none'
  },
  cssParser: 'postcss'
} as NativeScriptConfig;