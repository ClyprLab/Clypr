/*
ESM debug script to call nextDispatchJobs on the backend canister and print the raw response.
Run from offchain/bridge with: node debug_nextDispatch.mjs
It uses the same agent/actor setup as the bridge; adjust CANISTER_ID and host via env.
*/

import fetch from 'node-fetch';
import { HttpAgent, Actor } from '@dfinity/agent';
import path from 'path';
import url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

async function main() {
  try {
    const CANISTER_ID = process.env.BACKEND_CANISTER || 'replace-with-backend-canister-id';
    const HOST = process.env.DFX_HOST || 'http://127.0.0.1:8000';

    console.log('Using host:', HOST);
    console.log('Using canister:', CANISTER_ID);

    // require the generated idl file
    const idlFactory = (await import(path.join(__dirname, 'src', '..', 'declarations', 'backend', 'backend.did.js'))).default || (await import(path.join(__dirname, 'src', '..', 'declarations', 'backend', 'backend.did.js')));

    const agent = new HttpAgent({ host: HOST });
    // If running against a local dfx instance with insecure key, you may need to fetch root key
    // await agent.fetchRootKey();

    const actor = Actor.createActor(idlFactory, { agent, canisterId: CANISTER_ID });

    console.log('Calling nextDispatchJobs...');
    const res = await actor.nextDispatchJobs();
    console.log('Raw result:', JSON.stringify(res, null, 2));
  } catch (e) {
    console.error('Error calling nextDispatchJobs:', e);
    if (e.response) {
      try {
        const text = await e.response.text();
        console.error('Response body:', text);
      } catch (ex) {
        // ignore
      }
    }
  }
}

main();
