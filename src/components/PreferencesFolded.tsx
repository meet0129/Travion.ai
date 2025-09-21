import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface PreferencesFoldedProps {
  preferences: any[];
  onExpand: () => void;
}

const PreferencesFolded: React.FC<PreferencesFoldedProps> = ({ preferences, onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<any[]>(preferences || []);

  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    onExpand();
  };

  // Live-sync with storage so Destinations/Chat can reflect adds immediately
  useEffect(() => {
    setLocalPrefs(preferences || []);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'selectedPreferences') {
        try {
          const next = JSON.parse(e.newValue || '[]');
          setLocalPrefs(next);
        } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [preferences]);

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium text-sm">Select your vibe</span>
          {localPrefs.length > 0 ? (
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
              {localPrefs.length} selected
            </span>
          ) : (
            <span className="text-gray-500 text-xs">No preferences selected</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExpand}
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1 h-auto text-sm font-medium"
        >
          Expand
          <ChevronDown className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      {/* Show selected preferences as tags when folded */}
      {!isExpanded && localPrefs.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {localPrefs.slice(0, 3).map((pref, index) => (
            <span
              key={index}
              className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full border border-gray-300"
            >
              {pref.name || pref.category || pref}
            </span>
          ))}
          {localPrefs.length > 3 && (
            <span className="text-gray-500 text-xs px-2 py-1">
              +{localPrefs.length - 3} more
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default PreferencesFolded;
