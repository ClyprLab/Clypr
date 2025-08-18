import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, 
  ArrowLeft, 
  Search, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center">
      <div className="relative">
        {/* Background Effects */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(800px_500px_at_20%_-10%,rgba(56,189,248,0.18),rgba(10,10,15,0)),radial-gradient(800px_500px_at_90%_0%,rgba(217,70,239,0.18),rgba(10,10,15,0))]" />
        
        <div className="text-center max-w-2xl mx-auto px-6">
          {/* Icon */}
          <div className="mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-fuchsia-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-12 w-12 text-cyan-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-cyan-400 to-fuchsia-500 rounded-full flex items-center justify-center">
                <span className="text-[#0A0A0F] text-sm font-bold">404</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <h1 className="text-6xl font-bold text-white mb-6">
            Page Not Found
          </h1>
          
          <p className="text-xl text-zinc-300 mb-8 max-w-lg mx-auto">
            The page you're looking for doesn't exist or has been moved. 
            Let's get you back on track to building the future of Web3 communication.
          </p>

          {/* Search Suggestion */}
          <div className="mb-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur">
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-5 w-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-white">Looking for something specific?</h3>
              </div>
              <p className="text-zinc-400 text-sm mb-4">
                Try searching for documentation, pricing, or check out our main features.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link to="/docs">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-sm border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">
                    Documentation
                  </span>
                </Link>
                <Link to="/pricing">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-sm border border-fuchsia-500/30 hover:bg-fuchsia-500/30 transition-colors">
                    Pricing
                  </span>
                </Link>
                <Link to="/">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 text-white text-sm border border-white/20 hover:bg-white/20 transition-colors">
                    Home
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <button className="inline-flex items-center rounded-lg bg-gradient-to-r from-cyan-400 to-fuchsia-500 px-6 py-3 text-base font-medium text-[#0A0A0F] hover:opacity-90 transition-all hover:scale-105 duration-300">
                <Home className="mr-2 h-5 w-5" />
                Go Home
              </button>
            </Link>
            
            <button 
              onClick={() => window.history.back()}
              className="inline-flex items-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-base font-medium text-white hover:bg-white/10 transition-all duration-300"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-white/5">
            <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>Built on Internet Computer Protocol</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
