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
  X
} from 'lucide-react';

import '../index.css';

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
              <div className="w-6 h-6 bg-neutral-100 text-neutral-900 rounded-md flex items-center justify-center font-mono font-bold">C</div>
              <span className="text-sm uppercase tracking-[0.18em] text-zinc-300">clypr</span>
            </Link>
            <nav className="hidden items-center gap-6 md:flex">
              <a href="#problem" className="text-sm text-zinc-300 hover:text-white">Problem</a>
              <a href="#solution" className="text-sm text-zinc-300 hover:text-white">Solution</a>
              <a href="#how" className="text-sm text-zinc-300 hover:text-white">Journey</a>
              <a href="#docs" className="text-sm text-zinc-300 hover:text-white">Docs</a>
              <Link to="/demo" className="inline-flex">
                <button className="inline-flex items-center rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10">For developers</button>
              </Link>
              <Link to="/login" className="inline-flex">
                <button className="inline-flex items-center rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-1.5 text-sm font-medium text-[#0A0A0F] hover:opacity-95">For users</button>
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
              <a href="#how" className="rounded px-2 py-2 text-sm text-zinc-300 hover:bg-white/10">Journey</a>
              <a href="#docs" className="rounded px-2 py-2 text-sm text-zinc-300 hover:bg-white/10">Docs</a>
              <Link to="/demo" className="px-2 py-2">
                <button className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10">For developers</button>
              </Link>
              <Link to="/login" className="px-2 py-2">
                <button className="w-full rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-2 text-sm text-[#0A0A0F] hover:opacity-95">For users</button>
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
              {/* <div className="mb-4 inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-1">
                <span className="rounded border border-white/10 bg-transparent px-2 py-0.5 text-xs text-zinc-300">Fix Web3 communication—deliver privately, everywhere</span>
              </div> */}
              <h1 className="mb-4 font-space text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl">
                Your private bridge between dApps and real life.
              </h1>
              <p className="mb-8 max-w-xl text-zinc-300">
                Built on ICP for speed, scale, and privacy. Integrate once, deliver everywhere forever—email, SMS, webhooks—without exposing identity.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link to="/demo">
                  <button className="inline-flex items-center rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-[#0A0A0F] hover:opacity-95">
                    For developers <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="inline-flex items-center rounded-md border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white hover:bg-white/10">For users</button>
                </Link>
              </div>
              <p className="mt-4 text-xs text-zinc-400 font-mono-ibm">
                End‑to‑end encryption • User‑defined rules • AI‑assisted routing • Verifiable delivery
              </p>
            </div>
            <div>
              {/* Diagram placeholder */}
              <div className="relative rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="rounded-lg bg-[#0C0D14] p-4">
                  <p className="mb-3 text-xs text-zinc-400">Flow: dApp → Clypr Agent → Email/SMS/Webhooks</p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-zinc-300">Your dApp</p>
                      <p className="text-sm text-white">Sends one payload</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-zinc-300">Clypr Agent</p>
                      <p className="text-sm text-white">Evaluates rules</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-zinc-300">Channels</p>
                      <p className="text-sm text-white">Email / SMS / Webhooks</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-zinc-400">One payload in. Rules decide. Delivery without exposure.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section id="problem" className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-3 font-space text-3xl text-white sm:text-4xl">Why Web3 communication is broken</h2>
              <p className="text-zinc-300">
                Centralized inboxes are hackable. Wallet notifications are siloed. Identities rotate and messages miss. Devs rebuild for every channel and app.
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
                  <div className="px-4 pb-4 text-sm text-zinc-300">Per‑provider APIs, bounced addresses, CSVs. More surface area, more failure modes, less time shipping.</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5">
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2 text-base text-white">
                      <Mail className="h-4 w-4 text-cyan-400" /> Spam and spoofing
                    </div>
                  </div>
                  <div className="px-4 pb-4 text-sm text-zinc-300">Open channels get abused. Users tune you out. Critical messages get buried.</div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">Missed DAO vote → millions in misallocation.</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">Rugpull warnings don’t reach users in time.</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">Airdrops unclaimed due to delivery failures.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Breakthrough */}
        <section id="solution" className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-3 font-space text-3xl text-white sm:text-4xl">The breakthrough: Agents, not inboxes</h2>
              <p className="text-zinc-300">
                One persistent ID per user. Routes to any channel—without revealing contact info. Controlled entirely by the user. DApps integrate once; policy and routing evolve without app changes.
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
                    <pre className="font-mono-ibm text-sm leading-relaxed text-zinc-200">{`recipientUsername: Text
messageType: Text
content: {
  title:   Text
  body:    Text
  priority: Nat8
  metadata: [(Text, Text)]
}`}</pre>
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">One clean input. No inboxes to manage. Predictable for developers, consistent for users.</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5">
                <div className="px-4 pt-4">
                  <div className="flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5 text-fuchsia-400" /> <span>ICP enables it</span>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <ul className="list-inside list-disc space-y-2 text-sm text-zinc-300">
                    <li>Speed — real‑time routing at Internet speed</li>
                    <li>Scalability — millions of Agents</li>
                    <li>Security & Privacy — canisters, no central server</li>
                    <li>Integrate once — policy evolves, code doesn’t</li>
                    <li>AI‑ready — structured, semantic payloads</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why now + comparison */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="font-space text-2xl text-white">Why this hasn’t worked before</h3>
                <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                  <li>“Decentralized email” copied inboxes and leaked metadata.</li>
                  <li>Wallet notifications are siloed, spoofable, and easy to ignore.</li>
                  <li>Identity and channels drift; devs chase moving targets.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-space text-2xl text-white">Clypr vs anything else</h3>
                <div className="mt-3 grid gap-2 text-sm">
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-2 text-white"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Privacy‑first routing</div>
                    <div className="flex items-center gap-2 text-zinc-300"><X className="h-4 w-4 text-zinc-500" /> Inbox lock‑in</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-2 text-white"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> Integrate once</div>
                    <div className="flex items-center gap-2 text-zinc-300"><X className="h-4 w-4 text-zinc-500" /> Per‑channel rewrites</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center gap-2 text-white"><CheckCircle2 className="h-4 w-4 text-cyan-400" /> AI‑assisted summaries</div>
                    <div className="flex items-center gap-2 text-zinc-300"><X className="h-4 w-4 text-zinc-500" /> Noise and spam</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Journey */}
        <section id="how" className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="mb-10 font-space text-3xl text-white sm:text-4xl">The journey from signal to outcome</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <Step icon={<Wallet className="h-5 w-5 text-cyan-400" />} title="1. Addressable without exposure" text="dApps target @username. No wallet, email, or phone is revealed. Aliases resolve privately to principals." />
              <Step icon={<Send className="h-5 w-5 text-fuchsia-400" />} title="2. Single payload in" text="Send one structured payload. Clypr resolves identity, evaluates policy, and orchestrates delivery." />
              <Step icon={<Filter className="h-5 w-5 text-cyan-400" />} title="3. Rules decide" text="User‑defined rules filter by sender, type, priority, or metadata. Block, allow, or route." />
            </div>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <Step icon={<Lock className="h-5 w-5 text-fuchsia-400" />} title="4. Delivery without exposure" text="Channels can change over time. Connections don’t break. Senders never see where messages go." />
              <Step icon={<CheckCircle2 className="h-5 w-5 text-cyan-400" />} title="5. Verifiable & AI‑assisted" text="Acknowledge receipt, verify sender, auto‑summarize and prioritize with AI to reduce noise." />
              <Step icon={<Network className="h-5 w-5 text-fuchsia-400" />} title="6. Decentralized control" text="No central inbox provider to trust. Your agent applies your policy—always." />
            </div>
          </div>
        </section>

        {/* DX showcase */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5">
                <div className="px-4 pt-4">
                  <div className="flex items-center gap-2 text-white">
                    <Terminal className="h-5 w-5 text-cyan-400" /> <span>Send your first payload (5 lines)</span>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="rounded-lg border border-white/10 bg-[#0C0D14] p-4">
                    <pre className="font-mono-ibm text-sm text-zinc-200">{`await actor.processMessage("alice", "notification", {
  title: "Hello",
  body: "Welcome to Clypr",
  priority: 3,
  metadata: [["k","v"]],
})`}</pre>
                  </div>
                  <p className="mt-3 text-sm text-zinc-400">Build once. Deliver everywhere.</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5">
                <div className="px-4 pt-4">
                  <p className="text-white font-semibold">User experience</p>
                </div>
                <div className="space-y-3 px-4 pb-4 text-sm text-zinc-300">
                  <Bullet title="Create Agent" text="Claim your Clypr username." />
                  <Bullet title="Link channels" text="Connect email, SMS, or webhooks privately." />
                  <Bullet title="Set rules" text="For example: ‘Only allow DAO X to send high‑priority to Telegram’." />
                  <Bullet title="Receive instantly" text="Messages arrive where you want—without exposing identity." />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ICP Superpowers */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="font-space text-3xl text-white sm:text-4xl">Why we chose ICP</h2>
            <ul className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
              <li className="rounded border border-white/10 bg-white/5 p-3">Performance and cost profile fit real‑time messaging</li>
              <li className="rounded border border-white/10 bg-white/5 p-3">Canister model enables decentralized, user‑owned Agents</li>
              <li className="rounded border border-white/10 bg-white/5 p-3">Privacy by design—no central server to trust</li>
              <li className="rounded border border-white/10 bg-white/5 p-3">Developer‑friendly, scalable foundation for millions of Agents</li>
            </ul>
          </div>
        </section>

        {/* Vision */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="font-space text-3xl text-white sm:text-4xl">Beyond messages: a programmable identity bridge</h2>
            <p className="mt-2 max-w-3xl text-zinc-300">
              Clypr isn’t a tool. It’s the communication layer Web3 has been waiting for. Near‑term: AI auto‑responses, on‑chain message reputation, DAO proposal summaries, encrypted voice drops. Long‑term: portable, programmable identity and communications across all apps and chains.
            </p>
          </div>
        </section>

        {/* Proof / Momentum */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Hackathon track</p>
                <p className="mt-1 text-sm text-zinc-300">Building in the open. Explore the repo and API.</p>
                <a href="https://github.com/abdushakurob/clypr" className="mt-3 inline-block text-xs text-cyan-300 hover:text-cyan-200">GitHub →</a>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Developer‑first</p>
                <p className="mt-1 text-sm text-zinc-300">“It took 15 minutes to integrate Clypr into our DAO app.” — early tester</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm font-semibold text-white">Scales with you</p>
                <p className="mt-1 text-sm text-zinc-300">Designed for millions of Agents and real‑time routing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTAs */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
            <div className="mx-auto max-w-3xl">
              <h3 className="mb-4 font-space text-3xl text-white sm:text-4xl">Direct, private, programmable communication for Web3.</h3>
              <p className="mx-auto max-w-xl text-zinc-300">Start with a channel that honors security, ownership, and trust. Bridge on‑chain signals to real‑world outcomes—on your terms.</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link to="/demo">
                  <button className="inline-flex items-center rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-[#0A0A0F] hover:opacity-95">Integrate Clypr</button>
                </Link>
                <Link to="/login">
                  <button className="inline-flex items-center rounded-md border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white hover:bg-white/10">Claim your Agent</button>
                </Link>
                <a href="#community">
                  <button className="inline-flex items-center rounded-md border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white hover:bg-white/10">Join the Clypr Network</button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <p className="text-xs text-zinc-400">© {new Date().getFullYear()} Clypr. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#docs" className="text-xs text-zinc-400 hover:text-white">Docs</a>
            <a href="#how" className="text-xs text-zinc-400 hover:text-white">Journey</a>
            <a href="#solution" className="text-xs text-zinc-400 hover:text-white">Solution</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
