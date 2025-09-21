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
    <div className="bg-gray-100 rounded-lg p-3 mb-4 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-700 font-medium text-sm">Select your vibe</span>
          {localPrefs.length > 0 && (
            <span className="text-gray-500 text-xs">({localPrefs.length} selected)</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleExpand}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 p-1 h-6"
        >
          {isExpanded ? (
            <>
              <span className="text-xs mr-1">Collapse</span>
              <ChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              <span className="text-xs mr-1">Expand</span>
              <ChevronDown className="w-3 h-3" />
            </>
          )}
        </Button>
      </div>
      
      {isExpanded && (
        <div className="mt-3 space-y-2">
          <div className="text-xs text-gray-600 mb-2">Selected preferences:</div>
          <div className="flex flex-wrap gap-1">
            {localPrefs.length > 0 ? (
              localPrefs.map((pref, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full border border-purple-200"
                >
                  {pref.name || pref.category || pref}
                </span>
              ))
            ) : (
              <span className="text-xs text-gray-500">No preferences selected yet</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PreferencesFolded;
