/// <reference types="vite/client" />

// Fix for styled-components
declare module 'styled-components' {
  export interface DefaultTheme {
    [key: string]: any;
  }
  
  export function createGlobalStyle(
    first: TemplateStringsArray | CSSObject,
    ...interpolations: Array<Interpolation<any>>
  ): GlobalStyleComponent<{}, DefaultTheme>;
  
  // Add styled element functions
  export const div: any;
  export const span: any;
  export const aside: any;
  export const header: any;
  export const button: any;
  export const a: any;
  export const nav: any;
  export const ul: any;
  export const li: any;
  export const main: any;
  export const h1: any;
  export const h2: any;
  export const p: any;
  export const footer: any;
  export const input: any;
  export const form: any;
  export const img: any;
  export const article: any;
  export const section: any;
  
  export default {
    div: () => any,
    span: () => any,
    aside: () => any,
    header: () => any,
    button: () => any,
    a: () => any,
    nav: () => any,
    ul: () => any,
    li: () => any,
    main: () => any,
    h1: () => any,
    h2: () => any,
    p: () => any,
    footer: () => any,
    input: () => any,
    form: () => any,
    img: () => any,
    article: () => any,
    section: () => any,
  };
}

// Fix React.FC
declare namespace React {
  interface FunctionComponent<P = {}> {
    (props: P & { children?: React.ReactNode }, context?: any): React.ReactElement<any, any> | null;
  }

  type FC<P = {}> = FunctionComponent<P>;
  
  // Add missing hooks
  function useState<T>(initialValue: T | (() => T)): [T, (value: T | ((prevState: T) => T)) => void];
  function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  function useRef<T>(initialValue: T | null): { current: T };
  function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
  function useMemo<T>(factory: () => T, deps: readonly any[]): T;
  function useReducer<S, A>(reducer: (state: S, action: A) => S, initialState: S): [S, (action: A) => void];
  function useContext<T>(context: React.Context<T>): T;
  function createContext<T>(defaultValue: T): React.Context<T>;
  function memo<T extends React.ComponentType<any>>(component: T): T;
  const Fragment: any;
}

// Fix for file imports
declare module '*.svg' {
  const content: any;
  export default content;
}

declare module '*.png' {
  const content: any;
  export default content;
}

declare module '*.jpg' {
  const content: any;
  export default content;
}
