import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../UI/Button';
import Card from '../UI/Card';
import Text from '../UI/Text';
import Input from '../UI/Input';
import { Channel } from '../../services/ClyprService';

const FormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const FormSection = styled.div`
  margin-bottom: var(--space-6);
`;

const SectionTitle = styled.h3`
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-4);
  color: var(--color-text);
`;

const FormRow = styled.div`
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
`;

const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-1);
`;

const Select = styled.select`
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-bg);
  color: var(--color-text);
  
  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }
`;

const TextArea = styled.textarea`
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  background: var(--color-bg);
  color: var(--color-text);
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: var(--color-accent);
  }
`;

const ConfigList = styled.div`
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: var(--space-3);
  background: var(--color-bg-secondary);
`;

const ConfigItem = styled.div`
  display: flex;
  gap: var(--space-2);
  align-items: center;
  margin-bottom: var(--space-2);
  padding: var(--space-2);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RemoveButton = styled.button`
  background: #ff4444;
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--space-1);
  cursor: pointer;
  font-size: var(--font-size-xs);
  
  &:hover {
    background: #cc3333;
  }
`;

const AddButton = styled(Button)`
  margin-top: var(--space-2);
`;

const ButtonRow = styled.div`
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-6);
`;

const ChannelTypeInfo = styled.div`
  padding: var(--space-3);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  margin-top: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
`;

interface ChannelFormProps {
  initialChannel?: Partial<Channel>;
  onSubmit: (channel: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ChannelForm: React.FC<ChannelFormProps> = ({
  initialChannel,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [name, setName] = useState(initialChannel?.name || '');
  const [description, setDescription] = useState(initialChannel?.description || '');
  const [channelType, setChannelType] = useState<string>(
    typeof initialChannel?.channelType === 'string' 
      ? initialChannel.channelType 
      : typeof initialChannel?.channelType === 'object' && initialChannel.channelType.custom
      ? 'custom'
      : 'email'
  );
  const [customType, setCustomType] = useState(
    typeof initialChannel?.channelType === 'object' && initialChannel.channelType.custom
      ? initialChannel.channelType.custom
      : ''
  );
  const [isActive, setIsActive] = useState(initialChannel?.isActive ?? true);
  const [config, setConfig] = useState<[string, string][]>(
    initialChannel?.config || [['host', ''], ['port', ''], ['username', ''], ['password', '']]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalChannelType = channelType === 'custom' 
      ? { custom: customType }
      : channelType as 'email' | 'sms' | 'webhook' | 'push';
    
    onSubmit({
      name,
      description: description || undefined,
      channelType: finalChannelType,
      config: config.filter(([key, value]) => key && value),
      isActive
    });
  };

  const addConfigItem = () => {
    setConfig([...config, ['', '']]);
  };

  const removeConfigItem = (index: number) => {
    setConfig(config.filter((_, i) => i !== index));
  };

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
    if (newType !== 'custom') {
      setConfig(getDefaultConfig(newType));
    }
  };

  return (
    <FormContainer>
      <Card>
        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Basic Information</SectionTitle>
            
            <FormGroup>
              <Label>Channel Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Primary Email Gateway"
                required
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Description</Label>
              <TextArea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this channel's purpose..."
              />
            </FormGroup>
            
            <FormRow>
              <FormGroup>
                <Label>Channel Type *</Label>
                <Select
                  value={channelType}
                  onChange={(e) => handleChannelTypeChange(e.target.value)}
                >
                  <option value="email">Email (SMTP)</option>
                  <option value="sms">SMS</option>
                  <option value="webhook">Webhook</option>
                  <option value="push">Push Notification</option>
                  <option value="custom">Custom</option>
                </Select>
                
                {channelType === 'custom' && (
                  <Input
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Custom channel type..."
                    style={{ marginTop: 'var(--space-2)' }}
                    required
                  />
                )}
              </FormGroup>
              
              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={isActive ? 'active' : 'inactive'}
                  onChange={(e) => setIsActive(e.target.value === 'active')}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Select>
              </FormGroup>
            </FormRow>
            
            <ChannelTypeInfo>
              {getChannelTypeInfo()}
            </ChannelTypeInfo>
          </FormSection>

          <FormSection>
            <SectionTitle>Configuration</SectionTitle>
            <Text size="sm" color="secondary" style={{ marginBottom: 'var(--space-3)' }}>
              Configure the connection parameters for this channel.
            </Text>
            
            <ConfigList>
              {config.map((item, index) => (
                <ConfigItem key={index}>
                  <FormGroup>
                    <Input
                      value={item[0]}
                      onChange={(e) => updateConfigItem(index, 0, e.target.value)}
                      placeholder="Parameter name..."
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Input
                      value={item[1]}
                      onChange={(e) => updateConfigItem(index, 1, e.target.value)}
                      placeholder="Value..."
                      type={item[0].toLowerCase().includes('password') ? 'password' : 'text'}
                    />
                  </FormGroup>
                  
                  <RemoveButton onClick={() => removeConfigItem(index)} type="button">
                    ×
                  </RemoveButton>
                </ConfigItem>
              ))}
              
              <AddButton onClick={addConfigItem} type="button" variant="secondary" size="sm">
                Add Parameter
              </AddButton>
            </ConfigList>
          </FormSection>

          <ButtonRow>
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !name || (channelType === 'custom' && !customType)}>
              {isLoading ? 'Creating...' : 'Create Channel'}
            </Button>
          </ButtonRow>
        </form>
      </Card>
    </FormContainer>
  );
};

export default ChannelForm;
