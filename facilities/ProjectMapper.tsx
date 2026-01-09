
import React, { useState, useEffect } from 'react';
import { FacilityType, ProjectBlueprint, Language, BlueprintNode } from '../types';
import { translations } from '../translations';
import { runFacility } from '../geminiService';
import { Box, Loader2, Workflow, AlertTriangle, CheckCircle2, Layers, Edit3, Save, Clock, Zap, ShieldAlert, BarChart3, ChevronRight } from 'lucide-react';

interface Props {
  data?: ProjectBlueprint;
  onUpdate: (data: ProjectBlueprint) => void;
  onPromoteToExpertise: (context: string) => void;
  initialValue?: string | null;
  onClearInitialValue: () => void;
  projectTitle: string;
  language: Language;
}

const ProjectMapper: React.FC<Props> = ({ data, onUpdate, onPromoteToExpertise, initialValue, onClearInitialValue, projectTitle, language }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
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
      const result = await runFacility(FacilityType.PROJECT_MAPPER, input || "Map project structure.", data, language);
      onUpdate(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateNode = (id: string, updates: Partial<BlueprintNode>) => {
    if (!data) return;
    onUpdate({
      ...data,
      graph: data.graph.map(node => (node.id === id ? { ...node, ...updates } : node))
    });
  };

  const calculateRisk = (node: BlueprintNode) => {
    const effort = node.effortLevel || 1;
    const uncertainty = node.uncertaintyLevel || 1;
    return (effort + uncertainty) / 2;
  };

  const getRiskColor = (score: number) => {
    if (score < 4) return 'bg-emerald-500';
    if (score < 7) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const handlePromote = () => {
    if (!data) return;
    const context = data.graph.map(n => `[${n.type}] ${n.content}`).join(' ');
    onPromoteToExpertise(context);
  };

  const methods = data?.graph.filter(n => n.type === 'Method') || [];
  const totalWeeks = methods.reduce((acc, curr) => acc + (curr.timeEstimate || 0), 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
               <Box size={20} />
             </div>
             <div>
               <h2 className="text-lg font-bold text-slate-900">{t.project_mapper.title}</h2>
               <p className="text-xs text-slate-500">{t.project_mapper.desc}</p>
             </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handlePromote}
              disabled={!data}
              className="px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl hover:bg-indigo-100 disabled:opacity-30 transition-all uppercase tracking-widest"
            >
              {t.common.promote_to_expertise}
            </button>
          </div>
        </div>
        
        <div className="p-8 bg-slate-50/30">
          <div className="flex gap-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 min-h-[80px]"
              placeholder="Refine parameters for architecture..."
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="bg-amber-600 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-amber-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Workflow size={16} />}
              {t.project_mapper.generate_btn}
            </button>
          </div>
        </div>
      </section>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main List Area */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between px-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.project_mapper.edit_mode}</span>
            </div>
            {(data.graph || []).map((node, i) => {
              const nodeKey = node.id || `node-${i}`;
              const isEditing = editingId === nodeKey;
              
              return (
                <div key={nodeKey} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:border-indigo-200 transition-colors group">
                  <div className="flex gap-0 min-h-[80px]">
                    <div className={`w-1.5 shrink-0 ${
                      node.type === 'Objective' ? 'bg-blue-500' :
                      node.type === 'Hypothesis' ? 'bg-emerald-500' :
                      node.type === 'Method' ? 'bg-purple-500' :
                      'bg-slate-300'
                    }`} />
                    
                    <div className="flex-1 p-5 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">{node.type}</span>
                        <div className="h-1 w-1 bg-slate-200 rounded-full" />
                        <button 
                          onClick={() => setEditingId(isEditing ? null : nodeKey)}
                          className="opacity-0 group-hover:opacity-100 text-indigo-500 transition-all hover:scale-110"
                        >
                          {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                        </button>
                      </div>

                      {isEditing ? (
                        <input
                          autoFocus
                          value={node.content}
                          onChange={(e) => updateNode(nodeKey, { content: e.target.value })}
                          className="w-full bg-slate-50 text-sm font-bold text-slate-800 border-none p-0 focus:ring-0"
                        />
                      ) : (
                        <p className="text-sm font-bold text-slate-800 leading-tight">{node.content}</p>
                      )}

                      {node.type === 'Method' && (
                        <div className="mt-4 pt-4 border-t border-slate-50 flex gap-6 items-center">
                          <div className="flex items-center gap-2 group/slider">
                            <Clock size={12} className="text-slate-300" />
                            <input 
                              type="range" min="0" max="52" 
                              value={node.timeEstimate || 0} 
                              onChange={(e) => updateNode(nodeKey, { timeEstimate: parseInt(e.target.value) })}
                              className="w-20 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                            />
                            <span className="text-[10px] font-bold text-slate-500">{node.timeEstimate || 0}w</span>
                          </div>
                          <div className="flex items-center gap-2 group/slider">
                            <Zap size={12} className="text-slate-300" />
                            <input 
                              type="range" min="1" max="10" 
                              value={node.effortLevel || 1} 
                              onChange={(e) => updateNode(nodeKey, { effortLevel: parseInt(e.target.value) })}
                              className="w-20 h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                            />
                            <span className="text-[10px] font-bold text-slate-500">{node.effortLevel || 1}/10</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-5 space-y-6 sticky top-6">
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 overflow-hidden relative">
               <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                 <BarChart3 size={120} />
               </div>
               <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-indigo-400 flex items-center gap-2">
                 <BarChart3 size={14} /> {t.project_mapper.execution_table}
               </h3>
               
               <div className="space-y-4 relative z-10">
                 {methods.length > 0 ? methods.map((m, idx) => {
                   const risk = calculateRisk(m);
                   return (
                     <div key={idx} className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 transition-all">
                        <div className={`w-2 h-2 rounded-full shrink-0 ${getRiskColor(risk)} shadow-[0_0_10px_rgba(255,255,255,0.2)]`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold truncate opacity-90">{m.content}</p>
                          <div className="flex gap-3 mt-1 opacity-50">
                            <span className="text-[9px] font-medium uppercase tracking-tighter">Time: {m.timeEstimate || 0}w</span>
                            <span className="text-[9px] font-medium uppercase tracking-tighter">Risk Index: {risk.toFixed(1)}</span>
                          </div>
                        </div>
                        <ChevronRight size={14} className="opacity-20" />
                     </div>
                   );
                 }) : (
                   <p className="text-[10px] text-white/30 italic text-center py-8">No methods defined yet.</p>
                 )}
               </div>

               <div className="mt-10 pt-6 border-t border-white/10 flex justify-between items-end">
                 <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 mb-1">{t.project_mapper.total_weeks}</p>
                    <p className="text-3xl font-black">{totalWeeks} <span className="text-xs opacity-40">weeks</span></p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400 mb-1">Consistency</p>
                    <p className="text-sm font-bold">{data.consistency_report.length} Checks Passed</p>
                 </div>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                <AlertTriangle size={12} className="text-amber-500" /> Validation Report
              </h3>
              <div className="space-y-3">
                {(data.consistency_report || []).map((msg, i) => (
                  <div key={i} className="flex gap-2 text-[10px] font-bold text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMapper;
