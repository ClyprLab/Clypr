// Clypr Backend Main Canister
// A privacy gateway for Web3 communications

import Buffer "mo:base/Buffer";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

import MessageProcessor "./MessageProcessor";
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
  type DispatchJob = Types.DispatchJob;
  type DispatchJobSpec = Types.DispatchJobSpec;
  type DispatchStatus = Types.DispatchStatus;
  
  type Error = Types.Error;
  type Result<T, E> = Types.Result<T, E>;
  
  // Legacy state variables (for migration)
  private var owner : Principal = Principal.fromText("2vxsx-fae"); // Default principal
  private var owner_v2 : ?Principal = null; // New optional version
  
  // State storage - User-isolated data
  private var userRulesEntries : [(UserId, [(RuleId, Rule)])] = [];
  private var userChannelsEntries : [(UserId, [(ChannelId, Channel)])] = [];
  private var userMessagesEntries : [(UserId, [(MessageId, Message)])] = [];
  // Dispatch queue storage
  private var userDispatchJobsEntries : [(UserId, [(Nat, DispatchJob)])] = [];
  private var jobOwnerEntries : [(Nat, UserId)] = [];
  private var nextJobId : Nat = 0;
  private var nextRuleId : RuleId = 0;
  private var nextChannelId : ChannelId = 0;

  // User Alias System State
  private var usernameRegistryEntries: [(Text, Principal)] = [];
  private var principalToUsernameEntries: [(Principal, Text)] = [];

  // Runtime state - User-isolated data
  private transient var userRules = HashMap.HashMap<UserId, HashMap.HashMap<RuleId, Rule>>(10, Principal.equal, Principal.hash);
  private transient var userChannels = HashMap.HashMap<UserId, HashMap.HashMap<ChannelId, Channel>>(10, Principal.equal, Principal.hash);
  private transient var userMessages = HashMap.HashMap<UserId, HashMap.HashMap<MessageId, Message>>(10, Principal.equal, Principal.hash);
  private transient var userDispatchJobs = HashMap.HashMap<UserId, HashMap.HashMap<Nat, DispatchJob>>(10, Principal.equal, Principal.hash);
  private transient var jobOwner = HashMap.HashMap<Nat, UserId>(100, Nat.equal, func (x) { Nat32.fromNat(x) });

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
        let m = HashMap.HashMap<Nat, DispatchJob>(50, Nat.equal, func (x) { Nat32.fromNat(x) });
        userDispatchJobs.put(userId, m);
        return m;
      };
      case (?m) { return m; };
    };
  };
  
  // System Initialization
  public func init() : async () {
    // Initialize runtime state from stable variables
    userRules := HashMap.HashMap<UserId, HashMap.HashMap<RuleId, Rule>>(10, Principal.equal, Principal.hash);
    userChannels := HashMap.HashMap<UserId, HashMap.HashMap<ChannelId, Channel>>(10, Principal.equal, Principal.hash);
    userMessages := HashMap.HashMap<UserId, HashMap.HashMap<MessageId, Message>>(10, Principal.equal, Principal.hash);
    userDispatchJobs := HashMap.HashMap<UserId, HashMap.HashMap<Nat, DispatchJob>>(10, Principal.equal, Principal.hash);
    jobOwner := HashMap.HashMap<Nat, UserId>(100, Nat.equal, func (x) { Nat32.fromNat(x) });
    
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
    
    for ((userId, jobsArray) in userDispatchJobsEntries.vals()) {
      let jobsMap = HashMap.fromIter<Nat, DispatchJob>(Iter.fromArray(jobsArray), 50, Nat.equal, func (x) { Nat32.fromNat(x) });
      userDispatchJobs.put(userId, jobsMap);
    };
    jobOwner := HashMap.fromIter<Nat, UserId>(Iter.fromArray(jobOwnerEntries), 100, Nat.equal, func (x) { Nat32.fromNat(x) });

    // Restore alias data
    usernameRegistry := HashMap.fromIter<Text, Principal>(Iter.fromArray(usernameRegistryEntries), 10, Text.equal, Text.hash);
    principalToUsername := HashMap.fromIter<Principal, Text>(Iter.fromArray(principalToUsernameEntries), 10, Principal.equal, Principal.hash);
  };
  
  // Store stable variables before upgrades
  system func preupgrade() {
    // Migrate the owner to the new optional type
    owner_v2 := null;

    // Store maps as stable arrays
    let userRulesBuffer = Buffer.Buffer<(UserId, [(RuleId, Rule)])>(userRules.size());
    for ((userId, rulesMap) in userRules.entries()) {
      userRulesBuffer.add((userId, Iter.toArray(rulesMap.entries())));
    };
    userRulesEntries := Buffer.toArray(userRulesBuffer);
    
    let userChannelsBuffer = Buffer.Buffer<(UserId, [(ChannelId, Channel)])>(userChannels.size());
    for ((userId, channelsMap) in userChannels.entries()) {
      userChannelsBuffer.add((userId, Iter.toArray(channelsMap.entries())));
    };
    userChannelsEntries := Buffer.toArray(userChannelsBuffer);
    
    let userMessagesBuffer = Buffer.Buffer<(UserId, [(MessageId, Message)])>(userMessages.size());
    for ((userId, messagesMap) in userMessages.entries()) {
      userMessagesBuffer.add((userId, Iter.toArray(messagesMap.entries())));
    };
    userMessagesEntries := Buffer.toArray(userMessagesBuffer);

   // Store dispatch jobs and job-owner index
     let dispatchBuffer = Buffer.Buffer<(UserId, [(Nat, DispatchJob)])>(userDispatchJobs.size());
     for ((userId, jobsMap) in userDispatchJobs.entries()) {
       dispatchBuffer.add((userId, Iter.toArray(jobsMap.entries())));
     };
     userDispatchJobsEntries := Buffer.toArray(dispatchBuffer);
     jobOwnerEntries := Iter.toArray(jobOwner.entries());

    // Store alias maps as stable arrays
    usernameRegistryEntries := Iter.toArray(usernameRegistry.entries());
    principalToUsernameEntries := Iter.toArray(principalToUsername.entries());
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
    jobOwner := HashMap.HashMap<Nat, UserId>(100, Nat.equal, func (x) { Nat32.fromNat(x) });
    
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
    
    for ((userId, jobsArray) in userDispatchJobsEntries.vals()) {
      let jobsMap = HashMap.fromIter<Nat, DispatchJob>(Iter.fromArray(jobsArray), 50, Nat.equal, func (x) { Nat32.fromNat(x) });
      userDispatchJobs.put(userId, jobsMap);
    };
    jobOwner := HashMap.fromIter<Nat, UserId>(Iter.fromArray(jobOwnerEntries), 100, Nat.equal, func (x) { Nat32.fromNat(x) });

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
  public shared(msg) func createChannel(
    name : Text,
    description : ?Text,
    channelType : ChannelType,
    config : [(Text, Text)]
  ) : async Result<ChannelId, Error> {
    if (not isAuthorized(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    let userChannelsMap = getUserChannels(msg.caller);
    let channelId = nextChannelId;
    nextChannelId += 1;
    
    let now = Time.now();
    let newChannel : Channel = {
      id = channelId;
      name = name;
      description = description;
      channelType = channelType;
      config = config;
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
          isActive = updatedChannel.isActive;
          createdAt = existingChannel.createdAt;
          updatedAt = Time.now();
        };
        
        userChannelsMap.put(channelId, finalChannel);
        return #ok();
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

    // 6. Plan dispatch jobs based on rules and channels
    let plan = MessageProcessor.planDispatch(newMessage, rulesArray, channelsArray);
    let updatedMessage : Message = {
      messageId = newMessage.messageId;
      senderId = newMessage.senderId;
      recipientId = newMessage.recipientId;
      messageType = newMessage.messageType;
      content = newMessage.content;
      timestamp = newMessage.timestamp;
      isProcessed = true;
      status = plan.status;
    };
    userMessagesMap.put(updatedMessage.messageId, updatedMessage);

    // Queue jobs if any
    if (plan.status == #queued) {
      let jobsMap = getUserDispatchJobs(recipientId);
      let now = Time.now();
      for (spec in plan.jobs.vals()) {
        let jid = nextJobId; nextJobId += 1;
        let job : DispatchJob = {
          id = jid;
          messageId = spec.messageId;
          recipientId = spec.recipientId;
          channelId = spec.channelId;
          channelType = spec.channelType;
          messageType = spec.messageType;
          content = spec.content;
          intents = spec.intents;
          attempts = 0;
          createdAt = now;
          status = #pending;
        };
        jobsMap.put(jid, job);
        jobOwner.put(jid, recipientId);
      };
    };

    // Create and return receipt (reflects queued or blocked)
    let receipt = MessageProcessor.createReceipt(updatedMessage);
    return #ok(receipt);
  };
  
  // New: Clear DX endpoint for dApps addressing by alias
  public shared(_) func notifyAlias(
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

    // Plan dispatch and queue jobs
    let plan = MessageProcessor.planDispatch(newMessage, rulesArray, channelsArray);
    let updatedMessage : Message = {
      messageId = newMessage.messageId;
      senderId = newMessage.senderId;
      recipientId = newMessage.recipientId;
      messageType = newMessage.messageType;
      content = newMessage.content;
      timestamp = newMessage.timestamp;
      isProcessed = true;
      status = plan.status;
    };
    userMessagesMap.put(updatedMessage.messageId, updatedMessage);

    if (plan.status == #queued) {
      let jobsMap = getUserDispatchJobs(recipientId);
      let now = Time.now();
      for (spec in plan.jobs.vals()) {
        let jid = nextJobId; nextJobId += 1;
        let job : DispatchJob = {
          id = jid;
          messageId = spec.messageId;
          recipientId = spec.recipientId;
          channelId = spec.channelId;
          channelType = spec.channelType;
          messageType = spec.messageType;
          content = spec.content;
          intents = spec.intents;
          attempts = 0;
          createdAt = now;
          status = #pending;
        };
        jobsMap.put(jid, job);
        jobOwner.put(jid, recipientId);
      };
    };

    let receipt = MessageProcessor.createReceipt(updatedMessage);
    return #ok(receipt);
  };
 
   // Bridge API: fetch next pending dispatch jobs across users
   public shared query func nextDispatchJobs(limit : Nat) : async Result<[DispatchJob], Error> {
     var remaining = limit;
     let buf = Buffer.Buffer<DispatchJob>(Nat.min(limit, 1000));
     label scan for ((_, jobsMap) in userDispatchJobs.entries()) {
       for ((_, job) in jobsMap.entries()) {
         if (remaining == 0) { break scan; };
         switch (job.status) { case (#pending) { buf.add(job); remaining -= 1; }; case (_) {} };
       };
     };
     return #ok(Buffer.toArray(buf));
   };
 
   // Bridge API: acknowledge a dispatch job result and update message status
   public shared func ackDispatch(jobId : Nat, status : DispatchStatus, _meta : [(Text, Text)]) : async Result<(), Error> {
     switch (jobOwner.get(jobId)) {
       case null { return #err(#NotFound); };
       case (?uid) {
         let jobsMap = getUserDispatchJobs(uid);
         switch (jobsMap.get(jobId)) {
           case null { return #err(#NotFound); };
           case (?job) {
             // Validate status (cannot ack with pending)
             switch (status) {
               case (#pending) { return #err(#InvalidInput(?"Invalid ack status")); };
               case (_) {};
             };

             let updated : DispatchJob = {
               id = job.id;
               messageId = job.messageId;
               recipientId = job.recipientId;
               channelId = job.channelId;
               channelType = job.channelType;
               messageType = job.messageType;
               content = job.content;
               intents = job.intents;
               attempts = job.attempts + 1;
               createdAt = job.createdAt;
               status = status;
             };
             jobsMap.put(jobId, updated);

             // Aggregate message status across jobs for this message
             let userMessagesMap = getUserMessages(uid);
             switch (userMessagesMap.get(job.messageId)) {
               case null { return #ok(()); };
               case (?m) {
                 var anyDelivered = false;
                 var anyPending = false;
                 for ((_, j) in jobsMap.entries()) {
                   if (j.messageId == job.messageId) {
                     switch (j.status) {
                       case (#delivered) { anyDelivered := true };
                       case (#pending) { anyPending := true };
                       case (_) {};
                     };
                   };
                 };
                 let finalStatus : MessageStatus =
                   if (anyDelivered) { #delivered }
                   else if (anyPending) { #queued }
                   else { #failed };

                 let updatedMsg : Message = {
                   messageId = m.messageId;
                   senderId = m.senderId;
                   recipientId = m.recipientId;
                   messageType = m.messageType;
                   content = m.content;
                   timestamp = m.timestamp;
                   isProcessed = true;
                   status = finalStatus;
                 };
                 userMessagesMap.put(m.messageId, updatedMsg);
                 return #ok(());
               };
             };
           };
         };
       };
     };
   };
  
  // Health check endpoint
  public query func ping() : async Text {
    return "Clypr Privacy Gateway - Running";
  };
  
  // Stats and Analytics - User-specific data
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
}
