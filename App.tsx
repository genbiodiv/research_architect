
import React, { useState, useEffect } from 'react';
import { FacilityType, AppState, Language } from './types';
import { translations } from './translations';
import Sidebar from './components/Sidebar';
import QuestionExplorer from './facilities/QuestionExplorer';
import HypothesisEngine from './facilities/HypothesisEngine';
import ProjectMapper from './facilities/ProjectMapper';
import ExpertiseDetector from './facilities/ExpertiseDetector';
import LiteratureStrategyFacility from './facilities/LiteratureStrategy';
import SpecViewer from './facilities/SpecViewer';
import { Brain, Info, Globe, Edit2, Check, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    language: 'en',
    currentProject: {
      id: 'default-project',
      title: 'New Research Project',
      description: 'Define your research scope here.',
      facilities: {}
    },
    activeFacility: FacilityType.QUESTION_EXPLORER,
    history: []
  });

  const [preFillValue, setPreFillValue] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(state.currentProject.title);
  const [sessionStartTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState('0m');

  useEffect(() => {
    const timer = setInterval(() => {
      const mins = Math.floor((Date.now() - sessionStartTime) / 60000);
      setElapsed(`${mins}m`);
    }, 30000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

  const t = translations[state.language];

  const updateFacilityData = (facility: FacilityType, data: any) => {
    setState(prev => ({
      ...prev,
      currentProject: {
        ...prev.currentProject,
        facilities: {
          ...prev.currentProject.facilities,
          [facility]: data
        }
      }
    }));
  };

  const navigateToFacility = (facility: FacilityType, initialValue?: string) => {
    if (initialValue) setPreFillValue(initialValue);
    setState(prev => ({ ...prev, activeFacility: facility }));
  };

  const saveTitle = () => {
    setState(prev => ({
      ...prev,
      currentProject: { ...prev.currentProject, title: tempTitle || 'Untitled Project' }
    }));
    setIsEditingTitle(false);
  };

  const toggleLanguage = () => {
    setState(prev => ({
      ...prev,
      language: prev.language === 'en' ? 'es' : 'en'
    }));
  };

  const renderActiveFacility = () => {
    const commonProps = {
      projectTitle: state.currentProject.title,
      language: state.language
    };

    switch (state.activeFacility) {
      case FacilityType.QUESTION_EXPLORER:
        return <QuestionExplorer 
          data={state.currentProject.facilities[FacilityType.QUESTION_EXPLORER]} 
          onUpdate={(d) => updateFacilityData(FacilityType.QUESTION_EXPLORER, d)}
          onPromoteToHypothesis={(q) => navigateToFacility(FacilityType.HYPOTHESIS_ENGINE, q)}
          {...commonProps}
        />;
      case FacilityType.HYPOTHESIS_ENGINE:
        return <HypothesisEngine 
          data={state.currentProject.facilities[FacilityType.HYPOTHESIS_ENGINE]} 
          onUpdate={(d) => updateFacilityData(FacilityType.HYPOTHESIS_ENGINE, d)}
          onPromoteToMapper={(h) => navigateToFacility(FacilityType.PROJECT_MAPPER, h)}
          initialValue={preFillValue}
          onClearInitialValue={() => setPreFillValue(null)}
          {...commonProps}
        />;
      case FacilityType.PROJECT_MAPPER:
        return <ProjectMapper 
          data={state.currentProject.facilities[FacilityType.PROJECT_MAPPER]} 
          onUpdate={(d) => updateFacilityData(FacilityType.PROJECT_MAPPER, d)}
          onPromoteToExpertise={(ctx) => navigateToFacility(FacilityType.EXPERTISE_DETECTOR, ctx)}
          initialValue={preFillValue}
          onClearInitialValue={() => setPreFillValue(null)}
          {...commonProps}
        />;
      case FacilityType.EXPERTISE_DETECTOR:
        return <ExpertiseDetector 
          data={state.currentProject.facilities[FacilityType.EXPERTISE_DETECTOR]} 
          onUpdate={(d) => updateFacilityData(FacilityType.EXPERTISE_DETECTOR, d)}
          onPromoteToLit={(topics) => navigateToFacility(FacilityType.LIT_STRATEGY, topics)}
          initialValue={preFillValue}
          onClearInitialValue={() => setPreFillValue(null)}
          {...commonProps}
        />;
      case FacilityType.LIT_STRATEGY:
        return <LiteratureStrategyFacility 
          data={state.currentProject.facilities[FacilityType.LIT_STRATEGY]} 
          onUpdate={(d) => updateFacilityData(FacilityType.LIT_STRATEGY, d)}
          initialValue={preFillValue}
          onClearInitialValue={() => setPreFillValue(null)}
          {...commonProps}
        />;
      case FacilityType.SPEC_VIEWER:
        return <SpecViewer />;
      default:
        return <div>Select a facility.</div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 overflow-hidden font-sans">
      <Sidebar 
        activeFacility={state.activeFacility} 
        language={state.language}
        projectTitle={state.currentProject.title}
        onSelect={(f) => setState(p => ({...p, activeFacility: f}))} 
      />
      
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-4 flex-1">
            <LayoutDashboard size={20} className="text-indigo-600" />
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <input 
                  autoFocus
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                  onBlur={saveTitle}
                  className="text-sm font-bold text-slate-800 border-none focus:ring-0 bg-transparent min-w-[200px]"
                />
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                  <h1 className="text-sm font-bold text-slate-800 truncate max-w-md">{state.currentProject.title}</h1>
                  <Edit2 size={12} className="text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-all" />
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest hidden md:inline">
              Session: {elapsed}
            </span>
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
              <button 
                onClick={toggleLanguage}
                className="px-3 py-1 text-[10px] font-black text-slate-600 hover:bg-white rounded-md transition-all uppercase"
              >
                {state.language}
              </button>
            </div>
            <button 
              onClick={() => {
                const blob = new Blob([JSON.stringify(state.currentProject, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `arch-project-${state.currentProject.id}.json`;
                a.click();
              }}
              className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-lg transition-all"
            >
              Export
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto relative bg-slate-50/50">
          <div className="max-w-7xl mx-auto p-6 lg:p-10">
            {renderActiveFacility()}
          </div>
        </main>
      </div>

      {/* Persistent Help/Methodology Overlay */}
      <div className="fixed bottom-6 right-6 z-40">
        <button className="bg-slate-900 text-white w-12 h-12 rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-600 transition-all peer group">
          <Info size={20} />
          <div className="absolute bottom-full right-0 mb-4 w-72 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all text-[11px] leading-relaxed">
            <p className="font-bold text-indigo-400 mb-2 uppercase tracking-widest border-b border-slate-800 pb-2">ARCH Methodology</p>
            <p className="text-slate-300 italic mb-2">"Structure before text. Rigor before narrative."</p>
            <p className="text-slate-500">The facility sequence guides you from semantic exploration to actionable search strategies. Use the promote actions to carry context forward.</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default App;
