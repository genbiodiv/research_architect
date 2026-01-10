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
  ChevronRight, 
  Download, 
  Clock, 
  Settings2,
  Terminal,
  PanelRightClose,
  PanelRightOpen,
  LayoutGrid,
  HelpCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    language: 'en',
    currentProject: {
      id: 'default-project',
      title: 'Structural Research Scaffold',
      description: 'Systematic research design process.',
      facilities: {}
    },
    activeFacility: FacilityType.QUESTION_EXPLORER,
    history: []
  });

  const [preFillValue, setPreFillValue] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState('0m');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
        return null;
    }
  };

  const activeClaims = state.currentProject.facilities[state.activeFacility]?.claims || { user_claims: [], system_inferences: [], assumptions: [] };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* 1. Main Navigation Sidebar */}
      <Sidebar 
        activeFacility={state.activeFacility} 
        language={state.language}
        projectTitle={state.currentProject.title}
        onSelect={(f) => setState(p => ({...p, activeFacility: f}))} 
      />
      
      {/* 2. Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Global Header */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-8 shrink-0 z-30">
          <div className="flex items-center gap-6 overflow-hidden">
            <div className="flex flex-col min-w-0">
              <h1 className="text-sm font-black text-slate-800 tracking-tight uppercase truncate">{state.currentProject.title}</h1>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <span>{state.activeFacility.replace('_', ' ')}</span>
                <ChevronRight size={10} />
                <span className="text-indigo-600">Active Workspace</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
              <Clock size={12} className="text-slate-400" />
              <span className="text-[10px] font-black text-slate-500 tracking-tight uppercase">Session: {elapsed}</span>
            </div>
            
            <div className="h-8 w-px bg-slate-100 mx-2" />
            
            <button onClick={toggleLanguage} className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase w-8">
              {state.language}
            </button>

            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-all ${isSidebarOpen ? 'bg-indigo-50 text-indigo-600' : 'text-slate-400 hover:bg-slate-50'}`}
              title="Toggle Insight Ledger"
            >
              {isSidebarOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
            </button>

            <button 
              onClick={() => {
                const blob = new Blob([JSON.stringify(state.currentProject, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `arch-export.json`; a.click();
              }}
              className="hidden lg:flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              <Download size={14} />
              Export
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
            <div className="max-w-4xl mx-auto p-6 lg:p-12 fade-in pb-24">
              {renderActiveFacility()}
            </div>
          </main>

          {/* Collapsible Insight Sidebar (Ledger) */}
          <aside 
            className={`bg-white border-l transition-all duration-300 ease-in-out flex flex-col shrink-0 overflow-hidden shadow-2xl ${isSidebarOpen ? 'w-80' : 'w-0 border-l-0'}`}
          >
            <div className="p-6 border-b bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <Terminal size={14} className="text-indigo-600" />
                Scientific Ledger
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
              {/* Claims Section */}
              <div>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                  User Premises
                  <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[8px]">{activeClaims.user_claims.length}</span>
                </h3>
                <div className="space-y-3">
                  {activeClaims.user_claims.length > 0 ? activeClaims.user_claims.map((claim: string, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-medium text-slate-600 leading-relaxed italic">
                      "{claim}"
                    </div>
                  )) : <p className="text-[10px] text-slate-300 italic">No direct claims provided yet.</p>}
                </div>
              </div>

              {/* Inferences Section */}
              <div>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Architectural Inferences</h3>
                <div className="space-y-3">
                   {activeClaims.system_inferences.length > 0 ? activeClaims.system_inferences.map((inf: string, i: number) => (
                    <div key={i} className="flex gap-3 text-[11px] font-medium text-slate-700 leading-relaxed group">
                      <div className="w-1 h-1 rounded-full bg-indigo-500 mt-1.5 shrink-0 group-hover:scale-150 transition-transform" />
                      <p>{inf}</p>
                    </div>
                  )) : <p className="text-[10px] text-slate-300 italic">Analyzing structural logic...</p>}
                </div>
              </div>

              {/* Critical Assumptions Section */}
              <div>
                <h3 className="text-[9px] font-black text-rose-500 uppercase tracking-widest mb-4">Critical Assumptions</h3>
                <div className="space-y-3">
                  {activeClaims.assumptions.length > 0 ? activeClaims.assumptions.map((ass: string, i: number) => (
                    <div key={i} className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-[11px] font-bold text-rose-800 leading-snug shadow-sm">
                      ⚠️ {ass}
                    </div>
                  )) : <p className="text-[10px] text-slate-300 italic">Architecture appears grounded.</p>}
                </div>
              </div>
            </div>

            {/* Methodology Context */}
            <div className="p-6 border-t bg-slate-900 text-slate-400">
               <div className="flex items-center gap-2 mb-3">
                 <LayoutGrid size={14} className="text-indigo-400" />
                 <span className="text-[9px] font-black uppercase tracking-widest text-white">System Integrity</span>
               </div>
               <p className="text-[10px] leading-relaxed font-medium">
                 The ARCH Ledger differentiates your premises from logical extensions to avoid bias and circular reasoning.
               </p>
            </div>
          </aside>
        </div>
      </div>
      
      {/* Floating Action / Help */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-3">
        <button className="w-12 h-12 bg-white border border-slate-200 text-slate-400 rounded-full shadow-lg flex items-center justify-center hover:text-indigo-600 hover:border-indigo-100 transition-all active:scale-90 group relative">
          <HelpCircle size={22} />
          <div className="absolute right-full mr-4 bg-slate-900 text-white text-[10px] font-bold px-3 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Scientific Methodology Guide
          </div>
        </button>
      </div>
    </div>
  );
};

export default App;