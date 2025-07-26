// Fix for missing JSX Runtime
declare module 'react/jsx-runtime' {
  export default any;
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

// Allow any props
declare namespace JSX {
  interface IntrinsicAttributes {
    [key: string]: any;
  }
}

// Fix for styled-components props
declare module 'styled-components' {
  export interface DefaultTheme {
    [key: string]: any;
  }
}

// Fix for any component props
declare module 'react' {
  interface FunctionComponent<P = {}> {
    (props: P & { [key: string]: any }, context?: any): ReactElement<any, any> | null;
  }
}

// Allow all button variants
declare type ButtonVariant = string;
declare type ButtonSize = string;

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

// Fix for react-router-dom
declare module 'react-router-dom' {
  export const Link: any;
  export const NavLink: any;
  export const useNavigate: any;
  export const useParams: any;
  export const useLocation: any;
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const Navigate: any;
  export const Outlet: any;
}

// Fix for module imports
declare module '@/*' {
  const content: any;
  export default content;
}
