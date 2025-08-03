import { Actor, HttpAgent, HttpAgentOptions, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory } from './clypr.did.js';

// Environment configuration
const isProduction = window.location.hostname.endsWith('icp0.io');
const isLocalDev = window.location.hostname.endsWith('.localhost') ||
                  window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1';
const host = isProduction ? 'https://icp0.io' : 'http://localhost:4943';

// Types that match the Motoko backend
// Type definitions for the frontend
export interface Rule {
  id: number;
  name: string;
  description?: string;
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
  channelId?: number;
  parameters: [string, string][];
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
  channelId: number[];  // Empty array for None, [number] for Some
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
  description: string[];  // Empty array for None, [string] for Some
  conditions: BackendCondition[];
  actions: BackendAction[];
  priority: number;
  isActive: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

// Helper functions for converting between frontend and backend formats
export function createOperatorVariant(op: ConditionOperatorString): ConditionOperator {
  const variant = {} as Record<string, null>;
  variant[op] = null;
  return variant as ConditionOperator;
}

export function createActionTypeVariant(type: ActionTypeString): ActionType {
  const variant = {} as Record<string, null>;
  variant[type] = null;
  return variant as ActionType;
}

export function toBackendRule(rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt'>): Omit<BackendRule, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: rule.name,
    description: rule.description ? [rule.description] : [],
    conditions: rule.conditions.map(cond => ({
      field: cond.field,
      operator: createOperatorVariant(cond.operator),
      value: cond.value
    })),
    actions: rule.actions.map(action => ({
      actionType: createActionTypeVariant(action.actionType),
      channelId: action.channelId ? [action.channelId] : [],
      parameters: action.parameters
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
    description: rule.description[0],
    conditions: rule.conditions.map(cond => ({
      field: cond.field,
      operator: operatorToString(cond.operator),
      value: cond.value
    })),
    actions: rule.actions.map(action => ({
      actionType: actionTypeToString(action.actionType),
      channelId: action.channelId[0],
      parameters: action.parameters
    })),
    priority: rule.priority,
    isActive: rule.isActive,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt
  };
}

export interface Channel {
  id: number;
  name: string;
  description?: string;
  channelType: 'email' | 'sms' | 'webhook' | 'push' | { custom: string };
  config: [string, string][];
  isActive: boolean;
  createdAt: bigint;
  updatedAt: bigint;
}

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
  private agent: HttpAgent;
  private actor: any;
  private agentHost: string;
  private canisterId: string | Principal;
  private authClient?: AuthClient;
  
  private static async initialize(identityOrHostUrl?: Identity | string): Promise<ClyprService> {
    const service = new ClyprService();
    await service.init(identityOrHostUrl);
    return service;
  }

  public static create(identityOrHostUrl?: Identity | string): Promise<ClyprService> {
    return ClyprService.initialize(identityOrHostUrl);
  }

  private constructor() {
    // Private constructor, use create() instead
  }

  private async refreshAgent(identity?: Identity) {
    const agentOptions: HttpAgentOptions = {
      host: this.agentHost,
      identity: identity || (this.authClient ? this.authClient.getIdentity() : undefined),
      verifyQuerySignatures: !this.agentHost.includes('localhost'), // Enable verification for production
      fetch: window.fetch.bind(window)
    };

    this.agent = new HttpAgent(agentOptions);

    // Fetch root key only in local development
    if (this.agentHost.includes('localhost')) {
      await this.agent.fetchRootKey().catch(err => {
        console.warn('Failed to fetch root key:', err);
      });
    }

    this.actor = Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId: this.canisterId.toString()
    });
  }

