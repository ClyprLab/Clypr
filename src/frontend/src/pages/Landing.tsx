import React, { useState, useEffect, useRef } from 'react';
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
  X,
  AlertTriangle,
  Code,
  Bell,
  UserCheck,
  Sparkles,
  BrainCircuit,
  Users,
  Github,
  MessageSquare,
  Zap,
  Scale,
  Brain
} from 'lucide-react';

import '../index.css';              <div className="rounded-xl border border-white/10 bg-white/5 transform transition-all duration-500 hover:border-fuchsia-500/30 hover:shadow-lg hover:shadow-fuchsia-500/10">
                <div className="px-4 pt-4">
                  <div className="flex items-center gap-2 text-white">
                    <Shield className="h-5 w-5 text-fuchsia-400" /> 
                    <span className="font-medium">Powered by Internet Computer Protocol</span>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="mt-3 mb-4">
                    <div className="relative h-16 overflow-hidden rounded-lg bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/20 p-4">
                      <div className="absolute -top-6 -right-6 h-16 w-16 rounded-full bg-fuchsia-500/20 blur-xl"></div>
                      <div className="absolute -bottom-6 -left-6 h-16 w-16 rounded-full bg-cyan-500/20 blur-xl"></div>
                      <div className="relative flex items-center justify-between">
                        <div className="text-sm text-white">
                          <span className="font-medium">Web3-native architecture</span>
                          <div className="mt-1 text-xs text-zinc-300">Decentralized, Autonomous, Secure</div>
                        </div>
                        <div className="rounded-full bg-white/10 p-2">
                          <svg width="24" height="24" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M88.3675 50.4058L43.0675 76.9058C41.5675 77.8058 40.6675 79.4058 40.6675 81.1058V134.106C40.6675 135.806 41.5675 137.406 43.0675 138.306L88.3675 164.806C89.8675 165.706 91.6675 165.706 93.1675 164.806L138.467 138.306C139.967 137.406 140.867 135.806 140.867 134.106V81.1058C140.867 79.4058 139.967 77.8058 138.467 76.9058L93.1675 50.4058C91.6675 49.5058 89.8675 49.5058 88.3675 50.4058Z" stroke="url(#paint0_linear)" strokeWidth="3"/>
                            <defs>
                              <linearGradient id="paint0_linear" x1="40.6675" y1="107.606" x2="140.867" y2="107.606" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#38BDF8"/>
                                <stop offset="1" stopColor="#D946EF"/>
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:border-cyan-500/20 duration-300">
                      <div className="flex items-center mb-1">
                        <Zap className="h-4 w-4 text-cyan-400 mr-2" />
                        <span className="text-sm font-medium text-white">Real-time Speed</span>
                      </div>
                      <p className="text-xs text-zinc-300">Message routing in milliseconds with global distribution</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:border-fuchsia-500/20 duration-300">
                      <div className="flex items-center mb-1">
                        <Lock className="h-4 w-4 text-fuchsia-400 mr-2" />
                        <span className="text-sm font-medium text-white">True Privacy</span>
                      </div>
                      <p className="text-xs text-zinc-300">Canister isolation keeps your data and rules private</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:border-cyan-500/20 duration-300">
                      <div className="flex items-center mb-1">
                        <Scale className="h-4 w-4 text-cyan-400 mr-2" />
                        <span className="text-sm font-medium text-white">Infinite Scale</span>
                      </div>
                      <p className="text-xs text-zinc-300">Support for millions of users without bottlenecks</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:border-fuchsia-500/20 duration-300">
                      <div className="flex items-center mb-1">
                        <Brain className="h-4 w-4 text-fuchsia-400 mr-2" />
                        <span className="text-sm font-medium text-white">AI Ready</span>
                      </div>
                      <p className="text-xs text-zinc-300">Structured data optimized for intelligent processing</p>
                    </div>
                  </div>
                </div>
              </div>


function Step({ icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/5 transition-all duration-300 hover:bg-white/10">{icon}</span>
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <p className="text-sm text-zinc-300">{text}</p>
    </div>
  );
}

function Outcome({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-fuchsia-500/10">
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-zinc-300">{text}</p>
    </div>
  );
}

function UseCase({ icon, title, text }: { icon: any; title: string; text: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="mb-2 flex items-center gap-2">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/5 transition-all duration-300 hover:bg-white/10">{icon}</span>
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
    <div className="flex items-start gap-2 hover:bg-white/5 p-2 rounded-md transition-all duration-300">
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
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-left hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-zinc-400">{text}</p>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10">
      <button 
        className="w-full px-4 py-3 text-left flex justify-between items-center hover:bg-white/10 transition-all duration-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-sm font-semibold text-white">{question}</h3>
        <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      <div 
        className={`px-4 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}
      >
        <p className="text-sm text-zinc-300">{answer}</p>
      </div>
    </div>
  );
}

const Landing = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  // Intersection Observer for section highlighting
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2 }
    );
    
    document.querySelectorAll('section[id]').forEach(section => {
      observer.observe(section);
    });
    
    return () => observer.disconnect();
  }, []);

  // Smooth scroll for navigation
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setNavOpen(false);
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0F] text-zinc-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0A0A0F]/90 backdrop-blur supports-[backdrop-filter]:bg-[#0A0A0F]/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-[#0A0A0F] rounded-md flex items-center justify-center font-mono font-bold transition-transform group-hover:scale-110 duration-300">C</div>
              <span className="text-sm uppercase tracking-[0.18em] text-zinc-300 group-hover:text-white transition-colors">clypr</span>
            </Link>
            <nav className="hidden items-center gap-8 md:flex">
              <a href="#solution" className={`text-sm text-zinc-300 hover:text-white transition-colors ${activeSection === 'solution' ? 'text-white' : ''}`}>Solution</a>
              <a href="#how" className={`text-sm text-zinc-300 hover:text-white transition-colors ${activeSection === 'how' ? 'text-white' : ''}`}>How It Works</a>
              <a href="#faq" className={`text-sm text-zinc-300 hover:text-white transition-colors ${activeSection === 'faq' ? 'text-white' : ''}`}>FAQ</a>
              <Link to="/login" className="ml-6">
                <button className="inline-flex items-center rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-sm font-medium text-[#0A0A0F] hover:opacity-90 transition-all hover:scale-105 duration-300">
                  Launch App
                </button>
              </Link>
            </nav>
            <button
              aria-label="Toggle navigation"
              className="inline-flex items-center justify-center rounded-md p-2 text-zinc-300 hover:bg-white/10 transition-colors md:hidden"
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
              <a href="#solution" className="rounded px-2 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors">Solution</a>
              <a href="#how" className="rounded px-2 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors">How It Works</a>
              <a href="#faq" className="rounded px-2 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors">FAQ</a>
              <Link to="/login" className="px-2 py-2">
                <button className="w-full rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-3 py-2 text-sm text-[#0A0A0F] hover:opacity-95 transition-colors">Launch App</button>
              </Link>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(800px_500px_at_20%_-10%,rgba(56,189,248,0.18),rgba(10,10,15,0)),radial-gradient(800px_500px_at_90%_0%,rgba(217,70,239,0.18),rgba(10,10,15,0))]" />
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-24 sm:px-6 md:grid-cols-2 md:py-32 lg:py-40">
            <div>
              <h1 className="mb-6 font-space text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl animate-fade-in">
                Own your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">communications</span>, not the other way around.
              </h1>
              <p className="mb-8 max-w-xl text-xl text-zinc-300 animate-fade-in animation-delay-200">
                Connect with any dApp while keeping your identity private. You control what gets through and how it reaches you.
              </p>
              <div className="animate-fade-in animation-delay-400">
                <Link to="/login">
                  <button className="group inline-flex items-center rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3 text-base font-medium text-[#0A0A0F] transition-all hover:opacity-95 hover:scale-105 duration-300">
                    Start Now 
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
                <p className="mt-4 text-sm text-zinc-400 font-mono-ibm animate-fade-in animation-delay-600">
                  No credit card required • Easy setup • Immediate control
                </p>
              </div>
            </div>
            <div className="animate-slide-up animation-delay-400">
              {/* Interactive Demo */}
              <div className="relative rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-blue-500/10 duration-500">
                <div className="rounded-lg bg-[#0C0D14] p-4">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs text-zinc-400">Your dApp Messages</p>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:-translate-y-1 hover:border-cyan-500/30 duration-300">
                      <div className="flex justify-between mb-1">
                        <p className="text-xs text-fuchsia-400">EliteDAO</p>
                        <span className="text-xs text-zinc-500">2m ago</span>
                      </div>
                      <p className="text-sm text-white">Vote on proposal #147 - Funding Allocation</p>
                    </div>
                    
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:-translate-y-1 hover:border-fuchsia-500/30 duration-300">
                      <div className="flex justify-between mb-1">
                        <p className="text-xs text-cyan-400">CryptoSwap</p>
                        <span className="text-xs text-zinc-500">15m ago</span>
                      </div>
                      <p className="text-sm text-white">Your limit order has been executed</p>
                    </div>
                    
                    <div className="rounded-lg border border-white/10 bg-white/5 p-3 transition-all hover:-translate-y-1 hover:border-cyan-500/30 duration-300">
                      <div className="flex justify-between mb-1">
                        <p className="text-xs text-fuchsia-400">NFT Marketplace</p>
                        <span className="text-xs text-zinc-500">1h ago</span>
                      </div>
                      <p className="text-sm text-white">Your item sold for 1.2 ETH</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 px-1 flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Your channels:</span>
                    <div className="flex space-x-2">
                      <span className="text-xs bg-white/10 rounded px-2 py-1 text-white">Email</span>
                      <span className="text-xs bg-white/10 rounded px-2 py-1 text-white">SMS</span>
                      <span className="text-xs bg-white/10 rounded px-2 py-1 text-white">+2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Scroll down indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:flex flex-col items-center cursor-pointer" onClick={() => scrollToSection('solution')}>
            <span className="text-xs text-zinc-400 mb-2">Discover how</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-400">
              <path d="M12 5v14m0 0l-6-6m6 6l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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

        {/* User Flow visualization */}
        <section id="flow" className="border-t border-white/5 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(800px_600px_at_50%_50%,rgba(56,189,248,0.1),rgba(10,10,15,0))]"></div>
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="font-space text-3xl text-white sm:text-4xl mb-4">Experience the Clypr Flow</h2>
              <p className="text-zinc-300 max-w-2xl mx-auto">See how Clypr transforms your dApp communications with a seamless, private, and user-controlled experience</p>
            </div>
            
            <div className="relative">
              {/* Connection lines */}
              <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-cyan-400/20 via-fuchsia-500/20 to-cyan-400/20 transform -translate-y-1/2 hidden md:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                {/* Step 1: dApp */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 duration-500 transform hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400/20 to-cyan-400/10 flex items-center justify-center mb-4">
                    <Boxes className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">dApp Sends Message</h3>
                  <p className="text-zinc-300 mb-4">Developer sends a single structured payload to Clypr without knowing user's contact details</p>
                  
                  <div className="rounded-lg border border-white/10 bg-[#0C0D14] p-3 mt-4">
                    <pre className="font-mono-ibm text-xs text-zinc-300 overflow-x-auto">
{`await clypr.send({
  recipient: "@alice",
  type: "notification",
  payload: {
    title: "Vote on Proposal",
    body: "Your vote is needed"
  }
});`}
                    </pre>
                  </div>
                  
                  <div className="mt-5 flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Simple Integration</span>
                    <Link to="/login" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center">
                      Developer Docs <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
                
                {/* Step 2: Clypr Agent */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-fuchsia-500/30 hover:shadow-lg hover:shadow-fuchsia-500/10 duration-500 transform hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-400/20 to-fuchsia-400/10 flex items-center justify-center mb-4">
                    <Filter className="h-6 w-6 text-fuchsia-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">Clypr Agent Processes</h3>
                  <p className="text-zinc-300 mb-4">Your personal agent evaluates the message against your custom rules and decides how to route it</p>
                  
                  <div className="rounded-lg border border-white/10 bg-[#0C0D14] p-3 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-xs">
                        <CheckCircle2 className="h-3 w-3 text-green-400 mr-2" />
                        <span className="text-green-400 font-medium">Rule matched:</span>
                        <span className="ml-2 text-zinc-300">DAO Votes → Email + SMS</span>
                      </div>
                      <div className="flex items-center text-xs">
                        <Shield className="h-3 w-3 text-cyan-400 mr-2" />
                        <span className="text-zinc-300">Identity protected, no data leaked</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Privacy Preserved</span>
                    <Link to="/login" className="text-xs text-fuchsia-400 hover:text-fuchsia-300 flex items-center">
                      Create Rules <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
                
                {/* Step 3: Delivery */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-5 transition-all hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/10 duration-500 transform hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-cyan-400/20 to-cyan-400/10 flex items-center justify-center mb-4">
                    <Send className="h-6 w-6 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-medium text-white mb-3">Multi-Channel Delivery</h3>
                  <p className="text-zinc-300 mb-4">Messages routed to your preferred channels without revealing your contact details</p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="rounded-lg border border-white/10 bg-[#0C0D14] p-3 flex items-center">
                      <Mail className="h-4 w-4 text-cyan-400 mr-2" />
                      <span className="text-xs text-zinc-300">Email Delivered</span>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-[#0C0D14] p-3 flex items-center">
                      <Bell className="h-4 w-4 text-fuchsia-400 mr-2" />
                      <span className="text-xs text-zinc-300">SMS Received</span>
                    </div>
                  </div>
                  
                  <div className="mt-5 flex justify-between items-center">
                    <span className="text-xs text-zinc-400">Always Connected</span>
                    <Link to="/login" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center">
                      Setup Channels <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* CTA in the flow */}
              <div className="mt-12 text-center">
                <Link to="/login">
                  <button className="inline-flex items-center rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3 text-base font-medium text-[#0A0A0F] transition-all hover:opacity-95 hover:scale-105 duration-300">
                    Take Control of Your Communications
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </Link>
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

        {/* FAQ Section */}
        <section id="faq" className="border-t border-white/5 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_400px_at_70%_60%,rgba(217,70,239,0.1),rgba(10,10,15,0))]"></div>
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <h2 className="mb-8 font-space text-3xl text-white sm:text-4xl text-center">Frequently Asked Questions</h2>
            <div className="mx-auto max-w-3xl space-y-4">
              <FAQ 
                question="What problem does Clypr actually solve?" 
                answer="Clypr solves the fragmentation of Web3 communications. Currently, your dApps can't reach you without collecting personal info like email or phone. Clypr creates a privacy-first bridge where dApps communicate with you via your pseudonymous identity while you control exactly how those messages reach you—without ever exposing your personal channels."
              />
              <FAQ 
                question="How does Clypr protect my privacy?" 
                answer="Your contact information is never shared with message senders. Your communications are protected by end-to-end encryption, and your rules for message routing are executed by a personal agent running on Internet Computer Protocol. There's no central server with access to your data or communications patterns. You can create aliases for different dApps, further protecting your privacy."
              />
              <FAQ 
                question="What's the setup process like?" 
                answer="Getting started takes less than 2 minutes: 1) Create your Clypr identity with a username, 2) Connect your preferred channels (email, SMS, etc.), 3) Set basic privacy rules (or use our templates). That's it—now you're ready to receive communications from any integrated dApp while maintaining total privacy."
              />
              <FAQ 
                question="What makes Clypr better than existing notification systems?" 
                answer="Most notification systems are either centralized (privacy risk), siloed by platform (fragmentation), or require you to expose personal info. Clypr's innovation is creating a privacy-preserving layer that works across all dApps and lets you change how you receive messages without breaking connections. It's also fully decentralized on ICP, meaning no single entity controls your communication gateway."
              />
              <FAQ 
                question="How do developers integrate with Clypr?" 
                answer="Integration is incredibly simple. Developers only need to add a few lines of code to send messages through the Clypr protocol. They don't need to manage channels, user preferences, or message delivery—Clypr handles all of that. This means one integration reaches users on all their preferred channels forever, even as those channels change over time."
              />
              <FAQ 
                question="What channels does Clypr support?" 
                answer="Currently, Clypr supports email, SMS, Telegram, and webhook notifications. We're actively adding Discord, Slack, and mobile push notifications. The best part? As we add new channels, all integrated dApps automatically gain the ability to reach users on these new channels without any code changes."
              />
              <FAQ 
                question="Is Clypr only for crypto users?" 
                answer="While Clypr is built for Web3, anyone who values privacy in their communications can benefit. Many non-crypto users choose Clypr to consolidate notifications, filter communication noise, and protect their personal contact information. Our Rule Engine lets you create sophisticated filtering that works across all connected services."
              />
            </div>
            
            <div className="mt-12 text-center">
              <p className="text-zinc-300 mb-6">Have more questions about how Clypr works?</p>
              <Link to="/login">
                <button className="inline-flex items-center rounded-md border border-fuchsia-500/30 bg-fuchsia-500/10 px-6 py-3 text-base font-medium text-fuchsia-400 transition-all hover:bg-fuchsia-500/20 hover:text-fuchsia-300 duration-300">
                  Explore Documentation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Final CTAs */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
            <div className="mx-auto max-w-3xl">
              <h3 className="mb-4 font-space text-3xl text-white sm:text-4xl animate-fade-in">Direct, private, programmable communication for Web3.</h3>
              <p className="mx-auto max-w-xl text-zinc-300 animate-fade-in animation-delay-200">Start with a channel that honors security, ownership, and trust. Bridge on‑chain signals to real‑world outcomes—on your terms.</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-in animation-delay-400">
                <Link to="/demo">
                  <button className="inline-flex items-center rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-[#0A0A0F] hover:opacity-95 transition-all hover:scale-105">
                    Integrate Clypr <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="inline-flex items-center rounded-md border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-all hover:scale-105">
                    Claim your Agent
                  </button>
                </Link>
                <a href="#community">
                  <button className="inline-flex items-center rounded-md border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-all hover:scale-105">
                    Join the Clypr Network
                  </button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-neutral-100 text-neutral-900 rounded-md flex items-center justify-center font-mono font-bold">C</div>
              <span className="text-sm uppercase tracking-[0.18em] text-zinc-300">clypr</span>
            </div>
            
            <div className="flex gap-6 items-center">
              <a href="https://github.com/abdushakurob/clypr" className="text-zinc-400 hover:text-white transition-colors" aria-label="GitHub Repository" title="View GitHub Repository">
                <Github size={18} />
              </a>
              <a href="#twitter" className="text-zinc-400 hover:text-white transition-colors" aria-label="Twitter" title="Follow us on Twitter">
                <MessageSquare size={18} />
              </a>
              <a href="#discord" className="text-zinc-400 hover:text-white transition-colors" aria-label="Discord" title="Join our Discord community">
                <Users size={18} />
              </a>
            </div>
            
            <p className="text-xs text-zinc-400">© {new Date().getFullYear()} Clypr</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
