
import React from 'react';

const SpecViewer: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      <header className="border-b-4 border-indigo-600 pb-8">
        <h1 className="text-5xl font-extrabold text-slate-900 tracking-tighter mb-4">ARCH SYSTEM SPEC</h1>
        <p className="text-xl text-slate-500 font-medium">Technical Specification v1.0.0-PROD</p>
      </header>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-indigo-500 pl-4">A. PRODUCT OVERVIEW</h2>
        <div className="bg-white p-8 rounded-2xl shadow-sm border text-slate-600 space-y-4 leading-relaxed">
          <p><strong>ARCH (Research Architect)</strong> is an AI-supported research design scaffold for students and early-career scientists. It treats research as architecture: providing the structural blueprints (scaffolding) without writing the final prose.</p>
          <p><strong>Core Outcomes:</strong> Question maps, testable hypothesis sets, project blueprints, expertise heatmaps, and keyword search plans.</p>
          <p><strong>Strict Boundaries:</strong> ARCH does NOT browse the web, provide citations, or hallucinate certainty. It enforces the scientific method through rigid JSON schemas.</p>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-indigo-500 pl-4">F. AI LAYER & PROMPT ARCHITECTURE</h2>
        <div className="bg-slate-900 text-slate-300 p-8 rounded-2xl shadow-xl font-mono text-xs overflow-x-auto space-y-6">
          <div>
            <p className="text-indigo-400 font-bold mb-2">// SHARED CONTEXT HEADER</p>
            <pre className="bg-slate-800 p-4 rounded border border-slate-700 whitespace-pre-wrap">
{`You are ARCH, a rigorous scientific methodologist. 
NO WEB BROWSING. NO CITATIONS. 
LITERATURE SUPPORT IS KEYWORDS ONLY. 
Separate: user_claims, system_inferences, assumptions.`}
            </pre>
          </div>
          <div>
            <p className="text-emerald-400 font-bold mb-2">// EXAMPLE SCHEMA: HypothesisSet</p>
            <pre className="bg-slate-800 p-4 rounded border border-slate-700">
{`{
  "schema_version": "1.0.0",
  "hypotheses": [{
    "id": "string",
    "statement": "string",
    "variables": { "independent": [], "dependent": [], "control": [] },
    "testability_score": "number",
    "prediction": "string"
  }],
  "claims": { "user_claims": [], "system_inferences": [], "assumptions": [] }
}`}
            </pre>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-indigo-500 pl-4">H. NON-FUNCTIONAL REQUIREMENTS</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-3 text-slate-900">Performance</h3>
            <ul className="text-sm space-y-2 text-slate-500">
              <li>• AI p95 Latency: &lt; 12s (Gemini 3 Flash)</li>
              <li>• Export Time: &lt; 2s</li>
              <li>• Initial Load: &lt; 800ms</li>
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h3 className="font-bold mb-3 text-slate-900">Security & Privacy</h3>
            <ul className="text-sm space-y-2 text-slate-500">
              <li>• Local-First storage with snapshots</li>
              <li>• E2EE on all project transfers</li>
              <li>• Minimal PII (only project metadata)</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="p-8 bg-indigo-50 border-2 border-indigo-200 border-dashed rounded-2xl text-center">
        <p className="text-indigo-800 font-bold">End of Specification Document</p>
        <p className="text-indigo-600 text-sm">Proceed to facilities to begin research scaffolding.</p>
      </div>
    </div>
  );
};

export default SpecViewer;
