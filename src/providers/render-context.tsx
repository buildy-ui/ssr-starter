import React from 'react';
import { defaultRenderContext } from '../data/context';
import type { RenderContext } from '../data/types';

const RenderContext = React.createContext<RenderContext>(defaultRenderContext);

export function RenderContextProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value?: RenderContext;
}) {
  return (
    <RenderContext.Provider value={value ?? defaultRenderContext}>
      {children}
    </RenderContext.Provider>
  );
}

export function useRenderContext() {
  const context = React.useContext(RenderContext);
  return { context, loading: false, error: null };
}
