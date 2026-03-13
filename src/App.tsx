import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalStateProvider } from './context/GlobalStateContext';

import MainDisplay from './components/MainDisplay';
import AdminPanel from './components/AdminPanel';
import RemoteControl from './components/RemoteControl';

const App: React.FC = () => {
  return (
    <GlobalStateProvider>
      {/* Use generic hash router or browser router for standard routing */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          {/* Main TV Screen (Is Master, handles auto-advancing slides) */}
          <Route path="/" element={<MainDisplay isMaster={true} />} />
          
          {/* Billboard Screen outside (Synced strictly with Master, no auto-advance locally) */}
          <Route path="/billboard" element={<MainDisplay isMaster={false} />} />
          
          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* Mobile Phone Remote */}
          <Route path="/remote" element={<RemoteControl />} />
        </Routes>
      </BrowserRouter>
    </GlobalStateProvider>
  );
};

export default App;
