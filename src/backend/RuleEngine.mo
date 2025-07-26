// RuleEngine.mo - Rule engine for evaluating messages against rules

import Array "mo:base/Array";
import Debug "mo:base/Debug";
import Int "mo:base/Int";
import Iter "mo:base/Iter";
import Nat8 "mo:base/Nat8";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Types "./Types";

module {
  type Rule = Types.Rule;
  type Message = Types.Message;
  type Condition = Types.Condition;
  type ConditionOperator = Types.ConditionOperator;
  type Action = Types.Action;
  type ActionType = Types.ActionType;
  
  // Main function for evaluating a message against rules
  public func evaluateMessage(message : Message, rules : [Rule]) : [Rule] {
    // Time can be used for time-based rules if needed
    let _ = Time.now();
    let matchingRules = Array.filter<Rule>(rules, func (rule) : Bool {
      if (not rule.isActive) { 
        return false;
      };
      
      // Check if all conditions are met
      let allConditionsMet = Array.foldLeft<Condition, Bool>(
        rule.conditions,
        true, 
        func(currentResult, condition) : Bool {
          if (not currentResult) {
            return false; // Short-circuit if already false
          };
          
          return currentResult and evaluateCondition(condition, message);
        }
      );
      
      return allConditionsMet;
    });
    
    // Sort by priority (lower number = higher priority)
    return Array.sort<Rule>(matchingRules, func(a, b) : { #less; #equal; #greater } {
      if (a.priority < b.priority) { 
        #less 
      } else if (a.priority > b.priority) { 
        #greater 
      } else { 
        #equal 
      }
    });
  };
  
  // Evaluate a single condition against a message
  private func evaluateCondition(condition : Condition, message : Message) : Bool {
    let fieldValue = getFieldValue(condition.field, message);
    
    switch(condition.operator) {
      case (#equals) {
        switch(fieldValue) {
          case (?value) { Text.equal(value, condition.value) };
          case (null) { false };
        };
      };
      case (#notEquals) {
        switch(fieldValue) {
          case (?value) { not Text.equal(value, condition.value) };
          case (null) { true }; // Not equal if field doesn't exist
        };
      };
      case (#contains) {
        switch(fieldValue) {
          case (?value) { 
            let pattern = #text(condition.value);
            Text.contains(value, pattern) 
          };
          case (null) { false };
        };
      };
      case (#notContains) {
        switch(fieldValue) {
          case (?value) { 
            let pattern = #text(condition.value);
            not Text.contains(value, pattern) 
          };
          case (null) { true }; // Doesn't contain if field doesn't exist
        };
      };
      case (#greaterThan) {
        switch(fieldValue) {
          case (?value) { 
            switch(textToInt(value), textToInt(condition.value)) {
              case (?v1, ?v2) { v1 > v2 };
              case _ { false };
            };
          };
          case (null) { false };
        };
      };
      case (#lessThan) {
        switch(fieldValue) {
          case (?value) { 
            switch(textToInt(value), textToInt(condition.value)) {
              case (?v1, ?v2) { v1 < v2 };
              case _ { false };
            };
          };
          case (null) { false };
        };
      };
      case (#exists) {
        Option.isSome(fieldValue);
      };
      case (#notExists) {
        Option.isNull(fieldValue);
      };
    };
  };
  
  // Utility function to get a field value from a message
  private func getFieldValue(field : Text, message : Message) : ?Text {
    switch (field) {
      case "messageId" { ?message.messageId };
      case "senderId" { ?Principal.toText(message.senderId) };
      case "recipientId" { ?Principal.toText(message.recipientId) };
      case "messageType" { ?message.messageType };
      case "content.title" { ?message.content.title };
      case "content.body" { ?message.content.body };
      case "content.priority" { ?Nat8.toText(message.content.priority) };
      case "timestamp" { ?Int.toText(message.timestamp) };
      case _ {
        // Check for metadata fields
        if (Text.startsWith(field, #text "metadata.")) {
          let metadataKey = Text.trimStart(field, #text "metadata.");
          switch (Array.find<(Text, Text)>(message.content.metadata, func(kv) { kv.0 == metadataKey })) {
            case (?kv) { ?kv.1 };
            case (null) { null };
          };
        } else {
          null;
        };
      };
    };
  };
  
  // Helper function to convert text to int
  private func textToInt(text : Text) : ?Int {
    // Simple implementation - could be improved with proper parsing
    switch(text) {
      case "0" { ?0 };
      case "1" { ?1 };
      case "2" { ?2 };
      case "3" { ?3 };
      case "4" { ?4 };
      case "5" { ?5 };
      case _ { null };
    };
  };
}
