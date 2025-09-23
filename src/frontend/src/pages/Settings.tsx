import React, { useState } from 'react';
import styled from 'styled-components';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import Text from '../components/UI/Text';
import Input from '../components/UI/Input';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Header = styled.div`
  margin-bottom: var(--space-6);
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--space-6);
`;

const Tab = styled.button<{ active?: boolean }>`
  padding: var(--space-3) var(--space-4);
  background: none;
  border: none;
  border-bottom: 3px solid ${(props: { active?: boolean }) => props.active ? 'var(--color-text)' : 'transparent'};
  color: ${(props: { active?: boolean }) => props.active ? 'var(--color-text)' : 'var(--color-text-secondary)'};
  font-weight: ${(props: { active?: boolean }) => props.active ? '500' : 'normal'};
  cursor: pointer;
  font-family: var(--font-mono);
  
  &:hover {
    color: var(--color-text);
  }
`;

const FormSection = styled.div`
  margin-bottom: var(--space-8);
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin-bottom: var(--space-4);
`;

const FormGroup = styled.div`
  margin-bottom: var(--space-4);
`;

const Label = styled.label`
  display: block;
  margin-bottom: var(--space-2);
  font-weight: 500;
`;

const Description = styled.p`
  margin-top: var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
`;

const Toggle = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  border-radius: 24px;
  transition: .4s;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: .4s;
  }
  
  ${ToggleInput}:checked + & {
    background-color: var(--color-text);
  }
  
  ${ToggleInput}:checked + &:before {
    transform: translateX(24px);
  }
`;

const FormRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardFooter = styled.div`
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-4);
  margin-top: var(--space-6);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-2);
`;

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  
  return (
    <SettingsContainer>
      <Header>
        <Text as="h1">Settings</Text>
      </Header>
      
      <TabsContainer>
        <Tab active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
          General
        </Tab>
        <Tab active={activeTab === 'privacy'} onClick={() => setActiveTab('privacy')}>
          Privacy
        </Tab>
        <Tab active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
          Security
        </Tab>
        <Tab active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
          Notifications
        </Tab>
        <Tab active={activeTab === 'api'} onClick={() => setActiveTab('api')}>
          API
        </Tab>
      </TabsContainer>
      
      {activeTab === 'general' && (
        <Card>
          <FormSection>
            <SectionTitle>Account Information</SectionTitle>
            <FormGroup>
              <Label htmlFor="display-name">Display Name</Label>
              <Input id="display-name" defaultValue="Privacy Agent" />
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="principal">Internet Identity Principal</Label>
              <Input id="principal" value="x4dc7-bz2sy-6kp2b-dovma-..." readOnly />
              <Description>Your unique Internet Identity principal (read-only)</Description>
            </FormGroup>
          </FormSection>
          
          <FormSection>
            <SectionTitle>Interface Settings</SectionTitle>
            
            <FormGroup>
              <FormRow>
                <div>
                  <Label>Dark Mode</Label>
                  <Description>Switch between light and dark interface themes</Description>
                </div>
                <Toggle>
                  <ToggleInput type="checkbox" />
                  <ToggleSlider />
                </Toggle>
              </FormRow>
            </FormGroup>
            
            <FormGroup>
              <FormRow>
                <div>
                  <Label>Compact View</Label>
                  <Description>Display more content with less spacing</Description>
                </div>
                <Toggle>
                  <ToggleInput type="checkbox" />
                  <ToggleSlider />
                </Toggle>
              </FormRow>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="timezone">Timezone</Label>
              <Input id="timezone" defaultValue="UTC (Coordinated Universal Time)" />
            </FormGroup>
          </FormSection>
          
          <CardFooter>
            <Button variant="secondary">Reset to Defaults</Button>
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>
      )}
      
      {activeTab === 'privacy' && (
        <Card>
          <FormSection>
            <SectionTitle>Privacy Settings</SectionTitle>
            <Text>Privacy settings content will go here</Text>
          </FormSection>
        </Card>
      )}
      
      {activeTab === 'security' && (
        <Card>
          <FormSection>
            <SectionTitle>Security Settings</SectionTitle>
            <Text>Security settings content will go here</Text>
          </FormSection>
        </Card>
      )}
      
      {activeTab === 'notifications' && (
        <Card>
          <FormSection>
            <SectionTitle>Notification Settings</SectionTitle>
            <Text>Notification settings content will go here</Text>
          </FormSection>
        </Card>
      )}
      
      {activeTab === 'api' && (
        <Card>
          <FormSection>
            <SectionTitle>API Configuration</SectionTitle>
            <Text>API settings content will go here</Text>
          </FormSection>
        </Card>
      )}
    </SettingsContainer>
  );
};

export default Settings;
