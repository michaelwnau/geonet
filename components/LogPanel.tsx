import React, { useEffect, useRef } from 'react';
import { SurveillanceLog } from '../types';

interface LogPanelProps {
  logs: SurveillanceLog[];
}

export const LogPanel: React.FC<LogPanelProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full overflow-y-auto font-mono text-xs p-2 space-y-1">
      {logs.map((log, i) => (
        <div key={i} className="flex">
          <span className="text-[#005f63] mr-2">[{log.timestamp}]</span>
          <span className={`${
            log.level === 'CRIT' ? 'text-red-500' : 
            log.level === 'WARN' ? 'text-yellow-400' : 'text-[#00f3ff]'
          } opacity-90`}>
            {'>'} {log.content}
          </span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
};
