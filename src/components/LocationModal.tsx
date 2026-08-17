import React, { useState } from 'react';
import { PAKISTAN_CITIES, getCityDetails } from '../data/pakistanLocations';
import { MapPin, X, Check, Navigation } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: string;
  currentArea: string;
  onSelectLocation: (city: string, area: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  currentArea,
  onSelectLocation,
}) => {
  const [selectedCity, setSelectedCity] = useState(currentCity || 'Lahore');
  const [selectedArea, setSelectedArea] = useState(currentArea || 'Johar Town');
  const [customAreaInput, setCustomAreaInput] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [geoMessage, setGeoMessage] = useState('');

  if (!isOpen) return null;

  const cityDetails = getCityDetails(selectedCity);

  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const details = getCityDetails(cityName);
    setSelectedArea(details.popularAreas[0] || 'All Areas');
    setCustomAreaInput('');
  };

  const handleSave = () => {
    const finalArea = customAreaInput.trim() || selectedArea || 'Johar Town';
    onSelectLocation(selectedCity, finalArea);
    onClose();
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoMessage('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    setGeoMessage('Finding your location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const cities: { name: string; lat: [number, number]; lon: [number, number]; defaultArea: string }[] = [
          { name: 'Lahore',       lat: [31.3, 31.7],  lon: [74.1, 74.5],  defaultArea: 'Johar Town' },
          { name: 'Karachi',      lat: [24.7, 25.1],  lon: [66.9, 67.3],  defaultArea: 'Clifton' },
          { name: 'Islamabad',    lat: [33.5, 33.8],  lon: [72.9, 73.3],  defaultArea: 'F-7 (Jinnah Super)' },
          { name: 'Rawalpindi',   lat: [33.5, 33.8],  lon: [72.9, 73.2],  defaultArea: 'Saddar' },
          { name: 'Faisalabad',   lat: [31.3, 31.5],  lon: [73.0, 73.2],  defaultArea: 'D-Ground' },
          { name: 'Multan',       lat: [30.1, 30.3],  lon: [71.4, 71.6],  defaultArea: 'Gulgasht Colony' },
          { name: 'Peshawar',     lat: [33.9, 34.1],  lon: [71.4, 71.7],  defaultArea: 'Hayatabad' },
          { name: 'Quetta',       lat: [30.1, 30.3],  lon: [66.9, 67.1],  defaultArea: 'Satellite Town' },
          { name: 'Hyderabad',    lat: [25.3, 25.5],  lon: [68.3, 68.5],  defaultArea: 'Latifabad' },
          { name: 'Sialkot',      lat: [32.4, 32.6],  lon: [74.4, 74.6],  defaultArea: 'Cantonment' },
          { name: 'Sargodha',     lat: [32.0, 32.2],  lon: [72.6, 72.8],  defaultArea: 'Satellite Town' },
          { name: 'Abbottabad',   lat: [34.1, 34.2],  lon: [73.1, 73.3],  defaultArea: 'Supply Area' },
          { name: 'Mardan',       lat: [34.1, 34.3],  lon: [71.9, 72.1],  defaultArea: 'Shamsi' },
          { name: 'Larkana',      lat: [27.5, 27.7],  lon: [68.2, 68.4],  defaultArea: 'Bund Road' },
        ];

        let matchedCity: typeof cities[number] | null = null;
        let minDist = Infinity;

        for (const c of cities) {
          const midLat = (c.lat[0] + c.lat[1]) / 2;
          const midLon = (c.lon[0] + c.lon[1]) / 2;
          const dist = Math.sqrt(Math.pow(latitude - midLat, 2) + Math.pow(longitude - midLon, 2));
          if (dist < minDist) {
            minDist = dist;
            matchedCity = c;
          }
        }

        setIsDetecting(false);

        if (matchedCity && minDist < 0.5) {
          setSelectedCity(matchedCity.name);
          setSelectedArea(matchedCity.defaultArea);
          setGeoMessage(`Detected: ${matchedCity.name}. Adjust area below if needed.`);
        } else if (matchedCity) {
          setSelectedCity(matchedCity.name);
          setSelectedArea(matchedCity.defaultArea);
          setGeoMessage(`Closest city: ${matchedCity.name}. Please verify your area.`);
        } else {
          setGeoMessage('Could not identify a supported city. Please select manually.');
        }
      },
      (error) => {
        setIsDetecting(false);
        if (error.code === 1) {
          setGeoMessage('Location permission denied. Please allow location access in your browser settings.');
        } else if (error.code === 2) {
          setGeoMessage('Location unavailable. Please select your city from the list.');
        } else if (error.code === 3) {
          setGeoMessage('Location request timed out. Please try again or select manually.');
        } else {
          setGeoMessage('Could not retrieve GPS location. Please select your city from the list.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="location-modal-backdrop">
      <div className="bg-white w-full max-w-lg rounded-xl border border-stone-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" id="location-modal-container">
        
        {/* Header */}
        <div className="bg-[#0F3D2A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-800/80 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold leading-tight">Select Your Civic Area</h2>
              <p className="text-xs text-emerald-200 urdu-text">شہر اور اپنا علاقہ منتخب کریں</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-100 hover:text-white p-1.5 rounded-lg hover:bg-emerald-800 transition"
            aria-label="Close location selector"
            id="btn-close-location-modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Quick GPS button */}
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-stone-700">Detect automatically:</span>
              <button
                onClick={handleGeolocation}
                disabled={isDetecting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#0F3D2A] text-white hover:bg-emerald-900 transition disabled:opacity-50"
                id="btn-detect-gps-location"
              >
                <Navigation className="w-3.5 h-3.5" />
                {isDetecting ? 'Detecting…' : 'Use Current Location'}
              </button>
            </div>
            {geoMessage && (
              <p className="text-xs text-stone-600 italic">{geoMessage}</p>
            )}
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-sm font-bold text-stone-900 mb-1.5">
              1. Choose City (شہر)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAKISTAN_CITIES.map((c) => {
                const isSelected = selectedCity.toLowerCase() === c.name.toLowerCase();
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleCityChange(c.name)}
                    className={`px-3 py-2 text-left rounded-lg border text-sm font-semibold transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 border-[#0F3D2A] text-[#0F3D2A] ring-1 ring-[#0F3D2A]'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-800'
                    }`}
                    id={`city-select-${c.name.toLowerCase()}`}
                  >
                    <span>{c.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-[#0F3D2A]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Area Selection */}
          <div>
            <label className="block text-sm font-bold text-stone-900 mb-1.5">
              2. Choose Area in {selectedCity} (علاقہ)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedArea('All Areas');
                  setCustomAreaInput('');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
                  selectedArea === 'All Areas' && !customAreaInput
                    ? 'bg-[#0F3D2A] text-white border-[#0F3D2A]'
                    : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                }`}
                id="area-all-select"
              >
                All Areas in {selectedCity}
              </button>
              {cityDetails.popularAreas.map((area) => {
                const isSelected = selectedArea.toLowerCase() === area.toLowerCase() && !customAreaInput;
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => {
                      setSelectedArea(area);
                      setCustomAreaInput('');
                    }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition ${
                      isSelected
                        ? 'bg-[#0F3D2A] text-white border-[#0F3D2A]'
                        : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
                    }`}
                    id={`area-select-${area.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>

            {/* Custom Area Input */}
            <div className="mt-2">
              <label className="block text-xs font-medium text-stone-600 mb-1">
                Or type a specific sector / colony / union council:
              </label>
              <input
                type="text"
                value={customAreaInput}
                onChange={(e) => setCustomAreaInput(e.target.value)}
                placeholder="e.g. Block H, Phase 5, Street 12..."
                className="w-full px-3 py-2 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F3D2A] focus:border-transparent bg-white"
                id="custom-area-text-input"
              />
            </div>
          </div>

          {/* Current Responsible Authorities preview */}
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-3 text-xs text-stone-700 space-y-1">
            <p className="font-bold text-[#0F3D2A]">Local Civic Departments in {selectedCity}:</p>
            <p>• Sanitation: <span className="font-medium">{cityDetails.departments.garbage}</span></p>
            <p>• Water/Sewerage: <span className="font-medium">{cityDetails.departments.water}</span></p>
            <p>• Electricity: <span className="font-medium">{cityDetails.departments.electricity}</span></p>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-stone-100 px-6 py-4 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs font-medium text-stone-600">
            Selected: <strong className="text-stone-900">{selectedCity} • {customAreaInput || selectedArea}</strong>
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-sm font-semibold rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-200 transition"
              id="btn-cancel-location"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              type="button"
              className="px-5 py-2 text-sm font-bold rounded-lg bg-[#0F3D2A] text-white hover:bg-emerald-900 shadow-xs transition"
              id="btn-confirm-location"
            >
              Set Location
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
