import type React from 'react';

// Relax JSX typing to React-compatible nodes to avoid foreign JSX namespace conflicts
declare global {
  namespace JSX {
    type Element = React.ReactNode;
    interface ElementChildrenAttribute {
      children: {};
    }
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
