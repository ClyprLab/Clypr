import React from 'react';
// Workspace workaround: some IDE/TS configs don't expose named hooks; alias via React to avoid type errors in TSX files
const useEffect = (React as any).useEffect;
const useState = (React as any).useState;
const useCallback = (React as any).useCallback;

import { Principal } from '@dfinity/principal';
import ClyprService, { Rule, Channel, Message, Stats } from '../services/ClyprService';
import { useAuth } from './useAuth';

export function useClypr() {
  const { isAuthenticated, principal, authClient, login: authLogin, logout: authLogout } = useAuth();
  const [service, setService] = useState<ClyprService | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to detect canister authorization errors and suppress noisy logs
  const isNotAuthorized = (err: any) => {
    if (!err) return false;
    try {
      if (typeof err === 'object') {
        if (Object.prototype.hasOwnProperty.call(err, 'NotAuthorized')) return true;
        if (Object.prototype.hasOwnProperty.call(err, 'notAuthorized')) return true;
      }
      const s = JSON.stringify(err);
      return s.includes('NotAuthorized') || s.includes('not_authorized') || String(err).includes('NotAuthorized');
    } catch (e) {
      return false;
    }
  };

  // Initialize the service
  useEffect(() => {
    let cancelled = false;
    const initService = async () => {
      try {
        setLoading(true);
        const clyprService = new ClyprService();
        if (isAuthenticated && authClient) {
          const identity = authClient.getIdentity();
          await clyprService.authenticate(identity);
        }
        if (cancelled) return;
        setService(clyprService);
      } catch (err) {
        console.error('Failed to initialize Clypr service', err);
        setError('Failed to initialize: ' + String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initService();
    return () => { cancelled = true; };
  }, [isAuthenticated, authClient]);

  const login = async () => {
    await authLogin();
  };

  const logout = async () => {
    await authLogout();
    setService(new ClyprService()); // Re-initialize with anonymous identity
  };

  // Alias helpers
  const [myUsername, setMyUsername] = useState<string | null>(null);
  const [aliasChecked, setAliasChecked] = useState<boolean>(false);
  const hasAlias = !!myUsername;

  const checkMyAlias = async () => {
    if (!service || !isAuthenticated) return null;
    try {
      const username = await service.getMyUsername();
      setMyUsername(username);
      setAliasChecked(true);
      return username;
    } catch (e) {
      if (isNotAuthorized(e)) {
        // Not authorized to read username — treat as "no alias" without noisy logs
        console.warn('getMyUsername: Not authorized for this principal');
        setAliasChecked(true);
        setMyUsername(null);
        return null;
      }
      console.error('getMyUsername error:', e);
      setAliasChecked(true);
      return null;
    }
  };

  const registerUsername = async (username: string): Promise<boolean> => {
    if (!service || !isAuthenticated) return false;
    const ok = await service.registerUsername(username);
    if (ok) setMyUsername(username);
    return ok;
  };

  const resolveUsername = async (username: string) => {
    if (!service) return null;
    try {
      return await service.resolveUsername(username);
    } catch (e) {
      if (isNotAuthorized(e)) return null;
      throw e;
    }
  };

  useEffect(() => {
    if (isAuthenticated && service) {
      checkMyAlias();
    } else {
      setMyUsername(null);
      setAliasChecked(false);
    }
  }, [isAuthenticated, service]);

  // Rule-related functions
  const [rules, setRules] = useState<Rule[]>([]);
  const [rulesLoading, setRulesLoading] = useState<boolean>(false);

  const loadRules = useCallback(async () => {
    if (!service || !isAuthenticated) return;
    try {
      setRulesLoading(true);
      const result = await service.getAllRules();
      setRules(result || []);
    } catch (err) {
      if (isNotAuthorized(err)) {
        console.warn('getAllRules: not authorized for this principal');
        setRules([]);
      } else {
        console.error('Failed to load rules:', err);
        setError('Failed to load rules: ' + String(err));
      }
    } finally {
      setRulesLoading(false);
    }
  }, [service, isAuthenticated]);

  const createRule = async (
    ruleData: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number | undefined> => {
    if (!service || !isAuthenticated) {
      setError('Not authenticated or service not available.');
      return undefined;
    }

    try {
      const ruleId = await service.createRule(ruleData);
      if (ruleId !== undefined) {
        await loadRules();
      }
      return ruleId;
    } catch (err) {
      console.error('Failed to create rule:', err);
      setError('Failed to create rule: ' + String(err));
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
      console.error('Failed to update rule:', err);
      setError('Failed to update rule: ' + String(err));
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
      console.error('Failed to delete rule:', err);
      setError('Failed to delete rule: ' + String(err));
      return false;
    }
  };

  // Channel-related functions
  const [channels, setChannels] = useState<Channel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState<boolean>(false);

  const loadChannels = useCallback(async () => {
    if (!service || !isAuthenticated) return;

    try {
      setChannelsLoading(true);
      const result = await service.getAllChannels();
      setChannels(result || []);
    } catch (err) {
      if (isNotAuthorized(err)) {
        console.warn('getAllChannels: not authorized for this principal');
        setChannels([]);
      } else {
        console.error('Failed to load channels:', err);
        setError('Failed to load channels: ' + String(err));
      }
    } finally {
      setChannelsLoading(false);
    }
  }, [service, isAuthenticated]);

  const createChannel = async (
    channelData: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number | undefined> => {
    if (!service || !isAuthenticated) {
      setError('Not authenticated or service not available.');
      return undefined;
    }
    try {
      const channelId = await service.createChannel(channelData);
      if (channelId !== undefined) {
        await loadChannels();
      }
      return channelId;
    } catch (err) {
      console.error('Failed to create channel:', err);
      setError('Failed to create channel: ' + String(err));
      return undefined;
    }
  };

  const updateChannel = async (channelId: number, channel: Channel): Promise<boolean> => {
    if (!service || !isAuthenticated) {
      setError('Not authenticated or service not available.');
      return false;
    }
    try {
      const success = await service.updateChannel(channelId, channel);
      if (success) {
        await loadChannels();
      }
      return success;
    } catch (err) {
      console.error('Failed to update channel:', err);
      setError('Failed to update channel: ' + String(err));
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
      console.error('Failed to delete channel:', err);
      setError('Failed to delete channel: ' + String(err));
      return false;
    }
  };

  // Message-related functions
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState<boolean>(false);

  const loadMessages = useCallback(async () => {
    if (!service || !isAuthenticated) return;

    try {
      setMessagesLoading(true);
      const result = await service.getAllMessages();
      setMessages(result || []);
    } catch (err) {
      if (isNotAuthorized(err)) {
        // Many deployments restrict message retrieval — treat as empty without error
        console.warn('getAllMessages: not authorized for this principal');
        setMessages([]);
      } else {
        console.error('Failed to load messages:', err);
        setError('Failed to load messages: ' + String(err));
      }
    } finally {
      setMessagesLoading(false);
    }
  }, [service, isAuthenticated]);

  const sendMessage = async (
    messageType: string,
    content: Message['content']
  ) => {
    if (!service) return undefined;

    try {
      return await service.sendMessage(messageType, content);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message: ' + String(err));
      return undefined;
    }
  };

  // Stats function
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const loadStats = useCallback(async () => {
    if (!service || !isAuthenticated) return;

    try {
      setStatsLoading(true);
      const result = await service.getStats();
      setStats(result || null);
    } catch (err) {
      if (isNotAuthorized(err)) {
        console.warn('getStats: not authorized for this principal');
        setStats(null);
      } else {
        console.error('Failed to load stats:', err);
        setError('Failed to load stats: ' + String(err));
      }
    } finally {
      setStatsLoading(false);
    }
  }, [service, isAuthenticated]);

  // Load initial data when authenticated — avoid auto-loading messages (owner-only on some deployments)
  useEffect(() => {
    if (isAuthenticated && service) {
      // Run safe loads in parallel and ignore per-call NotAuthorized errors
      loadStats().catch(() => {});
      loadRules().catch(() => {});
      loadChannels().catch(() => {});
      // do not call loadMessages() automatically to avoid owner-only calls causing noisy errors
    }
  }, [isAuthenticated, service]);

  const ping = async (): Promise<string> => {
    if (!service) {
      throw new Error('Service not initialized');
    }
    try {
      return await service.ping();
    } catch (error) {
      console.error('Ping failed:', error);
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
    // alias
    myUsername,
    hasAlias,
    aliasChecked,
    checkMyAlias,
    registerUsername,
    resolveUsername,
    // rules
    rules,
    rulesLoading,
    loadRules,
    createRule,
    updateRule,
    deleteRule,
    // channels
    channels,
    channelsLoading,
    loadChannels,
    createChannel,
    updateChannel,
    deleteChannel,
    // messages
    messages,
    messagesLoading,
    loadMessages,
    sendMessage,
    // stats
    stats,
    statsLoading,
    loadStats,
    loading,
    error,
    clearError: () => setError(null)
  };
}