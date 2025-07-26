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

  public type MessageStatus = {
    #received;
    #processing;
    #delivered;
    #blocked;
    #failed;
  };

  public type MessageReceipt = {
    messageId : MessageId;
    received : Bool;
    timestamp : Int;
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
    #AlreadyExists;
    #NotAuthorized;
    #InvalidInput;
    #InternalError;
    #RateLimitExceeded;
    #Other : Text;
  };

  public type Result<T, E> = {
    #ok : T;
    #err : E;
  };
}
