import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import Rules from './pages/Rules';
import Messages from './pages/Messages';
import Channels from './pages/Channels';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Landing from './pages/Landing';
import NotFound from './pages/NotFound';
import Test from './pages/Test';
import Demo from './pages/Demo';
import { AuthProvider } from './hooks/useAuth';
import ClaimAlias from './pages/ClaimAlias';

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-neutral-950 text-neutral-100">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/claim-alias" element={<ClaimAlias />} />
          <Route path="/demo" element={<Demo />} />
          
          <Route path="/app" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rules" element={<Rules />} />
            <Route path="messages" element={<Messages />} />
            <Route path="channels" element={<Channels />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          
          <Route path="/test" element={<Test />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;

