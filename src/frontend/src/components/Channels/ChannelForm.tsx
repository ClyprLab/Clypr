import * as React from 'react';
import { Mail, MessageSquare, Globe, Smartphone, Check, X, Loader2 } from 'lucide-react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Input from '../UI/Input';
import { useClypr } from '../../hooks/useClypr';
import { cn } from '../../utils/cn';

type ChannelType = 'email' | 'telegram' | 'webhook' | 'sms' | 'push' | 'custom';

interface ChannelConfig {
  email?: {
    fromAddress: string;
    provider?: string;
    apiKey?: string;
    smtp?: {
      host: string;
      port: number;
      username: string;
      password: string;
      useTLS: boolean;
    };
  };
  webhook?: {
    url: string;
    method?: string;
    headers?: [string, string][];
    authType?: {
      none?: null;
      basic?: { username: string; password: string };
      bearer?: string;
    };
    secret?: string;
  };
  telegram?: {
    chatId?: string;
  };
  sms?: {
    provider: string;
    apiKey: string;
    fromNumber: string;
    webhookUrl?: string;
  };
  [key: string]: any;
}

interface ChannelFormData {
  name: string;
  description: string;
  channelType: ChannelType;
  config: ChannelConfig;
  isActive: boolean;
}

interface ChannelFormProps {
  initialChannel?: ChannelFormData & { id?: number; createdAt?: Date; updatedAt?: Date };
  onSubmit?: (data: ChannelFormData) => Promise<boolean>;
  onCancel: () => void;
  onSuccess?: () => void;
}

const CHANNEL_TYPES = [
  { id: 'email' as ChannelType, label: 'Email', icon: Mail },
  { id: 'telegram' as ChannelType, label: 'Telegram', icon: MessageSquare },
  { id: 'webhook' as ChannelType, label: 'Webhook', icon: Globe },
  // { id: 'push' as ChannelType, label: 'Push', icon: Smartphone },
];

