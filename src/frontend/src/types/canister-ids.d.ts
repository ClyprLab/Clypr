interface Window {
  canisterIds?: {
    backend: string;
    frontend: string;
    [key: string]: string;
  };
}

declare namespace NodeJS {
  interface ProcessEnv {
    CLYPR_CANISTER_ID?: string;
  }
}
