import { useMemo, useState } from 'react';

type Experience = {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  rating: number;
  duration: string;
  price: string;
  tags: string[];
};

interface PreferencesWidgetProps {
  destination: string;
  onComplete: (selectedIds: string[]) => void;
}

const PreferencesWidget = ({ destination, onComplete }: PreferencesWidgetProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(`${destination}: Attractions`);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const categories = useMemo(() => ([
    `${destination}: Attractions`,
    `${destination}: Day Trips`,
    `${destination}: Food & Cafes`,
    `${destination}: Hidden Gems`,
  ]), [destination]);

  const data: Experience[] = useMemo(() => ([
    { id: 'att-1', title: 'Vashist Hot Springs', description: 'Hot water baths in a soothing Himalayan village—perfect for a relaxing dip.', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format&fit=crop', category: `${destination}: Attractions`, rating: 4.7, duration: '1-2 hours', price: '₹100-300', tags: ['Relax', 'Nature'] },
    { id: 'att-2', title: 'Jogini Waterfall', description: 'A scenic trek leads to this stunning waterfall, ideal for a refreshing dip.', image: 'https://images.unsplash.com/photo-1545594262-44eab6a4b1a7?w=800&q=80&auto=format&fit=crop', category: `${destination}: Attractions`, rating: 4.8, duration: '3-4 hours', price: 'Free', tags: ['Trek', 'Nature'] },
    { id: 'att-3', title: 'Mall Road', description: 'Bustling street for shopping, local eats, and people-watching in the evening.', image: 'https://images.unsplash.com/photo-1483721310020-03333e577078?w=800&q=80&auto=format&fit=crop', category: `${destination}: Attractions`, rating: 4.5, duration: '1-2 hours', price: '₹200-500', tags: ['Shopping', 'Food'] },
    { id: 'att-4', title: 'Museum of Himachal Culture', description: 'Discover Himachali heritage through artifacts, costumes, and traditions.', image: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?w=800&q=80&auto=format&fit=crop', category: `${destination}: Attractions`, rating: 4.4, duration: '1-2 hours', price: '₹50-150', tags: ['History', 'Culture'] },
    { id: 'day-1', title: 'Solang Valley Day Trip', description: 'Adventure hotspot with paragliding, ATV rides, and snow (seasonal).', image: 'https://images.unsplash.com/photo-1533050487297-09b450131914?w=800&q=80&auto=format&fit=crop', category: `${destination}: Day Trips`, rating: 4.7, duration: 'Full day', price: '₹1500-3000', tags: ['Adventure'] },
    { id: 'food-1', title: 'Old Manali Cafe Crawl', description: 'Handpicked cafes with live music and great views.', image: 'https://images.unsplash.com/photo-1526312426976-593c2c6a2ec1?w=800&q=80&auto=format&fit=crop', category: `${destination}: Food & Cafes`, rating: 4.9, duration: '3-4 hours', price: '₹500-1000', tags: ['Food'] },
    { id: 'hid-1', title: 'Hidden Riverside Spot', description: 'Quiet riverside bend ideal for picnics and golden-hour photos.', image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80&auto=format&fit=crop', category: `${destination}: Hidden Gems`, rating: 4.8, duration: '2-3 hours', price: 'Free', tags: ['Photography', 'Off-beat'] },
  ]), [destination]);

  const list = useMemo(() => data.filter(d => d.category === selectedCategory), [data, selectedCategory]);

  const toggle = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Pick What You Love <span className="ml-1">💗</span></h3>
          <button className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">Skip this step</button>
        </div>
        <p className="mt-2 text-slate-600 dark:text-slate-300 text-sm">Follow your inspiration — we’ll connect the dots and create a journey filled with moments that feel just right.</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 ${selectedCategory === c ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
            >
              {c.split(': ')[1]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((item, index) => (
          <div
            key={item.id}
            className={`group bg-white/95 dark:bg-slate-800/95 rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-md hover:shadow-xl transition-all cursor-pointer ${selectedIds.includes(item.id) ? 'ring-2 ring-purple-500' : ''}`}
            style={{ animationDelay: `${index * 80}ms` }}
            onClick={() => toggle(item.id)}
          >
            <div className="relative">
              <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <button className={`absolute top-3 right-3 h-8 w-8 rounded-full grid place-items-center backdrop-blur bg-white/80 text-slate-700 ${selectedIds.includes(item.id) ? 'ring-2 ring-purple-500' : ''}`}>❤</button>
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-slate-900 dark:text-slate-100">{item.title}</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between mt-4 text-sm">
                <span className="text-slate-600 dark:text-slate-300">{item.duration}</span>
                <span className="font-medium text-purple-600 dark:text-purple-400">{item.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-slate-600 dark:text-slate-300 text-sm">❤ Save one or more experiences to Continue</div>
        <button
          onClick={() => selectedIds.length > 0 && onComplete(selectedIds)}
          disabled={selectedIds.length === 0}
          className="px-6 py-3 rounded-full text-white bg-slate-900 disabled:bg-slate-300 dark:bg-slate-100 dark:text-slate-900 disabled:opacity-60"
        >
          Continue →
        </button>
      </div>
    </div>
  );
};

export default PreferencesWidget;


