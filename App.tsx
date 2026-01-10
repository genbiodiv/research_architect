
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
import { 
  LayoutDashboard, 
  ChevronRight, 
  Download, 
  Globe, 
  Clock, 
  AlertCircle,
  FileText,
  Workflow
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    language: 'en',
    currentProject: {
      id: 'default-project',
      title: 'Structural Bio-Diversity Analysis',
      description: 'A comprehensive study on urban ecosystems.',
      facilities: {}
    },
    activeFacility: FacilityType.QUESTION_EXPLORER,
    history: []
  });

  const [preFillValue, setPreFillValue] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState('0m');
  const [sessionStartTime] = useState(Date.now());

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
        facilities: { ...prev.currentProject.facilities, [facility]: data }
      }
    }));
  };

  const navigateToFacility = (facility: FacilityType, initialValue?: string) => {
    if (initialValue) setPreFillValue(initialValue);
    setState(prev => ({ ...prev, activeFacility: facility }));
  };

  const toggleLanguage = () => {
    setState(prev => ({ ...prev, language: prev.language === 'en' ? 'es' : 'en' }));
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
        return <div className="p-10 text-center text-slate-400 font-medium">Select a facility from the sidebar to begin.</div>;
    }
  };

  const getActiveClaims = () => {
    return state.currentProject.facilities[state.activeFacility]?.claims || { user_claims: [], system_inferences: [], assumptions: [] };
  };

  const activeClaims = getActiveClaims();

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar 
        activeFacility={state.activeFacility} 
        language={state.language}
        projectTitle={state.currentProject.title}
        onSelect={(f) => setState(p => ({...p, activeFacility: f}))} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Modern Top Header */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 z-30 shadow-sm shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <Workflow size={18} />
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-bold text-slate-800 truncate leading-none mb-1">{state.currentProject.title}</h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{t.sidebar[state.activeFacility.toLowerCase() as keyof typeof t.sidebar] || state.activeFacility}</span>
                <ChevronRight size={10} />
                <span className="text-indigo-500">Live Workspace</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-100">
              <Clock size={12} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active: {elapsed}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleLanguage}
                className="w-10 h-10 flex items-center justify-center text-[10px] font-black text-slate-500 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl transition-all uppercase"
              >
                {state.language}
              </button>
              <button 
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                onClick={() => {
                  const blob = new Blob([JSON.stringify(state.currentProject, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `arch-scaffold.json`;
                  a.click();
                }}
              >
                <Download size={14} />
                <span>Export</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Work Area - Split Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Facility Workspace (Scrollable) */}
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
            <div className="max-w-5xl mx-auto p-8 lg:p-12 animate-fade-in">
              {renderActiveFacility()}
            </div>
          </main>

          {/* Persistent Insight Panel (The Architect's Ledger) */}
          <aside className="w-80 border-l bg-white flex flex-col shrink-0 hidden xl:flex">
            <div className="p-6 border-b flex items-center justify-between bg-slate-50/30">
              <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <AlertCircle size={14} className="text-indigo-500" />
                Architect's Ledger
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
              {/* Claims Section */}
              <section>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                  Methodological Claims
                  <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded">{activeClaims.user_claims.length}</span>
                </h3>
                <div className="space-y-3">
                  {activeClaims.user_claims.length > 0 ? activeClaims.user_claims.map((claim: string, i: number) => (
                    <div key={i} className="p-3 bg-indigo-50/30 border border-indigo-100/50 rounded-xl text-[11px] font-medium text-slate-700 leading-relaxed italic">
                      "{claim}"
                    </div>
                  )) : <div className="text-[11px] text-slate-300 italic">No explicit claims detected.</div>}
                </div>
              </section>

              {/* Inferences Section */}
              <section>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Structural Inferences</h3>
                <div className="space-y-3">
                   {activeClaims.system_inferences.length > 0 ? activeClaims.system_inferences.map((inf: string, i: number) => (
                    <div key={i} className="flex gap-3 text-[11px] font-medium text-slate-600 leading-relaxed p-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      {inf}
                    </div>
                  )) : <div className="text-[11px] text-slate-300 italic">Waiting for architecture scan...</div>}
                </div>
              </section>

              {/* Assumptions Section */}
              <section>
                <h3 className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-4">Critical Assumptions</h3>
                <div className="space-y-3">
                  {activeClaims.assumptions.length > 0 ? activeClaims.assumptions.map((ass: string, i: number) => (
                    <div key={i} className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[11px] font-bold text-rose-700 leading-relaxed shadow-sm">
                      ⚠️ {ass}
                    </div>
                  )) : <div className="text-[11px] text-slate-300 italic text-center py-4">Structure currently stable.</div>}
                </div>
              </section>
            </div>
            
            <div className="p-6 border-t bg-slate-900 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <FileText size={16} />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Methodology Note</p>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-400 font-medium">
                ARCH enforces the separation of user premises from system inferences. This prevents circular reasoning in your research design.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default App;
