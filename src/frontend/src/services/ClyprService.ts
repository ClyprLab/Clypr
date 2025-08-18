import { Actor, HttpAgent, HttpAgentOptions, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';
// Use generated Candid from backend canister (matches dappPrincipal + opt types)
import { idlFactory } from '../../../declarations/backend/backend.did.js';

// Types that match the Motoko backend
// Type definitions for the frontend
export interface Rule {
  id: number;
  name: string;
  description?: string;
  dappPrincipal?: Principal;
  conditions: Condition[];
  actions: Action[];
  priority: number;
  isActive: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

// Frontend types (what we use in our components)
export interface Condition {
  field: string;
  operator: ConditionOperatorString;  // Using string type for frontend
  value: string;
}

export interface Action {
  actionType: ActionTypeString;  // Using string type for frontend
  channelId?: number;  // Optional for frontend, will be converted to null in backend format
  parameters: [string, string][];  // Array of string tuples for parameters
}

// Backend types (what we send to Candid)
type ConditionOperator =
  | { contains: null }
  | { equals: null }
  | { exists: null }
  | { greaterThan: null }
  | { lessThan: null }
  | { notContains: null }
  | { notEquals: null }
  | { notExists: null };

type ActionType =
  | { allow: null }
  | { block: null }
  | { prioritize: null }
  | { route: null }
  | { transform: null };

interface BackendCondition {
  field: string;
  operator: ConditionOperator;
  value: string;
}

interface BackendAction {
  actionType: ActionType;
  // Candid opt ChannelId (Nat) => [] for None, [bigint] for Some
  channelId: bigint[];
  parameters: [string, string][];
}

// Frontend operator and action type strings
type ConditionOperatorString = 
  | 'contains'
  | 'equals'
  | 'exists'
  | 'greaterThan'
  | 'lessThan'
  | 'notContains'
  | 'notEquals'
  | 'notExists';

type ActionTypeString = 
  | 'allow'
  | 'block'
  | 'prioritize'
  | 'route'
  | 'transform';

interface BackendRule {
  id: number;
  name: string;
  description: string[];  // Empty array for None, [string] for Some - Candid opt format
  dappPrincipal: Principal[]; // Empty array for None, [Principal] for Some
  conditions: BackendCondition[];
  actions: BackendAction[];
  priority: number;
  isActive: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

// Helper to recursively flatten a config object into [string, string][]
function flattenConfig(obj: any, parentKey = ''): [string, string][] {
  let result: [string, string][] = [];
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const propName = parentKey ? `${parentKey}.${key}` : key;
      const value = obj[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result = result.concat(flattenConfig(value, propName));
      } else if (Array.isArray(value)) {
        result.push([propName, JSON.stringify(value)]);
      } else {
        result.push([propName, String(value)]);
      }
    }
  }
  return result;
}

export function toBackendChannel(channel: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>): {
  name: string;
  description: string[];
  channelType: any;
  config: any;
  retryConfig: { maxAttempts: number; backoffMs: number; timeoutMs: number }[];
  validationConfig: {
    contentLimits: {
      maxTitleLength: number;
      maxBodyLength: number;
      maxMetadataCount: number;
      allowedContentTypes: string[];
    };
    rateLimit: {
      windowMs: number;
      maxRequests: number;
      perChannel: boolean;
    };
  }[];
} {
  // Convert JS object variant to Candid variant format for ChannelType
  // Also map frontend 'telegram' variant -> backend 'telegramContact'
  let candidChannelType: any = null;
  if (typeof channel.channelType === 'object') {
    const keys = Object.keys(channel.channelType);
    if (keys.length === 1) {
      const key = keys[0];
      const value = (channel.channelType as any)[key];
      // Map frontend key to backend key when needed
      const backendKey = key === 'telegram' ? 'telegramContact' : key;
      // For custom, value is a string; for others, value is null
      candidChannelType = value !== null ? { [backendKey]: value } : { [backendKey]: null };
    }
  }
  // Fallback for string type (shouldn't happen)
  if (!candidChannelType && typeof (channel as any).channelType === 'string') {
    const key = (channel as any).channelType;
    const backendKey = key === 'telegram' ? 'telegramContact' : key;
    candidChannelType = { [backendKey]: null };
  }

  // retryConfig is optional at call-site in canister: represent opt as [] | [obj]
  const candidRetryConfig = channel.retryConfig
    ? [{
        maxAttempts: channel.retryConfig.maxAttempts,
        backoffMs: channel.retryConfig.backoffMs,
        timeoutMs: channel.retryConfig.timeoutMs,
      }]
    : [];

  // validationConfig is optional on create: represent opt as [] | [obj]
  const candidValidationConfig = channel.validationConfig
    ? [{
        contentLimits: {
          maxTitleLength: channel.validationConfig.contentLimits.maxTitleLength,
          maxBodyLength: channel.validationConfig.contentLimits.maxBodyLength,
          maxMetadataCount: channel.validationConfig.contentLimits.maxMetadataCount,
          allowedContentTypes: channel.validationConfig.contentLimits.allowedContentTypes,
        },
        rateLimit: {
          windowMs: channel.validationConfig.rateLimit.windowMs,
          maxRequests: channel.validationConfig.rateLimit.maxRequests,
          perChannel: channel.validationConfig.rateLimit.perChannel,
        },
      }]
    : [];

  // Map frontend channel config to backend ChannelConfig variant when needed
  let backendConfig: any = channel.config as any;
  try {
    if (typeof channel.channelType === 'object') {
      const key = Object.keys(channel.channelType)[0];
      if (key === 'telegram') {
        // Backend expects { telegramContact: { chatId: string } }
        const chatId = channel.config && (channel.config as any).telegram && (channel.config as any).telegram.chatId
          ? (channel.config as any).telegram.chatId
          : '';
        backendConfig = { telegramContact: { chatId } };
      }
    }
  } catch (e) {
    // Fallback to passing through original config
    backendConfig = channel.config as any;
  }

  return {
    name: channel.name,
    description: channel.description ? [channel.description] : [],
    channelType: candidChannelType,
    // Backend expects ChannelConfig variant
    config: backendConfig,
    retryConfig: candidRetryConfig,
    validationConfig: candidValidationConfig,
  };
}

// Helper functions for converting between frontend and backend formats
export function createOperatorVariant(op: ConditionOperatorString): ConditionOperator {
  switch (op) {
    case 'contains':
      return { contains: null };
    case 'equals':
      return { equals: null };
    case 'exists':
      return { exists: null };
    case 'greaterThan':
      return { greaterThan: null };
    case 'lessThan':
      return { lessThan: null };
    case 'notContains':
      return { notContains: null };
    case 'notEquals':
      return { notEquals: null };
    case 'notExists':
      return { notExists: null };
    default:
      throw new Error(`Invalid operator: ${op}`);
  }
}

export function createActionTypeVariant(type: ActionTypeString): ActionType {
  switch (type) {
    case 'allow':
      return { allow: null };
    case 'block':
      return { block: null };
    case 'prioritize':
      return { prioritize: null };
    case 'route':
      return { route: null };
    case 'transform':
      return { transform: null };
    default:
      throw new Error(`Invalid action type: ${type}`);
  }
}

export function toBackendRule(rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>): Omit<BackendRule, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: rule.name,
    description: rule.description && rule.description.trim() !== '' ? [rule.description.trim()] : [],
    dappPrincipal: rule.dappPrincipal ? [rule.dappPrincipal] : [],
    conditions: rule.conditions.map(cond => ({
      field: cond.field,
      operator: createOperatorVariant(cond.operator),
      value: cond.value
    })),
    actions: rule.actions.map(action => ({
      actionType: createActionTypeVariant(action.actionType),
      channelId: action.channelId !== undefined && action.channelId !== null
        ? [BigInt(action.channelId)]
        : [],
      parameters: action.parameters || []
    })),
    priority: rule.priority,
    isActive: rule.isActive
  };
}

