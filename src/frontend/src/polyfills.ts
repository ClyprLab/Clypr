import { Buffer } from 'buffer';

// Make Buffer available globally
(window as any).Buffer = Buffer;

// Define global for compatibility
if (typeof (window as any).global === 'undefined') {
  (window as any).global = window;
}

// Fix process reference that might be used by simple-cbor
if (typeof (window as any).process === 'undefined') {
  (window as any).process = {
    env: {},
    browser: true,
    version: '',
    versions: { node: false }
  };
}

// Fix require for modules like simple-cbor
if (typeof (window as any).require === 'undefined') {
  (window as any).require = function(moduleName: string) {
    if (moduleName === 'buffer') {
      return { Buffer };
    }
    throw new Error(`Module ${moduleName} not found`);
  };
}
