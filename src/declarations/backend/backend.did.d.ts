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
export type Error = { 'InvalidInput' : [] | [string] } |
  { 'NotFound' : null } |
  { 'NotAuthorized' : null } |
  { 'AlreadyExists' : [] | [string] } |
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
export type Result_10 = { 'ok' : Array<Channel> } |
  { 'err' : Error };
export type Result_11 = { 'ok' : RuleId } |
  { 'err' : Error };
export type Result_12 = { 'ok' : ChannelId } |
  { 'err' : Error };
export type Result_2 = { 'ok' : Principal } |
  { 'err' : Error };
export type Result_3 = {
    'ok' : {
      'messagesCount' : bigint,
      'rulesCount' : bigint,
      'blockedCount' : bigint,
      'channelsCount' : bigint,
      'deliveredCount' : bigint,
    }
  } |
  { 'err' : Error };
export type Result_4 = { 'ok' : Rule } |
  { 'err' : Error };
export type Result_5 = { 'ok' : string } |
  { 'err' : Error };
export type Result_6 = { 'ok' : Message } |
  { 'err' : Error };
export type Result_7 = { 'ok' : Channel } |
  { 'err' : Error };
export type Result_8 = { 'ok' : Array<Rule> } |
  { 'err' : Error };
export type Result_9 = { 'ok' : Array<Message> } |
  { 'err' : Error };
export interface Rule {
  'id' : RuleId,
  'name' : string,
  'createdAt' : bigint,
  'dappPrincipal' : [] | [Principal],
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
    Result_12
  >,
  'createRule' : ActorMethod<
    [
      string,
      [] | [string],
      [] | [Principal],
      Array<Condition>,
      Array<Action>,
      number,
    ],
    Result_11
  >,
  'deleteChannel' : ActorMethod<[ChannelId], Result>,
  'deleteRule' : ActorMethod<[RuleId], Result>,
  'getAllChannels' : ActorMethod<[], Result_10>,
  'getAllMessages' : ActorMethod<[], Result_9>,
  'getAllRules' : ActorMethod<[], Result_8>,
  'getChannel' : ActorMethod<[ChannelId], Result_7>,
  'getMessage' : ActorMethod<[MessageId], Result_6>,
  'getMyUsername' : ActorMethod<[], Result_5>,
  'getRule' : ActorMethod<[RuleId], Result_4>,
  'getStats' : ActorMethod<[], Result_3>,
  'init' : ActorMethod<[], undefined>,
  'ping' : ActorMethod<[], string>,
  'processMessage' : ActorMethod<[string, string, MessageContent], Result_1>,
  'registerUsername' : ActorMethod<[string], Result>,
  'resolveUsername' : ActorMethod<[string], Result_2>,
  'sendMessage' : ActorMethod<[string, MessageContent], Result_1>,
  'updateChannel' : ActorMethod<[ChannelId, Channel], Result>,
  'updateRule' : ActorMethod<[RuleId, Rule], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
