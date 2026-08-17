import React from 'react';
import { X, Shield, Phone, FileText, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface CivicRightsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CivicRightsModal: React.FC<CivicRightsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="civic-rights-modal">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-stone-300 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-[#0F3D2A] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-emerald-300" />
            <div>
              <h2 className="text-xl font-serif font-bold">Citizen Rights Guide</h2>
              <p className="text-xs text-emerald-200">شہری حقوق رہنمائی</p>
            </div>
          </div>
          <button onClick={onClose} className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Your Right to Report */}
          <section>
            <h3 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Your Right to Report (آپ کی رپورٹ کرنے کا حق)
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every Pakistani citizen has the right to report civic issues affecting their neighborhood. Under the Constitution of Pakistan (Article 25), all citizens are equal before law and entitled to equal protection of law. Reporting infrastructure problems is your civic duty and right.
            </p>
          </section>

          {/* How to File */}
          <section>
            <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              How to File an Official Complaint (شکایت کیسے درج کریں)
            </h3>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0F3D2A] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <div>
                  <p className="text-xs font-bold text-stone-800">Report on ShehriAwaz</p>
                  <p className="text-[11px] text-stone-600">Take a photo, add location details, and submit. This gives your report community visibility and helps track patterns.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0F3D2A] text-white flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <div>
                  <p className="text-xs font-bold text-stone-800">File on Citizen Portal (1050)</p>
                  <p className="text-[11px] text-stone-600">Use the Pakistan Citizen Portal app or call <strong>1050</strong> for official government tracking. Departments are legally required to respond within the deadline.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#0F3D2A] text-white flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <div>
                  <p className="text-xs font-bold text-stone-800">Call the Department Helpline</p>
                  <p className="text-[11px] text-stone-600">Direct calls to department helplines (WASA: 1334, DISCOs: 118, LWMC: 1139) often result in faster response for urgent issues.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Response Times */}
          <section>
            <h3 className="text-sm font-bold text-stone-900 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Expected Response Times (جواب کا وقت)
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs font-bold text-red-800">Urgent / Emergency</p>
                <p className="text-[11px] text-red-700">Immediate — call 1122 or 15</p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-xs font-bold text-orange-800">High Priority</p>
                <p className="text-[11px] text-orange-700">1–7 days</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs font-bold text-yellow-800">Medium Priority</p>
                <p className="text-[11px] text-yellow-700">3–14 days</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-bold text-blue-800">Low Priority</p>
                <p className="text-[11px] text-blue-700">7–30 days</p>
              </div>
            </div>
          </section>

          {/* What You Need */}
          <section>
            <h3 className="text-sm font-bold text-stone-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-purple-600" />
              What to Include in Your Report (رپورٹ میں کیا شامل کریں)
            </h3>
            <ul className="text-xs text-stone-600 space-y-1.5 ml-6 list-disc">
              <li><strong>Clear photo</strong> showing the problem (pothole, garbage pile, burst pipe, exposed wire)</li>
              <li><strong>Exact location</strong> — city, area/sector, street, nearby landmark</li>
              <li><strong>Brief description</strong> — what you see, how long it's been there, who's affected</li>
              <li><strong>Your contact</strong> (optional) — allows department to follow up with you directly</li>
            </ul>
          </section>

          {/* Emergency Numbers */}
          <section className="bg-[#09291C] text-white rounded-xl p-4">
            <h3 className="text-sm font-bold mb-2">Emergency Numbers (ہنگامی نمبر)</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-emerald-300 font-mono font-bold">1122</span> Rescue & Fire</div>
              <div><span className="text-emerald-300 font-mono font-bold">15</span> Police</div>
              <div><span className="text-emerald-300 font-mono font-bold">118</span> Electricity (all DISCOs)</div>
              <div><span className="text-emerald-300 font-mono font-bold">1334</span> WASA (Punjab)</div>
              <div><span className="text-emerald-300 font-mono font-bold">1139</span> LWMC (Lahore waste)</div>
              <div><span className="text-emerald-300 font-mono font-bold">1050</span> Citizen Portal</div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-[#0F3D2A] text-white font-bold text-sm hover:bg-emerald-900 transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
