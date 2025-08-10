import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { Link } from 'react-router-dom';

// Global styles for fonts and basic dark mode setup
const GlobalStyle = createGlobalStyle`
  :root {
    --color-background: #0A0A0F;
    --color-primary-accent: #6EE7FF;
    --color-secondary-accent: #A855F7;
    --color-text-primary: #FFFFFF;
    --color-text-secondary: #B3B3C3;

    --font-satoshi: 'Satoshi', sans-serif;
    --font-mono: 'IBM Plex Mono', monospace;
  }

  body {
    margin: 0;
    padding: 0;
    background-color: var(--color-background);
    color: var(--color-text-primary);
    font-family: var(--font-satoshi);
    line-height: 1.6;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-satoshi);
    color: var(--color-text-primary);
  }

  p {
    color: var(--color-text-secondary);
  }

  code {
    font-family: var(--font-mono);
  }

  a {
    color: var(--color-primary-accent);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  overflow-x: hidden;
`;

const Section = styled.section`
  width: 100%;
  max-width: 1200px;
  padding: 80px 24px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (min-width: 768px) {
    padding: 120px 40px;
  }
`;

const HeroSection = styled(Section)`
  min-height: 80vh;
  justify-content: center;
`;

const Headline = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
  max-width: 900px;

  @media (min-width: 768px) {
    font-size: 4.5rem;
  }
