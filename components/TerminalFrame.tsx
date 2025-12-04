import React from 'react';

interface TerminalFrameProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  loading?: boolean;
}

export const TerminalFrame: React.FC<TerminalFrameProps> = ({ children, title, className = '', loading = false }) => {
  return (
    <div className={`relative border border-[#005f63] bg-[#050a0f]/80 backdrop-blur-sm p-4 ${className}`}>
      {/* Corner Accents */}
      <div className="absolute -top-[1px] -left-[1px] w-4 h-4 border-t-2 border-l-2 border-[#00f3ff]"></div>
      <div className="absolute -top-[1px] -right-[1px] w-4 h-4 border-t-2 border-r-2 border-[#00f3ff]"></div>
      <div className="absolute -bottom-[1px] -left-[1px] w-4 h-4 border-b-2 border-l-2 border-[#00f3ff]"></div>
      <div className="absolute -bottom-[1px] -right-[1px] w-4 h-4 border-b-2 border-r-2 border-[#00f3ff]"></div>

      {/* Title Bar */}
      {title && (
        <div className="absolute -top-3 left-4 bg-[#050a0f] px-2 text-[#00f3ff] text-xs font-bold tracking-widest uppercase glow-text border-l border-r border-[#005f63]">
          {title}
        </div>
      )}
      
      {/* Content */}
      <div className="relative h-full w-full">
        {children}
      </div>

      {/* Decorative Lines */}
      <div className="absolute bottom-2 right-4 flex space-x-1 opacity-50">
        <div className="w-8 h-1 bg-[#00f3ff]"></div>
        <div className="w-2 h-1 bg-[#00f3ff]"></div>
        <div className="w-1 h-1 bg-[#00f3ff]"></div>
      </div>
      
      {loading && (
         <div className="absolute top-2 right-2 text-xs text-[#00f3ff] animate-pulse">
           PROCESSING...
         </div>
      )}
    </div>
  );
};
