import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Input from '../components/UI/Input';
import { useClypr } from '../hooks/useClypr';

export default function DefiSwap() {
  const { service } = useClypr();
  const [recipient, setRecipient] = useState('alice');
  const [fromToken, setFromToken] = useState('ICP');
  const [toToken, setToToken] = useState('ETH');
  const [amount, setAmount] = useState('1.0');
  const [slippage, setSlippage] = useState('0.5');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendSwapNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (!service) throw new Error('Service not initialized');

      const title = `Swap executed: ${amount} ${fromToken} → ${toToken}`;
      const body = `Swap of ${amount} ${fromToken} for ${toToken} executed with max slippage ${slippage}%`;
      const metadata: [string, string][] = [
        ['pair', `${fromToken}/${toToken}`],
        ['amount', amount],
        ['slippage', slippage],
        ['source', 'defiSwap-demo']
      ];

      const content = {
        title,
        body,
        priority: 0,
        metadata,
      };

      setResult({ status: 'pending' });

      const receipt = await service.notifyAlias(recipient, 'defi_swap', content);

      setResult({ status: 'sent', receipt });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-zinc-100">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-8 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-neutral-100 text-neutral-900 flex items-center justify-center font-mono font-bold">C</div>
            <span className="text-sm uppercase tracking-[0.18em] text-zinc-300">clypr</span>
          </Link>
          <Link to="/demo" className="text-sm text-zinc-300 hover:text-white">Back to demo</Link>
        </header>

        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <h1 className="text-2xl font-semibold text-white">defiSwap (Demo dApp)</h1>
          <p className="mt-2 text-zinc-300">Simulate a DeFi swap dApp sending a notification to a user alias. Useful for demoing how a DApp calls Clypr to notify users.</p>

          <form onSubmit={sendSwapNotification} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="col-span-1 md:col-span-2 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-1">Recipient alias</label>
                  <Input value={recipient} onChange={(e: any) => setRecipient(e.target.value)} placeholder="alice" />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-1">Amount</label>
                  <Input value={amount} onChange={(e: any) => setAmount(e.target.value)} placeholder="1.0" />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-1">From token</label>
                  <Input value={fromToken} onChange={(e: any) => setFromToken(e.target.value)} placeholder="ICP" />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-1">To token</label>
                  <Input value={toToken} onChange={(e: any) => setToToken(e.target.value)} placeholder="ETH" />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-1">Max slippage (%)</label>
                  <Input value={slippage} onChange={(e: any) => setSlippage(e.target.value)} placeholder="0.5" />
                </div>

                <div className="flex items-end">
                  <Button type="submit" disabled={loading}>{loading ? 'Sending…' : 'Simulate Swap & Notify'}</Button>
                </div>
              </div>
            </Card>

            <Card className="col-span-1 md:col-span-2 p-4">
              <h3 className="text-lg font-medium text-white mb-2">Result</h3>
              {error && <div className="text-red-400 mb-2">{error}</div>}
              {result ? (
                <pre className="bg-neutral-900/30 p-3 rounded text-sm">{JSON.stringify(result, null, 2)}</pre>
              ) : (
                <div className="text-neutral-400">No notifications sent yet. Use the form above to simulate a swap.</div>
              )}
            </Card>

            <Card className="col-span-1 md:col-span-2 p-4">
              <h3 className="text-lg font-medium text-white mb-2">How this simulates a DApp</h3>
              <ul className="list-disc pl-5 text-neutral-400 text-sm">
                <li>The demo calls <code>notifyAlias(recipient, 'defi_swap', content)</code> on the Clypr actor via the frontend service.</li>
                <li>Clypr enqueues the job and the offchain bridge delivers via configured channels (email/telegram/webhook).</li>
                <li>Use the Channels page to ensure a recipient alias has an active channel configured.</li>
              </ul>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
