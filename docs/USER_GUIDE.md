# Clypr User Guide

This guide will help you get started with Clypr, your personal privacy agent for Web3 communications.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Managing Privacy Rules](#managing-privacy-rules)
4. [Understanding Message Flow](#understanding-message-flow)
5. [Configuring Communication Channels](#configuring-communication-channels)
6. [Advanced Features](#advanced-features)
7. [Troubleshooting](#troubleshooting)
8. [FAQ](#faq)

## Introduction

Clypr is a decentralized communication privacy relay that puts you in control of how Web3 applications communicate with you. Instead of providing your email or phone number directly to applications, dApps send messages to your personal privacy agent (a canister on the Internet Computer), which applies your rules before forwarding approved messages to your preferred channels.

### Key Benefits

- **Privacy Protection**: dApps never see your actual contact information
- **Customizable Filtering**: Define exactly which messages reach you
- **Channel Management**: Choose which messages go to which channels
- **Message History**: Keep track of all communications in one place

## Getting Started

### Creating Your Privacy Agent

1. Visit [app.clypr.io](https://app.clypr.io)
2. Click "Connect" and authenticate with your Internet Identity
3. Click "Create Privacy Agent" to deploy your personal canister
4. Complete your profile setup with a display name (optional)

### Adding Communication Channels

1. Go to the "Channels" section in your dashboard
2. Click "Add New Channel"
3. Select the channel type (Email or SMS)
4. Enter your contact information
5. Verify the channel by following the verification process
   - For email: Click the verification link sent to your inbox
   - For SMS: Enter the verification code sent to your phone

### Setting Up Your First Rule

1. Go to the "Rules" section in your dashboard
2. Click "Create New Rule"
3. Choose a template or start from scratch
4. Configure your rule (see [Managing Privacy Rules](#managing-privacy-rules))
5. Save and activate your rule

## Managing Privacy Rules

Rules determine which messages get forwarded to your communication channels. Each rule consists of conditions and actions.

### Rule Components

- **Conditions**: Criteria that messages must match
- **Actions**: What happens when conditions are met
- **Priority**: Order in which rules are evaluated (lower numbers run first)

### Creating Rules

1. Go to the "Rules" section
2. Click "Create New Rule"
3. Give your rule a descriptive name
4. Add one or more conditions
5. Configure the action to take
6. Set rule priority
7. Click "Save Rule"

### Common Rule Types

#### Allowlist Rule

Allow messages from specific trusted senders:

- **Condition**: Sender equals [Principal ID]
- **Action**: Allow and forward to [your chosen channels]

#### Blocklist Rule

Block messages from unwanted senders:

- **Condition**: Sender equals [Principal ID]
- **Action**: Block (do not forward)

#### Keyword Filter

Filter messages based on content:

- **Condition**: Body contains [keyword]
- **Action**: Allow/Block based on preference

#### Priority Messages

Only receive high-priority messages:

- **Condition**: Priority greater than [threshold]
- **Action**: Allow and forward to [your chosen channels]

#### Quiet Hours

Prevent messages during specific times:

- **Condition**: Current time is between [start time] and [end time]
- **Action**: Block or delay delivery

### Testing Rules

1. Go to the "Test" section under "Rules"
2. Compose a sample message
3. Click "Test Rules"
4. Review how your rules would process the message

### Managing Rule Priority

Rules are evaluated in order of priority (lowest number first). To change priority:

1. Go to the "Rules" section
2. Click "Reorder Rules"
3. Drag rules to set their order
4. Click "Save Order"

## Understanding Message Flow

When a dApp sends a message to your privacy agent:

1. **Reception**: Your canister receives the message
2. **Rule Evaluation**: Rules are applied in priority order
3. **Action Application**: First matching rule's action is executed
4. **Delivery**: If approved, message is forwarded to designated channels
5. **Recording**: Message and its processing are recorded in history

### Viewing Message History

1. Go to the "Messages" section
2. Browse all messages received by your privacy agent
3. Filter by status (delivered, blocked, pending)
4. Click on any message to see details, including:
   - Sender information
   - Message content
   - Applied rule
   - Delivery status

## Configuring Communication Channels

### Adding a New Channel

1. Go to "Channels" section
2. Click "Add Channel"
3. Select channel type
4. Enter required information
5. Complete verification process

### Managing Existing Channels

1. Go to "Channels" section
2. Click on any channel to:
   - Edit label
   - Set as primary
   - Temporarily disable
   - Remove channel

### Channel Types

#### Email

- Uses SendGrid for delivery
- Supports HTML or plain text formatting
- Can include attachments (up to 10MB total)

#### SMS

- Uses Twilio for delivery
- Limited to 160 characters
- Supports urgent notifications

## Advanced Features

### Message Transformations

Modify messages before they reach you:

1. When creating a rule, click "Add Transformation"
2. Choose transformation type:
   - Add prefix to subject/title
   - Replace text
   - Add context information
3. Configure transformation parameters
4. Save rule with transformations

### Rule Templates

Save time with pre-configured rule templates:

1. Go to "Rules" section
2. Click "Create from Template"
3. Select a template
4. Customize as needed
5. Save your rule

### Analytics Dashboard

Understand your message patterns:

1. Go to "Dashboard" section
2. View charts and statistics:
   - Message volume over time
   - Top senders
   - Rule effectiveness
   - Channel distribution

## Troubleshooting

### Common Issues

#### Messages Not Being Forwarded

- Check that your rules are configured correctly
- Verify that your communication channels are verified
- Ensure your privacy agent has sufficient cycles (ICP)

#### Unexpected Rule Behavior

- Check rule priority order
- Review rule conditions for accuracy
- Test with sample messages to diagnose issues

#### Delivery Delays

- Check webhook service status
- Verify that your email/SMS provider is functioning
- Ensure your contact information is correct

### Getting Help

- Visit our [Help Center](https://help.clypr.io)
- Join our [Discord community](https://discord.gg/clypr)
- Email support@clypr.io

## FAQ

### General Questions

#### What is a privacy agent?
A privacy agent is your personal canister on the Internet Computer that receives, filters, and forwards messages based on your rules.

#### How does Clypr protect my privacy?
dApps never see your actual contact information. They only know your canister ID, which acts as a proxy for your real communication channels.

#### Is Clypr decentralized?
The core privacy agent (your canister) runs on the decentralized Internet Computer. The webhook service that delivers messages to email/SMS is a centralized bridge.

### Technical Questions

#### How much does Clypr cost?
Your privacy agent consumes ICP cycles when processing messages. Typical usage is approximately [X] cycles per month. The webhook service is currently free for basic usage.

#### Can I use Clypr with any dApp?
Any dApp that implements the Clypr messaging protocol can send messages to your privacy agent. We provide an SDK to help developers integrate.

#### What happens if my privacy agent runs out of cycles?
Your agent will stop processing new messages until cycles are replenished. You'll receive notifications when cycles are running low.

#### How secure are my contact details?
Your contact information is stored encrypted in your privacy agent canister. The webhook service has temporary access only when delivering messages.
