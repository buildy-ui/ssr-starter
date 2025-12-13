import 'react';

declare global {
  namespace JSX {
    // Force JSX to use React's element type so third-party globals don't hijack it
    type Element = React.ReactElement<any, any>;
    interface ElementClass extends React.Component<any> {}
    interface ElementAttributesProperty {
      props: {};
    }
  }
}

export {};
