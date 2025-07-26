import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory } from '../../../declarations/backend/backend.did.js';

// Types that match the Motoko backend
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

export interface Condition {
  field: string;
  operator: { [key: string]: null };  // Variant type for Candid
  value: string;
}

// Helper function to create condition operator variant
export function createOperatorVariant(op: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'exists' | 'notExists'): { [key: string]: null } {
  return { [op]: null };
}

export interface Action {
  actionType: 'allow' | 'block' | 'route' | 'transform' | 'prioritize';
  channelId?: number;
  parameters: [string, string][];
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
  
  constructor(identity?: Identity, host?: string) {
    // Determine the correct host based on environment
    let agentHost = host;
    if (!agentHost) {
      // Check if we're running in a canister subdomain
      if (window.location.hostname.includes('.localhost')) {
        // Use the replica host directly
        agentHost = 'http://localhost:4943';
      } else if (window.location.hostname === 'localhost' && window.location.port === '4943') {
        // Legacy localhost format
        agentHost = 'http://localhost:4943';
      } else {
        // Production or other environment
        agentHost = window.location.origin;
      }
    }
    
    console.log('ClyprService Configuration:', {
      currentUrl: window.location.href,
      hostname: window.location.hostname,
      port: window.location.port,
      agentHost,
      identity: identity ? 'provided' : 'none'
    });
    
    this.agent = new HttpAgent({
      identity: identity,
      host: agentHost,
    });

    // Disable signature verification for local development
    if (agentHost?.includes('localhost') || agentHost?.includes('127.0.0.1')) {
      this.agent.fetchRootKey().catch(err => {
        console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
        console.error(err);
      });
    }
    
    // Only need to do this in development
    if (agentHost?.includes('localhost') || agentHost?.includes('127.0.0.1')) {
      // Retry fetchRootKey with error handling
      this.initRootKey();
    }
    
    // Get canister ID from environment variables
    const canisterId = process.env.CLYPR_CANISTER_ID || window.canisterIds?.backend;
    
    console.log('Using canister ID:', canisterId);
    
    this.actor = Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId,
    });
  }

  private async initRootKey() {
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
      const result = await this.actor.ping();
      console.log('Ping result:', result);
      return result;
    } catch (error) {
      console.error('Error calling ping:', error);
      throw error;
    }
  }
  
  async setOwner(principal: Principal): Promise<boolean> {
    const result = await this.actor.setOwner(principal);
    return this.handleResult(result);
  }
  
  async getOwner(): Promise<Principal> {
    try {
      console.log('Calling getOwner method...');
      const result = await this.actor.getOwner();
      console.log('getOwner result:', result);
      return result;
    } catch (error) {
      console.error('Error calling getOwner:', error);
      throw error;
    }
  }
  
  // Rules
  async createRule(
    name: string,
    description: string | undefined,
    conditions: Condition[],
    actions: Action[],
    priority: number
  ): Promise<number | undefined> {
    const result = await this.actor.createRule(
      name,
      description ? [description] : [],
      conditions,
      actions,
      priority
    );
    return this.handleResult(result);
  }
  
  async getRule(ruleId: number): Promise<Rule | undefined> {
    const result = await this.actor.getRule(ruleId);
    return this.handleResult(result);
  }
  
  async getAllRules(): Promise<Rule[] | undefined> {
    try {
      console.log('Calling getAllRules method...');
      const result = await this.actor.getAllRules();
      console.log('getAllRules result:', result);
      return this.handleResult(result);
    } catch (error) {
      console.error('Error calling getAllRules:', error);
      throw error;
    }
  }
  
  async updateRule(ruleId: number, rule: Rule): Promise<boolean> {
    const result = await this.actor.updateRule(ruleId, rule);
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
