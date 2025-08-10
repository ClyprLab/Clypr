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
  max-width: 1000px;

  @media (min-width: 768px) {
    font-size: 4.2rem;
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
  max-width: 860px;

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

const Muted = styled.span`
  color: var(--color-text-secondary);
`;

const ProblemSection = styled(Section)`
  background-color: #0D0D14;
`;

const SectionTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 700;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    font-size: 3rem;
  }
`;

const SectionLead = styled.p`
  max-width: 900px;
  font-size: 1.15rem;
`;

const Paragraph = styled.p`
  max-width: 900px;
  font-size: 1.05rem;
`;

const SolutionSection = styled(Section)`
  background-color: var(--color-background);
`;

const HowItWorksSection = styled(Section)`
  background-color: #0D0D14;
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
  font-size: 1.4rem;
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
  margin-top: 20px;
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
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 10px;
`;

const BenefitDescription = styled.p`
  font-size: 1rem;
`;

const UseCasesSection = styled(Section)`
  background-color: #0D0D14;
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

const UseCaseCard = styled(BenefitCard)``;

const VisionSection = styled(Section)`
  background-color: var(--color-background);
`;

const VisionText = styled.p`
  font-size: 1.1rem;
  max-width: 900px;
`;

const DemoSection = styled(Section)`
  background-color: #0D0D14;
`;

const FinalCTASection = styled(Section)`
  background: linear-gradient(135deg, #0D0D14 0%, #0A0A0F 100%);
  padding: 80px 24px 100px;
`;

const FinalCTATitle = styled.h2`
  font-size: 2.6rem;
  font-weight: 700;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    font-size: 3.4rem;
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
        {/* Hero */}
        <HeroSection>
          <Headline>
            Direct, private contact with your users — <GradientText>without addresses</GradientText>
          </Headline>
          <Subheadline>
            Clypr is a decentralized, programmable communication layer for Web3 teams. Send a single, verifiable payload and let your users’ agents decide how and where it’s delivered.
          </Subheadline>
          <CTAButton to="/login">Get Started with Clypr</CTAButton>
        </HeroSection>

        {/* Problem */}
        <ProblemSection>
          <SectionTitle>The problem you can feel</SectionTitle>
          <SectionLead>
            You can ship features. You can ship tokens. What you can’t reliably ship is a message. Email leaks identity. Wallet inboxes are fragmented. On-chain events don’t reach humans.
          </SectionLead>
          <Paragraph>
            So teams blast Telegram. Users miss votes. Security notices arrive late. Community trust erodes. The cost of poor communication isn’t abstract—it’s stalled governance, confused users, and preventable exploits.
          </Paragraph>
        </ProblemSection>

        {/* Turning Point */}
        <SolutionSection>
          <SectionTitle>The turning point</SectionTitle>
          <SectionLead>
            We realized the problem wasn’t “messaging.” It was addresses. Every system asked the sender to know where and how to reach a user. That’s backwards.
          </SectionLead>
          <Paragraph>
            Clypr flips the model: developers send one structured payload to a user’s privacy-preserving alias. The user’s agent owns delivery. No exposed emails. No wallet lists to maintain. No central gatekeeper.
          </Paragraph>
        </SolutionSection>

        {/* Solution Definition */}
        <SolutionSection>
          <SectionTitle>The solution: Clypr</SectionTitle>
          <SectionLead>
            Clypr is an API-first, decentralized communication layer. DApps send a single payload; users set programmable rules that decide who gets through, when, and where.
          </SectionLead>
          <Paragraph>
            Technical pillars: end-to-end encryption, programmable routing, decentralized delivery, and wallet-linked identity for verification. Built to respect ownership and minimize data exposure.
          </Paragraph>
          <Paragraph>
            Current payload shape (predictable for devs, consistent for users):
          </Paragraph>
          <CodeBlock>{`// processMessage(recipientUsername, messageType, content)
recipientUsername: Text
messageType: Text
content: {
  title: Text,
  body: Text,
  priority: Nat8,
  metadata: [(Text, Text)]
}`}</CodeBlock>
        </SolutionSection>

        {/* How It Works */}
        <HowItWorksSection>
          <SectionTitle>How it works</SectionTitle>
          <HowItWorksGrid>
            <StepCard>
              <StepNumber>1</StepNumber>
              <StepTitle>Send one structured payload</StepTitle>
              <StepDescription>
                Your dApp sends a single, well-defined payload to a user’s alias. No address books, no contact syncing, no guessing the right channel.
                <CodeBlock>{`// JS/TS example
