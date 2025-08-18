import React from 'react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Skeleton from '../components/UI/Skeleton';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClypr } from '../hooks/useClypr';
import { useAuth } from '../hooks/useAuth';

function isValidAlias(input /** @type {string} */) {
  // Basic: 3-20 chars; lowercase letters, numbers, hyphen; must start with letter
  const re = /^[a-z][a-z0-9-]{2,19}$/;
  return re.test(input);
}

const ClaimAlias = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerUsername, resolveUsername, myUsername, aliasChecked, checkMyAlias } = useClypr();
  const { authReady } = useAuth();

  const [alias, setAlias] = React.useState('');
  const [checking, setChecking] = React.useState(false);
  const [available, setAvailable] = React.useState(null /** @type {null|boolean} */);
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  // preserved redirect (from Layout/Login) or fallback to dashboard
  const redirectTo = (location.state as any)?.from || sessionStorage.getItem('clypr.postLoginRedirect') || '/app/dashboard';

  // Wait until auth and alias status are known before rendering anything
  React.useEffect(() => {
    if (authReady && !aliasChecked) {
      // ensure we check alias once auth is ready
      checkMyAlias();
    }
  }, [authReady, aliasChecked, checkMyAlias]);

  // If alias already exists, redirect back to the target once auth+aliasChecked is confirmed
  React.useEffect(() => {
    if (!authReady) return;
    if (!aliasChecked) return;
    if (myUsername) {
      navigate(redirectTo);
    }
  }, [authReady, aliasChecked, myUsername, navigate, redirectTo]);

  const onChange = (e /** @type {React.ChangeEvent<HTMLInputElement>} */) => {
    const v = e.target.value.toLowerCase().trim();
    setAlias(v);
    setAvailable(null);
    setError('');
  };

  const checkAvailability = async () => {
    if (!isValidAlias(alias)) {
      setError('Use 3–20 chars: start with a letter; letters, numbers, hyphens.');
      setAvailable(null);
      return;
    }
    setChecking(true);
    setError('');
    try {
      const principal = await resolveUsername(alias);
      setAvailable(!principal); // available if no principal
      if (principal) {
        setError('Alias is taken.');
      }
    } catch (e) {
      // Treat unknown as available until register checks
      setAvailable(null);
    } finally {
      setChecking(false);
    }
  };

  const onSubmit = async (e /** @type {React.FormEvent} */) => {
    e.preventDefault();
    setError('');
    if (myUsername) {
      setError('You have already claimed an alias. It is permanent and cannot be changed.');
      return;
    }
    if (!isValidAlias(alias)) {
      setError('Invalid alias format.');
      return;
    }
    setSubmitting(true);
    try {
      // Optional pre-check
      await checkAvailability();
      const ok = await registerUsername(alias);
      if (ok) {
        // Clear stored redirect and go to preserved path
        try { sessionStorage.removeItem('clypr.postLoginRedirect'); } catch (e) {}
        navigate(redirectTo);
      } else {
        setError('Failed to claim alias. Try another or retry.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Only render the form once authReady and aliasChecked are true and the user has no alias.
  // If we don't yet know alias state show a neutral loading skeleton to avoid exposing the form more than once.
  if (!authReady || !aliasChecked) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <div className="w-full max-w-[520px]">
          <Card padding="lg">
            <div className="text-center py-8">
              <Skeleton lines={2} />
              <p className="text-sm text-neutral-500 mt-4">Preparing your account…</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // If alias already set, show a read-only message (claim is one-time)
  if (myUsername) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
        <div className="w-full max-w-[520px]">
          <Card padding="lg">
            <div className="mb-6 text-center">
              <h1 className="font-mono text-2xl font-bold m-0">Your Clypr alias</h1>
              <p className="text-neutral-400 mt-2 mb-0">You have already claimed your one-time alias. It cannot be changed.</p>
            </div>

            <div className="text-center mb-6">
              <div className="text-xl font-mono font-semibold">@{myUsername}</div>
              <p className="text-sm text-neutral-400 mt-2">Share this alias with dApps instead of your principal.</p>
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={() => { navigator.clipboard.writeText(myUsername || ''); }} variant="secondary">Copy</Button>
              <Button onClick={() => navigate(redirectTo)}>Return to app</Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-[520px]">
        <Card padding="lg">
          <div className="mb-6 text-center">
            <h1 className="font-mono text-2xl font-bold m-0">Claim your Clypr alias</h1>
            <p className="text-neutral-400 mt-2 mb-0">
              Your one-time identity. Share this alias with dApps instead of your principal.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-300 mb-2">Alias</label>
              <div className="flex gap-2">
                <input
                  value={alias}
                  onChange={onChange}
                  onBlur={checkAvailability}
                  placeholder="e.g. alice-icp"
                  className="flex-1 h-11 px-3 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-700"
                />
                <Button type="button" variant="secondary" onClick={checkAvailability} disabled={!alias || checking}>
                  {checking ? 'Checking…' : 'Check'}
                </Button>
              </div>
              <p className="text-xs text-neutral-500 mt-2">3–20 chars, lowercase letters, numbers, hyphens. One-time claim.</p>
              {available === true && (
                <p className="text-sm text-emerald-400 mt-1">Available</p>
              )}
              {available === false && (
                <p className="text-sm text-red-400 mt-1">Taken</p>
              )}
              {error && <p className="text-sm text-red-400 mt-1">{error}</p>}
            </div>

            <Button type="submit" fullWidth disabled={submitting || !isValidAlias(alias)}>
              {submitting ? 'Claiming…' : 'Claim alias'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ClaimAlias;
