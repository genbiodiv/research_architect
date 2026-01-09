
import React, { useState, useEffect } from 'react';
import { FacilityType, ExpertiseHeatmap, Language } from '../types';
import { translations } from '../translations';
import { runFacility } from '../geminiService';
import { Layers, Loader2, Gauge, AlertCircle, Search } from 'lucide-react';

interface Props {
  data?: ExpertiseHeatmap;
  onUpdate: (data: ExpertiseHeatmap) => void;
  onPromoteToLit: (topics: string) => void;
  initialValue?: string | null;
  onClearInitialValue: () => void;
  projectTitle: string;
  language: Language;
}

const ExpertiseDetector: React.FC<Props> = ({ data, onUpdate, onPromoteToLit, initialValue, onClearInitialValue, projectTitle, language }) => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const t = translations[language];

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      onClearInitialValue();
    }
  }, [initialValue]);

  const handleScan = async () => {
    setLoading(true);
    try {
      const result = await runFacility(FacilityType.EXPERTISE_DETECTOR, input || "Scan for knowledge gaps.", {}, language);
      onUpdate(result);
    } catch (e) {
      alert("Gap analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = () => {
    if (!data) return;
    const topics = data.components.flatMap(c => c.learning_topics).join(', ');
    onPromoteToLit(topics);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Layers className="text-indigo-600" /> {t.expertise_detector.title}
        </h2>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          {t.expertise_detector.desc}
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all min-h-[80px] mb-4"
          placeholder="Additional context for expertise scan..."
        />

        <button
          onClick={handleScan}
          disabled={loading}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Gauge size={18} />}
          {t.expertise_detector.scan_btn}
        </button>
      </div>

      {data && (
        <div className="space-y-8">
          <div className="flex justify-end">
             <button 
              onClick={handlePromote}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all active:scale-95"
             >
               <Search size={16} />
               {t.common.promote_to_lit}
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data.components || []).map((c, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all">
                <div className={`h-2 w-full ${
                  c.status === 'green' ? 'bg-emerald-500' : 
                  c.status === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                     <h3 className="font-bold text-slate-900 text-sm">{c.topic}</h3>
                     <span className="text-[9px] font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-tighter">
                       {c.depth_required} {t.expertise_detector.depth}
                     </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-4 font-medium leading-relaxed">{c.complexity}</p>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.expertise_detector.learning_topics}</p>
                    <div className="flex flex-wrap gap-1">
                      {(c.learning_topics || []).map((tl, j) => (
                        <span key={j} className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                          {tl}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="col-span-full bg-rose-50 border-2 border-rose-100 rounded-2xl p-6 flex items-start gap-4">
              <AlertCircle className="text-rose-500 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-rose-900 mb-1">{t.expertise_detector.boundary_warning}</p>
                <p className="text-xs text-rose-700 leading-relaxed">
                  The AI detected high complexity in {(data.components || []).filter(c => c.status === 'red').length} areas. 
                  Consider modularizing these components or seeking specialized collaboration.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpertiseDetector;
