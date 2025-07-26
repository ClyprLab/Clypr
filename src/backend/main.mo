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
  
  // State storage
  private stable var rulesEntries : [(RuleId, Rule)] = [];
  private stable var channelsEntries : [(ChannelId, Channel)] = [];
  private stable var messagesEntries : [(MessageId, Message)] = [];
  private stable var nextRuleId : Nat = 0;
  private stable var nextChannelId : Nat = 0;
  private stable var owner : Principal = Principal.fromText("2vxsx-fae"); // Default to anonymous principal
  
  // Runtime state
  private transient var rules = HashMap.HashMap<RuleId, Rule>(10, Nat.equal, func (x) { Nat32.fromNat(x) });
  private transient var channels = HashMap.HashMap<ChannelId, Channel>(10, Nat.equal, func (x) { Nat32.fromNat(x) });
  private transient var messages = HashMap.HashMap<MessageId, Message>(100, Text.equal, Text.hash);
  
  // System Initialization
  public func init() : async () {
    // Initialize runtime state from stable variables
    rules := HashMap.fromIter<RuleId, Rule>(Iter.fromArray(rulesEntries), 10, Nat.equal, func (x) { Nat32.fromNat(x) });
    channels := HashMap.fromIter<ChannelId, Channel>(Iter.fromArray(channelsEntries), 10, Nat.equal, func (x) { Nat32.fromNat(x) });
    messages := HashMap.fromIter<MessageId, Message>(Iter.fromArray(messagesEntries), 100, Text.equal, Text.hash);
    
    // Set up default rules if none exist
    if (Iter.size(rules.entries()) == 0) {
      // Create a default "allow all" rule
      let defaultRule : Rule = {
        id = 0;
        name = "Default Allow Rule";
        description = ?"Allow all messages by default";
        conditions = [];  // No conditions means it matches everything
        actions = [{
          actionType = #allow;
          channelId = null;
          parameters = [];
        }];
        priority = 100;  // Low priority (higher number = lower priority)
        isActive = true;
        createdAt = Time.now();
        updatedAt = Time.now();
      };
      
      rules.put(0, defaultRule);
      nextRuleId := 1;
    };
  };
  
  // Store stable variables before upgrades
  system func preupgrade() {
    rulesEntries := Iter.toArray(rules.entries());
    channelsEntries := Iter.toArray(channels.entries());
    messagesEntries := Iter.toArray(messages.entries());
  };
  
  system func postupgrade() {
    // Can't call async functions directly in postupgrade
    // Initialize directly
    rules := HashMap.fromIter<RuleId, Rule>(Iter.fromArray(rulesEntries), 10, Nat.equal, func (x) { Nat32.fromNat(x) });
    channels := HashMap.fromIter<ChannelId, Channel>(Iter.fromArray(channelsEntries), 10, Nat.equal, func (x) { Nat32.fromNat(x) });
    messages := HashMap.fromIter<MessageId, Message>(Iter.fromArray(messagesEntries), 100, Text.equal, Text.hash);
  };
  
  // Access Control
  func isOwner(caller : Principal) : Bool {
    Principal.equal(caller, owner);
  };
  
  public shared(msg) func setOwner(newOwner : Principal) : async Result<(), Error> {
    if (isOwner(msg.caller) or Principal.equal(owner, Principal.fromText("2vxsx-fae"))) {
      owner := newOwner;
      return #ok();
    };
    
    return #err(#NotAuthorized);
  };
  
  // User Profile Management
  public shared query(msg) func getOwner() : async Principal {
    return owner;
  };
  
  // Rule Management
  public shared(msg) func createRule(
    name : Text, 
    description : ?Text,
    conditions : [Condition], 
    actions : [Action],
    priority : Nat8
  ) : async Result<RuleId, Error> {
    if (not isOwner(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
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
    
    rules.put(ruleId, newRule);
    return #ok(ruleId);
  };
  
  public shared query(msg) func getRule(ruleId : RuleId) : async Result<Rule, Error> {
    if (not isOwner(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    switch (rules.get(ruleId)) {
      case null { #err(#NotFound) };
      case (?rule) { #ok(rule) };
    };
  };
  
  public shared query(msg) func getAllRules() : async Result<[Rule], Error> {
    if (not isOwner(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    let rulesArray = Iter.toArray(Iter.map(rules.vals(), func (r : Rule) : Rule { r }));
    return #ok(rulesArray);
  };
  
  public shared(msg) func updateRule(ruleId : RuleId, updatedRule : Rule) : async Result<(), Error> {
    if (not isOwner(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    switch (rules.get(ruleId)) {
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
        
        rules.put(ruleId, finalRule);
        return #ok();
      };
    };
  };
  
  public shared(msg) func deleteRule(ruleId : RuleId) : async Result<(), Error> {
    if (not isOwner(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    switch (rules.get(ruleId)) {
      case null { return #err(#NotFound); };
      case (_) {
        ignore rules.remove(ruleId);
        return #ok();
      };
    };
  };
  
  // Channel Management
  public shared(msg) func createChannel(
    name : Text,
    description : ?Text,
    channelType : ChannelType,
    config : [(Text, Text)]
  ) : async Result<ChannelId, Error> {
    if (not isOwner(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
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
    
    channels.put(channelId, newChannel);
    return #ok(channelId);
  };
  
  public shared query(msg) func getChannel(channelId : ChannelId) : async Result<Channel, Error> {
    if (not isOwner(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    switch (channels.get(channelId)) {
      case null { #err(#NotFound) };
      case (?channel) { #ok(channel) };
    };
  };
  
  public shared query(msg) func getAllChannels() : async Result<[Channel], Error> {
    if (not isOwner(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    let channelsArray = Iter.toArray(Iter.map(channels.vals(), func (c : Channel) : Channel { c }));
    return #ok(channelsArray);
  };
  
  public shared(msg) func updateChannel(channelId : ChannelId, updatedChannel : Channel) : async Result<(), Error> {
    if (not isOwner(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    switch (channels.get(channelId)) {
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
        
        channels.put(channelId, finalChannel);
        return #ok();
      };
    };
  };
  
  public shared(msg) func deleteChannel(channelId : ChannelId) : async Result<(), Error> {
    if (not isOwner(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    switch (channels.get(channelId)) {
      case null { return #err(#NotFound); };
      case (_) {
        ignore channels.remove(channelId);
        return #ok();
      };
    };
  };
  
  // Message Processing
  public shared(msg) func sendMessage(
    messageType : Text,
    content : MessageContent
  ) : async Result<MessageReceipt, Error> {
    // Create the message
    let newMessage = MessageProcessor.createMessage(
      msg.caller,
      owner,
      messageType,
      content
    );
    
    // Store the message
    messages.put(newMessage.messageId, newMessage);
    
    // Get all rules as an array
    let rulesArray = Iter.toArray(Iter.map(rules.vals(), func (r : Rule) : Rule { r }));
    
    // Get all channels as an array
    let channelsArray = Iter.toArray(Iter.map(channels.vals(), func (c : Channel) : Channel { c }));
    
    // Process message against rules
    switch (MessageProcessor.processMessage(newMessage, rulesArray, channelsArray)) {
      case (#err(error)) {
        return #err(error);
      };
      case (#ok(processedMessage)) {
        // Update the message with processed state
        messages.put(processedMessage.messageId, processedMessage);
        
        // Create and return receipt
        let receipt = MessageProcessor.createReceipt(processedMessage);
        return #ok(receipt);
      };
    };
  };
  
  public shared query(msg) func getMessage(messageId : MessageId) : async Result<Message, Error> {
    let sender = switch (messages.get(messageId)) {
      case (null) { Principal.fromText("2vxsx-fae") };
      case (?message) { message.senderId };
    };
    
    if (not isOwner(msg.caller) and not Principal.equal(msg.caller, sender)) {
      return #err(#NotAuthorized);
    };
    
    switch (messages.get(messageId)) {
      case null { #err(#NotFound) };
      case (?message) { #ok(message) };
    };
  };
  
  public shared query(msg) func getAllMessages() : async Result<[Message], Error> {
    if (not isOwner(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    let messagesArray = Iter.toArray(Iter.map(messages.vals(), func (m : Message) : Message { m }));
    return #ok(messagesArray);
  };
  
  // Health check endpoint
  public query func ping() : async Text {
    return "Clypr Privacy Gateway - Running";
  };
  
  // Stats and Analytics
  public shared query(msg) func getStats() : async Result<{
    rulesCount : Nat;
    channelsCount : Nat;
    messagesCount : Nat;
    blockedCount : Nat;
    deliveredCount : Nat;
  }, Error> {
    if (not isOwner(msg.caller)) {
      return #err(#NotAuthorized);
    };
    
    var blockedCount = 0;
    var deliveredCount = 0;
    
    for (message in messages.vals()) {
      switch (message.status) {
        case (#blocked) { blockedCount += 1; };
        case (#delivered) { deliveredCount += 1; };
        case (_) {}; // Other statuses
      };
    };
    
    return #ok({
      rulesCount = rules.size();
      channelsCount = channels.size();
      messagesCount = messages.size();
      blockedCount = blockedCount;
      deliveredCount = deliveredCount;
    });
  };
}
