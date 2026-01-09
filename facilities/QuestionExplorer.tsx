
import React, { useState } from 'react';
import { FacilityType, QuestionMap, Language } from '../types';
import { translations } from '../translations';
import { runFacility } from '../geminiService';
import { GitPullRequest, ArrowRight, Loader2, Plus, Sparkles, FlaskConical, Search, Info } from 'lucide-react';

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
    <div className="space-y-10">
      <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Search size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t.question_explorer.title}</h2>
              <p className="text-xs text-slate-500 font-medium">{t.question_explorer.desc}</p>
            </div>
          </div>
          
          <div className="flex gap-2 mt-8">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium transition-all"
              placeholder={t.question_explorer.placeholder}
            />
            <button
              onClick={() => handleGenerate()}
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading && !pivotingId ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
              {t.question_explorer.generate_map}
            </button>
          </div>
        </div>
      </section>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Map Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 text-white p-10 rounded-[2rem] relative overflow-hidden group shadow-2xl border border-slate-800">
               <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                 <Sparkles size={120} />
               </div>
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4 block">{t.question_explorer.root_question}</span>
               <p className="text-2xl font-bold italic leading-tight mb-8">"{data.root_question}"</p>
               <button 
                onClick={() => onPromoteToHypothesis(data.root_question)}
                className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all"
               >
                 {t.common.promote_to_hypothesis}
               </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(data.nodes || []).map((node, i) => (
                <div key={node.id || i} className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden border-l-4 border-l-indigo-500/30">
                  {pivotingId === (node.id || `node-${i}`) && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
                      <Loader2 size={24} className="animate-spin text-indigo-600" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded uppercase">{node.axis}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onPromoteToHypothesis(node.text)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title={t.common.promote_to_hypothesis}
                      >
                        <FlaskConical size={14} />
                      </button>
                      <button 
                        onClick={() => handleGenerate(node.text, node.id || `node-${i}`)}
                        className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-slate-800 leading-snug">{node.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Claims / Meta Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-6">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                <Info size={14} className="text-indigo-600" />
                {t.common.methodological_claims}
              </h3>
              
              <div className="space-y-8">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">User Premise</p>
                  <div className="space-y-2">
                    {(data.claims?.user_claims || []).map((c, i) => (
                      <p key={i} className="text-[11px] text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {c}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">System Inferences</p>
                  <div className="space-y-2">
                    {(data.claims?.system_inferences || []).map((c, i) => (
                      <p key={i} className="text-[11px] text-slate-600 font-medium leading-relaxed bg-indigo-50/30 p-2.5 rounded-lg border border-indigo-100/20 italic">
                        {c}
                      </p>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Hidden Assumptions</p>
                  <div className="space-y-2">
                    {(data.claims?.assumptions || []).map((c, i) => (
                      <p key={i} className="text-[11px] text-rose-600 font-bold leading-relaxed bg-rose-50/30 p-2.5 rounded-lg border border-rose-100/50">
                        • {c}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionExplorer;
