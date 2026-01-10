import React, { useState, useEffect } from 'react';
import { FacilityType, HypothesisSet, Language } from '../types';
import { translations } from '../translations';
import { runFacility } from '../geminiService';
import { FlaskConical, Loader2, Target, Box, ChevronRight, Activity } from 'lucide-react';

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
      console.error(e);
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
    <div className="space-y-12">
      <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
            <FlaskConical size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.hypothesis_engine.title}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.hypothesis_engine.desc}</p>
          </div>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all min-h-[140px] mb-6"
          placeholder={t.hypothesis_engine.placeholder}
        />
        <div className="flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-emerald-600 text-white px-10 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-3 shadow-xl shadow-emerald-900/10 active:scale-[0.98] transition-all"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Target size={18} />}
            {t.hypothesis_engine.refine_btn}
          </button>
        </div>
      </section>

      {data && (
        <div className="space-y-8 pb-20">
          <div className="flex justify-between items-center px-4">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Testable Propositions</span>
             <button 
              onClick={handlePromote}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-indigo-700 shadow-lg active:scale-95 transition-all"
             >
               <Box size={14} />
               {t.common.promote_to_mapper}
             </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {data.hypotheses.map((h, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all">
                <div className="bg-emerald-600 px-8 py-3.5 flex justify-between items-center">
                  <span className="text-[9px] font-black text-emerald-50 uppercase tracking-[0.3em]">Scaffold H{i+1}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-emerald-100 uppercase tracking-widest">Testability Score</span>
                    <span className="text-[10px] font-black text-emerald-900 bg-emerald-300 px-3 py-0.5 rounded-full">{h.testability_score}/10</span>
                  </div>
                </div>
                <div className="p-10">
                  <p className="text-xl font-bold text-slate-900 mb-10 leading-snug italic">"{h.statement}"</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="space-y-6">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Activity size={12} className="text-emerald-500" /> {t.hypothesis_engine.variables}
                      </p>
                      <div className="space-y-4">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                          <p className="text-[9px] font-black text-emerald-600 uppercase mb-1.5 tracking-widest">Independent (IV)</p>
                          <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{(h.variables.independent || []).join(', ')}</p>
                        </div>
                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/50">
                          <p className="text-[9px] font-black text-indigo-600 uppercase mb-1.5 tracking-widest">Dependent (DV)</p>
                          <p className="text-[11px] font-bold text-slate-700 leading-relaxed">{(h.variables.dependent || []).join(', ')}</p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{t.hypothesis_engine.directionality}</p>
                          <p className="text-xs font-bold text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-100">{h.directionality}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">{t.hypothesis_engine.prediction}</p>
                           <p className="text-xs text-slate-600 font-medium italic leading-relaxed border-l-2 border-slate-100 pl-4">{h.prediction}</p>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-slate-50">
                        <button className="text-[10px] font-black text-indigo-600 flex items-center gap-2 uppercase tracking-widest hover:translate-x-1 transition-all">
                          Measurement strategy details <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HypothesisEngine;