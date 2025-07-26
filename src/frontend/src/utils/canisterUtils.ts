// Utility functions for canister management

export const getInternetIdentityUrl = (): string => {
  // Check if we're in development mode - simplified check
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('localhost') ||
                       window.location.port === '4943' ||
                       window.location.href.includes('localhost:4943');

  console.log('Environment check:', {
    isDevelopment,
    hostname: window.location.hostname,
    port: window.location.port,
    href: window.location.href
  });

  if (isDevelopment) {
    // For local development, use the local Internet Identity canister with subdomain format
    // This format works better for Chrome and Firefox
    const localUrl = 'http://uzt4z-lp777-77774-qaabq-cai.localhost:4943';
    console.log('Using local Internet Identity:', localUrl);
    return localUrl;
  } else {
    // For production/mainnet, use the mainnet Internet Identity
    const prodUrl = 'https://identity.ic0.app';
    console.log('Using production Internet Identity:', prodUrl);
    return prodUrl;
  }
};

export const getCanisterId = (canisterName: string): string | undefined => {
  // Try to get from window.canisterIds first (for build-time injection)
  if (window.canisterIds && window.canisterIds[canisterName]) {
    return window.canisterIds[canisterName];
  }
  
  return undefined;
};
