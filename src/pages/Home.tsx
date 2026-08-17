import React, { useMemo } from 'react';
import { CivicIssue, UserProfile } from '../types';
import { DashboardStats } from '../components/DashboardStats';
import { IssueCard } from '../components/IssueCard';
import { getDepartmentsByCity } from '../data/governmentDepartments';
import { 
  PlusCircle, 
  Layers, 
  MapPin, 
  Camera, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  Phone, 
  MessageSquareQuote,
  Newspaper
} from 'lucide-react';

interface HomeProps {
  issues: CivicIssue[];
  selectedCity: string;
  selectedArea: string;
  onOpenLocationModal: () => void;
  onOpenReportModal: () => void;
  onNavigateToIssues: (categoryFilter?: string) => void;
  onNavigateToTab: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({
  issues,
  selectedCity,
  selectedArea,
  onOpenLocationModal,
  onOpenReportModal,
  onNavigateToIssues,
  onNavigateToTab,
}) => {
  // Filter issues for current location
  const locationIssues = issues.filter((i) => {
    if (i.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
    if (selectedArea !== 'All Areas' && i.area_text.toLowerCase() !== selectedArea.toLowerCase()) {
      return false;
    }
    return true;
  });

  const displayIssues = locationIssues.length > 0 ? locationIssues : issues;
  const recentIssues = displayIssues.slice(0, 4);

  return (
    <div className="space-y-10 pb-12" id="home-page-root">
      
      {/* Hero Section */}
      <section className="bg-[#0F3D2A] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden" id="hero-section">
        {/* Subtle patterned background */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            
            <div className="max-w-2xl space-y-4">
              
              <div className="inline-flex items-center gap-2 bg-emerald-900/80 border border-emerald-700/60 px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-200">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Official Citizen Public Service Portal</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black leading-tight tracking-tight">
                Civic Information & Problem Reporting for Pakistan
              </h1>

              <p className="text-sm font-urdu text-emerald-300 font-bold text-lg">
                اپنے محلے اور شہر کے مسائل درج کریں اور پیش رفت دیکھیں
              </p>

              <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed font-normal pt-1">
                See what civic issues are being reported in your area, track public department accountability, and submit neighborhood problems with a simple photo.
              </p>

              {/* High-visibility Action Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3.5">
                <button
                  onClick={onOpenReportModal}
                  className="px-6 py-3.5 rounded-xl bg-[#B88917] hover:bg-[#a37913] text-stone-950 font-bold text-base flex items-center gap-2.5 shadow-lg transition transform hover:-translate-y-0.5 cursor-pointer"
                  id="hero-btn-report-problem"
                >
                  <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                  <span>Report a Problem (مسئلہ درج کریں)</span>
                </button>

                <button
                  onClick={() => onNavigateToIssues()}
                  className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/30 flex items-center gap-2 transition"
                  id="hero-btn-view-issues"
                >
                  <Layers className="w-5 h-5" />
                  <span>View Public Issues</span>
                </button>
              </div>

            </div>

            {/* Right Location Banner Widget */}
            <div className="lg:w-80 bg-white text-stone-900 rounded-2xl p-6 shadow-xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Your Civic Area</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>

              <div>
                <div className="text-xs font-semibold text-stone-500">Currently Monitoring:</div>
                <div className="text-2xl font-serif font-black text-[#0F3D2A] mt-0.5">
                  {selectedCity}
                </div>
                <div className="text-sm font-bold text-stone-700 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-4 h-4 text-[#0F3D2A]" />
                  <span>{selectedArea}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onOpenLocationModal}
                  className="w-full py-2.5 px-4 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-stone-300"
                  id="btn-hero-change-location"
                >
                  <span>Switch City or Area</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Statistics Section */}
        <section>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              Civic Activity in {selectedCity}
            </h2>
            <button
              onClick={onOpenLocationModal}
              className="text-xs font-bold text-[#0F3D2A] hover:underline"
            >
              Change Area ({selectedArea})
            </button>
          </div>
          <DashboardStats
            issues={displayIssues}
            selectedCity={selectedCity}
            selectedArea={selectedArea}
          />
        </section>

        {/* 3 Step Explanation for Older Citizens */}
        <section className="bg-white rounded-2xl border border-stone-300 p-6 sm:p-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#0F3D2A] bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
              Simple & Accessible Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-2">
              How ShehriAwaz Works for Citizens
            </h2>
            <p className="text-sm text-stone-600 mt-1 urdu-text">
              آسان ۳ مراحل میں اپنے محلے کا مسئلہ درج کریں
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-[#F8FAF7] border border-stone-200 rounded-xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0F3D2A] text-white flex items-center justify-center mx-auto font-serif font-black text-lg shadow-xs">
                1
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                1. Take a Photo
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Capture the problem with your phone or camera. No complicated forms or technical jargon needed.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#F8FAF7] border border-stone-200 rounded-xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0F3D2A] text-white flex items-center justify-center mx-auto font-serif font-black text-lg shadow-xs">
                2
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                2. AI Identifies Department
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Our Gemini AI identifies the issue category, severity, and responsible public department (WASA, LWMC, LESCO).
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#F8FAF7] border border-stone-200 rounded-xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#0F3D2A] text-white flex items-center justify-center mx-auto font-serif font-black text-lg shadow-xs">
                3
              </div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                3. Track Public Ledger
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Follow the issue status (Reported → In Review → Resolved) with verified community tracking stamps.
              </p>
            </div>

          </div>
        </section>

        {/* Categories Quick Nav */}
        <section>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-4">
            Explore Issues by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {[
              { id: 'garbage', label: 'Garbage & Waste', urdu: 'کوڑا کرکٹ', desc: 'Solid waste, bins & dumping' },
              { id: 'water', label: 'Water & Sewerage', urdu: 'پانی اور سیوریج', desc: 'Pipe leaks, contamination, sewage' },
              { id: 'road', label: 'Roads & Potholes', urdu: 'سڑکیں اور گڑھے', desc: 'Damaged streets & manholes' },
              { id: 'electricity', label: 'Electricity & Wires', urdu: 'بجلی اور تاریں', desc: 'Loose cables, transformers' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => onNavigateToIssues(cat.id)}
                className="bg-white p-5 rounded-xl border border-stone-200 hover:border-[#0F3D2A] hover:shadow-md transition text-left space-y-1 group"
              >
                <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  {cat.label}
                </div>
                <div className="text-lg font-serif font-bold text-stone-900 group-hover:text-[#0F3D2A]">
                  {cat.urdu}
                </div>
                <p className="text-xs text-stone-500 pt-1">
                  {cat.desc}
                </p>
              </button>
            ))}
          </div>
        </section>

        {/* Government Departments for Current City */}
        {useMemo(() => {
          const cityDepts = getDepartmentsByCity(selectedCity);
          if (cityDepts.length === 0) return null;
          return (
            <section className="bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>Key Government Departments</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 mb-1">
                Who Handles What in {selectedCity}
              </h2>
              <p className="text-xs text-stone-500 mb-6">
                Know your responsible departments and their helplines before filing a report
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {cityDepts.map((dept) => (
                  <div
                    key={dept.abbreviation}
                    className="bg-[#F8FAF7] border border-stone-200 rounded-xl p-4 hover:border-[#0F3D2A] hover:shadow-sm transition"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="text-sm font-bold text-stone-900 leading-snug">{dept.fullName}</h3>
                        <span className="text-xs font-urdu text-emerald-800">{dept.fullNameUrdu}</span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-500 leading-relaxed mb-3">{dept.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {dept.helplines.slice(0, 2).map((h) => (
                        <a
                          key={h}
                          href={`tel:${h}`}
                          className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-md hover:bg-emerald-200 transition"
                        >
                          <Phone className="w-3 h-3" />
                          {h}
                        </a>
                      ))}
                      {dept.website && (
                        <a
                          href={dept.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline"
                        >
                          Website →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        }, [selectedCity])}

        {/* Recent Civic Ledger Cards */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                Recent Civic Reports in {selectedArea}
              </h2>
              <p className="text-xs text-stone-500">
                Public transparency ledger updated by citizens
              </p>
            </div>

            <button
              onClick={() => onNavigateToIssues()}
              className="inline-flex items-center gap-1 text-sm font-bold text-[#0F3D2A] hover:underline"
            >
              <span>View All Reports</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {recentIssues.map((iss) => (
              <IssueCard key={iss.id} issue={iss} />
            ))}
          </div>
        </section>

        {/* Ask Assistant Banner */}
        <section className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase tracking-wider">
              <MessageSquareQuote className="w-4 h-4" />
              <span>Civic Knowledgebase & Rights</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif font-bold">
              Unsure which government department is responsible?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              Ask our civic assistant about resolution timelines, WASA/LWMC procedures, and official helpline numbers for {selectedCity}.
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab('chat')}
            className="px-6 py-3 rounded-xl bg-white text-[#0F3D2A] font-bold text-sm hover:bg-emerald-50 transition shadow-sm self-start md:self-center shrink-0"
          >
            Ask ShehriAwaz Assistant
          </button>
        </section>

      </main>

    </div>
  );
};
