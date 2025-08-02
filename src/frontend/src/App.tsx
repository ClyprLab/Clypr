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
import TestIntegration from './pages/TestIntegration';
import Debug from './pages/Debug';
import SimpleTest from './pages/SimpleTest';
import ServiceTest from './pages/ServiceTest';
import { AuthProvider } from './hooks/useAuth';

const AppContainer = styled.div`
  height: 100%;
`;

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  return (
    <AuthProvider>
      <AppContainer>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/app" element={<Layout />}>
            <Route index or path="/app/dashboard" element={<Dashboard />} />
            <Route path="rules" element={<Rules />} />
            <Route path="messages" element={<Messages />} />
            <Route path="channels" element={<Channels />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="/test" element={<TestIntegration />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="/simple-test" element={<SimpleTest />} />
          <Route path="/service-test" element={<ServiceTest />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppContainer>
    </AuthProvider>
  );
};

export default App;