  private async init(identityOrHostUrl?: Identity | string) {
    if (typeof window === 'undefined') {
      throw new Error('ClyprService requires a browser environment');
    }
    
    // Initialize auth client first
    try {
      const { AuthClient } = await import('@dfinity/auth-client');
      this.authClient = await AuthClient.create({
        idleOptions: { disableIdle: true }
      });
    } catch (err) {
      console.error('Failed to initialize auth client:', err);
      throw new Error('Authentication initialization failed');
    }
    
    // Determine the host URL based on the current environment
    const isIcpDomain = window.location.hostname.endsWith('.icp0.io');
    const defaultHost = isIcpDomain ? 'https://icp0.io' : 'http://localhost:4943';
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;
    
    let hostUrl: string;
    let identity: Identity | undefined;
    
    // Extract host and identity from the input or use auth client identity
    if (typeof identityOrHostUrl === 'string') {
      hostUrl = identityOrHostUrl;
      identity = this.authClient.getIdentity();
    } else if (identityOrHostUrl) {
      identity = identityOrHostUrl;
      hostUrl = isIcpDomain ? 'https://icp0.io' : `http://${currentHost}:${currentPort}`;
    } else {
      hostUrl = isIcpDomain ? 'https://icp0.io' : `http://${currentHost}:${currentPort}`;
      identity = this.authClient.getIdentity();
    }
    
    this.agentHost = hostUrl;
    
    // Check if we're in local development
    const isLocalDev = window.location.hostname.endsWith('.localhost') ||
                      window.location.hostname === 'localhost' ||
                      window.location.hostname === '127.0.0.1';
    
    console.log('Environment:', {
      host: hostUrl,
      currentHost,
      currentPort,
      isLocalDev,
      verifySignatures: !isLocalDev,
      hasIdentity: !!identity
    });

    // Configure agent options with production signature verification
    const agentOptions: HttpAgentOptions = {
      host: hostUrl,
      identity: identity,
      verifyQuerySignatures: !isLocalDev, // Enable verification for production
      fetch: window.fetch.bind(window)
    };
    
    // Create agent
    this.agent = new HttpAgent(agentOptions);
    
    // Fetch root key only in local development
    if (this.agentHost.includes('localhost')) {
      try {
        console.log('Local development environment detected, fetching root key...');
        await this.agent.fetchRootKey();
        console.log('Root key fetched successfully');
      } catch (err) {
        console.warn('Failed to fetch root key:', err);
        // Continue anyway as this might be a network error
      }
    } else {
      console.log('Production environment detected, using IC root key');
    }
    
    // Check if user is already authenticated
    if (this.authClient && await this.authClient.isAuthenticated()) {
      const identity = this.authClient.getIdentity();
      agentOptions.identity = identity;
    }

    // Create agent with proper identity if authenticated
    this.agent = new HttpAgent(agentOptions);

    // Determine backend canister ID using local dev flag
    let backendCanisterId: string;
    if (isLocalDev) {
      // In local development, use the injected canister-ids.js
      backendCanisterId = (window as any).canisterIds?.backend;
    } else {
      // In production, prefer Vite env var or injected canister IDs
      backendCanisterId = (window as any).canisterIds?.backend;
    }
    
    if (!backendCanisterId) {
      throw new Error('Backend canister ID not found');
    }
    
    this.canisterId = backendCanisterId;
    console.log('Using backend canister ID:', backendCanisterId);

    // For local development, fetch the root key first
    if (isLocalDev) {
      console.log('Local development environment detected');
      console.log('Attempting to fetch root key...');
      await this.agent.fetchRootKey().catch(err => {
        console.warn('Unable to fetch root key:', err);
        throw new Error('Failed to fetch root key: ' + String(err));
      });
      console.log('Root key fetched successfully');
    }

    // Create actor
    try {
      // Ensure we have a valid canisterId
      if (!this.canisterId) {
        throw new Error('Canister ID is not configured');
      }

      // Create actor with proper initialization
      this.actor = await Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: this.canisterId.toString()
      });

