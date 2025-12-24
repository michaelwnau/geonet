import React, { useState, useEffect, useCallback } from 'react';
import { CyberMap } from './components/CyberMap';
import { TerminalFrame } from './components/TerminalFrame';
import { LogPanel } from './components/LogPanel';
import { City, SurveillanceLog, MapView, SantaState } from './types';
import { fetchSantaState } from './services/santaService';
import { MapNavigation } from './components/MapNavigation';
import { WorldClock } from './components/WorldClock';
import { INITIAL_LOGS } from './constants';

const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [currentView, setCurrentView] = useState<MapView>('GLOBE');
  const [logs, setLogs] = useState<SurveillanceLog[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [santaState, setSantaState] = useState<SantaState | null>(null);

  // Santa Data Polling
  useEffect(() => {
    const updateSanta = async () => {
      try {
        const state = await fetchSantaState();
        setSantaState(state);
      } catch (e) {
        console.error("Santa tracking failed", e);
      }
    };

    updateSanta();
    const interval = setInterval(updateSanta, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  // Initialize logs
  useEffect(() => {
    const initialMessages = [
      "ESTABLISHING SECURE CONNECTION...",
      "LOADING GEOSPATIAL ASSETS...",
      "CONNECTING TO SATELLITE UPLINK [SAT-44X]...",
      "READY FOR TARGET SELECTION.",
      "SANTA-01 DEPLOYMENT DETECTED. ACTIVATING CHRISTMAS OVERRIDE."
    ];
    const initial = initialMessages.map((msg, i) => ({
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      content: msg,
      level: (i === initialMessages.length - 1) ? 'WARN' : 'INFO' as const
    }));
    setLogs(initial);
  }, []);

  const addLog = useCallback((content: string, level: 'INFO' | 'WARN' | 'CRIT' = 'INFO') => {
    setLogs(prev => [...prev.slice(-19), {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      content,
      level
    }]);
  }, []);

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    addLog(`INITIATING TARGET LOCK: ${city.name.toUpperCase()}, ${city.state}`, 'WARN');

    const mockLogs = [
      "ENCRYPTED UPLINK ESTABLISHED. DECRYPTING LOCAL MESH...",
      "SIGNAL OSCILLATION DETECTED. FILTERING INTERFERENCE.",
      "TARGET SIGNATURE MATCHES KNOWN OPERATIVE PROFILE.",
      "TRACE ROUTE COMPLETE. RELAYING DATA TO CENTRAL.",
      "THERMAL ANOMALY DETECTED IN LOCAL SECTOR.",
      "PROXY CHAIN RECONFIGURED. ANONYMITY MAINTAINED."
    ];
    const mockLog = mockLogs[Math.floor(Math.random() * mockLogs.length)];

    setTimeout(() => {
      addLog(mockLog, 'INFO');
    }, 500);
  };

  return (
    <div className="min-h-screen md:h-screen w-screen flex flex-col p-2 md:p-6 gap-4 bg-[#050a0f] text-[#00f3ff] overflow-x-hidden">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[#005f63] pb-2 mb-2 gap-4">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tighter glow-text">
            SANTA-Net<span className="text-xs align-top ml-1 opacity-70">v.XMAS</span>
          </h1>
          <p className="text-[10px] md:text-xs text-[#005f63]">SLEIGH PROGRESS SURVEILLANCE SYSTEM</p>
        </div>
        <div className="flex w-full md:w-auto justify-between md:justify-end items-end gap-4">
          <div className="md:border-r md:border-[#005f63] md:pr-4">
            {santaState && (
              <WorldClock timezoneOffset={santaState.lastStop?.timezone || 0} label={santaState.lastStop?.city || 'SANTA'} />
            )}
          </div>
          <div className="text-right border-l border-[#005f63] pl-4">
            <div className="text-[10px] md:text-xs text-[#005f63]">SYS.STATUS: <span className="text-[#00f3ff]">OPERATIONAL</span></div>
            <div className="text-[10px] md:text-xs text-[#005f63]">GPS: <span className="text-[#00f3ff]">LOCKED [SANTA-01]</span></div>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0 overflow-hidden md:overflow-visible">
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
          <TerminalFrame className="flex-1 min-h-[400px] md:min-h-0 relative flex flex-col" title="GEOSPATIAL VIEW [SAT-KRI-NGLE]">
            <div className="relative md:absolute md:top-4 md:right-4 z-30 mb-2 md:mb-0">
              <MapNavigation currentView={currentView} onViewChange={setCurrentView} />
            </div>

            <div className="flex-1 relative min-h-[400px] md:h-full">
              <CyberMap
                onCitySelect={handleCitySelect}
                selectedCity={selectedCity}
                viewMode={currentView}
                santaState={santaState}
              />

              <div className="absolute top-2 left-2 md:top-4 md:left-4 pointer-events-none space-y-2">
                <div className="bg-[#050a0f]/90 p-1 md:p-2 border-l-2 border-[#00f3ff]">
                  <div className="text-[8px] md:text-[10px] text-[#005f63] uppercase">Lat/Long (SANTA)</div>
                  <div className="text-sm md:text-lg leading-none text-[#00f3ff]">
                    {santaState ? `${santaState.currentLocation.lat.toFixed(4)}, ${santaState.currentLocation.lng.toFixed(4)}` : '00.0000, 00.0000'}
                  </div>
                </div>
                <div className="bg-[#050a0f]/90 p-1 md:p-2 border-l-2 border-[#00f3ff]">
                  <div className="text-[8px] md:text-[10px] text-[#005f63] uppercase">Presents Delivered</div>
                  <div className="text-md md:text-xl font-bold leading-none text-[#00f3ff] tabular-nums">
                    {santaState ? santaState.presentsDelivered.toLocaleString() : '0'}
                  </div>
                </div>
              </div>

              <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 pointer-events-none">
                <div className="text-[8px] md:text-[10px] text-[#00f3ff]">CHIMNEY DETECTION PROTOCOL</div>
                <div className="h-1 w-24 md:w-32 bg-[#005f63]/30 mt-1 overflow-hidden">
                  <div className="h-full bg-[#00f3ff] animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </TerminalFrame>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">
          <TerminalFrame className="h-1/3 min-h-[200px]" title="ASSET ANALYSIS: SANTA-01" loading={isAiLoading}>
            <div className="h-full flex flex-col p-2 space-y-4">
              <div className="space-y-1">
                <div className="text-xs text-[#005f63]">CURRENT SECTOR</div>
                <div className="text-xl font-bold text-[#00f3ff] glow-text">
                  {santaState?.status.split(': ')[1] || 'SCANNING...'}
                </div>
                <div className="text-sm opacity-80 mt-1 text-[#00f3ff]">VELOCITY: MAX (MACH 12)</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                <div className="border border-[#005f63] p-1">
                  <div className="text-[#005f63]">MOOD</div>
                  <div className="text-[#00f3ff]">OPTIMAL</div>
                </div>
                <div className="border border-[#005f63] p-1">
                  <div className="text-[#005f63]">FUEL (Mince Pies)</div>
                  <div className="text-[#00f3ff]">NOMINAL</div>
                </div>
              </div>

              <div className="flex-1 border border-[#005f63]/50 p-2 overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <div className="w-full h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMjAiPjxwYXRoIGQ9Ik0wIDEwIEwxMCA1IEwyMCAxNSBMMzAgMTAgTDQwIDEwIEw1MCA1IEw2MCAxNSBMNzAgMTAgTDgwIDEwIEw5MCA1IEwxMDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwZjNmZiIvPjwvc3ZnPg==')] bg-repeat-x animate-[slide_1s_linear_infinite]"></div>
                </div>
                <div className="relative z-10 text-[10px] text-[#005f63] space-y-1">
                  <div>SIGNAL STRENGTH: 100%</div>
                  <div>REINDEER UPLINK: STABLE</div>
                  <div>GIFT-WRAP: SECURED</div>
                </div>
              </div>
            </div>
          </TerminalFrame>
          <TerminalFrame className="flex-1 min-h-[200px]" title="COMMAND LOGS">
            <LogPanel logs={logs} />
          </TerminalFrame>
        </div>
      </div>

      <footer className="text-[8px] md:text-[10px] text-[#005f63] flex flex-col md:flex-row justify-between border-t border-[#005f63]/30 pt-2 gap-2">
        <div>© NORTH POLE SURVEILLANCE DIVISION. ALL RIGHTS RESERVED.</div>
        <div className="md:text-right">ZCORE GROUP TECH // NAUGHTY LIST ACCESS GRANTED</div>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { width: 0%; opacity: 0; }
          50% { width: 100%; opacity: 1; }
          100% { width: 0%; opacity: 0; margin-left: 100%; }
        }
        @keyframes slide {
          from { background-position: 0 0; }
          to { background-position: 100px 0; }
        }
      `}</style>
    </div>
  );
};

export default App;
