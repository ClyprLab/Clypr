import React from 'react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Text from '../UI/Text';
import Input from '../UI/Input';
import { ChannelConfig, RetryConfig, ValidationConfig } from '../../services/ClyprService';

const ChannelForm = ({ initialChannel, onSubmit, onCancel, isLoading = false }: any) => {
  const [name, setName] = (React as any).useState(initialChannel?.name || '');
  const [description, setDescription] = (React as any).useState(initialChannel?.description || '');
  const [channelType, setChannelType] = (React as any).useState(
    // Derive channel type robustly from backend variant (e.g. { email: null } or { custom: "x" })
    (() => {
      const ct = initialChannel?.channelType;
      if (!ct) return 'email';
      if (typeof ct === 'string') return ct;
      if (typeof ct === 'object') {
        const keys = Object.keys(ct);
        if (keys.length > 0) return keys[0] === 'custom' ? 'custom' : keys[0];
      }
      return 'email';
    })()
  );
  const [customType, setCustomType] = (React as any).useState(
    // If backend provided a custom variant like { custom: "mytype" }
    (initialChannel && typeof initialChannel.channelType === 'object' && 'custom' in initialChannel.channelType)
      ? (initialChannel.channelType as any).custom || ''
      : ''
  );
  const [isActive, setIsActive] = (React as any).useState(initialChannel?.isActive ?? true);
  const [config, setConfig] = (React as any).useState(() => {
    // Expect backend to return a ChannelConfig variant (e.g. { email: {...} })
    const base = initialChannel?.config || {
      email: {
        provider: 'smtp',
        fromAddress: '',
        apiKey: [],
        replyTo: [],
        smtp: {
          host: '',
          port: 587,
          username: '',
          password: '',
          useTLS: true
        }
      }
    };
    // If smtp is coming as an opt array from backend, unwrap it
    if (base?.email?.smtp && Array.isArray(base.email.smtp)) {
      base.email.smtp = base.email.smtp[0] || {
        host: '',
        port: 587,
        username: '',
        password: '',
        useTLS: true
      };
    }
    return base;
  });

  const [retryConfig, setRetryConfig] = (React as any).useState({
    maxAttempts: 3,
    backoffMs: 1000,
    timeoutMs: 5000
  });

  const [validationConfig, setValidationConfig] = (React as any).useState({
    contentLimits: {
      maxTitleLength: 200,
      maxBodyLength: 5000,
      maxMetadataCount: 10,
      allowedContentTypes: ['text/plain', 'text/html', 'application/json']
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 100,
      perChannel: true
    }
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const finalChannelType = channelType === 'custom' 
      ? { custom: customType }
      : { [channelType]: null };

        // Normalize optionals and variants to avoid double-wrapping
    const smtpRaw = config.email?.smtp;
    // Convert smtp object back to opt array for backend
    const smtpOpt = smtpRaw && !Array.isArray(smtpRaw) ? [smtpRaw] : (Array.isArray(smtpRaw) ? smtpRaw : []);
    const apiKeyRaw = config.email?.apiKey;
    const apiKeyOpt = Array.isArray(apiKeyRaw) ? apiKeyRaw : apiKeyRaw ? [apiKeyRaw] : [];
    const replyToRaw = config.email?.replyTo;
    const replyToOpt = Array.isArray(replyToRaw) ? replyToRaw : replyToRaw ? [replyToRaw] : [];
    const webhookUrlRaw = config.sms?.webhookUrl;
    const webhookUrlOpt = Array.isArray(webhookUrlRaw) ? webhookUrlRaw : webhookUrlRaw ? [webhookUrlRaw] : [];
    const pushPlatformRaw = config.push?.platform as any;
    const pushPlatform = (pushPlatformRaw && typeof pushPlatformRaw === 'object')
      ? pushPlatformRaw
      : { [(pushPlatformRaw || 'fcm') as string]: null } as any;

    // Create channel-specific config based on type
    const processedConfig = channelType === 'email' ? {
      email: {
        provider: config.email?.provider || 'smtp',
        apiKey: apiKeyOpt,
        fromAddress: config.email?.fromAddress || '',
        replyTo: replyToOpt,
        smtp: smtpOpt.length ? smtpOpt : []
      }
    } : channelType === 'sms' ? {
      sms: {
        provider: config.sms?.provider || '',
        apiKey: config.sms?.apiKey || '',
        fromNumber: config.sms?.fromNumber || '',
        webhookUrl: webhookUrlOpt
      }
    } : channelType === 'webhook' ? {
      webhook: {
        url: config.webhook?.url || '',
        method: config.webhook?.method || 'POST',
        headers: config.webhook?.headers || [],
        authType: config.webhook?.authType || { none: null },
        retryCount: config.webhook?.retryCount || 3
      }
    } : channelType === 'push' ? {
      push: {
        provider: config.push?.provider || '',
        apiKey: config.push?.apiKey || '',
        appId: config.push?.appId || '',
        platform: pushPlatform
      }
    } : {
      custom: config.custom || []
    };

    onSubmit({
      name,
      description: description || undefined,
      channelType: finalChannelType,
      config: processedConfig,
      retryConfig,
      validationConfig,
      isActive
    });
  };

  const addConfigItem = () => setConfig([...config, ['', '']]);
  const removeConfigItem = (index: number) => setConfig(config.filter((_: any, i: number) => i !== index));
  const updateConfigItem = (index: number, keyOrValue: 0 | 1, value: string) => {
    const updated = [...config];
    updated[index][keyOrValue] = value;
    setConfig(updated);
  };

  const getChannelTypeInfo = () => {
    switch (channelType) {
      case 'email':
        return 'Configure SMTP settings for email delivery. Required: host, port, username, password.';
      case 'sms':
        return 'Configure SMS gateway settings. Required: api_key, phone_number, service_url.';
      case 'webhook':
        return 'Configure webhook endpoint. Required: url, method, headers (optional).';
      case 'push':
        return 'Configure push notification service. Required: api_key, app_id, service_url.';
      case 'custom':
        return 'Configure custom channel with your own parameters.';
      default:
        return '';
    }
  };

  const getDefaultConfig = (type: string) => {
    // Return object-shaped ChannelConfig matching the runtime code above
    switch (type) {
      case 'email':
        return {
          email: {
            provider: 'smtp',
            apiKey: [],
            fromAddress: '',
            replyTo: [],
            smtp: { host: '', port: 587, username: '', password: '', useTLS: true }
          }
        };
      case 'sms':
        return { sms: { provider: '', apiKey: '', fromNumber: '', webhookUrl: '' } };
      case 'webhook':
        return { webhook: { url: '', method: 'POST', headers: [], authType: { none: null }, retryCount: 3 } };
      case 'push':
        return { push: { provider: '', apiKey: '', appId: '', platform: 'fcm' } };
      default:
        return { custom: [] };
    }
  };

  const handleChannelTypeChange = (newType: string) => {
    setChannelType(newType);
    // Only replace config when switching between concrete types; keep existing config for custom edits
    if (newType !== 'custom') setConfig(getDefaultConfig(newType));
  };

  return (
    <div className="max-w-[600px] mx-auto">
      <Card className="p-4 md:p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="text-lg mb-4">Basic Information</h3>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Channel Name *</label>
              <Input value={name} onChange={(e: any) => setName(e.target.value)} placeholder="e.g., Primary Email Gateway" required />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Description</label>
              <textarea
                className="w-full h-24 rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription((e as any).target.value)}
                placeholder="Describe this channel's purpose..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block mb-2 font-medium">Channel Type *</label>
                <select
                  className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm"
                  value={channelType}
                  onChange={(e) => handleChannelTypeChange((e as any).target.value)}
                >
                  <option value="email">Email (SMTP)</option>
                  <option value="sms">SMS</option>
                  <option value="webhook">Webhook</option>
                  <option value="push">Push Notification</option>
                  <option value="custom">Custom</option>
                </select>

                {channelType === 'custom' && (
                  <div className="mt-2">
                    <Input value={customType} onChange={(e: any) => setCustomType(e.target.value)} placeholder="Custom channel type..." required />
                  </div>
                )}
              </div>

              <div>
                <label className="block mb-2 font-medium">Status</label>
                <select
                  className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm"
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(((e as any).target.value) === 'active')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-md bg-neutral-900/50 text-sm text-neutral-300">
              {getChannelTypeInfo()}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg mb-2">Channel Configuration</h3>
            <Text variant="body-sm" color="var(--color-text-secondary)" className="mb-3 block">
              Configure the connection parameters for this channel.
            </Text>

            <div className="rounded-md border border-neutral-800 p-3 bg-neutral-900/30">
              {channelType === 'email' && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium">From Address *</label>
                    <Input
                      value={config.email?.fromAddress || ''}
                      onChange={(e: any) => setConfig({
                        ...config,
                        email: { ...config.email, fromAddress: e.target.value }
                      })}
                      placeholder="noreply@yourdomain.com"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Reply To (Optional)</label>
                    <Input
                      value={config.email?.replyTo || ''}
                      onChange={(e: any) => setConfig({
                        ...config,
                        email: { ...config.email, replyTo: e.target.value }
                      })}
                      placeholder="support@yourdomain.com"
                    />
                  </div>
                  <div className="p-4 bg-neutral-950 rounded-md">
                    <h4 className="font-medium mb-3">SMTP Settings</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block mb-1 text-sm">Host *</label>
                        <Input
                          value={config.email?.smtp?.host || ''}
                          onChange={(e: any) => setConfig({
                            ...config,
                            email: {
                              ...config.email,
                              smtp: { ...config.email?.smtp, host: e.target.value }
                            }
                          })}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm">Port *</label>
                        <Input
                          value={config.email?.smtp?.port || ''}
                          onChange={(e: any) => setConfig({
                            ...config,
                            email: {
                              ...config.email,
                              smtp: { ...config.email?.smtp, port: parseInt(e.target.value) || 587 }
                            }
                          })}
                          type="number"
                          placeholder="587"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm">Username *</label>
                        <Input
                          value={config.email?.smtp?.username || ''}
                          onChange={(e: any) => setConfig({
                            ...config,
                            email: {
                              ...config.email,
                              smtp: { ...config.email?.smtp, username: e.target.value }
                            }
                          })}
                          placeholder="username@gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm">Password *</label>
                        <Input
                          value={config.email?.smtp?.password || ''}
                          onChange={(e: any) => setConfig({
                            ...config,
                            email: {
                              ...config.email,
                              smtp: { ...config.email?.smtp, password: e.target.value }
                            }
                          })}
                          type="password"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {channelType === 'sms' && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium">Provider *</label>
                    <select
                      className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm"
                      value={config.sms?.provider || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        sms: { ...config.sms, provider: e.target.value }
                      })}
                    >
                      <option value="">Select Provider</option>
                      <option value="twilio">Twilio</option>
                      <option value="messagebird">MessageBird</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">API Key *</label>
                    <Input
                      value={config.sms?.apiKey || ''}
                      onChange={(e: any) => setConfig({
                        ...config,
                        sms: { ...config.sms, apiKey: e.target.value }
                      })}
                      type="password"
                      placeholder="Your API Key"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">From Number *</label>
                    <Input
                      value={config.sms?.fromNumber || ''}
                      onChange={(e: any) => setConfig({
                        ...config,
                        sms: { ...config.sms, fromNumber: e.target.value }
                      })}
                      placeholder="+1234567890"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Webhook URL (Optional)</label>
                    <Input
                      value={config.sms?.webhookUrl || ''}
                      onChange={(e: any) => setConfig({
                        ...config,
                        sms: { ...config.sms, webhookUrl: e.target.value }
                      })}
                      placeholder="https://your-webhook.com/sms-status"
                    />
                  </div>
                </div>
              )}

              {channelType === 'webhook' && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium">URL *</label>
                    <Input
                      value={config.webhook?.url || ''}
                      onChange={(e: any) => setConfig({
                        ...config,
                        webhook: { ...config.webhook, url: e.target.value }
                      })}
                      placeholder="https://your-api.com/webhook"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Method *</label>
                    <select
                      className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm"
                      value={config.webhook?.method || 'POST'}
                      onChange={(e) => setConfig({
                        ...config,
                        webhook: { ...config.webhook, method: e.target.value }
                      })}
                    >
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Authentication</label>
                    <select
                      className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm mb-3"
                      value={Object.keys(config.webhook?.authType || { none: null })[0]}
                      onChange={(e) => {
                        const authType = e.target.value;
                        setConfig({
                          ...config,
                          webhook: {
                            ...config.webhook,
                            authType: authType === 'none' ? { none: null } :
                                     authType === 'basic' ? { basic: { username: '', password: '' } } :
                                     authType === 'bearer' ? { bearer: '' } : { none: null }
                          }
                        });
                      }}
                    >
                      <option value="none">None</option>
                      <option value="basic">Basic Auth</option>
                      <option value="bearer">Bearer Token</option>
                    </select>

                    {config.webhook?.authType?.basic && (
                      <div className="space-y-3 p-3 bg-neutral-950 rounded-md">
                        <Input
                          value={config.webhook.authType.basic.username || ''}
                          onChange={(e: any) => setConfig({
                            ...config,
                            webhook: {
                              ...config.webhook,
                              authType: {
                                basic: {
                                  ...config.webhook.authType.basic,
                                  username: e.target.value
                                }
                              }
                            }
                          })}
                          placeholder="Username"
                        />
                        <Input
                          value={config.webhook.authType.basic.password || ''}
                          onChange={(e: any) => setConfig({
                            ...config,
                            webhook: {
                              ...config.webhook,
                              authType: {
                                basic: {
                                  ...config.webhook.authType.basic,
                                  password: e.target.value
                                }
                              }
                            }
                          })}
                          type="password"
                          placeholder="Password"
                        />
                      </div>
                    )}

                    {config.webhook?.authType?.bearer !== undefined && (
                      <Input
                        value={config.webhook.authType.bearer || ''}
                        onChange={(e: any) => setConfig({
                          ...config,
                          webhook: {
                            ...config.webhook,
                            authType: { bearer: e.target.value }
                          }
                        })}
                        placeholder="Bearer Token"
                      />
                    )}
                  </div>
                </div>
              )}

              {channelType === 'push' && (
                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 font-medium">Provider *</label>
                    <select
                      className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm"
                      value={config.push?.provider || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        push: { ...config.push, provider: e.target.value }
                      })}
                    >
                      <option value="">Select Provider</option>
                      <option value="fcm">Firebase Cloud Messaging</option>
                      <option value="apn">Apple Push Notification</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">API Key *</label>
                    <Input
                      value={config.push?.apiKey || ''}
                      onChange={(e: any) => setConfig({
                        ...config,
                        push: { ...config.push, apiKey: e.target.value }
                      })}
                      type="password"
                      placeholder="Your API Key"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">App ID *</label>
                    <Input
                      value={config.push?.appId || ''}
                      onChange={(e: any) => setConfig({
                        ...config,
                        push: { ...config.push, appId: e.target.value }
                      })}
                      placeholder="com.example.app"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Platform *</label>
                    <select
                      className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm"
                      value={config.push?.platform || 'fcm'}
                      onChange={(e) => setConfig({
                        ...config,
                        push: { ...config.push, platform: e.target.value as 'fcm' | 'apn' | 'webpush' }
                      })}
                    >
                      <option value="fcm">Firebase Cloud Messaging</option>
                      <option value="apn">Apple Push Notification</option>
                      <option value="webpush">Web Push</option>
                    </select>
                  </div>
                </div>
              )}

              {channelType === 'custom' && (
                <div>
                  {(config.custom || []).map((item: [string, string], index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-2 p-2 rounded-md bg-neutral-950">
                      <Input
                        value={item[0]}
                        onChange={(e: any) => {
                          const newCustom = [...(config.custom || [])];
                          newCustom[index][0] = e.target.value;
                          setConfig({ ...config, custom: newCustom });
                        }}
                        placeholder="Parameter name..."
                      />
                      <Input
                        value={item[1]}
                        onChange={(e: any) => {
                          const newCustom = [...(config.custom || [])];
                          newCustom[index][1] = e.target.value;
                          setConfig({ ...config, custom: newCustom });
                        }}
                        placeholder="Value..."
                        type={item[0].toLowerCase().includes('password') ? 'password' : 'text'}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newCustom = [...(config.custom || [])];
                          newCustom.splice(index, 1);
                          setConfig({ ...config, custom: newCustom });
                        }}
                        className="bg-red-500 text-white rounded px-2 py-1 text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <Button
                    onClick={() => setConfig({
                      ...config,
                      custom: [...(config.custom || []), ['', '']]
                    })}
                    type="button"
                    variant="secondary"
                    size="sm"
                  >
                    Add Parameter
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Retry Configuration */}
          <div className="mb-6">
            <h3 className="text-lg mb-2">Retry Configuration</h3>
            <Text variant="body-sm" color="var(--color-text-secondary)" className="mb-3 block">
              Configure how messages should be retried on failure.
            </Text>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Max Attempts</label>
                <Input
                  type="number"
                  value={retryConfig.maxAttempts}
                  onChange={(e: any) => setRetryConfig({
                    ...retryConfig,
                    maxAttempts: parseInt(e.target.value) || 3
                  })}
                  min="1"
                  max="10"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Backoff (ms)</label>
                <Input
                  type="number"
                  value={retryConfig.backoffMs}
                  onChange={(e: any) => setRetryConfig({
                    ...retryConfig,
                    backoffMs: parseInt(e.target.value) || 1000
                  })}
                  min="100"
                  step="100"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">Timeout (ms)</label>
                <Input
                  type="number"
                  value={retryConfig.timeoutMs}
                  onChange={(e: any) => setRetryConfig({
                    ...retryConfig,
                    timeoutMs: parseInt(e.target.value) || 5000
                  })}
                  min="1000"
                  step="1000"
                />
              </div>
            </div>
          </div>

          {/* Validation Configuration */}
          <div className="mb-6">
            <h3 className="text-lg mb-2">Validation Configuration</h3>
            <Text variant="body-sm" color="var(--color-text-secondary)" className="mb-3 block">
              Configure content validation and rate limiting.
            </Text>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">Content Limits</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm">Max Title Length</label>
                    <Input
                      type="number"
                      value={validationConfig.contentLimits.maxTitleLength}
                      onChange={(e: any) => setValidationConfig({
                        ...validationConfig,
                        contentLimits: {
                          ...validationConfig.contentLimits,
                          maxTitleLength: parseInt(e.target.value) || 200
                        }
                      })}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm">Max Body Length</label>
                    <Input
                      type="number"
                      value={validationConfig.contentLimits.maxBodyLength}
                      onChange={(e: any) => setValidationConfig({
                        ...validationConfig,
                        contentLimits: {
                          ...validationConfig.contentLimits,
                          maxBodyLength: parseInt(e.target.value) || 5000
                        }
                      })}
                      min="1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Rate Limiting</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 text-sm">Window (ms)</label>
                    <Input
                      type="number"
                      value={validationConfig.rateLimit.windowMs}
                      onChange={(e: any) => setValidationConfig({
                        ...validationConfig,
                        rateLimit: {
                          ...validationConfig.rateLimit,
                          windowMs: parseInt(e.target.value) || 60000
                        }
                      })}
                      min="1000"
                      step="1000"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm">Max Requests</label>
                    <Input
                      type="number"
                      value={validationConfig.rateLimit.maxRequests}
                      onChange={(e: any) => setValidationConfig({
                        ...validationConfig,
                        rateLimit: {
                          ...validationConfig.rateLimit,
                          maxRequests: parseInt(e.target.value) || 100
                        }
                      })}
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-sm">Per Channel</label>
                    <select
                      className="w-full h-10 rounded-md border border-neutral-800 bg-neutral-950 px-3 text-sm"
                      value={validationConfig.rateLimit.perChannel ? 'true' : 'false'}
                      onChange={(e) => setValidationConfig({
                        ...validationConfig,
                        rateLimit: {
                          ...validationConfig.rateLimit,
                          perChannel: e.target.value === 'true'
                        }
                      })}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name || (channelType === 'custom' && !customType)}>
              {isLoading ? 'Creating...' : 'Create Channel'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ChannelForm;
