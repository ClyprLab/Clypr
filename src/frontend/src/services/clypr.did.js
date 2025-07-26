export const idlFactory = ({ IDL }) => {
  const Error = IDL.Variant({
    'NotFound' : IDL.Null,
    'AlreadyExists' : IDL.Null,
    'NotAuthorized' : IDL.Null,
    'InvalidInput' : IDL.Null,
    'InternalError' : IDL.Null,
    'RateLimitExceeded' : IDL.Null,
    'Other' : IDL.Text,
  });
  
  const RuleId = IDL.Nat;
  const Text = IDL.Text;
  const ConditionOperator = IDL.Variant({
    'equals' : IDL.Null,
    'notEquals' : IDL.Null,
    'contains' : IDL.Null,
    'notContains' : IDL.Null,
    'greaterThan' : IDL.Null,
    'lessThan' : IDL.Null,
    'exists' : IDL.Null,
    'notExists' : IDL.Null,
  });
  
  const Condition = IDL.Record({
    'field' : Text,
    'operator' : ConditionOperator,
    'value' : Text,
  });
  
  const ChannelId = IDL.Nat;
  const ActionType = IDL.Variant({
    'allow' : IDL.Null,
    'block' : IDL.Null,
    'route' : IDL.Null,
    'transform' : IDL.Null,
    'prioritize' : IDL.Null,
  });
  
  const Action = IDL.Record({
    'actionType' : ActionType,
    'channelId' : IDL.Opt(ChannelId),
    'parameters' : IDL.Vec(IDL.Tuple(Text, Text)),
  });
  
  const Rule = IDL.Record({
    'id' : RuleId,
    'name' : Text,
    'description' : IDL.Opt(Text),
    'conditions' : IDL.Vec(Condition),
    'actions' : IDL.Vec(Action),
    'priority' : IDL.Nat8,
    'isActive' : IDL.Bool,
    'createdAt' : IDL.Int,
    'updatedAt' : IDL.Int,
  });
  
  const Result = variant => IDL.Variant({ 'ok' : variant, 'err' : Error });
  
  const ChannelType = IDL.Variant({
    'email' : IDL.Null,
    'sms' : IDL.Null,
    'webhook' : IDL.Null,
    'push' : IDL.Null,
    'custom' : Text,
  });
  
  const Channel = IDL.Record({
    'id' : ChannelId,
    'name' : Text,
    'description' : IDL.Opt(Text),
    'channelType' : ChannelType,
    'config' : IDL.Vec(IDL.Tuple(Text, Text)),
    'isActive' : IDL.Bool,
    'createdAt' : IDL.Int,
    'updatedAt' : IDL.Int,
  });
  
  const MessageId = Text;
  const MessageStatus = IDL.Variant({
    'received' : IDL.Null,
    'processing' : IDL.Null,
    'delivered' : IDL.Null,
    'blocked' : IDL.Null,
    'failed' : IDL.Null,
  });
  
  const MessageContent = IDL.Record({
    'title' : Text,
    'body' : Text,
    'priority' : IDL.Nat8,
    'metadata' : IDL.Vec(IDL.Tuple(Text, Text)),
  });
  
  const Message = IDL.Record({
    'messageId' : MessageId,
    'senderId' : IDL.Principal,
    'recipientId' : IDL.Principal,
    'messageType' : Text,
    'content' : MessageContent,
    'timestamp' : IDL.Int,
    'isProcessed' : IDL.Bool,
    'status' : MessageStatus,
  });
  
  const MessageReceipt = IDL.Record({
    'messageId' : MessageId,
    'received' : IDL.Bool,
    'timestamp' : IDL.Int,
  });
  
  const Stats = IDL.Record({
    'rulesCount' : IDL.Nat,
    'channelsCount' : IDL.Nat,
    'messagesCount' : IDL.Nat,
    'blockedCount' : IDL.Nat,
    'deliveredCount' : IDL.Nat,
  });
  
  return IDL.Service({
    'init' : IDL.Func([], [], []),
    'ping' : IDL.Func([], [IDL.Text], ['query']),
    'setOwner' : IDL.Func([IDL.Principal], [Result(IDL.Null)], []),
    'getOwner' : IDL.Func([], [IDL.Principal], ['query']),
    
    'createRule' : IDL.Func(
        [Text, IDL.Opt(Text), IDL.Vec(Condition), IDL.Vec(Action), IDL.Nat8],
        [Result(RuleId)],
        [],
    ),
    'getRule' : IDL.Func([RuleId], [Result(Rule)], ['query']),
    'getAllRules' : IDL.Func([], [Result(IDL.Vec(Rule))], ['query']),
    'updateRule' : IDL.Func([RuleId, Rule], [Result(IDL.Null)], []),
    'deleteRule' : IDL.Func([RuleId], [Result(IDL.Null)], []),
    
    'createChannel' : IDL.Func(
        [Text, IDL.Opt(Text), ChannelType, IDL.Vec(IDL.Tuple(Text, Text))],
        [Result(ChannelId)],
        [],
    ),
    'getChannel' : IDL.Func([ChannelId], [Result(Channel)], ['query']),
    'getAllChannels' : IDL.Func([], [Result(IDL.Vec(Channel))], ['query']),
    'updateChannel' : IDL.Func([ChannelId, Channel], [Result(IDL.Null)], []),
    'deleteChannel' : IDL.Func([ChannelId], [Result(IDL.Null)], []),
    
    'sendMessage' : IDL.Func([Text, MessageContent], [Result(MessageReceipt)], []),
    'getMessage' : IDL.Func([MessageId], [Result(Message)], ['query']),
    'getAllMessages' : IDL.Func([], [Result(IDL.Vec(Message))], ['query']),
    
    'getStats' : IDL.Func([], [Result(Stats)], ['query']),
  });
};

export const init = ({ IDL }) => { return []; };
