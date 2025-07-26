import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory } from './clypr.did';

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
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan' | 'exists' | 'notExists';
  value: string;
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
    this.agent = new HttpAgent({
      identity,
      host: host || 'http://localhost:4943',
    });
    
    // Only need to do this in development
    if (host?.includes('localhost')) {
      this.agent.fetchRootKey();
    }
    
    // Get canister ID from window.canisterIds
    const canisterId = window.canisterIds?.backend || 'uxrrr-q7777-77774-qaaaq-cai';
    
    this.actor = Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId,
    });
  }
  
  // System
  async ping(): Promise<string> {
    return this.actor.ping();
  }
  
  async setOwner(principal: Principal): Promise<boolean> {
    const result = await this.actor.setOwner(principal);
    return this.handleResult(result);
  }
  
  async getOwner(): Promise<Principal> {
    return this.actor.getOwner();
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
    const result = await this.actor.getAllRules();
    return this.handleResult(result);
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
    const result = await this.actor.getStats();
    return this.handleResult(result);
  }
  
  // Helper to handle the Result type from Motoko
  private handleResult<T>(result: { ok?: T; err?: any }): T | undefined {
    if ('ok' in result) {
      return result.ok;
    }
    if ('err' in result) {
      console.error('Error from canister:', result.err);
    }
    return undefined;
  }
}

export default ClyprService;
