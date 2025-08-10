import React from 'react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Text from '../UI/Text';
import Input from '../UI/Input';

const ChannelForm = ({ initialChannel, onSubmit, onCancel, isLoading = false }: any) => {
  const [name, setName] = (React as any).useState(initialChannel?.name || '');
  const [description, setDescription] = (React as any).useState(initialChannel?.description || '');
  const [channelType, setChannelType] = (React as any).useState(
    typeof initialChannel?.channelType === 'string' 
      ? initialChannel.channelType 
      : typeof initialChannel?.channelType === 'object' && initialChannel.channelType.custom
      ? 'custom'
      : 'email'
  );
  const [customType, setCustomType] = (React as any).useState(
    typeof initialChannel?.channelType === 'object' && initialChannel.channelType.custom
      ? initialChannel.channelType.custom
      : ''
  );
  const [isActive, setIsActive] = (React as any).useState(initialChannel?.isActive ?? true);
  const [config, setConfig] = (React as any).useState(
    initialChannel?.config || [['host', ''], ['port', ''], ['username', ''], ['password', '']]
  );

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const finalChannelType = channelType === 'custom' 
      ? { custom: customType }
      : { [channelType]: null } as any;
    onSubmit({
      name,
      description: description || undefined,
      channelType: finalChannelType,
      config: config.filter(([key, value]: any) => key && value),
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
    switch (type) {
      case 'email':
        return [['host', ''], ['port', '587'], ['username', ''], ['password', ''], ['encryption', 'tls']];
      case 'sms':
        return [['api_key', ''], ['phone_number', ''], ['service_url', '']];
      case 'webhook':
        return [['url', ''], ['method', 'POST'], ['content_type', 'application/json']];
      case 'push':
        return [['api_key', ''], ['app_id', ''], ['service_url', '']];
      default:
        return [['key', ''], ['value', '']];
    }
  };

  const handleChannelTypeChange = (newType: string) => {
    setChannelType(newType);
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
            <h3 className="text-lg mb-2">Configuration</h3>
            <Text variant="body-sm" color="var(--color-text-secondary)" className="mb-3 block">
              Configure the connection parameters for this channel.
            </Text>

            <div className="rounded-md border border-neutral-800 p-3 bg-neutral-900/30">
              {config.map((item: any, index: number) => (
                <div key={index} className="flex items-center gap-2 mb-2 p-2 rounded-md bg-neutral-950">
                  <Input value={item[0]} onChange={(e: any) => updateConfigItem(index, 0, e.target.value)} placeholder="Parameter name..." />
                  <Input value={item[1]} onChange={(e: any) => updateConfigItem(index, 1, e.target.value)} placeholder="Value..." type={String(item[0]).toLowerCase().includes('password') ? 'password' : 'text'} />
                  <button type="button" onClick={() => removeConfigItem(index)} className="bg-red-500 text-white rounded px-2 py-1 text-xs">
                    ×
                  </button>
                </div>
              ))}

              <div>
                <Button onClick={addConfigItem} type="button" variant="secondary" size="sm">
                  Add Parameter
                </Button>
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
