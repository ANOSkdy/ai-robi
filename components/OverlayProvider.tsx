'use client';
import React, { createContext, useContext, useState } from 'react';
import LoadingOverlay from './LoadingOverlay';

type Ctx = { show: (text?: string) => void; hide: () => void };
const OverlayCtx = createContext<Ctx>({ show: () => {}, hide: () => {} });

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ show: boolean; text?: string }>({ show: false, text: '' });
  const api = {
    show: (text?: string) => setState({ show: true, text }),
    hide: () => setState({ show: false, text: '' }),
  };
  return (
    <OverlayCtx.Provider value={api}>
      <LoadingOverlay show={state.show} text={state.text} />
      {children}
    </OverlayCtx.Provider>
  );
}

export const useOverlay = () => useContext(OverlayCtx);

