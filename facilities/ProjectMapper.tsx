
import React, { useState, useEffect } from 'react';
import { FacilityType, ProjectBlueprint, Language, BlueprintNode } from '../types';
import { translations } from '../translations';
import { runFacility } from '../geminiService';
import { 
  Box, 
  Loader2, 
  Workflow, 
  Layers, 
  Edit3, 
  Save, 
  Clock, 
  Zap, 
  ShieldAlert, 
  BarChart3, 
  Activity,
  Plus
} from 'lucide-react';

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

  const methods = data?.graph.filter(n => n.type === 'Method') || [];
  const totalWeeks = methods.reduce((acc, curr) => acc + (curr.timeEstimate || 0), 0);

  return (
    <div className="space-y-12">
      {/* Input Console */}
      <section className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Box size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">{t.project_mapper.title}</h2>
              <p className="text-xs text-slate-500 font-medium">{t.project_mapper.desc}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-medium transition-all min-h-[100px]"
              placeholder="List objectives, potential methods, or project outputs..."
            />
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 bg-amber-600 text-white px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-amber-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-100"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Workflow size={18} />}
                {t.project_mapper.generate_btn}
              </button>
            </div>
          </div>
        </div>
      </section>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Work Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.project_mapper.edit_mode}</span>
              <button 
                onClick={() => onPromoteToExpertise(data.graph.map(n => n.content).join(' '))}
                className="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-all"
              >
                <Layers size={14} /> {t.common.promote_to_expertise}
              </button>
            </div>

            <div className="space-y-4">
              {data.graph.map((node, i) => {
                const nodeKey = node.id || `node-${i}`;
                const isEditing = editingId === nodeKey;
                
                return (
                  <div key={nodeKey} className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:border-indigo-300 transition-all duration-300">
                    <div className="flex items-stretch min-h-[80px]">
                      <div className={`w-2 shrink-0 ${
                        node.type === 'Objective' ? 'bg-blue-500' :
                        node.type === 'Hypothesis' ? 'bg-emerald-500' :
                        node.type === 'Method' ? 'bg-purple-500' :
                        node.type === 'Output' ? 'bg-indigo-400' : 'bg-slate-300'
                      }`} />
                      
                      <div className="flex-1 p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                             node.type === 'Objective' ? 'text-blue-600 border-blue-100 bg-blue-50' :
                             node.type === 'Hypothesis' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' :
                             node.type === 'Method' ? 'text-purple-600 border-purple-100 bg-purple-50' : 'text-slate-500 border-slate-100 bg-slate-50'
                          }`}>
                            {node.type}
                          </span>
                          <button 
                            onClick={() => setEditingId(isEditing ? null : nodeKey)}
                            className="text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                          </button>
                        </div>

                        {isEditing ? (
                          <textarea
                            autoFocus
                            value={node.content}
                            onChange={(e) => updateNode(nodeKey, { content: e.target.value })}
                            className="w-full bg-slate-50 text-sm font-bold text-slate-800 border-none p-2 rounded-lg focus:ring-0 resize-none min-h-[60px]"
                          />
                        ) : (
                          <p className="text-sm font-bold text-slate-800 leading-snug">{node.content}</p>
                        )}

                        {node.type === 'Method' && (
                          <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Clock size={12} /> Duration (Weeks)</span>
                                <span className="text-indigo-600">{node.timeEstimate || 0}w</span>
                              </div>
                              <input 
                                type="range" min="0" max="52" 
                                value={node.timeEstimate || 0} 
                                onChange={(e) => updateNode(nodeKey, { timeEstimate: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                              />
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Zap size={12} /> Effort Level</span>
                                <span className="text-amber-600">{node.effortLevel || 1}/10</span>
                              </div>
                              <input 
                                type="range" min="1" max="10" 
                                value={node.effortLevel || 1} 
                                onChange={(e) => updateNode(nodeKey, { effortLevel: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <button className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                <Plus size={14} /> Add Structural Component
              </button>
            </div>
          </div>

          {/* Metrics Column */}
          <div className="lg:col-span-4 space-y-8 sticky top-8 h-fit">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <BarChart3 size={100} />
              </div>
              
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-indigo-400 flex items-center gap-2">
                <Activity size={16} /> Execution Overview
              </h3>

              <div className="space-y-6 relative z-10">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2">{t.project_mapper.total_weeks}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black">{totalWeeks}</span>
                    <span className="text-lg font-bold text-slate-500 mb-1.5">Weeks</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10 space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Method Risk Profile</p>
                  {methods.length > 0 ? methods.map((m, idx) => {
                    const risk = calculateRisk(m);
                    return (
                      <div key={idx} className="flex items-center gap-4 group cursor-help">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${getRiskColor(risk)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold truncate opacity-90 group-hover:opacity-100">{m.content}</p>
                          <div className="flex gap-3 text-[9px] font-black uppercase text-white/40 mt-0.5">
                            <span>Effort: {m.effortLevel || 1}</span>
                            <span>Risk: {risk.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }) : <p className="text-[10px] italic text-white/20">Define methods to view risk map.</p>}
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                <ShieldAlert size={14} className="text-indigo-500" /> Structural Consistency
              </h3>
              <div className="space-y-3">
                {data.consistency_report.map((msg, i) => (
                  <div key={i} className="flex gap-3 text-[10px] font-bold text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
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
