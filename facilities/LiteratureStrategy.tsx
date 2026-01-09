
import React, { useState, useEffect } from 'react';
import { FacilityType, LiteratureStrategy, Language } from '../types';
import { translations } from '../translations';
import { runFacility } from '../geminiService';
import { Search, Loader2, Filter, Copy, Hash } from 'lucide-react';

interface Props {
  data?: LiteratureStrategy;
  onUpdate: (data: LiteratureStrategy) => void;
  initialValue?: string | null;
  onClearInitialValue: () => void;
  projectTitle: string;
  language: Language;
}

const LiteratureStrategyFacility: React.FC<Props> = ({ data, onUpdate, initialValue, onClearInitialValue, projectTitle, language }) => {
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const t = translations[language];

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      onClearInitialValue();
    }
  }, [initialValue]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await runFacility(FacilityType.LIT_STRATEGY, input || "Build a search strategy for the current blueprint.", {}, language);
      onUpdate(result);
    } catch (e) {
      alert("Failed to build search strategy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Search className="text-blue-600" /> {t.lit_strategy.title}
        </h2>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          {t.lit_strategy.desc}
          <span className="block font-bold mt-2 text-rose-600 uppercase text-[10px] tracking-widest">Strict Constraint: No References Provided.</span>
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[80px] mb-4"
          placeholder="Keywords or topics from gap analysis..."
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Filter size={18} />}
          {t.lit_strategy.generate_btn}
        </button>
      </div>

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.clusters || []).map((cluster, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-4">
                  <Hash size={16} className="text-blue-500" />
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">{cluster.category}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(cluster.terms || []).map((term, j) => (
                    <span key={j} className="bg-slate-50 text-slate-600 text-xs px-2.5 py-1 rounded border border-slate-100 font-medium">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 shadow-xl space-y-6 text-slate-100 border border-slate-800">
             <div>
               <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-4">{t.lit_strategy.boolean_strings}</p>
               <div className="space-y-3">
                 {(data.boolean_strings || []).map((str, i) => (
                   <div key={i} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex justify-between items-center group">
                     <code className="text-xs text-blue-100 font-mono leading-relaxed">{str}</code>
                     <button 
                        onClick={() => navigator.clipboard.writeText(str)}
                        className="p-2 hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100"
                     >
                        <Copy size={14} />
                     </button>
                   </div>
                 ))}
               </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-800">
               <div>
                 <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3">{t.lit_strategy.inclusion}</p>
                 <ul className="text-xs space-y-1 text-slate-400">
                   {(data.inclusion_terms || []).map((tl, i) => <li key={i}>+ {tl}</li>)}
                 </ul>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-3">{t.lit_strategy.exclusion}</p>
                 <ul className="text-xs space-y-1 text-slate-400">
                   {(data.exclusion_terms || []).map((tl, i) => <li key={i}>- {tl}</li>)}
                 </ul>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiteratureStrategyFacility;
