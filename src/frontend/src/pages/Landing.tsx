import React from 'react';
import FlowchartImg from '../assets/Clypr Web3 Privacy Flowchart.png';
import styled from 'styled-components';

// Styled image with hover shadow, border radius, and transition
const StyledFlowchartImg = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: box-shadow 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1);

  &:hover {
    box-shadow: 0 8px 48px rgba(0,0,0,0.38);
    transform: scale(1.03);
    cursor: pointer;
  }
`;
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';
import Text from '../components/UI/Text';

const LandingContainer = styled.div`
  min-height: 100vh;
  background-color: var(--color-background);
  color: var(--color-text);
  position: relative;
`;

const MobileMenuOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  opacity: ${props => (props as any).$isOpen ? 1 : 0};
  visibility: ${props => (props as any).$isOpen ? 'visible' : 'hidden'};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  backdrop-filter: blur(2px);
  
  @media (min-width: 768px) {
    display: none;
  }
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

const MobileMenuButton = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 20px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 10px;
  margin: -10px;
  z-index: 110;
  position: relative;
  
  &:focus {
    outline: none;
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const MenuLine = styled.span`
  width: 100%;
  height: 2px;
  background-color: var(--color-text);
  transition: all 0.3s ease;
  transform-origin: center;
  
  &:first-child {
    transform: ${props => (props as any).$isOpen ? 'rotate(45deg) translate(6px, 6px)' : 'rotate(0)'};
  }
  
  &:nth-child(2) {
    opacity: ${props => (props as any).$isOpen ? 0 : 1};
  }
  
  &:last-child {
    transform: ${props => (props as any).$isOpen ? 'rotate(-45deg) translate(6px, -6px)' : 'rotate(0)'};
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 100%;
  height: 100vh;
  background-color: var(--color-background);
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 80px 24px 40px;
  transform: ${props => (props as any).$isOpen ? 'translateX(0)' : 'translateX(100%)'};
  transition: transform 0.3s ease-in-out;
  box-shadow: ${props => (props as any).$isOpen ? '-5px 0 15px rgba(0, 0, 0, 0.1)' : 'none'};
  
  & > * {
    opacity: ${props => (props as any).$isOpen ? 1 : 0};
    transform: ${props => (props as any).$isOpen ? 'translateY(0)' : 'translateY(20px)'};
    transition: opacity 0.4s ease, transform 0.4s ease;
    transition-delay: ${props => (props as any).$isOpen ? '0.2s' : '0s'};
  }
  
  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileNavLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
  align-items: center;
  margin-top: var(--space-8);
`;

const MobileNavLink = styled(NavLink)`
  font-size: var(--font-size-lg);
  padding: var(--space-3);
  position: relative;
  
  &:after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background-color: var(--color-text);
    transition: width 0.3s ease, left 0.3s ease;
  }
  
  &:hover:after {
    width: 100%;
    left: 0;
  }
`;

const MobileLogo = styled.div`
  position: absolute;
  top: var(--space-6);
  left: var(--space-6);
  display: flex;
  align-items: center;
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

