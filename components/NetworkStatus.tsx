import React from 'react';
import { TerminalFrame } from './TerminalFrame';

export const NetworkStatus: React.FC = () => {
    return (
        <TerminalFrame className="h-1/4 min-h-[150px]" title="NETWORK STATUS">
            <div className="h-full flex flex-col p-2 gap-2 text-xs">
                {/* Status Indicators */}
                <div className="flex justify-between items-center border-b border-[#005f63]/30 pb-2">
                    <div className="text-[#005f63]">UPLINK</div>
                    <div className="text-[#00f3ff] animate-pulse">ESTABLISHED</div>
                </div>

                <div className="flex justify-between items-center border-b border-[#005f63]/30 pb-2">
                    <div className="text-[#005f63]">LATENCY</div>
                    <div className="text-green-400">12ms</div>
                </div>

                {/* Visual Data Stream */}
                <div className="flex-1 relative overflow-hidden border border-[#005f63]/30 bg-[#001115]">
                    <div className="absolute inset-0 flex flex-col gap-1 p-1 opacity-50">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex gap-1">
                                <span className="text-[#005f63]">{`0${i}X:`}</span>
                                <span className="text-[#00f3ff] animate-[pulse_0.5s_ease-in-out_infinite]" style={{ animationDelay: `${i * 0.1}s` }}>
                                    {Math.random().toString(16).substring(2, 10).toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                    {/* Scanline overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00f3ff]/10 to-transparent h-full w-full animate-[shimmer_3s_infinite]"></div>
                </div>
            </div>
        </TerminalFrame>
    );
};