`;

const GradientText = styled.span`
  background: linear-gradient(90deg, var(--color-primary-accent), var(--color-secondary-accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;
`;

const Subheadline = styled.p`
  font-size: 1.2rem;
  margin-bottom: 40px;
  max-width: 700px;

  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(90deg, var(--color-primary-accent), var(--color-secondary-accent));
  color: var(--color-background);
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 15px rgba(110, 231, 255, 0.3);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(110, 231, 255, 0.5);
    text-decoration: none;
  }
`;

const ProblemSection = styled(Section)`
  background-color: #0D0D14; /* Slightly lighter dark */
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 60px;

  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const ProblemText = styled.p`
  font-size: 1.1rem;
  max-width: 800px;
  margin-bottom: 30px;
`;

const SolutionSection = styled(Section)`
  background-color: var(--color-background);
`;

const SolutionText = styled.p`
  font-size: 1.1rem;
  max-width: 800px;
`;

const HowItWorksSection = styled(Section)`
  background-color: #0D0D14; /* Slightly lighter dark */
`;

const HowItWorksGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  margin-top: 40px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
`;

const StepCard = styled.div`
  background-color: var(--color-background);
  padding: 30px;
  border-radius: 10px;
  border: 1px solid #1A1A25;
  text-align: left;
`;

const StepNumber = styled.div`
  font-family: var(--font-mono);
  font-size: 2rem;
  color: var(--color-primary-accent);
  margin-bottom: 15px;
`;

const StepTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 10px;
`;

const StepDescription = styled.p`
  font-size: 1rem;
`;

const CodeBlock = styled.pre`
  background-color: #1A1A25;
  color: #EAEAEA;
  font-family: var(--font-mono);
  padding: 20px;
  border-radius: 8px;
  overflow-x: auto;
  text-align: left;
  margin-top: 30px;
  font-size: 0.9rem;
  width: calc(100% - 40px);
`;

const BenefitsSection = styled(Section)`
  background-color: var(--color-background);
`;

const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  margin-top: 40px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
`;

const BenefitCard = styled.div`
  background-color: #0D0D14;
  padding: 30px;
  border-radius: 10px;
  border: 1px solid #1A1A25;
  text-align: left;
`;

const BenefitTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 10px;
`;

const BenefitDescription = styled.p`
  font-size: 1rem;
`;

const UseCasesSection = styled(Section)`
  background-color: #0D0D14; /* Slightly lighter dark */
`;

const UseCasesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  margin-top: 40px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
`;

const UseCaseCard = styled(BenefitCard)`
  /* Inherits styling from BenefitCard */
`;

const VisionSection = styled(Section)`
  background-color: var(--color-background);
`;

const VisionText = styled.p`
  font-size: 1.1rem;
  max-width: 800px;
`;

const FinalCTASection = styled(Section)`
  background: linear-gradient(135deg, #0D0D14 0%, #0A0A0F 100%);
  padding: 80px 24px 100px;
`;

const FinalCTATitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 40px;

  @media (min-width: 768px) {
    font-size: 3.5rem;
  }
`;


const Footer = styled.footer`
  width: 100%;
  padding: 40px 24px;
  background-color: #0A0A0F;
  text-align: center;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  border-top: 1px solid #1A1A25;
`;


const Landing: React.FC = () => {
  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <HeroSection>
          <Headline>
            Your <GradientText>Private, Programmable</GradientText> Communication Layer for Web3
          </Headline>
          <Subheadline>
            Enable secure, verifiable, and direct communication with your users, without compromising on privacy or control. Built for the decentralized future.
          </Subheadline>
          <CTAButton to="/login">Get Started with Clypr</CTAButton>
        </HeroSection>

        <ProblemSection>
          <SectionTitle>The Challenge: Reaching Your Users in a Decentralized World</SectionTitle>
          <ProblemText>
            You've built a groundbreaking dApp, a vibrant community, or a critical protocol. Now, how do you reliably communicate with your users? Traditional methods like email are centralized and leak data. Relying solely on on-chain events is limiting. Building custom, secure messaging is a massive undertaking, prone to vulnerabilities and complex identity management.
          </ProblemText>
          <ProblemText>
             The cost of ineffective communication isn't just missed updates. It's fragmented communities, frustrated users, and compromised security. Your users deserve direct contact, but they also demand privacy and control over their identity. How do you bridge this gap without becoming a central point of failure or a data liability?
          </ProblemText>
        </ProblemSection>

        <SolutionSection>
          <SectionTitle>Clypr: The Bridge Between Your dApp and Your Users</SectionTitle>
          <SolutionText>
            Clypr is a decentralized communication layer designed specifically for Web3. It’s not another inbox. It's a privacy-preserving gateway that allows your dApp to send structured, verifiable messages directly to a user's self-sovereign communication agent, bypassing centralized servers and complex identity systems. Think of it as a programmable post office box for the decentralized web.
          </SolutionText>
        </SolutionSection>

        <HowItWorksSection>
          <SectionTitle>How It Works: Simple Integration, Powerful Routing</SectionTitle>
          <HowItWorksGrid>
            <StepCard>
              <StepNumber>1</StepNumber>
              <StepTitle>Send a Single Payload</StepTitle>
              <StepDescription>
                Your dApp crafts a single, structured message payload using the Clypr API. No need to manage complex user addresses or network specifics.
                <CodeBlock>
{`clypr.sendMessage({
    recipientUsername: "user_agent_username",
    messageType: "notification.governance.proposal",
    content: {
        title: "New Proposal Available",
        body: "A new governance proposal has been submitted. View details and vote now.",
        priority: 5,
        metadata: [["proposalId", "xyz123"], ["link", "dapp.com/proposal/xyz123"]]
    }
});`}
                </CodeBlock>
              </StepDescription>
            </StepCard>
            <StepCard>
              <StepNumber>2</StepNumber>
              <StepTitle>Clypr Routes Securely</StepTitle>
              <StepDescription>
                Clypr's decentralized network encrypts the payload end-to-end and routes it to the user's Clypr Agent based on their unique, privacy-preserving username. The dApp never sees the user's wallet address or other personal data.
              </StepDescription>
            </StepCard>
            <StepCard>
              <StepNumber>3</StepNumber>
              <StepTitle>User Rules Trigger Actions</StepTitle>
              <StepDescription>
                The user's Clypr Agent receives the encrypted message. Based on the user's pre-defined, programmable rules, the agent decides whether to accept, filter, forward, or block the message. This enables complete spam immunity and personalized delivery.
              </StepDescription>
            </StepCard>
          </HowItWorksGrid>
        </HowItWorksSection>

        <BenefitsSection>
          <SectionTitle>Outcomes, Not Just Features</SectionTitle>
          <BenefitsGrid>
            <BenefitCard>
              <BenefitTitle>Enhanced User Trust</BenefitTitle>
              <BenefitDescription>
                Users communicate directly with your dApp without sharing sensitive data like email or wallet addresses, fostering a foundation of trust.
              </BenefitDescription>
            </BenefitCard>
            <BenefitCard>
              <BenefitTitle>Spam & Phishing Immunity</BenefitTitle>
              <BenefitDescription>
                Users define strict rules for who can contact them and under what conditions, effectively eliminating unwanted messages and reducing phishing vectors.
              </BenefitDescription>
            </BenefitCard>
            <BenefitCard>
              <BenefitTitle>Simplified Development</BenefitTitle>
              <BenefitDescription>
                Integrate secure, programmable communication with a minimal API. Focus on your core dApp logic, not complex messaging infrastructure.
              </BenefitDescription>
            </BenefitCard>
            <BenefitCard>
              <BenefitTitle>Persistent Identity</BenefitTitle>
              <BenefitDescription>
                Users can update their underlying contact methods (e.g., move wallets, change notification endpoints) without your dApp needing to update any records.
              </BenefitDescription>
            </BenefitCard>
            <BenefitCard>
              <BenefitTitle>Decentralization Native</BenefitTitle>
              <BenefitDescription>
                Built on the Internet Computer Protocol, Clypr offers inherent security, resilience, and censorship resistance without a central gatekeeper.
              </BenefitDescription>
            </BenefitCard>
            <BenefitCard>
              <BenefitTitle>Future-Proof Flexibility</BenefitTitle>
              <BenefitDescription>
                Designed API-first for easy integration and planned expansion to support two-way communication and multiple blockchains.
              </BenefitDescription>
            </BenefitCard>
          </BenefitsGrid>
        </BenefitsSection>

        <UseCasesSection>
            <SectionTitle>Where Clypr Transforms Communication</SectionTitle>
            <UseCasesGrid>
                <UseCaseCard>
                    <BenefitTitle>Decentralized Governance Notifications</BenefitTitle>
                    <BenefitDescription>Alert users instantly and securely about new proposals, voting deadlines, and proposal outcomes without revealing their identity.</BenefitDescription>
                </UseCaseCard>
                <UseCaseCard>
                    <BenefitTitle>dApp Critical Alerts</BenefitTitle>
                    <BenefitDescription>Send high-priority alerts about security events, platform upgrades, or critical account activity directly to the user's agent.</BenefitDescription>
                </UseCaseCard>
                <UseCaseCard>
                    <BenefitTitle>NFT & Digital Asset Updates</BenefitTitle>
                    <BenefitDescription>Notify collectors about drops, auctions, or changes related to their digital assets with privacy and verifiable origin.</BenefitDescription>
                </UseCaseCard>
                 <UseCaseCard>
                    <BenefitTitle>Web3 Community Engagement</BenefitTitle>
                    <BenefitDescription>Provide structured updates, event invitations, or personalized messages based on user roles or activity, controlled by user rules.</BenefitDescription>
                </UseCaseCard>
            </UseCasesGrid>
        </UseCasesSection>

        <VisionSection>
            <SectionTitle>Why It Matters: Reclaiming Digital Connection</SectionTitle>
            <VisionText>
                We believe that in a truly decentralized web, users should own their identity and control who can reach them. Communication shouldn't require sacrificing privacy or being tied to centralized platforms. Clypr is our step towards this future – a persistent, private, chain-agnostic point of contact between you and the decentralized applications you interact with. We're building the infrastructure for trust and direct connection in Web3.
            </VisionText>
        </VisionSection>

        <FinalCTASection>
            <FinalCTATitle>Ready to Build Trust with Your Users?</FinalCTATitle>
             <Subheadline style={{ marginBottom: '40px' }}>
                 Explore how Clypr can simplify your dApp's communication and give your users the privacy and control they deserve.
            </Subheadline>
            <CTAButton to="/login">Start Building with Clypr</CTAButton>
        </FinalCTASection>

        <Footer>
            © {new Date().getFullYear()} Clypr. All rights reserved.
        </Footer>
      </PageContainer>
    </>
  );
};

export default Landing;