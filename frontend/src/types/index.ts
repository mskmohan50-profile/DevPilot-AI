export type TechStackChoice =
  | 'react-fastapi-postgres'
  | 'nextjs-tailwind-postgres'
  | 'nodejs-express-mongodb'
  | 'vue-python-sqlite';

export interface RequirementAnalysis {
  summary: string;
  users: string[];
  features: string[];
  functionalReqs: string[];
  nonFunctionalReqs: string[];
  apiEndpoints: { method: string; path: string; description: string }[];
  databaseEntities: { name: string; fields: string[] }[];
  authRequirements: string[];
  edgeCases: string[];
}

export interface ArchitecturePlan {
  stack: { layer: string; technology: string; reason: string }[];
  systemArchitecture: string;
  componentStructure: { name: string; responsibility: string }[];
  apiStructure: string;
  databaseDesign: string;
  authFlow: string;
  dataFlow: string[];
  features?: string[];
  recommendedFeatures?: { feature: string; description: string; priority: 'High' | 'Medium' | 'Low'; rationale: string }[];
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  language?: string;
  content?: string;
  children?: FileNode[];
}

export interface TestCase {
  id: string;
  group: string;
  name: string;
  type?: 'unit' | 'integration' | 'e2e' | 'security' | 'performance';
  description?: string;
  assertion?: string;
  executionTimeMs?: number;
  status: 'pass' | 'fail';
  error?: string;
}

export interface TestSuite {
  total: number;
  passed: number;
  failed: number;
  durationMs?: number;
  coverageEstimate?: number;
  cases: TestCase[];
}

export interface DebugResult {
  initialPassed: number;
  initialFailed: number;
  fixes: {
    testId: string;
    testName: string;
    error: string;
    rootCause: string;
    analysis: { step: string; detail: string }[];
    fix: string;
    applied: boolean;
  }[];
  finalPassed: number;
  finalFailed: number;
  resolved: boolean;
}

export interface CodeReview {
  findings: { category: string; type: 'positive' | 'warning' | 'error'; message: string }[];
  scores: { category: string; score: number }[];
  overall: number;
  productionReady: number;
}

export interface HealthScore {
  requirements: string;
  architecture: string;
  implementation: string;
  tests: string;
  security: string;
  codeQuality: number;
  productionReady: number;
  securityIssues: number;
}

export type ProjectStatus = 'complete' | 'running' | 'error' | 'draft';

export interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  current_stage: string;
  tech_stack?: TechStackChoice | string;
  requirements?: RequirementAnalysis;
  architecture?: ArchitecturePlan;
  file_tree?: FileNode;
  tests?: TestSuite;
  debug_results?: DebugResult;
  review?: CodeReview;
  health_score?: HealthScore;
  created_at: string;
}
