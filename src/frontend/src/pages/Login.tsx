import React from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClypr } from '../hooks/useClypr';

const Login = () => {
  const { login, isAuthenticated, authReady } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { aliasChecked, hasAlias, checkMyAlias } = useClypr();
  // preserved redirect path (if Layout redirected to login); fallback to sessionStorage to survive external redirects
  const redirectTo = (location.state as any)?.from || sessionStorage.getItem('clypr.postLoginRedirect') || '/app/dashboard';
  
  React.useEffect(() => {
    if (isAuthenticated) {
      // ensure alias status is checked
      checkMyAlias();
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    // Wait for auth to be initialized and alias check to complete before navigating
    if (!authReady) return;
    if (!isAuthenticated || !aliasChecked) return;

    // Clear stored redirect now that we're about to navigate
    try { sessionStorage.removeItem('clypr.postLoginRedirect'); } catch (e) {}

    if (hasAlias) {
      navigate(redirectTo);
    } else {
      // pass redirectTo so ClaimAlias can return the user to intended page
      navigate('/claim-alias', { state: { from: redirectTo } });
    }
  }, [authReady, isAuthenticated, aliasChecked, hasAlias, navigate, redirectTo]);
  
  const handleLogin = async () => {
    await login();
  };
  
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6">
      <div className="w-full max-w-[440px]">
        <Card padding="lg">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-neutral-100 text-neutral-900 rounded-md mx-auto mb-4 flex items-center justify-center font-mono font-bold text-xl">
              C
            </div>
           <span className="text-xl uppercase tracking-[0.18em] text-zinc-300 font-bold group-hover:text-white transition-colors">clypr</span>
          </div>
          <p className="text-center text-neutral-400 mb-6">
            Control your communications with intelligent privacy rules
          </p>
          
          <Button fullWidth onClick={handleLogin}>
            Login with Internet Identity
          </Button>
          
          <p className="text-center mt-6 text-sm text-neutral-400">
            By logging in, you agree to our Privacy Policy and Terms of Service.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
