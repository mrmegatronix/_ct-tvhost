import React, { createContext, useContext, useEffect, useState } from 'react';
import { GlobalState } from '../types';
import { socket } from '../socket';

interface GlobalStateContextType {
  state: GlobalState | null;
  isConnected: boolean;
}

const GlobalStateContext = createContext<GlobalStateContextType>({
  state: null,
  isConnected: false,
});

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalState | null>(null);
  const [isConnected, setIsConnected] = useState(socket.connected);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onStateSync(newState: GlobalState) {
      setState(newState);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('state:sync', onStateSync);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('state:sync', onStateSync);
    };
  }, []);

  return (
    <GlobalStateContext.Provider value={{ state, isConnected }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => useContext(GlobalStateContext);
