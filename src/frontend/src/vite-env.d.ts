/// <reference types="vite/client" />

// Fix JSX Runtime issues
declare namespace React {
  interface ElementAttributesProperty { props: {} }
}

// Declare modules to prevent TypeScript errors
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const value: string;
  export default value;
}

declare module '*.jpg' {
  const value: string;
  export default value;
}

declare module '*.gif' {
  const value: string;
  export default value;
}

// Fix for runtime errors with dfinity
declare namespace NodeJS {
  interface ProcessEnv {
    readonly NODE_ENV: 'development' | 'production' | 'test';
  }
}

// Allow any props in component types
declare module 'react' {
  interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
  }
}
