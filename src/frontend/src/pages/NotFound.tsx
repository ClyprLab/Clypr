import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-neutral-950 text-neutral-100">
      <div className="text-center max-w-[600px]">
        <div className="text-[120px] font-bold leading-none mb-4 font-mono">404</div>
        <h1 className="text-2xl mb-4">Page Not Found</h1>
        <p className="mb-6 text-neutral-400">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link to="/messages">
            <Button variant="secondary">View Messages</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
