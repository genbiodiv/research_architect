
import React, { useState, useEffect } from 'react';
import { FacilityType, ProjectBlueprint, Language, BlueprintNode } from '../types';
import { translations } from '../translations';
import { runFacility } from '../geminiService';
import { 
  Box, 
  Loader2, 
  Workflow, 
  Edit3, 
  Save, 
  Clock, 
  Zap, 
  Layers, 
  TrendingUp,
  ShieldAlert,
  ChevronRight,
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
      const result = await runFacility(FacilityType.PROJECT_MAPPER, input || "Map research architecture.", data, language);
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
      {/* ARCHITECT CONSOLE */}
      <section className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
            <Box size={28} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.project_mapper.title}</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{t.project_mapper.desc}</p>
          </div>
          <button 
            onClick={() => onPromoteToExpertise(data?.graph.map(n => n.content).join(' ') || '')}
            disabled={!data}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-indigo-100 disabled:opacity-30 transition-all shadow-sm"
          >
            <Layers size={14} /> SCAN GAPS
          </button>
        </div>
        
        <div className="space-y-5">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-6 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all min-h-[120px]"
            placeholder="Outline your research objectives, key experiments, and intended theoretical outputs..."
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-4.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Workflow size={18} />}
            {t.project_mapper.generate_btn}
          </button>
        </div>
      </section>

      {/* BLUEPRINT VISUALIZATION */}
      {data && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          {/* COMPONENT CHAIN */}
          <div className="xl:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Structural Chain</span>
              <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1.5">
                <Plus size={12} /> Add Component
              </button>
            </div>

            <div className="space-y-4">
              {data.graph.map((node, i) => {
                const nodeKey = node.id || `node-${i}`;
                const isEditing = editingId === nodeKey;
                
                return (
                  <div key={nodeKey} className="group bg-white border border-slate-200 rounded-[1.5rem] overflow-hidden hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-stretch min-h-[80px]">
                      <div className={`w-2 shrink-0 ${
                        node.type === 'Objective' ? 'bg-blue-500' :
                        node.type === 'Hypothesis' ? 'bg-emerald-500' :
                        node.type === 'Method' ? 'bg-purple-500' :
                        node.type === 'Output' ? 'bg-indigo-400' : 'bg-slate-300'
                      }`} />
                      
                      <div className="flex-1 p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-3 mb-2.5">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                             node.type === 'Objective' ? 'text-blue-600 border-blue-100 bg-blue-50' :
                             node.type === 'Hypothesis' ? 'text-emerald-600 border-emerald-100 bg-emerald-50' :
                             node.type === 'Method' ? 'text-purple-600 border-purple-100 bg-purple-50' : 'text-slate-500 border-slate-100 bg-slate-50'
                          }`}>
                            {node.type}
                          </span>
                          <button 
                            onClick={() => setEditingId(isEditing ? null : nodeKey)}
                            className="text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all ml-auto"
                          >
                            {isEditing ? <Save size={14} /> : <Edit3 size={14} />}
                          </button>
                        </div>

                        {isEditing ? (
                          <textarea
                            autoFocus
                            value={node.content}
                            onChange={(e) => updateNode(nodeKey, { content: e.target.value })}
                            className="w-full bg-slate-50 text-sm font-bold text-slate-800 border-none p-3 rounded-xl focus:ring-0 resize-none min-h-[60px]"
                          />
                        ) : (
                          <p className="text-sm font-bold text-slate-800 leading-snug">{node.content}</p>
                        )}

                        {node.type === 'Method' && (
                          <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Clock size={12} /> Duration</span>
                                <span className="text-indigo-600 font-black">{node.timeEstimate || 0}w</span>
                              </div>
                              <input 
                                type="range" min="0" max="52" 
                                value={node.timeEstimate || 0} 
                                onChange={(e) => updateNode(nodeKey, { timeEstimate: parseInt(e.target.value) })}
                                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                              />
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Zap size={12} /> Effort Index</span>
                                <span className="text-amber-600 font-black">{node.effortLevel || 1}/10</span>
                              </div>
                              <input 
                                type="range" min="1" max="10" 
                                value={node.effortLevel || 1} 
                                onChange={(e) => updateNode(nodeKey, { effortLevel: parseInt(e.target.value) })}
                                className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EXECUTION MATRIX */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <TrendingUp size={140} />
              </div>
              
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] mb-10 text-indigo-400 flex items-center gap-2">
                Execution Profile
              </h3>

              <div className="space-y-12 relative z-10">
                <div className="flex items-end gap-3">
                  <span className="text-7xl font-black leading-none">{totalWeeks}</span>
                  <div className="flex flex-col mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Predicted</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Duration (Weeks)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5 pb-2">Risk Distribution</p>
                  <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                    {methods.length > 0 ? methods.map((m, idx) => {
                      const risk = calculateRisk(m);
                      return (
                        <div key={idx} className="flex items-center gap-4 group">
                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${getRiskColor(risk)} shadow-sm`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold truncate opacity-90 group-hover:opacity-100">{m.content}</p>
                            <div className="flex gap-4 text-[9px] font-black uppercase text-white/30 mt-1">
                              <span>Effort: {m.effortLevel || 1}</span>
                              <span>Risk: {risk.toFixed(1)}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} className="opacity-10 group-hover:opacity-100" />
                        </div>
                      );
                    }) : <p className="text-[10px] text-white/20 italic">Define methods to visualize risk matrix.</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* CONSISTENCY CHECK */}
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
                <ShieldAlert size={16} className="text-amber-500" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Audit Log</h3>
              </div>
              <div className="space-y-3">
                {data.consistency_report.map((msg, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-bold text-slate-600 leading-relaxed flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
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