function operatorToString(op: ConditionOperator): ConditionOperatorString {
  const key = Object.keys(op)[0] as ConditionOperatorString;
  if (!key) throw new Error('Invalid operator variant');
  return key;
}

function actionTypeToString(type: ActionType): ActionTypeString {
  const key = Object.keys(type)[0] as ActionTypeString;
  if (!key) throw new Error('Invalid action type variant');
  return key;
}

export function fromBackendRule(rule: BackendRule): Rule {
  return {
    id: rule.id,
    name: rule.name,
    description: rule.description.length > 0 ? rule.description[0] : undefined,
    dappPrincipal: rule.dappPrincipal && rule.dappPrincipal.length > 0 ? rule.dappPrincipal[0] : undefined,
    conditions: rule.conditions.map(cond => ({
      field: cond.field,
      operator: operatorToString(cond.operator),
      value: cond.value
    })),
    actions: rule.actions.map(action => ({
      actionType: actionTypeToString(action.actionType),
      channelId: action.channelId && action.channelId.length > 0 ? Number(action.channelId[0]) : undefined,
      parameters: action.parameters
    })),
    priority: rule.priority,
    isActive: rule.isActive,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt
  };
}

export interface ValidationConfig {
  contentLimits: {
    maxTitleLength: number;
    maxBodyLength: number;
    maxMetadataCount: number;
    allowedContentTypes: string[];
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    perChannel: boolean;
  };
}

export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  timeoutMs: number;
}

