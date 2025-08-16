export const idlFactory = ({ IDL }) => {
  const DispatchStatus = IDL.Variant({
    'pending' : IDL.Null,
    'delivered' : IDL.Null,
    'failed' : IDL.Null,
  });
  const ChannelTestResult = IDL.Record({
    'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'error' : IDL.Opt(IDL.Text),
    'latencyMs' : IDL.Nat32,
    'timestamp' : IDL.Int,
    'success' : IDL.Bool,
  });
  const Error = IDL.Variant({
    'InvalidConfig' : IDL.Vec(IDL.Text),
    'InvalidInput' : IDL.Opt(IDL.Text),
    'ChannelError' : ChannelTestResult,
    'NotFound' : IDL.Null,
    'NotAuthorized' : IDL.Null,
    'AlreadyExists' : IDL.Opt(IDL.Text),
    'RateLimitExceeded' : IDL.Null,
    'Other' : IDL.Text,
    'InternalError' : IDL.Null,
  });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const Result_4 = IDL.Variant({ 'ok' : IDL.Nat, 'err' : Error });
  const ChannelType = IDL.Variant({
    'sms' : IDL.Null,
    'custom' : IDL.Text,
    'push' : IDL.Null,
    'telegramContact' : IDL.Null,
    'webhook' : IDL.Null,
    'email' : IDL.Null,
  });
  const SMSConfig = IDL.Record({
    'provider' : IDL.Text,
    'apiKey' : IDL.Text,
    'fromNumber' : IDL.Text,
    'webhookUrl' : IDL.Opt(IDL.Text),
  });
  const PushConfig = IDL.Record({
    'provider' : IDL.Text,
    'appId' : IDL.Text,
    'platform' : IDL.Variant({
      'apn' : IDL.Null,
      'fcm' : IDL.Null,
      'webpush' : IDL.Null,
    }),
    'apiKey' : IDL.Text,
  });
  const WebhookConfig = IDL.Record({
    'url' : IDL.Text,
    'method' : IDL.Text,
    'authType' : IDL.Variant({
      'none' : IDL.Null,
      'bearer' : IDL.Text,
      'basic' : IDL.Record({ 'username' : IDL.Text, 'password' : IDL.Text }),
    }),
    'headers' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'retryCount' : IDL.Nat8,
  });
  const SMTPSettings = IDL.Record({
    'username' : IDL.Text,
    'useTLS' : IDL.Bool,
    'host' : IDL.Text,
    'password' : IDL.Text,
    'port' : IDL.Nat16,
  });
  const EmailConfig = IDL.Record({
    'provider' : IDL.Text,
    'fromAddress' : IDL.Text,
    'smtp' : IDL.Opt(SMTPSettings),
    'apiKey' : IDL.Opt(IDL.Text),
    'replyTo' : IDL.Opt(IDL.Text),
  });
  const ChannelConfig = IDL.Variant({
    'sms' : SMSConfig,
    'custom' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'push' : PushConfig,
    'telegramContact' : IDL.Record({ 'chatId' : IDL.Text }),
    'webhook' : WebhookConfig,
    'email' : EmailConfig,
  });
  const RetryConfig = IDL.Record({
    'timeoutMs' : IDL.Nat32,
    'backoffMs' : IDL.Nat32,
    'maxAttempts' : IDL.Nat8,
  });
  const ContentLimits = IDL.Record({
    'maxTitleLength' : IDL.Nat32,
    'maxMetadataCount' : IDL.Nat32,
    'allowedContentTypes' : IDL.Vec(IDL.Text),
    'maxBodyLength' : IDL.Nat32,
  });
  const RateLimit = IDL.Record({
    'maxRequests' : IDL.Nat32,
    'perChannel' : IDL.Bool,
    'windowMs' : IDL.Nat32,
  });
  const ValidationConfig = IDL.Record({
    'contentLimits' : ContentLimits,
    'rateLimit' : RateLimit,
  });
  const ChannelId = IDL.Nat;
  const Result_19 = IDL.Variant({ 'ok' : ChannelId, 'err' : Error });
  const ConditionOperator = IDL.Variant({
    'contains' : IDL.Null,
    'notExists' : IDL.Null,
    'notEquals' : IDL.Null,
    'notContains' : IDL.Null,
    'greaterThan' : IDL.Null,
    'exists' : IDL.Null,
    'equals' : IDL.Null,
    'lessThan' : IDL.Null,
  });
  const Condition = IDL.Record({
    'field' : IDL.Text,
    'value' : IDL.Text,
    'operator' : ConditionOperator,
  });
  const ActionType = IDL.Variant({
    'allow' : IDL.Null,
    'transform' : IDL.Null,
    'block' : IDL.Null,
    'prioritize' : IDL.Null,
    'route' : IDL.Null,
  });
  const Action = IDL.Record({
    'channelId' : IDL.Opt(ChannelId),
    'parameters' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'actionType' : ActionType,
  });
  const RuleId = IDL.Nat;
  const Result_18 = IDL.Variant({ 'ok' : RuleId, 'err' : Error });
  const MessageContent = IDL.Record({
    'title' : IDL.Text,
    'contentType' : IDL.Text,
    'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'body' : IDL.Text,
    'priority' : IDL.Nat8,
  });
  const MessageId = IDL.Text;
  const AttemptRecord = IDL.Record({
    'status' : DispatchStatus,
    'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'error' : IDL.Opt(IDL.Text),
    'timestamp' : IDL.Int,
  });
  const DeliveryReport = IDL.Record({
    'status' : IDL.Text,
    'channelId' : ChannelId,
    'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'timestamp' : IDL.Int,
    'providerId' : IDL.Text,
  });
  const DispatchMetadata = IDL.Record({
    'attempts' : IDL.Vec(AttemptRecord),
    'deliveryReport' : IDL.Opt(DeliveryReport),
    'lastError' : IDL.Opt(IDL.Text),
  });
  const DispatchJob = IDL.Record({
    'id' : IDL.Nat,
    'status' : DispatchStatus,
    'intents' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'channelName' : IDL.Text,
    'content' : MessageContent,
    'expiresAt' : IDL.Int,
    'channelType' : ChannelType,
    'channelId' : ChannelId,
    'messageId' : MessageId,
    'metadata' : IDL.Opt(DispatchMetadata),
    'createdAt' : IDL.Int,
    'attempts' : IDL.Nat,
    'messageType' : IDL.Text,
    'channelConfig' : ChannelConfig,
    'recipientId' : IDL.Principal,
    'retryConfig' : RetryConfig,
  });
  const Result_17 = IDL.Variant({
    'ok' : IDL.Vec(
      IDL.Record({ 'jobs' : IDL.Vec(DispatchJob), 'user' : IDL.Principal })
    ),
    'err' : Error,
  });
  const JobSchedule = IDL.Variant({
    'delayed' : IDL.Int,
    'recurring' : IDL.Record({ 'interval' : IDL.Nat32, 'nextRun' : IDL.Int }),
    'immediate' : IDL.Null,
  });
  const Result_16 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Tuple(IDL.Nat, JobSchedule)),
    'err' : Error,
  });
  const Channel = IDL.Record({
    'id' : ChannelId,
    'channelType' : ChannelType,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'description' : IDL.Opt(IDL.Text),
    'isActive' : IDL.Bool,
    'updatedAt' : IDL.Int,
    'config' : ChannelConfig,
    'validationConfig' : ValidationConfig,
    'retryConfig' : RetryConfig,
  });
  const Result_15 = IDL.Variant({ 'ok' : IDL.Vec(Channel), 'err' : Error });
  const MessageStatus = IDL.Variant({
    'blocked' : IDL.Null,
    'delivered' : IDL.Null,
    'queued' : IDL.Null,
    'processing' : IDL.Null,
    'received' : IDL.Null,
    'failed' : IDL.Null,
  });
  const Message = IDL.Record({
    'status' : MessageStatus,
    'content' : MessageContent,
    'messageId' : MessageId,
    'messageType' : IDL.Text,
    'timestamp' : IDL.Int,
    'isProcessed' : IDL.Bool,
    'recipientId' : IDL.Principal,
    'senderId' : IDL.Principal,
  });
  const Result_14 = IDL.Variant({ 'ok' : IDL.Vec(Message), 'err' : Error });
  const Rule = IDL.Record({
    'id' : RuleId,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'dappPrincipal' : IDL.Opt(IDL.Principal),
    'description' : IDL.Opt(IDL.Text),
    'actions' : IDL.Vec(Action),
    'isActive' : IDL.Bool,
    'updatedAt' : IDL.Int,
    'conditions' : IDL.Vec(Condition),
    'priority' : IDL.Nat8,
  });
  const Result_13 = IDL.Variant({ 'ok' : IDL.Vec(Rule), 'err' : Error });
  const Result_12 = IDL.Variant({ 'ok' : Channel, 'err' : Error });
  const Result_11 = IDL.Variant({ 'ok' : Message, 'err' : Error });
  const Result_10 = IDL.Variant({ 'ok' : IDL.Text, 'err' : Error });
  const Result_9 = IDL.Variant({ 'ok' : Rule, 'err' : Error });
  const Result_8 = IDL.Variant({
    'ok' : IDL.Record({
      'messagesCount' : IDL.Nat,
      'rulesCount' : IDL.Nat,
      'blockedCount' : IDL.Nat,
      'channelsCount' : IDL.Nat,
      'deliveredCount' : IDL.Nat,
    }),
    'err' : Error,
  });
  const Result_7 = IDL.Variant({
    'ok' : IDL.Vec(IDL.Principal),
    'err' : Error,
  });
  const Result_6 = IDL.Variant({ 'ok' : IDL.Vec(DispatchJob), 'err' : Error });
  const MessageReceipt = IDL.Record({
    'messageId' : MessageId,
    'timestamp' : IDL.Int,
    'received' : IDL.Bool,
  });
  const Result_5 = IDL.Variant({ 'ok' : MessageReceipt, 'err' : Error });
  const Result_3 = IDL.Variant({
    'ok' : IDL.Record({
      'token' : IDL.Text,
      'expiresAt' : IDL.Int,
      'channelId' : IDL.Opt(ChannelId),
    }),
    'err' : Error,
  });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Principal, 'err' : Error });
  const Result_1 = IDL.Variant({ 'ok' : ChannelTestResult, 'err' : Error });
  return IDL.Service({
    'acknowledgeJobDelivery' : IDL.Func(
        [IDL.Nat, DispatchStatus],
        [Result],
        [],
      ),
    'addAuthorizedSelf' : IDL.Func([], [Result], []),
    'bridgeConfirmVerification' : IDL.Func([IDL.Text, IDL.Text], [Result], []),
    'cleanupExpiredJobs' : IDL.Func([], [Result_4], []),
    'createChannel' : IDL.Func(
        [
          IDL.Text,
          IDL.Opt(IDL.Text),
          ChannelType,
          ChannelConfig,
          IDL.Opt(RetryConfig),
          IDL.Opt(ValidationConfig),
        ],
        [Result_19],
        [],
      ),
    'createRule' : IDL.Func(
        [
          IDL.Text,
          IDL.Opt(IDL.Text),
          IDL.Opt(IDL.Principal),
          IDL.Vec(Condition),
          IDL.Vec(Action),
          IDL.Nat8,
        ],
        [Result_18],
        [],
      ),
    'debug_dumpAllDispatchJobs' : IDL.Func([], [Result_17], ['query']),
    'debug_dumpScheduledJobs' : IDL.Func([], [Result_16], ['query']),
    'deleteChannel' : IDL.Func([ChannelId], [Result], []),
    'deleteRule' : IDL.Func([RuleId], [Result], []),
    'getAllChannels' : IDL.Func([], [Result_15], ['query']),
    'getAllMessages' : IDL.Func([], [Result_14], ['query']),
    'getAllRules' : IDL.Func([], [Result_13], ['query']),
    'getChannel' : IDL.Func([ChannelId], [Result_12], ['query']),
    'getMessage' : IDL.Func([MessageId], [Result_11], ['query']),
    'getMyUsername' : IDL.Func([], [Result_10], ['query']),
    'getRule' : IDL.Func([RuleId], [Result_9], ['query']),
    'getStats' : IDL.Func([], [Result_8], ['query']),
    'getSystemHealth' : IDL.Func(
        [],
        [
          IDL.Record({
            'totalJobsScheduled' : IDL.Nat,
            'pendingJobsCount' : IDL.Nat,
            'totalJobsCompleted' : IDL.Nat,
            'activeRulesCount' : IDL.Nat,
            'totalMessagesProcessed' : IDL.Nat,
            'totalJobsFailed' : IDL.Nat,
            'activeChannelsCount' : IDL.Nat,
            'uptime' : IDL.Int,
          }),
        ],
        ['query'],
      ),
    'init' : IDL.Func([], [], []),
    'listAuthorized' : IDL.Func([], [Result_7], ['query']),
    'nextDispatchJobs' : IDL.Func([IDL.Nat], [Result_6], []),
    'notifyAlias' : IDL.Func(
        [IDL.Text, IDL.Text, MessageContent],
        [Result_5],
        [],
      ),
    'notifyPrincipal' : IDL.Func(
        [IDL.Principal, IDL.Text, MessageContent],
        [Result_5],
        [],
      ),
    'ping' : IDL.Func([], [IDL.Text], ['query']),
    'processMessage' : IDL.Func(
        [IDL.Text, IDL.Text, MessageContent],
        [Result_5],
        [],
      ),
    'processScheduledJobs' : IDL.Func([], [Result_4], []),
    'registerUsername' : IDL.Func([IDL.Text], [Result], []),
    'removeAuthorizedSelf' : IDL.Func([], [Result], []),
    'requestTelegramVerification' : IDL.Func(
        [IDL.Opt(IDL.Bool)],
        [Result_3],
        [],
      ),
    'resolveUsername' : IDL.Func([IDL.Text], [Result_2], ['query']),
    'scheduleJob' : IDL.Func([IDL.Nat, JobSchedule], [Result], []),
    'testChannel' : IDL.Func([ChannelId], [Result_1], []),
    'updateChannel' : IDL.Func([ChannelId, Channel], [Result], []),
    'updateRule' : IDL.Func([RuleId, Rule], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
