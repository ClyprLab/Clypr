import * as React from 'react';
import { Mail, MessageSquare, Globe, Smartphone, Check, X, Loader2, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Input from '../UI/Input';
import { useClypr } from '../../hooks/useClypr';
import { cn } from '../../utils/cn';
import { getTelegramConfig, getTelegramBotStartUrl } from '../../utils/config';

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
   // Verification token shown to user for copy/paste flows
   const [verificationToken, setVerificationToken] = (React as any).useState(null);
   const [verificationLink, setVerificationLink] = (React as any).useState(null);
   const [copied, setCopied] = (React as any).useState(false);
   const [copyFeedback, setCopyFeedback] = (React as any).useState(null);
   // Paste-only email verification code — do not display email token/link in ChannelForm
   const [emailVerificationCode, setEmailVerificationCode] = (React as any).useState('');

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
      // Capture token if returned so user can copy/paste
      if (resp.token) setVerificationToken(resp.token);
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
      if (resp.token) setVerificationToken(resp.token);
      // Open bot and present options in the form (don't auto-close)
      const botStartUrl = getTelegramBotStartUrl(resp.token);
      window.open(botStartUrl, '_blank');
      setStatus({ type: 'verifying', message: 'Telegram connect link opened. Complete the flow in the Telegram app.' });
       
      // If backend provided a placeholder channel id, keep it and inform parent not to close
      if (resp.channelId) {
        setPlaceholderChannelId(Number(resp.channelId));
        onSuccess?.(false);
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Failed to reconnect Telegram' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm email verification code pasted by user (do not display email tokens in form)
  const submitEmailVerificationCode = async () => {
    if (!service?.confirmEmailVerification) {
      setStatus({ type: 'error', message: 'Verification service not available' });
      return;
    }
    if (!emailVerificationCode || String(emailVerificationCode).trim() === '') {
      setStatus({ type: 'error', message: 'Please paste the verification code' });
      return;
    }
    setIsSubmitting(true);
    setStatus({ type: 'loading', message: 'Confirming verification...' });
    try {
      const ok = await service.confirmEmailVerification(String(emailVerificationCode).trim());
      if (ok) {
        setStatus({ type: 'success', message: 'Email verified and channel activated.' });
        onSuccess?.(true);
      } else {
        throw new Error('Verification failed');
      }
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Failed to confirm verification code' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initiate email verification helper (used by UI button)
  const initiateEmailVerification = async () => {
    if (!service?.requestEmailVerification) {
      setStatus({ type: 'error', message: 'Email service not available' });
      return;
    }
    const from = formData.config?.email?.fromAddress || '';
    if (!from) {
      setStatus({ type: 'error', message: 'Please provide an email address' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: 'loading', message: 'Sending verification...' });
    try {
      const resp = await service.requestEmailVerification(from, true);
      if (!resp) throw new Error('Failed to initiate email verification');
      if (resp.token) {
        setVerificationToken(resp.token);
        setVerificationLink(`${window.location.origin}/verify-email?token=${encodeURIComponent(resp.token)}`);
      }
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

  // Initiate telegram verification helper (used by UI button)
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
      
      // Store the verification token and channel ID
      if (resp.token) {
        setVerificationToken(resp.token);
      }
      if (resp.channelId) {
        setPlaceholderChannelId(Number(resp.channelId));
      }
      
      // Keep the form open and show verification options
      setStatus({ type: 'verifying', message: 'Telegram verification started! Choose your verification method below.' });
      onSuccess?.(false);
      return;
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', message: err?.message || 'Failed to start Telegram verification' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = async (text: string | null) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setCopyFeedback('Copied');
      setTimeout(() => { setCopied(false); setCopyFeedback(null); }, 2000);
    } catch (e) {
      console.warn('Copy failed', e);
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

        // If placeholder still not active, try scanning all channels for an active one that matches the contact
        try {
          const all = await service.getAllChannels();
          
          // Check for email channels
          const emailAddr = formData.config?.email?.fromAddress;
          if (emailAddr && Array.isArray(all)) {
            const match = all.find((c: any) => {
              try {
                const cfg = (c.config && (c.config as any).email) || (c.config && c.config.email);
                const addr = cfg && (cfg.fromAddress || cfg.from_address || cfg.from);
                return c.isActive && addr && String(addr).toLowerCase() === String(emailAddr).toLowerCase();
              } catch (e) { return false; }
            });
            if (match) {
              // Found an activated channel matching the verified email. Treat as success.
              setStatus({ type: 'success', message: 'Channel verified and active.' });
              // Optionally remove the old placeholder to avoid duplicates
              try {
                if (placeholderChannelId && placeholderChannelId !== match.id && typeof service.deleteChannel === 'function') {
                  await service.deleteChannel(Number(placeholderChannelId));
                }
              } catch (delErr) {
                console.warn('Failed to delete placeholder channel:', delErr);
              }
              onSuccess?.(true);
              return;
            }
          }
          
          // Check for Telegram channels
          if (formData.channelType === 'telegram' && Array.isArray(all)) {
            const match = all.find((c: any) => {
              try {
                // Look for active Telegram channels
                const isTelegram = c.channelType && (
                  (typeof c.channelType === 'string' && c.channelType === 'telegram') ||
                  (typeof c.channelType === 'object' && c.channelType && Object.keys(c.channelType)[0] === 'telegram')
                );
                return c.isActive && isTelegram;
              } catch (e) { return false; }
            });
            if (match) {
              // Found an activated Telegram channel. Treat as success.
              setStatus({ type: 'success', message: 'Telegram channel verified and active!' });
              // Optionally remove the old placeholder to avoid duplicates
              try {
                if (placeholderChannelId && placeholderChannelId !== match.id && typeof service.deleteChannel === 'function') {
                  await service.deleteChannel(Number(placeholderChannelId));
                }
              } catch (delErr) {
                console.warn('Failed to delete placeholder channel:', delErr);
              }
              onSuccess?.(true);
              return;
            }
          }
        } catch (scanErr) {
          console.debug('Failed to scan channels for matching active contact:', scanErr);
        }

        // still pending
        if (formData.channelType === 'telegram') {
          setStatus({ type: 'verifying', message: 'Still pending Telegram verification. Complete the verification in Telegram and click Check Status again.' });
        } else {
          setStatus({ type: 'verifying', message: 'Still pending verification. Check your inbox or Telegram.' });
        }
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
        if (resp.token) {
          setVerificationToken(resp.token);
          setVerificationLink(`${window.location.origin}/verify-email?token=${encodeURIComponent(resp.token)}`);
        }
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

        // Store the verification token and channel ID
        if (resp.token) {
          setVerificationToken(resp.token);
        }
        if (resp.channelId) {
          setPlaceholderChannelId(Number(resp.channelId));
        }

        // Keep the form open and show verification options
        setStatus({ type: 'verifying', message: 'Telegram verification started! Choose your verification method below.' });
        onSuccess?.(false);
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
      verifying: <Loader2 className="h-4 w-4 animate-spin text-blue-400" />,
    } as any;

    const telegramConfig = getTelegramConfig();

    return (
      <div className={cn(
        'p-3 rounded-md text-sm flex items-start gap-2',
        status.type === 'error' ? 'bg-red-900/20 text-red-400' :
        status.type === 'success' ? 'bg-green-900/20 text-green-400' :
        status.type === 'verifying' ? 'bg-blue-900/20 text-blue-400' :
        'bg-blue-900/20 text-blue-400'
      )}>
        <div className="mt-0.5">
          {statusIcons[status.type]}
        </div>
        <div className="flex-1">
          {status.message ||
            (status.type === 'success' ? 'Operation completed successfully' :
             status.type === 'error' ? 'An error occurred' : 
             status.type === 'verifying' ? 'Verification in progress...' : 'Processing...')}
          
          {/* Additional guidance for Telegram verification */}
          {status.type === 'verifying' && formData.channelType === 'telegram' && (
            <div className="mt-2 text-xs">
              <p>1. Complete verification in the Telegram chat with {telegramConfig.botName}</p>
              <p>2. Return here and click "Refresh Status" to check if verification is complete</p>
            </div>
          )}
        </div>
        
        {/* Refresh button for verifying status */}
        {status.type === 'verifying' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={refreshPlaceholderStatus}
            disabled={isSubmitting}
            className="text-xs h-6 px-2"
          >
            Refresh
          </Button>
        )}
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
             {/* Token / Paste area: show token/link UI only for Telegram; show a paste-only input + Confirm for email */}
             {channelTypeIsTelegram && verificationToken && (
               <div className="mt-3 bg-neutral-900/10 p-3 rounded-md">
                 <div className="flex items-center justify-between gap-2">
                   <div className="text-sm text-neutral-200 break-all">Token: <span className="font-mono text-xs ml-2">{verificationToken}</span></div>
                   <div className="flex items-center gap-2">
                     <Button size="sm" variant="ghost" onClick={() => copyToClipboard(verificationToken)}>{copyFeedback || (copied ? 'Copied' : 'Copy')}</Button>
                   </div>
                 </div>
                 <div className="text-xs text-neutral-400 mt-2">Open the Telegram link or copy the token to paste into the bot.</div>
                 <div className="mt-2 text-xs">
                  <a className="text-blue-400 underline break-all" target="_blank" rel="noreferrer" href={verificationLink ?? `/verify-email?token=${encodeURIComponent(verificationToken)}`}>Open verification link in browser</a>
                 </div>
               </div>
             )}

            {(formData.channelType === 'email' || hasEmailConfig) && (editingUnverified || placeholderChannelId) && (
              <div className="mt-3 bg-neutral-900/10 p-3 rounded-md">
                <div className="text-sm text-neutral-200">Confirm Email Verification</div>
                <div className="mt-2 flex gap-2">
                  <input aria-label="email-verification-code" className="flex-1 bg-transparent border-b border-neutral-700 px-0 py-2 text-sm text-neutral-100 font-mono" placeholder="Paste verification code" value={emailVerificationCode} onChange={(e: any) => setEmailVerificationCode(e.target.value)} disabled={isSubmitting} />
                  <Button size="sm" variant="ghost" onClick={submitEmailVerificationCode} disabled={isSubmitting}>Confirm</Button>
                </div>
                <div className="text-xs text-neutral-400 mt-2">After pasting the code received by email, click Confirm to activate the channel.</div>
              </div>
            )}
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
              {(function(){
                const { channelType, config } = formData;
                if (channelType === 'email') {
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
                }
                if (channelType === 'telegram') {
                  const telegramConfig = getTelegramConfig();
                  
                  // If we have a verification token, show the verification options
                  if (verificationToken) {
                    return (
                      <div className="space-y-4 p-4 bg-neutral-900/20 rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">Verify with {telegramConfig.botName}</h4>
                            <p className="text-sm text-neutral-400">Choose how you want to verify your identity</p>
                          </div>
                        </div>
                        
                        {/* Verification Options */}
                        <div className="space-y-3">
                          {/* Option 1: Copy Token */}
                          <div className="p-3 bg-neutral-800/50 rounded-md border border-neutral-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-neutral-300">Option 1: Copy & Paste Token</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(verificationToken)}
                                className="h-6 px-2 text-xs"
                              >
                                {copied ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                            <div className="text-xs text-neutral-400 break-all font-mono bg-neutral-900/50 p-2 rounded">
                              {verificationToken}
                            </div>
                            <p className="text-xs text-neutral-500 mt-2">
                              Copy this token and paste it directly in the Telegram chat with {telegramConfig.botName}
                            </p>
                          </div>
                          
                          {/* Option 2: Magic Link */}
                          <div className="p-3 bg-neutral-800/50 rounded-md border border-neutral-700">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-neutral-300">Option 2: Use Magic Link</span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                const botStartUrl = getTelegramBotStartUrl(verificationToken);
                                window.open(botStartUrl, '_blank');
                              }}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open {telegramConfig.botName} with Token
                            </Button>
                            <p className="text-xs text-neutral-500 mt-2">
                              This will open Telegram and automatically start the verification process
                            </p>
                          </div>
                        </div>
                        
                        {/* Status and Refresh */}
                        <div className="pt-3 border-t border-neutral-700">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-neutral-400">
                              Channel: <span className="font-mono text-xs">{formData.name || 'Telegram'}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={refreshPlaceholderStatus}
                              disabled={isSubmitting}
                              className="text-xs h-8 px-3"
                            >
                              <Loader2 className="mr-1 h-3 w-3" />
                              Check Status
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Initial connection UI
                  return (
                    <div className="space-y-4 p-4 bg-neutral-900/20 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <MessageSquare className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-medium text-white">Connect {telegramConfig.botName}</h4>
                          <p className="text-sm text-neutral-400">{telegramConfig.botDescription}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full" 
                          disabled={isSubmitting} 
                          onClick={initiateTelegramVerification}
                        >
                          {status.type === 'loading' ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Connecting...
                            </>
                          ) : (
                            <>
                              <MessageSquare className="mr-2 h-4 w-4" />
                              Connect {telegramConfig.botName}
                            </>
                          )}
                        </Button>
                        
                        <div className="text-xs text-neutral-400 text-center">
                          This will create a placeholder channel and generate a verification token
                        </div>
                      </div>
                    </div>
                  );
                }
                if (channelType === 'webhook') {
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
                }
                return null;
              })()}
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
