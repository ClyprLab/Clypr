# Rule Engine Technical Design

This document outlines the technical design of the Rule Engine component, which is central to Clypr's privacy relay functionality.

## Overview

The Rule Engine evaluates incoming messages against user-defined rules to determine if and how messages should be forwarded to external communication channels. It implements a flexible condition evaluation system that can be extended with new condition types and actions.

## Rule Structure

### Rule Object

```motoko
type Rule = {
  id: Text;                    // Unique identifier
  name: Text;                  // Human-readable name
  description: ?Text;          // Optional description
  conditions: [Condition];     // Array of conditions (combined with AND logic)
  action: Action;              // Action to take when conditions match
  priority: Nat8;              // Execution order (lower runs first)
  enabled: Bool;               // Whether rule is active
  created: Timestamp;          // Creation time
  modified: Timestamp;         // Last modification time
};
```

### Condition Object

```motoko
type Condition = {
  type: ConditionType;         // Type of condition
  field: Text;                 // Field to evaluate
  operator: Operator;          // Comparison operator
  value: Value;                // Value to compare against
  negate: Bool;                // Whether to negate the result
};
```

### ConditionType Variants

```motoko
type ConditionType = {
  #sender;                     // Based on message sender
  #content;                    // Based on message content
  #metadata;                   // Based on message metadata
  #time;                       // Based on time constraints
  #frequency;                  // Based on message frequency
};
```

### Operator Variants

```motoko
type Operator = {
  #equals;                     // Exact equality
  #contains;                   // Text contains substring
  #startsWith;                 // Text starts with substring
  #endsWith;                   // Text ends with substring
  #greaterThan;                // Numeric comparison >
  #lessThan;                   // Numeric comparison <
  #between;                    // Numeric range check
  #matches;                    // Regular expression match
};
```

### Action Object

```motoko
type Action = {
  allow: Bool;                               // Whether to forward the message
  destinations: ?[ContactEndpoint];          // Where to forward (if allowed)
  transformations: ?[Transformation];        // Message modifications
  deferUntil: ?Timestamp;                    // Optional delivery delay
};
```

### Transformation Object

```motoko
type Transformation = {
  type: TransformationType;    // Type of transformation
  target: Text;                // Field to transform
  parameters: [KeyValue];      // Transformation parameters
};
```

## Evaluation Algorithm

The rule evaluation process follows these steps:

1. **Rule Filtering**: 
   - Filter out disabled rules
   - Sort remaining rules by priority (ascending)

2. **Sequential Evaluation**:
   - For each rule in sorted order:
     - Evaluate all conditions
     - If all conditions match, apply this rule's action
     - Stop processing further rules

3. **Default Action**:
   - If no rules match, apply the default action
   - The default action is configurable per user but typically blocks messages

### Pseudocode

```
function evaluateMessage(message, rules, defaultAction) {
  // Filter and sort rules
  let activeRules = rules.filter(r => r.enabled).sort((a, b) => a.priority - b.priority);
  
  // Try each rule in order
  for (let rule of activeRules) {
    let allConditionsMatch = true;
    
    // Check all conditions (AND logic)
    for (let condition of rule.conditions) {
      let matches = evaluateCondition(message, condition);
      
      // Handle negation
      if (condition.negate) {
        matches = !matches;
      }
      
      if (!matches) {
        allConditionsMatch = false;
        break;
      }
    }
    
    // If all conditions match, apply this rule's action
    if (allConditionsMatch) {
      return applyAction(message, rule.action);
    }
  }
  
  // If no rules matched, apply default action
  return applyAction(message, defaultAction);
}
```

## Condition Evaluation Logic

### Sender Conditions

Evaluate the sender's Principal ID against allowed or blocked senders.

```motoko
func evaluateSenderCondition(message: Message, condition: Condition): Bool {
  let sender = message.sender;
  
  switch (condition.operator) {
    case (#equals) { sender == condition.value };
    case (#contains) { false }; // Not applicable for Principal IDs
    case (_) { false };
  }
}
```

### Content Conditions

Evaluate message content fields (title, body) against text patterns.

```motoko
func evaluateContentCondition(message: Message, condition: Condition): Bool {
  let content = switch (condition.field) {
    case ("title") { message.content.title };
    case ("body") { message.content.body };
    case (_) { "" };
  };
  
  let value = condition.value.asText();
  
  switch (condition.operator) {
    case (#equals) { content == value };
    case (#contains) { Text.contains(content, value) };
    case (#startsWith) { Text.startsWith(content, value) };
    case (#endsWith) { Text.endsWith(content, value) };
    case (#matches) { evaluateRegexMatch(content, value) };
    case (_) { false };
  }
}
```

