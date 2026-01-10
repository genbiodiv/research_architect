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
  Plus,
  ChevronRight
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
      const result = await runFacility(FacilityType.PROJECT_MAPPER, input || "Blueprint the research.", data, language);
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

  const methods = data?.graph.filter(n => n.type === 'Method') || [];
  const totalWeeks = methods.reduce((acc, curr) => acc + (curr.timeEstimate || 0), 0);

  return (
    <div className="space-y-12 pb-20">
      <section className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shadow-inner shrink-0">
            <Box size={24} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{t.project_mapper.title}</h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{t.project_mapper.desc}</p>
          </div>
          <button onClick={() => onPromoteToExpertise(data?.graph.map(n => n.content).join(' ') || '')} disabled={!data} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-100 disabled:opacity-30 transition-all">
            <Layers size={12} /> Scan Gaps
          </button>
        </div>
        
        <div className="space-y-4">
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all min-h-[100px]" placeholder="Outline project objectives and intended methods..." />
          <button onClick={handleGenerate} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.25em] hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]">
            {loading ? <Loader2 className="animate-spin" size={16} /> : <Workflow size={16} />}
            {t.project_mapper.generate_btn}
          </button>
        </div>
      </section>

      {data && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          <div className="xl:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Structural Hierarchy</span>
              <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1.5"><Plus size={10} /> Add Unit</button>
            </div>

            {(data.graph || []).map((node, i) => {
              const nodeKey = node.id || `node-${i}`;
              const isEditing = editingId === nodeKey;
              return (
                <div key={nodeKey} className="group bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all">
                  <div className="flex items-stretch min-h-[60px]">
                    <div className={`w-1.5 shrink-0 ${node.type === 'Objective' ? 'bg-blue-500' : node.type === 'Hypothesis' ? 'bg-emerald-500' : node.type === 'Method' ? 'bg-purple-500' : 'bg-slate-300'}`} />
                    <div className="flex-1 p-5 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${node.type === 'Objective' ? 'text-blue-600 border-blue-50 bg-blue-50' : node.type === 'Method' ? 'text-purple-600 border-purple-50 bg-purple-50' : 'text-slate-500 border-slate-50 bg-slate-50'}`}>{node.type}</span>
                        <button onClick={() => setEditingId(isEditing ? null : nodeKey)} className="text-slate-300 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-all ml-auto">{isEditing ? <Save size={12} /> : <Edit3 size={12} />}</button>
                      </div>
                      {isEditing ? <textarea autoFocus value={node.content} onChange={(e) => updateNode(nodeKey, { content: e.target.value })} className="w-full bg-slate-50 text-sm font-bold text-slate-800 border-none p-2 rounded-lg focus:ring-0 resize-none min-h-[40px]" /> : <p className="text-sm font-bold text-slate-800 leading-snug">{node.content}</p>}
                      {node.type === 'Method' && (
                        <div className="mt-4 pt-4 border-t border-slate-50 grid grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest"><span><Clock size={10} className="inline mr-1" /> Duration</span><span className="text-indigo-600">{node.timeEstimate || 0}w</span></div>
                            <input type="range" min="0" max="52" value={node.timeEstimate || 0} onChange={(e) => updateNode(nodeKey, { timeEstimate: parseInt(e.target.value) })} className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest"><span><Zap size={10} className="inline mr-1" /> Effort</span><span className="text-amber-600">{node.effortLevel || 1}/10</span></div>
                            <input type="range" min="1" max="10" value={node.effortLevel || 1} onChange={(e) => updateNode(nodeKey, { effortLevel: parseInt(e.target.value) })} className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="xl:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white rounded-[2rem] p-8 shadow-2xl overflow-hidden relative">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-indigo-400">Project Metrics</h3>
              <div className="space-y-8 relative z-10">
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-black leading-none">{totalWeeks}</span>
                  <span className="text-[10px] font-black uppercase text-slate-500 mb-1">Total Weeks</span>
                </div>
                <div className="space-y-4">
                  <p className="text-[9px] font-black uppercase text-slate-500 border-b border-white/5 pb-2">Risk Breakdown</p>
                  <div className="space-y-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {methods.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${m.effortLevel! > 7 ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold truncate opacity-80">{m.content}</p>
                          <p className="text-[8px] font-black text-white/20 uppercase">Effort: {m.effortLevel}</p>
                        </div>
                        <ChevronRight size={12} className="opacity-20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2rem] p-6">
              <div className="flex items-center gap-2 mb-4 border-b pb-4">
                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-900">Audit Consistency</h3>
              </div>
              <div className="space-y-2">
                {data.consistency_report.map((msg, i) => (
                  <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 leading-relaxed flex gap-2">
                    <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />{msg}
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