
import React, { useState, useEffect } from 'react';
import { FacilityType, HypothesisSet, Language } from '../types';
import { translations } from '../translations';
import { runFacility } from '../geminiService';
import { FlaskConical, Loader2, Search, Target, Box } from 'lucide-react';

interface Props {
  data?: HypothesisSet;
  onUpdate: (data: HypothesisSet) => void;
  onPromoteToMapper: (context: string) => void;
  initialValue?: string | null;
  onClearInitialValue: () => void;
  projectTitle: string;
  language: Language;
}

const HypothesisEngine: React.FC<Props> = ({ data, onUpdate, onPromoteToMapper, initialValue, onClearInitialValue, projectTitle, language }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      onClearInitialValue();
    }
  }, [initialValue]);

  const handleGenerate = async () => {
    if (!input) return;
    setLoading(true);
    try {
      const result = await runFacility(FacilityType.HYPOTHESIS_ENGINE, input, data, language);
      onUpdate(result);
    } catch (e) {
      alert("Error generating hypotheses.");
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = () => {
    if (!data) return;
    const context = `Hypotheses:\n${data.hypotheses.map(h => `- ${h.statement}`).join('\n')}`;
    onPromoteToMapper(context);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <FlaskConical className="text-emerald-600" /> {t.hypothesis_engine.title}
        </h2>
        <p className="text-slate-600 text-sm mb-6">
          {t.hypothesis_engine.desc}
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all min-h-[120px] mb-4"
          placeholder={t.hypothesis_engine.placeholder}
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-100"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Target size={18} />}
            {t.hypothesis_engine.refine_btn}
          </button>
        </div>
      </div>

      {data && (
        <div className="space-y-6">
          <div className="flex justify-end">
             <button 
              onClick={handlePromote}
              className="bg-amber-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all active:scale-95"
             >
               <Box size={16} />
               {t.common.promote_to_mapper}
             </button>
          </div>

          {data.hypotheses.map((h, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="p-1 bg-emerald-600 flex justify-between px-6 py-2 items-center">
                <span className="text-[10px] font-bold text-emerald-50 uppercase tracking-widest">H{i+1}: Hypothesis</span>
                <span className="text-[10px] font-bold text-emerald-50 bg-emerald-500 px-2 py-0.5 rounded">{t.hypothesis_engine.score}: {h.testability_score}/10</span>
              </div>
              <div className="p-6">
                <p className="text-lg font-bold text-slate-900 mb-6 leading-tight">{h.statement}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-3 tracking-widest">{t.hypothesis_engine.variables}</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-[9px] font-bold text-emerald-600 uppercase">Independent</p>
                        <p className="text-xs font-medium">{(h.variables.independent || []).join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-indigo-600 uppercase">Dependent</p>
                        <p className="text-xs font-medium">{(h.variables.dependent || []).join(', ')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-1 tracking-widest">{t.hypothesis_engine.directionality}</p>
                      <p className="text-xs font-semibold text-slate-700 bg-slate-100 p-2 rounded">{h.directionality}</p>
                    </div>
                    <div>
                       <p className="text-[10px] font-extrabold text-slate-400 uppercase mb-1 tracking-widest">{t.hypothesis_engine.prediction}</p>
                       <p className="text-xs text-slate-600 italic leading-relaxed">"{h.prediction}"</p>
                    </div>
                  </div>

                  <div className="border-l border-slate-100 pl-6 flex flex-col justify-center">
                    <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                      <Search size={14} /> Measurement strategy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-slate-900 text-slate-100 p-8 rounded-2xl shadow-xl">
             <h3 className="font-bold border-b border-slate-700 pb-2 mb-4 text-emerald-400">{t.common.methodological_claims}</h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
               <div>
                 <p className="text-slate-400 font-bold mb-2 uppercase tracking-tighter">{t.common.user_claims}</p>
                 <ul className="list-disc pl-4 space-y-1">
                   {(data.claims.user_claims || []).map((c, i) => <li key={i}>{c}</li>)}
                 </ul>
               </div>
               <div>
                 <p className="text-slate-400 font-bold mb-2 uppercase tracking-tighter">{t.common.system_inferences}</p>
                 <ul className="list-disc pl-4 space-y-1">
                   {(data.claims.system_inferences || []).map((c, i) => <li key={i}>{c}</li>)}
                 </ul>
               </div>
               <div>
                 <p className="text-slate-400 font-bold mb-2 uppercase tracking-tighter">{t.common.assumptions}</p>
                 <ul className="list-disc pl-4 space-y-1">
                   {(data.claims.assumptions || []).map((c, i) => <li key={i}>{c}</li>)}
                 </ul>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HypothesisEngine;
