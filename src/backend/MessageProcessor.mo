// MessageProcessor.mo - Handles message processing logic

import Array "mo:base/Array";
import Char "mo:base/Char";
import HashMap "mo:base/HashMap";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Nat32 "mo:base/Nat32";
import Int32 "mo:base/Int32";
import RuleEngine "./RuleEngine";
import Types "./Types";
import Debug "mo:base/Debug";

module {
  type Message = Types.Message;
  type MessageId = Types.MessageId;
  type MessageContent = Types.MessageContent;
  type MessageReceipt = Types.MessageReceipt;
  type MessageStatus = Types.MessageStatus;
  type Rule = Types.Rule;
  type Action = Types.Action;
  type ActionType = Types.ActionType;
  type Channel = Types.Channel;
  type Result<T, E> = Types.Result<T, E>;
  type Error = Types.Error;
  type ChannelType = Types.ChannelType;
  type DispatchJobSpec = Types.DispatchJobSpec;
  type RateLimitStatus = Types.RateLimitStatus;
  
  // Helper function to extract substring
  private func textSubstring(t : Text, start : Nat, length : Nat) : Text {
    let chars = Text.toIter(t);
    var i = 0;
    var result = "";

    for (c in chars) {
      if (i >= start and i < start + length) {
        result := result # Char.toText(c);
      };
      i += 1;
      if (i >= start + length) { return result; };
    };
    return result;
  };
  
  // Create a new message from input parameters
  public func createMessage(
    senderId : Principal,
    recipientId : Principal, 
    messageType : Text, 
    content : MessageContent
  ) : Message {
    let messageId = generateMessageId(senderId, Time.now());
    
    {
      messageId = messageId;
      senderId = senderId;
      recipientId = recipientId;
      messageType = messageType;
      content = content;
      timestamp = Time.now();
      isProcessed = false;
      status = #received;
    }
  };
  
  // Generate a unique message ID
  private func generateMessageId(sender : Principal, timestamp : Int) : MessageId {
    let senderText = textSubstring(Principal.toText(sender), 0, 8);
    let timestampText = Int.toText(timestamp);
    return senderText # "-" # timestampText # "-" # generateRandomSuffix();
  };
  
  // Helper to generate a random suffix for IDs
  private func generateRandomSuffix() : Text {
    // Simple random suffix - could be improved
    let chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    var result = "";
    for (i in Iter.range(0, 5)) {
      let index = Int.abs(Time.now()) % Text.size(chars);
      result := result # textSubstring(chars, Nat32.toNat(Nat32.fromIntWrap(index)), 1);
    };
    return result;
  };
  
  // Validate message content against channel limits
  public func validateMessageContent(content : MessageContent, channel : Channel) : Result<(), Error> {
    let limits = channel.validationConfig.contentLimits;

    // Check content size limits
    if (Text.size(content.title) > Nat32.toNat(limits.maxTitleLength)) {
      return #err(#InvalidInput(?"Title exceeds maximum length"));
    };

    if (Text.size(content.body) > Nat32.toNat(limits.maxBodyLength)) {
      return #err(#InvalidInput(?"Body exceeds maximum length"));
    };

    if (Array.size(content.metadata) > Nat32.toNat(limits.maxMetadataCount)) {
      return #err(#InvalidInput(?"Too many metadata entries"));
    };

    // Check content type — be tolerant of MIME parameters like "; charset=..." by matching the base type as a prefix
    let ct = content.contentType;

    let validContentType = Array.find<Text>(
      limits.allowedContentTypes,
      func(t) {
        let tlen = Text.size(t);
        if (Text.size(ct) < tlen) { false } else {
          let prefix = textSubstring(ct, 0, tlen);
          Text.equal(prefix, t)
        }
      }
    );

    if (Option.isNull(validContentType)) {
      // build a small comma-separated allowed list for debugging using an iterator
      var allowedText = "";
      for (a in Iter.fromArray(limits.allowedContentTypes)) {
        if (Text.size(allowedText) == 0) {
          allowedText := a;
        } else {
          allowedText := allowedText # ", " # a;
        };
      };
      Debug.print("validateMessageContent: Unsupported content type: " # ct # " allowed: " # allowedText);
      return #err(#InvalidInput(?"Unsupported content type"));
    };

    #ok()
  };

  // Check rate limits for a channel
  public func checkRateLimit(channel : Channel, rateLimitStatus : ?RateLimitStatus) : Result<RateLimitStatus, Error> {
    let now = Time.now();
    let rateLimit = channel.validationConfig.rateLimit;
    
    let status = switch (rateLimitStatus) {
      case (null) {
        // New rate limit window
        {
          windowStartTime = now;
          requestCount = 1 : Nat32;
          isLimited = false;
        }
      };
      case (?status) {
        if (now - status.windowStartTime > Int32.toInt(Int32.fromNat32(rateLimit.windowMs))) {
          // Window expired, start new window
          {
            windowStartTime = now;
            requestCount = 1 : Nat32;
            isLimited = false;
          }
        } else {
          // Within window
          {
            windowStartTime = status.windowStartTime;
            requestCount = status.requestCount + 1 : Nat32;
            isLimited = status.requestCount >= rateLimit.maxRequests;
          }
        }
      };
    };
    
    if (status.isLimited) {
      #err(#RateLimitExceeded)
    } else {
      #ok(status)
    }
  };

  // Process a message against rules and return actions
  public func processMessage(message : Message, rules : [Rule], channels : [Channel]) : Result<Message, Error> {
    // Evaluate message against rules to find matches
    let matchingRules = RuleEngine.evaluateMessage(message, rules);
    
    if (Array.size(matchingRules) == 0) {
      // No rules matched, use default behavior (allow)
      let processedMessage : Message = {
        messageId = message.messageId;
        senderId = message.senderId;
        recipientId = message.recipientId;
        messageType = message.messageType;
        content = message.content;
        timestamp = message.timestamp;
        isProcessed = true;
        status = #delivered;
      };
      
      return #ok(processedMessage);
    };
    
    // For this initial implementation, we'll just use the first matching rule's actions
    let rule = matchingRules[0];
    
    // Check if any action blocks the message
    let isBlocked = Array.find<Action>(rule.actions, func (action) : Bool {
      switch(action.actionType) {
        case (#block) { true };
        case (_) { false };
      };
    });
    
    let newStatus : MessageStatus = switch(isBlocked) {
      case (null) { #delivered };
      case (_) { #blocked };
    };
    
    let processedMessage : Message = {
      messageId = message.messageId;
      senderId = message.senderId;
      recipientId = message.recipientId;
      messageType = message.messageType;
      content = message.content;
      timestamp = message.timestamp;
      isProcessed = true;
      status = newStatus;
    };
    
    return #ok(processedMessage);
  };
  
  // Decide if a message is blocked or allowed and compute dispatch job plan
  public func planDispatch(
    message : Message,
    rules : [Rule],
    channels : [Channel]
  ) : {
    status : MessageStatus; // #blocked or #queued
    jobs : [DispatchJobSpec];
  } {
    let matchingRules = RuleEngine.evaluateMessage(message, rules);

    // Default allow: if no rules matched and channels exist, queue to all active channels
    if (Array.size(matchingRules) == 0) {
      let active = Array.filter<Channel>(channels, func (c : Channel) : Bool { c.isActive });
      let jobs = Array.map<Channel, DispatchJobSpec>(active, func (c : Channel) : DispatchJobSpec {
        {
          messageId = message.messageId;
          recipientId = message.recipientId;
          channelId = c.id;
          channelType = c.channelType;
          channelName = c.name;
          channelConfig = c.config;
          messageType = message.messageType;
          content = message.content;
          intents = message.content.metadata; // placeholder: reuse metadata until AI intents are defined
        }
      });
      return {
        status = if (Array.size(jobs) > 0) { #queued } else { #blocked };
        jobs = jobs;
      };
    };
    
    let rule = matchingRules[0];

    // If any action is block, message is blocked
    let hasBlock = Array.find<Action>(rule.actions, func (a : Action) : Bool {
      switch (a.actionType) { case (#block) true; case (_) false };
    });
    if (hasBlock != null) {
      return { status = #blocked; jobs = [] };
    };

    // Determine target channels: route actions with channelId win; otherwise all active channels
    let routeTargets : [Channel] = Array.filter<Channel>(channels, func (c : Channel) : Bool {
      // active and referenced by any route action if present
      if (not c.isActive) { return false };
      let referenced = Array.find<Action>(rule.actions, func (a : Action) : Bool {
        switch (a.actionType) {
          case (#route) {
            switch (a.channelId) { case (?cid) { cid == c.id }; case (null) false };
          };
          case (_) false;
        }
      });
      switch (referenced) { case (null) false; case (_) true };
    });

    let targets = if (Array.size(routeTargets) > 0) {
      routeTargets
    } else {
      Array.filter<Channel>(channels, func (c : Channel) : Bool { c.isActive })
    };

    let jobs = Array.map<Channel, DispatchJobSpec>(targets, func (c : Channel) : DispatchJobSpec {
      {
        messageId = message.messageId;
        recipientId = message.recipientId;
        channelId = c.id;
        channelType = c.channelType;
        channelName = c.name;
        channelConfig = c.config;
        messageType = message.messageType;
        content = message.content;
        intents = mergeIntents(rule.actions, message.content.metadata);
      }
    });

    { status = if (Array.size(jobs) > 0) { #queued } else { #blocked }; jobs };
  };
  
  // Merge AI intents from rule action parameters with message metadata (simple concat now)
  private func mergeIntents(actions : [Action], metadata : [(Text, Text)]) : [(Text, Text)] {
    let intentPairs = Array.mapFilter<Action, (Text, Text)>(actions, func (a : Action) : ?(Text, Text) {
      // Convention: parameters with key "intent" or "ai" are intents; keep both for now
      switch (Array.find<(Text, Text)>(a.parameters, func (p : (Text, Text)) : Bool { p.0 == "intent" or p.0 == "ai" })) {
        case (?pair) { ?pair };
        case (null) { null };
      }
    });
    // Concatenate metadata and intents; will evolve into a structured type later
    Array.append<(Text, Text)>(metadata, intentPairs)
  };
  
  // Create a receipt for a processed message
  public func createReceipt(message : Message) : MessageReceipt {
    {
      messageId = message.messageId;
      received = true;
      timestamp = Time.now();
    }
  };
}
