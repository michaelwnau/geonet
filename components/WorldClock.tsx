import React, { useState, useEffect } from 'react';

interface WorldClockProps {
    timezoneOffset?: number; // In seconds
    label?: string;
}

export const WorldClock: React.FC<WorldClockProps> = ({ timezoneOffset = 0, label = 'UTC' }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (date: Date, offset: number) => {
        const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
        const targetDate = new Date(utc + (offset * 1000));
        return targetDate.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="bg-[#050a0f]/90 p-2 border-l-2 border-[#00f3ff] min-w-[100px] md:min-w-[120px]">
            <div className="text-[8px] md:text-[10px] text-[#005f63] uppercase tracking-tighter">{label} TIME</div>
            <div className="text-lg md:text-xl font-bold leading-none tabular-nums text-[#00f3ff] glow-text">
                {formatTime(time, timezoneOffset)}
            </div>
            <div className="text-[8px] opacity-50 uppercase mt-1">
                Offset: {timezoneOffset >= 0 ? '+' : ''}{Math.floor(timezoneOffset / 3600)}H
            </div>
        </div>
    );
};
