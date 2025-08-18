import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Check, 
  Mail, 
  MessageSquare, 
  Zap, 
  Shield, 
  Globe, 
  Users, 
  ArrowRight,
  Star,
  Sparkles,
  Bell,
  Lock,
  Settings
} from 'lucide-react';
import { cn } from '../utils/cn';

const Pricing = () => {
  const plans = [
    {
      name: 'Free',
      description: 'Perfect for trying out Clypr and basic privacy protection',
      price: 'Free',
      features: [
        '1 communication channel (Email, Webhook, or Telegram)',
        'Up to 100 messages per month',
        'Basic privacy rules (3 active rules)',
        'Community support',
        'Standard delivery (within 5 minutes)',
        'Basic message history (30 days)'
      ],
      cta: 'Get Started Free',
      popular: false
    },
    {
      name: 'Personal',
      description: 'For individuals who want comprehensive privacy control',
      price: '$9',
      period: 'per month',
      features: [
        '3 communication channels (Email, Webhook, Telegram)',
        'Up to 1,000 messages per month',
        'Advanced privacy rules (10 active rules)',
        'Priority support',
        'Fast delivery (within 2 minutes)',
        'Extended message history (90 days)',
        'Custom rule templates',
        'Message analytics & insights'
      ],
      cta: 'Start Personal Plan',
      popular: true
    },
    {
      name: 'Professional',
      description: 'For power users and small teams',
      price: '$29',
      period: 'per month',
      features: [
        'Unlimited communication channels',
        'Unlimited messages per month',
        'Unlimited privacy rules',
        'Priority support with 24/7 response',
        'Instant delivery (within 30 seconds)',
        'Full message history (1 year)',
        'Advanced analytics & reporting',
        'Custom integrations',
        'Team collaboration features',
        'API access for automation'
      ],
      cta: 'Start Professional Plan',
      popular: false
    }
  ];

  const features = [
    {
      icon: Shield,
      title: 'Privacy-First Design',
      description: 'Your messages are processed on your personal canister. No one can access your data without your permission.'
    },
    {
      icon: Mail,
      title: 'Multiple Channels',
      description: 'Receive messages through email, webhooks, or Telegram. Mix and match based on your preferences.'
    },
    {
      icon: Settings,
      title: 'Smart Rules Engine',
      description: 'Create custom rules to filter, route, and prioritize messages exactly how you want them.'
    },
    {
      icon: Globe,
      title: 'Web3 Native',
      description: 'Built on Internet Computer Protocol for true decentralization and user control.'
    }
  ];

  const faqs = [
    {
      question: 'How does Clypr protect my privacy?',
      answer: 'Clypr runs on your personal canister on the Internet Computer. All message processing happens on-chain, and your contact details are encrypted. Only you control who can send you messages and how they\'re delivered.'
    },
    {
      question: 'What communication channels are supported?',
      answer: 'Currently, Clypr supports Email, Webhook, and Telegram channels. You can use one or multiple channels simultaneously depending on your plan.'
    },
    {
      question: 'How do privacy rules work?',
      answer: 'Privacy rules let you control which messages you receive. You can block specific senders, filter by content, set priority levels, and route messages to different channels based on your preferences.'
    },
    {
      question: 'Can I change my plan later?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing adjustments.'
    },
    {
      question: 'What happens if I exceed my message limit?',
      answer: 'We\'ll notify you when you\'re approaching your limit. You can upgrade your plan or wait until the next billing cycle to continue receiving messages.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. Your data is stored on the Internet Computer with end-to-end encryption. Your personal canister is isolated and only you have access to your messages and settings.'
    }
  ];

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
              <Link to="/docs" className="text-sm text-zinc-300 hover:text-white transition-colors">
                Docs
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

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(800px_500px_at_20%_-10%,rgba(56,189,248,0.18),rgba(10,10,15,0)),radial-gradient(800px_500px_at_90%_0%,rgba(217,70,239,0.18),rgba(10,10,15,0))]" />
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl mb-6">
                Take Control of Your Communications
              </h1>
              <p className="text-xl text-zinc-300 mb-8 max-w-3xl mx-auto">
                Stop spam, prioritize important messages, and receive notifications exactly how you want them. 
                Your privacy, your rules, your channels.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-cyan-400" />
                  <span>Privacy-first</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-fuchsia-400" />
                  <span>Multiple channels</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-green-400" />
                  <span>Smart rules</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid gap-8 lg:grid-cols-3">
              {plans.map((plan, index) => (
                <div
                  key={plan.name}
                  className={cn(
                    "relative rounded-2xl border p-8 transition-all duration-300 hover:scale-105",
                    plan.popular
                      ? "border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 shadow-lg shadow-cyan-500/20"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-sm font-medium text-[#0A0A0F]">
                        <Star className="h-4 w-4" />
                        Most Popular
                      </div>
                    </div>
                  )}

                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                    <p className="text-zinc-400 mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <div className="text-4xl font-bold text-white mb-2">{plan.price}</div>
                      {plan.period && (
                        <div className="text-sm text-zinc-400">{plan.period}</div>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/login">
                    <button
                      className={cn(
                        "w-full py-3 px-6 rounded-lg font-medium transition-all duration-300",
                        plan.popular
                          ? "bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-[#0A0A0F] hover:opacity-90"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                      )}
                    >
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 border-t border-white/5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Why Choose Clypr?</h2>
              <p className="text-xl text-zinc-300 max-w-3xl mx-auto">
                Unlike traditional messaging platforms, Clypr puts you in complete control of your communications
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-8 w-8 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-zinc-400 text-sm">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-t border-white/5">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
              <p className="text-xl text-zinc-300">
                Everything you need to know about Clypr's privacy-first messaging
              </p>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-zinc-300">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 border-t border-white/5">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-500/10 to-fuchsia-500/10 p-12">
              <Sparkles className="h-16 w-16 text-cyan-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Take Control?
              </h2>
              <p className="text-xl text-zinc-300 mb-8 max-w-2xl mx-auto">
                Join thousands of users who have reclaimed control of their digital communications. 
                Start with the free plan and upgrade when you're ready for more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <button className="inline-flex items-center rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-8 py-3 text-base font-medium text-[#0A0A0F] hover:opacity-90 transition-all hover:scale-105 duration-300">
                    Start Free Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </Link>
                <Link to="/docs">
                  <button className="inline-flex items-center rounded-lg border border-white/20 bg-white/5 px-8 py-3 text-base font-medium text-white hover:bg-white/10 transition-all duration-300">
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-neutral-100 text-neutral-900 rounded-md flex items-center justify-center font-mono font-bold">C</div>
              <span className="text-sm uppercase tracking-[0.18em] text-zinc-300">clypr</span>
            </div>
            <p className="text-xs text-zinc-400">© {new Date().getFullYear()} Clypr. Built on Internet Computer Protocol.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Pricing;
