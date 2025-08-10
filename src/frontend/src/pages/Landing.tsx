import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Lock,
  Wallet,
  Send,
  Workflow,
  Network,
  Terminal,
  CheckCircle2,
  Layers,
  Filter,
  Mail,
  Gauge,
  Boxes,
} from 'lucide-react';

function Step({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/5">{icon}</span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-zinc-300">{text}</p>
    </div>
  );
}

function Outcome({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-zinc-300">{text}</p>
    </div>
  );
}

function UseCase({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/5">{icon}</span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-zinc-300">{text}</p>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <h4 className="font-semibold text-white">{title}</h4>
      <p className="mt-1 text-sm text-zinc-300">{text}</p>
    </div>
  );
}

function Bullet({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500" />
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-sm text-zinc-300">{text}</p>
      </div>
    </div>
  );
}

function TrustTile({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-zinc-400">{text}</p>
    </div>
  );
}

const Landing: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0F] text-zinc-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0F]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0A0A0F]/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <span className="h-6 w-6 rounded-md bg-gradient-to-br from-cyan-400 to-fuchsia-500" />
              <span className="text-sm uppercase tracking-[0.18em] text-zinc-300">clypr</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <a href="#problem" className="text-sm text-zinc-300 hover:text-white">Problem</a>
              <a href="#solution" className="text-sm text-zinc-300 hover:text-white">Solution</a>
              <a href="#how" className="text-sm text-zinc-300 hover:text-white">How It Works</a>
              <a href="#docs" className="text-sm text-zinc-300 hover:text-white">Docs</a>
              <Link to="/demo" className="inline-flex">
                <button className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10">Launch demo</button>
              </Link>
            </nav>
            <button
              aria-label="Toggle navigation"
              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-300 hover:bg-white/10 md:hidden"
              onClick={() => setNavOpen(v => !v)}
            >
              <span className="sr-only">Menu</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          {navOpen && (
            <div className="grid gap-2 pb-4 md:hidden">
              <a href="#problem" className="rounded px-2 py-2 text-sm text-zinc-300 hover:bg-white/10">Problem</a>
              <a href="#solution" className="rounded px-2 py-2 text-sm text-zinc-300 hover:bg-white/10">Solution</a>
              <a href="#how" className="rounded px-2 py-2 text-sm text-zinc-300 hover:bg-white/10">How It Works</a>
              <a href="#docs" className="rounded px-2 py-2 text-sm text-zinc-300 hover:bg-white/10">Docs</a>
              <Link to="/demo" className="px-2 py-2">
                <button className="w-full rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-2 text-sm text-[#0A0A0F] hover:opacity-95">Launch demo</button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(700px_400px_at_20%_-10%,rgba(56,189,248,0.15),rgba(10,10,15,0)),radial-gradient(700px_400px_at_90%_0%,rgba(217,70,239,0.14),rgba(10,10,15,0))]" />
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:py-28 lg:py-32">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-1">
                <span className="rounded border border-white/10 bg-transparent px-2 py-0.5 text-xs text-zinc-300">Programmable. Private. Decentralized.</span>
              </div>
              <h1 className="mb-4 text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl" style={{fontFamily: '"Space Grotesk", ui-sans-serif, system-ui'}}>
                Ship messages, not address books.
              </h1>
              <p className="mb-8 max-w-xl text-zinc-300">
                Clypr is a decentralized, programmable communication layer for Web3 teams, dApps, and projects that need
                secure, verifiable, direct communication with their users—without collecting emails, phone numbers, or
                binding identities to a single chain.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/demo">
                  <button className="inline-flex items-center rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-[#0A0A0F] hover:opacity-95">
                    Try the demo <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
                <a href="#docs">
                  <button className="inline-flex items-center rounded-md border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white hover:bg-white/10">Read the docs</button>
                </a>
              </div>
              <p className="mt-4 text-xs text-zinc-400" style={{fontFamily: '"IBM Plex Mono", ui-monospace'}}>
                End-to-end encryption • Programmable routing • Decentralized delivery • Wallet-linked verification • API-first
              </p>
            </div>
            <div>
              <div className="relative rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="rounded-lg bg-[#0C0D14] p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs text-zinc-400">
                    <span className="h-2 w-2 rounded-full bg-cyan-400/80" /> message.ts
                  </div>
                  <pre className="overflow-auto rounded-lg p-4 text-sm leading-relaxed text-zinc-200" style={{fontFamily: '"IBM Plex Mono", ui-monospace'}}>{`recipientUsername: Text
messageType: Text
content: {
  title:   Text
  body:    Text
  priority: Nat8
  metadata: [(Text, Text)]
}`}</pre>
                  <p className="mt-3 text-xs text-zinc-400">Single payload in. Predictable for developers, consistent for users.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section id="problem" className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-3 text-3xl text-white sm:text-4xl" style={{fontFamily: '"Space Grotesk", ui-sans-serif'}}>The problem you can feel in your gut</h2>
              <p className="text-zinc-300">
                You need to reach users you don’t want to deanonymize. Email lists, Discord DMs, wallet popups—each adds
                friction, trust issues, and compliance risk. Messages fragment the moment a user rotates a wallet,
                switches providers, or abandons a channel.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5">
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2 text-base text-white">
                      <Shield className="h-4 w-4 text-cyan-400" /> Privacy vs. delivery
                    </div>
                  </div>
                  <div className="px-4 pb-4 text-sm text-zinc-300">Collecting contact data erodes trust. Not collecting it kills delivery. Most teams compromise and get both wrong.</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5">
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2 text-base text-white">
                      <Gauge className="h-4 w-4 text-fuchsia-400" /> Operational drag
                    </div>
                  </div>
                  <div className="px-4 pb-4 text-sm text-zinc-300">CSVs, bounced addresses, per-provider APIs. More surface area, more failure modes, more time not spent shipping.</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5">
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2 text-base text-white">
                      <Mail className="h-4 w-4 text-cyan-400" /> Spam and spoofing
                    </div>
                  </div>
                  <div className="px-4 pb-4 text-sm text-zinc-300">Open channels get abused. Users tune you out. Security alerts and governance notices get lost in the noise.</div>
                </div>
              </div>
              <p className="mt-8 text-zinc-300">
                Ignoring this costs more than churn. It damages credibility. It fragments your community. It makes every
                critical message—security notice, governance vote, redemption period—less likely to land.
              </p>
            </div>
          </div>
        </section>

        {/* Turning point */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-3 text-3xl text-white sm:text-4xl" style={{fontFamily: '"Space Grotesk", ui-sans-serif'}}>The turning point</h2>
              <p className="text-zinc-300">
                We tried to bolt email onto Web3. It didn’t fit. Address books, inboxes, and identity stores recreated the same problems we were escaping. The insight: dApps don’t need contact details to deliver value—they need a programmable, privacy-preserving way to reach the right user at the right time.
              </p>
            </div>
          </div>
        </section>

        {/* Solution */}
        <section id="solution" className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-3 text-3xl text-white sm:text-4xl" style={{fontFamily: '"Space Grotesk", ui-sans-serif'}}>Clypr, in plain language</h2>
              <p className="text-zinc-300">
                Clypr is a decentralized, programmable relay. dApps send a single, well‑structured payload to a user’s Clypr Agent username. Your rules decide what gets through, how it’s routed, and where it’s delivered. Your identity stays wallet‑linked and under your control.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5">
                <div className="px-4 pt-4">
                  <div className="flex items-center gap-2 text-white">
                    <Terminal className="h-5 w-5 text-cyan-400" /> <span>Core payload shape</span>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="rounded-lg border border-white/10 bg-[#0C0D14] p-4">
                    <pre className="text-sm leading-relaxed text-zinc-200" style={{fontFamily: '"IBM Plex Mono", ui-monospace'}}>{`recipientUsername: Text
messageType: Text
content: {
  title:   Text
  body:    Text
  priority: Nat8
  metadata: [(Text, Text)]
}`}</pre>
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">Single payload in. No endless API calls. Predictable for developers, consistent for users.</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5">
                <div className="px-4 pt-4">
                  <div className="flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5 text-fuchsia-400" /> <span>Technical guarantees</span>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <ul className="list-inside list-disc space-y-2 text-sm text-zinc-300">
                    <li>End‑to‑end encryption of content in transit</li>
                    <li>Programmable routing via rule engine (sender, type, priority, metadata)</li>
                    <li>Decentralized delivery—no central gatekeeper</li>
                    <li>Wallet‑linked identity and verification; no email/phone exposure</li>
                    <li>API‑first design; minimal code to send your first payload</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="mb-10 text-3xl text-white sm:text-4xl" style={{fontFamily: '"Space Grotesk", ui-sans-serif'}}>How it works</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Step icon={<Wallet className="h-5 w-5 text-cyan-400" />} title="1. Addressable without exposure" text="dApps target @username. No wallet, email, or phone is revealed. Aliases resolve privately to principals." />
              <Step icon={<Send className="h-5 w-5 text-fuchsia-400" />} title="2. Single payload in" text="Send one structured payload. Clypr handles identity resolution, rule evaluation, and orchestration." />
              <Step icon={<Filter className="h-5 w-5 text-cyan-400" />} title="3. Rules decide" text="Filter by sender identity, message type, priority, or custom metadata. Block, allow, or route." />
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <Step icon={<Lock className="h-5 w-5 text-fuchsia-400" />} title="4. Delivery without exposure" text="Channels can change over time. Connections don’t break. Senders never see where the message goes." />
              <Step icon={<CheckCircle2 className="h-5 w-5 text-cyan-400" />} title="5. Verifiable, auditable" text="Each message can be acknowledged. Governance and security flows stay traceable without leaking contact data." />
              <Step icon={<Network className="h-5 w-5 text-fuchsia-400" />} title="6. Decentralized control" text="No central inbox provider to trust. Your agent applies your policy—always." />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="mb-10 text-3xl text-white sm:text-4xl" style={{fontFamily: '"Space Grotesk", ui-sans-serif'}}>Outcomes that matter</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <Outcome title="Higher trust, lower friction" text="Reach users without harvesting data. Opt‑in by design, not by policy page." />
              <Outcome title="Spam immunity" text="If you didn’t explicitly allow it, it doesn’t reach you." />
              <Outcome title="Operational simplicity" text="One clean API. No lists to maintain. No vendor bottlenecks." />
              <Outcome title="Portable identity" text="Change channels, wallets, or providers without breaking connections." />
              <Outcome title="Security by default" text="Wallet‑linked verification and decentralized delivery reduce spoofing and leaks." />
              <Outcome title="Developer velocity" text="Send your first payload in minutes. API‑first, minimal surface area." />
            </div>
          </div>
        </section>

        {/* Use cases */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="mb-10 text-3xl text-white sm:text-4xl" style={{fontFamily: '"Space Grotesk", ui-sans-serif'}}>Where teams use Clypr</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <UseCase icon={<Boxes className="h-5 w-5 text-cyan-400" />} title="Protocol & token launches" text="Coordinate allowlists, drops, and vesting without doxxing users or managing contact lists." />
              <UseCase icon={<Layers className="h-5 w-5 text-fuchsia-400" />} title="DAOs & governance" text="Reach delegates and contributors with verified notices and vote calls—no Discord roulette." />
              <UseCase icon={<Workflow className="h-5 w-5 text-cyan-400" />} title="Wallets & clients" text="Security alerts and upgrade prompts delivered with rules, not blasts." />
            </div>
          </div>
        </section>

        {/* Why it matters */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="mb-3 text-3xl text-white sm:text-4xl" style={{fontFamily: '"Space Grotesk", ui-sans-serif'}}>Why it matters</h2>
            <p className="max-w-3xl text-zinc-300">
              Decentralized mail tried to copy email. Clypr cuts that tie. No addresses to guard, no DID lock‑in, no exposed metadata. It’s a private, chain‑agnostic interface between applications and the people who use them.
            </p>
            <ul className="mt-6 grid gap-3 text-zinc-300 sm:grid-cols-2">
              <li className="rounded border border-white/10 bg-white/5 p-3">No user data baggage—no inboxes to host, no addresses to leak.</li>
              <li className="rounded border border-white/10 bg-white/5 p-3">No lock‑in—identity isn’t bound to one chain, wallet, or protocol.</li>
              <li className="rounded border border-white/10 bg-white/5 p-3">Delivery without exposure—senders remain blind to your infrastructure.</li>
              <li className="rounded border border-white/10 bg-white/5 p-3">Purpose-built for dApps, not human email threads.</li>
            </ul>
          </div>
        </section>

        {/* Core features + solving decentralized mail */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5">
                <div className="px-4 pt-4">
                  <p className="text-white font-semibold">Core features (Now)</p>
                </div>
                <div className="space-y-6 px-4 pb-4">
                  <div>
                    <h4 className="mb-1 font-semibold text-white">Single Payload Messaging</h4>
                    <p className="text-sm text-zinc-300">dApps send one well-structured payload. Keeps things predictable for developers and consistent for users.</p>
                    <div className="mt-3 rounded border border-white/10 bg-[#0C0D14] p-3">
                      <pre className="text-xs text-zinc-200" style={{fontFamily: '"IBM Plex Mono", ui-monospace'}}>{`recipientUsername: Text
messageType: Text
content: {
  title: Text
  body: Text
  priority: Nat8
  metadata: [(Text,Text)]
}`}</pre>
                    </div>
                  </div>
                  <Feature title="Privacy-Preserving Contact" text="dApps never need your wallet address, email, or phone—just your Clypr Agent username. Your identity stays decentralized and under your control." />
                  <Feature title="Rule-Based Access Control" text="Decide exactly who can reach you and under what conditions. Filter by sender identity, message type, priority, or custom metadata. Full spam immunity." />
                  <Feature title="Seamless Contact Persistence" text="Update personal contact details anytime without breaking connections. Senders don’t know where messages go—only that they arrive." />
                  <Feature title="Developer-Friendly Integration" text="Send your first payload in minutes with a clean API. Works immediately for ICP; future-ready for multichain." />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5">
                <div className="px-4 pt-4">
                  <p className="text-white font-semibold">Solving what decentralized mail couldn’t</p>
                </div>
                <div className="space-y-3 px-4 pb-4 text-zinc-300">
                  <Bullet title="No user data baggage" text="Email-clone systems mirrored inboxes and address books. Clypr cuts that tie completely." />
                  <Bullet title="No lock-in" text="Identity isn’t bound to one chain, one wallet, or one protocol." />
                  <Bullet title="Delivery without exposure" text="Other attempts leak metadata or force the sender to know too much. With Clypr the sender stays blind to your infrastructure." />
                  <Bullet title="Purpose-built for dApps" text="A bridge between on-chain events and your real-world decentralized self—not another inbox in disguise." />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Future + unique */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5">
                <div className="px-4 pt-4">
                  <p className="text-white font-semibold">Future features</p>
                </div>
                <div className="space-y-4 px-4 pb-4">
                  <Feature title="Two-Way Communication" text="Secure, structured, and private back-and-forth between you and any dApp. Moves beyond broadcasts into interactive decentralized messaging." />
                  <Feature title="Multichain Support" text="Starting with ICP, expanding to any chain so developers can reach users regardless of deployment." />
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5">
                <div className="px-4 pt-4">
                  <p className="text-white font-semibold">Why it’s unique</p>
                </div>
                <div className="space-y-3 px-4 pb-4 text-zinc-300">
                  <Bullet title="Redefines decentralized communication" text="No addresses, no DID lock‑in, no exposed metadata." />
                  <Bullet title="Your decentralized point of contact" text="A persistent, private, chain‑agnostic interface between you and the apps you use." />
                  <Bullet title="Simpler than email for devs" text="Easier than building even a basic email service—zero contact data to handle." />
                  <Bullet title="Users keep control" text="Complete privacy and the freedom to move across chains without losing connection." />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Docs / Demo */}
        <section id="docs" className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="grid items-start gap-8 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5">
                <div className="px-4 pt-4">
                  <div className="flex items-center gap-2 text-white">
                    <Terminal className="h-5 w-5 text-cyan-400" /> <span>Send your first payload</span>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="rounded-lg border border-white/10 bg-[#0C0D14] p-4">
                    <pre className="text-sm text-zinc-200" style={{fontFamily: '"IBM Plex Mono", ui-monospace'}}>{`// API-first; minimal surface area
await actor.processMessage("alice", "notification", {
  title: "Hello",
  body: "Welcome to Clypr",
  priority: 3,
  metadata: [["k","v"]],
})`}</pre>
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">Works on ICP today; designed to extend cross‑chain.</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5">
                <div className="px-4 pt-4">
                  <p className="text-white font-semibold">Security & delivery—at a glance</p>
                </div>
                <div className="px-4 pb-4">
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li className="flex items-start gap-2"><Shield className="mt-0.5 h-4 w-4 text-cyan-400" /> End‑to‑end encryption</li>
                    <li className="flex items-start gap-2"><Workflow className="mt-0.5 h-4 w-4 text-fuchsia-400" /> Programmable routing based on identity, type, priority, metadata</li>
                    <li className="flex items-start gap-2"><Network className="mt-0.5 h-4 w-4 text-cyan-400" /> Decentralized delivery — no central gatekeeper</li>
                    <li className="flex items-start gap-2"><Wallet className="mt-0.5 h-4 w-4 text-fuchsia-400" /> Wallet‑linked identity & verification</li>
                    <li className="flex items-start gap-2"><Send className="mt-0.5 h-4 w-4 text-cyan-400" /> API‑first design for painless integration</li>
                  </ul>
                  <div className="mt-6">
                    <Link to="/demo">
                      <button className="w-full rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2.5 text-sm text-[#0A0A0F] hover:opacity-95">Try the interactive demo</button>
                    </Link>
                    <p className="mt-2 text-center text-xs text-zinc-400">No wallet or email required to explore.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final close */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
            <div className="mx-auto max-w-3xl">
              <h3 className="mb-4 text-3xl text-white sm:text-4xl" style={{fontFamily: '"Space Grotesk", ui-sans-serif'}}>Direct, private, programmable communication for Web3.</h3>
              <p className="mx-auto max-w-xl text-zinc-300">If you value security, ownership, and trust—start with a channel that honors all three.</p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link to="/demo">
                  <button className="inline-flex items-center rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-[#0A0A0F] hover:opacity-95">Launch the demo</button>
                </Link>
                <a href="#docs">
                  <button className="inline-flex items-center rounded-md border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white hover:bg-white/10">Integration guide</button>
                </a>
              </div>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-4">
              <TrustTile title="Ownership" text="You own identity & policy. Not a provider." />
              <TrustTile title="Privacy" text="No contact data collection, no exposure." />
              <TrustTile title="Security" text="Wallet‑linked verification by default." />
              <TrustTile title="Portability" text="Move chains without breaking connections." />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <p className="text-xs text-zinc-400">© {new Date().getFullYear()} Clypr. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#docs" className="text-xs text-zinc-400 hover:text-white">Docs</a>
            <a href="#how" className="text-xs text-zinc-400 hover:text-white">How it works</a>
            <a href="#solution" className="text-xs text-zinc-400 hover:text-white">Solution</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
