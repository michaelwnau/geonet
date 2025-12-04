import React, { useState, useEffect, useCallback } from 'react';
import { CyberMap } from './components/CyberMap';
import { TerminalFrame } from './components/TerminalFrame';
import { LogPanel } from './components/LogPanel';
import { City, SurveillanceLog, MapView } from './types';
import { INITIAL_LOGS } from './constants';
import { generateSurveillanceLog } from './services/geminiService';

import { MapNavigation } from './components/MapNavigation';
import { NetworkStatus } from './components/NetworkStatus';

const App: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [currentView, setCurrentView] = useState<MapView>('US');
  const [logs, setLogs] = useState<SurveillanceLog[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Initialize logs
  useEffect(() => {
    const initial = INITIAL_LOGS.map(msg => ({
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      content: msg,
      level: 'INFO' as const
    }));
    setLogs(initial);
  }, []);

  const addLog = useCallback((content: string, level: 'INFO' | 'WARN' | 'CRIT' = 'INFO') => {
    setLogs(prev => [...prev, {
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      content,
      level
    }]);
  }, []);

  const handleCitySelect = async (city: City) => {
    setSelectedCity(city);
    addLog(`INITIATING TARGET LOCK: ${city.name.toUpperCase()}, ${city.state}`, 'WARN');
    setIsAiLoading(true);

    // Call Gemini Service
    try {
      const aiResponse = await generateSurveillanceLog(city.name);
      addLog(aiResponse, 'INFO');
    } catch (e) {
      addLog(`DATA UPLINK FAILED FOR ${city.name.toUpperCase()}`, 'CRIT');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col p-2 md:p-6 gap-4 bg-[#050a0f] text-[#00f3ff]">

      {/* Header */}
      <header className="flex justify-between items-end border-b border-[#005f63] pb-2 mb-2">
        <div>
          <h1 className="text-2xl md:text-4xl font-bold tracking-tighter glow-text">GEONet<span className="text-xs align-top ml-1 opacity-70">v.4.0.1</span></h1>
          <p className="text-xs text-[#005f63]">GEOGRAPHIC SURVEILLANCE SYSTEM</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-xs">SYS.STATUS: <span className="text-green-400">ONLINE</span></div>
          <div className="text-xs">ENCRYPTION: <span className="text-green-400">ENABLED (2048-BIT)</span></div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">

        {/* Left Column: Map (Takes up 3/4 space on large screens) */}
        <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
          <TerminalFrame className="flex-1 min-h-[400px]" title="GEOSPATIAL VIEW [SAT-44X]">
            <div className="absolute top-4 right-4 z-30">
              <MapNavigation currentView={currentView} onViewChange={setCurrentView} />
            </div>
            <CyberMap onCitySelect={handleCitySelect} selectedCity={selectedCity} viewMode={currentView} />

            {/* Map Overlay Data */}
            <div className="absolute top-4 left-4 pointer-events-none space-y-2">
              <div className="bg-[#050a0f]/90 p-2 border-l-2 border-[#00f3ff]">
                <div className="text-[10px] text-[#005f63] uppercase">Latitude</div>
                <div className="text-lg leading-none">{selectedCity ? selectedCity.lat.toFixed(4) : '00.0000'}</div>
              </div>
              <div className="bg-[#050a0f]/90 p-2 border-l-2 border-[#00f3ff]">
                <div className="text-[10px] text-[#005f63] uppercase">Longitude</div>
                <div className="text-lg leading-none">{selectedCity ? selectedCity.lng.toFixed(4) : '00.0000'}</div>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 pointer-events-none">
              <div className="text-[10px] text-[#005f63]">SCANNING PROTOCOL</div>
              <div className="h-1 w-32 bg-[#005f63]/30 mt-1 overflow-hidden">
                <div className="h-full bg-[#00f3ff] animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </TerminalFrame>
        </div>

        {/* Right Column: Sidebar Panels */}
        <div className="lg:col-span-1 flex flex-col gap-4 min-h-0">

          {/* Network Status Panel */}
          <NetworkStatus />

          {/* Target Info Panel */}
          <TerminalFrame className="h-1/3 min-h-[200px]" title="TARGET ANALYSIS" loading={isAiLoading}>
            <div className="h-full flex flex-col p-2 space-y-4">
              {selectedCity ? (
                <>
                  <div className="space-y-1">
                    <div className="text-xs text-[#005f63]">SECTOR ID</div>
                    <div className="text-xl font-bold glow-text">{selectedCity.name.toUpperCase()}</div>
                    <div className="text-sm opacity-80">{selectedCity.state} TERRITORY</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                    <div className="border border-[#005f63] p-1">
                      <div className="text-[#005f63]">ACTIVITY LVL</div>
                      <div className="text-yellow-400">MODERATE</div>
                    </div>
                    <div className="border border-[#005f63] p-1">
                      <div className="text-[#005f63]">ASSETS</div>
                      <div className="text-[#00f3ff]">DETECTED</div>
                    </div>
                  </div>

                  <div className="flex-1 border border-[#005f63]/50 p-2 overflow-hidden relative">
                    {/* Fake waveform */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                      <div className="w-full h-8 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMjAiPjxwYXRoIGQ9Ik0wIDEwIEwxMCA1IEwyMCAxNSBMMzAgMTAgTDQwIDEwIEw1MCA1IEw2MCAxNSBMNzAgMTAgTDgwIDEwIEw5MCA1IEwxMDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwZjNmZiIvPjwvc3ZnPg==')] bg-repeat-x animate-[slide_1s_linear_infinite]"></div>
                    </div>
                    <div className="relative z-10 text-[10px] space-y-1">
                      <div>SIGNAL STRENGTH: 98%</div>
                      <div>ENCRYPTION: AES-256</div>
                      <div>PACKETS: TRANSFERRING...</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full text-[#005f63] animate-pulse">
                  AWAITING ASSET SELECTION...
                </div>
              )}
            </div>
          </TerminalFrame>

          {/* System Logs Panel */}
          <TerminalFrame className="flex-1 min-h-[200px]" title="SYSTEM LOGS">
            <LogPanel logs={logs} />
          </TerminalFrame>
        </div>

      </div>

      {/* Footer */}
      <footer className="text-[10px] text-[#005f63] flex justify-between border-t border-[#005f63]/30 pt-2">
        <div>© P2-09 THE INFORMATION DIVISION. ALL RIGHTS RESERVED.</div>
        <div>NETRUNNER TECH // UNAUTHORIZED ACCESS IS A FELONY</div>
      </footer>

      {/* CSS Animations for internal usage */}
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
