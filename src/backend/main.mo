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
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

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
  
  type Error = Types.Error;
  type Result<T, E> = Types.Result<T, E>;
  
  // Legacy state variables (for migration)
  private stable var owner : Principal = Principal.fromText("2vxsx-fae"); // Default principal
  private stable var owner_v2 : ?Principal = null; // New optional version
  
  // State storage - User-isolated data
  private stable var userRulesEntries : [(UserId, [(RuleId, Rule)])] = [];
  private stable var userChannelsEntries : [(UserId, [(ChannelId, Channel)])] = [];
  private stable var userMessagesEntries : [(UserId, [(MessageId, Message)])] = [];
  private stable var nextRuleId : Nat = 0;
  private stable var nextChannelId : Nat = 0;
  
  // Runtime state - User-isolated data
  private transient var userRules = HashMap.HashMap<UserId, HashMap.HashMap<RuleId, Rule>>(10, Principal.equal, Principal.hash);
  private transient var userChannels = HashMap.HashMap<UserId, HashMap.HashMap<ChannelId, Channel>>(10, Principal.equal, Principal.hash);
  private transient var userMessages = HashMap.HashMap<UserId, HashMap.HashMap<MessageId, Message>>(10, Principal.equal, Principal.hash);
  
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
  
  // System Initialization
  public func init() : async () {
    // Initialize runtime state from stable variables
    userRules := HashMap.HashMap<UserId, HashMap.HashMap<RuleId, Rule>>(10, Principal.equal, Principal.hash);
    userChannels := HashMap.HashMap<UserId, HashMap.HashMap<ChannelId, Channel>>(10, Principal.equal, Principal.hash);
    userMessages := HashMap.HashMap<UserId, HashMap.HashMap<MessageId, Message>>(10, Principal.equal, Principal.hash);
    
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
  };
  
  system func postupgrade() {
    // Complete the migration by setting old owner to default and new one to null
    owner := Principal.fromText("2vxsx-fae");
    owner_v2 := null;
    
    // Initialize empty hashmaps
    userRules := HashMap.HashMap<UserId, HashMap.HashMap<RuleId, Rule>>(10, Principal.equal, Principal.hash);
    userChannels := HashMap.HashMap<UserId, HashMap.HashMap<ChannelId, Channel>>(10, Principal.equal, Principal.hash);
    userMessages := HashMap.HashMap<UserId, HashMap.HashMap<MessageId, Message>>(10, Principal.equal, Principal.hash);
    
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
  };
  
  // Access Control - Proper user isolation
  func isAuthorized(caller : Principal) : Bool {
    // Each authenticated user can only access their own data
    // Anonymous principals are not allowed for data operations
    return not Principal.isAnonymous(caller);
  };
  
  // User Profile Management
  
  // Rule Management - User-specific data
  public shared(msg) func createRule(
    name : Text, 
    description : ?Text,
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
  
  // Message Processing - User-specific processing
  public shared(msg) func sendMessage(
    messageType : Text,
    content : MessageContent
  ) : async Result<MessageReceipt, Error> {
    // Create the message
    let newMessage = MessageProcessor.createMessage(
      msg.caller,
      msg.caller, // In user-isolated mode, recipient is the same as sender
      messageType,
      content
    );
    
    // Get user's data
    let userMessagesMap = getUserMessages(msg.caller);
    let userRulesMap = getUserRules(msg.caller);
    let userChannelsMap = getUserChannels(msg.caller);
    
    // Store the message
    userMessagesMap.put(newMessage.messageId, newMessage);
    
    // Get all rules and channels as arrays
    let rulesArray = Iter.toArray(Iter.map(userRulesMap.vals(), func (r : Rule) : Rule { r }));
    let channelsArray = Iter.toArray(Iter.map(userChannelsMap.vals(), func (c : Channel) : Channel { c }));
    
    // Process message against rules
    switch (MessageProcessor.processMessage(newMessage, rulesArray, channelsArray)) {
      case (#err(error)) {
        return #err(error);
      };
      case (#ok(processedMessage)) {
        // Update the message with processed state
        userMessagesMap.put(processedMessage.messageId, processedMessage);
        
        // Create and return receipt
        let receipt = MessageProcessor.createReceipt(processedMessage);
        return #ok(receipt);
      };
    };
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
  
  public shared query(msg) func getAllMessages() : async Result<[Message], Error> {
    let userMessagesMap = getUserMessages(msg.caller);
    let messagesArray = Iter.toArray(Iter.map(userMessagesMap.vals(), func (m : Message) : Message { m }));
    return #ok(messagesArray);
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
