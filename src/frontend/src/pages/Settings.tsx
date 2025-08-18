import React from 'react';
import Button from '../components/UI/Button';
import { Card, GlassCard } from '../components/UI/Card';
import Input from '../components/UI/Input';
import { useClypr } from '../hooks/useClypr';
import { useAuth } from '../hooks/useAuth';
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell, 
  Code, 
  Palette,
  Globe,
  Key,
  Copy,
  CheckCircle,
  AlertTriangle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { cn } from '../utils/cn';

const Settings = () => {
  const [activeTab, setActiveTab] = (React as any).useState('general');
  const { myUsername, registerUsername } = useClypr() as any;
  const { principal } = useAuth() as any;
  const [newUsername, setNewUsername] = (React as any).useState('');
  const [submitting, setSubmitting] = (React as any).useState(false);
  const [error, setError] = (React as any).useState(null);
  const [copied, setCopied] = (React as any).useState(false);

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

  const handleCopyUsername = async () => {
    if (myUsername) {
      await navigator.clipboard.writeText(myUsername);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyPrincipal = async () => {
    if (principal) {
      await navigator.clipboard.writeText(principal.toText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon, description: 'Account and interface settings' },
    { id: 'privacy', label: 'Privacy', icon: Shield, description: 'Data and privacy preferences' },
    { id: 'notifications', label: 'Notifications', icon: Bell, description: 'Alert and notification settings' },
    { id: 'api', label: 'API & Integration', icon: Code, description: 'Developer and API configuration' }
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Settings</h1>
            <p className="text-neutral-400">Configure your Clypr privacy agent preferences</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 text-left rounded-lg transition-all duration-200',
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 text-white border border-cyan-500/30'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{tab.label}</div>
                      <div className="text-xs text-neutral-500">{tab.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Account Information */}
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-400/20 to-cyan-400/10 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Account Information</h2>
                    <p className="text-neutral-400">Manage your Clypr identity and account details</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Clypr Username */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Clypr Identity</label>
                    {myUsername ? (
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <Input
                            value={myUsername}
                            readOnly
                            variant="glass"
                            leftIcon={<User className="h-4 w-4" />}
                          />
                        </div>
                        <Button
                          variant={copied ? 'success' : 'outline'}
                          size="sm"
                          leftIcon={copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          onClick={handleCopyUsername}
                        >
                          {copied ? 'Copied!' : 'Copy'}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Input
                              placeholder="Choose your Clypr username"
                              value={newUsername}
                              onChange={(e: any) => setNewUsername(e.target.value)}
                              variant="floating"
                              label="Username"
                              leftIcon={<User className="h-4 w-4" />}
                            />
                          </div>
                          <Button
                            variant="gradient"
                            size="sm"
                            onClick={handleRegisterUsername}
                            disabled={submitting || !newUsername}
                            loading={submitting}
                          >
                            {submitting ? 'Registering...' : 'Register'}
                          </Button>
                        </div>
                        {error && (
                          <div className="flex items-center gap-2 text-red-400 text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            {error}
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-neutral-400 mt-2">
                      This is your unique identifier for receiving messages via Clypr
                    </p>
                  </div>

                  {/* Internet Identity Principal */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Internet Identity Principal</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <Input
                          value={principal?.toText() || ''}
                          readOnly
                          variant="glass"
                          leftIcon={<Key className="h-4 w-4" />}
                        />
                      </div>
                      <Button
                        variant={copied ? 'success' : 'outline'}
                        size="sm"
                        leftIcon={copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        onClick={handleCopyPrincipal}
                      >
                        {copied ? 'Copied!' : 'Copy'}
                      </Button>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      Your Internet Identity principal for authentication
                    </p>
                  </div>
                </div>
              </Card>

              {/* Interface Settings */}
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-fuchsia-400/20 to-fuchsia-400/10 rounded-lg flex items-center justify-center">
                    <Palette className="h-5 w-5 text-fuchsia-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Interface Settings</h2>
                    <p className="text-neutral-400">Customize your Clypr experience</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Theme Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                    <div>
                      <div className="font-medium text-white">Dark Mode</div>
                      <div className="text-sm text-neutral-400">Use dark theme interface</div>
                    </div>
                    <div className="relative">
                      <input type="checkbox" className="sr-only" defaultChecked />
                      <div className="w-11 h-6 bg-neutral-700 rounded-full relative cursor-pointer">
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 transform translate-x-5" />
                      </div>
                    </div>
                  </div>

                  {/* Compact View */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                    <div>
                      <div className="font-medium text-white">Compact View</div>
                      <div className="text-sm text-neutral-400">Display more content with less spacing</div>
                    </div>
                    <div className="relative">
                      <input type="checkbox" className="sr-only" />
                      <div className="w-11 h-6 bg-neutral-700 rounded-full relative cursor-pointer">
                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200" />
                      </div>
                    </div>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Timezone</label>
                    <Input
                      defaultValue="UTC (Coordinated Universal Time)"
                      variant="glass"
                      leftIcon={<Globe className="h-4 w-4" />}
                    />
                    <p className="text-xs text-neutral-400 mt-2">
                      Timezone for displaying timestamps and scheduling
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-neutral-700/50">
                  <Button variant="outline" size="sm">
                    Reset to Defaults
                  </Button>
                  <Button variant="gradient" size="sm" leftIcon={<Save className="h-4 w-4" />}>
                    Save Changes
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'privacy' && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400/20 to-green-400/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Privacy Settings</h2>
                  <p className="text-neutral-400">Control your data privacy and security preferences</p>
                </div>
              </div>

              <div className="text-center py-12">
                <Shield className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Privacy Controls</h3>
                <p className="text-neutral-400 mb-6">
                  Advanced privacy settings and data controls will be available here
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                  <div className="w-2 h-2 bg-neutral-600 rounded-full" />
                  <span>Coming Soon</span>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400/20 to-orange-400/10 rounded-lg flex items-center justify-center">
                  <Bell className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
                  <p className="text-neutral-400">Configure how you receive alerts and updates</p>
                </div>
              </div>

              <div className="text-center py-12">
                <Bell className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">Notification Preferences</h3>
                <p className="text-neutral-400 mb-6">
                  Customize your notification settings and alert preferences
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                  <div className="w-2 h-2 bg-neutral-600 rounded-full" />
                  <span>Coming Soon</span>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'api' && (
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400/20 to-purple-400/10 rounded-lg flex items-center justify-center">
                  <Code className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">API & Integration</h2>
                  <p className="text-neutral-400">Developer tools and API configuration</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* API Documentation */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Code className="h-5 w-5 text-cyan-400" />
                    <h3 className="font-medium text-white">API Documentation</h3>
                  </div>
                  <p className="text-sm text-neutral-300 mb-4">
                    Access comprehensive API documentation and integration guides for developers
                  </p>
                  <Button variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />}>
                    View Documentation
                  </Button>
                </div>

                {/* Integration Examples */}
                <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Upload className="h-5 w-5 text-fuchsia-400" />
                    <h3 className="font-medium text-white">Integration Examples</h3>
                  </div>
                  <p className="text-sm text-neutral-300 mb-4">
                    Sample code and integration examples for popular platforms
                  </p>
                  <Button variant="ghost" size="sm">
                    Browse Examples
                  </Button>
                </div>

                {/* Data Export */}
                <div className="p-4 rounded-lg bg-neutral-800/50 border border-neutral-700/50">
                  <div className="flex items-center gap-3 mb-3">
                    <Download className="h-5 w-5 text-green-400" />
                    <h3 className="font-medium text-white">Data Export</h3>
                  </div>
                  <p className="text-sm text-neutral-300 mb-4">
                    Export your rules, messages, and configuration data
                  </p>
                  <Button variant="ghost" size="sm">
                    Export Data
                  </Button>
                </div>

                {/* Danger Zone */}
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <Trash2 className="h-5 w-5 text-red-400" />
                    <h3 className="font-medium text-white">Danger Zone</h3>
                  </div>
                  <p className="text-sm text-neutral-300 mb-4">
                    Irreversible actions that will permanently delete your data
                  </p>
                  <Button variant="danger" size="sm">
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
