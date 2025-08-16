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
export interface AttemptRecord {
  'status' : DispatchStatus,
  'metadata' : Array<[string, string]>,
  'error' : [] | [string],
  'timestamp' : bigint,
}
export interface Channel {
  'id' : ChannelId,
  'channelType' : ChannelType,
  'name' : string,
  'createdAt' : bigint,
  'description' : [] | [string],
  'isActive' : boolean,
  'updatedAt' : bigint,
  'config' : ChannelConfig,
  'validationConfig' : ValidationConfig,
  'retryConfig' : RetryConfig,
}
export type ChannelConfig = { 'sms' : SMSConfig } |
  { 'custom' : Array<[string, string]> } |
  { 'push' : PushConfig } |
  { 'telegramContact' : { 'chatId' : string } } |
  { 'webhook' : WebhookConfig } |
  { 'email' : EmailConfig };
export type ChannelId = bigint;
export interface ChannelTestResult {
  'metadata' : Array<[string, string]>,
  'error' : [] | [string],
  'latencyMs' : number,
  'timestamp' : bigint,
  'success' : boolean,
}
export type ChannelType = { 'sms' : null } |
  { 'custom' : string } |
  { 'push' : null } |
  { 'telegramContact' : null } |
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
export interface ContentLimits {
  'maxTitleLength' : number,
  'maxMetadataCount' : number,
  'allowedContentTypes' : Array<string>,
  'maxBodyLength' : number,
}
export interface DeliveryReport {
  'status' : string,
  'channelId' : ChannelId,
  'metadata' : Array<[string, string]>,
  'timestamp' : bigint,
  'providerId' : string,
}
export interface DispatchJob {
  'id' : bigint,
  'status' : DispatchStatus,
  'intents' : Array<[string, string]>,
  'channelName' : string,
  'content' : MessageContent,
  'expiresAt' : bigint,
  'channelType' : ChannelType,
  'channelId' : ChannelId,
  'messageId' : MessageId,
  'metadata' : [] | [DispatchMetadata],
  'createdAt' : bigint,
  'attempts' : bigint,
  'messageType' : string,
  'channelConfig' : ChannelConfig,
  'recipientId' : Principal,
  'retryConfig' : RetryConfig,
}
export interface DispatchMetadata {
  'attempts' : Array<AttemptRecord>,
  'deliveryReport' : [] | [DeliveryReport],
  'lastError' : [] | [string],
}
export type DispatchStatus = { 'pending' : null } |
  { 'delivered' : null } |
  { 'failed' : null };
export interface EmailConfig {
  'provider' : string,
  'fromAddress' : string,
  'smtp' : [] | [SMTPSettings],
  'apiKey' : [] | [string],
  'replyTo' : [] | [string],
}
export type Error = { 'InvalidConfig' : Array<string> } |
  { 'InvalidInput' : [] | [string] } |
  { 'ChannelError' : ChannelTestResult } |
  { 'NotFound' : null } |
  { 'NotAuthorized' : null } |
  { 'AlreadyExists' : [] | [string] } |
  { 'RateLimitExceeded' : null } |
  { 'Other' : string } |
  { 'InternalError' : null };
export type JobSchedule = { 'delayed' : bigint } |
  { 'recurring' : { 'interval' : number, 'nextRun' : bigint } } |
  { 'immediate' : null };
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
  'contentType' : string,
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
  { 'queued' : null } |
  { 'processing' : null } |
  { 'received' : null } |
  { 'failed' : null };
export interface PushConfig {
  'provider' : string,
  'appId' : string,
  'platform' : { 'apn' : null } |
    { 'fcm' : null } |
    { 'webpush' : null },
  'apiKey' : string,
}
export interface RateLimit {
  'maxRequests' : number,
  'perChannel' : boolean,
  'windowMs' : number,
}
export type Result = { 'ok' : null } |
  { 'err' : Error };
export type Result_1 = { 'ok' : ChannelTestResult } |
  { 'err' : Error };
export type Result_10 = { 'ok' : string } |
  { 'err' : Error };
export type Result_11 = { 'ok' : Message } |
  { 'err' : Error };
export type Result_12 = { 'ok' : Channel } |
  { 'err' : Error };
export type Result_13 = { 'ok' : Array<Rule> } |
  { 'err' : Error };
export type Result_14 = { 'ok' : Array<Message> } |
  { 'err' : Error };
export type Result_15 = { 'ok' : Array<Channel> } |
  { 'err' : Error };
export type Result_16 = { 'ok' : Array<[bigint, JobSchedule]> } |
  { 'err' : Error };
export type Result_17 = {
    'ok' : Array<{ 'jobs' : Array<DispatchJob>, 'user' : Principal }>
  } |
  { 'err' : Error };
export type Result_18 = { 'ok' : RuleId } |
  { 'err' : Error };
export type Result_19 = { 'ok' : ChannelId } |
  { 'err' : Error };
