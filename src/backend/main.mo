// Clypr Backend Main Canister
// A privacy gateway for Web3 communications

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Int32 "mo:base/Int32";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Result "mo:base/Result";
import Nat8 "mo:base/Nat8";

import MessageProcessor "./MessageProcessor";
import RuleEngine "./RuleEngine";
import Types "./Types";

persistent actor ClyprCanister {
  // Types
  type UserId = Types.UserId;
  type MessageId = Types.MessageId;
  type RuleId = Types.RuleId;
  type ChannelId = Types.ChannelId;
  
  type Message = Types.Message;
  type MessageContent = Types.MessageContent;
  type MessageReceipt = Types.MessageReceipt;
  type MessageStatus = Types.MessageStatus;
  
  type Rule = Types.Rule;
  type Condition = Types.Condition;
  type Action = Types.Action;
  
  type Channel = Types.Channel;
  type ChannelType = Types.ChannelType;
  type ChannelConfig = Types.ChannelConfig;
  type ChannelValidation = Types.ChannelValidation;
  type RetryConfig = Types.RetryConfig;
  type ValidationConfig = Types.ValidationConfig;
  type ChannelTestResult = Types.ChannelTestResult;
  
  type Error = Types.Error;
  type Result<T, E> = Types.Result<T, E>;
  
  type DispatchJob = Types.DispatchJob;
  type DispatchJobSpec = Types.DispatchJobSpec;
  type DispatchStatus = Types.DispatchStatus;
  
  // Legacy state variables (for migration)
  private stable var owner : Principal = Principal.fromText("2vxsx-fae"); // Default principal
  private stable var owner_v2 : ?Principal = null; // New optional version
  
  // State storage - User-isolated data
  private stable var userRulesEntries : [(UserId, [(RuleId, Rule)])] = [];
  private stable var userChannelsEntries : [(UserId, [(ChannelId, Channel)])] = [];
  private stable var userMessagesEntries : [(UserId, [(MessageId, Message)])] = [];
  private stable var userDispatchJobsEntries : [(UserId, [(Nat, DispatchJob)])] = [];
  private stable var nextRuleId : RuleId = 0;
  private stable var nextChannelId : ChannelId = 0;
  private stable var nextJobId : Nat = 0;

  // Bridge allowlist (stable)
  private stable var authorizedCallersEntries : [Principal] = [];

  // User Alias System State
  private stable var usernameRegistryEntries: [(Text, Principal)] = [];
  private stable var principalToUsernameEntries: [(Principal, Text)] = [];

  // Runtime state - User-isolated data
  private transient var userRules = HashMap.HashMap<UserId, HashMap.HashMap<RuleId, Rule>>(10, Principal.equal, Principal.hash);
  private transient var userChannels = HashMap.HashMap<UserId, HashMap.HashMap<ChannelId, Channel>>(10, Principal.equal, Principal.hash);
  private transient var userMessages = HashMap.HashMap<UserId, HashMap.HashMap<MessageId, Message>>(10, Principal.equal, Principal.hash);
  private transient var userDispatchJobs = HashMap.HashMap<UserId, HashMap.HashMap<Nat, DispatchJob>>(10, Principal.equal, Principal.hash);

  // Bridge allowlist (runtime)
  private transient var authorizedCallers = HashMap.HashMap<Principal, ()>(10, Principal.equal, Principal.hash);
  
  // Rate limiting state
  private stable var rateLimitEntriesV2 : [(UserId, [(ChannelId, Types.RateLimitStatus)])] = [];
  private transient var userRateLimits = HashMap.HashMap<UserId, HashMap.HashMap<ChannelId, Types.RateLimitStatus>>(10, Principal.equal, Principal.hash);
  
  // Scheduled jobs state
  private stable var scheduledJobEntriesV2 : [(Nat, Types.JobSchedule)] = [];
  private transient var scheduledJobs = HashMap.HashMap<Nat, Types.JobSchedule>(100, Nat.equal, func (x) { Nat32.fromNat(x) });

  // System metrics
  private stable var totalMessagesProcessed : Nat = 0;
  private stable var totalJobsScheduled : Nat = 0;
  private stable var totalJobsCompleted : Nat = 0;
  private stable var totalJobsFailed : Nat = 0;

  // Runtime state - Alias System
  private transient var usernameRegistry = HashMap.HashMap<Text, Principal>(10, Text.equal, Text.hash);
  private transient var principalToUsername = HashMap.HashMap<Principal, Text>(10, Principal.equal, Principal.hash);

  
  // Helper functions for user-specific data access
  private func getUserRules(userId : UserId) : HashMap.HashMap<RuleId, Rule> {
    switch (userRules.get(userId)) {
      case null {
        let newRulesMap = HashMap.HashMap<RuleId, Rule>(10, Nat.equal, func (x) { Nat32.fromNat(x) });
        userRules.put(userId, newRulesMap);
        return newRulesMap;
      };
      case (?rulesMap) { return rulesMap; };
    };
  };
  
  private func getUserChannels(userId : UserId) : HashMap.HashMap<ChannelId, Channel> {
    switch (userChannels.get(userId)) {
      case null {
        let newChannelsMap = HashMap.HashMap<ChannelId, Channel>(10, Nat.equal, func (x) { Nat32.fromNat(x) });
        userChannels.put(userId, newChannelsMap);
        return newChannelsMap;
      };
      case (?channelsMap) { return channelsMap; };
    };
  };
  
  private func getUserMessages(userId : UserId) : HashMap.HashMap<MessageId, Message> {
    switch (userMessages.get(userId)) {
      case null {
        let newMessagesMap = HashMap.HashMap<MessageId, Message>(100, Text.equal, Text.hash);
        userMessages.put(userId, newMessagesMap);
        return newMessagesMap;
      };
      case (?messagesMap) { return messagesMap; };
    };
  };

  private func getUserDispatchJobs(userId : UserId) : HashMap.HashMap<Nat, DispatchJob> {
    switch (userDispatchJobs.get(userId)) {
      case null {
        let newJobsMap = HashMap.HashMap<Nat, DispatchJob>(100, Nat.equal, func (x) { Nat32.fromNat(x) });
        userDispatchJobs.put(userId, newJobsMap);
        return newJobsMap;
      };
      case (?jobsMap) { return jobsMap; };
    };
  };
  
  // System Initialization
  public func init() : async () {
    // Initialize runtime state from stable variables
    userRules := HashMap.HashMap<UserId, HashMap.HashMap<RuleId, Rule>>(10, Principal.equal, Principal.hash);
    userChannels := HashMap.HashMap<UserId, HashMap.HashMap<ChannelId, Channel>>(10, Principal.equal, Principal.hash);
    userMessages := HashMap.HashMap<UserId, HashMap.HashMap<MessageId, Message>>(10, Principal.equal, Principal.hash);
    userDispatchJobs := HashMap.HashMap<UserId, HashMap.HashMap<Nat, DispatchJob>>(10, Principal.equal, Principal.hash);
    
    // Restore user data from stable storage
    for ((userId, rulesArray) in userRulesEntries.vals()) {
      let rulesMap = HashMap.fromIter<RuleId, Rule>(Iter.fromArray(rulesArray), 10, Nat.equal, func (x) { Nat32.fromNat(x) });
      userRules.put(userId, rulesMap);
    };
    
    for ((userId, channelsArray) in userChannelsEntries.vals()) {
      let channelsMap = HashMap.fromIter<ChannelId, Channel>(Iter.fromArray(channelsArray), 10, Nat.equal, func (x) { Nat32.fromNat(x) });
      userChannels.put(userId, channelsMap);
    };
    
    for ((userId, messagesArray) in userMessagesEntries.vals()) {
      let messagesMap = HashMap.fromIter<MessageId, Message>(Iter.fromArray(messagesArray), 100, Text.equal, Text.hash);
      userMessages.put(userId, messagesMap);
    };

    // Restore dispatch jobs from stable storage
    for ((userId, jobsArray) in userDispatchJobsEntries.vals()) {
      let jobsMap = HashMap.fromIter<Nat, DispatchJob>(Iter.fromArray(jobsArray), 100, Nat.equal, func (x) { Nat32.fromNat(x) });
      userDispatchJobs.put(userId, jobsMap);
    };

    // Restore alias data
    usernameRegistry := HashMap.fromIter<Text, Principal>(Iter.fromArray(usernameRegistryEntries), 10, Text.equal, Text.hash);
    principalToUsername := HashMap.fromIter<Principal, Text>(Iter.fromArray(principalToUsernameEntries), 10, Principal.equal, Principal.hash);

    // Initialize rate limiting state
    userRateLimits := HashMap.HashMap<UserId, HashMap.HashMap<ChannelId, Types.RateLimitStatus>>(10, Principal.equal, Principal.hash);
    for ((userId, rateLimits) in rateLimitEntriesV2.vals()) {
      let rateLimitMap = HashMap.fromIter<ChannelId, Types.RateLimitStatus>(
        Iter.fromArray(rateLimits),
        10,
        Nat.equal,
        func (x) { Nat32.fromNat(x) }
      );
      userRateLimits.put(userId, rateLimitMap);
    };

    // Restore authorized callers allowlist
    authorizedCallers := HashMap.HashMap<Principal, ()>(10, Principal.equal, Principal.hash);
    for (p in Iter.fromArray(authorizedCallersEntries)) {
      authorizedCallers.put(p, ());
    };

    // Initialize scheduled jobs
    scheduledJobs := HashMap.fromIter<Nat, Types.JobSchedule>(
      Iter.fromArray(scheduledJobEntriesV2),
      100,
      Nat.equal,
      func (x) { Nat32.fromNat(x) }
    );
  };
  
  // Store stable variables before upgrades
  system func preupgrade() {
    // Save user data to stable storage
    userRulesEntries := Iter.toArray(
      Iter.map<(UserId, HashMap.HashMap<RuleId, Rule>), (UserId, [(RuleId, Rule)])>(
        userRules.entries(),
        func ((userId, rulesMap) : (UserId, HashMap.HashMap<RuleId, Rule>)) : (UserId, [(RuleId, Rule)]) {
          (userId, Iter.toArray(rulesMap.entries()))
        }
      )
    );
    
    userChannelsEntries := Iter.toArray(
      Iter.map<(UserId, HashMap.HashMap<ChannelId, Channel>), (UserId, [(ChannelId, Channel)])>(
        userChannels.entries(),
        func ((userId, channelsMap) : (UserId, HashMap.HashMap<ChannelId, Channel>)) : (UserId, [(ChannelId, Channel)]) {
          (userId, Iter.toArray(channelsMap.entries()))
        }
      )
    );

    userMessagesEntries := Iter.toArray(
      Iter.map<(UserId, HashMap.HashMap<MessageId, Message>), (UserId, [(MessageId, Message)])>(
        userMessages.entries(),
        func ((userId, messagesMap) : (UserId, HashMap.HashMap<MessageId, Message>)) : (UserId, [(MessageId, Message)]) {
          (userId, Iter.toArray(messagesMap.entries()))
        }
      )
    );

    userDispatchJobsEntries := Iter.toArray(
      Iter.map<(UserId, HashMap.HashMap<Nat, DispatchJob>), (UserId, [(Nat, DispatchJob)])>(
        userDispatchJobs.entries(),
        func ((userId, jobsMap) : (UserId, HashMap.HashMap<Nat, DispatchJob>)) : (UserId, [(Nat, DispatchJob)]) {
          (userId, Iter.toArray(jobsMap.entries()))
        }
      )
    );

    // Save alias data to stable storage
    usernameRegistryEntries := Iter.toArray(usernameRegistry.entries());
    principalToUsernameEntries := Iter.toArray(principalToUsername.entries());

    // Save rate limiting state
    rateLimitEntriesV2 := Iter.toArray(
      Iter.map<(UserId, HashMap.HashMap<ChannelId, Types.RateLimitStatus>), (UserId, [(ChannelId, Types.RateLimitStatus)])>(
        userRateLimits.entries(),
        func ((userId, rateLimits) : (UserId, HashMap.HashMap<ChannelId, Types.RateLimitStatus>)) : (UserId, [(ChannelId, Types.RateLimitStatus)]) {
          (userId, Iter.toArray(rateLimits.entries()))
        }
      )
    );

    // Save scheduled jobs
    scheduledJobEntriesV2 := Iter.toArray(scheduledJobs.entries());

    // Save authorized callers
    authorizedCallersEntries := Iter.toArray(Iter.map<(Principal, ()), Principal>(authorizedCallers.entries(), func ((p, _)) { p }));
  };
  
  system func postupgrade() {
    // Complete the migration by setting old owner to default and new one to null
    owner := Principal.fromText("2vxsx-fae");
    owner_v2 := null;
    
    // Initialize empty hashmaps
    userRules := HashMap.HashMap<UserId, HashMap.HashMap<RuleId, Rule>>(10, Principal.equal, Principal.hash);
    userChannels := HashMap.HashMap<UserId, HashMap.HashMap<ChannelId, Channel>>(10, Principal.equal, Principal.hash);
    userMessages := HashMap.HashMap<UserId, HashMap.HashMap<MessageId, Message>>(10, Principal.equal, Principal.hash);
    userDispatchJobs := HashMap.HashMap<UserId, HashMap.HashMap<Nat, DispatchJob>>(10, Principal.equal, Principal.hash);
    
    // Restore user data
    for ((userId, rulesArray) in userRulesEntries.vals()) {
      let rulesMap = HashMap.fromIter<RuleId, Rule>(Iter.fromArray(rulesArray), 10, Nat.equal, func (x) { Nat32.fromNat(x) });
      userRules.put(userId, rulesMap);
    };
    
    for ((userId, channelsArray) in userChannelsEntries.vals()) {
      let channelsMap = HashMap.fromIter<ChannelId, Channel>(Iter.fromArray(channelsArray), 10, Nat.equal, func (x) { Nat32.fromNat(x) });
      userChannels.put(userId, channelsMap);
    };
    
    for ((userId, messagesArray) in userMessagesEntries.vals()) {
      let messagesMap = HashMap.fromIter<MessageId, Message>(Iter.fromArray(messagesArray), 100, Text.equal, Text.hash);
      userMessages.put(userId, messagesMap);
    };

    // Restore dispatch jobs from stable storage
    for ((userId, jobsArray) in userDispatchJobsEntries.vals()) {
      let jobsMap = HashMap.fromIter<Nat, DispatchJob>(Iter.fromArray(jobsArray), 100, Nat.equal, func (x) { Nat32.fromNat(x) });
      userDispatchJobs.put(userId, jobsMap);
    };

    // Restore alias data
    usernameRegistry := HashMap.fromIter<Text, Principal>(Iter.fromArray(usernameRegistryEntries), 10, Text.equal, Text.hash);
    principalToUsername := HashMap.fromIter<Principal, Text>(Iter.fromArray(principalToUsernameEntries), 10, Principal.equal, Principal.hash);
  };
  
  // Access Control - Proper user isolation
  func isAuthorized(caller : Principal) : Bool {
    // Each authenticated user can only access their own data
    // Anonymous principals are not allowed for data operations
    return not Principal.isAnonymous(caller);
  };

  // Bridge access control: only allow explicitly authorized principals
  func isAuthorizedBridge(caller : Principal) : Bool {
    switch (authorizedCallers.get(caller)) {
      case (null) { false };
      case (_) { true };
    }
  };

  // Allowlist management (local/dev convenience):
  // Self-service: a caller can add or remove ONLY their own principal.
  // For production, restrict this to an admin/owner.
  public shared(msg) func addAuthorizedSelf() : async Result<(), Error> {
    let p = msg.caller;
    if (Principal.isAnonymous(p)) { return #err(#NotAuthorized); };
    ignore authorizedCallers.put(p, ());
    return #ok();
  };

  public shared(msg) func removeAuthorizedSelf() : async Result<(), Error> {
    let p = msg.caller;
    ignore authorizedCallers.remove(p);
    return #ok();
  };

  public shared query(msg) func listAuthorized() : async Result<[Principal], Error> {
    if (Principal.isAnonymous(msg.caller)) { return #err(#NotAuthorized); };
    return #ok(Iter.toArray(Iter.map<(Principal, ()), Principal>(authorizedCallers.entries(), func ((p, _)) { p })));
  };
  
  // User Profile Management
  public shared(msg) func registerUsername(username: Text) : async Result<(), Error> {
    let caller = msg.caller;
    if (not isAuthorized(caller)) {
      return #err(#NotAuthorized);
    };

    // Validate username format (basic example)
    if (Text.size(username) < 3 or Text.size(username) > 20) {
      return #err(#InvalidInput(?"Username must be between 3 and 20 characters."));
    };

    // Check if username is already taken
    if (usernameRegistry.get(username) != null) {
      return #err(#AlreadyExists(?"Username is already taken."));
    };

    // Check if the principal already has a username
    if (principalToUsername.get(caller) != null) {
      return #err(#AlreadyExists(?"You have already registered a username."));
    };

    usernameRegistry.put(username, caller);
    principalToUsername.put(caller, username);

    return #ok();
  };

  public shared query(msg) func getMyUsername() : async Result<Text, Error> {
    let caller = msg.caller;
    if (not isAuthorized(caller)) {
      return #err(#NotAuthorized);
    };

    switch (principalToUsername.get(caller)) {
      case null { return #err(#NotFound); };
      case (?username) { return #ok(username); };
    };
  };

  public query func resolveUsername(username: Text) : async Result<Principal, Error> {
    switch (usernameRegistry.get(username)) {
      case null { return #err(#NotFound); };
      case (?principal) { return #ok(principal); };
    };
  };
  
  // Rule Management - User-specific data
  public shared(msg) func createRule(
    name : Text, 
    description : ?Text,
    dappPrincipal : ?Principal,
    conditions : [Condition], 
    actions : [Action],
    priority : Nat8
  ) : async Result<RuleId, Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    let userRulesMap = getUserRules(msg.caller);
    let ruleId = nextRuleId;
    nextRuleId += 1;
    
    let now = Time.now();
    let newRule : Rule = {
      id = ruleId;
      name = name;
      description = description;
      dappPrincipal = dappPrincipal;
      conditions = conditions;
      actions = actions;
      priority = priority;
      isActive = true;
      createdAt = now;
      updatedAt = now;
    };
    
    userRulesMap.put(ruleId, newRule);
    return #ok(ruleId);
  };
  
  public shared query(msg) func getRule(ruleId : RuleId) : async Result<Rule, Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    let userRulesMap = getUserRules(msg.caller);
    switch (userRulesMap.get(ruleId)) {
      case null { #err(#NotFound) };
      case (?rule) { #ok(rule) };
    };
  };
  
  public shared query(msg) func getAllRules() : async Result<[Rule], Error> {
    let userRulesMap = getUserRules(msg.caller);
    let rulesArray = Iter.toArray(Iter.map(userRulesMap.vals(), func (r : Rule) : Rule { r }));
    return #ok(rulesArray);
  };
  
  public shared(msg) func updateRule(ruleId : RuleId, updatedRule : Rule) : async Result<(), Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    let userRulesMap = getUserRules(msg.caller);
    switch (userRulesMap.get(ruleId)) {
      case null { return #err(#NotFound); };
      case (?existingRule) {
        let finalRule : Rule = {
          id = ruleId;
          name = updatedRule.name;
          description = updatedRule.description;
          dappPrincipal = updatedRule.dappPrincipal;
          conditions = updatedRule.conditions;
          actions = updatedRule.actions;
          priority = updatedRule.priority;
          isActive = updatedRule.isActive;
          createdAt = existingRule.createdAt;
          updatedAt = Time.now();
        };
        
        userRulesMap.put(ruleId, finalRule);
        return #ok();
      };
    };
  };
  
  public shared(msg) func deleteRule(ruleId : RuleId) : async Result<(), Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    let userRulesMap = getUserRules(msg.caller);
    switch (userRulesMap.get(ruleId)) {
      case null { return #err(#NotFound); };
      case (_) {
        ignore userRulesMap.remove(ruleId);
        return #ok();
      };
    };
  };
  
  // Channel Management - User-specific data
  // Validate channel configuration
  private func validateChannelConfig(channelType : ChannelType, config : ChannelConfig) : Result<ChannelValidation, Error> {
    let validation = switch (channelType, config) {
      case (#email, #email(emailConfig)) {
        // Validate email configuration
        var errors : [Text] = [];
        if (Text.size(emailConfig.fromAddress) == 0) {
          errors := Array.append(errors, ["From address is required"]);
        };
        
        switch (emailConfig.smtp) {
          case (?smtp) {
            if (smtp.port < 1 or smtp.port > 65535) {
              errors := Array.append(errors, ["Invalid SMTP port"]);
            };
            if (Text.size(smtp.host) == 0) {
              errors := Array.append(errors, ["SMTP host is required"]);
            };
          };
          case (null) {
            if (Option.isNull(emailConfig.apiKey)) {
              errors := Array.append(errors, ["Either SMTP or API key is required"]);
            };
          };
        };
        
        {
          configValid = Array.size(errors) == 0;
          authValid = Option.isSome(emailConfig.apiKey) or Option.isSome(emailConfig.smtp);
          testResult = null; // Will be set by testChannel
          errors = errors;
        }
      };
      
      case (#sms, #sms(smsConfig)) {
        var errors : [Text] = [];
        if (Text.size(smsConfig.apiKey) == 0) {
          errors := Array.append(errors, ["API key is required"]);
        };
        if (Text.size(smsConfig.fromNumber) == 0) {
          errors := Array.append(errors, ["From number is required"]);
        };
        
        {
          configValid = Array.size(errors) == 0;
          authValid = Text.size(smsConfig.apiKey) > 0;
          testResult = null;
          errors = errors;
        }
      };
      
      case (#webhook, #webhook(webhookConfig)) {
        var errors : [Text] = [];
        if (Text.size(webhookConfig.url) == 0) {
          errors := Array.append(errors, ["Webhook URL is required"]);
        };
        if (webhookConfig.retryCount > 10) {
          errors := Array.append(errors, ["Maximum retry count is 10"]);
        };
        
        {
          configValid = Array.size(errors) == 0;
          authValid = true; // Auth is optional for webhooks
          testResult = null;
          errors = errors;
        }
      };
      
      case (#push, #push(pushConfig)) {
        var errors : [Text] = [];
        if (Text.size(pushConfig.apiKey) == 0) {
          errors := Array.append(errors, ["API key is required"]);
        };
        if (Text.size(pushConfig.appId) == 0) {
          errors := Array.append(errors, ["App ID is required"]);
        };
        
        {
          configValid = Array.size(errors) == 0;
          authValid = Text.size(pushConfig.apiKey) > 0;
          testResult = null;
          errors = errors;
        }
      };
      
      case (_) {
        {
          configValid = false;
          authValid = false;
          testResult = null;
          errors = ["Invalid channel type and config combination"];
        }
      };
    };
    
    if (not validation.configValid) {
      #err(#InvalidConfig(validation.errors))
    } else {
      #ok(validation)
    }
  };

  public shared(msg) func createChannel(
    name : Text,
    description : ?Text,
    channelType : ChannelType,
    config : ChannelConfig,
    retryConfig : ?RetryConfig,
    validationConfig : ?ValidationConfig
  ) : async Result<ChannelId, Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    // Validate configuration
    switch (validateChannelConfig(channelType, config)) {
      case (#err(e)) { return #err(e); };
      case (#ok(_)) {};
    };
    
    let userChannelsMap = getUserChannels(msg.caller);
    let channelId = nextChannelId;
    nextChannelId += 1;
    
    let now = Time.now();
    let defaultRetry : RetryConfig = {
      maxAttempts = 3;
      backoffMs = 60_000; // 1 minute
      timeoutMs = 30_000; // 30 seconds
    };

    let defaultValidationConfig : Types.ValidationConfig = {
      contentLimits = {
        maxTitleLength = 256;
        maxBodyLength = 10240;
        maxMetadataCount = 10;
        allowedContentTypes = ["text/plain", "application/json"];
      };
      rateLimit = {
        windowMs = 60_000;
        maxRequests = 100;
        perChannel = true;
      };
    };
    
    let newChannel : Channel = {
      id = channelId;
      name = name;
      description = description;
      channelType = channelType;
      config = config;
      retryConfig = Option.get(retryConfig, defaultRetry);
      validationConfig = Option.get(validationConfig, defaultValidationConfig);
      isActive = true;
      createdAt = now;
      updatedAt = now;
    };
    
    userChannelsMap.put(channelId, newChannel);
    return #ok(channelId);
  };
  
  public shared query(msg) func getChannel(channelId : ChannelId) : async Result<Channel, Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    let userChannelsMap = getUserChannels(msg.caller);
    switch (userChannelsMap.get(channelId)) {
      case null { #err(#NotFound) };
      case (?channel) { #ok(channel) };
    };
  };
  
  public shared query(msg) func getAllChannels() : async Result<[Channel], Error> {
    let userChannelsMap = getUserChannels(msg.caller);
    let channelsArray = Iter.toArray(Iter.map(userChannelsMap.vals(), func (c : Channel) : Channel { c }));
    return #ok(channelsArray);
  };
  
  public shared(msg) func updateChannel(channelId : ChannelId, updatedChannel : Channel) : async Result<(), Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    // Validate updated configuration
    switch (validateChannelConfig(updatedChannel.channelType, updatedChannel.config)) {
      case (#err(e)) { return #err(e); };
      case (#ok(_)) {};
    };
    
    let userChannelsMap = getUserChannels(msg.caller);
    switch (userChannelsMap.get(channelId)) {
      case null { return #err(#NotFound); };
      case (?existingChannel) {
        let finalChannel : Channel = {
          id = channelId;
          name = updatedChannel.name;
          description = updatedChannel.description;
          channelType = updatedChannel.channelType;
          config = updatedChannel.config;
          retryConfig = updatedChannel.retryConfig;
          validationConfig = updatedChannel.validationConfig;
          isActive = updatedChannel.isActive;
          createdAt = existingChannel.createdAt;
          updatedAt = Time.now();
        };
        
        userChannelsMap.put(channelId, finalChannel);
        return #ok();
      };
    };
  };

  // Test channel configuration by sending a test message
  public shared(msg) func testChannel(channelId : ChannelId) : async Result<ChannelTestResult, Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };

    let userChannelsMap = getUserChannels(msg.caller);
    switch (userChannelsMap.get(channelId)) {
      case null { return #err(#NotFound); };
      case (?channel) {
        let startTime = Time.now();
        
        // Create test content based on channel type
        let testContent = switch (channel.channelType) {
          case (#email) {
            {
              title = "Test Email from Clypr";
              body = "This is a test email to verify your channel configuration.";
              priority = 1 : Nat8;
              contentType = "text/plain";
              metadata = [];
            }
          };
          case (#sms) {
            {
              title = "";
              body = "Test SMS from Clypr";
              priority = 1 : Nat8;
              contentType = "text/plain";
              metadata = [];
            }
          };
          case (#webhook) {
            {
              title = "test";
              body = "{\"type\":\"test\",\"timestamp\":" # Int.toText(startTime) # "}";
              priority = 1 : Nat8;
              contentType = "application/json";
              metadata = [];
            }
          };
          case (#push) {
            {
              title = "Test Push";
              body = "Test notification from Clypr";
              priority = 1 : Nat8;
              contentType = "text/plain";
              metadata = [];
            }
          };
          case (#custom(t)) {
            {
              title = "Test";
              body = "Custom channel test: " # t;
              priority = 1 : Nat8;
              contentType = "text/plain";
              metadata = [];
            }
          };
        };

        let testMessage = MessageProcessor.createMessage(
          msg.caller,
          msg.caller, // Send to self
          "test",
          testContent
        );

        // Create a test job
        let jobSpec : DispatchJobSpec = {
          messageId = testMessage.messageId;
          recipientId = msg.caller;
          channelId = channelId;
          channelType = channel.channelType;
          channelName = channel.name;
          channelConfig = channel.config;
          messageType = "test";
          content = testContent;
          intents = [];
        };

        // Queue test job
        let jobId = nextJobId;
        nextJobId += 1;

        let job : DispatchJob = {
          id = jobId;
          messageId = jobSpec.messageId;
          recipientId = jobSpec.recipientId;
          channelId = jobSpec.channelId;
          channelType = jobSpec.channelType;
          channelName = jobSpec.channelName;
          channelConfig = jobSpec.channelConfig;
          messageType = jobSpec.messageType;
          content = jobSpec.content;
          intents = jobSpec.intents;
          attempts = 0;
          retryConfig = channel.retryConfig;
          metadata = null;
          createdAt = startTime;
          expiresAt = startTime + 300_000_000_000; // 5 minutes
          status = #pending;
        };

        let userJobsMap = getUserDispatchJobs(msg.caller);
        userJobsMap.put(jobId, job);

        // Return initial test result
        return #ok({
          success = true;
          timestamp = startTime;
          error = null;
          latencyMs = 0;
          metadata = [
            ("jobId", Nat.toText(jobId)),
            ("messageId", testMessage.messageId)
          ];
        });
      };
    };
  };
  
  public shared(msg) func deleteChannel(channelId : ChannelId) : async Result<(), Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    let userChannelsMap = getUserChannels(msg.caller);
    switch (userChannelsMap.get(channelId)) {
      case null { return #err(#NotFound); };
      case (_) {
        ignore userChannelsMap.remove(channelId);
        return #ok();
      };
    };
  };

  // Message validation and rate limiting
  private func validateAndCheckRateLimit(
    channelId : ChannelId,
    userId : Principal,
    content : MessageContent,
    channel : Channel
  ) : Result<(), Error> {
    // Content validation
    switch (MessageProcessor.validateMessageContent(content, channel)) {
      case (#err(e)) { return #err(e); };
      case (#ok(_)) {};
    };

    // Rate limiting
    let userLimits = switch (userRateLimits.get(userId)) {
      case (null) {
        let newMap = HashMap.HashMap<ChannelId, Types.RateLimitStatus>(10, Nat.equal, func (x) { Nat32.fromNat(x) });
        userRateLimits.put(userId, newMap);
        newMap
      };
      case (?map) { map };
    };

    let currentStatus = userLimits.get(channelId);
    switch (MessageProcessor.checkRateLimit(channel, currentStatus)) {
      case (#err(e)) { return #err(e); };
      case (#ok(newStatus)) {
        userLimits.put(channelId, newStatus);
        return #ok();
      };
    };
  };

  // Message Processing - Smart Endpoint for dApps
  /// Deprecated: prefer `notifyAlias` for clearer DX. Kept for backward-compat.
  public shared(msg) func processMessage(
    recipientUsername: Text,
    messageType : Text,
    content : MessageContent
  ) : async Result<MessageReceipt, Error> {
    let senderId = msg.caller;

    // 1. Resolve recipient username to Principal
    let recipientResult = await resolveUsername(recipientUsername);
    let recipientId = switch(recipientResult) {
      case (#err(e)) { return #err(e); };
      case (#ok(p)) { p; };
    };

    // 2. Create the message
    let newMessage = MessageProcessor.createMessage(
      senderId,
      recipientId,
      messageType,
      content
    );

    // 3. Get recipient's data
    let userMessagesMap = getUserMessages(recipientId);
    let userRulesMap = getUserRules(recipientId);
    let userChannelsMap = getUserChannels(recipientId);

    // 4. Store the message
    userMessagesMap.put(newMessage.messageId, newMessage);

    // 5. Get all rules and channels as arrays
    let rulesArray = Iter.toArray(Iter.map(userRulesMap.vals(), func (r : Rule) : Rule { r }));
    let channelsArray = Iter.toArray(Iter.map(userChannelsMap.vals(), func (c : Channel) : Channel { c }));

    // 6. Plan dispatch jobs for the message
    let dispatchPlan = MessageProcessor.planDispatch(newMessage, rulesArray, channelsArray);
    
    // 7. Update message status
    let processedMessage : Message = {
      messageId = newMessage.messageId;
      senderId = newMessage.senderId;
      recipientId = newMessage.recipientId;
      messageType = newMessage.messageType;
      content = newMessage.content;
      timestamp = newMessage.timestamp;
      isProcessed = true;
      status = dispatchPlan.status;
    };
    userMessagesMap.put(processedMessage.messageId, processedMessage);

    // 8. Create dispatch jobs if message is queued
    if (dispatchPlan.status == #queued) {
      Debug.print("Creating dispatch jobs for queued message: " # newMessage.messageId);
      let userJobsMap = getUserDispatchJobs(recipientId);

      label jobLoop for (jobSpec in dispatchPlan.jobs.vals()) {
        // Validate message for this channel
        let channelOpt = Array.find<Channel>(channelsArray, func(c) { c.id == jobSpec.channelId });
        if (Option.isNull(channelOpt)) {
          Debug.print("Channel not found for jobSpec.channelId: " # Nat.toText(jobSpec.channelId));
          continue jobLoop;
        };
        let channel = Option.get(channelOpt, channelsArray[0]); // Safe because checked above

        switch (validateAndCheckRateLimit(jobSpec.channelId, recipientId, jobSpec.content, channel)) {
          case (#err(e)) { Debug.print("Rate limit or validation failed for channel " # Nat.toText(jobSpec.channelId)); continue jobLoop; }; // Skip this channel if validation fails
          case (#ok(_)) {};
        };

        let jobId = nextJobId;
        nextJobId += 1;

        let job : DispatchJob = {
          id = jobId;
          messageId = jobSpec.messageId;
          recipientId = jobSpec.recipientId;
          channelId = jobSpec.channelId;
          channelType = jobSpec.channelType;
          channelName = jobSpec.channelName;
          channelConfig = jobSpec.channelConfig;
          messageType = jobSpec.messageType;
          content = jobSpec.content;
          intents = jobSpec.intents;
          attempts = 0;
          retryConfig = {
            maxAttempts = 3;
            backoffMs = 60_000; // 1 minute
            timeoutMs = 30_000; // 30 seconds
          };
          metadata = null;
          createdAt = Time.now();
          expiresAt = Time.now() + 300_000_000_000; // 5 minutes
          status = #pending;
        };
        userJobsMap.put(jobId, job);
        totalJobsScheduled += 1;
        Debug.print("Queued job " # Nat.toText(jobId) # " for recipient " # Principal.toText(recipientId) # " on channel " # Nat.toText(job.channelId));
        Debug.print("User jobs map size: " # Nat.toText(userJobsMap.size()));
      };
    };

    // 9. Create and return receipt
    let receipt = MessageProcessor.createReceipt(processedMessage);
    totalMessagesProcessed += 1;
    return #ok(receipt);
  };
  
  // New: Clear DX endpoint for dApps addressing by alias
  public shared(msg) func notifyAlias(
    recipientAlias: Text,
    messageType: Text,
    content: MessageContent
  ) : async Result<MessageReceipt, Error> {
    // Delegate to existing logic for now
    return await processMessage(recipientAlias, messageType, content);
  };

  // New: Direct principal addressing (bypasses alias resolution)
  public shared(msg) func notifyPrincipal(
    recipientId: Principal,
    messageType: Text,
    content: MessageContent
  ) : async Result<MessageReceipt, Error> {
    let senderId = msg.caller;

    // Create the message
    let newMessage = MessageProcessor.createMessage(
      senderId,
      recipientId,
      messageType,
      content
    );

    // Get recipient's data
    let userMessagesMap = getUserMessages(recipientId);
    let userRulesMap = getUserRules(recipientId);
    let userChannelsMap = getUserChannels(recipientId);

    // Store the message
    userMessagesMap.put(newMessage.messageId, newMessage);

    // Arrays for processing
    let rulesArray = Iter.toArray(Iter.map(userRulesMap.vals(), func (r : Rule) : Rule { r }));
    let channelsArray = Iter.toArray(Iter.map(userChannelsMap.vals(), func (c : Channel) : Channel { c }));

    // Process via MessageProcessor dispatch planning
    Debug.print("Planning dispatch for message from " # Principal.toText(senderId) # " to " # Principal.toText(recipientId));
    Debug.print("Found " # Nat.toText(rulesArray.size()) # " rules and " # Nat.toText(channelsArray.size()) # " channels");
    
    let dispatchPlan = MessageProcessor.planDispatch(newMessage, rulesArray, channelsArray);
    Debug.print("Dispatch plan status: " # debug_show(dispatchPlan.status));
    
    // Update message status
    let processedMessage : Message = {
      messageId = newMessage.messageId;
      senderId = newMessage.senderId;
      recipientId = newMessage.recipientId;
      messageType = newMessage.messageType;
      content = newMessage.content;
      timestamp = newMessage.timestamp;
      isProcessed = true;
      status = dispatchPlan.status;
    };
    userMessagesMap.put(processedMessage.messageId, processedMessage);

    // Create dispatch jobs if message is queued
    if (dispatchPlan.status == #queued) {
      let userJobsMap = getUserDispatchJobs(recipientId);
      
      for (jobSpec in dispatchPlan.jobs.vals()) {
        let jobId = nextJobId;
        nextJobId += 1;

        let job : DispatchJob = {
          id = jobId;
          messageId = jobSpec.messageId;
          recipientId = jobSpec.recipientId; 
          channelId = jobSpec.channelId;
          channelType = jobSpec.channelType;
          channelName = jobSpec.channelName;
          channelConfig = jobSpec.channelConfig;
          messageType = jobSpec.messageType;
          content = jobSpec.content;
          intents = jobSpec.intents;
          attempts = 0;
          retryConfig = {
            maxAttempts = 3;
            backoffMs = 60_000; // 1 minute
            timeoutMs = 30_000; // 30 seconds
          };
          metadata = null;
          createdAt = Time.now();
          expiresAt = Time.now() + 300_000_000_000; // 5 minutes
          status = #pending;
        };
        userJobsMap.put(jobId, job);
      };
    };

    // Create and return receipt
    let receipt = MessageProcessor.createReceipt(processedMessage);
    return #ok(receipt);
  };

  // Health check endpoint
  public query func ping() : async Text {
    return "Clypr Privacy Gateway - Running";
  };
  
  // System health and monitoring
  public query func getSystemHealth() : async {
    totalMessagesProcessed : Nat;
    totalJobsScheduled : Nat;
    totalJobsCompleted : Nat;
    totalJobsFailed : Nat;
    pendingJobsCount : Nat;
    activeChannelsCount : Nat;
    activeRulesCount : Nat;
    uptime : Int;
  } {
    var pendingJobs = 0;
    var activeChannels = 0;
    var activeRules = 0;

    for ((_, jobsMap) in userDispatchJobs.entries()) {
      for ((_, job) in jobsMap.entries()) {
        if (job.status == #pending) {
          pendingJobs += 1;
        };
      };
    };

    for ((_, channelsMap) in userChannels.entries()) {
      for ((_, channel) in channelsMap.entries()) {
        if (channel.isActive) {
          activeChannels += 1;
        };
      };
    };

    for ((_, rulesMap) in userRules.entries()) {
      for ((_, rule) in rulesMap.entries()) {
        if (rule.isActive) {
          activeRules += 1;
        };
      };
    };

    {
      totalMessagesProcessed;
      totalJobsScheduled;
      totalJobsCompleted;
      totalJobsFailed;
      pendingJobsCount = pendingJobs;
      activeChannelsCount = activeChannels;
      activeRulesCount = activeRules;
      uptime = Time.now();
    }
  };

  // Job cleanup and maintenance
  public shared(msg) func cleanupExpiredJobs() : async Result<Nat, Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };

    let now = Time.now();
    var cleanedCount = 0;

    for ((userId, jobsMap) in userDispatchJobs.entries()) {
      for ((jobId, job) in jobsMap.entries()) {
        if (job.expiresAt < now) {
          ignore jobsMap.remove(jobId);
          cleanedCount += 1;
          if (job.status != #delivered) {
            totalJobsFailed += 1;
          };
        };
      };
    };

    #ok(cleanedCount)
  };

  // Stats and Analytics - User-specific data
  // Bridge API: Get next pending dispatch jobs
  public shared(msg) func nextDispatchJobs(limit : Nat) : async Result<[DispatchJob], Error> {
    if (not isAuthorizedBridge(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    var jobs : Buffer.Buffer<DispatchJob> = Buffer.Buffer(0);
    var count = 0;
    var pendingFound = 0;

    // Poll each user's jobs until we hit the limit
    for ((userId, jobsMap) in userDispatchJobs.entries()) {
      for ((jobId, job) in jobsMap.entries()) {
        if (job.status == #pending) {
          pendingFound += 1;
          jobs.add(job);
          count += 1;
          if (count >= limit) { 
            return #ok(Buffer.toArray(jobs));
          };
        };
      };
    };
    
    Debug.print("Found " # Nat.toText(pendingFound) # " pending jobs");
    return #ok(Buffer.toArray(jobs));
  };

  // Job scheduling and processing
  public shared(msg) func scheduleJob(jobId : Nat, schedule : Types.JobSchedule) : async Result<(), Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };

    scheduledJobs.put(jobId, schedule);
    totalJobsScheduled += 1;
    return #ok();
  };

  // Process scheduled jobs
  public shared(msg) func processScheduledJobs() : async Result<Nat, Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };

    let now = Time.now();
    var processedCount = 0;

    for ((jobId, schedule) in scheduledJobs.entries()) {
      let shouldRun = switch (schedule) {
        case (#immediate) { true };
        case (#delayed(timestamp)) { timestamp <= now };
        case (#recurring({ interval; nextRun })) { nextRun <= now };
      };

      if (shouldRun) {
        // Find the job in user maps
        label jobSearch for ((userId, jobsMap) in userDispatchJobs.entries()) {
          switch (jobsMap.get(jobId)) {
            case (null) { continue jobSearch; };
            case (?job) {
              if (job.status == #pending) {
                // Update recurring schedule if needed
                switch (schedule) {
                  case (#recurring(rec)) {
                    scheduledJobs.put(jobId, #recurring({ 
                      interval = rec.interval;
                      nextRun = now + Int32.toInt(Int32.fromNat32(rec.interval));
                    }));
                  };
                  case (_) {
                    // Remove one-time schedules
                    ignore scheduledJobs.remove(jobId);
                  };
                };

                // Process the job (implementation depends on bridge integration)
                processedCount += 1;
              };
              break jobSearch;
            };
          };
        };
      };
    };

    return #ok(processedCount);
  };

  // Retry failed jobs with exponential backoff
  private func calculateNextRetry(job : Types.DispatchJob) : ?Int {
    if (job.attempts >= Nat8.toNat(job.retryConfig.maxAttempts)) {
      return null;
    };

    // Convert attempts to Nat8 for exponentiation, then to Nat for multiplication
    let exp = Nat8.fromNat(job.attempts);
    let pow = Nat.pow(2, Nat8.toNat(exp));
    let backoff = Nat32.toNat(job.retryConfig.backoffMs) * pow;
    return ?(Int32.toInt(Int32.fromNat32(Nat32.fromNat(backoff))) + Time.now());
  };

  // Bridge API: Acknowledge job delivery status
  public shared(msg) func acknowledgeJobDelivery(jobId : Nat, status : Types.DispatchStatus) : async Result<(), Error> {
    if (not isAuthorizedBridge(msg.caller)) {
      return #err(#NotAuthorized);
    };

    // Find job in user maps (inefficient but works for now)
    for ((userId, jobsMap) in userDispatchJobs.entries()) {
      switch (jobsMap.get(jobId)) {
        case (null) {};
        case (?job) {
          let updatedJob : DispatchJob = {
            id = job.id;
            messageId = job.messageId;
            recipientId = job.recipientId;
            channelId = job.channelId;
            channelType = job.channelType;
            channelName = job.channelName;
            channelConfig = job.channelConfig;
            messageType = job.messageType;
            content = job.content;
            intents = job.intents;
            attempts = job.attempts + 1;
            retryConfig = job.retryConfig;
            metadata = ?{
              attempts = [];
              lastError = null;
              deliveryReport = null;
            };
            createdAt = job.createdAt;
            expiresAt = job.expiresAt;
            status = status;
          };
          jobsMap.put(jobId, updatedJob);

          // Update message status if delivered/failed
          let userMessagesMap = getUserMessages(userId);
          switch (userMessagesMap.get(job.messageId)) {
            case (null) {};
            case (?message) {
              let updatedMessage : Message = {
                messageId = message.messageId;
                senderId = message.senderId;
                recipientId = message.recipientId;
                messageType = message.messageType;
                content = message.content;
                timestamp = message.timestamp;
                isProcessed = true;
                status = switch (status) {
                  case (#delivered) #delivered;
                  case (#failed) #failed;
                  case (#pending) #queued;
                };
              };
              userMessagesMap.put(message.messageId, updatedMessage);
            };
          };

          return #ok();
        };
      };
    };
    return #err(#NotFound);
  };

  // Message retrieval endpoints
  public shared query(msg) func getAllMessages() : async Result<[Message], Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    let userMessagesMap = getUserMessages(msg.caller);
    let messagesArray = Iter.toArray(Iter.map(userMessagesMap.vals(), func (m : Message) : Message { m }));
    return #ok(messagesArray);
  };

  public shared query(msg) func getMessage(messageId : MessageId) : async Result<Message, Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    let userMessagesMap = getUserMessages(msg.caller);
    switch (userMessagesMap.get(messageId)) {
      case null { #err(#NotFound) };
      case (?message) { #ok(message) };
    };
  };

  public shared query(msg) func getStats() : async Result<{
    rulesCount : Nat;
    channelsCount : Nat;
    messagesCount : Nat;
    blockedCount : Nat;
    deliveredCount : Nat;
  }, Error> {
    let userRulesMap = getUserRules(msg.caller);
    let userChannelsMap = getUserChannels(msg.caller);
    let userMessagesMap = getUserMessages(msg.caller);

    var blockedCount = 0;
    var deliveredCount = 0;

    for (message in userMessagesMap.vals()) {
      switch (message.status) {
        case (#blocked) { blockedCount += 1; };
        case (#delivered) { deliveredCount += 1; };
        case (_) {}; // Other statuses
      };
    };

    return #ok({
      rulesCount = userRulesMap.size();
      channelsCount = userChannelsMap.size();
      messagesCount = userMessagesMap.size();
      blockedCount = blockedCount;
      deliveredCount = deliveredCount;
    });
  };
  
  // Debug: Dump all user dispatch jobs (temporary admin endpoint)
  public shared query(msg) func debug_dumpAllDispatchJobs() : async Result<[ { user : Principal; jobs : [DispatchJob] } ], Error> {
    // Restrict to owner or authorized bridge principals
    if (not (Principal.equal(msg.caller, owner) or isAuthorizedBridge(msg.caller))) {
      return #err(#NotAuthorized);
    };

    var out : Buffer.Buffer<{ user : Principal; jobs : [DispatchJob] }> = Buffer.Buffer(0);
    for ((userId, jobsMap) in userDispatchJobs.entries()) {
      let jobsArr = Iter.toArray(jobsMap.vals());
      out.add({ user = userId; jobs = jobsArr });
    };

    return #ok(Buffer.toArray(out));
  };

  // Debug: Dump scheduled jobs (temporary admin endpoint)
  public shared query(msg) func debug_dumpScheduledJobs() : async Result<[(Nat, Types.JobSchedule)], Error> {
    if (not (Principal.equal(msg.caller, owner) or isAuthorizedBridge(msg.caller))) {
      return #err(#NotAuthorized);
    };

    return #ok(Iter.toArray(scheduledJobs.entries()));
  };
}