export interface Channel {
  id: number;
  name: string;
  description?: string;
  channelType: { email: null } | { sms: null } | { webhook: null } | { push: null } | { custom: string } | { telegram: null };
  config: ChannelConfig;
  retryConfig: RetryConfig;
  validationConfig: ValidationConfig;
  isActive: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

export type ChannelConfig = {
  email?: {
    provider: string;
    apiKey?: string;
    fromAddress: string;
    replyTo?: string;
    smtp?: {
      host: string;
      port: number;
      username: string;
      password: string;
      useTLS: boolean;
    };
  };
  sms?: {
    provider: string;
    apiKey: string;
    fromNumber: string;
    webhookUrl?: string;
  };
  webhook?: {
    url: string;
    method: string;
    headers: [string, string][];
    authType: {
      none?: null;
      basic?: { username: string; password: string };
      bearer?: string;
    };
    retryCount: number;
  };
  push?: {
    provider: string;
    apiKey: string;
    appId: string;
    platform: 'fcm' | 'apn' | 'webpush';
  };
  custom?: [string, string][];
  telegram?: { chatId?: string };
};

export interface Message {
  messageId: string;
  senderId: Principal;
  recipientId: Principal;
  messageType: string;
  content: {
    title: string;
    body: string;
    priority: number;
    metadata: [string, string][];
  };
  timestamp: bigint;
  isProcessed: boolean;
  status: 'received' | 'processing' | 'delivered' | 'blocked' | 'failed';
}

export interface MessageReceipt {
  messageId: string;
  received: boolean;
  timestamp: bigint;
}

export interface Stats {
  rulesCount: number;
  channelsCount: number;
  messagesCount: number;
  blockedCount: number;
  deliveredCount: number;
}

// Service class for interacting with the Clypr backend
export class ClyprService {
  private actor: any;
  private authClient: AuthClient | null = null;
  private identity: Identity | null = null;
  private isAuthInitialized: boolean = false;
  private agent: HttpAgent;
  private canisterId: Principal;
  private agentHost: string;

  constructor() {
    // Get canister IDs from environment or window object
    const backendCanisterId = (window as any).canisterIds?.backend ||
                              process.env.PUBLIC_BACKEND_CANISTER_ID || 
                              '5elod-ciaaa-aaaag-aufgq-cai';

    console.log("Backend Canister ID:", backendCanisterId);
    this.canisterId = Principal.fromText(backendCanisterId);
    this.agentHost = window.location.origin;

    const agentOptions: HttpAgentOptions = {
      host: this.agentHost,
      identity: undefined,
      verifyQuerySignatures: true,
      fetch: window.fetch.bind(window)
    };

    this.agent = new HttpAgent(agentOptions);

    // For local development, fetch the root key first
    if (this.agentHost.includes('localhost') || this.agentHost.includes('127.0.0.1')) {
      console.log('Local development environment detected');
      console.log('Attempting to fetch root key...');
      this.agent.fetchRootKey().then(() => {
        console.log('Root key fetched successfully');
      }).catch(err => {
        console.warn('Unable to fetch root key:', err);
      });
    }

    // Create actor
    this.actor = Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId: this.canisterId
    });

