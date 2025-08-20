import React from 'react';
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
  CheckCircle,
  Mail,
  Bell,
  Send
} from 'lucide-react';
import { cn } from '../utils/cn';
import CodeBlock from '../components/UI/CodeBlock';

const Docs = () => {
  const [searchTerm, setSearchTerm] = (React as any).useState('');
  const [activeSection, setActiveSection] = (React as any).useState('getting-started');

  const [activeSubsection, setActiveSubsection] = (React as any).useState('');

  // Handle scroll to update active section and subsection
  (React as any).useEffect(() => {
    const handleScroll = () => {
      const allElements = document.querySelectorAll('section[id], div[id]');
      const scrollPosition = window.scrollY + 150;

      let currentSection = 'getting-started';
      let currentSubsection = '';

      allElements.forEach((element) => {
        const elementTop = (element as HTMLElement).offsetTop;
        const elementHeight = (element as HTMLElement).offsetHeight;
        const elementId = element.getAttribute('id');

        if (scrollPosition >= elementTop && scrollPosition < elementTop + elementHeight) {
          if (elementId) {
            // Check if this is a main section or subsection
            const mainSection = navigation.find(nav => nav.id === elementId);
            if (mainSection) {
              currentSection = elementId;
            } else {
              // This is a subsection
              currentSubsection = elementId;
              // Find which main section this subsection belongs to
              for (const nav of navigation) {
                if (nav.items.some(item => item.href === `#${elementId}`)) {
                  currentSection = nav.id;
                  break;
                }
              }
            }
          }
        }
      });

      setActiveSection(currentSection);
      setActiveSubsection(currentSubsection);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    {
      title: 'Getting Started',
      id: 'getting-started',
      icon: Play,
      items: [
        { title: 'Quick Start', href: '#quick-start' },
        { title: 'Installation', href: '#installation' },
        { title: 'Configuration', href: '#configuration' },
        { title: 'Send Your First Message', href: '#first-message' }
      ]
    },
    {
      title: 'API Reference',
      id: 'api',
      icon: Code,
      items: [
        { title: 'notifyAlias', href: '#notify-alias' },
        { title: 'verifyAlias', href: '#verify-alias' },
        { title: 'Field Reference', href: '#field-reference' },
        { title: 'Error Handling', href: '#error-handling' }
      ]
    },
    {
      title: 'Language Examples',
      id: 'examples',
      icon: Terminal,
      items: [
        { title: 'Motoko', href: '#motoko-examples' },
        { title: 'Rust', href: '#rust-examples' },
        { title: 'Python', href: '#python-examples' },
        { title: 'JavaScript/TypeScript', href: '#js-examples' }
      ]
    },
    {
      title: 'Integration Guides',
      id: 'integrations',
      icon: Zap,
      items: [
        { title: 'Canister Integration', href: '#canister-integration' },
        { title: 'Frontend Integration', href: '#frontend-integration' }
      ]
    },
    {
      title: 'Message Types',
      id: 'message-types',
      icon: MessageSquare,
      items: [
        { title: 'Message Structure', href: '#message-structure' },
        { title: 'Priority Levels', href: '#priority-levels' },
        { title: 'Metadata Examples', href: '#metadata-examples' }
      ]
    },
    {
      title: 'Advanced Topics',
      id: 'advanced',
      icon: Settings,
      items: [
        { title: 'Error Handling', href: '#advanced-error-handling' },
        { title: 'Rate Limiting', href: '#rate-limiting' },
        { title: 'Best Practices', href: '#best-practices' }
      ]
    }
  ];

  const quickStartCode = `// 1. Install dependencies
npm install @dfinity/agent @dfinity/auth-client @dfinity/identity

// 2. Initialize Internet Identity
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';

const authClient = await AuthClient.create();
await authClient.login({
  identityProvider: 'https://identity.ic0.app',
  onSuccess: () => {
    console.log('Successfully authenticated!');
  }
});

// 3. Create agent and connect to Clypr canister
const identity = authClient.getIdentity();
const agent = new HttpAgent({ identity });
await agent.fetchRootKey();

const clyprActor = Actor.createActor(idlFactory, {
  agent,
  canisterId: '5elod-ciaaa-aaaag-aufgq-cai' ]
});

// 4. Send a message to a user
const message = await clyprActor.notifyAlias("alice", "notification", {
  title: "Welcome to Clypr!",
  body: "Your privacy-first communication layer is ready.",
  priority: 1,
  contentType: "text/plain", // Required: "text/plain" or "application/json"
  metadata: [["source", "onboarding"]]
});

console.log('Message sent:', message);`;

  const motokoExample = `// Motoko canister integration
import Clypr "canister:clypr";
import Result "mo:base/Result";
import Text "mo:base/Text";
import Nat8 "mo:base/Nat8";

actor {
    // Verify if a user exists before sending
    public shared({caller}) func verifyUser(alias: Text) : async Bool {
        await Clypr.verifyAlias(alias)
    };

    // Send notification to a user
    public shared({caller}) func sendNotification(
        recipient: Text,
        title: Text,
        body: Text,
        priority: Nat8
    ) : async Result.Result<Text, Text> {
        try {
            // First verify the user exists
            let userExists = await Clypr.verifyAlias(recipient);
            if (not userExists) {
                return #err("User not found");
            };

            let message = await Clypr.notifyAlias(recipient, "notification", {
                title = title;
                body = body;
                priority = priority;
                contentType = "text/plain";
                metadata = [("source", "your-dapp")];
            });
            
            #ok(message)
        } catch (error) {
            #err(debug_show(error))
        }
    };
}`;

  const rustExample = `// Rust canister integration
use candid::{CandidType, Deserialize};
use ic_cdk::api::call::call;
use ic_cdk::api::call::CallResult;
use ic_cdk::export::Principal;

#[derive(CandidType, Deserialize)]
struct MessageContent {
    title: String,
    body: String,
    priority: u8,
    contentType: String,
    metadata: Vec<(String, String)>,
}

#[ic_cdk::update]
async fn verify_user(alias: String) -> CallResult<bool> {
    let clypr_principal = Principal::from_text("5elod-ciaaa-aaaag-aufgq-cai")
        .expect("Invalid canister ID");
    
    call(clypr_principal, "verifyAlias", (alias,)).await
}

#[ic_cdk::update]
async fn send_notification(
    recipient: String,
    title: String,
    body: String,
    priority: u8,
) -> CallResult<String> {
    let clypr_principal = Principal::from_text("5elod-ciaaa-aaaag-aufgq-cai")
        .expect("Invalid canister ID");
    
    // First verify the user exists
    let user_exists: bool = verify_user(recipient.clone()).await?;
    if !user_exists {
        return Err("User not found".into());
    }

    let content = MessageContent {
        title,
        body,
        priority,
        contentType: "text/plain".to_string(),
        metadata: vec![("source".to_string(), "your-dapp".to_string())],
    };

    call(clypr_principal, "notifyAlias", (recipient, "notification".to_string(), content)).await
}`;

    const pythonExample = `# Python integration using ic-agent
from ic_agent import Agent, Identity
from ic_agent.auth import AuthClient
import asyncio
from typing import Dict, List, Tuple

class ClyprMessaging:
    def __init__(self, canister_id: str):
        self.canister_id = canister_id
        self.agent = None
        self.clypr_actor = None
    
    async def initialize(self):
        """Initialize the agent and create Clypr actor"""
        auth_client = AuthClient()
        await auth_client.login()
        
        identity = auth_client.get_identity()
        self.agent = Agent(identity=identity)
        
        # Create actor (you'll need to provide the IDL)
        self.clypr_actor = self.agent.create_actor(
            canister_id=self.canister_id,
            interface_idl=idl_factory  # You'll need to import this
        )
    
    async def verify_user(self, alias: str) -> bool:
        """Verify if a user exists"""
        if not self.clypr_actor:
            raise RuntimeError("Agent not initialized. Call initialize() first.")
        
        try:
            exists = await self.clypr_actor.verifyAlias(alias)
            return exists
        except Exception as e:
            print(f"Error verifying user: {e}")
            return False
    
    async def send_message(
        self, 
        recipient: str, 
        title: str, 
        body: str, 
        priority: int = 3,
        metadata: List[Tuple[str, str]] = None
    ) -> str:
        """Send a message to a user"""
        if not self.clypr_actor:
            raise RuntimeError("Agent not initialized. Call initialize() first.")
        
        # First verify the user exists
        user_exists = await self.verify_user(recipient)
        if not user_exists:
            raise ValueError(f"User '{recipient}' not found")
        
        # Prepare message content
        content = {
            "title": title,
            "body": body,
            "priority": priority,
            "contentType": "text/plain",
            "metadata": metadata or [["source", "python-client"]]
        }
        
        # Send message
        message_id = await self.clypr_actor.notifyAlias(
            recipient, "notification", content
        )
        
        return message_id

# Usage example
async def main():
    clypr = ClyprMessaging("5elod-ciaaa-aaaag-aufgq-cai")
    await clypr.initialize()
    
    try:
        message_id = await clypr.send_message(
            recipient="alice",
            title="Welcome to Clypr!",
            body="Your privacy-first communication layer is ready.",
            priority=1,
            metadata=[["source", "onboarding"], ["client", "python"]]
        )
        print(f"Message sent successfully: {message_id}")
    except Exception as e:
        print(f"Failed to send message: {e}")

# Run the example
if __name__ == "__main__":
    asyncio.run(main())`;

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
                        {section.items.map((item) => (                            <a
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "block px-3 py-2 text-sm rounded-lg transition-all duration-200",
                              activeSubsection === item.href.substring(1)
                                ? "bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 text-white border border-cyan-500/20"
                                : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
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
                  <Code className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Developer Documentation</h1>
                  <p className="text-zinc-400">Integrate Clypr messaging into your ICP applications</p>
                </div>
              </div>
            </div>

            {/* Quick Start */}
            <section id="quick-start" className="mb-16">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Quick Start</h2>
                <p className="text-zinc-300 mb-6">
                  Get up and running with Clypr messaging in minutes. Send messages to users through their privacy agents.
                </p>
              </div>

              <div className="">
                <div id="installation">
                  <h3 className="text-lg font-semibold text-white mb-4">Prerequisites</h3>
                  <ul className="space-y-3 text-sm text-zinc-300">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                      <span>Internet Computer canister or frontend app</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                      <span>DFINITY agent and auth-client libraries</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                      <span>Clypr canister ID (get from configuration)</span>
                    </li>
                                         <li className="flex items-start gap-3">
                       <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                       <span>Target user's Clypr alias (that's all you need!)</span>
                     </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                      <span>Internet Identity authentication</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Installation</h3>
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">1. Frontend Development (JavaScript/TypeScript)</h4>
                      <p className="text-sm text-zinc-300 mb-4">
                        For web applications using React, Next.js, or any JavaScript framework.
                      </p>
                      <CodeBlock language="bash">
                        npm install @dfinity/agent @dfinity/auth-client @dfinity/identity
                      </CodeBlock>
                    </div>

                    <div className="bg-white/5 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">2. Motoko Canister Development</h4>
                      <p className="text-sm text-zinc-300 mb-4">
                        For building Internet Computer canisters in Motoko. Add to your dfx.json:
                      </p>
                      <CodeBlock language="json">
{`{
  "canisters": {
    "your-canister": {
      "dependencies": ["clypr"]
    }
  }
}`}
                      </CodeBlock>
                    </div>

                    <div className="bg-white/5 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">3. Rust Canister Development</h4>
                      <p className="text-sm text-zinc-300 mb-4">
                        For building Internet Computer canisters in Rust. Add to your Cargo.toml:
                      </p>
                      <CodeBlock language="toml">
{`[dependencies]
ic-cdk = "0.12"
candid = "0.10"`}
                      </CodeBlock>
                    </div>

                    <div className="bg-white/5 rounded-lg p-6">
                      <h4 className="font-semibold text-white mb-4">4. External Integration (Python)</h4>
                      <p className="text-sm text-zinc-300 mb-4">
                        For external scripts and services integrating with the Internet Computer.
                      </p>
                      <CodeBlock language="bash">
                        pip install ic-agent
                      </CodeBlock>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8" id="configuration">
                <h3 className="text-lg font-semibold text-white mb-4">Configuration</h3>
                <p className="text-zinc-300 text-sm mb-4">
                  Update the configuration file with your Clypr canister ID and other settings.
                </p>
                                 <CodeBlock language="json">
{`{
  "canisterId": "5elod-ciaaa-aaaag-aufgq-cai",
  "api": {
    "baseUrl": "https://5nif7-uaaaa-aaaag-aufha-caiic0.app",
    "identityProvider": "https://identity.ic0.app"
  },
  "contentTypes": [
    "text/plain",
    "application/json"
  ]
}`}
                 </CodeBlock>
              </div>

              <div className="mt-8" id="first-message">
                <h3 className="text-lg font-semibold text-white mb-4">Send Your First Message</h3>
                <CodeBlock language="javascript">
{quickStartCode}
                </CodeBlock>
              </div>
            </section>

            {/* API Reference */}
            <section id="api" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">API Reference</h2>
              
              <div className="space-y-8">
                <div id="notify-alias">
                  <h3 className="text-lg font-semibold text-white mb-4">notifyAlias</h3>
                  <p className="text-zinc-300 text-sm mb-4">
                    Send a message to a user by their Clypr username.
                  </p>
                  <CodeBlock language="typescript">
{`notifyAlias(
  username: string,           // Clypr username (e.g., "alice")
  messageType: string,        // Message type (e.g., "notification")
  content: {
    title: string,            // Message title (max 256 chars)
    body: string,             // Message body (max 10KB)
    priority: number,         // Priority level (1-5)
    contentType: string,      // "text/plain" or "application/json"
    metadata: [string, string][] // Custom metadata (optional)
  }
): Promise<string>           // Returns message ID`}
                  </CodeBlock>
                </div>

                                 <div id="verify-alias">
                   <h3 className="text-lg font-semibold text-white mb-4">verifyAlias</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     Check if a Clypr alias exists and is valid.
                   </p>
                   <CodeBlock language="typescript">
{`verifyAlias(
  alias: string              // Clypr alias to verify
): Promise<boolean>         // Returns true if alias exists`}
                   </CodeBlock>
                 </div>

                <div id="error-handling">
                  <h3 className="text-lg font-semibold text-white mb-4">Error Handling</h3>
                  <p className="text-zinc-300 text-sm mb-4">
                    Common errors and how to handle them when sending messages.
                  </p>
                                     <CodeBlock language="typescript">
{`// Common error types
try {
  // First verify the user exists
  const userExists = await clyprActor.verifyAlias(recipient);
  if (!userExists) {
    console.error('User not found or not registered with Clypr');
    return;
  }

  const result = await clyprActor.notifyAlias(recipient, "notification", content);
  console.log('Message sent:', result);
} catch (error) {
  if (error.message.includes('NotFound')) {
    console.error('User not found or not registered with Clypr');
  } else if (error.message.includes('RateLimitExceeded')) {
    console.error('Rate limit exceeded, try again later');
  } else if (error.message.includes('InvalidContentType')) {
    console.error('Content type must be "text/plain" or "application/json"');
  } else if (error.message.includes('InvalidPriority')) {
    console.error('Priority must be between 1 and 5');
  } else {
    console.error('Failed to send message:', error);
  }
}`}
                   </CodeBlock>
                </div>
              </div>
            </section>

            {/* Field Reference */}
            <section id="field-reference" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Field Reference</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Message Content Fields</h3>
                  <div className="bg-white/5 rounded-lg p-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-white mb-2">title (string, required)</h4>
                        <p className="text-sm text-zinc-300 mb-2">The message title displayed to the user.</p>
                        <ul className="text-xs text-zinc-400 space-y-1">
                          <li>• <strong>Max length:</strong> 256 characters</li>
                          <li>• <strong>Example:</strong> "DAO Vote Required"</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">body (string, required)</h4>
                        <p className="text-sm text-zinc-300 mb-2">The main message content.</p>
                        <ul className="text-xs text-zinc-400 space-y-1">
                          <li>• <strong>Max length:</strong> 10,240 characters</li>
                          <li>• <strong>Example:</strong> "Proposal #123 needs your vote by tomorrow."</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">priority (number, required)</h4>
                        <p className="text-sm text-zinc-300 mb-2">Message priority level (1-5).</p>
                        <ul className="text-xs text-zinc-400 space-y-1">
                          <li>• <strong>1:</strong> Critical - Emergency notifications, security alerts</li>
                          <li>• <strong>2:</strong> High - Important updates, time-sensitive actions</li>
                          <li>• <strong>3:</strong> Normal - Regular notifications, general updates</li>
                          <li>• <strong>4:</strong> Low - Newsletters, promotional content</li>
                          <li>• <strong>5:</strong> Very Low - Marketing, non-urgent content</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">contentType (string, required)</h4>
                        <p className="text-sm text-zinc-300 mb-2">The content type of the message body.</p>
                        <ul className="text-xs text-zinc-400 space-y-1">
                          <li>• <strong>Allowed values:</strong> "text/plain" or "application/json"</li>
                          <li>• <strong>Default:</strong> "text/plain"</li>
                          <li>• <strong>Note:</strong> Other content types will be rejected</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-white mb-2">metadata (array, optional)</h4>
                        <p className="text-sm text-zinc-300 mb-2">Custom key-value pairs for additional context.</p>
                        <ul className="text-xs text-zinc-400 space-y-1">
                          <li>• <strong>Max pairs:</strong> 10</li>
                          <li>• <strong>Key max length:</strong> 50 characters</li>
                          <li>• <strong>Value max length:</strong> 200 characters</li>
                          <li>• <strong>Example:</strong> [["proposal_id", "123"], ["deadline", "2024-01-15"]]</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                                 <div>
                   <h3 className="text-lg font-semibold text-white mb-4">User Identification</h3>
                   <div className="bg-white/5 rounded-lg p-6">
                     <div className="space-y-4">
                       <div>
                         <h4 className="font-semibold text-white mb-2">Clypr Alias (string)</h4>
                         <p className="text-sm text-zinc-300 mb-2">The user's registered Clypr alias - that's all you need!</p>
                         <ul className="text-xs text-zinc-400 space-y-1">
                           <li>• <strong>Format:</strong> Alphanumeric, lowercase, no spaces</li>
                           <li>• <strong>Example:</strong> "alice", "bob123", "dao_member"</li>
                           <li>• <strong>Note:</strong> All users with Clypr aliases are valid recipients</li>
                           <li>• <strong>Verification:</strong> Use verifyAlias() to check if an alias exists</li>
                         </ul>
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
            </section>

            {/* Language Examples */}
            <section id="examples" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Language Examples</h2>
              
                             <div className="space-y-8">
                 <div id="motoko-examples">
                   <h3 className="text-lg font-semibold text-white mb-4">Motoko</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     Cross-canister calls from a Motoko canister. Perfect for ICP-native applications.
                   </p>

                   <CodeBlock language="motoko">
{motokoExample}
                   </CodeBlock>
                 </div>

                                 <div id="rust-examples">
                   <h3 className="text-lg font-semibold text-white mb-4">Rust</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     Cross-canister calls from a Rust canister. Ideal for performance-critical applications.
                   </p>

                   <CodeBlock language="rust">
{rustExample}
                   </CodeBlock>
                 </div>

                                 <div id="python-examples">
                   <h3 className="text-lg font-semibold text-white mb-4">Python</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     Using Python with ic-agent library. Great for scripts and external integrations.
                   </p>

                   <CodeBlock language="python">
{pythonExample}
                   </CodeBlock>
                 </div>

                                 <div id="js-examples">
                   <h3 className="text-lg font-semibold text-white mb-4">JavaScript/TypeScript</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     Frontend integration with React hooks. Perfect for web applications and user interfaces.
                   </p>

                   <CodeBlock language="typescript">
{`// TypeScript/JavaScript integration
import { AuthClient } from '@dfinity/auth-client';
import { Actor, HttpAgent } from '@dfinity/agent';

interface MessageContent {
  title: string;
  body: string;
  priority: number;
  contentType: string;
  metadata?: [string, string][];
}

class ClyprClient {
  private agent: HttpAgent | null = null;
  private actor: any = null;
  private canisterId: string;

  constructor(canisterId: string) {
    this.canisterId = canisterId;
  }

  async initialize(): Promise<void> {
    // Initialize Internet Identity
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: 'https://identity.ic0.app',
      onSuccess: () => console.log('Successfully authenticated!')
    });

    // Create agent and actor
    const identity = authClient.getIdentity();
    this.agent = new HttpAgent({ identity });
    await this.agent.fetchRootKey();

    this.actor = Actor.createActor(idlFactory, {
      agent: this.agent,
      canisterId: this.canisterId
    });
  }

  async verifyUser(alias: string): Promise<boolean> {
    if (!this.actor) {
      throw new Error('Client not initialized. Call initialize() first.');
    }
    
    try {
      return await this.actor.verifyAlias(alias);
    } catch (error) {
      console.error('Error verifying user:', error);
      return false;
    }
  }

  async sendMessage(
    recipient: string,
    content: MessageContent
  ): Promise<string> {
    if (!this.actor) {
      throw new Error('Client not initialized. Call initialize() first.');
    }

    // First verify the user exists
    const userExists = await this.verifyUser(recipient);
    if (!userExists) {
      throw new Error(\`User '\${recipient}' not found\`);
    }

    // Send the message
    return await this.actor.notifyAlias(recipient, "notification", content);
  }
}

// React hook for easy integration
import { useState, useCallback } from 'react';

export function useClypr(canisterId: string) {
  const [client, setClient] = useState<ClyprClient | null>(null);
  const [loading, setLoading] = useState(false);

  const initialize = useCallback(async () => {
    const clyprClient = new ClyprClient(canisterId);
    await clyprClient.initialize();
    setClient(clyprClient);
  }, [canisterId]);

  const sendMessage = useCallback(async (
    recipient: string,
    content: MessageContent
  ) => {
    if (!client) {
      throw new Error('Client not initialized');
    }
    
    setLoading(true);
    try {
      const result = await client.sendMessage(recipient, content);
      return result;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { initialize, sendMessage, loading, client };
}

// Usage in React component
function NotificationForm() {
  const { initialize, sendMessage, loading } = useClypr('5elod-ciaaa-aaaag-aufgq-cai');
  const [recipient, setRecipient] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await initialize();
      const messageId = await sendMessage(recipient, {
        title,
        body,
        priority: 2,
        contentType: "text/plain",
        metadata: [["source", "react-app"]]
      });
      
      alert(\`Message sent! ID: \${messageId}\`);
    } catch (error) {
      alert(\`Failed to send message: \${error}\`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Recipient alias"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        type="text"
        placeholder="Message title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Message body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}`}
                   </CodeBlock>
                 </div>
              </div>
            </section>

            {/* Message Types */}
            <section id="message-types" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Message Types & Format</h2>
              
              <div className="space-y-8">
                                 <div id="message-structure">
                   <h3 className="text-lg font-semibold text-white mb-4">Message Content Structure</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     All messages follow this structure for consistent delivery.
                   </p>
                   <CodeBlock language="typescript">
{`{
  title: string,              // Required: Message title (max 256 chars)
  body: string,               // Required: Message body (max 10KB)
  priority: number,           // Required: Priority level (1-5)
  contentType: string,        // Required: "text/plain" or "application/json"
  metadata: [string, string][] // Optional: Custom key-value pairs
}`}
                   </CodeBlock>
                 </div>

                                 <div id="priority-levels">
                   <h3 className="text-lg font-semibold text-white mb-4">Priority Levels</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     Use priority levels to help users filter and manage their messages.
                   </p>
                   <div className="grid gap-4 md:grid-cols-2">
                     <div className="bg-white/5 rounded-lg p-4">
                       <h4 className="font-semibold text-white mb-2">Priority 1 - Critical</h4>
                       <p className="text-sm text-zinc-300">Emergency notifications, security alerts</p>
                     </div>
                     <div className="bg-white/5 rounded-lg p-4">
                       <h4 className="font-semibold text-white mb-2">Priority 2 - High</h4>
                       <p className="text-sm text-zinc-300">Important updates, time-sensitive actions</p>
                     </div>
                     <div className="bg-white/5 rounded-lg p-4">
                       <h4 className="font-semibold text-white mb-2">Priority 3 - Normal</h4>
                       <p className="text-sm text-zinc-300">Regular notifications, general updates</p>
                     </div>
                     <div className="bg-white/5 rounded-lg p-4">
                       <h4 className="font-semibold text-white mb-2">Priority 4-5 - Low</h4>
                       <p className="text-sm text-zinc-300">Newsletters, promotional content</p>
                     </div>
                   </div>
                 </div>

                                 <div id="metadata-examples">
                   <h3 className="text-lg font-semibold text-white mb-4">Metadata Examples</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     Use metadata to provide additional context for message processing.
                   </p>
                   <CodeBlock language="json">
{`// DAO voting notification
metadata: [
  ["proposal_id", "123"],
  ["dao_name", "ExampleDAO"],
  ["deadline", "2024-01-15T23:59:59Z"]
]

// Transaction confirmation
metadata: [
  ["tx_hash", "0xabc123..."],
  ["amount", "100 ICP"],
  ["recipient", "alice.ic0.app"]
]

// System alert
metadata: [
  ["alert_type", "security"],
  ["severity", "high"],
  ["action_required", "true"]
]`}
                   </CodeBlock>
                 </div>
              </div>
            </section>

            {/* Integration Guides */}
            <section id="integrations" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Integration Guides</h2>
              
                             <div className="space-y-8">
                 <div id="canister-integration">
                   <h3 className="text-lg font-semibold text-white mb-4">Canister Integration</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     Add Clypr messaging to your existing canister.
                   </p>
                                      <CodeBlock language="motoko">
{`// dfx.json
{
  "canisters": {
    "your-canister": {
      "dependencies": ["clypr"]
    }
  }
}

// In your canister code
import Clypr "canister:clypr";

// Send notification when user performs action
public shared({caller}) func performAction() : async Result.Result<(), Text> {
  // ... your logic ...
  
  // First verify the user exists
  let userExists = await Clypr.verifyAlias("user123");
  if (not userExists) {
    return #err("User not found");
  };
  
  // Send notification
  let _ = await Clypr.notifyAlias("user123", "notification", {
    title = "Action Completed";
    body = "Your action has been processed successfully.";
    priority = 2;
    contentType = "text/plain";
    metadata = [("action_id", "abc123")];
  });
  
  #ok(())
}`}
                   </CodeBlock>
                </div>

                                 <div id="frontend-integration">
                   <h3 className="text-lg font-semibold text-white mb-4">Frontend Integration</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     Add messaging capabilities to your frontend application.
                   </p>
                                      <CodeBlock language="typescript">
{`// hooks/useClyprMessaging.ts
import { useClypr } from './useClypr';

export function useClyprMessaging() {
  const { notifyAlias, verifyAlias } = useClypr();

  const sendNotification = async (recipient: string, content: any) => {
    try {
      // First verify the user exists
      const userExists = await verifyAlias(recipient);
      if (!userExists) {
        return { success: false, error: 'User not found' };
      }

      const result = await notifyAlias(recipient, "notification", content);
      return { success: true, messageId: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return { sendNotification };
}

// Usage in component
function NotificationForm() {
  const { sendNotification } = useClyprMessaging();
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    const result = await sendNotification(recipient, {
      title: "New Message",
      body: message,
      priority: 2,
      contentType: "text/plain"
    });
    
    if (result.success) {
      alert('Message sent!');
    } else {
      alert('Failed to send message: ' + result.error);
    }
  };

  return (
    <form onSubmit={handleSend}>
      {/* form fields */}
    </form>
  );
}`}
                   </CodeBlock>
                </div>
              </div>
            </section>

            {/* Advanced Topics */}
            <section id="advanced" className="mb-16">
              <h2 className="text-2xl font-bold text-white mb-8">Advanced Topics</h2>
              
                             <div className="space-y-8">
                 <div id="advanced-error-handling">
                   <h3 className="text-lg font-semibold text-white mb-4">Error Handling</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     Handle common errors when sending messages.
                   </p>
                                      <CodeBlock language="typescript">
{`// JavaScript error handling
try {
  // First verify the user exists
  const userExists = await clyprActor.verifyAlias(recipient);
  if (!userExists) {
    console.error('User not found or not registered with Clypr');
    return;
  }

  const result = await clyprActor.notifyAlias(recipient, "notification", content);
  console.log('Message sent:', result);
} catch (error) {
  if (error.message.includes('NotFound')) {
    console.error('User not found or not registered with Clypr');
  } else if (error.message.includes('RateLimitExceeded')) {
    console.error('Rate limit exceeded, try again later');
  } else {
    console.error('Failed to send message:', error);
  }
}

// Motoko error handling
let userExists = await Clypr.verifyAlias(recipient);
if (not userExists) {
  // User not found
} else {
  let message = await Clypr.notifyAlias(recipient, "notification", content);
  switch (message) {
    case (#ok(messageId)) {
      // Message sent successfully
    };
    case (#err(#RateLimitExceeded)) {
      // Rate limit exceeded
    };
    case (#err(#Other(error))) {
      // Other error
    };
  };
};`}
                   </CodeBlock>
                </div>

                                 <div id="rate-limiting">
                   <h3 className="text-lg font-semibold text-white mb-4">Rate Limiting</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     Understand and work with Clypr's rate limiting.
                   </p>
                   <div className="bg-white/5 rounded-lg p-6">
                     <ul className="text-sm text-zinc-300 space-y-2">
                       <li>• <strong>Per-user limit:</strong> 100 messages per hour per recipient</li>
                       <li>• <strong>Per-canister limit:</strong> 1000 messages per hour</li>
                       <li>• <strong>Global limit:</strong> 10,000 messages per hour across all senders</li>
                       <li>• <strong>Retry strategy:</strong> Use exponential backoff for rate limit errors</li>
                     </ul>
                   </div>
                 </div>

                                 <div id="best-practices">
                   <h3 className="text-lg font-semibold text-white mb-4">Best Practices</h3>
                   <p className="text-zinc-300 text-sm mb-4">
                     Follow these guidelines for optimal message delivery and user experience.
                   </p>
                   
                   <div className="space-y-6">
                     <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg p-6">
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                           <CheckCircle className="h-5 w-5 text-green-400" />
                         </div>
                         <h4 className="text-lg font-semibold text-white">Recommended Practices</h4>
                       </div>
                       <div className="grid gap-3 md:grid-cols-2">
                         <div className="space-y-2">
                           <h5 className="font-medium text-green-400 text-sm">User Verification</h5>
                           <ul className="text-sm text-zinc-300 space-y-1">
                             <li>• Always use verifyAlias() before sending messages</li>
                             <li>• Handle cases where users don't exist gracefully</li>
                             <li>• Provide clear feedback when verification fails</li>
                           </ul>
                         </div>
                         <div className="space-y-2">
                           <h5 className="font-medium text-green-400 text-sm">Message Content</h5>
                           <ul className="text-sm text-zinc-300 space-y-1">
                             <li>• Use descriptive, actionable titles</li>
                             <li>• Keep body content concise and relevant</li>
                             <li>• Include relevant metadata for context</li>
                           </ul>
                         </div>
                         <div className="space-y-2">
                           <h5 className="font-medium text-green-400 text-sm">Priority Management</h5>
                           <ul className="text-sm text-zinc-300 space-y-1">
                             <li>• Use priority 1 only for critical alerts</li>
                             <li>• Reserve priority 2 for time-sensitive actions</li>
                             <li>• Use priority 3-5 for regular updates</li>
                           </ul>
                         </div>
                         <div className="space-y-2">
                           <h5 className="font-medium text-green-400 text-sm">Error Handling</h5>
                           <ul className="text-sm text-zinc-300 space-y-1">
                             <li>• Implement proper try-catch blocks</li>
                             <li>• Handle rate limit errors with backoff</li>
                             <li>• Log errors for debugging</li>
                           </ul>
                         </div>
                       </div>
                     </div>

                     <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg p-6">
                       <div className="flex items-center gap-3 mb-4">
                         <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
                           <Lock className="h-5 w-5 text-red-400" />
                         </div>
                         <h4 className="text-lg font-semibold text-white">Avoid These Practices</h4>
                       </div>
                       <div className="grid gap-3 md:grid-cols-2">
                         <div className="space-y-2">
                           <h5 className="font-medium text-red-400 text-sm">User Management</h5>
                           <ul className="text-sm text-zinc-300 space-y-1">
                             <li>• Don't send messages without verification</li>
                             <li>• Don't assume all users have Clypr accounts</li>
                             <li>• Don't ignore user existence checks</li>
                           </ul>
                         </div>
                         <div className="space-y-2">
                           <h5 className="font-medium text-red-400 text-sm">Content Guidelines</h5>
                           <ul className="text-sm text-zinc-300 space-y-1">
                             <li>• Don't send spam or promotional content</li>
                             <li>• Don't use misleading titles</li>
                             <li>• Don't exceed content length limits</li>
                           </ul>
                         </div>
                         <div className="space-y-2">
                           <h5 className="font-medium text-red-400 text-sm">Priority Misuse</h5>
                           <ul className="text-sm text-zinc-300 space-y-1">
                             <li>• Don't use priority 1 for non-critical messages</li>
                             <li>• Don't ignore priority guidelines</li>
                             <li>• Don't spam high-priority notifications</li>
                           </ul>
                         </div>
                         <div className="space-y-2">
                           <h5 className="font-medium text-red-400 text-sm">Technical Issues</h5>
                           <ul className="text-sm text-zinc-300 space-y-1">
                             <li>• Don't ignore rate limit errors</li>
                             <li>• Don't send without error handling</li>
                             <li>• Don't use invalid content types</li>
                           </ul>
                         </div>
                       </div>
                     </div>
                   </div>
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
