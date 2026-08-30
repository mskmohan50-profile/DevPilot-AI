import { analyzeRequirements } from './agents/requirementAgent';
import { planArchitecture } from './agents/architectureAgent';
import { generateFileTree, TechStackChoice } from './agents/codeGenAgent';
import { generateTests } from './agents/testGenAgent';
import { analyzeFailures } from './agents/debugAgent';
import { reviewCode } from './agents/reviewAgent';

export type { TechStackChoice };

export interface ProgressCallbacks {
  onStageChange?: (stage: string, status: 'started' | 'completed' | 'failed', data?: any) => void;
  onDebugProgress?: (status: string, data?: any) => void;
}

export async function runFullPipeline(
  idea: string, 
  techStack: string = 'react-fastapi-postgres',
  callbacks?: ProgressCallbacks
) {
  
  callbacks?.onStageChange?.('requirements', 'started', { idea, techStack });
  const requirements = await analyzeRequirements(idea);
  callbacks?.onStageChange?.('requirements', 'completed', { summary: requirements.summary });

  callbacks?.onStageChange?.('architecture', 'started', { techStack });
  const architecture = await planArchitecture(requirements, techStack);
  callbacks?.onStageChange?.('architecture', 'completed', { layers: architecture.stack?.length });

  callbacks?.onStageChange?.('codeGen', 'started', { techStack });
  const fileTree = await generateFileTree(requirements, architecture, techStack);
  callbacks?.onStageChange?.('codeGen', 'completed', { root: fileTree.name });

  callbacks?.onStageChange?.('testGen', 'started');
  const tests = await generateTests(requirements, fileTree);
  callbacks?.onStageChange?.('testGen', 'completed', { total: tests.total, passed: tests.passed });

  callbacks?.onStageChange?.('debug', 'started', { failed: tests.failed });
  const debug = await analyzeFailures(tests, callbacks?.onDebugProgress);
  callbacks?.onStageChange?.('debug', 'completed', { resolved: debug.resolved });

  callbacks?.onStageChange?.('review', 'started');
  const review = await reviewCode(requirements, debug);
  callbacks?.onStageChange?.('review', 'completed', { overall: review.overall });

  return {
    requirements,
    architecture,
    fileTree,
    tests,
    debug,
    review,
  };
}
