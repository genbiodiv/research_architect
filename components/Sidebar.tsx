
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
      <div className="p-6 h-16 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">A</div>
        <span className="text-lg font-black tracking-tighter text-white">ARCH</span>
      </div>
      
      <div className="px-6 py-6 space-y-8 flex-1 overflow-y-auto">
        <div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Pipeline</p>
          <nav className="space-y-1">
            {items.map(item => (
              <button
                key={item.type}
                onClick={() => onSelect(item.type)}
                className={`w-full flex items-center justify-between group px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeFacility === item.type 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={16} />
                  {item.label}
                </div>
                {activeFacility === item.type && <ArrowRight size={14} className="text-indigo-200" />}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="p-6 border-t border-slate-800 bg-slate-950/50">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
            <span>Progress</span>
            <span className="text-indigo-400">{Math.round(progress)}%</span>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-700 ease-in-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
