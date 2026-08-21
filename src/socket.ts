import { io, Socket } from 'socket.io-client';
import { GlobalState } from './types';

// Connect to the Socket.IO server on the same host but port 3000
// In dev, Vite is on 5173 and Node is on 3000.
// In prod, they might be served from the same port.
const serverUrl = import.meta.env.DEV 
  ? `http://${window.location.hostname}:3000` 
  : window.location.origin;

export const socket: Socket = io(serverUrl);

// Helper function to emit state updates safely
export const updateGlobalState = (updates: Partial<GlobalState>) => {
  socket.emit('state:update', updates);
};
