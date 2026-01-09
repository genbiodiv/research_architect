
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
import { Brain, Info, Globe, Edit2, Check } from 'lucide-react';

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
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        activeFacility={state.activeFacility} 
        language={state.language}
        projectTitle={state.currentProject.title}
        onSelect={(f) => setState(p => ({...p, activeFacility: f}))} 
      />
      
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <header className="h-20 border-b bg-white flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
              <Brain size={24} />
            </div>
            <div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input 
                    autoFocus
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveTitle()}
                    onBlur={saveTitle}
                    className="text-xl font-bold text-slate-800 border-b-2 border-indigo-500 focus:outline-none bg-transparent"
                  />
                  <button onClick={saveTitle} className="text-emerald-500 hover:text-emerald-600">
                    <Check size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTitle(true)}>
                  <h1 className="text-xl font-bold text-slate-800">{state.currentProject.title}</h1>
                  <Edit2 size={14} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </div>
              )}
              <p className="text-xs text-slate-500 font-medium">
                {t.header.snapshot} • {elapsed} {state.language === 'en' ? 'active' : 'activo'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-all uppercase tracking-wider"
            >
              <Globe size={14} />
              {state.language}
            </button>
            <button 
              onClick={() => {
                const blob = new Blob([JSON.stringify(state.currentProject, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `arch-project-${state.currentProject.id}.json`;
                a.click();
              }}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all"
            >
              {t.header.export_json}
            </button>
            <button className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95">
              {t.header.export_docx}
            </button>
          </div>
        </header>

        <section className="p-8 max-w-6xl mx-auto w-full">
          {renderActiveFacility()}
        </section>

        <div className="fixed bottom-6 right-6 group z-50">
           <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-2xl invisible group-hover:visible transition-all mb-3 w-72 text-[11px] leading-relaxed border border-slate-800 ring-4 ring-slate-900/10">
              <p className="font-bold mb-2 border-b border-slate-700 pb-2 text-indigo-400 uppercase tracking-widest">ARCH Methodology</p>
              <p className="mb-2">Structure-First paradigm. AI acts as a methodologist scaffold.</p>
              <p className="text-slate-400 italic">"Design the skeleton before the skin."</p>
           </div>
           <button className="bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:bg-indigo-600 transition-all ring-4 ring-white">
             <Info size={24} />
           </button>
        </div>
      </main>
    </div>
  );
};

export default App;
