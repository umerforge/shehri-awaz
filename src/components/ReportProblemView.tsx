import React, { useState, useRef, useMemo } from 'react';
import { PAKISTAN_CITIES, getCityDetails, getRecommendedDepartment } from '../data/pakistanLocations';
import { CivicIssue, IssueCategory, IssueSeverity, UserProfile } from '../types';
import { uploadIssuePhoto, submitCivicIssue, safeFetchJson } from '../lib/supabase';
import { SEVERITY_GUIDELINES } from '../data/severityGuidelines';
import { GOVERNMENT_DEPARTMENTS } from '../data/governmentDepartments';
import { 
  Camera, 
  Upload, 
  MapPin, 
  Navigation, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  ArrowRight, 
  ArrowLeft,
  Building2,
  FileText,
  Phone
} from 'lucide-react';

interface ReportProblemViewProps {
  initialCity: string;
  initialArea: string;
  user: UserProfile | null;
  onSuccess: (newIssue: CivicIssue) => void;
  onCancel?: () => void;
  onNavigateToIssues?: () => void;
}

export const ReportProblemView: React.FC<ReportProblemViewProps> = ({
  initialCity,
  initialArea,
  user,
  onSuccess,
  onCancel,
  onNavigateToIssues,
}) => {
  // Step State
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Photo, 2: Location, 3: Description/Submit, 4: Confirmed

  // Form Fields
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [city, setCity] = useState(initialCity || 'Lahore');
  const [area, setArea] = useState(initialArea === 'All Areas' ? 'Johar Town' : initialArea || 'Johar Town');
  const [customArea, setCustomArea] = useState('');
  const [streetLandmark, setStreetLandmark] = useState('');
  const [description, setDescription] = useState('');

  // AI Classification & Submission States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [classifiedData, setClassifiedData] = useState<{
    category: IssueCategory;
    severity: IssueSeverity;
    department: string;
    summary: string;
  } | null>(null);

  // Manual fallback overrides if AI is inconclusive
  const [manualCategory, setManualCategory] = useState<IssueCategory>('garbage');
  const [manualSeverity, setManualSeverity] = useState<IssueSeverity>('high');
  const [manualDepartment, setManualDepartment] = useState('');

  // Confirmed Issue Result
  const [createdIssue, setCreatedIssue] = useState<CivicIssue | null>(null);

  // Geolocation
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const cityDetails = getCityDetails(city);

  // Handle Photo selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      setAiError(null);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Geolocation Helper
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationNotice('Geolocation is not supported on this browser.');
      return;
    }
    setIsLocating(true);
    setLocationNotice('Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        // Match coordinates to nearest Pakistani city (broad bounding boxes)
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

        setIsLocating(false);

        if (matchedCity && minDist < 0.5) {
          setCity(matchedCity.name);
          setArea(matchedCity.defaultArea);
          setLocationNotice(`Detected: ${matchedCity.name} — set to ${matchedCity.defaultArea}. Adjust area if needed.`);
        } else {
          // Fallback: pick the closest city even if far
          if (matchedCity) {
            setCity(matchedCity.name);
            setArea(matchedCity.defaultArea);
            setLocationNotice(`Closest city detected: ${matchedCity.name}. Please verify and adjust your area.`);
          } else {
            setLocationNotice('Could not identify a supported city. Please select manually above.');
          }
        }
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Could not retrieve GPS coordinates.';
        if (err.code === 1) msg = 'Location permission denied. Please allow location access in your browser settings.';
        else if (err.code === 2) msg = 'Location unavailable. Please select your area manually.';
        else if (err.code === 3) msg = 'Location request timed out. Please try again or select manually.';
        setLocationNotice(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  };

  // Convert image to Base64 for Gemini
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Form submission with Gemini AI classification
  const handleAnalyzeAndSubmit = async () => {
    setIsAnalyzing(true);
    setAiError(null);

    const finalArea = customArea.trim() || area || 'Main Sector';

    try {
      let base64 = '';
      if (photoFile) {
        base64 = await fileToBase64(photoFile);
      }

      // 1. Call Gemini Classification
      const classifyResult = await safeFetchJson<{
        category?: IssueCategory;
        severity?: IssueSeverity;
        department?: string;
        summary?: string;
      }>('/api/classify-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: photoFile?.type || 'image/jpeg',
          description,
          city,
          area: finalArea,
        }),
      });

      const aiResult = classifyResult.data || {};
      
      const category: IssueCategory = aiResult.category || manualCategory || 'other';
      const severity: IssueSeverity = aiResult.severity || manualSeverity || 'medium';
      const department: string = aiResult.department || getRecommendedDepartment(city, category);
      const summary: string = aiResult.summary || description || `Reported ${category} problem in ${finalArea}, ${city}`;

      setClassifiedData({ category, severity, department, summary });

      // 2. Upload photo to Supabase storage
      let uploadedUrl = 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80';
      if (photoFile) {
        uploadedUrl = await uploadIssuePhoto(photoFile);
      }

      // 3. Save to database
      const newRecord = await submitCivicIssue({
        user_id: user?.id,
        reporter_name: user?.full_name || 'Concerned Citizen',
        image_url: uploadedUrl,
        category,
        severity,
        department,
        summary,
        description,
        city,
        area_text: finalArea,
        street_landmark: streetLandmark || undefined,
        status: 'reported',
      });

      setCreatedIssue(newRecord);
      setIsAnalyzing(false);
      setStep(4); // Advance to Confirmation Screen
      onSuccess(newRecord);

    } catch (err: any) {
      console.error('Submission failed:', err);
      setIsAnalyzing(false);
      setAiError("We couldn't identify the problem automatically. You can review details and try again.");
    }
  };

  const handleResetForm = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setDescription('');
    setStreetLandmark('');
    setCustomArea('');
    setClassifiedData(null);
    setCreatedIssue(null);
    setStep(1);
  };

  return (
    <div className="max-w-3xl mx-auto my-8 px-4" id="report-problem-container">
      
      {/* Container Card */}
      <div className="bg-white rounded-2xl border-2 border-stone-300 shadow-lg overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-[#0F3D2A] text-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Citizen Civic Reporting
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-black">
                Report a Problem (مسئلہ درج کریں)
              </h1>
              <p className="text-sm text-emerald-100/90 leading-relaxed max-w-xl">
                Take a photo and tell us where the problem is. We'll help identify the type of issue and the responsible department.
              </p>
            </div>
            {onCancel && (
              <button 
                onClick={onCancel}
                className="text-emerald-200 hover:text-white p-2 rounded-lg hover:bg-emerald-900"
                aria-label="Cancel reporting"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Stepper Indicator */}
          {step < 4 && (
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-emerald-900/80">
              {[
                { num: 1, label: 'Add Photo' },
                { num: 2, label: 'Location' },
                { num: 3, label: 'Details' },
              ].map((s) => {
                const isActive = step === s.num;
                const isPassed = step > s.num;
                return (
                  <div key={s.num} className="flex-1 flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isActive ? 'bg-[#B88917] text-stone-950 ring-2 ring-white' :
                      isPassed ? 'bg-emerald-600 text-white' : 'bg-emerald-950 text-emerald-300'
                    }`}>
                      {isPassed ? '✓' : s.num}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:inline ${isActive ? 'text-white font-bold' : 'text-emerald-200/80'}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Step 1: Add a Photo */}
        {step === 1 && (
          <div className="p-6 sm:p-8 space-y-6" id="step-1-photo">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900 mb-1">
                Step 1: Add a Photograph of the Problem
              </h2>
              <p className="text-sm text-stone-600">
                A clear photo helps local authorities identify the issue severity and dispatch the right team.
              </p>
            </div>

            {/* Photo Upload Box */}
            {!photoPreview ? (
              <div className="border-2 border-dashed border-stone-300 hover:border-[#0F3D2A] rounded-xl p-8 text-center bg-stone-50 transition flex flex-col items-center justify-center min-h-[260px]">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#0F3D2A] flex items-center justify-center mb-4 border border-emerald-200">
                  <Camera className="w-8 h-8" />
                </div>
                
                <h3 className="text-base font-bold text-stone-800 mb-1">
                  Take or Upload a Photo
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mb-6">
                  Supports JPG, PNG, or mobile camera capture. (e.g., garbage pile, broken road, overflowing water, open wires)
                </p>

                <div className="flex flex-wrap gap-3 justify-center">
                  {/* File input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                    id="input-photo-file"
                  />
                  
                  {/* Direct Camera capture for mobile */}
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    id="input-camera-file"
                  />

                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-5 py-3 rounded-lg bg-[#0F3D2A] text-white text-sm font-bold flex items-center gap-2 hover:bg-emerald-900 shadow-sm transition"
                    id="btn-take-photo"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take a Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-3 rounded-lg bg-white border border-stone-300 text-stone-800 text-sm font-bold flex items-center gap-2 hover:bg-stone-100 transition"
                    id="btn-choose-photo"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Choose from Files</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border-2 border-stone-300 max-h-80 bg-black flex items-center justify-center">
                  <img
                    src={photoPreview}
                    alt="Preview of civic issue"
                    className="max-h-80 w-auto object-contain"
                  />
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-xs font-semibold px-3 py-1 rounded-md">
                    Photo Attached
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 justify-between items-center bg-stone-50 p-3 rounded-lg border border-stone-200">
                  <span className="text-xs font-medium text-stone-600">
                    Photo ready for AI analysis
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50 rounded-md transition"
                      id="btn-remove-photo"
                    >
                      Remove Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 text-xs font-bold text-stone-700 hover:bg-stone-200 rounded-md transition"
                      id="btn-change-photo"
                    >
                      Choose Another Photo
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1 Footer */}
            <div className="flex justify-end pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-lg bg-[#0F3D2A] text-white font-bold text-sm flex items-center gap-2 hover:bg-emerald-900 transition shadow-sm"
                id="btn-step-1-next"
              >
                <span>Continue to Location</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="p-6 sm:p-8 space-y-6" id="step-2-location">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900 mb-1">
                Step 2: Where is the problem? (مقام کی تفصیل)
              </h2>
              <p className="text-sm text-stone-600">
                Specify the city, area, and any nearby landmark so municipal teams can locate the site easily.
              </p>
            </div>

            {/* GPS helper */}
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-medium text-stone-700">
                <MapPin className="w-4 h-4 text-[#0F3D2A]" />
                <span>Quickly fill from current location:</span>
              </div>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isLocating}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#0F3D2A] text-white hover:bg-emerald-900 transition disabled:opacity-50"
                id="btn-use-gps-reporting"
              >
                <Navigation className="w-3.5 h-3.5" />
                {isLocating ? 'Detecting Location…' : 'Use My Current Location'}
              </button>
            </div>
            {locationNotice && (
              <p className="text-xs text-stone-600 italic -mt-3">{locationNotice}</p>
            )}

            {/* City Selection */}
            <div>
              <label className="block text-sm font-bold text-stone-900 mb-1.5">
                City (شہر) *
              </label>
              <select
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  const details = getCityDetails(e.target.value);
                  setArea(details.popularAreas[0] || 'Main Area');
                  setCustomArea('');
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm font-semibold bg-white focus:ring-2 focus:ring-[#0F3D2A] focus:outline-hidden"
                id="select-report-city"
              >
                {PAKISTAN_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.province})
                  </option>
                ))}
              </select>
            </div>

            {/* Area Selection */}
            <div>
              <label className="block text-sm font-bold text-stone-900 mb-1.5">
                Area / Colony in {city} (علاقہ) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                {cityDetails.popularAreas.slice(0, 6).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      setArea(a);
                      setCustomArea('');
                    }}
                    className={`px-3 py-2 rounded-lg border text-xs font-bold transition text-left ${
                      area === a && !customArea
                        ? 'bg-emerald-50 border-[#0F3D2A] text-[#0F3D2A] ring-1 ring-[#0F3D2A]'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>

              {/* Or type specific colony */}
              <input
                type="text"
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                placeholder="Or type specific Sector / Block / Phase (e.g. Block G1, Phase 4)..."
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-[#0F3D2A] focus:outline-hidden"
                id="input-report-custom-area"
              />
            </div>

            {/* Street / Landmark */}
            <div>
              <label className="block text-sm font-bold text-stone-900 mb-1.5">
                Street / Landmark (قریبی معروف جگہ) <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={streetLandmark}
                onChange={(e) => setStreetLandmark(e.target.value)}
                placeholder="For example: Near Khokhar Chowk, in front of Dental Hospital..."
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-[#0F3D2A] focus:outline-hidden"
                id="input-report-landmark"
              />
            </div>

            {/* Step 2 Footer */}
            <div className="flex justify-between items-center pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-lg border border-stone-300 text-stone-700 font-bold text-sm flex items-center gap-1.5 hover:bg-stone-100 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-lg bg-[#0F3D2A] text-white font-bold text-sm flex items-center gap-2 hover:bg-emerald-900 transition shadow-sm"
                id="btn-step-2-next"
              >
                <span>Continue to Description</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Description & AI Analysis & Submit */}
        {step === 3 && (
          <div className="p-6 sm:p-8 space-y-6" id="step-3-description">
            <div>
              <h2 className="text-xl font-serif font-bold text-stone-900 mb-1">
                Step 3: What is happening? (مسئلے کی تفصیل)
              </h2>
              <p className="text-sm text-stone-600">
                Briefly describe what you see. Our AI will examine your photo and description to assign the responsible public department.
              </p>
            </div>

            {/* Location & Photo summary recap */}
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-stone-700">
                Reporting location: <strong>{city} • {customArea || area}</strong>
              </span>
              <span className="text-stone-500">
                {photoPreview ? '📷 Photo attached' : '⚠️ No photo attached'}
              </span>
            </div>

            {/* Description input */}
            <div>
              <label className="block text-sm font-bold text-stone-900 mb-1.5">
                Description (مسئلے کی وضاحت) <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="For example: “Garbage has not been collected for several days. Stray animals are gathering.” or “Main water supply pipeline is leaking on the street.”"
                className="w-full px-4 py-3 rounded-lg border border-stone-300 text-sm bg-white focus:ring-2 focus:ring-[#0F3D2A] focus:outline-hidden leading-relaxed"
                id="textarea-report-description"
              />
            </div>

            {/* AI Loading State */}
            {isAnalyzing && (
              <div className="bg-emerald-50 border-2 border-emerald-400 rounded-xl p-6 text-center space-y-3 animate-pulse">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#0F3D2A] text-white flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#0F3D2A]">
                  Checking your photo & classifying issue…
                </h3>
                <p className="text-xs text-stone-600 max-w-md mx-auto">
                  Identifying problem category, urgency severity, and the responsible Pakistani municipal department...
                </p>
              </div>
            )}

            {/* AI Error / Fallback prompt */}
            {aiError && !isAnalyzing && (
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 space-y-4">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">
                      We couldn't identify the problem automatically.
                    </h4>
                    <p className="text-xs text-amber-800 mt-0.5">
                      Please select the category manually below so your report is routed to the right authority.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">Issue Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {([
                        { id: 'garbage', label: 'Waste', urdu: 'کوڑا' },
                        { id: 'water', label: 'Water', urdu: 'پانی' },
                        { id: 'road', label: 'Roads', urdu: 'سڑک' },
                        { id: 'electricity', label: 'Power', urdu: 'بجلی' },
                        { id: 'other', label: 'Other', urdu: 'دیگر' },
                      ] as { id: IssueCategory; label: string; urdu: string }[]).map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setManualCategory(cat.id)}
                          className={`px-3 py-2 rounded-lg border text-xs font-bold ${
                            manualCategory === cat.id
                              ? 'bg-[#0F3D2A] text-white border-[#0F3D2A]'
                              : 'bg-white text-stone-700 border-stone-300'
                          }`}
                        >
                          {cat.label} <span className="font-normal text-[10px] opacity-70">({cat.urdu})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">How urgent is this?</label>
                    <div className="grid grid-cols-4 gap-2">
                      {([
                        { id: 'low', label: 'Low', color: 'blue', desc: 'Routine maintenance' },
                        { id: 'medium', label: 'Medium', color: 'yellow', desc: 'Affects daily life' },
                        { id: 'high', label: 'High', color: 'orange', desc: 'Safety concern' },
                        { id: 'urgent', label: 'Urgent', color: 'red', desc: 'Immediate danger' },
                      ] as { id: IssueSeverity; label: string; color: string; desc: string }[]).map((sev) => (
                        <button
                          key={sev.id}
                          type="button"
                          onClick={() => setManualSeverity(sev.id)}
                          className={`px-2 py-2 rounded-lg border text-xs font-bold text-center ${
                            manualSeverity === sev.id
                              ? sev.color === 'blue' ? 'bg-blue-600 text-white border-blue-600'
                                : sev.color === 'yellow' ? 'bg-yellow-500 text-stone-900 border-yellow-500'
                                : sev.color === 'orange' ? 'bg-orange-500 text-white border-orange-500'
                                : 'bg-red-600 text-white border-red-600'
                              : 'bg-white text-stone-700 border-stone-300'
                          }`}
                        >
                          {sev.label}
                          <span className="block text-[10px] font-normal opacity-80">{sev.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {useMemo(() => {
                    if (!manualSeverity) return null;
                    const guideline = SEVERITY_GUIDELINES.find((g) => g.level === manualSeverity);
                    if (!guideline) return null;
                    const categoryExamples = manualCategory ? guideline.examples[manualCategory] : [];
                    return (
                      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-700">
                            Expected Response Time
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            guideline.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                            guideline.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            guideline.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {guideline.responseTime}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed">{guideline.description}</p>
                        {categoryExamples.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Examples for {manualCategory}:</span>
                            <ul className="text-[11px] text-stone-600 mt-1 space-y-0.5 list-disc list-inside">
                              {categoryExamples.slice(0, 2).map((ex, i) => (
                                <li key={i}>{ex}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  }, [manualSeverity, manualCategory])}
                </div>
              </div>
            )}

            {/* Step 3 Footer Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-stone-200">
              <button
                type="button"
                disabled={isAnalyzing}
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-lg border border-stone-300 text-stone-700 font-bold text-sm flex items-center gap-1.5 hover:bg-stone-100 transition disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isAnalyzing}
                onClick={handleAnalyzeAndSubmit}
                className="px-8 py-3.5 rounded-lg bg-[#0F3D2A] hover:bg-emerald-900 text-white font-bold text-base flex items-center gap-2.5 shadow-md transition disabled:opacity-50"
                id="btn-submit-report"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>Submit Report (رپورٹ جمع کریں)</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Issue Submission Confirmation */}
        {step === 4 && createdIssue && (
          <div className="p-6 sm:p-10 space-y-6 text-center" id="step-4-confirmation">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#287A4B] flex items-center justify-center mx-auto border-2 border-emerald-300">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#0F3D2A] mb-1">
                Thank You — Your Problem Was Reported
              </h2>
              <p className="text-base text-stone-600 urdu-text">
                آپ کی رپورٹ کامیابی کے ساتھ درج کر لی گئی ہے
              </p>
            </div>

            {/* Summary Confirmation Ledger */}
            <div className="bg-[#F3F5F2] border-2 border-stone-300 rounded-xl p-5 text-left max-w-lg mx-auto space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200 text-xs text-stone-500">
                <span>Report ID: <strong>{createdIssue.id}</strong></span>
                <span className="stamp-badge stamp-reported text-[11px]">REPORTED</span>
              </div>

              <div className="space-y-1.5 text-sm">
                <p>
                  <span className="font-bold text-stone-700">Category:</span>{' '}
                  <strong className="capitalize text-stone-900">{createdIssue.category}</strong>
                </p>
                <p>
                  <span className="font-bold text-stone-700">Area:</span>{' '}
                  <strong className="text-stone-900">{createdIssue.area_text}, {createdIssue.city}</strong>
                </p>
                <p>
                  <span className="font-bold text-stone-700">Responsible Department:</span>{' '}
                  <strong className="text-[#0F3D2A] block">{createdIssue.department}</strong>
                </p>
                <p className="pt-2 text-xs text-stone-600 italic">
                  "{createdIssue.summary}"
                </p>
              </div>
            </div>

            {/* Department Helpline */}
            {useMemo(() => {
              const dept = GOVERNMENT_DEPARTMENTS.find(
                (d) => d.fullName.toLowerCase().includes(createdIssue.department.toLowerCase()) ||
                       d.abbreviation.toLowerCase() === createdIssue.department.toLowerCase()
              );
              if (!dept) return null;
              return (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left max-w-lg mx-auto space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Direct Helpline for {dept.abbreviation}</span>
                  </div>
                  <p className="text-xs text-stone-600">{dept.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {dept.helplines.map((h) => (
                      <a
                        key={h}
                        href={`tel:${h}`}
                        className="inline-flex items-center gap-1.5 bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-800 transition"
                      >
                        <Phone className="w-3 h-3" />
                        Call {h}
                      </a>
                    ))}
                    {dept.website && (
                      <a
                        href={dept.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-blue-700 hover:underline"
                      >
                        Official Website →
                      </a>
                    )}
                  </div>
                </div>
              );
            }, [createdIssue.department])}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateToIssues) onNavigateToIssues();
                }}
                className="px-6 py-3 rounded-lg bg-[#0F3D2A] text-white font-bold text-sm hover:bg-emerald-900 transition shadow-sm"
                id="btn-view-all-reports-confirm"
              >
                View Public Civic Issues
              </button>

              <button
                type="button"
                onClick={handleResetForm}
                className="px-6 py-3 rounded-lg bg-white border border-stone-300 text-stone-800 font-bold text-sm hover:bg-stone-100 transition"
                id="btn-report-another"
              >
                Report Another Problem
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