await clypr.processMessage(
  "alice",                     // recipientUsername
  "notification.security",     // messageType
  {
    title: "Rotation Required",
    body: "Rotate your API keys within 24 hours.",
    priority: 9,
    metadata: [["ticket", "#8421"], ["link", "https://app.example.com/keys"]]
  }
);`}</CodeBlock>
              </StepDescription>
            </StepCard>
            <StepCard>
              <StepNumber>2</StepNumber>
              <StepTitle>Rules evaluate, not inboxes</StepTitle>
              <StepDescription>
                The user’s Clypr Agent evaluates sender identity, message type, priority, and metadata against programmable rules—without revealing personal addresses.
              </StepDescription>
            </StepCard>
            <StepCard>
              <StepNumber>3</StepNumber>
              <StepTitle>Decentralized delivery</StepTitle>
              <StepDescription>
                Allowed messages are routed to user-chosen channels (email/SMS/webhook) via decentralized delivery—no central gatekeeper—with verifiable origin tied to wallet-linked identity.
              </StepDescription>
            </StepCard>
          </HowItWorksGrid>
        </HowItWorksSection>

        {/* Benefits tied to outcomes */}
        <BenefitsSection>
          <SectionTitle>Outcomes that compound</SectionTitle>
          <BenefitsGrid>
            <BenefitCard>
              <BenefitTitle>Trust without exposure</BenefitTitle>
              <BenefitDescription>
                Reach users without storing emails, phone numbers, or wallet lists. Users control what’s revealed and to whom.
              </BenefitDescription>
            </BenefitCard>
            <BenefitCard>
              <BenefitTitle>Spam immunity by design</BenefitTitle>
              <BenefitDescription>
                Rules enforce who can contact a user and under what conditions—by sender principal, message type, priority, or metadata.
              </BenefitDescription>
            </BenefitCard>
            <BenefitCard>
              <BenefitTitle>Delivery you can verify</BenefitTitle>
              <BenefitDescription>
                Wallet-linked identity and signed origin make messages attributable without exposing personal contact data.
              </BenefitDescription>
            </BenefitCard>
            <BenefitCard>
              <BenefitTitle>Integrate in minutes</BenefitTitle>
              <BenefitDescription>
                API-first design with one payload shape. Start on ICP today; roadmap includes multichain reach without re-architecting.
              </BenefitDescription>
            </BenefitCard>
            <BenefitCard>
              <BenefitTitle>Contacts that persist</BenefitTitle>
              <BenefitDescription>
                Users can change how they receive messages at any time. Your dApp keeps sending the same payload—no data churn.
              </BenefitDescription>
            </BenefitCard>
          </BenefitsGrid>
        </BenefitsSection>

        {/* Use Cases */}
        <UseCasesSection>
          <SectionTitle>What teams ship with Clypr</SectionTitle>
          <UseCasesGrid>
            <UseCaseCard>
              <BenefitTitle>Governance that actually reaches voters</BenefitTitle>
              <BenefitDescription>
                Notify on proposal creation, quorum risks, and final outcomes with structured, signed messages.
              </BenefitDescription>
            </UseCaseCard>
            <UseCaseCard>
              <BenefitTitle>Security and infrastructure alerts</BenefitTitle>
              <BenefitDescription>
                Critical notices (key rotations, incident updates) delivered under strict allow-lists and elevated priority.
              </BenefitDescription>
            </UseCaseCard>
            <UseCaseCard>
              <BenefitTitle>NFT and asset events</BenefitTitle>
              <BenefitDescription>
                Drops, auctions, or trait-level updates—sent without exposing collector identities.
              </BenefitDescription>
            </UseCaseCard>
            <UseCaseCard>
              <BenefitTitle>Protocol lifecycle updates</BenefitTitle>
              <BenefitDescription>
                Upgrades, deprecations, and breaking changes communicated with predictable payloads and verifiable origin.
              </BenefitDescription>
            </UseCaseCard>
          </UseCasesGrid>
        </UseCasesSection>

        {/* Why It Matters */}
        <VisionSection>
          <SectionTitle>Why it matters</SectionTitle>
          <VisionText>
            Decentralization promised ownership, but communication stayed centralized—addresses, lists, and leaks. Clypr removes the address entirely. A single, private alias stands between your user and the world, with rules that express consent as code. No lock-in. No central mail server. No guessing where people live on-chain.
          </VisionText>
          <VisionText>
            The result is a new primitive for Web3: a chain-agnostic, privacy-preserving point of contact that puts users in control and gives developers a simpler, safer way to reach them.
          </VisionText>
        </VisionSection>

        {/* Demo Invitation */}
        <DemoSection>
          <SectionTitle>See it in action</SectionTitle>
          <SectionLead>
            Explore the live dashboard, create rules, and send your first payload in minutes. If you’re evaluating, follow the project and watch the roadmap unfold.
          </SectionLead>
          <CTAButton to="/login">Open the Demo</CTAButton>
        </DemoSection>

        {/* Final Close */}
        <FinalCTASection>
          <FinalCTATitle>Make contact a product advantage</FinalCTATitle>
          <Subheadline style={{ marginBottom: '28px' }}>
            Ship messages your users want—and nothing they don’t. Private by default. Programmable by design.
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