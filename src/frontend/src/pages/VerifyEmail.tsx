import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClypr } from '../hooks/useClypr';

// Lightweight /verify-email page: reads ?token=... and calls canister to confirm verification
export default function VerifyEmail() {
  const { service } = useClypr();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('No verification token found in the URL.');
      return;
    }

    setStatus('verifying');
    (async () => {
      try {
        if (!service) {
          setMessage('Service unavailable. Please sign in and try again.');
          setStatus('error');
          return;
        }

        const ok = await service.confirmEmailVerification(token);
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
    })();
  }, [service, navigate]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Verify Email</h2>
      <p>Status: {status}</p>
      {message && <p>{message}</p>}
      {status === 'error' && (
        <p>
          If this fails, try requesting a new verification from your Channels settings, then check the bridge logs or the Ethereal preview URL (if using dev SMTP).
        </p>
      )}
    </div>
  );
}
