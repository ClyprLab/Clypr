import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import styled from 'styled-components';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Rules from './pages/Rules';
import Messages from './pages/Messages';
import Channels from './pages/Channels';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import { AuthProvider } from './hooks/useAuth';

const AppContainer = styled.div`
  height: 100%;
`;

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  return (
    <AuthProvider>
      <AppContainer>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="rules" element={<Rules />} />
            <Route path="messages" element={<Messages />} />
            <Route path="channels" element={<Channels />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppContainer>
    </AuthProvider>
  );
};

export default App;
