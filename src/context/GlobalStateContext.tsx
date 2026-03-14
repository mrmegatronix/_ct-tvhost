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

export const DEFAULT_STATE: GlobalState = {
  mode: 'slides',
  currentSlideIndex: 0,
  isPlaying: true,
  slides: [
    {
      id: 'default-1',
      title: 'Welcome to Coasters',
      description: 'The TV Host application is loading...',
      highlightColor: '#f59e0b',
      type: 'promo',
      disabled: false,
      duration: 5000
    }
  ],
  raffleSettings: {
    rangeStart: 1,
    rangeEnd: 200,
    drawCount: 1,
    drawnNumbers: [],
    winnerExclusions: [],
    monsterRaffleStartDay: 'Thursday',
    monsterRaffleStartTime: '19:00',
    prizePool: 0,
    eposTakings: 0,
    cashTakings: 0
  },
  loserSettings: {
    drawCount: 2,
    drawnNumbers: []
  },
  schedules: []
};

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GlobalState>(DEFAULT_STATE);
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
