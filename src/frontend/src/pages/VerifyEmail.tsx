import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClypr } from '../hooks/useClypr';

// Enhanced /verify-email page: supports auto-run via ?token= and manual paste fallback
export default function VerifyEmail() {
  const { service } = useClypr();
  const navigate = useNavigate();
  const [status, setStatus] = (React as any).useState('idle');
  const [message, setMessage] = (React as any).useState(null);
  const [manualToken, setManualToken] = (React as any).useState('');
  const [copied, setCopied] = (React as any).useState(false);

  const doVerify = async (token: string) => {
    if (!token) {
      setMessage('No token provided');
      setStatus('error');
      return;
    }

    setMessage(null);
    setStatus('verifying');
    try {
      if (!service) {
        setMessage('Service unavailable. Please sign in and try again.');
        setStatus('error');
        return;
      }

      const ok = await service.confirmEmailVerification(token, 'Email Channel', '');
      if (ok) {
        setStatus('success');
        setMessage('Email verified successfully. Redirecting to Channels...');
        setTimeout(() => navigate('/app/channels'), 1200);
      } else {
        setStatus('error');
        setMessage('Verification failed. The token may be invalid or expired.');
      }
    } catch (e: any) {
      setStatus('error');
      setMessage(String(e?.message || e));
    }
  };

  (React as any).useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('idle');
      return;
    }
    // Auto-run verification for link flow
    doVerify(token);
  }, [service, navigate]);

  const copyToken = async (t: string) => {
    try {
      await navigator.clipboard.writeText(t);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  return (
    <div className="verify-mail max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-2">Verify Email</h2>
      <p className="text-sm text-neutral-400 mb-4">Paste a verification token here if you received one from your email or Telegram bot, or open the verification link you received.</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-300 mb-1">Verification token</label>
          <input className="w-full bg-neutral-900/10 p-2 rounded-md" value={manualToken} onChange={(e) => setManualToken((e as any).target.value)} placeholder="Paste token here" />
        </div>

        <div className="flex gap-2">
          <button type="button" className="btn btn-primary" onClick={() => doVerify(manualToken)} disabled={!manualToken || status === 'verifying'}>{status === 'verifying' ? 'Verifying...' : 'Verify'}</button>
          <button type="button" className="btn" onClick={() => { setManualToken(''); setMessage(null); setStatus('idle'); }}>Clear</button>
          {manualToken && (
            <button type="button" className="btn" onClick={() => copyToken(manualToken)}>{copied ? 'Copied' : 'Copy'}</button>
          )}
        </div>

        <div>
          <div className="mt-4">
            <div className="text-sm">Status: <strong>{status}</strong></div>
            {message && <div className="mt-2 text-sm text-neutral-300">{message}</div>}
          </div>

          {status === 'error' && (
            <div className="mt-3 text-sm text-neutral-400">If this fails, request a new verification token from Channels settings and try again. You can also paste the token directly into Telegram if you prefer.</div>
          )}
        </div>
      </div>
    </div>
  );
}
