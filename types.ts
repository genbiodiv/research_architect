
export type Language = 'en' | 'es';

export enum FacilityType {
  QUESTION_EXPLORER = 'QUESTION_EXPLORER',
  HYPOTHESIS_ENGINE = 'HYPOTHESIS_ENGINE',
  PROJECT_MAPPER = 'PROJECT_MAPPER',
  EXPERTISE_DETECTOR = 'EXPERTISE_DETECTOR',
  LIT_STRATEGY = 'LIT_STRATEGY',
  SPEC_VIEWER = 'SPEC_VIEWER'
}

export interface Claims {
  user_claims: string[];
  system_inferences: string[];
  assumptions: string[];
}

export interface QuestionNode {
  id: string;
  text: string;
  axis: 'scale' | 'mechanism' | 'comparison' | 'causality' | 'feasibility' | 'measurement' | 'confounders';
  children: string[];
}

export interface QuestionMap {
  schema_version: string;
  root_question: string;
  nodes: QuestionNode[];
  claims: Claims;
}

export interface Hypothesis {
  id: string;
  statement: string;
  variables: { independent: string[]; dependent: string[]; control: string[] };
  directionality: string;
  prediction: string;
  testability_score: number; // 1-10
}

export interface HypothesisSet {
  schema_version: string;
  hypotheses: Hypothesis[];
  claims: Claims;
}

export interface BlueprintNode {
  id: string;
  type: 'Objective' | 'Hypothesis' | 'Activity' | 'Method' | 'Output';
  content: string;
  links: string[]; // IDs of children
  // Resource metrics
  timeEstimate?: number; // In weeks
  effortLevel?: number; // 1-10
  uncertaintyLevel?: number; // 1-10
}

export interface ProjectBlueprint {
  schema_version: string;
  title: string;
  general_objective: string;
  graph: BlueprintNode[];
  consistency_report: string[];
  claims: Claims;
}

export interface ExpertiseComponent {
  topic: string;
  depth_required: 'low' | 'medium' | 'high';
  complexity: string;
  status: 'green' | 'yellow' | 'red';
  learning_topics: string[];
}

export interface ExpertiseHeatmap {
  schema_version: string;
  components: ExpertiseComponent[];
  claims: Claims;
}

export interface KeywordCluster {
  category: string;
  terms: string[];
}

export interface LiteratureStrategy {
  schema_version: string;
  clusters: KeywordCluster[];
  boolean_strings: string[];
  inclusion_terms: string[];
  exclusion_terms: string[];
  claims: Claims;
}

export interface AppState {
  language: Language;
  currentProject: {
    id: string;
    title: string;
    description: string;
    facilities: {
      [key in FacilityType]?: any;
    };
  };
  activeFacility: FacilityType;
  history: any[];
}
