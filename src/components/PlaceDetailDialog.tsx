import { useEffect, useMemo, useState } from 'react';
import { PlaceItem } from '../database/googlePlaces';
import { sendMessageToGemini } from '../lib/gemini';
import { callWeatherProxy } from '../lib/placesProxy';
import { Star, Clock, Phone, Globe, MapPin, ExternalLink, X } from 'lucide-react';

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
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{place.name}</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Left: Image and basic info */}
          <div className="lg:col-span-1">
            <div className="relative h-64 lg:h-80">
              {place.photoUrl && (
                <img src={place.photoUrl} alt={place.name} className="w-full h-full object-cover" />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <div className="text-white">
                  <div className="flex items-center gap-2 mb-2">
                    {place.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{place.rating.toFixed(1)}</span>
                        {place.userRatingsTotal && (
                          <span className="text-xs opacity-80">({place.userRatingsTotal})</span>
                        )}
                      </div>
                    )}
                    {place.priceLevel && (
                      <div className="text-xs">
                        {'$'.repeat(place.priceLevel)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm opacity-90 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {place.address}
                  </p>
                </div>
              </div>
            </div>

            {/* Enhanced place details */}
            <div className="p-4 space-y-3">
              {/* Contact Information */}
              {(place.website || place.phoneNumber) && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Contact</h3>
                  {place.website && (
                    <a 
                      href={place.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <Globe className="w-4 h-4" />
                      <span className="truncate">Visit Website</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {place.phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Phone className="w-4 h-4" />
                      <span>{place.phoneNumber}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Opening Hours */}
              {place.openingHours && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Hours</h3>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span className={place.openingHours.openNow ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                      {place.openingHours.openNow ? 'Open Now' : 'Closed'}
                    </span>
                  </div>
                  {place.openingHours.weekdayText && place.openingHours.weekdayText.length > 0 && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      {place.openingHours.weekdayText.slice(0, 3).map((day, index) => (
                        <div key={index}>{day}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Editorial Summary */}
              {place.editorialSummary && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">About</h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{place.editorialSummary}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: Map, Weather, Tips, and Reviews */}
          <div className="lg:col-span-2 p-4 space-y-4">
            {/* Interactive Map */}
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <iframe
                title="map"
                src={mapSrc}
                className="w-full h-48"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Weather summary */}
            <div className="rounded-xl p-4 bg-green-50 dark:bg-emerald-900/30 border border-green-200 dark:border-emerald-800">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-1">Weather</h3>
              <p className="text-sm text-slate-700 dark:text-slate-200">{weatherSummary || 'Loading weather...'}</p>
            </div>

            {/* Reviews */}
            {place.reviews && place.reviews.length > 0 && (
              <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-3">Recent Reviews</h3>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {place.reviews.slice(0, 3).map((review, index) => (
                    <div key={index} className="border-b border-slate-200 dark:border-slate-700 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{review.authorName}</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="rounded-xl p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm mb-2">Travel Tips</h3>
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{tips || 'Preparing tips...'}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


