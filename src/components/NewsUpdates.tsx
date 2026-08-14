import React, { useState, useEffect } from 'react';
import { NewsItem } from '../types';
import { 
  ExternalLink, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  MapPin, 
  Info,
  Droplets,
  Zap,
  Hammer,
  Trash2,
  Bus,
  Building,
  Landmark,
  Layers,
  ArrowRight,
  Clock
} from 'lucide-react';

interface NewsUpdatesProps {
  currentCity: string;
  currentArea?: string;
}

export const NewsUpdates: React.FC<NewsUpdatesProps> = ({ currentCity, currentArea }) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedDate, setLastUpdatedDate] = useState('');
  const [isOlderCache, setIsOlderCache] = useState(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);
  const [selectedFilterCity, setSelectedFilterCity] = useState('All');

  const fetchNews = async (force: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = force ? '/api/news?force=true' : '/api/news';
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok && (!data.items || data.items.length === 0)) {
        throw new Error(data.error || "Today's civic news could not be loaded. Please try again later.");
      }

      setNews(data.items || []);
      setLastUpdatedDate(data.date || new Date().toISOString().split('T')[0]);
      setIsOlderCache(Boolean(data.isOlderCache));
      setCacheMessage(data.message || (data.isOlderCache ? "Showing the latest available news update." : null));
    } catch (e: any) {
      console.error("News fetch error:", e);
      setError("Today's civic news could not be loaded. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews(false);
  }, []);

  // Helper for category badge icons and colors
  const getCategoryTheme = (category: string) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('water')) {
      return {
        bg: 'bg-cyan-50 text-cyan-900 border-cyan-200',
        icon: <Droplets className="w-3.5 h-3.5 text-cyan-700" />,
      };
    }
    if (cat.includes('electric') || cat.includes('power')) {
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-200',
        icon: <Zap className="w-3.5 h-3.5 text-amber-700" />,
      };
    }
    if (cat.includes('road')) {
      return {
        bg: 'bg-orange-50 text-orange-900 border-orange-200',
        icon: <Hammer className="w-3.5 h-3.5 text-orange-700" />,
      };
    }
    if (cat.includes('waste') || cat.includes('garbage')) {
      return {
        bg: 'bg-lime-50 text-lime-900 border-lime-200',
        icon: <Trash2 className="w-3.5 h-3.5 text-lime-700" />,
      };
    }
    if (cat.includes('transport') || cat.includes('bus') || cat.includes('train')) {
      return {
        bg: 'bg-blue-50 text-blue-900 border-blue-200',
        icon: <Bus className="w-3.5 h-3.5 text-blue-700" />,
      };
    }
    if (cat.includes('infrastructure')) {
      return {
        bg: 'bg-indigo-50 text-indigo-900 border-indigo-200',
        icon: <Building className="w-3.5 h-3.5 text-indigo-700" />,
      };
    }
    if (cat.includes('government')) {
      return {
        bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        icon: <Landmark className="w-3.5 h-3.5 text-emerald-700" />,
      };
    }
    return {
      bg: 'bg-stone-100 text-stone-800 border-stone-200',
      icon: <Layers className="w-3.5 h-3.5 text-stone-600" />,
    };
  };

  // Location-aware sorting: prioritize selected city or user's current city
  const sortedAndFilteredNews = [...news].filter((item) => {
    if (selectedFilterCity === 'All') return true;
    const search = selectedFilterCity.toLowerCase();
    const city = (item.city || '').toLowerCase();
    return city.includes(search) || (search === 'lahore' && city.includes('punjab')) || (search === 'multan' && city.includes('punjab'));
  }).sort((a, b) => {
    // If viewing 'All', elevate stories that match the user's active currentCity
    if (selectedFilterCity === 'All' && currentCity) {
      const aMatches = (a.city || '').toLowerCase().includes(currentCity.toLowerCase());
      const bMatches = (b.city || '').toLowerCase().includes(currentCity.toLowerCase());
      if (aMatches && !bMatches) return -1;
      if (!aMatches && bMatches) return 1;
    }
    return 0;
  });

  // Format date helper
  const formatPublishedDate = (dateStr?: string, rawDate?: string) => {
    if (!dateStr && !rawDate) return 'Today';
    const today = new Date().toISOString().split('T')[0];
    const target = dateStr || (rawDate ? rawDate.split('T')[0] : '');
    if (target === today) return 'Today';
    return target || 'Recently';
  };

  return (
    <div className="max-w-5xl mx-auto my-8 px-4" id="news-updates-container">
      
      {/* Header Container */}
      <div className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-8 shadow-xs mb-6" id="news-header-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F3D2A] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                Today's Civic News
              </span>
              <span className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {lastUpdatedDate ? `Updated: ${lastUpdatedDate}` : 'Updated today'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 tracking-tight">
              News & Civic Updates
            </h1>
            
            <p className="text-sm font-semibold text-[#0F3D2A]">
              Important public-service and civic news from Pakistan
            </p>

            <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
              Curated daily updates on government services, road repairs, drinking water supply, electricity management, and municipal cleanliness.
            </p>

            {currentCity && (
              <div className="pt-1 flex items-center gap-1.5 text-xs text-stone-500">
                <MapPin className="w-3.5 h-3.5 text-[#0F3D2A]" />
                <span>Your Active Location: <strong className="text-stone-800">{currentCity}{currentArea ? ` • ${currentArea}` : ''}</strong></span>
              </div>
            )}
          </div>

          <button
            onClick={() => fetchNews(true)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 text-xs font-bold transition shadow-2xs self-start md:self-center disabled:opacity-50 cursor-pointer"
            id="btn-refresh-news"
            title="Refresh latest civic news"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing…' : 'Refresh Digest'}</span>
          </button>
        </div>

        {/* City Filter Pills */}
        <div className="mt-6 pt-4 border-t border-stone-200 flex flex-wrap items-center gap-2" id="news-city-filters">
          <span className="text-xs font-bold text-stone-700">Filter Location:</span>
          {['All', currentCity, 'Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Multan', 'Peshawar']
            .filter((c, idx, arr) => c && arr.indexOf(c) === idx)
            .map((c) => {
              const isSelected = selectedFilterCity.toLowerCase() === c.toLowerCase();
              return (
                <button
                  key={c}
                  onClick={() => setSelectedFilterCity(c)}
                  className={`px-3 py-1 rounded-md text-xs font-bold border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F3D2A] text-white border-[#0F3D2A]'
                      : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                  }`}
                  id={`filter-city-${c.toLowerCase()}`}
                >
                  {c}
                </button>
              );
            })}
        </div>
      </div>

      {/* Notice if older cache is being displayed */}
      {isOlderCache && !loading && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 text-xs text-blue-900" id="older-cache-banner">
          <Info className="w-4 h-4 text-blue-700 shrink-0" />
          <div>
            <p className="font-bold">{cacheMessage || "Showing the latest available news update."}</p>
            <p className="text-blue-700 text-[11px]">The daily municipal digest is preserved in local cache for offline reliability.</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton State (4-6 cards) */}
      {loading && (
        <div className="space-y-4" id="news-loading-skeletons">
          <div className="bg-white rounded-xl border border-stone-200 p-6 text-center space-y-2 mb-4">
            <RefreshCw className="w-7 h-7 mx-auto text-[#0F3D2A] animate-spin" />
            <h3 className="text-base font-serif font-bold text-stone-800">
              Loading today's civic news…
            </h3>
            <p className="text-xs text-stone-500">
              Retrieving verified public service bulletins and municipal announcements.
            </p>
          </div>

          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-6 space-y-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 bg-stone-200 rounded"></div>
                <div className="h-5 w-16 bg-stone-200 rounded"></div>
              </div>
              <div className="h-6 w-3/4 bg-stone-200 rounded"></div>
              <div className="space-y-2">
                <div className="h-4 w-full bg-stone-100 rounded"></div>
                <div className="h-4 w-5/6 bg-stone-100 rounded"></div>
              </div>
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="h-4 w-28 bg-stone-100 rounded"></div>
                <div className="h-4 w-32 bg-stone-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-8 text-center space-y-4" id="news-error-card">
          <AlertCircle className="w-10 h-10 text-amber-700 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-bold text-amber-900">{error}</h3>
            <p className="text-xs text-amber-800">
              We could not connect to the live news feed or retrieve cache. Please try again.
            </p>
          </div>
          <button
            onClick={() => fetchNews(true)}
            className="px-6 py-2.5 rounded-lg bg-[#0F3D2A] text-white text-xs font-bold hover:bg-emerald-900 transition cursor-pointer"
            id="btn-try-again-news"
          >
            Try Again
          </button>
        </div>
      )}

      {/* News Cards List */}
      {!loading && !error && (
        <div className="space-y-4" id="news-digest-list">
          {sortedAndFilteredNews.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-600 space-y-2">
              <p className="text-base font-bold text-stone-800">No civic bulletins found for {selectedFilterCity}.</p>
              <p className="text-xs text-stone-500">Try selecting "All" or switching to another major city.</p>
              <button
                onClick={() => setSelectedFilterCity('All')}
                className="mt-3 inline-block px-4 py-2 bg-[#0F3D2A] text-white text-xs font-bold rounded-lg hover:bg-emerald-900 transition"
              >
                View All Pakistan Updates
              </button>
            </div>
          ) : (
            sortedAndFilteredNews.map((item, idx) => {
              const theme = getCategoryTheme(item.category);
              const articleUrl = item.url || item.sourceUrl;
              const sourceTitle = item.source || item.sourceName || 'News Publisher';
              const publishedLabel = formatPublishedDate(item.date, item.published_at);

              return (
                <div
                  key={item.id || `news-card-${idx}`}
                  className="bg-white rounded-xl border border-stone-200 shadow-xs hover:shadow-md transition p-5 sm:p-6 space-y-3.5"
                  id={`news-card-${idx}`}
                >
                  {/* Card Header: Category & City */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border ${theme.bg}`}>
                        {theme.icon}
                        {item.category || 'Other Civic'}
                      </span>
                      
                      {item.city && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
                          <MapPin className="w-3 h-3 text-[#0F3D2A]" />
                          {item.city}
                        </span>
                      )}
                    </div>

                    <span className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      Published: {publishedLabel}
                    </span>
                  </div>

                  {/* Headline */}
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 leading-snug">
                    {item.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {item.summary}
                  </p>

                  {/* Card Footer: Source & Link */}
                  <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <span className="font-normal text-stone-500">Source:</span>
                      <strong className="font-semibold text-stone-800">{sourceTitle}</strong>
                    </div>

                    {articleUrl ? (
                      <a
                        href={articleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0F3D2A] hover:text-emerald-800 hover:underline transition"
                        id={`read-story-link-${idx}`}
                      >
                        <span>Read Full Story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-stone-400 text-xs italic">Official Notice</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
};
