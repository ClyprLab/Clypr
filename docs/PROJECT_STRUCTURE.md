# Clypr Project Structure (As-built)

```
clypr/
├── dfx.json
├── canister_ids.json
├── deploy-ic.sh
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPER_GUIDE.md
│   ├── PRD.md
│   ├── PROGRESS_REPORT.md
│   ├── PROJECT_STRUCTURE.md
│   └── USER_GUIDE.md
├── src/
│   ├── backend/
│   │   ├── main.mo
│   │   ├── Types.mo
│   │   ├── RuleEngine.mo
│   │   └── MessageProcessor.mo
│   ├── declarations/
│   │   └── backend/
│   │       ├── backend.did
│   │       ├── backend.did.d.ts
│   │       └── backend.did.js
│   └── frontend/
│       ├── public/
│       │   └── canister-ids.js
│       ├── src/
│       │   ├── components/
│       │   ├── hooks/
│       │   ├── pages/
│       │   ├── services/
│       │   ├── utils/
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── vite config files
└── README.md
```

Notes
- Generated Candid bindings live under `src/declarations/backend/` and are the source of truth for the frontend idl.
- There is currently a single backend canister handling rules/channels/messages and public endpoints.
