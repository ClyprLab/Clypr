import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Shield,
  Lock,
  Wallet,
  Send,
  Network,
  Terminal,
  CheckCircle2,
  Layers,
  Filter,
  Mail,
  Gauge,
  Boxes,
  X,
  Bell,
  Github,
  Zap,
  Scale,
  Brain
} from 'lucide-react';

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-twitter-x" viewBox="0 0 16 16">
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"/>
  </svg>
);

import MessageFlowDemo from '@/components/MessageFlowDemo';
import '../index.css';

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
        className={`px-4 overflow-hidden transition-all duration-300 ${isOpen ? 'mt-4 max-h-96 pb-4' : 'max-h-0'}`}
      >
        <p className="text-sm text-zinc-300">{answer}</p>
      </div>
    </div>
  );
}

const Landing = () => {
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
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
              <a href="/pricing" className="text-sm text-zinc-300 hover:text-white transition-colors">Pricing</a>
              <a href="/docs" className="text-sm text-zinc-300 hover:text-white transition-colors">Docs</a>
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
              <a href="/pricing" className="rounded px-2 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors">Pricing</a>
              <a href="/docs" className="rounded px-2 py-2 text-sm text-zinc-300 hover:bg-white/10 transition-colors">Docs</a>
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
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pt-16 pb-24 sm:px-6 md:grid-cols-2 md:pt-15 md:pb-32 lg:pb-40">
            <div>
              <h1 className="mb-6 font-space text-5xl leading-[1.05] tracking-tight text-white sm:text-6xl animate-fade-in">
                Own your <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-500">communications</span>, not the other way around.
              </h1>
              <p className="mb-8 max-w-xl text-xl text-zinc-300 animate-fade-in animation-delay-200">
                One username for all your Web3 messages. Decide what reaches you, where it goes, and who can contact you—without ever sharing your email or phone.
              </p>
              <div className="animate-fade-in animation-delay-400">
                <Link to="/login">
                  <button className="group inline-flex items-center rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3 text-base font-medium text-[#0A0A0F] transition-all hover:opacity-95 hover:scale-105 duration-300">
                    Start Now 
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </button>
                </Link>
                <p className="mt-4 text-sm text-zinc-400 font-mono-ibm animate-fade-in animation-delay-600">
                  2-minute setup • Works with any dApp • Private by design
                </p>
              </div>
            </div>
            <div className="animate-slide-up animation-delay-400">
              <MessageFlowDemo />
            </div>
          </div>
        </section>

        {/* Problem */}
        <section id="problem" className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-3xl">
              <h2 className="mb-3 font-space text-3xl text-white sm:text-4xl">Why Web3 communication feels broken</h2>
              <p className="text-zinc-300">
                Notifications are scattered. Wallet pings, email, Telegram, Discord—none of it connects. Developers rebuild the same logic everywhere. Users miss critical messages or drown in spam.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-white/5">
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2 text-base text-white">
                      <Shield className="h-4 w-4 text-cyan-400" /> Privacy vs. delivery
                    </div>
                  </div>
                  <div className="px-4 pb-4 text-sm text-zinc-300">Collecting contact info risks leaks. Skipping it means no delivery. Most systems fail on both ends.</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5">
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2 text-base text-white">
                      <Gauge className="h-4 w-4 text-fuchsia-400" /> Dev friction
                    </div>
                  </div>
                  <div className="px-4 pb-4 text-sm text-zinc-300">Every channel needs its own API, templates, and fixes. More code, more bugs, slower shipping.</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5">
                  <div className="px-4 pt-4 pb-2">
                    <div className="flex items-center gap-2 text-base text-white">
                      <Mail className="h-4 w-4 text-cyan-400" /> Spam and spoofing
                    </div>
                  </div>
                  <div className="px-4 pb-4 text-sm text-zinc-300">Open channels get abused. Users mute everything. Important alerts get lost in noise.</div>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">DAO vote missed → millions misallocated.</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">Rugpull warnings arrive too late.</div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-zinc-300">Airdrops expire unseen.</div>
              </div>
            </div>
          </div>
        </section>

        {/* Solution */}
        <section id="solution" className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-3 font-space text-3xl text-white sm:text-4xl">The breakthrough: Agents, not inboxes</h2>
              <p className="text-zinc-300">
                One username. One agent. Messages route to any channel—without exposing your details. Developers integrate once. You control rules, filters, and delivery forever.
              </p>
            </div>
          </div>
        </section>

        {/* Flow */}
        <section id="flow" className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="font-space text-3xl text-white sm:text-4xl mb-4">How it works</h2>
              <p className="text-zinc-300 max-w-2xl mx-auto">From dApp to delivery, see how Clypr keeps you connected—on your terms.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Step 
                icon={<Boxes className="h-6 w-6 text-cyan-400" />} 
                title="1. dApp sends once" 
                text="Developer sends one payload to @username. No need to know email or phone." 
              />
              <Step 
                icon={<Filter className="h-6 w-6 text-fuchsia-400" />} 
                title="2. Agent applies rules" 
                text="Your personal agent checks sender, keywords, priority, and routes accordingly." 
              />
              <Step 
                icon={<Send className="h-6 w-6 text-cyan-400" />} 
                title="3. Delivered your way" 
                text="Email, Telegram, SMS—wherever you choose. Sender never sees your address." 
              />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <h2 className="mb-8 font-space text-3xl text-white sm:text-4xl text-center">FAQ</h2>
            <div className="mx-auto max-w-3xl space-y-4">
              <FAQ question="What problem does Clypr solve?" answer="Right now, every dApp asks for your email, phone, or Telegram. That fragments your identity and leaks data. Clypr gives you one handle, and one agent that filters and routes messages across all your channels—without exposing your details." />
              <FAQ question="How does it protect my privacy?" answer="Your contact info is never shared. Messages are processed by your agent on ICP, not a central server. You decide rules: block, allow, or reroute. You can even create aliases per dApp." />
              <FAQ question="Is setup difficult?" answer="Nope. Takes under 2 minutes. Pick a username, connect your channels, set rules (or use templates). Done." />
              <FAQ question="How do developers integrate?" answer="It’s 5 lines of code. They send once, and Clypr handles routing, delivery, and user preferences. No per-channel rewrites." />
              <FAQ question="What channels are supported?" answer="Today: Email, Telegram, Webhooks. Coming soon: Discord, SMS, push." />
            </div>
          </div>
        </section>

        {/* Vision */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="font-space text-3xl text-white sm:text-4xl">Beyond notifications</h2>
            <p className="mt-2 max-w-3xl text-zinc-300">
              This isn’t just messaging. Clypr is the missing identity bridge for Web3—portable, programmable, and private. From AI-powered summaries to on-chain message reputation, your agent will evolve with the ecosystem.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
            <div className="mx-auto max-w-3xl">
              <h3 className="mb-4 font-space text-3xl text-white sm:text-4xl animate-fade-in">Direct, private, programmable communication for Web3.</h3>
              <p className="mx-auto max-w-xl text-zinc-300 animate-fade-in animation-delay-200">Start with a channel that respects privacy, ownership, and trust.</p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-in animation-delay-400">
                <Link to="/demo">
                  <button className="inline-flex items-center rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2.5 text-sm font-medium text-[#0A0A0F] hover:opacity-95 transition-all hover:scale-105">
                    Try the Demo <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="inline-flex items-center rounded-md border border-white/15 bg-transparent px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-all hover:scale-105">
                    Claim your Agent
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
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
              <a href="https://x.com/clypr_ic" className="text-zinc-400 hover:text-white transition-colors" aria-label="Twitter" title="Follow us on Twitter">
                <XIcon size={18} />
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
