import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  BookOpen, 
  Code, 
  Users, 
  Zap, 
  Shield, 
  ArrowRight,
  ChevronRight,
  FileText,
  Play,
  Terminal,
  Settings,
  MessageSquare,
  Globe,
  Key,
  Database,
  Cpu,
  Lock,
  CheckCircle
} from 'lucide-react';
import { cn } from '../utils/cn';

const Docs = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('getting-started');

  const navigation = [
    {
      title: 'Getting Started',
      id: 'getting-started',
      icon: Play,
      items: [
        { title: 'Quick Start', href: '#quick-start' },
        { title: 'Internet Identity Setup', href: '#ii-setup' },
        { title: 'Canister Integration', href: '#canister-integration' },
        { title: 'First Message', href: '#first-message' }
      ]
    },
    {
      title: 'Core Concepts',
      id: 'concepts',
      icon: BookOpen,
      items: [
        { title: 'Privacy Agents', href: '#privacy-agents' },
        { title: 'Message Flow', href: '#message-flow' },
        { title: 'Rules Engine', href: '#rules-engine' },
        { title: 'Channels', href: '#channels' }
      ]
    },
    {
      title: 'ICP Integration',
      id: 'icp',
      icon: Cpu,
      items: [
        { title: 'Canister Calls', href: '#canister-calls' },
        { title: 'Identity Management', href: '#identity-management' },
        { title: 'Cycle Management', href: '#cycle-management' },
        { title: 'Error Handling', href: '#error-handling' }
      ]
    },
    {
      title: 'API Reference',
      id: 'api',
      icon: Code,
      items: [
        { title: 'Message API', href: '#message-api' },
        { title: 'Rules API', href: '#rules-api' },
        { title: 'Channels API', href: '#channels-api' },
        { title: 'User Management', href: '#user-management' }
      ]
    },
    {
      title: 'Integration Guides',
      id: 'integrations',
      icon: Zap,
      items: [
        { title: 'Motoko Integration', href: '#motoko-integration' },
        { title: 'JavaScript/TypeScript', href: '#js-integration' },
        { title: 'React Hooks', href: '#react-hooks' },
        { title: 'Testing', href: '#testing' }
      ]
    },
    {
      title: 'Security & Privacy',
      id: 'security',
      icon: Shield,
      items: [
        { title: 'Data Protection', href: '#data-protection' },
        { title: 'Privacy Rules', href: '#privacy-rules' },
        { title: 'Audit Logs', href: '#audit-logs' },
        { title: 'Compliance', href: '#compliance' }
      ]
    }
  ];

  const quickStartCode = `// 1. Install dependencies
npm install @dfinity/agent @dfinity/auth-client @dfinity/identity

// 2. Initialize Internet Identity
import { AuthClient } from '@dfinity/auth-client';
import { Identity } from '@dfinity/agent';

const authClient = await AuthClient.create();
await authClient.login({
  identityProvider: 'https://identity.ic0.app',
  onSuccess: () => {
    console.log('Successfully authenticated!');
  }
});

// 3. Create agent and connect to Clypr canister
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './declarations/clypr/clypr.did.js';

const identity = authClient.getIdentity();
const agent = new HttpAgent({ identity });
await agent.fetchRootKey();

const clyprActor = Actor.createActor(idlFactory, {
  agent,
  canisterId: 'your-clypr-canister-id'
});

// 4. Send your first message
const message = await clyprActor.notifyAlias("alice", "notification", {
  title: "Welcome to Clypr!",
  body: "Your privacy-first communication layer is ready.",
  priority: 1,
  metadata: [["source", "onboarding"]]
});

console.log('Message sent:', message);`;

  const motokoExample = `// Motoko canister integration
import Clypr "canister:clypr";

actor {
    public shared({caller}) func sendNotification(
        recipient: Text,
        title: Text,
        body: Text,
        priority: Nat8
    ) : async Result.Result<Text, Text> {
        try {
            let message = await Clypr.notifyAlias(recipient, "notification", {
                title = title;
                body = body;
                priority = priority;
                metadata = [("source", "your-dapp")];
            });
            
            #ok(message)
        } catch (error) {
            #err(debug_show(error))
        }
    };
}`;

  const reactHookExample = `// hooks/useClypr.ts
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useClypr } from './useClypr';

export function useClyprMessaging() {
  const { principal } = useAuth();
  const { notifyAlias } = useClypr();
  const [loading, setLoading] = useState(false);

  const sendMessage = async (recipient: string, payload: any) => {
    if (!principal) throw new Error('Not authenticated');
    
    setLoading(true);
    try {
      const result = await notifyAlias(recipient, "notification", payload);
      return result;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { sendMessage, loading };
}`;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Header */}
      <header className="border-b border-white/5 bg-[#0A0A0F]/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-6 h-6 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-[#0A0A0F] rounded-md flex items-center justify-center font-mono font-bold transition-transform group-hover:scale-110 duration-300">
                C
              </div>
              <span className="text-sm uppercase tracking-[0.18em] text-zinc-300 group-hover:text-white transition-colors">
                clypr
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/pricing" className="text-sm text-zinc-300 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link to="/login">
                <button className="inline-flex items-center rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-sm font-medium text-[#0A0A0F] hover:opacity-90 transition-all hover:scale-105 duration-300">
                  Launch App
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/5 bg-[#0A0A0F]/50 h-screen sticky top-0 overflow-y-auto">
          <div className="p-4">
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search docs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-400 focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <nav className="space-y-6">
              {navigation.map((section) => {
                const Icon = section.icon;
                return (
                  <div key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-all duration-200",
                        activeSection === section.id
                          ? "bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 text-white border border-cyan-500/30"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <span className="text-sm font-medium">{section.title}</span>
                      <ChevronRight className={cn(
                        "h-4 w-4 ml-auto transition-transform duration-200",
                        activeSection === section.id && "rotate-90"
                      )} />
                    </button>
                    
                    {activeSection === section.id && (
                      <div className="mt-2 ml-7 space-y-1">
                        {section.items.map((item) => (
                          <a
                            key={item.href}
                            href={item.href}
                            className="block px-3 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                          >
                            {item.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Hero */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Documentation</h1>
                  <p className="text-zinc-400">Integrate Clypr into your ICP-based applications</p>
                </div>
              </div>
            </div>

            {/* Quick Start */}
            <section id="quick-start" className="mb-16">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Quick Start</h2>
                <p className="text-zinc-300 mb-6">
                  Get up and running with Clypr in minutes. This guide will help you integrate Clypr into your Internet Computer canister.
                </p>
              </div>

              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Prerequisites</h3>
                  <ul className="space-y-3 text-sm text-zinc-300">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                      <span>Internet Computer canister deployed</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                      <span>Internet Identity authentication</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                      <span>DFINITY agent and auth-client</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                      <span>Clypr canister ID</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Installation</h3>
                  <div className="bg-[#0C0D14] border border-white/10 rounded-lg p-4">
                    <pre className="text-sm text-zinc-200 font-mono overflow-x-auto">
{`npm install @dfinity/agent @dfinity/auth-client @dfinity/identity

# For Motoko canisters
# Add Clypr canister as a dependency in dfx.json`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Send Your First Message</h3>
                <div className="bg-[#0C0D14] border border-white/10 rounded-lg p-6">
                  <pre className="text-sm text-zinc-200 font-mono overflow-x-auto">
{quickStartCode}
                  </pre>
                </div>
              </div>
            </section>

            {/* ICP Integration */}
            <section id="icp" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">ICP Integration</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Canister Calls</h3>
                  <p className="text-zinc-300 text-sm mb-4">
                    Clypr is built as an Internet Computer canister. Integrate directly with cross-canister calls.
                  </p>
                  <div className="bg-[#0C0D14] border border-white/10 rounded-lg p-4">
                    <pre className="text-sm text-zinc-200 font-mono overflow-x-auto">
{motokoExample}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">React Hooks Integration</h3>
                  <p className="text-zinc-300 text-sm mb-4">
                    Use our React hooks for seamless integration in frontend applications.
                  </p>
                  <div className="bg-[#0C0D14] border border-white/10 rounded-lg p-4">
                    <pre className="text-sm text-zinc-200 font-mono overflow-x-auto">
{reactHookExample}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Core Concepts */}
            <section id="concepts" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Core Concepts</h2>
              
              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-cyan-400/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-5 w-5 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Privacy Agents</h3>
                  </div>
                  <p className="text-zinc-300 text-sm mb-4">
                    Each user has a personal privacy agent (canister) that processes incoming messages according to their rules. Agents are isolated and private.
                  </p>
                  <ul className="text-sm text-zinc-400 space-y-2">
                    <li>• User-owned canisters</li>
                    <li>• Isolated message processing</li>
                    <li>• Zero-knowledge operations</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-400/20 to-fuchsia-400/10 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-fuchsia-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Message Flow</h3>
                  </div>
                  <p className="text-zinc-300 text-sm mb-4">
                    Messages flow through the ICP network with cross-canister calls, ensuring privacy and decentralization.
                  </p>
                  <ul className="text-sm text-zinc-400 space-y-2">
                    <li>• Cross-canister communication</li>
                    <li>• Rule-based filtering</li>
                    <li>• Multi-channel delivery</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400/20 to-green-400/10 rounded-lg flex items-center justify-center">
                      <Settings className="h-5 w-5 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Rules Engine</h3>
                  </div>
                  <p className="text-zinc-300 text-sm mb-4">
                    User-defined rules run on their personal canister, ensuring complete control and privacy.
                  </p>
                  <ul className="text-sm text-zinc-400 space-y-2">
                    <li>• Canister-based execution</li>
                    <li>• User-controlled logic</li>
                    <li>• Automated actions</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-400/20 to-orange-400/10 rounded-lg flex items-center justify-center">
                      <Globe className="h-5 w-5 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">Channels</h3>
                  </div>
                  <p className="text-zinc-300 text-sm mb-4">
                    Support for multiple communication channels with canister-based routing and delivery.
                  </p>
                  <ul className="text-sm text-zinc-400 space-y-2">
                    <li>• Canister-managed routing</li>
                    <li>• Custom integrations</li>
                    <li>• Delivery guarantees</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* API Reference */}
            <section id="api" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">API Reference</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Message API</h3>
                  <p className="text-zinc-300 text-sm mb-4">
                    Send messages to users through their privacy agents using cross-canister calls.
                  </p>
                  <div className="bg-[#0C0D14] border border-white/10 rounded-lg p-4">
                    <pre className="text-sm text-zinc-200 font-mono overflow-x-auto">
{`// Send a message to a user
await clyprActor.notifyAlias(
  "alice",           // recipient username
  "notification",    // message type
  {
    title: "DAO Vote Required",
    body: "Proposal #123 needs your vote",
    priority: 2,
    metadata: [["proposal_id", "123"]]
  }
);

// Response
{
  ok: "message_id_abc123"
}`}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Rules API</h3>
                  <p className="text-zinc-300 text-sm mb-4">
                    Manage user privacy rules through canister calls.
                  </p>
                  <div className="bg-[#0C0D14] border border-white/10 rounded-lg p-4">
                    <pre className="text-sm text-zinc-200 font-mono overflow-x-auto">
{`// Create a new rule
await clyprActor.createRule({
  name: "DAO Notifications",
  condition: "sender == 'dao-canister-id'",
  action: "route_to_email",
  priority: 1
});

// List user rules
const rules = await clyprActor.getRules();`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Integration Examples */}
            <section id="integrations" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Integration Examples</h2>
              
              <div className="grid gap-8 md:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Motoko Canister</h3>
                  <div className="bg-[#0C0D14] border border-white/10 rounded-lg p-4 mb-4">
                    <pre className="text-sm text-zinc-200 font-mono overflow-x-auto">
{`import Clypr "canister:clypr";

actor {
    public shared({caller}) func notifyUser(
        recipient: Text,
        message: Text
    ) : async Result.Result<Text, Text> {
        try {
            let result = await Clypr.notifyAlias(
                recipient, 
                "notification", 
                {
                    title = "New Message";
                    body = message;
                    priority = 1;
                    metadata = [("source", "your-dapp")];
                }
            );
            #ok(result)
        } catch (error) {
            #err(debug_show(error))
        }
    };
}`}
                    </pre>
                  </div>
                  <Link href="#" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-2">
                    View full example <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">React Frontend</h3>
                  <div className="bg-[#0C0D14] border border-white/10 rounded-lg p-4 mb-4">
                    <pre className="text-sm text-zinc-200 font-mono overflow-x-auto">
{`import { useClypr } from './hooks/useClypr';

function NotificationButton({ recipient, message }) {
  const { notifyAlias, loading } = useClypr();

  const handleSend = async () => {
    try {
      await notifyAlias(recipient, "notification", {
        title: message.title,
        body: message.body,
        priority: 2
      });
      alert('Message sent!');
    } catch (error) {
      alert('Failed to send message');
    }
  };

  return (
    <button onClick={handleSend} disabled={loading}>
      {loading ? 'Sending...' : 'Send Notification'}
    </button>
  );
}`}
                    </pre>
                  </div>
                  <Link href="#" className="text-cyan-400 hover:text-cyan-300 text-sm flex items-center gap-2">
                    View full example <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>

            {/* Security & Privacy */}
            <section id="security" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Security & Privacy</h2>
              
              <div className="rounded-xl border border-white/10 bg-white/5 p-8">
                <div className="grid gap-8 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Data Protection</h3>
                    <ul className="text-sm text-zinc-300 space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Canister isolation ensures data privacy</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Zero-knowledge message processing</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Internet Identity authentication</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Decentralized architecture</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Privacy Rules</h3>
                    <ul className="text-sm text-zinc-300 space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                        <span>User-controlled canister logic</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Content-based message routing</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Sender reputation management</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                        <span>Automated spam detection</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="border-t border-white/5 pt-12">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Ready to get started?</h2>
                <p className="text-zinc-300 mb-8 max-w-2xl mx-auto">
                  Join developers building privacy-first applications on the Internet Computer
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/login">
                    <button className="inline-flex items-center rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-8 py-3 text-base font-medium text-[#0A0A0F] hover:opacity-90 transition-all hover:scale-105 duration-300">
                      Start Building
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
                  </Link>
                  <Link to="/pricing">
                    <button className="inline-flex items-center rounded-lg border border-white/20 bg-white/5 px-8 py-3 text-base font-medium text-white hover:bg-white/10 transition-all duration-300">
                      View Pricing
                    </button>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Docs;
