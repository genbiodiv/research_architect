
import React, { useState, useEffect } from 'react';
import { FacilityType, ProjectBlueprint, Language, BlueprintNode } from '../types';
import { translations } from '../translations';
import { runFacility } from '../geminiService';
import { Box, Loader2, Workflow, AlertTriangle, CheckCircle2, Layers, Edit3, Save, Clock, Zap, ShieldAlert, Table } from 'lucide-react';

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
      const result = await runFacility(FacilityType.PROJECT_MAPPER, input || "Map current project elements.", data, language);
      onUpdate(result);
    } catch (e) {
      alert("Mapping failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateNode = (id: string, updates: Partial<BlueprintNode>) => {
    if (!data) return;
    const newGraph = data.graph.map(node => 
      node.id === id ? { ...node, ...updates } : node
    );
    onUpdate({ ...data, graph: newGraph });
  };

  const calculateRisk = (node: BlueprintNode) => {
    const effort = node.effortLevel || 1;
    const uncertainty = node.uncertaintyLevel || 1;
    return (effort + uncertainty) / 2;
  };

  const getRiskColor = (score: number) => {
    if (score < 4) return 'text-emerald-500 bg-emerald-50 border-emerald-100';
    if (score < 7) return 'text-amber-500 bg-amber-50 border-amber-100';
    return 'text-rose-500 bg-rose-50 border-rose-100';
  };

  const handlePromote = () => {
    if (!data) return;
    const context = `Architecture Blueprint:\n${data.graph.map(n => `[${n.type}] ${n.content} (Time: ${n.timeEstimate || 0}w, Effort: ${n.effortLevel || 0}/10)`).join('\n')}`;
    onPromoteToExpertise(context);
  };

  const methods = data?.graph.filter(n => n.type === 'Method') || [];
  const totalWeeks = methods.reduce((acc, curr) => acc + (curr.timeEstimate || 0), 0);

  return (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <Box className="text-amber-600" /> {t.project_mapper.title}
        </h2>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          {t.project_mapper.desc}
        </p>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all min-h-[100px] mb-4"
          placeholder="Detailed context for architecture..."
        />

        <div className="flex gap-4">
           <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex-1 bg-amber-600 text-white px-8 py-4 rounded-xl font-bold text-sm hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-amber-100 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Workflow size={18} />}
            {t.project_mapper.generate_btn}
          </button>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Nodes Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Edit3 size={14} /> {t.project_mapper.edit_mode}
              </span>
              <button 
                onClick={handlePromote}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                <Layers size={14} />
                {t.common.promote_to_expertise}
              </button>
            </div>

            {(data.graph || []).map((node, i) => {
              const isEditing = editingId === (node.id || `node-${i}`);
              const nodeKey = node.id || `node-${i}`;

              return (
                <div key={nodeKey} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group ring-1 ring-slate-100">
                  <div className={`h-1.5 w-full ${
                    node.type === 'Objective' ? 'bg-blue-400' :
                    node.type === 'Hypothesis' ? 'bg-emerald-400' :
                    node.type === 'Method' ? 'bg-purple-400' :
                    'bg-slate-300'
                  }`} />
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                        node.type === 'Objective' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                        node.type === 'Hypothesis' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        node.type === 'Method' ? 'bg-purple-50 text-purple-700 border border-purple-100' :
                        'bg-slate-50 text-slate-700 border border-slate-200'
                      }`}>
                        {node.type}
                      </span>
                      
                      <button 
                        onClick={() => setEditingId(isEditing ? null : nodeKey)}
                        className="text-slate-300 hover:text-indigo-600 transition-colors p-1"
                      >
                        {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
                      </button>
                    </div>

                    {isEditing ? (
                      <textarea
                        autoFocus
                        value={node.content}
                        onChange={(e) => updateNode(node.id || `node-${i}`, { content: e.target.value })}
                        className="w-full bg-slate-50 border border-indigo-200 rounded-xl p-4 text-sm font-medium text-slate-800 focus:outline-none ring-2 ring-indigo-50 min-h-[80px]"
                      />
                    ) : (
                      <p className="text-base font-bold text-slate-800 leading-snug group-hover:text-indigo-900 transition-colors">
                        {node.content}
                      </p>
                    )}

                    {node.type === 'Method' && (
                      <div className="mt-8 pt-6 border-t border-slate-50 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Time Slider */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Clock size={12} /> {t.project_mapper.time}
                              </label>
                              <span className="text-xs font-bold text-indigo-600">{node.timeEstimate || 0}w</span>
                            </div>
                            <input 
                              type="range" min="0" max="52" 
                              value={node.timeEstimate || 0} 
                              onChange={(e) => updateNode(nodeKey, { timeEstimate: parseInt(e.target.value) })}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                            />
                          </div>

                          {/* Effort Slider */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Zap size={12} /> {t.project_mapper.effort}
                              </label>
                              <span className="text-xs font-bold text-amber-600">{node.effortLevel || 1}/10</span>
                            </div>
                            <input 
                              type="range" min="1" max="10" 
                              value={node.effortLevel || 1} 
                              onChange={(e) => updateNode(nodeKey, { effortLevel: parseInt(e.target.value) })}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                            />
                          </div>

                          {/* Uncertainty Slider */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <ShieldAlert size={12} /> {t.project_mapper.uncertainty}
                              </label>
                              <span className="text-xs font-bold text-rose-600">{node.uncertaintyLevel || 1}/10</span>
                            </div>
                            <input 
                              type="range" min="1" max="10" 
                              value={node.uncertaintyLevel || 1} 
                              onChange={(e) => updateNode(nodeKey, { uncertaintyLevel: parseInt(e.target.value) })}
                              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-rose-500" 
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Analysis & Summary Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 sticky top-24 space-y-8 ring-1 ring-slate-100">
               <div>
                <h3 className="font-black text-slate-900 flex items-center gap-3 mb-6 pb-4 border-b">
                  <AlertTriangle size={20} className="text-amber-500" /> {t.common.consistency}
                </h3>
                <div className="space-y-4">
                  {(data.consistency_report || []).map((item, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-slate-50/50 rounded-xl border border-slate-100/50">
                      {item.toLowerCase().includes('good') || item.toLowerCase().includes('align') || item.toLowerCase().includes('bien') ? 
                        <CheckCircle2 size={16} className="text-emerald-500 mt-1 flex-shrink-0" /> : 
                        <AlertTriangle size={16} className="text-rose-400 mt-1 flex-shrink-0" />
                      }
                      <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
               </div>

               {methods.length > 0 && (
                 <div className="pt-6 border-t border-slate-100">
                   <h3 className="font-black text-slate-900 flex items-center gap-3 mb-6">
                     <Table size={20} className="text-indigo-600" /> {t.project_mapper.execution_table}
                   </h3>
                   
                   <div className="space-y-4">
                     {methods.map((m, idx) => {
                       const risk = calculateRisk(m);
                       const colorClass = getRiskColor(risk);
                       return (
                         <div key={idx} className="flex flex-col gap-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                           <div className="flex justify-between items-center">
                             <p className="text-[10px] font-black text-slate-800 truncate max-w-[140px]">{m.content}</p>
                             <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${colorClass}`}>
                               R: {risk.toFixed(1)}
                             </span>
                           </div>
                           <div className="flex gap-4 mt-1">
                             <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                               <Clock size={10} /> {m.timeEstimate || 0}w
                             </div>
                             <div className="flex items-center gap-1 text-[9px] text-slate-400 font-bold">
                               <Zap size={10} /> {m.effortLevel || 1}/10
                             </div>
                           </div>
                         </div>
                       );
                     })}
                     
                     <div className="mt-8 p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">{t.project_mapper.total_weeks}</p>
                        <p className="text-4xl font-black">{totalWeeks} <span className="text-lg opacity-70">weeks</span></p>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectMapper;
