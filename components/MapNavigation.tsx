import React from 'react';
import { MapView } from '../types';

interface MapNavigationProps {
    currentView: MapView;
    onViewChange: (view: MapView) => void;
}

export const MapNavigation: React.FC<MapNavigationProps> = ({ currentView, onViewChange }) => {
    const views: MapView[] = ['US', 'GLOBE', 'EUROPE', 'ASIA', 'AFRICA', 'SOUTH_AMERICA', 'AUSTRALIA'];

    return (
        <div className="flex flex-wrap gap-2 mb-2">
            {views.map((view) => (
                <button
                    key={view}
                    onClick={() => onViewChange(view)}
                    className={`
            px-4 py-2 md:px-3 md:py-1 text-[10px] md:text-xs font-bold border transition-all duration-200
            ${currentView === view
                            ? 'bg-[#00f3ff] text-[#050a0f] border-[#00f3ff] shadow-[0_0_10px_rgba(0,243,255,0.5)]'
                            : 'bg-transparent text-[#005f63] border-[#005f63] hover:text-[#00f3ff] hover:border-[#00f3ff]'
                        }
          `}
                >
                    {view.replace('_', ' ')}
                </button>
            ))}
        </div>
    );
};
