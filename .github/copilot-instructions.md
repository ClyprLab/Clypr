# Copilot Instructions for Clypr

## Project Overview

Clypr is a decentralized privacy gateway for Web3 communications built on Internet Computer Protocol (ICP). It acts as a programmable message relay that filters dApp communications through user-defined privacy rules before forwarding to real-world channels (email/SMS).

## Architecture 

**Key Components:**
- **Frontend**: React/TypeScript SPA with Internet Identity auth (`src/frontend/`)
- **Backend**: Motoko canisters with message processing logic (`src/backend/`)
- **Internet Identity**: Local/remote authentication via custom canister config
- **Privacy Rules**: User-configurable message filtering (`RuleEngine.mo`)

**Data Flow**: `dApp → User Privacy Canister → Rule Engine → Webhook Bridge → Email/SMS`

## Critical Development Patterns

### Internet Computer-Specific Setup

**Canister Configuration** (`dfx.json`):
- `frontend`: Asset canister pointing to `src/frontend/dist`
- `backend`: Motoko canister with `main.mo` entry point  
- `internet_identity`: Custom canister for local auth (uses dev WASM)

**Environment Detection** (`src/frontend/src/utils/canisterUtils.ts`):
```typescript
// CRITICAL: Use subdomain format for local II auth
const localUrl = 'http://uzt4z-lp777-77774-qaabq-cai.localhost:4943';
// NOT: 'http://localhost:4943/?canisterId=...' (causes 400 errors)
```

### Build & Deployment Workflows

**Local Development:**
```bash
./deploy-ic.sh  # Builds frontend, starts replica, deploys all canisters
```

**Frontend Build Process:**
- Uses `vite.config.ic.ts` for IC-specific builds
- Requires Node.js polyfills for dfinity packages
- Assets must output to `dist/` (not `build/`) per dfx.json

**Critical Build Dependencies:**
```json
"@dfinity/agent": "^3.1.0",
"@dfinity/auth-client": "^3.1.0", 
"buffer": "^6.0.3"  // Required polyfill
```

### Authentication Architecture

**AuthProvider Pattern** (`src/frontend/src/hooks/useAuth.tsx`):
- Uses `@dfinity/auth-client` with environment-aware Internet Identity URLs
- Principal-based user identification
- Context provider wraps entire app for auth state

**Local vs Production Auth:**
- Local: Custom II canister with subdomain URLs
- Production: `https://identity.ic0.app`

### Backend State Management

**Motoko Patterns** (`src/backend/main.mo`):
- `persistent actor` for automatic state preservation
- Stable variables for upgrade persistence: `rulesEntries`, `channelsEntries`, `messagesEntries`
- HashMap conversions in pre/post upgrade hooks

**Module Structure:**
- `Types.mo`: Shared type definitions across backend
- `RuleEngine.mo`: Message filtering logic
- `MessageProcessor.mo`: Core message handling

### Frontend State & Routing

**Component Architecture:**
- `Layout.tsx`: Authenticated app shell with sidebar/topbar
- Page components in `src/frontend/src/pages/`
- Route protection via auth context

**Styling:** styled-components with TypeScript

## Common Debugging Points

1. **401/403 Authentication Errors**: Check Internet Identity URL format (subdomain vs query param)
2. **Failed Module Imports**: Verify Node.js polyfills in vite config
3. **Canister ID Mismatches**: Ensure `canister-ids.js` includes `internet_identity` mapping
4. **Build Failures**: IC builds need `vite.config.ic.ts`, regular dev uses `vite.config.ts`

## Key Files for Understanding

- `dfx.json`: Canister definitions and build targets
- `src/backend/main.mo`: Core backend logic and state management
- `src/frontend/src/hooks/useAuth.tsx`: Authentication patterns
- `src/frontend/src/utils/canisterUtils.ts`: Environment detection
- `deploy-ic.sh`: Complete local deployment workflow
