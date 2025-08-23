import React from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useClypr } from '../hooks/useClypr';
import { 
  Shield, 
  Lock, 
  ArrowRight, 
  Sparkles,
  CheckCircle,
  Loader2
} from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, authReady } = useAuth();
  const [loggingIn, setLoggingIn] = (React as any).useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { aliasChecked, hasAlias, checkMyAlias } = useClypr();
  // preserved redirect path (if Layout redirected to login); fallback to sessionStorage to survive external redirects
  const redirectTo = (location.state as any)?.from || sessionStorage.getItem('clypr.postLoginRedirect') || '/app/dashboard';
  
  (React as any).useEffect(() => {
    if (isAuthenticated) {
      // ensure alias status is checked
      checkMyAlias();
    }
  }, [isAuthenticated]);

  (React as any).useEffect(() => {
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
    try {
      setLoggingIn(true);
      await login();
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setLoggingIn(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-6">
      <div className="relative w-full max-w-md">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(600px_400px_at_50%_50%,rgba(56,189,248,0.1),rgba(10,10,15,0)),radial-gradient(400px_300px_at_80%_20%,rgba(217,70,239,0.1),rgba(10,10,15,0))]" />
        
        <Card className="p-8 border border-white/10 bg-white/5 backdrop-blur">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-[#0A0A0F] rounded-xl mx-auto mb-4 flex items-center justify-center font-mono font-bold text-xl">
              C
            </div>
            <h1 className="text-xl uppercase tracking-[0.18em] text-zinc-300 font-bold mb-2">
              clypr
            </h1>
            <p className="text-zinc-400 text-sm">
              Your privacy-first communication layer
            </p>
          </div>

          {/* Description */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-3">
              Welcome to Clypr
            </h2>
            <p className="text-zinc-300 mb-6">
              Control your communications with intelligent privacy rules. 
              Built on Internet Computer Protocol for true decentralization.
            </p>
          </div>

          {/* Features */}
          <div className="mb-8 space-y-3">
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-green-400" />
              </div>
              <span>Zero-knowledge message processing</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-green-400" />
              </div>
              <span>User-controlled privacy rules</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-zinc-300">
              <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-green-400" />
              </div>
              <span>Multi-channel message routing</span>
            </div>
          </div>
          
          {/* Login Button */}
          <Button 
            fullWidth 
            onClick={handleLogin}
            variant="gradient"
            size="lg"
            className="mb-6"
            disabled={loggingIn}
          >
            <div className="flex items-center gap-2">
              {loggingIn ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Login with Internet Identity
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </div>
          </Button>
          
          {/* Info */}
          <div className="text-center">
            <p className="text-xs text-zinc-400 mb-4">
              By logging in, you agree to our Privacy Policy and Terms of Service.
            </p>
            
            <div className="flex items-center justify-center gap-2 text-xs text-zinc-500">
              <Shield className="h-3 w-3" />
              <span>Built on Internet Computer Protocol</span>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Privacy by design, decentralized by default</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
