import React from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useClypr } from '../hooks/useClypr';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { aliasChecked, hasAlias, checkMyAlias } = useClypr();
  
  React.useEffect(() => {
    if (isAuthenticated) {
      // ensure alias status is checked
      checkMyAlias();
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (!isAuthenticated || !aliasChecked) return;
    if (hasAlias) {
      navigate('/app/dashboard');
    } else {
      navigate('/claim-alias');
    }
  }, [isAuthenticated, aliasChecked, hasAlias, navigate]);
  
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
