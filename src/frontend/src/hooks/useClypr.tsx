import { useEffect, useState } from 'react';
import { Principal } from '@dfinity/principal';
import ClyprService, { Rule, Channel, Message, Stats } from '../services/ClyprService';
import { useAuth } from './useAuth';

// Default canister ID - should be configured from environment
const CANISTER_ID = process.env.CLYPR_CANISTER_ID || 'your-canister-id-here';

export function useClypr() {
  const { isAuthenticated, principal, authClient } = useAuth();
  const [service, setService] = useState<ClyprService | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the service when authentication state changes
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        
        if (isAuthenticated && authClient) {
          const identity = authClient.getIdentity();
          const clyprService = await ClyprService.create(identity);
          setService(clyprService);
          
          // Check if user is the canister owner
          try {
            const owner = await clyprService.getOwner();
            const isCurrentOwner = principal?.toText() === owner.toText();
            
            // If there's no owner set (anonymous) or user is already owner
            if (owner.toText() === '2vxsx-fae' || isCurrentOwner) {
              // Set current user as owner
              if (!isCurrentOwner && principal) {
                console.log('Setting user as canister owner...');
                await clyprService.setOwner(principal);
              }
              setIsOwner(true);
            } else {
              setIsOwner(isCurrentOwner);
            }
          } catch (err) {
            console.error("Failed to check owner status", err);
          }
        } else {
          // Initialize with anonymous client
          const clyprService = await ClyprService.create();
          setService(clyprService);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Failed to initialize Clypr service", err);
        setError("Failed to initialize: " + String(err));
        setLoading(false);
      }
    };
    
    init();
  }, [isAuthenticated, authClient, principal]);
  
  // Authentication state is handled by useAuth hook
  const login = async (): Promise<boolean> => {
    if (!authClient) return false;

    try {
      await new Promise<void>((resolve) => {
        authClient.login({
          identityProvider: process.env.DFX_NETWORK === 'ic' 
            ? 'https://identity.ic0.app' 
            : `http://uzt4z-lp777-77774-qaabq-cai.localhost:4943`,
          onSuccess: async () => {
            const identity = authClient.getIdentity();
            
            const clyprService = await ClyprService.create(identity);
            setService(clyprService);
            
            // Check if user is the canister owner
            try {
              const owner = await clyprService.getOwner();
              const isCurrentOwner = principal?.toText() === owner.toText();
              
              // If there's no owner set (anonymous) or user is already owner
              if (owner.toText() === '2vxsx-fae' || isCurrentOwner) {
                // Set current user as owner
                if (!isCurrentOwner && principal) {
                  console.log('Setting user as canister owner...');
                  await clyprService.setOwner(userPrincipal);
                }
                setIsOwner(true);
              } else {
                setIsOwner(isCurrentOwner);
              }
            } catch (err) {
              console.error("Failed to check owner status", err);
            }
            
            resolve(true);
          },
          onError: (error) => {
            console.error("Login error:", error);
            setError("Login failed: " + String(error));
            resolve(false);
          }
        });
      });
    } catch (err) {
      console.error("Login initialization error:", err);
      setError("Login initialization failed: " + String(err));
      return false;
    }
  };
  
  const logout = async (): Promise<void> => {
    const authClient = await AuthClient.create();
    await authClient.logout();
    
    setIsAuthenticated(false);
    setPrincipal(null);
    setIsOwner(false);
    
    // Reset to anonymous service
    const clyprService = new ClyprService();
    setService(clyprService);
  };
  
  // Rule-related functions
  const [rules, setRules] = useState<Rule[]>([]);
  const [rulesLoading, setRulesLoading] = useState<boolean>(false);
  
  const loadRules = async (): Promise<void> => {
    if (!service || !isAuthenticated) return;
    
    try {
      setRulesLoading(true);
      const result = await service.getAllRules();
      if (result) {
        setRules(result);
      }
    } catch (err) {
      console.error("Failed to load rules:", err);
      setError("Failed to load rules: " + String(err));
    } finally {
      setRulesLoading(false);
    }
  };
  
  const createRule = async (
    name: string,
    description: string | undefined,
    conditions: any[],
    actions: any[],
    priority: number
  ): Promise<number | undefined> => {
    if (!service || !isAuthenticated) {
      console.error("Cannot create rule: service or authentication missing", { service: !!service, isAuthenticated });
      return undefined;
    }
    
    try {
      console.log("Creating rule with data:", { name, description, conditions, actions, priority });
      const ruleId = await service.createRule(
        name, 
        description, 
        conditions, 
        actions, 
        priority
      );
      
      console.log("Rule created with ID:", ruleId);
      
      if (ruleId !== undefined) {
        await loadRules(); // Refresh rules
      }
      
      return ruleId;
    } catch (err) {
      console.error("Failed to create rule:", err);
      setError("Failed to create rule: " + String(err));
      return undefined;
    }
  };
  
  const updateRule = async (ruleId: number, rule: Rule): Promise<boolean> => {
    if (!service || !isAuthenticated) return false;
    
    try {
      const success = await service.updateRule(ruleId, rule);
      if (success) {
        await loadRules(); // Refresh rules
      }
      return success;
    } catch (err) {
      console.error("Failed to update rule:", err);
      setError("Failed to update rule: " + String(err));
      return false;
    }
  };
  
  const deleteRule = async (ruleId: number): Promise<boolean> => {
    if (!service || !isAuthenticated) return false;
    
    try {
      const success = await service.deleteRule(ruleId);
      if (success) {
        await loadRules(); // Refresh rules
      }
      return success;
    } catch (err) {
      console.error("Failed to delete rule:", err);
      setError("Failed to delete rule: " + String(err));
      return false;
    }
  };
  
  // Channel-related functions
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState<boolean>(false);
  
  const loadChannels = async (): Promise<void> => {
    if (!service || !isAuthenticated) return;
    
    try {
      setChannelsLoading(true);
      const result = await service.getAllChannels();
      if (result) {
        setChannels(result);
      }
    } catch (err) {
      console.error("Failed to load channels:", err);
      setError("Failed to load channels: " + String(err));
    } finally {
      setChannelsLoading(false);
    }
  };
  
  const createChannel = async (
    name: string,
    description: string | undefined,
    channelType: any,
    config: [string, string][]
  ): Promise<number | undefined> => {
    if (!service || !isAuthenticated) return undefined;
    
    try {
      const channelId = await service.createChannel(
        name, 
        description, 
        channelType, 
        config
      );
      
      if (channelId !== undefined) {
        await loadChannels(); // Refresh channels
      }
      
      return channelId;
    } catch (err) {
      console.error("Failed to create channel:", err);
      setError("Failed to create channel: " + String(err));
      return undefined;
    }
  };
  
  const updateChannel = async (channelId: number, channel: Channel): Promise<boolean> => {
    if (!service || !isAuthenticated) return false;
    
    try {
      const success = await service.updateChannel(channelId, channel);
      if (success) {
        await loadChannels(); // Refresh channels
      }
      return success;
    } catch (err) {
      console.error("Failed to update channel:", err);
      setError("Failed to update channel: " + String(err));
      return false;
    }
  };
  
  const deleteChannel = async (channelId: number): Promise<boolean> => {
    if (!service || !isAuthenticated) return false;
    
    try {
      const success = await service.deleteChannel(channelId);
      if (success) {
        await loadChannels(); // Refresh channels
      }
      return success;
    } catch (err) {
      console.error("Failed to delete channel:", err);
      setError("Failed to delete channel: " + String(err));
      return false;
    }
  };
  
  // Message-related functions
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);
  
  const loadMessages = async (): Promise<void> => {
    if (!service || !isAuthenticated) return;
    
    try {
      setMessagesLoading(true);
      const result = await service.getAllMessages();
      if (result) {
        setMessages(result);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Failed to load messages: " + String(err));
    } finally {
      setMessagesLoading(false);
    }
  };
  
  const sendMessage = async (
    messageType: string,
    title: string,
    body: string,
    priority: number,
    metadata: [string, string][] = []
  ) => {
    if (!service) return undefined;
    
    try {
      const receipt = await service.sendMessage(
        messageType,
        {
          title,
          body,
          priority,
          metadata
        }
      );
      
      return receipt;
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message: " + String(err));
      return undefined;
    }
  };
  
  // Stats function
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  
  const loadStats = async (): Promise<void> => {
    if (!service || !isAuthenticated || !isOwner) return;
    
    try {
      setStatsLoading(true);
      const result = await service.getStats();
      if (result) {
        setStats(result);
      }
    } catch (err) {
      console.error("Failed to load stats:", err);
      setError("Failed to load stats: " + String(err));
    } finally {
      setStatsLoading(false);
    }
  };
  
  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated && service) {
      loadRules();
      loadChannels();
      if (isOwner) {
        loadMessages();
        loadStats();
      }
    }
  }, [isAuthenticated, isOwner, service]);
  
  // Add ping method for testing
  const ping = async (): Promise<string> => {
    if (!service) {
      console.error("Service not initialized for ping");
      throw new Error("Service not initialized");
    }
    console.log("Attempting to ping backend...");
    try {
      const result = await service.ping();
      console.log("Ping successful:", result);
      return result;
    } catch (error) {
      console.error("Ping failed:", error);
      throw error;
    }
  };

  return {
    // Auth
    isAuthenticated,
    principal,
    isOwner,
    login,
    logout,
    ping,
    service,
    
    // Rules
    rules,
    rulesLoading,
    loadRules,
    createRule,
    updateRule,
    deleteRule,
    
    // Channels
    channels,
    channelsLoading,
    loadChannels,
    createChannel,
    updateChannel,
    deleteChannel,
    
    // Messages
    messages,
    messagesLoading,
    loadMessages,
    sendMessage,
    
    // Stats
    stats,
    statsLoading,
    loadStats,
    
    // General
    loading,
    error,
    clearError: () => setError(null)
  };
}