const ChannelForm = ({ initialChannel, onSubmit, onCancel, onSuccess }: any) => {
   const { service } = useClypr();
   
   // Form state
   const [formData, setFormData] = (React as any).useState({
    name: initialChannel?.name || '',
    description: initialChannel?.description || '',
    channelType: initialChannel?.channelType || 'email',
    isActive: initialChannel?.isActive ?? true,
    config: initialChannel?.config || {},
  });
   
   // UI State
   const [isSubmitting, setIsSubmitting] = (React as any).useState(false);
   const [status, setStatus] = (React as any).useState({ type: 'idle' as any });
   const [placeholderChannelId, setPlaceholderChannelId] = (React as any).useState(initialChannel && !initialChannel.isActive ? initialChannel.id : null as number | null);

  // Derived flags for existing/unverified channels
  const hasEmailConfig = !!(formData?.config && (formData.config as any).email && (formData.config as any).email.fromAddress);
  const channelTypeIsTelegram = (typeof formData.channelType === 'string' && formData.channelType === 'telegram') || (typeof formData.channelType === 'object' && formData.channelType && Object.keys(formData.channelType)[0] === 'telegram');
  const editingUnverified = initialChannel && !initialChannel.isActive && (hasEmailConfig || channelTypeIsTelegram);

  // Allow resending verification for an existing placeholder (don't create a new placeholder)
  const resendEmailVerification = async () => {
    const from = formData.config?.email?.fromAddress || '';
    if (!service?.requestEmailVerification) {
      setStatus({ type: 'error', message: 'Email service not available' });
      return;
    }
    if (!from) {
      setStatus({ type: 'error', message: 'No email configured to resend to' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'loading', message: 'Resending verification...' });
    try {
      const resp = await service.requestEmailVerification(from, false);
      if (!resp) throw new Error('Failed to resend verification');
      setStatus({ type: 'success', message: 'Verification email resent. Check the inbox.' });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Failed to resend verification' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reconnectTelegram = async () => {
    if (!service?.requestTelegramVerification) {
      setStatus({ type: 'error', message: 'Telegram service not available' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'loading', message: 'Preparing Telegram connection...' });
    try {
      const resp = await service.requestTelegramVerification(false);
      if (!resp?.token) throw new Error('Failed to get Telegram token');
      window.open(`https://t.me/Clypr_bot?start=${encodeURIComponent(resp.token)}`, '_blank');
      setStatus({ type: 'success', message: 'Telegram connect link opened. Complete the flow in the Telegram app.' });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Failed to reconnect Telegram' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Refresh the placeholder channel status from the server. If activated, notify parent to close.
  const refreshPlaceholderStatus = async () => {
    const id = placeholderChannelId || initialChannel?.id;
    if (!id) return;
    if (!service?.getChannel) {
      setStatus({ type: 'error', message: 'Service unavailable' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'loading', message: 'Checking channel status...' });
    try {
      const ch = await service.getChannel(Number(id));
      if (!ch) throw new Error('Channel not found');
      if (ch.isActive) {
        setStatus({ type: 'success', message: 'Channel verified and active.' });
        // Notify parent to reload and close
        onSuccess?.(true);
        return;
      }
      // still pending
      setStatus({ type: 'verifying', message: 'Still pending verification. Check your inbox or Telegram.' });
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Failed to refresh channel status' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Note: do not auto-close the overlay on success for verification flows.
  // Parent is informed via onSuccess(shouldClose?: boolean)

  const handleSubmit = async (e: any) => {
     e.preventDefault();
     if (isSubmitting) return;

    setIsSubmitting(true);
    setStatus({ type: 'loading', message: 'Saving channel...' });

    try {
      const { channelType, ...rest } = formData;

      // Ensure webhook payload includes required keys so backend Candid variant validation succeeds
      let config = { ...rest.config };
      if (channelType === 'webhook') {
        config.webhook = {
          ...(config.webhook || {}),
          // default HTTP method
          method: config.webhook?.method || 'POST',
          // canister expects an authType variant; default to none
          authType: config.webhook?.authType ?? { none: null },
          // headers should be an array of [key,value] tuples
          headers: Array.isArray(config.webhook?.headers) ? config.webhook.headers : [],
          // retryCount expected as a nat8 on the backend
          retryCount: typeof config.webhook?.retryCount === 'number' ? config.webhook.retryCount : 0,
        };
      }

      const channelPayload = {
        ...rest,
        config,
        channelType: { [channelType]: null },
      };

      // Handle special channel types
      if (channelType === 'email') {
        if (!service?.requestEmailVerification) throw new Error('Email service not available');
        const resp = await service.requestEmailVerification(formData.config.email?.fromAddress || '', true);
        if (!resp) throw new Error('Failed to initiate email verification');

        // If the service created a placeholder channel, keep it visible and inform parent not to close
        if (resp.channelId) {
          setPlaceholderChannelId(Number(resp.channelId));
          setStatus({ type: 'verifying', message: 'Email verification sent. Pending activation.' });
          onSuccess?.(false);
          return;
        }

        setStatus({ type: 'success', message: 'Email verification sent! Check your inbox to complete setup.' });
        onSuccess?.(true);
        return;
      }

      if (channelType === 'telegram') {
        if (!service?.requestTelegramVerification) throw new Error('Telegram service not available');
        const resp = await service.requestTelegramVerification(true);
        if (!resp?.token) throw new Error('Failed to initiate Telegram verification');

        // Open Telegram bot in new tab
        window.open(`https://t.me/Clypr_bot?start=${encodeURIComponent(resp.token)}`, '_blank');

        // If server created a placeholder channel, keep it visible and inform parent not to close
        if (resp.channelId) {
          setPlaceholderChannelId(Number(resp.channelId));
          setStatus({ type: 'verifying', message: 'Telegram verification started. Pending activation.' });
          onSuccess?.(false);
          return;
        }

        setStatus({ type: 'success', message: 'Telegram verification started! Complete the setup in the Telegram app.' });
        onSuccess?.(true);
        return;
      }

      // For other channel types, use the provided onSubmit
      if (onSubmit) {
        const result = await onSubmit(channelPayload);
        if (result?.error) throw new Error(result.error);
      }

      setStatus({
        type: 'success',
        message: 'Channel saved successfully!'
      });

      onSuccess?.(true);

    } catch (error: any) {
      console.error('Channel save error:', error);
      setStatus({
        type: 'error',
        message: error?.message || 'Failed to save channel'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form field changes
  const handleChange = (field: string, value: any) => {
     setFormData(prev => ({
       ...prev,
       [field]: value
     }));
   };
  
  // Handle config changes
  const handleConfigChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };
  
  // Helper to initiate email verification directly from the form
  const initiateEmailVerification = async () => {
    if (!service?.requestEmailVerification) {
      setStatus({ type: 'error', message: 'Email service not available' });
      return;
    }
    const from = formData.config.email?.fromAddress || '';
    if (!from) {
      setStatus({ type: 'error', message: 'Please provide an email address' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'loading', message: 'Sending verification...' });
    try {
      const resp = await service.requestEmailVerification(from, true);
      if (!resp) throw new Error('Failed to initiate email verification');
      if (resp.channelId) {
        setPlaceholderChannelId(Number(resp.channelId));
        setStatus({ type: 'verifying', message: 'Email verification sent. Pending activation.' });
        onSuccess?.(false);
        return;
      }
      setStatus({ type: 'success', message: 'Email verification sent.' });
      onSuccess?.(true);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Failed to send verification' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to initiate telegram verification
  const initiateTelegramVerification = async () => {
    if (!service?.requestTelegramVerification) {
      setStatus({ type: 'error', message: 'Telegram service not available' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'loading', message: 'Preparing Telegram connection...' });
    try {
      const resp = await service.requestTelegramVerification(true);
      if (!resp?.token) throw new Error('Failed to initiate Telegram verification');
      // Open Telegram bot in new tab
      window.open(`https://t.me/Clypr_bot?start=${encodeURIComponent(resp.token)}`, '_blank');
      if (resp.channelId) {
        setPlaceholderChannelId(Number(resp.channelId));
        setStatus({ type: 'verifying', message: 'Telegram verification started. Pending activation.' });
        onSuccess?.(false);
        return;
      }
      setStatus({ type: 'success', message: 'Telegram verification started.' });
      onSuccess?.(true);
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Failed to start Telegram verification' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render config block for the selected channel type
  const getChannelConfig = () => {
    const { channelType, config } = formData;

    switch (channelType) {
      case 'email':
        return (
          <div className="space-y-4 p-4 bg-neutral-900/20 rounded-md">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Email Address</label>
              <Input aria-label="email-address" value={config.email?.fromAddress || ''} onChange={(e: any) => handleNestedConfigChange('email', 'fromAddress', e.target.value)} placeholder="you@domain.com" disabled={isSubmitting} />
            </div>
            <div>
              <Button type="button" variant="outline" className="w-full" onClick={initiateEmailVerification} disabled={isSubmitting || !config.email?.fromAddress}>{status.type === 'loading' ? 'Sending...' : 'Send Verification'}</Button>
              <div className="text-xs text-neutral-400 mt-2">When you send verification a placeholder channel will be created. Confirm the token to activate.</div>
            </div>
          </div>
        );

      case 'telegram':
        return (
          <div className="space-y-4 p-4 bg-neutral-900/20 rounded-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-white">Connect Telegram</h4>
                <p className="text-sm text-neutral-400">Link your Telegram account to receive notifications</p>
              </div>
            </div>
            <Button type="button" variant="outline" className="w-full" disabled={isSubmitting} onClick={initiateTelegramVerification}>{status.type === 'loading' ? 'Connecting...' : 'Connect Telegram'}</Button>
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4 p-4 bg-neutral-900/20 rounded-md">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Webhook URL</label>
              <Input aria-label="webhook-url" value={config.webhook?.url || ''} onChange={(e: any) => handleNestedConfigChange('webhook', 'url', e.target.value)} placeholder="https://your-host/api/webhook" disabled={isSubmitting} />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Method</label>
              <select
                aria-label="webhook-method"
                className="w-full bg-transparent border-b border-neutral-700 px-0 py-2 text-sm text-neutral-100"
                value={config.webhook?.method || 'POST'}
                onChange={(e: any) => handleNestedConfigChange('webhook', 'method', e.target.value)}
                disabled={isSubmitting}
              >
                <option value="POST">POST</option>
                <option value="GET">GET</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Auth Type</label>
              <select
                aria-label="webhook-auth-type"
                className="w-full bg-transparent border-b border-neutral-700 px-0 py-2 text-sm text-neutral-100"
                value={
                  config.webhook?.authType
                    ? config.webhook.authType.none !== undefined
                      ? 'none'
                      : config.webhook.authType.basic
                      ? 'basic'
                      : config.webhook.authType.bearer
                      ? 'bearer'
                      : 'none'
                    : 'none'
                }
                onChange={(e: any) => {
                  const val = e.target.value;
                  let authType: any = {};
                  if (val === 'none') authType = { none: null };
                  if (val === 'basic') authType = { basic: { username: '', password: '' } };
                  if (val === 'bearer') authType = { bearer: '' };
                  handleNestedConfigChange('webhook', 'authType', authType);
                }}
                disabled={isSubmitting}
              >
                <option value="none">None</option>
                <option value="basic">Basic (username/password)</option>
                <option value="bearer">Bearer Token</option>
              </select>
            </div>

            {config.webhook?.authType?.basic && (
              <div className="space-y-2 mt-2">
                <Input
                  aria-label="webhook-basic-username"
                  value={config.webhook.authType.basic.username || ''}
                  onChange={(e: any) =>
                    handleNestedConfigChange('webhook', 'authType', {
                      basic: {
                        ...config.webhook.authType.basic,
                        username: e.target.value,
                        password: config.webhook.authType.basic.password,
                      },
                    })
                  }
                  placeholder="Username"
                  disabled={isSubmitting}
                />
                <Input
                  aria-label="webhook-basic-password"
                  type="password"
                  value={config.webhook.authType.basic.password || ''}
                  onChange={(e: any) =>
                    handleNestedConfigChange('webhook', 'authType', {
                      basic: {
                        ...config.webhook.authType.basic,
                        username: config.webhook.authType.basic.username,
                        password: e.target.value,
                      },
                    })
                  }
                  placeholder="Password"
                  disabled={isSubmitting}
                />
              </div>
            )}

            {config.webhook?.authType?.bearer !== undefined && (
              <div className="mt-2">
                <Input
                  aria-label="webhook-bearer-token"
                  value={config.webhook.authType.bearer || ''}
                  onChange={(e: any) =>
                    handleNestedConfigChange('webhook', 'authType', {
                      bearer: e.target.value,
                    })
                  }
                  placeholder="Bearer token"
                  disabled={isSubmitting}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Secret (optional)</label>
              <Input aria-label="webhook-secret" value={config.webhook?.secret || ''} onChange={(e: any) => handleNestedConfigChange('webhook', 'secret', e.target.value)} placeholder="Optional secret for verifying requests" disabled={isSubmitting} />
              <div className="text-xs text-neutral-400 mt-2">If provided, the bridge will include this secret in requests (or configure your webhook to expect it). Use this to verify incoming requests on your endpoint.</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Add this function to handle nested config changes
  const handleNestedConfigChange = (channelType: any, field: string, value: any) => {
     setFormData(prev => ({
       ...prev,
       config: {
         ...prev.config,
         [channelType]: {
           ...(prev.config as any)[channelType],
           [field]: value
         }
       }
     }));
   };
  
  // Status message component
  const StatusMessage = () => {
     if (status.type === 'idle') return null;

    const statusIcons = {
      loading: <Loader2 className="h-4 w-4 animate-spin" />,
      success: <Check className="h-4 w-4 text-green-500" />,
      error: <X className="h-4 w-4 text-red-500" />,
    } as any;

    return (
      <div className={cn(
        'p-3 rounded-md text-sm flex items-start gap-2',
        status.type === 'error' ? 'bg-red-900/20 text-red-400' : 
        status.type === 'success' || status.type === 'verifying' ? 'bg-green-900/20 text-green-400' :
        'bg-blue-900/20 text-blue-400'
      )}>
        <div className="mt-0.5">
          {statusIcons[status.type]}
        </div>
        <div className="flex-1">
          {status.message || 
            (status.type === 'success' ? 'Operation completed successfully' : 
             status.type === 'error' ? 'An error occurred' : 'Processing...')}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">
          {initialChannel ? 'Edit Channel' : 'Create Channel'}
        </h1>
        <p className="text-neutral-400">
          Configure how you want to receive notifications
        </p>
      </div>
      
      {/* Guidance for editing an existing unverified/placeholder channel or newly-created placeholder */}
      {(editingUnverified || placeholderChannelId) && (
        <div className="mb-4 p-4 rounded-md bg-yellow-900/10 border border-yellow-800">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-yellow-300 font-medium">
                {formData.channelType === 'email' || hasEmailConfig
                  ? `Verification email sent to ${formData.config?.email?.fromAddress || 'your address'}`
                  : 'Telegram verification initiated'}
                { (placeholderChannelId || initialChannel?.id) ? ` — ID: ${placeholderChannelId || initialChannel?.id}` : '' }
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                {formData.channelType === 'email' || hasEmailConfig
                  ? 'A placeholder channel has been created while you confirm the verification token. After verifying, click Refresh.'
                  : 'Open Telegram and complete the bot flow. After completing, click Refresh.'}
              </div>
            </div>
            <div className="flex items-center gap-2">
              { (formData.channelType === 'email' || hasEmailConfig) && (
                <Button variant="ghost" size="sm" onClick={resendEmailVerification} disabled={isSubmitting}>Resend Email</Button>
              )}
              { channelTypeIsTelegram && (
                <Button variant="ghost" size="sm" onClick={reconnectTelegram} disabled={isSubmitting}>Open Telegram</Button>
              )}
              <Button variant="secondary" size="sm" onClick={refreshPlaceholderStatus} disabled={isSubmitting}>Refresh</Button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <StatusMessage />
        
        <Card className="p-6">
          <div className="space-y-6">
            {/* Channel Name */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Channel Name *</label>
              <Input variant="line" size="md" value={formData.name} onChange={(e: any) => handleChange('name', e.target.value)} placeholder="e.g., Primary Email Gateway" required aria-label="Channel name" disabled={isSubmitting} />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">Description (optional)</label>
              <textarea className="w-full bg-transparent border-b border-neutral-700 px-0 py-2 text-sm text-neutral-100 min-h-[64px]" value={formData.description} onChange={(e: any) => handleChange('description', e.target.value)} placeholder="What's this channel for?" disabled={isSubmitting} />
            </div>

            {/* Channel Type */}
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">Channel Type <span className="text-red-500">*</span></label>
              <div className="grid grid-cols-2 gap-3">
                {CHANNEL_TYPES.map((type) => (
                  <button key={type.id} type="button" onClick={() => handleChange('channelType', type.id)} className={cn('flex items-center gap-2 p-3 rounded-md border transition-colors', formData.channelType === type.id ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-800 hover:border-neutral-700', isSubmitting && 'opacity-50 cursor-not-allowed')} disabled={isSubmitting}>
                    <div className={cn('p-2 rounded-md', formData.channelType === type.id ? 'bg-blue-500/20 text-blue-400' : 'bg-neutral-800 text-neutral-400')}>
                      <type.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Channel-specific configuration */}
            <div className="pt-2">
              {getChannelConfig()}
            </div>

            {/* Status Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={formData.isActive} onChange={(e: any) => handleChange('isActive', e.target.checked)} disabled={isSubmitting} />
                  <div className={cn('block w-10 h-6 rounded-full', formData.isActive ? 'bg-blue-600' : 'bg-neutral-700')} />
                  <div className={cn('absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform', formData.isActive ? 'translate-x-4' : '')} />
                </div>
                <span className="text-sm font-medium">{formData.isActive ? 'Active' : 'Inactive'}</span>
              </label>
              <p className="mt-1 text-xs text-neutral-400">{formData.isActive ? 'This channel is active and will receive notifications.' : 'This channel is inactive and will not receive notifications.'}</p>
            </div>
           </div>
          
          <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
            {placeholderChannelId || status.type === 'verifying' ? (
              <Button type="button" onClick={onCancel} disabled={isSubmitting}>Close</Button>
            ) : (
              <Button type="submit" disabled={isSubmitting || status.type === 'loading'}>
                 {isSubmitting || status.type === 'loading' ? (
                   <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     {formData.channelType === 'telegram' ? 'Connecting...' : 'Saving...'}
                   </>
                 ) : (
                   <>{initialChannel ? 'Save Changes' : 'Create Channel'}</>
                 )}
               </Button>
            )}
          </div>
         </Card>
       </form>
     </div>
   );
 };
 
 export default ChannelForm;
