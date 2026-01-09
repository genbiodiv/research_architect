
import React, { useState } from 'react';
import { FacilityType, QuestionMap, Language } from '../types';
import { translations } from '../translations';
import { runFacility } from '../geminiService';
import { GitPullRequest, ArrowRight, Loader2, Plus, AlertCircle, Sparkles, FlaskConical } from 'lucide-react';

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
  const [error, setError] = useState(false);
  const t = translations[language];

  const handleGenerate = async (overrideInput?: string, nodeId?: string) => {
    const targetInput = overrideInput || input;
    if (!targetInput) return;

    if (nodeId) setPivotingId(nodeId);
    setLoading(true);
    setError(false);
    
    try {
      const result = await runFacility(FacilityType.QUESTION_EXPLORER, targetInput, data, language);
      if (result.error) {
        setError(true);
      } else {
        onUpdate(result);
        setInput(targetInput);
      }
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
      setPivotingId(null);
    }
  };

  const hasData = data && !error;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 ring-1 ring-slate-200/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-indigo-600">
          <GitPullRequest size={120} />
        </div>
        
        <h2 className="text-3xl font-black text-slate-900 mb-3 flex items-center gap-4">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <GitPullRequest size={28} />
          </div>
          {t.question_explorer.title}
        </h2>
        <p className="text-slate-500 text-base mb-8 max-w-2xl font-medium leading-relaxed">
          {t.question_explorer.desc}
        </p>

        <div className="flex gap-4 p-2 bg-slate-50 rounded-2xl border border-slate-100 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            className="flex-1 bg-transparent px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none font-semibold text-lg"
            placeholder={t.question_explorer.placeholder}
          />
          <button
            onClick={() => handleGenerate()}
            disabled={loading}
            className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-black text-base hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-3 transition-all active:scale-95 shadow-2xl shadow-indigo-200 whitespace-nowrap"
          >
            {loading && !pivotingId ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            {t.question_explorer.generate_map}
          </button>
        </div>

        {error && (
          <div className="mt-6 flex items-center gap-3 text-rose-600 bg-rose-50 p-4 rounded-xl border border-rose-100 font-bold text-sm animate-pulse">
            <AlertCircle size={20} />
            {language === 'en' ? 'Structure Generation Failed. Try narrowing your inquiry.' : 'Fallo en la generación de estructura. Intente refinar su consulta.'}
          </div>
        )}
      </div>

      {hasData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="col-span-full bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[2.5rem] p-12 text-center shadow-2xl shadow-indigo-200 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] group-hover:scale-150 transition-transform duration-1000"></div>
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.4em] mb-4 relative z-10">{t.question_explorer.root_question}</p>
            <p className="text-3xl font-bold text-white max-w-4xl mx-auto leading-tight italic relative z-10">"{data.root_question}"</p>
            <button 
              onClick={() => onPromoteToHypothesis(data.root_question)}
              className="mt-6 relative z-10 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-white/20 transition-all backdrop-blur-md"
            >
              {t.common.promote_to_hypothesis}
            </button>
          </div>

          {(data.nodes || []).map((node, i) => (
            <div 
              key={node.id || i} 
              className={`text-left bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition-all group ring-1 ring-slate-100 relative overflow-hidden ${loading ? 'cursor-wait' : ''}`}
            >
              {pivotingId === (node.id || `node-${i}`) && (
                <div className="absolute inset-0 bg-indigo-600/5 backdrop-blur-[1px] flex items-center justify-center z-20">
                  <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-indigo-100 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{t.question_explorer.pivoting}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-100">
                  {node.axis}
                </span>
                <div className="flex gap-2">
                   <button 
                    onClick={() => onPromoteToHypothesis(node.text)}
                    className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all opacity-0 group-hover:opacity-100 shadow-lg shadow-emerald-100"
                    title={t.common.promote_to_hypothesis}
                   >
                     <FlaskConical size={18} />
                   </button>
                   <button 
                    onClick={() => handleGenerate(node.text, node.id || `node-${i}`)}
                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm"
                   >
                     <ArrowRight size={18} />
                   </button>
                </div>
              </div>
              
              <p className="text-lg font-bold text-slate-800 leading-tight group-hover:text-indigo-900 transition-colors">{node.text}</p>
              
              <div className="mt-8 pt-4 border-t border-slate-50 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkles size={14} className="text-indigo-400" />
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{t.question_explorer.drill_down}</span>
              </div>
            </div>
          ))}

          <div className="col-span-full bg-slate-900 text-slate-100 p-12 rounded-[3rem] shadow-2xl space-y-10 border border-slate-800">
            <h3 className="text-2xl font-black border-b border-slate-800 pb-6 text-indigo-400 flex items-center gap-5">
               <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]"></div>
               {t.common.methodological_claims}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-sm">
              <div className="space-y-5">
                <p className="font-black text-slate-500 uppercase tracking-[0.25em] text-[10px]">{t.common.user_claims}</p>
                <ul className="space-y-4">
                  {(data.claims?.user_claims || []).map((c, i) => (
                    <li key={i} className="flex gap-4 text-slate-300 font-medium bg-slate-800/40 p-4 rounded-2xl border border-slate-800/50 hover:bg-slate-800 transition-colors">
                      <span className="text-indigo-500 font-bold mt-1">#</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-5">
                <p className="font-black text-slate-500 uppercase tracking-[0.25em] text-[10px]">{t.common.system_inferences}</p>
                <ul className="space-y-4">
                  {(data.claims?.system_inferences || []).map((c, i) => (
                    <li key={i} className="flex gap-4 text-slate-300 font-medium bg-slate-800/40 p-4 rounded-2xl border border-slate-800/50 hover:bg-slate-800 transition-colors">
                      <span className="text-amber-500 font-bold mt-1">?</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-5">
                <p className="font-black text-slate-500 uppercase tracking-[0.25em] text-[10px]">{t.common.assumptions}</p>
                <ul className="space-y-4">
                  {(data.claims?.assumptions || []).map((c, i) => (
                    <li key={i} className="flex gap-4 text-slate-400 font-medium bg-slate-800/20 p-4 rounded-2xl border border-slate-800/30 italic hover:bg-slate-800 transition-colors">
                      <span className="text-rose-500 font-bold mt-1">!</span> {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionExplorer;
