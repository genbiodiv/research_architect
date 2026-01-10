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
  Activity,
  ShieldCheck,
  Terminal,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    language: 'en',
    currentProject: {
      id: 'default-project',
      title: 'Structural Research Design',
      description: 'Systematic approach to architectural research scaffolding.',
      facilities: {}
    },
    activeFacility: FacilityType.PROJECT_MAPPER,
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
        return null;
    }
  };

  const getActiveClaims = () => {
    return state.currentProject.facilities[state.activeFacility]?.claims || { user_claims: [], system_inferences: [], assumptions: [] };
  };

  const activeClaims = getActiveClaims();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* 1. PRIMARY SIDEBAR (Navigation) */}
      <Sidebar 
        activeFacility={state.activeFacility} 
        language={state.language}
        projectTitle={state.currentProject.title}
        onSelect={(f) => setState(p => ({...p, activeFacility: f}))} 
      />
      
      {/* 2. MAIN STAGE */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
        
        {/* TOP BAR: Project Context & Global Actions */}
        <header className="h-14 border-b bg-white flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center gap-4 min-w-0">
            <div className="flex flex-col min-w-0">
              <h1 className="text-xs font-black text-slate-800 truncate uppercase tracking-widest">{state.currentProject.title}</h1>
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                <span>{state.activeFacility.replace('_', ' ')}</span>
                <ChevronRight size={10} />
                <span className="text-indigo-500">Live Workspace</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
              <Clock size={11} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-500 tracking-tighter uppercase">{elapsed}</span>
            </div>
            
            <button 
              onClick={toggleLanguage}
              className="w-8 h-8 flex items-center justify-center text-[9px] font-black text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-slate-100"
            >
              {state.language.toUpperCase()}
            </button>
            
            <button 
              onClick={() => {
                const blob = new Blob([JSON.stringify(state.currentProject, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `arch-project.json`; a.click();
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
            >
              <Download size={12} />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>
        </header>

        {/* WORKSPACE & LEDGER SPLIT */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* CENTER: FACILITY WORKSPACE */}
          <main className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto p-6 md:p-10 facility-enter">
              {renderActiveFacility()}
            </div>
          </main>

          {/* RIGHT: ARCHITECT'S LEDGER (Logic Tracking) */}
          <aside className="w-72 border-l bg-white flex flex-col shrink-0 hidden lg:flex shadow-[-4px_0_12px_rgba(0,0,0,0.02)]">
            <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-[9px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <Terminal size={12} className="text-indigo-600" />
                Logic Ledger
              </h2>
              <ShieldCheck size={12} className="text-emerald-500" />
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-8 text-[11px]">
              {/* User Claims */}
              <section className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-widest">
                  <span>User Claims</span>
                  <span className="bg-slate-100 px-1.5 rounded text-slate-500">{activeClaims.user_claims.length}</span>
                </div>
                <div className="space-y-2">
                  {activeClaims.user_claims.length > 0 ? activeClaims.user_claims.map((c: string, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-600 italic leading-relaxed">
                      "{c}"
                    </div>
                  )) : <div className="text-slate-300 italic">No explicit claims detected.</div>}
                </div>
              </section>

              {/* System Inferences */}
              <section className="space-y-3">
                <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Inferences</p>
                <div className="space-y-2.5">
                   {activeClaims.system_inferences.length > 0 ? activeClaims.system_inferences.map((inf: string, i: number) => (
                    <div key={i} className="flex gap-2.5 items-start text-slate-700 font-medium">
                      <div className="w-1 h-1 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <p>{inf}</p>
                    </div>
                  )) : <div className="text-slate-300 italic">Structural analysis pending...</div>}
                </div>
              </section>

              {/* Red Assumptions */}
              <section className="space-y-3">
                <p className="text-[9px] font-black uppercase text-rose-400 tracking-widest">Untested Assumptions</p>
                <div className="space-y-2">
                  {activeClaims.assumptions.length > 0 ? activeClaims.assumptions.map((ass: string, i: number) => (
                    <div key={i} className="p-3 bg-rose-50 border border-rose-100 rounded-xl font-bold text-rose-700 leading-snug">
                      ⚠️ {ass}
                    </div>
                  )) : <div className="text-slate-300 italic">System currently stable.</div>}
                </div>
              </section>
            </div>

            {/* Bottom Methodology Guide */}
            <div className="p-5 border-t bg-architect-900 text-white/90">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={12} className="text-indigo-400" />
                <span className="text-[9px] font-black uppercase tracking-widest">Methodology Insight</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-400 font-medium italic">
                The ledger separates user belief from system deduction to prevent logical circularity in your design.
              </p>
            </div>
          </aside>
        </div>
      </div>
      
      {/* FLOATING HELP */}
      <div className="fixed bottom-6 right-6">
        <button className="w-10 h-10 bg-white border border-slate-200 rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 transition-all">
          <HelpCircle size={18} />
        </button>
      </div>
    </div>
  );
};

export default App;