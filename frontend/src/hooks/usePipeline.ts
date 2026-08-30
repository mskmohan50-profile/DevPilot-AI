import { useState, useCallback } from 'react';
import { api } from '../services/api';

export function usePipeline() {
  const [running, setRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('idle');
  const [progressLog, setProgressLog] = useState<{ time: string; msg: string }[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setProgressLog((prev) => [...prev, { time, msg }]);
  };

  const runPipeline = useCallback(async (idea: string, techStack: string) => {
    setRunning(true);
    setProgressLog([]);
    addLog('Initiating Multi-Agent AI Loop...');

    try {
      addLog('Stage 1/6: Analyzing Requirements & Endpoints...');
      setCurrentStage('requirements');
      const result = await api.generateFullProject(idea, techStack);
      addLog('Stage 6/6: Audit & Code Review Complete!');
      setCurrentStage('complete');
      return result;
    } catch (error: any) {
      addLog(`Error: ${error?.message || 'Pipeline failed'}`);
      setCurrentStage('error');
      throw error;
    } finally {
      setRunning(false);
    }
  }, []);

  return { running, currentStage, progressLog, runPipeline };
}
