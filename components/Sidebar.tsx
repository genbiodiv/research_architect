
import React from 'react';
import { FacilityType, Language } from '../types';
import { translations } from '../translations';
import { 
  GitBranch, 
  FlaskConical, 
  Box, 
  Layers, 
  Search, 
  BookOpen
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

  return (
    <aside className="w-72 bg-white border-r h-screen flex flex-col shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20">
      <div className="p-8 border-b flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100">A</div>
        <span className="text-2xl font-black tracking-tighter text-slate-900">ARCH</span>
      </div>
      
      <nav className="flex-1 p-5 space-y-1.5 overflow-y-auto">
        <p className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.sidebar.facilities}</p>
        {items.map(item => (
          <button
            key={item.type}
            onClick={() => onSelect(item.type)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-sm font-bold transition-all ${
              activeFacility === item.type 
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 ring-2 ring-indigo-600 ring-offset-2' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={18} className={activeFacility === item.type ? 'text-white' : 'text-slate-400'} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-50">
        <div className="flex flex-col gap-2">
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-1000" 
              style={{ width: `${(Object.keys(FacilityType).indexOf(activeFacility) + 1) / Object.keys(FacilityType).length * 100}%` }}
            ></div>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center">
            {language === 'en' ? 'Methodological Progress' : 'Progreso Metodológico'}
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
