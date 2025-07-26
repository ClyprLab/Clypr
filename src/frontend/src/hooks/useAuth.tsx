import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { getInternetIdentityUrl } from '../utils/canisterUtils';

interface AuthContextType {
  isAuthenticated: boolean;
  principal: Principal | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  authClient: AuthClient | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [principal, setPrincipal] = useState<Principal | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const client = await AuthClient.create();
        setAuthClient(client);

        const isAuthenticated = await client.isAuthenticated();
        setIsAuthenticated(isAuthenticated);

        if (isAuthenticated) {
          const identity = client.getIdentity();
          setPrincipal(identity.getPrincipal());
        }
      } catch (error) {
        console.error('Error initializing auth client:', error);
      }
    };

    initAuth();
  }, []);

  const login = async () => {
    if (!authClient) return;

    await new Promise<void>((resolve) => {
      authClient.login({
        identityProvider: getInternetIdentityUrl(),
        onSuccess: () => {
          const identity = authClient.getIdentity();
          setPrincipal(identity.getPrincipal());
          setIsAuthenticated(true);
          resolve();
        },
        onError: (error) => {
          console.error('Login failed:', error);
          resolve();
        }
      });
    });
  };

  const logout = async () => {
    if (!authClient) return;

    await authClient.logout();
    setPrincipal(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, principal, login, logout, authClient }}>
      {children}
    </AuthContext.Provider>
  );
};
