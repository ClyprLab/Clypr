import { Buffer } from 'buffer';

// Make Buffer available globally
window.Buffer = Buffer;

// Define global for compatibility
if (typeof window.global === 'undefined') {
  window.global = window as any;
}
