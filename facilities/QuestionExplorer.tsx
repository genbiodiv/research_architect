import React, { useState } from 'react';
import { FacilityType, QuestionMap, Language } from '../types';
import { translations } from '../translations';
import { runFacility } from '../geminiService';
import { GitPullRequest, ArrowRight, Loader2, Plus, Sparkles, FlaskConical, Search, Target } from 'lucide-react';

interface Props {
  data?: QuestionMap;
  onUpdate: (data: QuestionMap) => void;
  onPromoteToHypothesis: (question: string) => void;
  projectTitle: string;
  language: Language;
}

const QuestionExplorer: React.FC<Props> = ({ data, onUpdate, onPromoteToHypothesis, projectTitle, language }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pivotingId, setPivotingId] = useState<string | null>(null);
  const t = translations[language];

  const handleGenerate = async (overrideInput?: string, nodeId?: string) => {
    const targetInput = overrideInput || input;
    if (!targetInput) return;
    if (nodeId) setPivotingId(nodeId);
    setLoading(true);
    try {
      const result = await runFacility(FacilityType.QUESTION_EXPLORER, targetInput, data, language);
      onUpdate(result);
      if (!overrideInput) setInput(targetInput);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setPivotingId(null);
    }
  };

  return (
    <div className="space-y-12">
      <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
          <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Search size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.question_explorer.title}</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t.question_explorer.desc}</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            placeholder={t.question_explorer.placeholder}
          />
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="bg-slate-900 text-white px-8 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center gap-3 shadow-xl active:scale-[0.98]"
          >
            {loading && !pivotingId ? <Loader2 className="animate-spin" size={16} /> : <Target size={16} />}
            {t.question_explorer.generate_map}
          </button>
        </div>
      </section>

      {data && (
        <div className="space-y-10">
          <div className="bg-slate-900 text-white p-12 rounded-[3rem] relative overflow-hidden shadow-2xl border border-slate-800">
             <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
               <Sparkles size={160} />
             </div>
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-6 block">{t.question_explorer.root_question}</span>
             <p className="text-3xl font-bold italic leading-tight mb-10">"{data.root_question}"</p>
             <button 
              onClick={() => onPromoteToHypothesis(data.root_question)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95 flex items-center gap-3"
             >
               <FlaskConical size={14} />
               {t.common.promote_to_hypothesis}
             </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {(data.nodes || []).map((node, i) => (
              <div key={node.id || i} className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all group relative overflow-hidden">
                {pivotingId === (node.id || `node-${i}`) && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                    <Loader2 size={28} className="animate-spin text-indigo-600" />
                  </div>
                )}
                <div className="flex justify-between items-start mb-6">
                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg uppercase tracking-widest">{node.axis}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => onPromoteToHypothesis(node.text)}
                      className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      title={t.common.promote_to_hypothesis}
                    >
                      <FlaskConical size={16} />
                    </button>
                    <button 
                      onClick={() => handleGenerate(node.text, node.id || `node-${i}`)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-800 leading-relaxed italic">"{node.text}"</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionExplorer;