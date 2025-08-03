import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  :root {
    --font-mono: 'JetBrains Mono', monospace;
    --font-sans: 'Inter', sans-serif;
    
    --color-background: #FFFFFF;
    --color-text: #1A1A1A;
    --color-text-secondary: #666666;
    --color-text-light: #888888;
    --color-border: #E5E5E5;
    --color-hover: #F8F9FA;
    --color-focus: #F1F3F4;
    --color-active: #1A1A1A;
    --color-card-bg: #FFFFFF;
    --color-bg: #FFFFFF;
    --color-bg-secondary: #F8F9FA;
    --color-accent: #1A1A1A;
    --color-error: #DC3545;
    --color-disabled: #F5F5F5;
    --color-focus-border: #1A1A1A;
    
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.08);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
    --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
    
    --radius-sm: 4px;
    --radius-md: 6px;
    --radius-lg: 8px;
    --radius-full: 9999px;
    
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --space-8: 32px;
    --space-10: 40px;
    --space-12: 48px;
    --space-16: 64px;
    
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-md: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;
    
    --transition-fast: 0.1s ease;
    --transition-base: 0.2s ease;
    --transition-slow: 0.3s ease;
  }
  
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html,
  body {
    height: 100%;
    width: 100%;
  }
  
  body {
    font-family: var(--font-sans);
    font-size: var(--font-size-md);
    line-height: 1.5;
    color: var(--color-text);
    background-color: var(--color-background);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  #root {
    height: 100%;
  }
  
  h1, h2, h3, h4, h5, h6 {
    font-weight: 600;
    line-height: 1.25;
    margin-bottom: var(--space-4);
  }
  
  h1 {
    font-size: var(--font-size-3xl);
  }
  
  h2 {
    font-size: var(--font-size-2xl);
  }
  
  h3 {
    font-size: var(--font-size-xl);
  }
  
  h4 {
    font-size: var(--font-size-lg);
  }
  
  h5, h6 {
    font-size: var(--font-size-md);
  }
  
  p {
    margin-bottom: var(--space-4);
  }
  
  a {
    color: var(--color-text);
    text-decoration: underline;
    text-underline-offset: 2px;
    transition: color var(--transition-fast);
    
    &:hover {
      color: var(--color-text-secondary);
    }
  }
  
  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
  }
  
  code, pre {
    font-family: var(--font-mono);
    font-size: var(--font-size-sm);
  }
  
  ul, ol {
    padding-left: var(--space-6);
    margin-bottom: var(--space-4);
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: var(--space-4);
  }
  
  th, td {
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--color-border);
    text-align: left;
  }
  
  th {
    font-weight: 600;
  }
  
  /* Responsive utilities */
  @media (max-width: 768px) {
    .hide-on-mobile {
      display: none !important;
    }
    
    h1 {
      font-size: var(--font-size-2xl);
    }
    
    h2 {
      font-size: var(--font-size-xl);
    }
  }
  
  /* Mobile overlay for sidebar */
  .sidebar-overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 90;
    transition: opacity var(--transition-base);
    opacity: 0;
    backdrop-filter: blur(2px);
    touch-action: none; /* Prevents scrolling on touch devices when overlay is active */
    -webkit-tap-highlight-color: transparent; /* Removes tap highlight on mobile */
  }
  
  @media (max-width: 768px) {
    .sidebar-overlay {
      display: block;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
    
    .sidebar-overlay.active {
      opacity: 1;
      pointer-events: auto;
      animation: fadeIn 0.3s ease forwards;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  /* Hamburger icon styles */
  .hamburger-icon {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 20px;
    height: 16px;
  }
  
  .hamburger-line {
    display: block;
    width: 100%;
    height: 2px;
    background-color: var(--color-text);
    border-radius: 2px;
    transition: transform 0.3s, opacity 0.3s;
  }
  
  .sidebar-open .hamburger-line:nth-child(1) {
    transform: translateY(7px) rotate(45deg);
  }
  
  .sidebar-open .hamburger-line:nth-child(2) {
    opacity: 0;
  }
  
  .sidebar-open .hamburger-line:nth-child(3) {
    transform: translateY(-7px) rotate(-45deg);
  }
`;

export default GlobalStyle;
