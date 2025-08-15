# Clypr Off‑chain Bridge (Starter + Runbook)

This file contains a short starter README for teammates plus a detailed runbook on creating/exporting a PEM identity, secure storage, configuration, and running the bridge against a deployed Clypr canister.

---

## Quick Starter (minimal)

This is a minimal Node.js bridge that communicates with the Clypr canister to:

1. Poll next pending dispatch jobs
2. (Stub) Run AI processing on the job payload
3. Send to a downstream bridge/channel (example: Webhook)
4. Acknowledge delivery status back to the canister

It is intended as a starter for the off-chain bridge.
Directory
- `src/index.js` — main loop: poll -> AI stub -> deliver (webhook) -> ack
- `src/adapters/webhook.js` — simple webhook sender using job.channelConfig
- `src/aiStub.js` — placeholder for AI processing
- `.env.example` — environment variables

Prerequisites
- Node.js 18+
- Canister deployed with updated Candid (DispatchJob includes channelName/channelConfig)
- Bridge principal added to canister authorization (isAuthorized)

Quick run

```bash
cp .env.example .env
# edit .env with your CANISTER_ID, IC_HOST, etc.

npm install
npm start
```

---

## Full Runbook (PEM, security, production)

IMPORTANT: Do NOT commit private PEM files or secrets to source control.

### 1) Overview
The bridge polls the on‑chain canister (backend) for pending dispatch jobs and performs external deliveries (webhooks, email adapters, etc.). The bridge authenticates to the canister using a service identity (Ed25519 PEM) and must be authorized by the canister's allowlist.

### 2) Generate a bridge identity (PEM)
1. Create a dfx identity for the bridge (if you don't already have one):

```bash
dfx identity new bridge
```

2. Inspect the principal:

```bash
dfx identity get-principal --identity bridge
```

3. Export the PEM (private; do NOT commit):

```bash
dfx identity export bridge > bridge.pem
```

4. Ignore the file in git:

```bash
echo "offchain/bridge/bridge.pem" >> .gitignore
```

### 3) Secure storage & safe sharing
Do not email PEMs unencrypted. Options ordered by security:

- KMS / Secrets Manager (recommended): AWS Secrets Manager, GCP Secret Manager, Azure Key Vault, HashiCorp Vault. Store `bridge.pem` as a secret and grant the bridge host minimal read access.
- Platform secret store: Vercel/Cloud Run secrets, GitHub Actions secrets, or container orchestrator secrets.
- One-time secure transfer: produce an encrypted archive (GPG) and transfer via a secure channel. Rotate the key after onboarding.

If the PEM is ever exposed, rotate immediately and remove the principal from the canister allowlist.

### 4) Authorize the bridge on the canister
1. Get the deployed canister id (mainnet):

```bash
dfx canister id backend --network ic
```

2. As the bridge identity, add itself to the allowlist (on mainnet):

```bash
dfx canister call --network ic --identity bridge backend addAuthorizedSelf
```

3. Verify allowlist:

```bash
dfx canister call --network ic --identity bridge backend listAuthorized
```

Security note: `addAuthorizedSelf` is convenient for onboarding temporarily, but will be updated to admin-only

### 5) Configuration (.env example)
Create `offchain/bridge/.env` (do NOT commit PEM to repo):

```
CANISTER_ID=<CANISTER_ID_FROM_DFX>
IC_HOST=https://ic0.app
BRIDGE_LIMIT=20
POLL_INTERVAL_MS=500
BRIDGE_IDENTITY_PEM=./bridge.pem      # or leave empty if using secrets manager
BRIDGE_PEM_ENV_VAR_NAME=CLYPR_BRIDGE_PEM # optional: env var name if loading PEM from env
LOG_LEVEL=info
```

### 6) Loading the PEM in Node (patterns)
A) From file (dev):
- Set `BRIDGE_IDENTITY_PEM=./bridge.pem`. The bridge code will read that path and build an identity.

B) From environment (recommended for servers):
- Inject the PEM at startup from your secret manager into an env var (example for bash):

```bash
export CLYPR_BRIDGE_PEM="$(cat bridge.pem)"
```

- In Node, read `process.env.CLYPR_BRIDGE_PEM` and create the identity without writing to disk.

C) KMS signing (best practice):
- Use cloud KMS to hold the private key and implement an Identity wrapper that calls KMS.sign(). The bridge process never has raw key bytes on disk.

Minimal Node example (env-loaded PEM):

```js
// example snippet
const { identityFromPemString } = require('./identity.js');
const pem = process.env.CLYPR_BRIDGE_PEM;
if (!pem) throw new Error('Missing bridge PEM in env');
const identity = identityFromPemString(pem);
const agent = new HttpAgent({ identity, host: process.env.IC_HOST });
```

### 7) Run the bridge
1. Install dependencies and start (dev/simple host):

```bash
cd offchain/bridge
npm install
npm start
```

2. For production, run in a container or server with access to the secret store. Do NOT call `agent.fetchRootKey()` in production code.

### 8) Smoke tests
- From the bridge host (or CLI using the bridge identity):

```bash
dfx canister call --network ic --identity bridge backend nextDispatchJobs '(10 : nat)'
```

- Create a test job onchain (user context) via UI or CLI:

```bash
dfx canister call --network ic --identity <user> backend testChannel '(0 : nat)'
```

- Confirm bridge logs show poll → deliver → acknowledge. Verify job state in canister if debug endpoints are enabled.

### 9) BigInt & serialization gotcha
Motoko numeric fields arrive in JS as BigInt. JSON.stringify will throw on BigInt values. Convert or stringify BigInt values before serializing payloads.

Example replacer:

```js
const bigintReplacer = (_, v) => typeof v === 'bigint' ? v.toString() : v;
const payload = JSON.stringify(body, bigintReplacer);
```

Alternatively, explicitly convert known fields (createdAt, expiresAt, attempts) to strings.

### 10) Acknowledgement pattern
After delivery, the bridge should call `acknowledgeJobDelivery(jobId, status)` where `status` is `{ delivered: null }` or `{ failed: null }` (Candid variant shape). Use the bridge identity when calling the canister.

Example (actor call):

```js
const status = delivered ? { delivered: null } : { failed: null };
await actor.acknowledgeJobDelivery(job.id, status);
```

### 11) Troubleshooting
- Protocol timeouts: increase agent polling timeout or ensure the host can reach the replica. Retry on transient errors.
- No jobs returned: ensure the bridge principal is authorized and jobs have status `pending` in the canister.
- Serialization errors: convert BigInt values before JSON.stringify.
- Delivery failures: check network reachability, webhook URL, auth headers, and Bridge logs.

### 12) Production hardening checklist
- Use KMS/Secrets Manager instead of disk PEM files.
- Replace `addAuthorizedSelf` with admin-only onboarding and tighten allowlist operations.
- Add monitoring & alerts for failed deliveries and low canister cycles.
- Implement retries, DLQ, and backoff handling in the bridge.
- Rotate keys periodically and audit allowlist changes.

### 13) Quick command summary

```bash
# export PEM (dev only)
dfx identity export bridge > bridge.pem

# authorize bridge on mainnet
dfx canister call --network ic --identity bridge backend addAuthorizedSelf

# run bridge (dev)
cd offchain/bridge
BRIDGE_IDENTITY_PEM=./bridge.pem CANISTER_ID=<CANISTER_ID> IC_HOST=https://ic0.app npm start
```

---

If you'd like, I can add:
- a short Node snippet showing how to load the PEM from AWS Secrets Manager and construct the HttpAgent/Actor, or
- a small note describing how to onboard multiple bridge instances with unique identities.
