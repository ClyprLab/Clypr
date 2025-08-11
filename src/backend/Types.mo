// Types.mo - Common types used throughout the Clypr backend

module {

  // Basic types
  public type UserId = Principal;
  public type MessageId = Text;
  public type RuleId = Nat;
  public type ChannelId = Nat;

  // Message related types
  public type MessageContent = {
    title : Text;
    body : Text;
    priority : Nat8;
    metadata : [(Text, Text)];
  };

  public type Message = {
    messageId : MessageId;
    senderId : Principal;
    recipientId : Principal;
    messageType : Text;
    content : MessageContent;
    timestamp : Int;
    isProcessed : Bool;
    status : MessageStatus;
  };

  public type IncomingMessage = {
    id: MessageId;
    content: Text;
    sender: Principal;
    timestamp: Int;
  };
  public type MessageStatus = {
    #received;
    #processing;
    #queued;
    #delivered;
    #blocked;
    #failed;
  };

  public type MessageReceipt = {
    messageId : MessageId;
    received : Bool;
    timestamp : Int;
  };

  // Dispatch-related types
  public type DispatchStatus = {
    #pending;
    #delivered;
    #failed;
  };

  // Full persisted DispatchJob (created by main.mo with generated id)
  public type DispatchJob = {
    id : Nat;
    messageId : MessageId;
    recipientId : Principal;
    channelId : ChannelId;
    channelType : ChannelType;
    messageType : Text;
    content : MessageContent;
    intents : [(Text, Text)];
    attempts : Nat;
    createdAt : Int;
    status : DispatchStatus;
  };

  // Planning-only job spec (no id/attempts/status yet)
  public type DispatchJobSpec = {
    messageId : MessageId;
    recipientId : Principal;
    channelId : ChannelId;
    channelType : ChannelType;
    messageType : Text;
    content : MessageContent;
    intents : [(Text, Text)];
  };

  // Rule related types
  public type ConditionOperator = {
    #equals;
    #notEquals;
    #contains;
    #notContains;
    #greaterThan;
    #lessThan;
    #exists;
    #notExists;
  };

  public type Condition = {
    field : Text; // e.g., "sender", "content.title", "content.body", etc.
    operator : ConditionOperator;
    value : Text;
  };

  public type ActionType = {
    #allow;
    #block;
    #route;
    #transform;
    #prioritize;
  };

  public type Action = {
    actionType : ActionType;
    channelId : ?ChannelId;
    parameters : [(Text, Text)]; // Additional parameters for the action
  };

  public type Rule = {
    id : RuleId;
    name : Text;
    description : ?Text;
    dappPrincipal : ?Principal;
    conditions : [Condition];
    actions : [Action];
    priority : Nat8;
    isActive : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  // Channel related types
  public type ChannelType = {
    #email;
    #sms;
    #webhook;
    #push;
    #custom : Text;
  };

  public type Channel = {
    id : ChannelId;
    name : Text;
    description : ?Text;
    channelType : ChannelType;
    config : [(Text, Text)];
    isActive : Bool;
    createdAt : Int;
    updatedAt : Int;
  };

  // Error types
  public type Error = {
    #NotFound;
    #AlreadyExists : ?Text;
    #NotAuthorized;
    #InvalidInput : ?Text;
    #InternalError;
    #RateLimitExceeded;
    #Other : Text;
  };

  public type Result<T, E> = {
    #ok : T;
    #err : E;
  };
}
