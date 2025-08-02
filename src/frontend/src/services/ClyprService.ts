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

  private async init(identityOrHostUrl?: Identity | string) {
    if (typeof window === 'undefined') {
      throw new Error('ClyprService requires a browser environment');
    }
    
    // Determine the host URL based on the current environment
    const defaultHost = 'http://localhost:4943';
    const currentHost = window.location.hostname;
    const currentPort = window.location.port;
    
    let hostUrl: string;
    let identity: Identity | undefined;
    
    // Extract host and identity from the input
    if (typeof identityOrHostUrl === 'string') {
      hostUrl = identityOrHostUrl;
    } else if (identityOrHostUrl) {
      identity = identityOrHostUrl;
      hostUrl = currentPort === '4943' ? `http://${currentHost}:${currentPort}` : defaultHost;
    } else {
      hostUrl = currentPort === '4943' ? `http://${currentHost}:${currentPort}` : defaultHost;
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
      verifySignatures: !isLocalDev
    });

    const agentOptions: HttpAgentOptions = {
      host: hostUrl,
      identity: identity,
      verifyQuerySignatures: !isLocalDev,
      fetch: window.fetch.bind(window)
    };
    
    // Create agent
    this.agent = new HttpAgent(agentOptions);

    // Get canister IDs from environment or use the local development IDs
    const backendCanisterId = process.env.NEXT_PUBLIC_BACKEND_CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai';
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
    this.agent = new HttpAgent({ identity, host: this.agentHost });
    if (this.agentHost.includes('localhost')) {
      await this.agent.fetchRootKey();
    }
    this.actor = Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId: this.canisterId,
    });
  }

  // Legacy authentication for direct service tests
  async authenticate(identity: Identity): Promise<void> {
    if (!identity) throw new Error('Identity is required');
    
    try {
      const principal = identity.getPrincipal();
      console.log('Authenticating with identity:', principal.toText());
      
      // Update agent identity
      this.agent.replaceIdentity(identity);
      console.log('Agent identity replaced');
      
      // Verify the agent now has the correct identity
      const agentPrincipal = this.agent.getPrincipal();
      console.log('Agent principal after replacement:', agentPrincipal.toText());
      
      // Ensure root key is fetched for local development
      if (this.agentHost.includes('localhost')) {
        console.log('Fetching root key for local development...');
        await this.agent.fetchRootKey();
      }
      
      // Recreate actor with new identity
      console.log('Recreating actor with new identity...');
      this.actor = await Actor.createActor(idlFactory, {
        agent: this.agent,
        canisterId: this.canisterId.toString()
      });
      console.log('Actor recreated successfully');
      
      // Verify authentication with ownership check
      try {
        console.log('Setting initial owner...');
        await this.setOwner(principal);
        console.log('Owner set successfully');
      } catch (ownerErr) {
        console.warn('Failed to set owner (may already be set):', ownerErr);
      }
      
      // Verify by ping
      const result = await this.ping();
      console.log('Authenticated ping result:', result);
      
      // Wait a moment for the authentication to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Final verification of identity
      const finalPrincipal = await this.getPrincipal();
      console.log('Final service principal:', finalPrincipal?.toText());
    } catch (err) {
      console.error('Authentication failed:', err);
      throw new Error('Failed to authenticate: ' + String(err));
    }
  }

  private async initializeRootKey(): Promise<void> {
    try {
      console.log('Attempting to fetch root key...');
      await this.agent.fetchRootKey();
      console.log('Root key fetched successfully');
    } catch (error) {
      console.warn('Failed to fetch root key, retrying...', error);
      // Check if this is a network blocking issue
      if (error.message?.includes('Failed to fetch')) {
        console.error('Network request blocked - likely due to ad blocker or browser security settings');
        console.error('Try disabling ad blockers or accessing via incognito mode');
      }
      // Retry once after a short delay
      setTimeout(async () => {
        try {
          console.log('Retrying root key fetch...');
          await this.agent.fetchRootKey();
          console.log('Root key fetched successfully on retry');
        } catch (retryError) {
          console.error('Failed to fetch root key after retry:', retryError);
        }
      }, 1000);
    }
  }
  
  // System
  async ping(): Promise<string> {
    try {
      console.log('Calling ping method...');
      
      // Attempt to reinitialize if actor is missing
      if (!this.actor) {
        console.warn('Actor not initialized, attempting to reinitialize...');
        await this.init();
      }

      // Double-check initialization
      if (!this.actor) {
        throw new Error('Actor initialization failed');
      }

      // For local development, ensure root key is initialized
      if (this.agent && typeof this.agent.isLocal === 'function' && this.agent.isLocal()) {
        await this.initializeRootKey();
      }

      const result = await this.actor.ping();
      console.log('Ping result:', result);
      return result;
    } catch (error) {
      console.error('Error calling ping:', error);
      
      // Handle known error cases
      if (error.message?.includes('Canister') && error.message?.includes('does not belong to any subnet')) {
        console.error('Invalid canister ID. Please check your environment configuration.');
        throw new Error('Invalid canister configuration');
      }
      
      if (error.message?.includes('signature could not be verified')) {
        console.warn('Signature verification error detected. This is common in local development.');
        console.warn('Try running ./fix-local-dev.sh to fix the local environment.');
        return 'Clypr Privacy Gateway - Running (Local Mode)';
      }

      // Handle protocol errors
      if (error.name === 'ProtocolError') {
        console.error('Protocol error details:', {
          status: error.status,
          message: error.message,
          type: error.type
        });
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
      console.log('createRule called with input:', JSON.stringify(ruleInput, null, 2));
      
      // Validate and set defaults
      if (!ruleInput.name) {
        console.error('Rule name is missing or falsy:', ruleInput.name);
        throw new Error('Rule name is required');
      }

      console.log('Rule name validation passed:', ruleInput.name);

      const rule = {
        name: ruleInput.name,
        description: ruleInput.description || '',
        conditions: ruleInput.conditions || [],
        actions: ruleInput.actions || [],
        priority: ruleInput.priority ?? 5 // Default priority
      };
      
      // Log incoming data
      console.log('Creating rule with data:', rule);
      
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
        rule.description ? [rule.description] : [], // This should be opt text, not vec text
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
      
      // Verify we have an authenticated actor
      if (!this.actor) {
        throw new Error('Actor not initialized');
      }
      
      // Check ownership first
      try {
        const owner = await this.getOwner();
        console.log('Current owner:', owner.toText());
        
        const currentIdentity = await this.agent.getPrincipal();
        console.log('Current identity:', currentIdentity.toText());
        
        // If not owner, try to set ownership
        if (owner.toText() !== currentIdentity.toText()) {
          console.log('Current identity is not owner, attempting to set ownership...');
          try {
            await this.setOwner(currentIdentity);
            console.log('Successfully set new owner');
          } catch (setOwnerErr) {
            console.warn('Failed to set owner (may already be set):', setOwnerErr);
          }
        }
      } catch (ownerErr) {
        console.warn('Failed to check/set ownership:', ownerErr);
      }
      
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
