/*
Simple debug script to call nextDispatchJobs on the backend canister and print the raw response.
Run from offchain/bridge with: node debug_nextDispatch.js
It uses the same agent/actor setup as the bridge; adjust CANISTER_ID and host as needed.
*/

const fetch = require('node-fetch');
const { HttpAgent, Actor } = require('@dfinity/agent');
const fs = require('fs');
const path = require('path');

async function main() {
  try {
    const CANISTER_ID = process.env.BACKEND_CANISTER || 'replace-with-backend-canister-id';
    const HOST = process.env.DFX_HOST || 'http://127.0.0.1:8000';

    console.log('Using host:', HOST);
    console.log('Using canister:', CANISTER_ID);

    const idlFactory = require('../declarations/backend/backend.did.js');

    const agent = new HttpAgent({ host: HOST });
    // If running against a local dfx instance with insecure key, uncomment the next line
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
