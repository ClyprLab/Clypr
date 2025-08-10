export const idlFactory = ({ IDL }) => {
  const ChannelType = IDL.Variant({
    'sms' : IDL.Null,
    'custom' : IDL.Text,
    'push' : IDL.Null,
    'webhook' : IDL.Null,
    'email' : IDL.Null,
  });
  const ChannelId = IDL.Nat;
  const Error = IDL.Variant({
    'InvalidInput' : IDL.Opt(IDL.Text),
    'NotFound' : IDL.Null,
    'NotAuthorized' : IDL.Null,
    'AlreadyExists' : IDL.Opt(IDL.Text),
    'RateLimitExceeded' : IDL.Null,
    'Other' : IDL.Text,
    'InternalError' : IDL.Null,
  });
  const Result_12 = IDL.Variant({ 'ok' : ChannelId, 'err' : Error });
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
  const Result_11 = IDL.Variant({ 'ok' : RuleId, 'err' : Error });
  const Result = IDL.Variant({ 'ok' : IDL.Null, 'err' : Error });
  const Channel = IDL.Record({
    'id' : ChannelId,
    'channelType' : ChannelType,
    'name' : IDL.Text,
    'createdAt' : IDL.Int,
    'description' : IDL.Opt(IDL.Text),
    'isActive' : IDL.Bool,
    'updatedAt' : IDL.Int,
    'config' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
  });
  const Result_10 = IDL.Variant({ 'ok' : IDL.Vec(Channel), 'err' : Error });
  const MessageStatus = IDL.Variant({
    'blocked' : IDL.Null,
    'delivered' : IDL.Null,
    'processing' : IDL.Null,
    'received' : IDL.Null,
    'failed' : IDL.Null,
  });
  const MessageContent = IDL.Record({
    'title' : IDL.Text,
    'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
    'body' : IDL.Text,
    'priority' : IDL.Nat8,
  });
  const MessageId = IDL.Text;
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
  const Result_9 = IDL.Variant({ 'ok' : IDL.Vec(Message), 'err' : Error });
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
  const Result_8 = IDL.Variant({ 'ok' : IDL.Vec(Rule), 'err' : Error });
  const Result_7 = IDL.Variant({ 'ok' : Channel, 'err' : Error });
  const Result_6 = IDL.Variant({ 'ok' : Message, 'err' : Error });
  const Result_5 = IDL.Variant({ 'ok' : IDL.Text, 'err' : Error });
  const Result_4 = IDL.Variant({ 'ok' : Rule, 'err' : Error });
  const Result_3 = IDL.Variant({
    'ok' : IDL.Record({
      'messagesCount' : IDL.Nat,
      'rulesCount' : IDL.Nat,
      'blockedCount' : IDL.Nat,
      'channelsCount' : IDL.Nat,
      'deliveredCount' : IDL.Nat,
    }),
    'err' : Error,
  });
  const MessageReceipt = IDL.Record({
    'messageId' : MessageId,
    'timestamp' : IDL.Int,
    'received' : IDL.Bool,
  });
  const Result_1 = IDL.Variant({ 'ok' : MessageReceipt, 'err' : Error });
  const Result_2 = IDL.Variant({ 'ok' : IDL.Principal, 'err' : Error });
  return IDL.Service({
    'createChannel' : IDL.Func(
        [
          IDL.Text,
          IDL.Opt(IDL.Text),
          ChannelType,
          IDL.Vec(IDL.Tuple(IDL.Text, IDL.Text)),
        ],
        [Result_12],
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
        [Result_11],
        [],
      ),
    'deleteChannel' : IDL.Func([ChannelId], [Result], []),
    'deleteRule' : IDL.Func([RuleId], [Result], []),
    'getAllChannels' : IDL.Func([], [Result_10], ['query']),
    'getAllMessages' : IDL.Func([], [Result_9], ['query']),
    'getAllRules' : IDL.Func([], [Result_8], ['query']),
    'getChannel' : IDL.Func([ChannelId], [Result_7], ['query']),
    'getMessage' : IDL.Func([MessageId], [Result_6], ['query']),
    'getMyUsername' : IDL.Func([], [Result_5], ['query']),
    'getRule' : IDL.Func([RuleId], [Result_4], ['query']),
    'getStats' : IDL.Func([], [Result_3], ['query']),
    'init' : IDL.Func([], [], []),
    'ping' : IDL.Func([], [IDL.Text], ['query']),
    'processMessage' : IDL.Func(
        [IDL.Text, IDL.Text, MessageContent],
        [Result_1],
        [],
      ),
    'registerUsername' : IDL.Func([IDL.Text], [Result], []),
    'resolveUsername' : IDL.Func([IDL.Text], [Result_2], ['query']),
    'sendMessage' : IDL.Func([IDL.Text, MessageContent], [Result_1], []),
    'updateChannel' : IDL.Func([ChannelId, Channel], [Result], []),
    'updateRule' : IDL.Func([RuleId, Rule], [Result], []),
  });
};
export const init = ({ IDL }) => { return []; };
