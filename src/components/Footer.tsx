import React from 'react';
import { Phone, ShieldAlert, Heart, Building2, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const helplines = [
    { name: 'Rescue & Medical', number: '1122', desc: 'Medical, Fire, Flood Emergencies' },
    { name: 'Police Emergency', number: '15', desc: 'Police Control & Citizen Safety' },
    { name: 'Power Outages (DISCOs)', number: '118', desc: 'LESCO, K-Electric, IESCO, FESCO' },
    { name: 'WASA Water / Sewage', number: '1334', desc: 'Water Supply & Main Line Leaks' },
    { name: 'Waste Management (LWMC)', number: '1139', desc: 'Garbage & Solid Waste Cleanup' },
    { name: 'Traffic Helpline', number: '1915', desc: 'Road Blockages & Traffic Police' },
  ];

  return (
    <footer className="bg-[#09291C] text-stone-300 border-t border-emerald-950 mt-16" id="main-footer">
      
      {/* Top Helplines Grid */}
      <div className="bg-[#061D14] border-b border-emerald-900/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-200">
              Pakistan Emergency & Civic Helplines Directory (ہنگامی ہیلپ لائنز)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {helplines.map((h) => (
              <div
                key={h.number}
                className="bg-[#09291C] p-3 rounded-lg border border-emerald-800/60 hover:border-emerald-600 transition"
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
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10 border-b border-emerald-900">
          
          {/* Brand & Purpose */}
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

          {/* Civic Values */}
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

          {/* Disclaimer & Transparency Box */}
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

        {/* Bottom Bar */}
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
