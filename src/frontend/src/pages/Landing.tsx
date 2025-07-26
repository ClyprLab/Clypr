import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';
import Text from '../components/UI/Text';

const LandingContainer = styled.div`
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
`;

const NavBar = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-4);
  max-width: 1200px;
  margin: 0 auto;
  
  @media (min-width: 768px) {
    padding: var(--space-6) var(--space-10);
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
`;

const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  background-color: var(--color-text);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-family: var(--font-mono);
  font-size: var(--font-size-md);
  margin-right: var(--space-2);
`;

const LogoText = styled.h1`
  font-family: var(--font-mono);
  font-size: var(--font-size-xl);
  font-weight: 700;
  margin: 0;
`;

const NavLinks = styled.div`
  display: none;
  gap: var(--space-6);
  align-items: center;
  
  @media (min-width: 768px) {
    display: flex;
  }
`;

const NavLink = styled.a`
  font-size: var(--font-size-sm);
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Hero = styled.section`
  padding: var(--space-12) var(--space-6) var(--space-16);
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  
  @media (min-width: 768px) {
    display: flex;
    text-align: left;
    align-items: center;
    gap: var(--space-10);
    padding: var(--space-16) var(--space-10);
  }
`;

const HeroContent = styled.div`
  @media (min-width: 768px) {
    flex: 1;
  }
`;

const HeroImageContainer = styled.div`
  margin-top: var(--space-8);
  
  @media (min-width: 768px) {
    flex: 1;
    margin-top: 0;
  }
`;

const HeroImage = styled.div`
  background: linear-gradient(135deg, #2D3748 0%, #1A202C 100%);
  border-radius: var(--radius-lg);
  aspect-ratio: 16/9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-xl);
  font-family: var(--font-mono);
`;

const HeadlineLarge = styled.h2`
  font-size: var(--font-size-4xl);
  font-weight: 700;
  margin-bottom: var(--space-4);
  line-height: 1.2;
  
  @media (min-width: 768px) {
    font-size: 3rem;
  }
  
  span {
    background: linear-gradient(90deg, #000000 0%, #333333 100%);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    font-weight: 800;
  }
`;

const SubHeadline = styled.p`
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-8);
  line-height: 1.6;
  max-width: 600px;
  
  @media (min-width: 768px) {
    font-size: var(--font-size-xl);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: var(--space-4);
  flex-wrap: wrap;
  justify-content: center;
  
  @media (min-width: 768px) {
    justify-content: flex-start;
  }
`;

const Features = styled.section`
  background-color: #F8F9FA;
  padding: var(--space-16) var(--space-6);
`;

const FeatureContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h3`
  font-size: var(--font-size-2xl);
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--space-12);
`;

const FeatureGrid = styled.div`
  display: grid;
  gap: var(--space-8);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled.div`
  background-color: white;
  border-radius: var(--radius-md);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
`;

const FeatureIcon = styled.div`
  width: 48px;
  height: 48px;
  background-color: #E8F5E9;
  color: #388E3C;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  margin-bottom: var(--space-4);
`;

const FeatureTitle = styled.h4`
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--space-2);
`;

const FeatureDesc = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.6;
`;

const HowItWorks = styled.section`
  padding: var(--space-16) var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
`;

const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  margin-top: var(--space-10);
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const Step = styled.div`
  flex: 1;
  text-align: center;
`;

const StepNumber = styled.div`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  background-color: var(--color-text);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: 700;
  margin: 0 auto var(--space-4);
`;

const StepTitle = styled.h4`
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin-bottom: var(--space-3);
`;

const StepDesc = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 300px;
  margin: 0 auto;
`;

const CTASection = styled.section`
  background: linear-gradient(135deg, #000000 0%, #333333 100%);
  color: white;
  padding: var(--space-16) var(--space-6);
  text-align: center;
`;

const CTAContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const CTATitle = styled.h3`
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin-bottom: var(--space-6);
`;

const CTAText = styled.p`
  font-size: var(--font-size-lg);
  margin-bottom: var(--space-8);
  opacity: 0.9;
  line-height: 1.6;
`;

const Footer = styled.footer`
  background-color: var(--color-background);
  padding: var(--space-10) var(--space-6);
  font-size: var(--font-size-sm);
`;

const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

const FooterColumn = styled.div`
  flex: 1;
`;

const FooterLogo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: var(--space-4);
`;

const FooterLogoIcon = styled.div`
  width: 24px;
  height: 24px;
  background-color: var(--color-text);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  margin-right: var(--space-2);
`;

const FooterLogoText = styled.div`
  font-family: var(--font-mono);
  font-size: var(--font-size-md);
  font-weight: 700;
`;

const FooterDesc = styled.p`
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin-bottom: var(--space-4);
`;

const FooterTitle = styled.h5`
  font-weight: 600;
  margin-bottom: var(--space-4);
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li`
  margin-bottom: var(--space-2);
  
  a {
    color: var(--color-text-secondary);
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  max-width: 1200px;
  margin: var(--space-6) auto 0;
`;

const Landing: React.FC = () => {
  return (
    <LandingContainer>
      <NavBar>
        <Logo>
          <LogoIcon>C</LogoIcon>
          <LogoText>clypr</LogoText>
        </Logo>
        <NavLinks>
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how-it-works">How It Works</NavLink>
          <NavLink href="#developers">Developers</NavLink>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary">Sign In</Button>
          </Link>
        </NavLinks>
      </NavBar>
      
      <Hero>
        <HeroContent>
          <HeadlineLarge>
            The <span>Privacy Gateway</span> for Web3 Communication
          </HeadlineLarge>
          <SubHeadline>
            Clypr enables privacy-first messaging and data control with programmable rules, all built on the Internet Computer Protocol.
          </SubHeadline>
          <ButtonGroup>
            <Link to="/login" style={{ textDecoration: 'none' }}>
              <Button variant="primary" size="lg">Get Started</Button>
            </Link>
            <Button variant="secondary" size="lg" as="a" href="#how-it-works">
              Learn More
            </Button>
          </ButtonGroup>
        </HeroContent>
        <HeroImageContainer>
          <HeroImage>
            [Clypr Architecture Visualization]
          </HeroImage>
        </HeroImageContainer>
      </Hero>
      
      <Features id="features">
        <FeatureContainer>
          <SectionTitle>Privacy and Control, Made Simple</SectionTitle>
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>🔒</FeatureIcon>
              <FeatureTitle>End-to-End Privacy</FeatureTitle>
              <FeatureDesc>
                Your data never leaves your control. Messages are encrypted and only you decide who can access them.
              </FeatureDesc>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>⚙️</FeatureIcon>
              <FeatureTitle>Rule-Based Filtering</FeatureTitle>
              <FeatureDesc>
                Create sophisticated rules to automatically process, forward, or block messages based on content or source.
              </FeatureDesc>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🌐</FeatureIcon>
              <FeatureTitle>Web3 Native</FeatureTitle>
              <FeatureDesc>
                Built on the Internet Computer, offering decentralized security and eliminating single points of failure.
              </FeatureDesc>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🔌</FeatureIcon>
              <FeatureTitle>API Integration</FeatureTitle>
              <FeatureDesc>
                Seamlessly integrate with your existing applications through our comprehensive API and webhooks.
              </FeatureDesc>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>📊</FeatureIcon>
              <FeatureTitle>Analytics & Insights</FeatureTitle>
              <FeatureDesc>
                Monitor your message flow with detailed analytics while maintaining complete privacy.
              </FeatureDesc>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🚀</FeatureIcon>
              <FeatureTitle>Scalable Architecture</FeatureTitle>
              <FeatureDesc>
                Handle millions of messages with low latency, ensuring your communications never skip a beat.
              </FeatureDesc>
            </FeatureCard>
          </FeatureGrid>
        </FeatureContainer>
      </Features>
      
      <HowItWorks id="how-it-works">
        <SectionTitle>How Clypr Works</SectionTitle>
        <StepsContainer>
          <Step>
            <StepNumber>1</StepNumber>
            <StepTitle>Connect</StepTitle>
            <StepDesc>
              Authenticate with Internet Identity or another Web3 wallet and set up your personal relay.
            </StepDesc>
          </Step>
          
          <Step>
            <StepNumber>2</StepNumber>
            <StepTitle>Configure</StepTitle>
            <StepDesc>
              Create custom rules and filters to determine how your messages should be processed and routed.
            </StepDesc>
          </Step>
          
          <Step>
            <StepNumber>3</StepNumber>
            <StepTitle>Control</StepTitle>
            <StepDesc>
              Receive, filter, and forward messages through your private gateway with complete control and transparency.
            </StepDesc>
          </Step>
        </StepsContainer>
      </HowItWorks>
      
      <CTASection id="developers">
        <CTAContainer>
          <CTATitle>Ready to Take Control of Your Communications?</CTATitle>
          <CTAText>
            Whether you're a developer building the next Web3 application or an organization seeking enhanced privacy and control over your communications, Clypr provides the infrastructure you need.
          </CTAText>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">Create Your Clypr Gateway</Button>
          </Link>
        </CTAContainer>
      </CTASection>
      
      <Footer>
        <FooterContainer>
          <FooterColumn>
            <FooterLogo>
              <FooterLogoIcon>C</FooterLogoIcon>
              <FooterLogoText>clypr</FooterLogoText>
            </FooterLogo>
            <FooterDesc>
              Clypr is a programmable privacy gateway for Web3 messaging built on the Internet Computer Protocol (ICP).
            </FooterDesc>
          </FooterColumn>
          
          <FooterColumn>
            <FooterTitle>Product</FooterTitle>
            <FooterLinks>
              <FooterLink><a href="#features">Features</a></FooterLink>
              <FooterLink><a href="#how-it-works">How It Works</a></FooterLink>
              <FooterLink><a href="#">Use Cases</a></FooterLink>
              <FooterLink><a href="#">Pricing</a></FooterLink>
            </FooterLinks>
          </FooterColumn>
          
          <FooterColumn>
            <FooterTitle>Resources</FooterTitle>
            <FooterLinks>
              <FooterLink><a href="#">Documentation</a></FooterLink>
              <FooterLink><a href="#">API Reference</a></FooterLink>
              <FooterLink><a href="#">Tutorials</a></FooterLink>
              <FooterLink><a href="#">GitHub</a></FooterLink>
            </FooterLinks>
          </FooterColumn>
          
          <FooterColumn>
            <FooterTitle>Company</FooterTitle>
            <FooterLinks>
              <FooterLink><a href="#">About Us</a></FooterLink>
              <FooterLink><a href="#">Blog</a></FooterLink>
              <FooterLink><a href="#">Careers</a></FooterLink>
              <FooterLink><a href="#">Contact</a></FooterLink>
            </FooterLinks>
          </FooterColumn>
        </FooterContainer>
        
        <Copyright>
          &copy; {new Date().getFullYear()} Clypr. All rights reserved.
        </Copyright>
      </Footer>
    </LandingContainer>
  );
};

export default Landing;
