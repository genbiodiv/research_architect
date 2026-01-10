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
  Terminal,
  PanelRightClose,
  PanelRightOpen,
  ShieldCheck,
  Activity,
  Box
} from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    language: 'en',
    currentProject: {
      id: 'default-project',
      title: 'Structural Research Design',
      description: 'Systematic research scaffold.',
      facilities: {}
    },
    activeFacility: FacilityType.QUESTION_EXPLORER,
    history: []
  });

  const [preFillValue, setPreFillValue] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState('0m');
  const [isLedgerOpen, setIsLedgerOpen] = useState(true);
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      const mins = Math.floor((Date.now() - sessionStartTime) / 60000);
      setElapsed(`${mins}m`);
    }, 60000);
    return () => clearInterval(timer);
  }, [sessionStartTime]);

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
    <div className="flex h-screen bg-white font-sans text-slate-900 overflow-hidden">
      <Sidebar 
        activeFacility={state.activeFacility} 
        language={state.language}
        projectTitle={state.currentProject.title}
        onSelect={(f) => setState(p => ({...p, activeFacility: f}))} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-100 bg-white flex items-center justify-between px-8 shrink-0 z-20">
          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
              <Box size={12} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{state.currentProject.title}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span>{state.activeFacility.replace('_', ' ')}</span>
              <ChevronRight size={10} className="text-slate-200" />
              <span className="text-indigo-600">Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100">
              <Clock size={11} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase">{elapsed}</span>
            </div>
            
            <button 
              onClick={() => setIsLedgerOpen(!isLedgerOpen)}
              className={`p-2 rounded-lg transition-all ${isLedgerOpen ? 'bg-indigo-50 text-indigo-600 shadow-inner' : 'text-slate-400 hover:bg-slate-50'}`}
              title="Toggle Scientific Ledger"
            >
              {isLedgerOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            </button>

            <button 
              onClick={() => {
                const blob = new Blob([JSON.stringify(state.currentProject, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a'); a.href = url; a.download = `blueprint.json`; a.click();
              }}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <Download size={12} />
              Export
            </button>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30">
            <div className="max-w-4xl mx-auto p-10 lg:p-14 fade-in">
              {renderActiveFacility()}
            </div>
          </main>

          <aside 
            className={`bg-white border-l border-slate-100 transition-all duration-300 ease-in-out flex flex-col shrink-0 overflow-hidden shadow-2xl ${isLedgerOpen ? 'w-80 opacity-100' : 'w-0 opacity-0 border-l-0'}`}
          >
            <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <Terminal size={12} className="text-indigo-600" />
                Ledger
              </h2>
              <ShieldCheck size={14} className="text-emerald-500" />
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-10">
              <div>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Premises</h3>
                <div className="space-y-3">
                  {activeClaims.user_claims.length > 0 ? activeClaims.user_claims.map((claim: string, i: number) => (
                    <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-[11px] font-medium text-slate-600 italic leading-relaxed">
                      "{claim}"
                    </div>
                  )) : <p className="text-[10px] text-slate-300 italic">No direct premises detected.</p>}
                </div>
              </div>

              <div>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Structural Inferences</h3>
                <div className="space-y-4">
                   {activeClaims.system_inferences.length > 0 ? activeClaims.system_inferences.map((inf: string, i: number) => (
                    <div key={i} className="flex gap-3 text-[11px] font-medium text-slate-700 leading-relaxed group">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <p>{inf}</p>
                    </div>
                  )) : <p className="text-[10px] text-slate-300 italic">Parsing logical architecture...</p>}
                </div>
              </div>

              <div>
                <h3 className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] mb-4">Critique & Assumptions</h3>
                <div className="space-y-3">
                  {activeClaims.assumptions.length > 0 ? activeClaims.assumptions.map((ass: string, i: number) => (
                    <div key={i} className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-[11px] font-bold text-rose-800 leading-snug shadow-sm">
                      ⚠️ {ass}
                    </div>
                  )) : <p className="text-[10px] text-slate-300 italic">No risks flagged.</p>}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-950 text-slate-400">
               <div className="flex items-center gap-2 mb-3">
                 <Activity size={14} className="text-emerald-400" />
                 <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">System Rigor</span>
               </div>
               <p className="text-[10px] leading-relaxed font-medium">
                 ARCH isolates user premises from system deductions to eliminate circular reasoning.
               </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default App;