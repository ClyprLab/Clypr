import React from 'react';
import type { FormEvent, FC, ReactNode } from 'react';
import {
  Mail,
  MessageSquare,
  Globe,
  Smartphone,
  Check,
  X,
  Loader2,
  ExternalLink,
  Copy,
  CheckCircle,
} from 'lucide-react';
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
    authType?: { none?: null; basic?: { username: string; password: string }; bearer?: string };
    secret?: string;
    retryCount?: number;
  };
  telegram?: { chatId?: string };
  sms?: { provider?: string; apiKey?: string; fromNumber?: string; webhookUrl?: string };
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
  onSubmit?: (data: any) => Promise<any>;
  onCancel: () => void;
  onSuccess?: (shouldClose?: boolean) => void;
}

const CHANNEL_TYPES = [
  { id: 'email' as ChannelType, label: 'Email', icon: Mail },
  { id: 'telegram' as ChannelType, label: 'Telegram', icon: MessageSquare },
  { id: 'webhook' as ChannelType, label: 'Webhook', icon: Globe },
  // add others if needed
];

const POLL_INTERVAL_MS = 4000;

const ChannelForm: React.FC<ChannelFormProps> = ({ initialChannel, onSubmit, onCancel, onSuccess }) => {
  const { service } = useClypr();

  // ---------- Form state (single source of truth for inputs) ----------
  const [formData, setFormData] = React.useState<ChannelFormData>({
    name: initialChannel?.name || '',
    description: initialChannel?.description || '',
    channelType: (initialChannel?.channelType as ChannelType) || 'email',
    isActive: initialChannel?.isActive ?? true,
    config: initialChannel?.config || {},
  });

  // ---------- Saving (submit) state ----------
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  // ---------- Verification state (separate from saving) ----------
  // We keep one verification object to represent the current verification flow.
  const [verification, setVerification] = React.useState<{
    // idle | initiated | pending_confirmation | confirmed | failed
    step: 'idle' | 'initiated' | 'pending_confirmation' | 'confirmed' | 'failed';
    message?: string | null;
    channelId?: number | null; // placeholder channel ID if backend created one
    token?: string | null;
    link?: string | null;
    lastCheckedAt?: number | null;
  }>({
    step: initialChannel && !initialChannel.isActive ? 'initiated' : 'idle',
    message: null,
    channelId: initialChannel && !initialChannel.isActive ? (initialChannel.id ?? null) : null,
    token: null,
    link: null,
    lastCheckedAt: null,
  });

  // copy feedbacks separated
  const [copiedToken, setCopiedToken] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedBot, setCopiedBot] = React.useState(false);

  // paste-only email verification field
  const [emailVerificationCode, setEmailVerificationCode] = React.useState('');
  // countdown for verification expiration (seconds)
  const [timeRemainingSecs, setTimeRemainingSecs] = React.useState<number | null>(null);

  // keep a ref for interval handle to allow cleanup
  const pollRef = React.useRef<number | null>(null);

  // Keep a ref to latest verification state so cleanup on unmount and async callbacks use latest
  const verificationRef = React.useRef(verification);
  React.useEffect(() => {
    verificationRef.current = verification;
  }, [verification]);

  // Countdown timer effect: updates every second while verification pending and expiresAt present
  React.useEffect(() => {
    if (verification.step !== 'pending_confirmation' || !verification.expiresAt) {
      setTimeRemainingSecs(null);
      return;
    }

    const update = () => {
      const secs = Math.max(0, Math.ceil((Number(verification.expiresAt) - Date.now()) / 1000));
      setTimeRemainingSecs(secs);
      if (secs <= 0) {
        // Trigger timeout handling
        (async () => {
          clearPoll();
          try {
            if (verificationRef.current?.channelId && typeof service?.deleteChannel === 'function') {
              await service.deleteChannel(Number(verificationRef.current.channelId));
            }
          } catch (e) { /* ignore */ }
          const msg = 'Verification timed out after 2 minutes. Placeholder removed.';
          setSaveError(msg);
          setVerification(prev => ({ ...prev, step: 'failed', message: msg }));
        })();
      }
    };

    update();
    const iv = window.setInterval(update, 1000);
    return () => window.clearInterval(iv);
  }, [verification.step, verification.expiresAt]);

  // derived flags
  const hasEmailConfig = !!(formData?.config && (formData.config as any).email && (formData.config as any).email.fromAddress);
  const channelTypeIsTelegram =
    formData.channelType === 'telegram' ||
    (typeof formData.channelType === 'object' && formData.channelType && Object.keys(formData.channelType)[0] === 'telegram');

  // Keep telegram config handy
  const telegramConf = getTelegramConfig();

  // ---------- Helpers: update form state ----------
  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Validate webhook config completeness
  const validateWebhookConfig = (config: ChannelConfig) => {
    if (!config.webhook) return false;
    
    // Required fields
    if (!config.webhook.url || !config.webhook.method) return false;
    
    // Must have authType
    if (!config.webhook.authType) return false;
    
    // If using basic auth, must have username and password
    if ('basic' in config.webhook.authType && (!config.webhook.authType.basic.username || !config.webhook.authType.basic.password)) {
      return false;
    }
    
    // If using bearer, must have token
    if ('bearer' in config.webhook.authType && !config.webhook.authType.bearer) {
      return false;
    }
    
    return true;
  };

  const handleNestedConfigChange = (section: string, key: string, value: any) => {
    setFormData(prev => {
      const newConfig = {
        ...(prev.config || {}),
        [section]: {
          ...((prev.config || {})[section] || {}),
          [key]: value
        }
      };
      
      // Set defaults for webhook
      if (section === 'webhook') {
        const existingWebhook = newConfig.webhook || {};
        newConfig.webhook = {
          method: 'POST', // Ensure method always has a default
          authType: existingWebhook.authType || { none: null }, // Ensure authType is always set
          headers: existingWebhook.headers || [], // Ensure headers are always present
          retryCount: existingWebhook.retryCount || 0, // Ensure retryCount is always present
          ...existingWebhook
        };
      }

      return {
        ...prev,
        config: newConfig
      };
    });
  };

  // ---------- Polling logic ----------
  const clearPoll = () => {
    if (pollRef.current) {
      window.clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  const startPolling = React.useCallback((channelId?: number | null) => {
    clearPoll();
    // immediate check then interval
    (async () => {
      await checkVerificationStatus(channelId);
    })();

    pollRef.current = window.setInterval(async () => {
      await checkVerificationStatus(channelId);
    }, POLL_INTERVAL_MS);
  }, []); // channelId passed explicitly

  React.useEffect(() => {
    // start automatic polling if verification waiting
    if (verification.step === 'pending_confirmation') {
      startPolling(verification.channelId ?? null);
    } else {
      clearPoll();
    }

    return () => clearPoll();
  }, [verification.step, verification.channelId, startPolling]);

  // ---------- Core verification check (uses service APIs) ----------
  // This function should determine whether the placeholder channel (or a matching channel)
  // has become active. It updates `verification` accordingly.
  const checkVerificationStatus = async (expectedChannelId?: number | null) => {
    // Defensive
    if (!service) return;

    setVerification(prev => ({ ...prev, lastCheckedAt: Date.now() }));

    try {
      // If a channelId is known, check that exact channel first.
      if (expectedChannelId && typeof service.getChannel === 'function') {
        const ch = await service.getChannel(Number(expectedChannelId));
        if (ch && ch.isActive) {
          // success
          clearPoll();
          setVerification(prev => ({ ...prev, step: 'confirmed', message: 'Channel verified and active.' }));
          // notify parent to close
          onSuccess?.(true);
          return true;
        }
      }

      // As fallback, scan all channels for a matching active one (email address or telegram)
      if (typeof service.getAllChannels === 'function') {
        const all = await service.getAllChannels();

        // Email matching
        if (hasEmailConfig) {
          const emailAddr = (formData.config as any)?.email?.fromAddress;
          if (emailAddr && Array.isArray(all)) {
            const match = all.find((c: any) => {
              try {
                const cfg = (c.config && (c.config as any).email) || (c.config && c.config.email);
                const addr = cfg && (cfg.fromAddress || cfg.from_address || cfg.from);
                return c.isActive && addr && String(addr).toLowerCase() === String(emailAddr).toLowerCase();
              } catch (e) {
                return false;
              }
            });
            if (match) {
              clearPoll();
              setVerification(prev => ({ ...prev, step: 'confirmed', message: 'Email verified and active.' }));
              onSuccess?.(true);
              // attempt to clean placeholder
              if (verification.channelId && verification.channelId !== match.id && typeof service.deleteChannel === 'function') {
                try { await service.deleteChannel(Number(verification.channelId)); } catch (e) { /* ignore */ }
              }
              return true;
            }
          }
        }

        // Telegram matching
        if (formData.channelType === 'telegram' && Array.isArray(all)) {
          const match = all.find((c: any) => {
            try {
              const isTelegram = c.channelType && (
                (typeof c.channelType === 'string' && c.channelType === 'telegram') ||
                (typeof c.channelType === 'object' && c.channelType && Object.keys(c.channelType)[0] === 'telegram')
              );
              return c.isActive && isTelegram;
            } catch (e) { return false; }
          });
          if (match) {
            clearPoll();
            setVerification(prev => ({ ...prev, step: 'confirmed', message: 'Telegram channel verified and active.' }));
            onSuccess?.(true);
            if (verification.channelId && verification.channelId !== match.id && typeof service.deleteChannel === 'function') {
              try { await service.deleteChannel(Number(verification.channelId)); } catch (e) { /* ignore */ }
            }
            return true;
          }
        }
      }

      // If we reach here, still not active
      setVerification(prev => ({ ...prev, step: 'pending_confirmation', message: prev.message || 'Still pending verification.' }));
      return false;
    } catch (err: any) {
      console.error('checkVerificationStatus error:', err);
      setVerification(prev => ({ ...prev, step: 'failed', message: err?.message || 'Failed to check verification status.' }));
      return false;
    }
  };

  // ---------- Verification action helpers ----------
  // Request email verification (create placeholder channel if backend does)
  const initiateEmailVerification = async () => {
    setSaveError(null);
    if (!service?.requestEmailVerification) {
      setVerification({ step: 'failed', message: 'Email service not available', channelId: null, token: null, link: null });
      return;
    }
    const from = (formData.config as any)?.email?.fromAddress || '';
    if (!from) {
      setVerification({ step: 'failed', message: 'Please provide an email address', channelId: null, token: null, link: null });
      return;
    }

    try {
  setVerification(prev => ({ ...prev, step: 'pending_confirmation', message: 'Sending verification...', token: null, link: null }));
  // Do not create a placeholder channel on the backend; just request token
  const resp = await service.requestEmailVerification(from, false);
      if (!resp) throw new Error('Failed to initiate email verification');
      // backend may provide token, channelId
      setVerification({
        step: 'pending_confirmation',
        message: 'Verification sent. Waiting for confirmation.',
        token: resp.token ?? null,
        link: resp.link ?? (resp.token ? `${window.location.origin}/verify-email?token=${encodeURIComponent(resp.token)}` : null),
        channelId: resp.channelId ? Number(resp.channelId) : (resp.channel_id ? Number(resp.channel_id) : null),
        expiresAt: resp.expiresAt ? (typeof resp.expiresAt === 'bigint' ? Number(resp.expiresAt) : Number(resp.expiresAt)) : null,
        lastCheckedAt: null
      });

      // start polling for the placeholder channel (backend will activate it when verified)
      startPolling(resp.channelId ? Number(resp.channelId) : null);
      // Do NOT attempt to update the placeholder channel immediately here. Some backends
      // validate config strictly and may reject partial updates (causing InvalidConfig).
      // Also avoid calling onSuccess here to prevent the parent from closing the overlay.
    } catch (err: any) {
      console.error('initiateEmailVerification error:', err);
      const msg = err?.message || 'Failed to send verification';
      setSaveError(msg);
      setVerification({ step: 'failed', message: msg, channelId: null, token: null, link: null });
    }
  };

  // Resend verification for email (re-requests token but keeps same placeholder)
  const resendEmailVerification = async () => {
    const from = (formData.config as any)?.email?.fromAddress || '';
    if (!service?.requestEmailVerification) {
      setVerification(prev => ({ ...prev, step: 'failed', message: 'Email service not available' }));
      return;
    }
    if (!from) {
      setVerification(prev => ({ ...prev, step: 'failed', message: 'No email configured to resend to' }));
      return;
    }

    try {
      setVerification(prev => ({ ...prev, step: 'pending_confirmation', message: 'Resending verification...' }));
      const resp = await service.requestEmailVerification(from, false);
      if (!resp) throw new Error('Failed to resend verification');
      if (resp.token) {
        setVerification(prev => ({ ...prev, token: resp.token, link: resp.link ?? `${window.location.origin}/verify-email?token=${encodeURIComponent(resp.token)}`, expiresAt: resp.expiresAt ? (typeof resp.expiresAt === 'bigint' ? Number(resp.expiresAt) : Number(resp.expiresAt)) : prev.expiresAt }));
      }
      setVerification(prev => ({ ...prev, step: 'pending_confirmation', message: 'Verification resent. Check your inbox.' }));
      // keep polling
      startPolling(verification.channelId ?? null);
    } catch (err: any) {
      console.error(err);
      setVerification(prev => ({ ...prev, step: 'failed', message: err?.message || 'Failed to resend verification' }));
    }
  };

  // Confirm email code pasted by user
  const submitEmailVerificationCode = async () => {
    if (!service?.confirmEmailVerification) {
      setVerification(prev => ({ ...prev, step: 'failed', message: 'Verification service not available' }));
      return;
    }
    if (!emailVerificationCode || String(emailVerificationCode).trim() === '') {
      setVerification(prev => ({ ...prev, step: 'failed', message: 'Please paste the verification code' }));
      return;
    }
    try {
      setVerification(prev => ({ ...prev, step: 'pending_confirmation', message: 'Confirming verification...' }));
      const ok = await service.confirmEmailVerification(
        String(emailVerificationCode).trim(),
        formData.name,
        formData.description,
      );
      if (ok) {
        // backend confirmed — we still double-check by polling to get final channel data
        setVerification(prev => ({ ...prev, step: 'confirmed', message: 'Email verified and channel activated.' }));
        clearPoll();
        onSuccess?.(true);
      } else {
        throw new Error('Verification failed');
      }
    } catch (err: any) {
      console.error('Email verification error:', err);
      const errorMessage = err?.message?.includes('not found') ? 'Invalid verification code. Please check and try again.' :
                          err?.message?.includes('expired') ? 'Verification code has expired. Please request a new one.' :
                          err?.message || 'Failed to verify email. Please try again.';
      setVerification(prev => ({ ...prev, step: 'failed', message: errorMessage }));
    }
  };

  // Initiate telegram verification (creates placeholder & token)
  const initiateTelegramVerification = async () => {
    if (!service?.requestTelegramVerification) {
      setVerification(prev => ({ ...prev, step: 'failed', message: 'Telegram service not available' }));
      return;
    }

    try {
  setVerification(prev => ({ ...prev, step: 'pending_confirmation', message: 'Preparing Telegram connection...' }));
  // Ask backend NOT to create a placeholder channel; we will only proceed if backend returns a channelId
  const resp = await service.requestTelegramVerification(false);
      if (!resp?.token) throw new Error('Failed to initiate Telegram verification');

      const token = resp.token;
      const link = getTelegramBotStartUrl(token);
      const channelId = resp.channelId ? Number(resp.channelId) : (resp.channel_id ? Number(resp.channel_id) : null);

      // If backend did not provide an expiresAt, set a 2 minute local timeout to avoid unlimited polling
      const localExpires = resp.expiresAt ? (typeof resp.expiresAt === 'bigint' ? Number(resp.expiresAt) : Number(resp.expiresAt)) : (Date.now() + 2 * 60 * 1000);
      setVerification({
        step: 'pending_confirmation',
        message: 'Telegram verification started. Complete the flow in Telegram.',
        token,
        link,
        channelId,
        expiresAt: localExpires,
        lastCheckedAt: null,
      });

      // open bot but do not auto-close overlay
      window.open(link, '_blank');

      // start polling for activation
      startPolling(channelId ?? null);
      // Do NOT call onSuccess here. Let the component remain open until confirmation.
    } catch (err: any) {
      console.error('Telegram verification error:', err);
      const errorMessage = err?.message?.includes('not found') ? 'Verification token not found. Please try again.' :
                          err?.message?.includes('expired') ? 'Verification token has expired. Please start over.' :
                          err?.message || 'Failed to start Telegram verification. Please try again.';
      setSaveError(errorMessage);
      setVerification(prev => ({ ...prev, step: 'failed', message: errorMessage }));
    }
  };

  // Reconnect (open bot again) for existing token
  const reconnectTelegram = async () => {
    if (!service?.requestTelegramVerification) {
      setVerification(prev => ({ ...prev, step: 'failed', message: 'Telegram service not available' }));
      return;
    }
    try {
      setVerification(prev => ({ ...prev, step: 'pending_confirmation', message: 'Preparing Telegram reconnection...' }));
      const resp = await service.requestTelegramVerification(false);
      if (!resp?.token) throw new Error('Failed to get Telegram token');
      const token = resp.token;
      const link = getTelegramBotStartUrl(token);
      setVerification(prev => ({ ...prev, token, link, message: 'Reconnect link opened. Complete in Telegram.' }));
      window.open(link, '_blank');
      if (resp.channelId) {
        setVerification(prev => ({ ...prev, channelId: Number(resp.channelId) }));
      }
      startPolling(resp.channelId ?? verification.channelId ?? null);
      // Intentionally do not call onSuccess here so parent doesn't close the overlay.
    } catch (err: any) {
      console.error(err);
      setVerification(prev => ({ ...prev, step: 'failed', message: err?.message || 'Failed to reconnect Telegram' }));
    }
  };

  // Manual refresh
  const manualRefreshVerification = async () => {
    setVerification(prev => ({ ...prev, lastCheckedAt: Date.now(), message: 'Checking status...' }));
    await checkVerificationStatus(verification.channelId ?? null);
  };

  // ---------- Form submission ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setSaveError(null);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Validate webhook config if that's the channel type
      if (formData.channelType === 'webhook' && !validateWebhookConfig(formData.config)) {
        throw new Error('Please complete all required webhook fields (URL and method required, credentials if using authentication)');
      }

      // Special handling: for email or telegram we will initiate verification
      if (formData.channelType === 'email') {
        // Validate required fields
        if (!formData.name.trim()) {
          throw new Error('Please enter a channel name');
        }
        if (!formData.config?.email?.fromAddress) {
          throw new Error('Please enter an email address');
        }

        // Initiate verification which may create placeholder; do not close overlay until verified.
        await initiateEmailVerification();
        // keep saving state false: verification drives UI now
        setIsSaving(false);
        return;
      }

      if (formData.channelType === 'telegram') {
        // Validate required fields
        if (!formData.name.trim()) {
          throw new Error('Please enter a channel name');
        }

        // start Telegram flow
        await initiateTelegramVerification();
        setIsSaving(false);
        return;
      }

      // For other channels, proceed with normal save
      const payload = {
        name: formData.name,
        description: formData.description,
        channelType: { [formData.channelType]: null },
        config: formData.config,
        isActive: formData.isActive,
      };

      // For other channels, call onSubmit or service
      if (onSubmit) {
        const res = await onSubmit(payload);
        if (res?.error) throw new Error(res.error);
      }

      setSaveSuccess(true);
      onSuccess?.(true);
    } catch (err: any) {
      console.error('Channel save error:', err);
      setSaveError(err?.message || 'Failed to save channel');
    } finally {
      setIsSaving(false);
    }
  };

  // ---------- Copy helpers ----------
  const copyToClipboard = async (text: string | null, kind: 'token' | 'link' = 'token') => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      if (kind === 'token') {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 1800);
      } else {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 1800);
      }
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const copyBotName = async (botName: string | undefined) => {
    if (!botName) return;
    try {
      await navigator.clipboard.writeText(botName);
      setCopiedBot(true);
      setTimeout(() => setCopiedBot(false), 1800);
    } catch (e) {
      console.warn('Copy bot name failed', e);
    }
  };

  // Cleanup on unmount: if a placeholder channel exists and verification not confirmed, attempt to delete it
  React.useEffect(() => {
    return () => {
      try {
        const v = verificationRef.current;
        if (v && v.channelId && v.step !== 'confirmed' && typeof service?.deleteChannel === 'function') {
          // fire-and-forget cleanup
          service.deleteChannel(Number(v.channelId)).catch(() => { /* ignore */ });
        }
      } catch (e) {
        // ignore
      }
    };
  }, []);

  // ---------- UI small helpers ----------
  const statusIcons: Record<string, React.ReactNode> = {
    idle: null,
    pending_confirmation: <Loader2 className="h-4 w-4 animate-spin text-blue-400" />,
    confirmed: <Check className="h-4 w-4 text-green-500" />,
    failed: <X className="h-4 w-4 text-red-500" />,
  };

  // ---------- Render ----------
  const StatusMessage: React.FC = () => {
    // Use verification for verification flows, otherwise use save state
    const isVerifying = verification.step !== 'idle';
    if (!isVerifying && !isSaving && !saveError && !saveSuccess) return null;

    // Choose visual state
    const visualType = verification.step !== 'idle' ? verification.step : (saveError ? 'failed' : saveSuccess ? 'confirmed' : isSaving ? 'pending_confirmation' : 'idle');

    const getStatusMessage = () => {
      if (verification.step !== 'idle') {
        switch (verification.step) {
          case 'initiated':
            return 'Preparing verification...';
          case 'pending_confirmation':
            if (formData.channelType === 'email') return 'Waiting for email verification code...';
            if (formData.channelType === 'telegram') return 'Waiting for Telegram verification...';
            return 'Verification in progress...';
          case 'confirmed':
            return 'Channel verified and activated successfully!';
          case 'failed':
            return verification.message || 'Verification failed. Please try again.';
          default:
            return verification.message || 'Verification in progress...';
        }
      }
      if (saveError) return saveError;
      if (saveSuccess) return 'Channel saved successfully!';
      if (isSaving) return 'Saving channel...';
      return null;
    };

    return (
      <div className={cn(
        'p-3 rounded-md text-sm flex items-start gap-2',
        visualType === 'failed' ? 'bg-red-900/20 text-red-400 border border-red-800/30' :
        visualType === 'confirmed' ? 'bg-green-900/20 text-green-400 border border-green-800/30' :
        visualType === 'pending_confirmation' ? 'bg-blue-900/20 text-blue-400 border border-blue-800/30' :
        'bg-neutral-900/10 text-neutral-300'
      )}>
        <div className="mt-0.5">
          {statusIcons[visualType]}
        </div>
        <div className="flex-1">
          {getStatusMessage()}

          {verification.step === 'pending_confirmation' && formData.channelType === 'telegram' && (
            <div className="mt-2 text-xs">
              <p>• Complete the verification steps above in Telegram</p>
              <p>• Return here and click "Check Status" to confirm</p>
            </div>
          )}
        </div>

        {verification.step === 'pending_confirmation' && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={manualRefreshVerification}
            disabled={isSaving}
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
        <p className="text-neutral-400">Configure how you want to receive notifications</p>
      </div>

      {/* If verification is in progress, show only the verification UI */}
      {verification.step === 'pending_confirmation' || verification.step === 'confirmed' || verification.step === 'failed' ? (
        <div className="space-y-6">
          <StatusMessage />

          <Card className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                {formData.channelType === 'email' ? 'Verify Your Email' : 'Verify Your Telegram'}
              </h2>
              <p className="text-neutral-400">
                {formData.channelType === 'email'
                  ? 'Complete the verification process to activate your email channel'
                  : 'Complete the verification process to activate your Telegram channel'
                }
              </p>
            </div>

            {/* Channel Info Display */}
            <div className="mb-6 p-4 bg-neutral-900/20 rounded-md">
              <div className="flex items-center gap-3 mb-2">
                {formData.channelType === 'email' ? (
                  <Mail className="h-5 w-5 text-blue-400" />
                ) : (
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                )}
                <div>
                  <div className="font-medium text-white">{formData.name || 'Unnamed Channel'}</div>
                  <div className="text-sm text-neutral-400">
                    {formData.channelType === 'email' ? 'Email Channel' : 'Telegram Channel'}
                  </div>
                </div>
              </div>
              {formData.description && (
                <div className="text-sm text-neutral-400 mt-2">{formData.description}</div>
              )}
            </div>

            {/* Verification Content */}
            {formData.channelType === 'email' ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-neutral-400 mb-4">
                    Check your email at <span className="font-mono text-blue-300">{formData.config?.email?.fromAddress}</span> for a verification code.
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Verification Code</label>
                    <div className="flex gap-2">
                      <input
                        aria-label="email-verification-code"
                        className="flex-1 bg-neutral-800/50 border border-neutral-600 rounded px-3 py-2 text-sm text-neutral-100 font-mono focus:border-blue-500 focus:outline-none"
                        placeholder="Enter 6-digit code"
                        value={emailVerificationCode}
                        onChange={(e: any) => setEmailVerificationCode(e.target.value)}
                        disabled={isSaving}
                        maxLength={10}
                        onPaste={(e) => {
                          // Allow pasting
                          const paste = e.clipboardData.getData('text');
                          setEmailVerificationCode(paste);
                          e.preventDefault();
                        }}
                      />
                      <Button size="sm" variant="primary" onClick={submitEmailVerificationCode} disabled={isSaving || !emailVerificationCode.trim()}>
                        {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Verify'}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Didn't receive the code?</span>
                    <Button variant="ghost" size="sm" onClick={resendEmailVerification} disabled={isSaving} className="h-6 px-2 text-xs">
                      Resend Code
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-neutral-400 mb-4">
                    Complete the verification in Telegram to activate your channel.
                  </div>
                </div>

                {verification.token && (
                  <div className="space-y-3">
                    {/* Option 1: Copy Token */}
                    <div className="p-3 bg-neutral-800/50 rounded-md border border-neutral-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-300">Option 1: Manual Setup</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(verification.token, 'token')}
                          className="h-6 px-2 text-xs"
                        >
                          {copiedToken ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                      <div className="text-xs text-neutral-400 mb-2">Copy this token and send it to the bot:</div>
                      <div className="text-xs text-neutral-400 break-all font-mono bg-neutral-900/50 p-2 rounded mb-2">
                        {verification.token}
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center justify-between">
                        <div>
                          <div>1. Open Telegram and find</div>
                          <div className="font-mono text-sm text-neutral-300 inline-block">{telegramConf.botUsername}</div>
                          <div className="text-xs text-neutral-500">2. Send the token above to start verification</div>
                        </div>
                        <div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => copyBotName(telegramConf.botName)}
                            className="h-6 px-2 text-xs"
                            aria-label="Copy bot name"
                          >
                            {copiedBot ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Option 2: Magic Link */}
                    <div className="p-3 bg-neutral-800/50 rounded-md border border-neutral-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-neutral-300">Option 2: Quick Setup</span>
                      </div>
                      <Button
                        type="button"
                        variant="primary"
                        className="w-full"
                        onClick={() => {
                          const botStartUrl = getTelegramBotStartUrl(verification.token ?? '');
                          window.open(botStartUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Telegram & Verify
                      </Button>
                      <div className="mt-2 text-xs text-neutral-500">
                        This opens Telegram with the verification token ready to send.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>Cancel</Button>
              <Button type="button" variant="secondary" onClick={manualRefreshVerification} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Check Status
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <StatusMessage />

          <Card className="p-6">
            <div className="space-y-6">
              {/* Channel Name */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Channel Name *</label>
                <Input
                  variant="line"
                  size="md"
                  value={formData.name}
                  onChange={(e: any) => handleChange('name', e.target.value)}
                  placeholder="e.g., Primary Email Gateway"
                  required
                  aria-label="Channel name"
                  disabled={isSaving || verification.step === 'pending_confirmation'}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Description (optional)</label>
                <textarea
                  className="w-full bg-transparent border-b border-neutral-700 px-0 py-2 text-sm text-neutral-100 min-h-[64px]"
                  value={formData.description}
                  onChange={(e: any) => handleChange('description', e.target.value)}
                  placeholder="What's this channel for?"
                  disabled={isSaving || verification.step === 'pending_confirmation'}
                />
              </div>

              {/* Channel Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">Channel Type <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {CHANNEL_TYPES.map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => handleChange('channelType', type.id)}
                      className={cn('flex items-center gap-2 p-3 rounded-md border transition-colors', formData.channelType === type.id ? 'border-blue-500 bg-blue-500/10' : 'border-neutral-800 hover:border-neutral-700', (isSaving || verification.step === 'pending_confirmation') && 'opacity-50 cursor-not-allowed')}
                      disabled={isSaving || verification.step === 'pending_confirmation'}
                    >
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
                {(function () {
                  const { channelType, config } = formData;

                  if (channelType === 'email') {
                    return (
                      <div className="space-y-4 p-4 bg-neutral-900/20 rounded-md">
                        <div>
                          <label className="block text-sm font-medium text-neutral-300 mb-1">Email Address</label>
                          <Input
                            aria-label="email-address"
                            value={config.email?.fromAddress || ''}
                            onChange={(e: any) => handleNestedConfigChange('email', 'fromAddress', e.target.value)}
                            placeholder="you@domain.com"
                            disabled={isSaving || verification.step === 'pending_confirmation'}
                          />
                        </div>
                      </div>
                    );
                  }

                  if (channelType === 'webhook') {
                    return (
                      <div className="space-y-4 p-4 bg-neutral-900/20 rounded-md">
                        <div>
                          <label className="block text-sm font-medium text-neutral-300 mb-1">Webhook URL</label>
                          <Input aria-label="webhook-url" value={config.webhook?.url || ''} onChange={(e: any) => handleNestedConfigChange('webhook', 'url', e.target.value)} placeholder="https://your-host/api/webhook" disabled={isSaving} />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-300 mb-1">Method <span className="text-red-500">*</span></label>
                          <select 
                            aria-label="webhook-method" 
                            className="w-full bg-transparent border-b border-neutral-700 px-0 py-2 text-sm text-neutral-100" 
                            value={config.webhook?.method || 'POST'} 
                            onChange={(e: any) => handleNestedConfigChange('webhook', 'method', e.target.value)} 
                            disabled={isSaving}
                            required
                          >
                            <option value="POST">POST</option>
                            <option value="GET">GET</option>
                            <option value="PUT">PUT</option>
                            <option value="PATCH">PATCH</option>
                          </select>
                          <div className="text-xs text-neutral-400 mt-1">HTTP method for webhook requests</div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-300 mb-1">Auth Type</label>
                          <select aria-label="webhook-auth-type" className="w-full bg-transparent border-b border-neutral-700 px-0 py-2 text-sm text-neutral-100"
                            value={
                              'none' in (config.webhook?.authType || {}) ? 'none' :
                              'basic' in (config.webhook?.authType || {}) ? 'basic' :
                              'bearer' in (config.webhook?.authType || {}) ? 'bearer' : 'none'
                            }
                            onChange={(e: any) => {
                              const val = e.target.value;
                              let authType: any = {};
                              if (val === 'none') authType = { none: null };
                              if (val === 'basic') authType = { basic: { username: '', password: '' } };
                              if (val === 'bearer') authType = { bearer: '' };
                              handleNestedConfigChange('webhook', 'authType', authType);
                            }}
                            disabled={isSaving}
                          >
                            <option value="none">None</option>
                            <option value="basic">Basic (username/password)</option>
                            <option value="bearer">Bearer Token</option>
                          </select>
                        </div>

                        {config.webhook?.authType?.basic && (
                          <div className="space-y-2 mt-2">
                            <Input aria-label="webhook-basic-username" value={config.webhook.authType.basic.username || ''} onChange={(e: any) => handleNestedConfigChange('webhook', 'authType', { basic: { ...config.webhook.authType.basic, username: e.target.value, password: config.webhook.authType.basic.password } })} placeholder="Username" disabled={isSaving} />
                            <Input aria-label="webhook-basic-password" type="password" value={config.webhook.authType.basic.password || ''} onChange={(e: any) => handleNestedConfigChange('webhook', 'authType', { basic: { ...config.webhook.authType.basic, username: config.webhook.authType.basic.username, password: e.target.value } })} placeholder="Password" disabled={isSaving} />
                          </div>
                        )}

                        {config.webhook?.authType?.bearer !== undefined && (
                          <div className="mt-2">
                            <Input aria-label="webhook-bearer-token" value={config.webhook.authType.bearer || ''} onChange={(e: any) => handleNestedConfigChange('webhook', 'authType', { bearer: e.target.value })} placeholder="Bearer token" disabled={isSaving} />
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-neutral-300 mb-1">Secret (optional)</label>
                          <Input aria-label="webhook-secret" value={config.webhook?.secret || ''} onChange={(e: any) => handleNestedConfigChange('webhook', 'secret', e.target.value)} placeholder="Optional secret for verifying requests" disabled={isSaving} />
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
                    <input type="checkbox" className="sr-only" checked={formData.isActive} onChange={(e: any) => handleChange('isActive', e.target.checked)} disabled={isSaving || verification.step === 'pending_confirmation'} />
                    <div className={cn('block w-10 h-6 rounded-full', formData.isActive ? 'bg-blue-600' : 'bg-neutral-700')} />
                    <div className={cn('absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform', formData.isActive ? 'translate-x-4' : '')} />
                  </div>
                  <span className="text-sm font-medium">{formData.isActive ? 'Active' : 'Inactive'}</span>
                </label>
                <p className="mt-1 text-xs text-neutral-400">{formData.isActive ? 'This channel is active and will receive notifications.' : 'This channel is inactive and will not receive notifications.'}</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-800 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving || verification.step === 'pending_confirmation'}>Cancel</Button>
              <Button type="submit" disabled={isSaving || verification.step === 'pending_confirmation' || (formData.channelType === 'email' && !(formData.config && (formData.config as any).email && (formData.config as any).email.fromAddress))}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {formData.channelType === 'telegram' ? 'Connecting...' : 'Saving...'}
                  </>
                ) : (
                  <>{initialChannel ? 'Save Changes' : 'Create Channel'}</>
                )}
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
};

export default ChannelForm;
