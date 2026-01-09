
import { GoogleGenAI } from "@google/genai";
import { FacilityType, Language } from "./types";

const SHARED_CONTEXT = `
You are ARCH (Research Architect), a rigorous scientific methodologist.
GLOBAL CONSTRAINTS:
- NO WEB BROWSING. NO CITATIONS.
- LITERATURE SUPPORT IS KEYWORDS ONLY.
- NEVER output papers, authors, journals, or URLs.
- Always separate: user_claims, system_inferences, assumptions.
- Output MUST be strict JSON conforming to the schema.
- If data is missing or user input is too vague, generate best-guess nodes that provoke further thought.
`;

const FACILITY_PROMPTS: Record<FacilityType, string> = {
  [FacilityType.QUESTION_EXPLORER]: `
    Purpose: Expand a research question into a branching map by axes: scale, mechanism, comparison, causality, feasibility, measurement, confounders.
    User Input: An initial research question or area of interest.
    JSON Output Requirements: 
    {
      "schema_version": "1.1.0",
      "root_question": "string",
      "nodes": [{"id": "string", "text": "string", "axis": "string"}],
      "claims": {"user_claims": [], "system_inferences": [], "assumptions": []}
    }
  `,
  [FacilityType.HYPOTHESIS_ENGINE]: `
    Purpose: Convert ideas/questions into testable hypotheses with variables, directionality, and predictions.
    User Input: Refined research question or draft ideas.
    JSON Output Requirements: 
    {
      "hypotheses": [{"statement": "string", "variables": {"independent": [], "dependent": [], "control": []}, "testability_score": number, "prediction": "string"}],
      "claims": {"user_claims": [], "system_inferences": [], "assumptions": []}
    }
  `,
  [FacilityType.PROJECT_MAPPER]: `
    Purpose: Map Title -> Objectives -> Hypotheses -> Activities -> Methods -> Outputs. Detect orphans or overreach.
    JSON Output Requirements: 
    {
      "graph": [{"type": "Objective|Hypothesis|Method|Output", "content": "string"}],
      "consistency_report": ["string"],
      "claims": {"user_claims": [], "system_inferences": [], "assumptions": []}
    }
  `,
  [FacilityType.EXPERTISE_DETECTOR]: `
    Purpose: Estimate theoretical depth and complexity.
    JSON Output Requirements: 
    {
      "components": [{"topic": "string", "depth_required": "low|medium|high", "complexity": "string", "status": "green|yellow|red", "learning_topics": []}],
      "claims": {"user_claims": [], "system_inferences": [], "assumptions": []}
    }
  `,
  [FacilityType.LIT_STRATEGY]: `
    Purpose: Design a keyword-only literature search strategy.
    JSON Output Requirements: 
    {
      "clusters": [{"category": "string", "terms": []}],
      "boolean_strings": [],
      "inclusion_terms": [],
      "exclusion_terms": [],
      "claims": {"user_claims": [], "system_inferences": [], "assumptions": []}
    }
  `,
  [FacilityType.SPEC_VIEWER]: "N/A"
};

function cleanJsonResponse(text: string): string {
  // Removes markdown code blocks and any trailing/leading whitespace
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) cleaned = cleaned.substring(7);
  if (cleaned.startsWith('```')) cleaned = cleaned.substring(3);
  if (cleaned.endsWith('```')) cleaned = cleaned.substring(0, cleaned.length - 3);
  return cleaned.trim();
}

export async function runFacility(facility: FacilityType, userInput: string, currentProjectState: any, language: Language = 'en') {
  if (facility === FacilityType.SPEC_VIEWER) return null;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    ${SHARED_CONTEXT}
    LANGUAGE CONSTRAINT: Respond EXCLUSIVELY in ${language === 'es' ? 'Spanish' : 'English'}.
    
    FACILITY INSTRUCTION: ${FACILITY_PROMPTS[facility]}
    
    CURRENT PROJECT STATE: ${JSON.stringify(currentProjectState || {})}
    USER INPUT: ${userInput}
    
    Return the result in RAW JSON format only. No markdown, no commentary.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const cleanedText = cleanJsonResponse(response.text || "{}");
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("AI Generation Error:", error);
    // Return a structured error object that UI can handle instead of crashing
    return {
      error: true,
      nodes: [],
      claims: { user_claims: [], system_inferences: ["The system encountered an error parsing the scientific structure."], assumptions: [] }
    };
  }
}