      // Verify actor creation with a test call
      try {
        await this.actor.ping();
        console.log('Actor initialized successfully');
      } catch (pingErr) {
        console.warn('Actor initialized but ping failed:', pingErr);
        // Continue anyway as some methods might still work
      }
    } catch (err) {
      console.error('Failed to create actor:', err);
      throw new Error('Failed to create actor: ' + String(err));
    }
  }
  /**
   * Authenticate via Internet Identity and reinitialize the agent and actor
   */
  /** Authenticate using Internet Identity */
  async loginViaInternetIdentity(): Promise<void> {
    const { AuthClient } = await import('@dfinity/auth-client');
    
    try {
      // Create auth client with proper configuration
      this.authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: true // Prevent automatic logout
        }
      });

      // Determine the Identity Provider URL based on environment
      const identityProvider = isProduction
        ? 'https://identity.ic0.app'
        : `http://${(window as any).canisterIds?.internet_identity}.localhost:4943`;

      // Configure login options
      const loginOptions = {
        identityProvider,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
        derivationOrigin: isProduction ? 'https://5nif7-uaaaa-aaaag-aufha-cai.icp0.io' : undefined,
      };

      // Perform login
      await this.authClient.login(loginOptions);
      
      if (!await this.authClient.isAuthenticated()) {
        throw new Error('Login failed - user not authenticated');
      }

      // Get identity
      const identity = this.authClient.getIdentity();
      const principal = identity.getPrincipal();
      console.log('Authenticated with identity:', principal.toText());

      // Reinitialize agent with authenticated identity and environment-aware configuration
      this.agent = new HttpAgent({
        host: this.agentHost,
        identity: identity,
        verifyQuerySignatures: !this.agentHost.includes('localhost'),
      });

      // Fetch root key if in local development
      if (this.agentHost.includes('localhost')) {
        await this.agent.fetchRootKey();
      }

      // Create new actor with authenticated agent
      this.actor = Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: this.canisterId.toString()
      });

      // Verify authentication with a ping
      const pingResult = await this.ping();
      console.log('Authentication verified with ping:', pingResult);

      // Check/set owner
      try {
        const owner = await this.getOwner();
        console.log('Current owner:', owner.toText());

        if (owner.toText() !== principal.toText()) {
          console.log('Setting new owner...');
          const setOwnerResult = await this.setOwner(principal);
          console.log('Set owner result:', setOwnerResult);
        } else {
          console.log('Identity is already the owner');
        }
      } catch (ownerErr) {
        console.warn('Owner verification failed:', ownerErr);
        // Don't throw, as this might be a permission issue we need to fix
      }

    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Failed to complete login: ' + String(error));
    }
  }

  // Legacy authentication for direct service tests
  async authenticate(identity: Identity): Promise<void> {
    if (!identity) throw new Error('Identity is required');
    
    try {
      const principal = identity.getPrincipal();
      console.log('Authenticating with identity:', principal.toText());
      
      // Create new agent with environment-aware configuration
      const agentOptions: HttpAgentOptions = {
        host: this.agentHost,
        identity: identity,
        verifyQuerySignatures: !this.agentHost.includes('localhost'),
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
      
      // Verify authentication with ownership check
      try {
        // Get current owner
        const currentOwner = await this.getOwner();
        console.log('Current owner:', currentOwner.toText());
        
        // If not owner, try to set ownership
        if (currentOwner.toText() !== principal.toText()) {
          console.log('Setting new owner...');
          const setOwnerResult = await this.setOwner(principal);
          if (setOwnerResult) {
            console.log('Successfully set new owner');
          } else {
            console.warn('Failed to set owner - continuing anyway');
          }
        } else {
          console.log('Identity is already the owner');
        }
      } catch (ownerErr) {
        console.warn('Owner check/set failed:', ownerErr);
        // Continue anyway as this might be a permission issue we're trying to fix
      }
      
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
      // Create agent with environment-aware configuration
      const agentOptions: HttpAgentOptions = {
        host: this.agentHost,
        verifyQuerySignatures: !this.agentHost.includes('localhost'), // Enable verification for production
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
  
  async getOwner(): Promise<Principal> {
    try {
      console.log('Calling getOwner method...');
      const result = await this.actor.getOwner();
      console.log('getOwner result:', result);
      
      // Handle potential variant response
      if (result && typeof result === 'object') {
        if ('ok' in result) {
          return result.ok;
        } else if ('err' in result) {
          throw new Error(`Failed to get owner: ${result.err}`);
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error calling getOwner:', error);
      throw error;
    }
  }
  
  // Rules
  async createRule(ruleInput: {
    name: string;
    description?: string;
    conditions?: Condition[];
    actions?: Action[];
    priority?: number;
  }): Promise<number | undefined> {
    try {
      // Check authentication and actor state
      if (!this.actor) {
        throw new Error('Not initialized. Please authenticate first.');
      }
      
      if (!this.authClient || !(await this.authClient.isAuthenticated())) {
        throw new Error('Not authenticated. Please log in first.');
      }

      // Validate and set defaults
      if (!ruleInput.name) {
        throw new Error('Rule name is required');
      }
      
      // Ensure we have the latest identity
      const identity = this.authClient.getIdentity();
      this.agent = new HttpAgent({
        host: this.agentHost,
        identity,
      });
      
      // Fetch root key in local development
      if (!isProduction) {
        await this.agent.fetchRootKey().catch(err => {
          console.warn('Failed to fetch root key:', err);
        });
      }

      const rule = {
        name: ruleInput.name,
        description: ruleInput.description || '',
        conditions: ruleInput.conditions || [],
        actions: ruleInput.actions || [],
        priority: ruleInput.priority ?? 5 // Default priority
      };
      
      // Log incoming data
      console.log('Creating rule with normalized data:', JSON.stringify(rule, null, 2));
      
      // Convert conditions to backend format with proper variant structure
      const backendConditions: BackendCondition[] = rule.conditions.map(cond => ({
        field: cond.field || '',
        operator: createOperatorVariant(cond.operator || 'exists'),
        value: cond.value || ''
      }));

      // Convert actions to backend format with proper variant structure
      const backendActions: BackendAction[] = rule.actions.map(action => ({
        actionType: createActionTypeVariant(action.actionType || 'allow'),
        channelId: action.channelId ? [action.channelId] : [],
        parameters: action.parameters || []
      }));

      // Log converted formats
      console.log('Backend format:', {
        name: rule.name,
        description: rule.description ? [rule.description] : [],
        conditions: backendConditions,
        actions: backendActions,
        priority: rule.priority
      });
      
      // Call createRule with the exact parameters the Candid interface expects
      const result = await this.actor.createRule(
        rule.name,
        rule.description ? [rule.description] : [],
        backendConditions,
        backendActions,
        rule.priority
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
      
      console.log('Create rule result:', result);
      return this.handleResult(result);
    } catch (error) {
      console.error('Error in createRule:', error);
      throw error;
    }
  }
  
  async getRule(ruleId: number): Promise<Rule | undefined> {
    const result = await this.actor.getRule(ruleId);
    return this.handleResult(result);
  }
  
  async getAllRules(): Promise<Rule[] | undefined> {
    try {
      console.log('Calling getAllRules method...');
      
      // First check for authentication
      if (!this.authClient) {
        throw new Error('Auth client not initialized. Please log in first.');
      }

      if (!await this.authClient.isAuthenticated()) {
        throw new Error('Not authenticated. Please log in first.');
      }

      // Get identity and verify actor initialization
      const identity = this.authClient.getIdentity();
      if (!identity) {
        throw new Error('No identity found. Please log in first.');
      }

      // Ensure actor is initialized with current identity
      if (!this.actor) {
        console.log('Actor not initialized, creating new actor...');
        await this.refreshAgent(identity);
      } else {
        // Verify actor's identity matches current identity
        const agentPrincipal = await this.agent.getPrincipal();
        const currentPrincipal = identity.getPrincipal();
        
        if (agentPrincipal.toText() !== currentPrincipal.toText()) {
          console.log('Actor identity mismatch, refreshing agent...');
          await this.refreshAgent(identity);
        }
      }

      // Attempt the actual operation
      const result = await this.actor.getAllRules();
      console.log('getAllRules result:', result);
      
      if ('ok' in result) {
        // Convert backend rules to frontend format
        const rules = result.ok.map(rule => {
          try {
            return fromBackendRule(rule);
          } catch (convErr) {
            console.error('Failed to convert rule:', rule, convErr);
            return null;
          }
        }).filter((rule): rule is Rule => rule !== null);
        
        console.log('Retrieved rules:', rules.length);
        return rules;
      } else if ('err' in result) {
        if ('NotAuthorized' in result.err) {
          console.error('Not authorized to access rules. Current identity may not be the owner.');
          throw new Error('Not authorized to access rules - ensure current identity is the owner');
        }
        console.error('getAllRules error:', result.err);
        return [];
      }
      
      return [];
    } catch (error) {
      console.error('Error calling getAllRules:', error);
      throw error;
    }
  }
  
  async updateRule(ruleId: number, rule: Rule): Promise<boolean> {
    const ruleData = toBackendRule(rule);
    const result = await this.actor.updateRule(ruleId, ruleData);
    return this.handleResult(result) !== undefined;
  }
  
  async deleteRule(ruleId: number): Promise<boolean> {
    const result = await this.actor.deleteRule(ruleId);
    return this.handleResult(result) !== undefined;
  }
  
  // Channels
  async createChannel(
    name: string,
    description: string | undefined,
    channelType: Channel['channelType'],
    config: [string, string][]
  ): Promise<number | undefined> {
    const result = await this.actor.createChannel(
      name,
      description ? [description] : [],
      channelType,
      config
    );
    return this.handleResult(result);
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
    const result = await this.actor.updateChannel(channelId, channel);
    return this.handleResult(result) !== undefined;
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
  
  async getMessage(messageId: string): Promise<Message | undefined> {
    const result = await this.actor.getMessage(messageId);
    return this.handleResult(result);
  }
  
  async getAllMessages(): Promise<Message[] | undefined> {
    const result = await this.actor.getAllMessages();
    return this.handleResult(result);
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
          // Authentication error - try to refresh agent and retry
          if (this.authClient) {
            this.refreshAgent(this.authClient.getIdentity())
              .then(() => {
                console.log('Refreshed agent after authorization error');
              })
              .catch(err => {
                console.error('Failed to refresh agent:', err);
              });
          }
          throw new Error('Not authorized. Please verify you are logged in and set as the canister owner.');
        } else if ('NotFound' in result.err) {
          throw new Error('The requested resource was not found.');
        } else if ('ValidationError' in result.err) {
          throw new Error(`Validation error: ${result.err.ValidationError}`);
        }
      }
      
      // Generic error case
      throw new Error(`Operation failed: ${JSON.stringify(result.err)}`);
    }
    
    return undefined;
  }
}

const serviceInstance = {
  async create(identityOrHostUrl?: Identity | string): Promise<ClyprService> {
    return ClyprService.create(identityOrHostUrl);
  }
};

export default serviceInstance;