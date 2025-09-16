import { useEffect, useMemo, useState } from 'react';
import { PlaceItem } from '../database/googlePlaces';
import { sendMessageToGemini } from '../lib/gemini';
import { callWeatherProxy } from '../lib/placesProxy';

type Props = {
  place: PlaceItem;
  apiKey: string;
  onClose: () => void;
};

type WeatherData = any;

const minimal = (s: string) => {
  if (!s) return '';
  const trimmed = s.trim();
  const sentences = trimmed.split(/(?<=[.!?])\s+/).slice(0, 2);
  return sentences.join(' ');
};

export default function PlaceDetailDialog({ place, apiKey, onClose }: Props) {
  const [summary, setSummary] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherSummary, setWeatherSummary] = useState<string>('');
  const [tips, setTips] = useState<string>('');

  const mapSrc = useMemo(() => {
    const { lat, lng } = place.location || { lat: 0, lng: 0 };
    const q = encodeURIComponent(`${lat},${lng}`);
    return `https://www.google.com/maps?q=${q}&z=13&output=embed`;
  }, [place.location]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const intro = `Write a concise, vivid 2-sentence travel blurb about ${place.name} in ${place.address}. Include what it's known for. Avoid emojis.`;
        const s = await sendMessageToGemini(intro);
        if (!cancelled) setSummary(minimal(s));

        if (place.location) {
          const w = await callWeatherProxy({ latitude: place.location.lat, longitude: place.location.lng });
          if (!cancelled) setWeather(w);

          const wx = await sendMessageToGemini(
            `Given this JSON weather snapshot, summarize conditions in 2 short sentences for travelers. Be specific and minimal. JSON: ${JSON.stringify(w).slice(0, 4000)}`
          );
          if (!cancelled) setWeatherSummary(minimal(wx));

          const adv = await sendMessageToGemini(
            `Based on the above place and weather, list 3 concise bullet tips on what to wear/carry and cautions. Keep each tip under 12 words.`
          );
          if (!cancelled) setTips(adv.replace(/\n{2,}/g, '\n').trim());
        }
      } catch {}
    };
    run();
    return () => { cancelled = true; };
  }, [place]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left: Image and title */}
          <div className="relative">
            <div className="h-64 md:h-full">
              {place.photoUrl && (
                <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 text-white rounded-xl p-4">
              <h2 className="text-2xl font-bold mb-1">{place.name}</h2>
              <p className="text-sm opacity-90">{place.address}</p>
              {summary && <p className="mt-3 text-sm">{summary}</p>}
            </div>
          </div>

          {/* Right: Map, Weather, Tips */}
          <div className="p-4 md:p-6 space-y-4">
            {/* Interactive Map (embed allows pan/zoom) */}
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <iframe
                title="map"
                src={mapSrc}
                className="w-full h-44 md:h-56"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Weather summary */}
            <div className="rounded-xl p-4 bg-green-50 dark:bg-emerald-900/30 border border-green-200 dark:border-emerald-800">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">Weather</h3>
              <p className="text-sm text-slate-700 dark:text-slate-200">{weatherSummary || 'Loading weather...'}</p>
            </div>

            {/* Tips */}
            <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-2">Tips for Groups</h3>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{tips || 'Preparing tips...'}</pre>
            </div>

            <div className="flex justify-end">
              <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-700">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


