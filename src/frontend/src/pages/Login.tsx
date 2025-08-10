import React from 'react';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/app/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
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
            <h1 className="font-mono text-2xl font-bold m-0">clypr</h1>
          </div>
          <p className="text-center text-neutral-400 mb-6">
            Control your communications with intelligent privacy rules
          </p>
          
          <Button fullWidth onClick={handleLogin}>
            Login with Local Internet Identity
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
