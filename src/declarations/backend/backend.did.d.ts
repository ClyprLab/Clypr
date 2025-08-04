import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Action {
  'channelId' : [] | [ChannelId],
  'parameters' : Array<[string, string]>,
  'actionType' : ActionType,
}
export type ActionType = { 'allow' : null } |
  { 'transform' : null } |
  { 'block' : null } |
  { 'prioritize' : null } |
  { 'route' : null };
export interface Channel {
  'id' : ChannelId,
  'channelType' : ChannelType,
  'name' : string,
  'createdAt' : bigint,
  'description' : [] | [string],
  'isActive' : boolean,
  'updatedAt' : bigint,
  'config' : Array<[string, string]>,
}
export type ChannelId = bigint;
export type ChannelType = { 'sms' : null } |
  { 'custom' : string } |
  { 'push' : null } |
  { 'webhook' : null } |
  { 'email' : null };
export interface Condition {
  'field' : string,
  'value' : string,
  'operator' : ConditionOperator,
}
export type ConditionOperator = { 'contains' : null } |
  { 'notExists' : null } |
  { 'notEquals' : null } |
  { 'notContains' : null } |
  { 'greaterThan' : null } |
  { 'exists' : null } |
  { 'equals' : null } |
  { 'lessThan' : null };
export type Error = { 'InvalidInput' : null } |
  { 'NotFound' : null } |
  { 'NotAuthorized' : null } |
  { 'AlreadyExists' : null } |
  { 'RateLimitExceeded' : null } |
  { 'Other' : string } |
  { 'InternalError' : null };
export interface Message {
  'status' : MessageStatus,
  'content' : MessageContent,
  'messageId' : MessageId,
  'messageType' : string,
  'timestamp' : bigint,
  'isProcessed' : boolean,
  'recipientId' : Principal,
  'senderId' : Principal,
}
export interface MessageContent {
  'title' : string,
  'metadata' : Array<[string, string]>,
  'body' : string,
  'priority' : number,
}
export type MessageId = string;
export interface MessageReceipt {
  'messageId' : MessageId,
  'timestamp' : bigint,
  'received' : boolean,
}
export type MessageStatus = { 'blocked' : null } |
  { 'delivered' : null } |
  { 'processing' : null } |
  { 'received' : null } |
  { 'failed' : null };
export type Result = { 'ok' : null } |
  { 'err' : Error };
export type Result_1 = { 'ok' : MessageReceipt } |
  { 'err' : Error };
export type Result_10 = { 'ok' : ChannelId } |
  { 'err' : Error };
export type Result_2 = {
    'ok' : {
      'messagesCount' : bigint,
      'rulesCount' : bigint,
      'blockedCount' : bigint,
      'channelsCount' : bigint,
      'deliveredCount' : bigint,
    }
  } |
  { 'err' : Error };
export type Result_3 = { 'ok' : Rule } |
  { 'err' : Error };
export type Result_4 = { 'ok' : Message } |
  { 'err' : Error };
export type Result_5 = { 'ok' : Channel } |
  { 'err' : Error };
export type Result_6 = { 'ok' : Array<Rule> } |
  { 'err' : Error };
export type Result_7 = { 'ok' : Array<Message> } |
  { 'err' : Error };
export type Result_8 = { 'ok' : Array<Channel> } |
  { 'err' : Error };
export type Result_9 = { 'ok' : RuleId } |
  { 'err' : Error };
export interface Rule {
  'id' : RuleId,
  'name' : string,
  'createdAt' : bigint,
  'description' : [] | [string],
  'actions' : Array<Action>,
  'isActive' : boolean,
  'updatedAt' : bigint,
  'conditions' : Array<Condition>,
  'priority' : number,
}
export type RuleId = bigint;
export interface _SERVICE {
  'createChannel' : ActorMethod<
    [string, [] | [string], ChannelType, Array<[string, string]>],
    Result_10
  >,
  'createRule' : ActorMethod<
    [string, [] | [string], Array<Condition>, Array<Action>, number],
    Result_9
  >,
  'deleteChannel' : ActorMethod<[ChannelId], Result>,
  'deleteRule' : ActorMethod<[RuleId], Result>,
  'getAllChannels' : ActorMethod<[], Result_8>,
  'getAllMessages' : ActorMethod<[], Result_7>,
  'getAllRules' : ActorMethod<[], Result_6>,
  'getChannel' : ActorMethod<[ChannelId], Result_5>,
  'getMessage' : ActorMethod<[MessageId], Result_4>,
  'getRule' : ActorMethod<[RuleId], Result_3>,
  'getStats' : ActorMethod<[], Result_2>,
  'init' : ActorMethod<[], undefined>,
  'ping' : ActorMethod<[], string>,
  'sendMessage' : ActorMethod<[string, MessageContent], Result_1>,
  'updateChannel' : ActorMethod<[ChannelId, Channel], Result>,
  'updateRule' : ActorMethod<[RuleId, Rule], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