    // Diagnostic: list available actor methods to detect stale IDL/runtime mismatch
    try {
      const methodNames = this.actor ? Object.keys(this.actor) : [];
      console.debug('ClyprService actor created. Available actor methods:', methodNames);
    } catch (diagErr) {
      console.debug('ClyprService actor diagnostics failed:', diagErr);
    }
  }
  /**
   * Authenticate via Internet Identity and reinitialize the agent and actor
   */
  /** Authenticate using Internet Identity */
  async loginViaInternetIdentity(): Promise<void> {
    const { AuthClient } = await import('@dfinity/auth-client');
    this.authClient = await AuthClient.create();
    if (!(await this.authClient.isAuthenticated())) {
      // Determine the Identity Provider URL
      let identityProvider: string;
      // For local development, use the local II canister subdomain URL
      if (this.agentHost.includes('localhost') || this.agentHost.includes('127.0.0.1')) {
        const iidCanister = (window as any).canisterIds?.internet_identity;
        identityProvider = `http://${iidCanister}.localhost:4943`;
      } else {
        // Production Identity Provider
        identityProvider = 'https://identity.ic0.app';
      }
      await this.authClient.login({ identityProvider });
    }
    const identity = this.authClient.getIdentity();
    
    // Configure agent for authenticated requests
    const agentOptions: HttpAgentOptions = {
      host: this.agentHost,
      identity: identity,
      verifyQuerySignatures: false, // Always disable for development
      fetch: window.fetch.bind(window)
    };
    
    this.agent = new HttpAgent(agentOptions);
    
    if (this.agentHost.includes('localhost')) {
      await this.agent.fetchRootKey();
    }
    
    this.actor = Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId: this.canisterId.toString()
    });
    
    // Verify authentication worked
    try {
      const pingResult = await this.ping();
      console.log('Authentication verified with ping:', pingResult);
    } catch (err) {
      console.error('Failed to verify authentication:', err);
      throw err;
    }
  }

  // Legacy authentication for direct service tests
  async authenticate(identity: Identity): Promise<void> {
    if (!identity) throw new Error('Identity is required');
    
    try {
      const principal = identity.getPrincipal();
      console.log('Authenticating with identity:', principal.toText());
      
      // Create new agent with proper configuration for local development
      const agentOptions: HttpAgentOptions = {
        host: this.agentHost,
        identity: identity,
        verifyQuerySignatures: false, // Always disable for local development
        fetch: window.fetch.bind(window)
      };
      
      // Create new agent instance
      this.agent = new HttpAgent(agentOptions);
      
      // For local development, always fetch root key
      if (this.agentHost.includes('localhost')) {
        console.log('Local development environment detected');
        try {
          console.log('Fetching root key...');
          await this.agent.fetchRootKey();
          console.log('Root key fetched successfully');
        } catch (rootKeyError) {
          console.warn('Failed to fetch root key:', rootKeyError);
          // Continue anyway as some operations might still work
        }
      }
      
      // Create new actor with configured agent
      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: this.canisterId.toString()
      });
      
      // Verify authentication
      console.log('Authenticated with principal:', principal.toText());
      
      // Verify by ping
      const result = await this.ping();
      console.log('Authenticated ping result:', result);
      
      // Wait a moment for the authentication to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error('Authentication failed:', err);
      throw new Error('Failed to authenticate: ' + String(err));
    }
  }

  private async initializeRootKey(): Promise<void> {
    try {
      // Create fresh agent for local development
      const agentOptions: HttpAgentOptions = {
        host: this.agentHost,
        verifyQuerySignatures: false, // Always disable for local development
        fetch: window.fetch.bind(window)
      };

      this.agent = new HttpAgent(agentOptions);

      console.log('Attempting to fetch root key...');
      await this.agent.fetchRootKey();
      console.log('Root key fetched successfully');

      // Recreate actor with updated agent
      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: this.canisterId.toString()
      });
      
      // Verify setup by attempting a ping
      try {
        const result = await this.actor.ping();
        console.log('Local development environment verified:', result);
      } catch (pingError) {
        console.warn('Ping verification failed but continuing:', pingError);
      }
      
      console.log('Local development environment setup complete');
    } catch (error) {
      console.warn('Failed to setup local development environment:', error);
    }
  }

  // System health check
  public async ping(): Promise<string> {
    try {
      if (!this.actor) {
        throw new Error('Actor not initialized');
      }

      const result = await this.actor.ping();
      return result;
    } catch (error: unknown) {
      console.error('Ping error:', error);

      // Handle signature verification errors in local dev
      if (error instanceof Error && 
          error.message.includes('signature could not be verified')) {
        console.warn('Signature verification disabled in local development');
        return 'Clypr Privacy Gateway - Running (Local Mode)';
      }

      throw error;
    }
  }
  
  // Alias APIs
  public async getMyUsername(): Promise<string | null> {
    try {
      const result = await this.actor.getMyUsername();
      if ('ok' in result) return result.ok as string;
      if ('err' in result) {
        // NotFound -> no alias yet
        if (result.err && typeof result.err === 'object' && 'NotFound' in result.err) {
          return null;
        }
        console.error('getMyUsername error:', result.err);
        return null;
      }
      return null;
    } catch (error) {
      console.error('Error in getMyUsername:', error);
      return null;
    }
  }

  public async registerUsername(username: string): Promise<boolean> {
    try {
      const result = await this.actor.registerUsername(username);
      if ('ok' in result) return true;
      if ('err' in result) {
        console.error('registerUsername error:', result.err);
        return false;
      }
      return false;
    } catch (error) {
      console.error('Error in registerUsername:', error);
      return false;
    }
  }

  public async resolveUsername(username: string): Promise<Principal | null> {
    try {
      const result = await this.actor.resolveUsername(username);
      if ('ok' in result) return result.ok as Principal;
      if ('err' in result) {
        if (result.err && typeof result.err === 'object' && 'NotFound' in result.err) {
          return null;
        }
        console.error('resolveUsername error:', result.err);
        return null;
      }
      return null;
    } catch (error) {
      console.error('Error in resolveUsername:', error);
      return null;
    }
  }

  async setOwner(principal: Principal): Promise<boolean> {
    try {
      console.log('Setting owner to:', principal.toText());
      const result = await this.actor.setOwner(principal);
      
      if ('ok' in result) {
        console.log('Owner set successfully');
        return true;
      } else if ('err' in result) {
        console.error('Failed to set owner:', result.err);
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error setting owner:', error);
      throw error;
    }
  }
  
    // Method to check if the current user is authorized (no longer owner-based)
  async isAuthorized(): Promise<boolean> {
    try {
      // In the new model, any authenticated user is authorized
      // The backend now handles per-user data access
      const identity = await this.agent.getPrincipal();
      return !identity.isAnonymous();
    } catch (error) {
      console.error('Error checking authorization:', error);
      return false;
    }
  }
  
  // Rules
  async createRule(ruleInput: {
    name: string;
    description?: string;
    dappPrincipal?: string;
    conditions?: Condition[];
    actions?: Action[];
    priority?: number;
  }): Promise<number | undefined> {
    try {
      // Validate and set defaults
      if (!ruleInput.name) {
        throw new Error('Rule name is required');
      }

      const rule = {
        name: ruleInput.name,
        description: ruleInput.description || '',
        dappPrincipal: ruleInput.dappPrincipal ? Principal.fromText(ruleInput.dappPrincipal) : undefined,
        conditions: ruleInput.conditions || [],
        actions: ruleInput.actions || [],
        priority: ruleInput.priority ?? 5, // Default priority
        isActive: true
      };
      
      // Log incoming data
      console.log('Creating rule with normalized data:', JSON.stringify(rule, null, 2));
      
      // Use the toBackendRule helper function to ensure proper data structure conversion
      const backendRule = toBackendRule(rule);
      
      // Log converted formats
      console.log('Backend format:', backendRule);
      
      // Log individual conditions and actions for debugging
      console.log('Conditions being sent:', JSON.stringify(backendRule.conditions, null, 2));
      console.log('Actions being sent:', JSON.stringify(backendRule.actions, null, 2));
      
      // Call createRule with the exact parameters the backend expects
      // Note: The backend function signature includes dappPrincipal parameter
      const result = await this.actor.createRule(
        backendRule.name,
        backendRule.description, // Array format for opt text
        rule.dappPrincipal ? [rule.dappPrincipal] : [], // Array format for opt principal
        backendRule.conditions,
        backendRule.actions,
        backendRule.priority
      );
      
      console.log('Create rule result:', result);

      if (!result) {
        throw new Error('No result returned from createRule');
      }
      
      if ('ok' in result) {
        console.log('Rule created successfully with ID:', result.ok);
        return result.ok;
      } else if ('err' in result) {
        const errorMsg = `Failed to create rule: ${JSON.stringify(result.err)}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
      return undefined;
      
    } catch (error) {
      console.error('Error in createRule:', error);
      throw error;
    }
  }
  
  async getRule(ruleId: number): Promise<Rule | undefined> {
    const result = await this.actor.getRule(ruleId);
    return this.handleResult(result);
  }
  
  async getAllRules(): Promise<Rule[]> {
    try {
      const result = await this.actor.getAllRules();
            const backendRules: BackendRule[] | undefined = this.handleResult(result);
      return backendRules ? backendRules.map(fromBackendRule) : [];
    } catch (error) {
      console.error("Error getting all rules:", error);
      throw error;
    }
  }

  async updateRule(ruleId: number, rule: Rule): Promise<boolean> {
    // Convert the frontend rule to the backend format for the updateRule call
    const backendRule: BackendRule = {
      id: ruleId,
      name: rule.name,
      description: rule.description && rule.description.trim() !== '' ? [rule.description.trim()] : [],
      dappPrincipal: rule.dappPrincipal ? [rule.dappPrincipal] : [],
      conditions: rule.conditions.map(cond => ({
        field: cond.field,
        operator: createOperatorVariant(cond.operator),
        value: cond.value
      })),
      actions: rule.actions.map(action => ({
        actionType: createActionTypeVariant(action.actionType),
        channelId: action.channelId !== undefined && action.channelId !== null ? [BigInt(action.channelId)] : [],
        parameters: action.parameters || []
      })),
      priority: rule.priority,
      isActive: rule.isActive,
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt
    };
    
    const result = await this.actor.updateRule(ruleId, backendRule);
    return this.handleResult(result) !== undefined;
  }
  
  async deleteRule(ruleId: number): Promise<boolean> {
    const result = await this.actor.deleteRule(ruleId);
    return this.handleResult(result) !== undefined;
  }
  
  // Channels
  async createChannel(
    channelData: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number | undefined> {
    if (!this.actor) throw new Error('Actor not initialized');
    const backendChannel = toBackendChannel(channelData);
    const result = await this.actor.createChannel(
      backendChannel.name,
      backendChannel.description,
      backendChannel.channelType,
      backendChannel.config,
      backendChannel.retryConfig,
      backendChannel.validationConfig
    );
    if ('ok' in result) {
      return Number(result.ok);
    } else {
      console.error('Error creating channel:', result.err);
      throw new Error(Object.keys(result.err)[0]);
    }
  }

  // Initiate Telegram verification flow. Returns short-lived token for deep-linking with the bot.
  async requestTelegramVerification(createPlaceholder: boolean = true): Promise<{ token: string; expiresAt: number; channelId?: number } | undefined> {
    if (!this.actor) throw new Error('Actor not initialized');

    const parsePayload = (payload: any) => {
      if (!payload) return undefined;
      // Direct legacy string return
      if (typeof payload === 'string') return { token: payload, expiresAt: Date.now() + 15 * 60 * 1000 };
      // Result wrapper
      if (payload.ok) return parsePayload(payload.ok);
      // Structured object
      if (payload.token && typeof payload.token === 'string') {
        const token = payload.token;
        const expiresAtRaw = payload.expiresAt ?? Date.now() + 15 * 60 * 1000;
        const expiresAt = typeof expiresAtRaw === 'bigint' ? Number(expiresAtRaw) : Number(expiresAtRaw);
        let channelId: number | undefined;
        if (payload.channelId && Array.isArray(payload.channelId) && payload.channelId.length > 0) channelId = Number(payload.channelId[0]);
        if (typeof payload.channelId === 'number') channelId = payload.channelId;
        return { token, expiresAt, channelId };
      }
      // Tuple/array-like responses
      if (Array.isArray(payload) && payload.length > 0) {
        const first = payload[0];
        if (typeof first === 'string') return { token: first, expiresAt: Date.now() + 15 * 60 * 1000 };
        if (first && typeof first === 'object' && first.token) return parsePayload(first);
      }
      return undefined;
    };

    const callActor = async (arg?: any) => {
      // Candid signature uses Opt(Bool) for this param; frontend must send [] for None or [bool] for Some(bool)
      if (typeof arg === 'undefined') return await this.actor.requestTelegramVerification();
      return await this.actor.requestTelegramVerification([arg]);
    };

    // Try new signature first, then fallback to legacy no-arg if it traps/throws
    try {
      const res = await callActor(createPlaceholder);
      if (res && 'ok' in res) return parsePayload(res.ok as any);
      if (res && 'err' in res) {
        console.error('requestTelegramVerification returned err:', res.err);
        return undefined;
      }
      return parsePayload(res as any);
    } catch (primaryErr: any) {
      console.warn('requestTelegramVerification primary call failed:', primaryErr && primaryErr.message ? primaryErr.message : primaryErr);
      try {
        const fallback = await callActor();
        if (fallback && 'ok' in fallback) return parsePayload(fallback.ok as any);
        if (fallback && 'err' in fallback) {
          console.error('requestTelegramVerification fallback returned err:', fallback.err);
          return undefined;
        }
        return parsePayload(fallback as any);
      } catch (fallbackErr: any) {
        console.error('requestTelegramVerification fallback also failed:', fallbackErr && fallbackErr.message ? fallbackErr.message : fallbackErr);
        return undefined;
      }
    }
  }

  // Email verification helpers
  async requestEmailVerification(email: string, createPlaceholder: boolean = true): Promise<{ token: string; expiresAt: number; channelId?: number } | undefined> {
    if (!this.actor) throw new Error('Actor not initialized');

    // Fallback: if backend declarations don't include requestEmailVerification, create channel directly
    if (typeof this.actor.requestEmailVerification !== 'function') {
      console.warn('Actor does not expose requestEmailVerification; falling back to createChannel (no on-chain verification)');
      try {
        const channelId = await this.createChannel({
          name: `Email: ${email}`,
          description: '',
          channelType: { email: null },
          config: { email: { provider: 'smtp', fromAddress: email, smtp: [] as any[] } },
          retryConfig: { maxAttempts: 3, backoffMs: 1000, timeoutMs: 5000 },
          validationConfig: {
            contentLimits: { maxTitleLength: 200, maxBodyLength: 5000, maxMetadataCount: 10, allowedContentTypes: ['text/plain'] },
            rateLimit: { windowMs: 60000, maxRequests: 100, perChannel: true }
          },
          isActive: false
        } as any);
        return { token: '', expiresAt: Date.now(), channelId: channelId ?? undefined };
      } catch (err) {
        console.error('Fallback email channel creation failed:', err);
        return undefined;
      }
    }

    const parse = (payload: any) => {
      if (!payload) return undefined;
      if (typeof payload === 'string') return { token: payload, expiresAt: Date.now() + 15 * 60 * 1000 };
      if (payload.ok) return parse(payload.ok);
      if (payload.token) {
        const token = String(payload.token);
        const expiresAtRaw = payload.expiresAt ?? Date.now() + 15 * 60 * 1000;
        const expiresAt = typeof expiresAtRaw === 'bigint' ? Number(expiresAtRaw) : Number(expiresAtRaw);
        let channelId: number | undefined;
        if (Array.isArray(payload.channelId) && payload.channelId.length > 0) channelId = Number(payload.channelId[0]);
        if (typeof payload.channelId === 'number') channelId = payload.channelId;
        return { token, expiresAt, channelId };
      }
      if (Array.isArray(payload) && payload.length > 0) return parse(payload[0]);
      return undefined;
    };

    const call = async (opt?: boolean) => {
      // actor.requestEmailVerification(email, Opt(Bool))
      if (typeof opt === 'undefined') return await this.actor.requestEmailVerification(email);
      return await this.actor.requestEmailVerification(email, [opt]);
    };

    try {
      const res = await call(createPlaceholder);
      if (res && 'ok' in res) return parse(res.ok as any);
      if (res && 'err' in res) { console.error('requestEmailVerification err:', res.err); return undefined; }
      return parse(res as any);
    } catch (e) {
      try {
        const f = await call();
        if (f && 'ok' in f) return parse(f.ok as any);
        if (f && 'err' in f) { console.error('requestEmailVerification fallback err:', f.err); return undefined; }
        return parse(f as any);
      } catch (e2) {
        console.error('requestEmailVerification failed:', e, e2);
        return undefined;
      }
    }
  }

  async confirmEmailVerification(token: string): Promise<boolean> {
    if (!this.actor) throw new Error('Actor not initialized');

    if (typeof this.actor.confirmEmailVerification !== 'function') {
      console.warn('Actor does not expose confirmEmailVerification; cannot confirm token on-chain');
      return false;
    }

    try {
      const res = await this.actor.confirmEmailVerification(token);
      if (!res) return false;
      if ('ok' in res) return !!res.ok;
      if ('err' in res) { console.error('confirmEmailVerification err:', res.err); return false; }
      return !!res;
    } catch (err) {
      console.error('confirmEmailVerification error:', err);
      return false;
    }
  }
  
  async getChannel(channelId: number): Promise<Channel | undefined> {
    const result = await this.actor.getChannel(channelId);
    return this.handleResult(result);
  }
  
  async getAllChannels(): Promise<Channel[] | undefined> {
    const result = await this.actor.getAllChannels();
    return this.handleResult(result);
  }
  
  async updateChannel(channelId: number, channel: Channel): Promise<boolean> {
    if (!this.actor) throw new Error('Actor not initialized');

    // Ensure description is a plain string (in case caller passed backend-shaped opt array)
    const normalizedDescription = Array.isArray((channel as any).description)
      ? ((channel as any).description.length > 0 ? (channel as any).description[0] : undefined)
      : channel.description;

    // Reuse the same conversion used by createChannel to ensure canonical backend shapes
    const backendChannel = toBackendChannel({
      name: channel.name,
      description: normalizedDescription,
      channelType: channel.channelType as any,
      config: channel.config,
      retryConfig: channel.retryConfig,
      validationConfig: channel.validationConfig,
      isActive: channel.isActive,
      // omitted: id/createdAt/updatedAt are set below for the record
    } as any);

    // Unwrap optional arrays returned from toBackendChannel and provide sensible defaults
    const unwrappedRetryConfig = (backendChannel.retryConfig && backendChannel.retryConfig.length > 0)
      ? backendChannel.retryConfig[0]
      : { maxAttempts: channel.retryConfig?.maxAttempts ?? 3, backoffMs: channel.retryConfig?.backoffMs ?? 1000, timeoutMs: channel.retryConfig?.timeoutMs ?? 5000 };

    const unwrappedValidationConfig = (backendChannel.validationConfig && backendChannel.validationConfig.length > 0)
      ? backendChannel.validationConfig[0]
      : (channel.validationConfig || {
          contentLimits: {
            maxTitleLength: 200,
            maxBodyLength: 5000,
            maxMetadataCount: 10,
            allowedContentTypes: ['text/plain', 'text/html', 'application/json']
          },
          rateLimit: {
            windowMs: 60000,
            maxRequests: 100,
            perChannel: true
          }
        });

    // Construct the full backend Channel record expected by the canister
    const backendChannelRecord = {
      id: channel.id,
      name: backendChannel.name,
      description: backendChannel.description,
      channelType: backendChannel.channelType,
      config: backendChannel.config,
      retryConfig: unwrappedRetryConfig,
      validationConfig: unwrappedValidationConfig,
      isActive: channel.isActive,
      createdAt: channel.createdAt,
      updatedAt: BigInt(Date.now()),
    };

    try {
      const result = await this.actor.updateChannel(channelId, backendChannelRecord);
      if ('ok' in result) {
        return result.ok;
      } else {
        console.error('Error updating channel:', result.err);
        throw new Error(Object.keys(result.err)[0]);
      }
    } catch (err) {
      console.error('Error calling updateChannel:', err);
      throw err;
    }
  }

  // Root key initialization is handled at construction time
  
  async deleteChannel(channelId: number): Promise<boolean> {
    const result = await this.actor.deleteChannel(channelId);
    return this.handleResult(result) !== undefined;
  }
  
  // Messages
  async sendMessage(
    messageType: string,
    content: {
      title: string;
      body: string;
      priority: number;
      metadata: [string, string][];
    }
  ): Promise<MessageReceipt | undefined> {
    const result = await this.actor.sendMessage(messageType, content);
    return this.handleResult(result);
  }
  
  // New public dApp endpoints (preferred over deprecated processMessage)
  async notifyAlias(
    recipientAlias: string,
    messageType: string,
    content: {
      title: string;
      body: string;
      priority: number;
      metadata: [string, string][];
    }
  ): Promise<MessageReceipt | undefined> {
    const result = await this.actor.notifyAlias(recipientAlias, messageType, content);
    return this.handleResult(result);
  }

  async notifyPrincipal(
    recipient: Principal,
    messageType: string,
    content: {
      title: string;
      body: string;
      priority: number;
      metadata: [string, string][];
    }
  ): Promise<MessageReceipt | undefined> {
    const result = await this.actor.notifyPrincipal(recipient, messageType, content);
    return this.handleResult(result);
  }
  
  async getMessage(messageId: string): Promise<Message | undefined> {
    const result = await this.actor.getMessage(messageId);
    return this.handleResult(result);
  }
  
  async getAllMessages(): Promise<Message[] | undefined> {
    const result = await this.actor.getAllMessages();
    return this.handleResult(result);
  }

  // Return dispatch jobs for a given messageId. Tries the canister API first then falls back to debug_dumpAllDispatchJobs.
  async getDispatchJobsForMessage(messageId: string): Promise<any[]> {
    if (!this.actor) throw new Error('Actor not initialized');

    // Try the targeted query if available
    try {
      if (typeof this.actor.getDispatchJobsForMessage === 'function') {
        const res = await this.actor.getDispatchJobsForMessage(messageId);
        if (res && 'ok' in res) return res.ok || [];
        if (res && 'err' in res) {
          console.warn('getDispatchJobsForMessage returned err:', res.err);
        }
      } else {
        console.warn('Actor does not expose getDispatchJobsForMessage, falling back to debug_dumpAllDispatchJobs');
      }
    } catch (e) {
      console.warn('getDispatchJobsForMessage call failed:', e);
    }

    // Fallback: use debug dump and filter across users (useful during development or principal mismatch)
    try {
      if (typeof this.actor.debug_dumpAllDispatchJobs === 'function') {
        const dump = await this.actor.debug_dumpAllDispatchJobs();
        console.debug('debug_dumpAllDispatchJobs raw result:', dump);
        if (dump && 'ok' in dump) {
          const rows = dump.ok || [];
          console.debug(`debug_dumpAllDispatchJobs rows count: ${rows.length}`);
          const matches: any[] = [];
          for (const row of rows) {
            try {
              console.debug('scanning row for user:', row.user && row.user.toString ? row.user.toString() : row.user, 'jobsCount:', (row.jobs || []).length);
            } catch (_) {}
            const jobs = row.jobs || [];
            for (const job of jobs) {
              try {
                // Normalize both sides to string before comparing to avoid subtle type differences
                if (job && String(job.messageId) === String(messageId)) {
                  matches.push(job);
                }
              } catch (cmpErr) {
                console.warn('Error comparing job.messageId with target:', cmpErr, job, messageId);
              }
            }
          }
          console.debug('getDispatchJobsForMessage fallback matches:', matches.length);
          return matches;
        }
      } else {
        console.warn('Actor does not expose debug_dumpAllDispatchJobs');
      }
    } catch (e) {
      console.warn('debug_dumpAllDispatchJobs fallback failed:', e);
    }

    return [];
  }
  
  // Stats
  async getStats(): Promise<Stats | undefined> {
    try {
      console.log('Calling getStats method...');
      const result = await this.actor.getStats();
      console.log('getStats result:', result);
      return this.handleResult(result);
    } catch (error) {
      console.error('Error calling getStats:', error);
      throw error;
    }
  }


  setIdentity(identity: Identity | null): void {
    try {
      if (!identity) {
        console.warn('Setting null identity - switching to anonymous');
        this.agent.invalidateIdentity();
      } else {
        const principal = identity.getPrincipal();
        console.log('Setting new identity with principal:', principal.toText());
        this.agent.replaceIdentity(identity);
      }
    } catch (error) {
      console.error('Error setting identity:', error);
      throw new Error('Failed to set identity: ' + error.message);
    }
  }

  async getPrincipal(): Promise<Principal | undefined> {
    try {
      // Try to get the principal from the agent
      const principal = await this.agent.getPrincipal();
      if (!principal) {
        throw new Error('No principal found');
      }
      return principal;
    } catch (error) {
      console.warn('Error getting principal:', error);
      return undefined;
    }
  }

  // Helper to handle the Result type from Motoko
  private handleResult<T>(result: { ok?: T; err?: any }): T | undefined {
    if ('ok' in result) {
      return result.ok;
    }
    if ('err' in result) {
      console.error('Error from canister:', result.err);
      console.error('Full error details:', JSON.stringify(result.err, null, 2));
      
      // Handle specific error types
      if (result.err && typeof result.err === 'object') {
        if ('NotAuthorized' in result.err) {
          console.error('AUTHORIZATION ERROR: User not authorized for this operation. Make sure you are logged in and set as the canister owner.');
        } else if ('NotFound' in result.err) {
          console.error('NOT FOUND ERROR: The requested resource was not found.');
        } else if ('ValidationError' in result.err) {
          console.error('VALIDATION ERROR:', result.err.ValidationError);
        }
      }
    }
    return undefined;
  }
}

export default ClyprService;