import { Actor, HttpAgent, HttpAgentOptions, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';
import { idlFactory } from './clypr.did.js';

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
                              'uxrrr-q7777-77774-qaaaq-cai';

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
