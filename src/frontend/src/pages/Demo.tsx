import React from 'react';
import { Link } from 'react-router-dom';

const Demo: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-zinc-100">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-md bg-gradient-to-br from-cyan-400 to-fuchsia-500" />
            <span className="text-sm uppercase tracking-[0.18em] text-zinc-300">clypr</span>
          </Link>
          <Link to="/" className="text-sm text-zinc-300 hover:text-white">Back to landing</Link>
        </header>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-2xl font-semibold text-white">Interactive Demo</h1>
          <p className="mt-2 text-zinc-300">This is a placeholder. We’ll wire a simple sender (actor.processMessage) and show receipts here.</p>
          <div className="mt-6 flex gap-3">
            <Link to="/app/dashboard">
              <button className="rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10">Go to App</button>
            </Link>
            <Link to="/">
              <button className="rounded-md bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-4 py-2 text-sm text-[#0A0A0F] hover:opacity-95">Return Home</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Demo;
