/// <reference types="vite/client" />

// Fix for styled-components
declare module 'styled-components' {
  export interface DefaultTheme {
    [key: string]: any;
  }
  
  // Define basic types for styled-components
  export type AnyStyledComponent = any;
  export type StyledComponent<C, T, O, A> = any;
  
  export interface ThemedStyledFunction<E, T, O, A> {
    (strings: TemplateStringsArray, ...interpolations: any[]): any;
    <P extends object>(component: React.ComponentType<P>): any;
  }
  
  export interface StyledInterface {
    div: ThemedStyledFunction<'div', any, {}, never>;
    span: ThemedStyledFunction<'span', any, {}, never>;
    aside: ThemedStyledFunction<'aside', any, {}, never>;
    header: ThemedStyledFunction<'header', any, {}, never>;
    button: ThemedStyledFunction<'button', any, {}, never>;
    a: ThemedStyledFunction<'a', any, {}, never>;
    nav: ThemedStyledFunction<'nav', any, {}, never>;
    ul: ThemedStyledFunction<'ul', any, {}, never>;
    li: ThemedStyledFunction<'li', any, {}, never>;
    main: ThemedStyledFunction<'main', any, {}, never>;
    h1: ThemedStyledFunction<'h1', any, {}, never>;
    h2: ThemedStyledFunction<'h2', any, {}, never>;
    h3: ThemedStyledFunction<'h3', any, {}, never>;
    h4: ThemedStyledFunction<'h4', any, {}, never>;
    h5: ThemedStyledFunction<'h5', any, {}, never>;
    h6: ThemedStyledFunction<'h6', any, {}, never>;
    p: ThemedStyledFunction<'p', any, {}, never>;
    footer: ThemedStyledFunction<'footer', any, {}, never>;
    input: ThemedStyledFunction<'input', any, {}, never>;
    form: ThemedStyledFunction<'form', any, {}, never>;
    img: ThemedStyledFunction<'img', any, {}, never>;
    article: ThemedStyledFunction<'article', any, {}, never>;
    section: ThemedStyledFunction<'section', any, {}, never>;
  }
  
  export function createGlobalStyle(
    strings: TemplateStringsArray,
    ...interpolations: any[]
  ): any;
  
  // Make the default export extend StyledInterface
  const styled: StyledInterface & {
    (tag: any): any;
  };
  
  export default styled;
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