export type Result_2 = { 'ok' : Principal } |
  { 'err' : Error };
export type Result_3 = {
    'ok' : {
      'token' : string,
      'expiresAt' : bigint,
      'channelId' : [] | [ChannelId],
    }
  } |
  { 'err' : Error };
export type Result_4 = { 'ok' : bigint } |
  { 'err' : Error };
export type Result_5 = { 'ok' : MessageReceipt } |
  { 'err' : Error };
export type Result_6 = { 'ok' : Array<DispatchJob> } |
  { 'err' : Error };
export type Result_7 = { 'ok' : Array<Principal> } |
  { 'err' : Error };
export type Result_8 = {
    'ok' : {
      'messagesCount' : bigint,
      'rulesCount' : bigint,
      'blockedCount' : bigint,
      'channelsCount' : bigint,
      'deliveredCount' : bigint,
    }
  } |
  { 'err' : Error };
export type Result_9 = { 'ok' : Rule } |
  { 'err' : Error };
export interface RetryConfig {
  'timeoutMs' : number,
  'backoffMs' : number,
  'maxAttempts' : number,
}
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
export interface SMSConfig {
  'provider' : string,
  'apiKey' : string,
  'fromNumber' : string,
  'webhookUrl' : [] | [string],
}
export interface SMTPSettings {
  'username' : string,
  'useTLS' : boolean,
  'host' : string,
  'password' : string,
  'port' : number,
}
export interface ValidationConfig {
  'contentLimits' : ContentLimits,
  'rateLimit' : RateLimit,
}
export interface WebhookConfig {
  'url' : string,
  'method' : string,
  'authType' : { 'none' : null } |
    { 'bearer' : string } |
    { 'basic' : { 'username' : string, 'password' : string } },
  'headers' : Array<[string, string]>,
  'retryCount' : number,
}
export interface _SERVICE {
  'acknowledgeJobDelivery' : ActorMethod<[bigint, DispatchStatus], Result>,
  'addAuthorizedSelf' : ActorMethod<[], Result>,
  'bridgeConfirmVerification' : ActorMethod<[string, string], Result>,
  'cleanupExpiredJobs' : ActorMethod<[], Result_4>,
  'createChannel' : ActorMethod<
    [
      string,
      [] | [string],
      ChannelType,
      ChannelConfig,
      [] | [RetryConfig],
      [] | [ValidationConfig],
    ],
    Result_19
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
    Result_18
  >,
  'debug_dumpAllDispatchJobs' : ActorMethod<[], Result_17>,
  'debug_dumpScheduledJobs' : ActorMethod<[], Result_16>,
  'deleteChannel' : ActorMethod<[ChannelId], Result>,
  'deleteRule' : ActorMethod<[RuleId], Result>,
  'getAllChannels' : ActorMethod<[], Result_15>,
  'getAllMessages' : ActorMethod<[], Result_14>,
  'getAllRules' : ActorMethod<[], Result_13>,
  'getChannel' : ActorMethod<[ChannelId], Result_12>,
  'getMessage' : ActorMethod<[MessageId], Result_11>,
  'getMyUsername' : ActorMethod<[], Result_10>,
  'getRule' : ActorMethod<[RuleId], Result_9>,
  'getStats' : ActorMethod<[], Result_8>,
  'getSystemHealth' : ActorMethod<
    [],
    {
      'totalJobsScheduled' : bigint,
      'pendingJobsCount' : bigint,
      'totalJobsCompleted' : bigint,
      'activeRulesCount' : bigint,
      'totalMessagesProcessed' : bigint,
      'totalJobsFailed' : bigint,
      'activeChannelsCount' : bigint,
      'uptime' : bigint,
    }
  >,
  'init' : ActorMethod<[], undefined>,
  'listAuthorized' : ActorMethod<[], Result_7>,
  'nextDispatchJobs' : ActorMethod<[bigint], Result_6>,
  'notifyAlias' : ActorMethod<[string, string, MessageContent], Result_5>,
  'notifyPrincipal' : ActorMethod<
    [Principal, string, MessageContent],
    Result_5
  >,
  'ping' : ActorMethod<[], string>,
  'processMessage' : ActorMethod<[string, string, MessageContent], Result_5>,
  'processScheduledJobs' : ActorMethod<[], Result_4>,
  'registerUsername' : ActorMethod<[string], Result>,
  'removeAuthorizedSelf' : ActorMethod<[], Result>,
  'requestTelegramVerification' : ActorMethod<[[] | [boolean]], Result_3>,
  'resolveUsername' : ActorMethod<[string], Result_2>,
  'scheduleJob' : ActorMethod<[bigint, JobSchedule], Result>,
  'testChannel' : ActorMethod<[ChannelId], Result_1>,
  'updateChannel' : ActorMethod<[ChannelId, Channel], Result>,
  'updateRule' : ActorMethod<[RuleId, Rule], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
