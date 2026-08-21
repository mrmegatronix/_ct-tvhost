import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { GlobalStateProvider } from './context/GlobalStateContext';

import MainDisplay from './components/MainDisplay';
import AdminPanel from './components/AdminPanel';
import RemoteControl from './components/RemoteControl';

const App: React.FC = () => {
  return (
    <GlobalStateProvider>
      {/* Use HashRouter for GitHub Pages to support routing without extra configuration */}
      <HashRouter>
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
      </HashRouter>
    </GlobalStateProvider>
  );
};

export default App;
