
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
  ArrowRight
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
    { type: FacilityType.QUESTION_EXPLORER, label: t.sidebar.question_explorer, icon: GitBranch, step: "01" },
    { type: FacilityType.HYPOTHESIS_ENGINE, label: t.sidebar.hypothesis_engine, icon: FlaskConical, step: "02" },
    { type: FacilityType.PROJECT_MAPPER, label: t.sidebar.project_mapper, icon: Box, step: "03" },
    { type: FacilityType.EXPERTISE_DETECTOR, label: t.sidebar.expertise_detector, icon: Layers, step: "04" },
    { type: FacilityType.LIT_STRATEGY, label: t.sidebar.lit_strategy, icon: Search, step: "05" },
    { type: FacilityType.SPEC_VIEWER, label: t.sidebar.spec_viewer, icon: BookOpen, step: "SY" },
  ];

  const activeIndex = items.findIndex(item => item.type === activeFacility);
  const progress = ((activeIndex + 1) / items.length) * 100;

  return (
    <aside className="w-20 md:w-64 bg-slate-900 h-screen flex flex-col shrink-0 z-40 text-slate-400 border-r border-white/5 shadow-2xl transition-all">
      {/* Brand Header */}
      <div className="p-6 md:p-8 h-20 flex items-center gap-3 overflow-hidden border-b border-white/5">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30 shrink-0">A</div>
        <div className="flex flex-col hidden md:flex min-w-0">
          <span className="text-xl font-black tracking-tighter text-white leading-none">ARCH</span>
          <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] mt-1 truncate">Research Architect</span>
        </div>
      </div>
      
      {/* Pipeline Navigation */}
      <div className="px-3 md:px-5 py-8 space-y-12 flex-1 overflow-y-auto custom-scrollbar">
        <div>
          <p className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 hidden md:block">The Pipeline</p>
          <nav className="space-y-2.5">
            {items.map(item => (
              <button
                key={item.type}
                onClick={() => onSelect(item.type)}
                title={item.label}
                className={`w-full flex items-center justify-center md:justify-between group px-3 md:px-4 py-3.5 rounded-xl transition-all relative ${
                  activeFacility === item.type 
                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 translate-x-1' 
                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-[9px] font-black hidden md:inline-block w-4 ${activeFacility === item.type ? 'text-indigo-200' : 'text-slate-700'}`}>
                    {item.step}
                  </div>
                  <item.icon size={18} strokeWidth={2.5} className={activeFacility === item.type ? 'text-white' : 'group-hover:scale-110 group-hover:text-slate-200 transition-all'} />
                  <span className="text-[11px] font-bold hidden md:inline-block tracking-tight">{item.label}</span>
                </div>
                {activeFacility === item.type && <ArrowRight size={14} className="text-indigo-200 hidden md:block" />}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Progress Metric */}
      <div className="p-8 border-t border-white/5 bg-black/20 hidden md:block">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            <span>Rigour Score</span>
            <span className="text-indigo-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1)" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">
            Integrity check active
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
