import { useEffect, useState } from 'react';
import { Principal } from '@dfinity/principal';
import ClyprService, { Rule, Channel, Message, Stats } from '../services/ClyprService';
import { useAuth } from './useAuth';

export function useClypr() {
  const { isAuthenticated, principal, authClient, login: authLogin, logout: authLogout } = useAuth();
  const [service, setService] = useState<ClyprService | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the service
  useEffect(() => {
    const initService = async () => {
      try {
        setLoading(true);
        const clyprService = new ClyprService();
        if (isAuthenticated && authClient) {
          const identity = authClient.getIdentity();
          await clyprService.authenticate(identity);
        }
        setService(clyprService);
      } catch (err) {
        console.error("Failed to initialize Clypr service", err);
        setError("Failed to initialize: " + String(err));
      } finally {
        setLoading(false);
      }
    };

    initService();
  }, [isAuthenticated, authClient]);

  const login = async () => {
    await authLogin();
  };

  const logout = async () => {
    await authLogout();
    setService(new ClyprService()); // Re-initialize with anonymous identity
  };

  // Rule-related functions
  const [rules, setRules] = useState<Rule[]>([]);
  const [rulesLoading, setRulesLoading] = useState<boolean>(false);

  const loadRules = async () => {
    if (!service || !isAuthenticated) return;
    
    try {
      setRulesLoading(true);
      const result = await service.getAllRules();
      setRules(result || []);
    } catch (err) {
      console.error("Failed to load rules:", err);
      setError("Failed to load rules: " + String(err));
    } finally {
      setRulesLoading(false);
    }
  };

  const createRule = async (
    ruleData: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number | undefined> => {
    if (!service || !isAuthenticated) {
      setError("Not authenticated or service not available.");
      return undefined;
    }
    
    try {
      const ruleId = await service.createRule(ruleData);
      if (ruleId !== undefined) {
        await loadRules();
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
        await loadRules();
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
        await loadRules();
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

  const loadChannels = async () => {
    if (!service || !isAuthenticated) return;
    
    try {
      setChannelsLoading(true);
      const result = await service.getAllChannels();
      setChannels(result || []);
    } catch (err) {
      console.error("Failed to load channels:", err);
      setError("Failed to load channels: " + String(err));
    } finally {
      setChannelsLoading(false);
    }
  };

  const createChannel = async (
    channelData: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number | undefined> => {
    if (!service || !isAuthenticated) return undefined;
    
    try {
      const channelId = await service.createChannel(
        channelData.name,
        channelData.description,
        channelData.channelType,
        channelData.config
      );
      
      if (channelId !== undefined) {
        await loadChannels();
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
        await loadChannels();
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
        await loadChannels();
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

  const loadMessages = async () => {
    if (!service || !isAuthenticated) return;
    
    try {
      setMessagesLoading(true);
      const result = await service.getAllMessages();
      setMessages(result || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Failed to load messages: " + String(err));
    } finally {
      setMessagesLoading(false);
    }
  };

  const sendMessage = async (
    messageType: string,
    content: Message['content']
  ) => {
    if (!service) return undefined;
    
    try {
      return await service.sendMessage(messageType, content);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to send message: " + String(err));
      return undefined;
    }
  };

  // Stats function
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const loadStats = async () => {
    if (!service || !isAuthenticated) return;
    
    try {
      setStatsLoading(true);
      const result = await service.getStats();
      setStats(result || null);
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
      loadMessages();
      loadStats();
    }
  }, [isAuthenticated, service]);

  const ping = async (): Promise<string> => {
    if (!service) {
      throw new Error("Service not initialized");
    }
    try {
      return await service.ping();
    } catch (error) {
      console.error("Ping failed:", error);
      throw error;
    }
  };

  return {
    isAuthenticated,
    principal,
    login,
    logout,
    ping,
    service,
    rules,
    rulesLoading,
    loadRules,
    createRule,
    updateRule,
    deleteRule,
    channels,
    channelsLoading,
    loadChannels,
    createChannel,
    updateChannel,
    deleteChannel,
    messages,
    messagesLoading,
    loadMessages,
    sendMessage,
    stats,
    statsLoading,
    loadStats,
    loading,
    error,
    clearError: () => setError(null)
  };
}