const Landing = () => {
  // Use type assertion to workaround TypeScript errors
  const [mobileMenuOpen, setMobileMenuOpen] = (React as any).useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when clicking a link
  const handleMobileNavLinkClick = () => {
    setMobileMenuOpen(false);
  };
  
  // Prevent body scroll when mobile menu is open
  (React as any).useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <LandingContainer>
      <MobileMenuOverlay 
        $isOpen={mobileMenuOpen} 
        onClick={() => setMobileMenuOpen(false)} 
      />
      
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
        
        <MobileMenuButton onClick={toggleMobileMenu} aria-label="Toggle mobile menu">
          <MenuLine $isOpen={mobileMenuOpen} />
          <MenuLine $isOpen={mobileMenuOpen} />
          <MenuLine $isOpen={mobileMenuOpen} />
        </MobileMenuButton>
        
        <MobileMenu $isOpen={mobileMenuOpen}>
          <MobileLogo>
            <LogoIcon>C</LogoIcon>
            <LogoText>clypr</LogoText>
          </MobileLogo>
          <MobileNavLinks>
            <MobileNavLink href="#features" onClick={handleMobileNavLinkClick}>Features</MobileNavLink>
            <MobileNavLink href="#how-it-works" onClick={handleMobileNavLinkClick}>How It Works</MobileNavLink>
            <MobileNavLink href="#developers" onClick={handleMobileNavLinkClick}>Developers</MobileNavLink>
            <Link to="/login" style={{ textDecoration: 'none' }} onClick={handleMobileNavLinkClick}>
              <Button variant="primary" size="lg">Sign In</Button>
            </Link>
          </MobileNavLinks>
        </MobileMenu>
      </NavBar>
      
      <Hero>
        <HeroContent>
          <HeadlineLarge>
            Your <span>Private Communication</span> Gateway
          </HeadlineLarge>
          <SubHeadline>
            Take control of your digital communications with intelligent filtering, automated routing, and complete privacy. Built on the Internet Computer for true decentralization.
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
            <StyledFlowchartImg src={FlowchartImg} alt="Clypr Web3 Privacy Flow Chart" />
          </HeroImage>
        </HeroImageContainer>
      </Hero>
      
      <Features id="features">
        <FeatureContainer>
          <SectionTitle>Smart Privacy, Simplified</SectionTitle>
          <FeatureGrid>
            <FeatureCard>
              <FeatureIcon>🔒</FeatureIcon>
              <FeatureTitle>Complete Privacy Control</FeatureTitle>
              <FeatureDesc>
                Your data stays yours. Messages are encrypted and you decide exactly who can access what, when, and how.
              </FeatureDesc>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>⚙️</FeatureIcon>
              <FeatureTitle>Intelligent Message Routing</FeatureTitle>
              <FeatureDesc>
                Set up smart rules that automatically sort, forward, or block messages based on content, sender, or priority.
              </FeatureDesc>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🌐</FeatureIcon>
              <FeatureTitle>True Decentralization</FeatureTitle>
              <FeatureDesc>
                Built on the Internet Computer Protocol for unmatched security, reliability, and zero single points of failure.
              </FeatureDesc>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🔌</FeatureIcon>
              <FeatureTitle>Easy Integration</FeatureTitle>
              <FeatureDesc>
                Connect seamlessly with your existing apps through our simple API and webhook system.
              </FeatureDesc>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>📊</FeatureIcon>
              <FeatureTitle>Privacy-First Analytics</FeatureTitle>
              <FeatureDesc>
                Get insights into your message flow and patterns while keeping your data completely private.
              </FeatureDesc>
            </FeatureCard>
            
            <FeatureCard>
              <FeatureIcon>🚀</FeatureIcon>
              <FeatureTitle>Built to Scale</FeatureTitle>
              <FeatureDesc>
                Handle millions of messages with lightning-fast speed, ensuring your communications never slow down.
              </FeatureDesc>
            </FeatureCard>
          </FeatureGrid>
        </FeatureContainer>
      </Features>
      
      <HowItWorks id="how-it-works">
        <SectionTitle>How It Works</SectionTitle>
        <StepsContainer>
          <Step>
            <StepNumber>1</StepNumber>
            <StepTitle>Connect & Authenticate</StepTitle>
            <StepDesc>
              Sign in with Internet Identity and set up your personal communication gateway in seconds.
            </StepDesc>
          </Step>
          
          <Step>
            <StepNumber>2</StepNumber>
            <StepTitle>Set Your Rules</StepTitle>
            <StepDesc>
              Create smart filters and rules to automatically sort, forward, or block messages based on your preferences.
            </StepDesc>
          </Step>
          
          <Step>
            <StepNumber>3</StepNumber>
            <StepTitle>Take Control</StepTitle>
            <StepDesc>
              Your messages flow through your private gateway with complete transparency and control over every interaction.
            </StepDesc>
          </Step>
        </StepsContainer>
      </HowItWorks>
      
      <CTASection id="developers">
        <CTAContainer>
          <CTATitle>Ready to Take Control?</CTATitle>
          <CTAText>
            Whether you're a developer building the next big Web3 app or just want better control over your digital communications, Clypr gives you the tools you need.
          </CTAText>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="lg">Start Your Free Gateway</Button>
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
              Clypr is your personal privacy gateway for Web3 communications, built on the Internet Computer Protocol for true decentralization.
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
