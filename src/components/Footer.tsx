import React, { useState } from 'react';
import { Phone, ShieldAlert, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { GOVERNMENT_DEPARTMENTS } from '../data/governmentDepartments';
import { IssueCategory } from '../types';

const EMERGENCY_HELPLINES = [
  { name: 'Rescue & Medical', nameUrdu: 'ร rescues 1122', number: '1122', desc: 'Medical, Fire, Flood Emergencies', descUrdu: 'طبیج، آگ، سیلاب' },
  { name: 'Police Emergency', nameUrdu: 'پولیس', number: '15', desc: 'Police Control & Citizen Safety', descUrdu: 'پولیس کنٹرول' },
  { name: 'Power Outages (DISCOs)', nameUrdu: 'بجلی', number: '118', desc: 'LESCO, K-Electric, IESCO, FESCO', descUrdu: 'بجلی کی کمی' },
  { name: 'WASA Water / Sewage', nameUrdu: 'واٹا', number: '1334', desc: 'Water Supply & Main Line Leaks', descUrdu: 'پانی کی فراہمی' },
  { name: 'Waste Management (LWMC)', nameUrdu: 'کوڑا', number: '1139', desc: 'Garbage & Solid Waste Cleanup', descUrdu: 'کوڑے کا انتظام' },
  { name: 'Traffic Helpline', nameUrdu: 'ٹرافک', number: '1915', desc: 'Road Blockages & Traffic Police', descUrdu: 'ٹرافک پولیس' },
];

const CATEGORY_LABELS: Record<IssueCategory, { label: string; urdu: string }> = {
  garbage: { label: 'Waste & Sanitation', urdu: 'کوڑا و صفائی' },
  water: { label: 'Water & Sewerage', urdu: 'پانی و نکاسی آب' },
  road: { label: 'Roads & Infrastructure', urdu: 'سڑکیں و زیر بنیاد' },
  electricity: { label: 'Power Supply', urdu: 'بجلی کی فراہمی' },
  other: { label: 'Other Services', urdu: 'دیگر خدمات' },
};

export const Footer: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  const displayed = expanded ? GOVERNMENT_DEPARTMENTS : GOVERNMENT_DEPARTMENTS.slice(0, 5);

  return (
    <footer className="bg-[#09291C] text-stone-300 border-t border-emerald-950 mt-16" id="main-footer">

      {/* Emergency Helplines */}
      <div className="bg-[#061D14] border-b border-emerald-900/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-200">
              Pakistan Emergency & Civic Helplines (ہنگامی ہیلپ لائنز)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {EMERGENCY_HELPLINES.map((h) => (
              <a
                key={h.number}
                href={`tel:${h.number}`}
                className="bg-[#09291C] p-3 rounded-lg border border-emerald-800/60 hover:border-emerald-600 transition block"
              >
                <div className="text-lg sm:text-xl font-bold text-white font-serif">
                  {h.number}
                </div>
                <div className="text-xs font-bold text-emerald-300 truncate">
                  {h.name}
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5 leading-tight line-clamp-1">
                  {h.desc}
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Government Departments Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-emerald-900">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-200">
            Departments We Route To (ہمارے متعلقہ محکمے)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayed.map((dept) => (
            <div
              key={dept.abbreviation}
              className="bg-[#0D3826] p-4 rounded-xl border border-emerald-800/50 hover:border-emerald-600 transition"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                    {dept.abbreviation}
                  </span>
                  <span className="text-[10px] text-stone-500 ml-2 font-urdu">{dept.fullNameUrdu}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded text-stone-300 bg-stone-800 whitespace-nowrap">
                  {CATEGORY_LABELS[dept.category]?.label}
                </span>
              </div>

              <p className="text-xs text-stone-200 font-medium mb-1 leading-snug">{dept.fullName}</p>
              <p className="text-[10px] text-stone-400 leading-relaxed mb-2">{dept.description}</p>

              <div className="flex flex-wrap items-center gap-2 text-[10px]">
                {dept.helplines.map((h) => (
                  <a
                    key={h}
                    href={`tel:${h}`}
                    className="text-amber-400 hover:text-amber-300 font-mono font-bold"
                  >
                    {h}
                  </a>
                ))}
                <a
                  href={dept.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 underline-offset-2"
                >
                  Official Website
                </a>
                <span className="text-stone-500">
                  {dept.cities.slice(0, 3).join(', ')}{dept.cities.length > 3 ? ` +${dept.cities.length - 3} more` : ''}
                </span>
              </div>
            </div>
          ))}
        </div>

        {GOVERNMENT_DEPARTMENTS.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 mx-auto flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition"
          >
            {expanded ? (
              <>Show fewer <ChevronUp className="w-3 h-3" /></>
            ) : (
              <>View all {GOVERNMENT_DEPARTMENTS.length} departments <ChevronDown className="w-3 h-3" /></>
            )}
          </button>
        )}
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-emerald-900">

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
                <span className="font-serif font-black text-2xl text-[#0F3D2A]">ش</span>
              </div>
              <div>
                <span className="text-xl font-serif font-bold text-white">ShehriAwaz</span>
                <span className="text-sm font-urdu text-emerald-300 ml-2">شہری آواز</span>
              </div>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed">
              ShehriAwaz (Citizen's Voice) is an open civic platform helping Pakistani citizens report neighborhood issues, track municipal accountability, and access local public information in plain language.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-emerald-200 uppercase tracking-wider">
              Responsible Civic Engagement
            </h4>
            <ul className="text-xs space-y-1.5 text-stone-400">
              <li>• Public transparency for neighborhood reports</li>
              <li>• Clustering duplicate issues to prevent clutter</li>
              <li>• Direct department routing for municipal efficiency</li>
              <li>• Community verification of resolved civic works</li>
            </ul>
          </div>

          <div className="bg-[#0D3826] p-4 rounded-xl border border-emerald-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold">
              <ShieldAlert className="w-4 h-4" />
              <span>Official Disclaimer (اہم وضاحت)</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              ShehriAwaz is an independent citizen reporting tool and does not replace official emergency services. In case of immediate danger, please contact Rescue 1122 or Police 15.
            </p>
            <p className="text-[11px] text-emerald-200/90 font-medium">
              ShehriAwaz is not a government department.
            </p>
          </div>

        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © {new Date().getFullYear()} ShehriAwaz (شہری آواز). Built for the citizens of Pakistan.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-emerald-300">Your voice about your city.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
