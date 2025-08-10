import React from 'react';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';
import { useClypr } from '../hooks/useClypr';

function isValidAlias(input /** @type {string} */) {
  // Basic: 3-20 chars; lowercase letters, numbers, hyphen; must start with letter
  const re = /^[a-z][a-z0-9-]{2,19}$/;
  return re.test(input);
}

const ClaimAlias = () => {
  const navigate = useNavigate();
  const { registerUsername, resolveUsername, myUsername } = useClypr();
  const [alias, setAlias] = React.useState('');
  const [checking, setChecking] = React.useState(false);
  const [available, setAvailable] = React.useState(null /** @type {null|boolean} */);
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (myUsername) {
      navigate('/app/dashboard');
    }
  }, [myUsername, navigate]);

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
        navigate('/app/dashboard');
      } else {
        setError('Failed to claim alias. Try another or retry.');
      }
    } finally {
      setSubmitting(false);
    }
  };

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
