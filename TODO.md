# Clypr Hackathon – Project Status & Taskboard

## ✅ Completed (Foundations)

* ✅ Development environment is set up
* ✅ Dashboard UI is functional
* ✅ Messages are being stored and displayed correctly
* ✅ Basic rule creator implemented (needs more logic work)
* ✅ Channel setup screen (UI done)
* ✅ State management is working as expected

---

## Current Focus – Core MVP Build

### 1. Channel Integration (Message Delivery)

Objective: Messages should reliably reach users via external channels.

**Email – First Priority**

* [ ] Connect a free SMTP service (e.g., Resend, Mailersend)
* [ ] Create and plug in basic email templates
* [ ] Test email deliverability end-to-end

**SMS – Optional for MVP**

* [ ] Find a free/affordable SMS API
* [ ] Send and receive basic test SMS

**Telegram – Nice to have (if time allows)**

* [ ] Add basic bot integration (only if others are stable)

---

### 2. Message Flow (End-to-End Pipeline)

Objective: Support clean handoff from dApp to user-facing delivery.

**dApp Integration**

* [ ] Create POST endpoint for dApps to send messages
* [ ] Add simple request validation and rate limits
* [ ] Basic sender verification logic

**Clypr Processing**

* [ ] Route incoming messages through rule engine
* [ ] Determine correct delivery channel
* [ ] Log and track delivery attempts

**User Feedback**

* [ ] Show delivery status in UI
* [ ] Handle failures with retry logic

---

### 3. Rule Engine (User Privacy & Control)

Objective: Ensure users can define clear boundaries for what they receive.

**Filters**

* [ ] Allow/block specific senders
* [ ] Filter messages based on keywords
* [ ] Time-based filters (e.g., quiet hours)

**Spam Controls**

* [ ] Detect common spam patterns
* [ ] Flag repeat offenders

**Rule Actions**

* [ ] Route allowed messages to selected channels
* [ ] Block or drop messages that violate rules

---

## Testing & Validation

Objective: Make sure all critical paths are functioning and resilient.

* [ ] Send test messages via Email and SMS
* [ ] Confirm that rules are applied correctly
* [ ] Test with multiple concurrent messages
* [ ] Simulate and fix broken edge cases

---

## Documentation (Bare Minimum to Ship)

* [ ] How to send messages from a dApp
* [ ] How to configure delivery channels
* [ ] How to define and test rules
* [ ] Simple “Debugging Guide” for broken flows

---

## MVP Checklist (What Done Looks Like)

* [ ] dApp sends message → Clypr receives and logs it
* [ ] Message runs through rules → Routing decision is made
* [ ] Message is delivered to user’s email/SMS
* [ ] Status is shown or logged for debugging
* [ ] All flows tested at least once

---

## Tasks

**Channel Integration**

* Setup SMTP
* Test and verify email flow
* Research + test SMS (if time)

**Message Processing**

* Build dApp endpoint
* Integrate rule engine with message flow

**Rule System**

* Implement core filters
* Set up basic spam detection

**Testing & Docs**

* Manual QA
* Write dev and user-facing docs
