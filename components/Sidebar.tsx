
import React from 'react';
import { FacilityType, Language } from '../types';
import { translations } from '../translations';
import { 
  GitBranch, 
  FlaskConical, 
  Box, 
  Layers, 
  Search, 
  BookOpen,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  activeFacility: FacilityType;
  language: Language;
  projectTitle: string;
  onSelect: (f: FacilityType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeFacility, language, projectTitle, onSelect }) => {
  const t = translations[language];
  
  const items = [
    { type: FacilityType.QUESTION_EXPLORER, label: t.sidebar.question_explorer, icon: GitBranch },
    { type: FacilityType.HYPOTHESIS_ENGINE, label: t.sidebar.hypothesis_engine, icon: FlaskConical },
    { type: FacilityType.PROJECT_MAPPER, label: t.sidebar.project_mapper, icon: Box },
    { type: FacilityType.EXPERTISE_DETECTOR, label: t.sidebar.expertise_detector, icon: Layers },
    { type: FacilityType.LIT_STRATEGY, label: t.sidebar.lit_strategy, icon: Search },
    { type: FacilityType.SPEC_VIEWER, label: t.sidebar.spec_viewer, icon: BookOpen },
  ];

  const activeIndex = items.findIndex(item => item.type === activeFacility);
  const progress = ((activeIndex + 1) / items.length) * 100;

  return (
    <aside className="w-64 bg-slate-900 h-screen flex flex-col shrink-0 z-40 text-slate-300">
      <div className="p-8 h-20 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-900/40">A</div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-white leading-none">ARCH</span>
          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mt-1">Research Scaffold</span>
        </div>
      </div>
      
      <div className="px-5 py-8 space-y-10 flex-1 overflow-y-auto custom-scrollbar">
        <div>
          <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.25em] mb-6">Pipeline Workflow</p>
          <nav className="space-y-1.5">
            {items.map(item => (
              <button
                key={item.type}
                onClick={() => onSelect(item.type)}
                className={`w-full flex items-center justify-between group px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activeFacility === item.type 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-950/50' 
                    : 'text-slate-500 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} className={activeFacility === item.type ? 'text-indigo-200' : 'text-slate-600 group-hover:text-slate-400'} />
                  {item.label}
                </div>
                {activeFacility === item.type && <ArrowRight size={14} className="text-indigo-300 animate-pulse" />}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-8 border-t border-slate-800 bg-slate-950/20">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.15em] text-slate-500">
            <span>Progress Index</span>
            <span className="text-indigo-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center gap-2 text-[8px] font-black text-slate-600 uppercase tracking-widest">
            <ShieldCheck size={10} className="text-emerald-500" />
            Integrity Check Active
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
