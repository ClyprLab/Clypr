import React from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Input from '../components/UI/Input';
import { useClypr } from '../hooks/useClypr';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const [activeTab, setActiveTab] = (React as any).useState('general');
  const { actor } = useClypr() as any;
  const { principal } = useAuth() as any;
  const [username, setUsername] = (React as any).useState('');
  const [newUsername, setNewUsername] = (React as any).useState('');
  const [loading, setLoading] = (React as any).useState(true);
  const [error, setError] = (React as any).useState(null);

  (React as any).useEffect(() => {
    const fetchUsername = async () => {
      if (actor) {
        try {
          const result = await actor.getMyUsername();
          if ('ok' in result) {
            setUsername(result.ok);
          } else if ('err' in result && 'NotFound' in result.err) {
            setUsername('');
          } else {
            setError('Failed to fetch username.');
          }
        } catch (e) {
          setError('An error occurred while fetching your username.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUsername();
  }, [actor]);

  const handleRegisterUsername = async () => {
    if (actor && newUsername) {
      try {
        const result = await actor.registerUsername(newUsername);
        if ('ok' in result) {
          setUsername(newUsername);
          setNewUsername('');
          setError(null);
        } else if ('err' in result) {
          const errKey = Object.keys(result.err)[0];
          const errValue = (result.err as any)[errKey];
          setError(`${errKey}: ${errValue || 'An unknown error occurred.'}`);
        }
      } catch (e) {
        setError('An error occurred during registration.');
      }
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-6">
        <Text as="h1">Settings</Text>
      </div>

      <div className="flex border-b border-neutral-800 mb-6">
        {['general','privacy','security','notifications','api'].map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-3 -mb-px border-b-2 font-mono ${activeTab === key ? 'border-neutral-100 text-neutral-100' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'general' && (
        <Card className="p-4 md:p-6">
          <div className="mb-8">
            <h3 className="mb-4">Account Information</h3>

            <div className="mb-4">
              <label htmlFor="username" className="block mb-2 font-medium">Clypr Username</label>
              {loading ? (
                <p>Loading username...</p>
              ) : username ? (
                <Input id="username" value={username} readOnly />
              ) : (
                <div>
                  <Input id="new-username" placeholder="Choose a username" value={newUsername} onChange={(e: any) => setNewUsername(e.target.value)} />
                  <Button onClick={handleRegisterUsername} style={{ marginTop: 8 }}>Register Username</Button>
                </div>
              )}
              {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
              <p className="mt-1 text-xs text-neutral-400">Your unique Clypr username. This can be used by dApps to send you messages.</p>
            </div>

            <div className="mb-4">
              <label htmlFor="principal" className="block mb-2 font-medium">Internet Identity Principal</label>
              <Input id="principal" value={principal?.toText() || 'Loading...'} readOnly />
              <p className="mt-1 text-xs text-neutral-400">Your unique Internet Identity principal (read-only)</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4">Interface Settings</h3>

            <div className="mb-4 flex items-center justify-between">
              <div>
                <label className="block font-medium">Dark Mode</label>
                <p className="text-xs text-neutral-400">Switch between light and dark interface themes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" aria-label="Toggle dark mode" className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:bg-neutral-100 relative">
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5" />
                </div>
              </label>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <div>
                <label className="block font-medium">Compact View</label>
                <p className="text-xs text-neutral-400">Display more content with less spacing</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" aria-label="Toggle compact view" className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:bg-neutral-100 relative">
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all peer-checked:translate-x-5" />
                </div>
              </label>
            </div>

            <div className="mb-4">
              <label htmlFor="timezone" className="block mb-2 font-medium">Timezone</label>
              <Input id="timezone" defaultValue="UTC (Coordinated Universal Time)" />
            </div>

            <div className="border-t border-neutral-800 pt-4 mt-6 flex justify-end gap-2">
              <Button variant="secondary">Reset to Defaults</Button>
              <Button>Save Changes</Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'privacy' && (
        <Card className="p-4 md:p-6">
          <h3 className="mb-4">Privacy Settings</h3>
          <Text>Privacy settings content will go here</Text>
        </Card>
      )}

      {activeTab === 'security' && (
        <Card className="p-4 md:p-6">
          <h3 className="mb-4">Security Settings</h3>
          <Text>Security settings content will go here</Text>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card className="p-4 md:p-6">
          <h3 className="mb-4">Notification Settings</h3>
          <Text>Notification settings content will go here</Text>
        </Card>
      )}

      {activeTab === 'api' && (
        <Card className="p-4 md:p-6">
          <h3 className="mb-4">API Configuration</h3>
          <Text>API settings content will go here</Text>
        </Card>
      )}
    </div>
  );
};

export default Settings;
