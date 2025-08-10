import React from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Input from '../components/UI/Input';
import { useClypr } from '../hooks/useClypr';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const [activeTab, setActiveTab] = (React as any).useState('general');
  const { myUsername, registerUsername } = useClypr() as any;
  const { principal } = useAuth() as any;
  const [newUsername, setNewUsername] = (React as any).useState('');
  const [submitting, setSubmitting] = (React as any).useState(false);
  const [error, setError] = (React as any).useState(null);

  const handleRegisterUsername = async () => {
    if (!newUsername) return;
    setSubmitting(true);
    setError(null);
    try {
      const ok = await registerUsername(newUsername);
      if (!ok) setError('Failed to register alias. Try a different one.');
      else setNewUsername('');
    } catch (e) {
      setError('An error occurred during registration.');
    } finally {
      setSubmitting(false);
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
              {myUsername ? (
                <Input id="username" value={myUsername} readOnly />
              ) : (
                <div className="flex gap-2">
                  <Input id="new-username" placeholder="Choose a username" value={newUsername} onChange={(e: any) => setNewUsername(e.target.value)} />
                  <Button onClick={handleRegisterUsername} disabled={submitting || !newUsername}>{submitting ? 'Saving…' : 'Register'}</Button>
                </div>
              )}
              {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
              <p className="mt-1 text-xs text-neutral-400">Share this alias with dApps to receive messages via Clypr.</p>
            </div>

            <div className="mb-4">
              <label htmlFor="principal" className="block mb-2 font-medium">Internet Identity Principal</label>
              <Input id="principal" value={principal?.toText() || ''} readOnly />
              <p className="mt-1 text-xs text-neutral-400">Read-only identifier from Internet Identity.</p>
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
