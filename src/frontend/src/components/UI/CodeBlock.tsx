import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-python';
import { Copy, Check } from 'lucide-react';

interface CodeBlockProps {
  children: string;
  language?: string;
  className?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ children, language = 'javascript', className = '' }) => {
  const codeRef = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [children, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className={`bg-[#0C0D14] border border-white/10 rounded-lg overflow-hidden ${className}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-[#0C0D14]/50 border-b border-white/5">
        <span className="text-xs text-zinc-400 uppercase tracking-wide font-medium">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-2 py-1 text-xs text-zinc-400 hover:text-white transition-colors rounded"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-mono">
          <code ref={codeRef} className={`language-${language}`}>
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;