### Metadata Conditions

Evaluate custom metadata fields in the message.

```motoko
func evaluateMetadataCondition(message: Message, condition: Condition): Bool {
  let key = condition.field;
  let metadataValue = getMetadataValue(message.content.metadata, key);
  
  switch (metadataValue) {
    case (null) { false };
    case (?value) {
      let condValue = condition.value;
      // Compare based on metadata type and operator
      // Implementation depends on metadata type system
    };
  }
}
```

### Time Conditions

Evaluate conditions based on current time or message timestamp.

```motoko
func evaluateTimeCondition(message: Message, condition: Condition): Bool {
  let currentTime = Time.now();
  let messageTime = message.timestamp;
  
  let targetTime = switch (condition.field) {
    case ("current") { currentTime };
    case ("message") { messageTime };
    case (_) { currentTime };
  };
  
  let value = condition.value.asNat64();
  
  switch (condition.operator) {
    case (#equals) { targetTime == value };
    case (#greaterThan) { targetTime > value };
    case (#lessThan) { targetTime < value };
    case (#between) {
      let range = condition.value.asRange();
      targetTime >= range.start and targetTime <= range.end;
    };
    case (_) { false };
  }
}
```

### Frequency Conditions

Evaluate message frequency from a particular sender.

```motoko
func evaluateFrequencyCondition(message: Message, condition: Condition): Bool {
  let sender = message.sender;
  let timeWindow = condition.value.asNat64(); // Time window in nanoseconds
  let threshold = condition.field; // Parse as number
  
  let messageCount = countMessagesFromSender(sender, timeWindow);
  
  switch (condition.operator) {
    case (#greaterThan) { messageCount > threshold };
    case (#lessThan) { messageCount < threshold };
    case (#equals) { messageCount == threshold };
    case (_) { false };
  }
}
```

## Action Application

When a rule matches, its action is applied to determine message handling:

```motoko
func applyAction(message: Message, action: Action): ProcessingResult {
  if (not action.allow) {
    return #blocked(message.id);
  };
  
  var processedMessage = message;
  
  // Apply transformations if any
  if (action.transformations != null) {
    processedMessage := applyTransformations(processedMessage, action.transformations);
  };
  
  // Handle deferred delivery
  if (action.deferUntil != null) {
    scheduleDeferred(processedMessage, action.deferUntil);
    return #deferred(message.id, action.deferUntil);
  };
  
  // Forward to destinations
  let destinations = action.destinations ?? getDefaultDestinations();
  let deliveryResults = forwardToDestinations(processedMessage, destinations);
  
  return #forwarded(message.id, deliveryResults);
}
```

## Performance Considerations

### Optimization Techniques

1. **Rule Indexing**: 
   - Index rules by priority for faster retrieval
   - Consider specialized data structures for frequently used conditions

2. **Evaluation Short-circuiting**:
   - Stop condition evaluation as soon as one fails
   - Skip rules that can't possibly match based on message metadata

3. **Caching**:
   - Cache frequent sender evaluations
   - Cache regex compilations for pattern matching

4. **Batched Processing**:
   - Process multiple messages in batches where possible
   - Combine similar webhook calls

### Scalability Limits

- Up to 100 rules per user (soft limit)
- Up to 10 conditions per rule (recommended max)
- Up to 5 transformations per action (recommended max)

## Extensibility

The rule engine is designed for extensibility:

1. **New Condition Types**:
   - Add new variant to ConditionType
   - Implement evaluation function
   - Register in the condition evaluator

2. **New Operators**:
   - Add new variant to Operator
   - Implement operator logic for each condition type
   - Update evaluation functions

3. **New Action Types**:
   - Extend Action structure with new fields
   - Implement action handlers
   - Update action application function

## Security Considerations

1. **Rule Validation**:
   - Validate all rules at creation time
   - Prevent rules that could create infinite loops or deadlocks

2. **Resource Limits**:
   - Set execution time limits for rule evaluation
   - Limit complexity of regular expressions
   - Cap the number of rules per user

3. **Data Isolation**:
   - Ensure one user's rules cannot access another user's messages
   - Validate all transformations for data safety

4. **Audit Logging**:
   - Log all rule evaluations for security auditing
   - Record which rules were applied to which messages

## Future Enhancements

1. **Rule Composition**:
   - Allow rules to reference other rules
   - Support OR logic between conditions

2. **Machine Learning Integration**:
   - Automatic rule suggestions based on user preferences
   - Anomaly detection for unusual messages

3. **Advanced Pattern Matching**:
   - NLP-based content evaluation
   - Semantic matching beyond simple text patterns

4. **Collaborative Rules**:
   - Shared rule templates between users
   - Community-contributed rule sets
