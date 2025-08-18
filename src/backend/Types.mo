// Types.mo - Common types used throughout the Clypr backend

module {

  // Basic types
  public type UserId = Principal;
  public type MessageId = Text;
  public type RuleId = Nat;
  public type ChannelId = Nat;

  // Message related types
  // Content validation types
  public type ContentLimits = {
    maxTitleLength: Nat32;
    maxBodyLength: Nat32;
    maxMetadataCount: Nat32;
    allowedContentTypes: [Text];
  };

  public type RateLimit = {
    windowMs: Nat32;
    maxRequests: Nat32;
    perChannel: Bool;
  };

  public type ValidationConfig = {
    contentLimits: ContentLimits;
    rateLimit: RateLimit;
  };

  public type MessageContent = {
    title : Text;
    body : Text;
    priority : Nat8;
    metadata : [(Text, Text)];
    contentType : Text; // e.g., "text/plain", "text/html", etc.
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
  public type AttemptRecord = {
    timestamp: Int;
    status: DispatchStatus;
    error: ?Text;
    metadata: [(Text, Text)];
  };

  public type DeliveryReport = {
    channelId: ChannelId;
    providerId: Text;
    timestamp: Int;
    status: Text;
    metadata: [(Text, Text)];
  };

  public type DispatchMetadata = {
    attempts: [AttemptRecord];
    lastError: ?Text;
    deliveryReport: ?DeliveryReport;
  };

  public type DispatchJob = {
    id: Nat;
    messageId: MessageId;
    recipientId: Principal;
    channelId: ChannelId;
    channelType: ChannelType;
    channelName: Text;
    channelConfig: ChannelConfig;
    messageType: Text;
    content: MessageContent;
    intents: [(Text, Text)];
    attempts: Nat;
    retryConfig: RetryConfig;
    metadata: ?DispatchMetadata;
    createdAt: Int;
    expiresAt: Int;
    status: DispatchStatus;
  };

  // Planning-only job spec (no id/attempts/status yet)
  public type DispatchJobSpec = {
    messageId : MessageId;
    recipientId : Principal;
    channelId : ChannelId;
    channelType : ChannelType;
    channelName: Text;
    channelConfig: ChannelConfig;
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
  // Channel configuration types
  public type SMTPSettings = {
    host: Text;
    port: Nat16;
    username: Text;
    password: Text;
    useTLS: Bool;
  };

  public type EmailConfig = {
    provider: Text;
    apiKey: ?Text;
    fromAddress: Text;
    replyTo: ?Text;
    smtp: ?SMTPSettings;
  };

  public type SMSConfig = {
    provider: Text;
    apiKey: Text;
    fromNumber: Text;
    webhookUrl: ?Text;
  };

  public type WebhookConfig = {
    url: Text;
    method: Text;
    headers: [(Text, Text)];
    authType: {
      #none;
      #basic: { username: Text; password: Text };
      #bearer: Text;
    };
    retryCount: Nat8;
  };

  public type PushConfig = {
    provider: Text;
    apiKey: Text;
    appId: Text;
    platform: {
      #fcm;
      #apn;
      #webpush;
    };
  };

  public type ChannelConfig = {
    #email: EmailConfig;
    #sms: SMSConfig;
    #webhook: WebhookConfig;
    #push: PushConfig;
    #custom: [(Text, Text)];
    #telegramContact: { chatId: Text };
  };

  public type RetryConfig = {
    maxAttempts: Nat8;
    backoffMs: Nat32;
    timeoutMs: Nat32;
  };

  public type ChannelType = {
    #email;
    #sms;
    #webhook;
    #push;
    #custom: Text;
    #telegramContact;
  };

  public type Channel = {
    id: ChannelId;
    name: Text;
    description: ?Text;
    channelType: ChannelType;
    config: ChannelConfig;
    retryConfig: RetryConfig;
    validationConfig: ValidationConfig;
    isActive: Bool;
    createdAt: Int;
    updatedAt: Int;
  };

  // Verification types for contact provisioning (e.g., Telegram)
  public type VerificationMethod = {
    #telegram;
    #email;
  };

  public type VerificationRecord = {
    method: VerificationMethod;
    token: Text;     // raw token (short-lived)
    chatId: ?Text;   // populated on confirmation for Telegram
    contact: ?Text;  // generic contact (email or chatId), used for email records
    expiresAt: Int;  // expiry timestamp (nanoseconds)
    verified: Bool;
    channelId: ?ChannelId; // optional placeholder channel created for this verification
  };

  // Rate limiting types
  public type RateLimitStatus = {
    windowStartTime: Int;
    requestCount: Nat32;
    isLimited: Bool;
  };

  public type JobSchedule = {
    #immediate;
    #delayed: Int; // Timestamp for delayed execution
    #recurring: {
      interval: Nat32;  // Interval in milliseconds
      nextRun: Int;     // Next execution timestamp
    };
  };

  // Error types
  public type ChannelTestResult = {
    success: Bool;
    timestamp: Int;
    error: ?Text;
    latencyMs: Nat32;
    metadata: [(Text, Text)];
  };

  public type ChannelValidation = {
    configValid: Bool;
    authValid: Bool;
    testResult: ?ChannelTestResult;
    errors: [Text];
  };

  public type Error = {
    #NotFound;
    #AlreadyExists: ?Text;
    #NotAuthorized;
    #InvalidInput: ?Text;
    #InvalidConfig: [Text];
    #ChannelError: ChannelTestResult;
    #InternalError;
    #RateLimitExceeded;
    #Other: Text;
  };

  public type Result<T, E> = {
    #ok : T;
    #err : E;
  };
}
