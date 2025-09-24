#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="/mnt/c/Users/AOB/Documents/projects/Clypr"
cd "$REPO_ROOT"

# Integration test: deploy, register username, create channel, send message, verify job queued

echo "Deploying canisters (idempotent)..."
dfx deploy --no-wallet || true

CANISTER=backend

# Use a unique alias per run so the test is idempotent
TEST_ID=$(date +%s)
ALIAS="itest_${TEST_ID}"

echo "Register username '$ALIAS' (idempotent)..."
dfx canister call $CANISTER registerUsername "(\"$ALIAS\")" || true

# Create webhook channel (best-effort)
echo "Create webhook channel (best-effort)..."
CREATE_RESP=$(dfx canister call $CANISTER createChannel "(\"ITest Channel $TEST_ID\", null, variant { webhook }, variant { webhook = record { authType = variant { none }; headers = vec {}; method = \"POST\"; retryCount = 0 : nat8; url = \"https://example.test/itest\" } }, null, null)" ) || true
echo "createChannel response: $CREATE_RESP"

# Ensure caller authorized for bridge APIs
echo "Add authorized self (best-effort)..."
dfx canister call $CANISTER addAuthorizedSelf '()' || true

# Send message to alias
MSG_ID="msg_${TEST_ID}"
echo "Sending message to $ALIAS via notifyAlias..."
dfx canister call $CANISTER notifyAlias "(\"$ALIAS\", \"$MSG_ID\", record { title = \"ITEST\"; body = \"Integration test message $TEST_ID\"; priority = 1 : nat8; metadata = vec {}; contentType = \"text/plain\" })" || true

# Poll for nextDispatchJobs with timeout
MAX_WAIT=20
SLEEP=1
FOUND=false
for i in $(seq 1 $MAX_WAIT); do
	echo "Polling for dispatch jobs (attempt $i/$MAX_WAIT)..."
	JOBS=$(dfx canister call $CANISTER nextDispatchJobs '(10)') || true
	echo "$JOBS"
	if echo "$JOBS" | grep -q "$MSG_ID"; then
		echo "Found dispatch job referencing message $MSG_ID"
		FOUND=true
		break
	fi
	sleep $SLEEP
done

if [ "$FOUND" = false ]; then
	echo "Dispatch job not found after ${MAX_WAIT}s. Dumping debug info..."
	dfx canister call $CANISTER debug_dumpAllDispatchJobs || true
	dfx canister call $CANISTER getAllMessages || true
	exit 3
fi

echo "Integration test succeeded."
