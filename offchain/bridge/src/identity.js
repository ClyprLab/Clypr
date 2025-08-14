// src/identity.js
import fs from 'node:fs';
import { Ed25519KeyIdentity } from '@dfinity/identity';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';

/**
 * Extract the 32-byte Ed25519 seed from a PKCS#8 "PRIVATE KEY" DER.
 * Looks for the inner OCTET STRING tag (0x04 0x20 <32 bytes>).
 * See community guidance used widely in agent-js forums. 
 */
function extractEd25519SeedFromPkcs8(der) {
  const marker = Buffer.from([0x04, 0x20]);
  const idx = der.indexOf(marker);
  if (idx < 0 || idx + 34 > der.length) {
    throw new Error('PEM looks like PKCS#8 but no Ed25519 0x0420 seed was found.');
  }
  return der.subarray(idx + 2, idx + 34); // 32-byte seed
}

/**
 * Build an Ed25519KeyIdentity from a PKCS#8 PEM.
 * Ed25519KeyIdentity.fromSecretKey expects a 64-byte secret key,
 * so we derive it from the 32-byte seed using tweetnacl.
 */
async function ed25519IdentityFromPkcs8Pem(pem) {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/g, '')
    .replace(/-----END [^-]+-----/g, '')
    .replace(/\s+/g, '');
  const der = Buffer.from(base64, 'base64');
  const seed32 = extractEd25519SeedFromPkcs8(der);

  // Construct the 64-byte secret key using tweetnacl
  const nacl = await import('tweetnacl');
  const kp = nacl.sign.keyPair.fromSeed(seed32);
  return Ed25519KeyIdentity.fromSecretKey(kp.secretKey);
}

/**
 * Accepts:
 *  - Secp256k1: "EC PRIVATE KEY" or PKCS#8 "PRIVATE KEY" (handled by fromPem)
 *  - Ed25519:   PKCS#8 "PRIVATE KEY" produced by `dfx identity export`
 */
export async function identityFromPemString(pem) {
  if (pem.includes('BEGIN ENCRYPTED PRIVATE KEY')) {
    throw new Error(
      'Encrypted PEMs are not supported. Export plaintext: `dfx identity export <name> > identity.pem`.'
    );
  }

  // Try Secp256k1 first (library handles EC PRIVATE KEY and PKCS#8)
  if (typeof Secp256k1KeyIdentity?.fromPem === 'function') {
    try {
      return Secp256k1KeyIdentity.fromPem(pem);
    } catch (_) {
      // fall through to Ed25519 attempt
    }
  }

  // If it's PKCS#8, try Ed25519
  if (pem.includes('BEGIN PRIVATE KEY')) {
    return ed25519IdentityFromPkcs8Pem(pem);
  }

  // If it's SEC1 EC (secp256k1) and the earlier attempt failed, bubble a clearer error
  if (pem.includes('BEGIN EC PRIVATE KEY')) {
    // Give Secp another try; if it throws, surface its error
    return Secp256k1KeyIdentity.fromPem(pem);
  }

  throw new Error('Unknown PEM type. Expected Ed25519 PKCS#8 or Secp256k1 (EC/PKCS#8).');
}

export async function identityFromPemFile(path) {
  const pem = fs.readFileSync(path, 'utf8');
  return identityFromPemString(pem);
}
