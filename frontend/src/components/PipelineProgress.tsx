import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle2, Timer } from 'lucide-react';

interface PipelineProgressProps {
  currentStage: string;
  logs: { time: string; msg: string }[];
}

const STAGES = [
  { id: 'requirements', name: 'Requirements' },
  { id: 'architecture', name: 'Architecture' },
  { id: 'codeGen', name: 'Code Generator' },
  { id: 'testGen', name: 'QA Tests' },
  { id: 'debug', name: 'Debug Agent' },
  { id: 'review', name: 'Security Review' },
];

export const PipelineProgress: React.FC<PipelineProgressProps> = ({ currentStage, logs }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (currentStage === 'complete' || currentStage === 'error') return;
    const start = Date.now();
    const interval = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(interval);
  }, [currentStage]);

  const completedIndex = STAGES.findIndex((s) => s.id === currentStage);
  const progressPct =
    currentStage === 'complete'
      ? 100
      : completedIndex >= 0
      ? Math.round(((completedIndex + 1) / STAGES.length) * 100)
      : 5;

  return (
    <div className="bg-surface p-6 rounded-2xl border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
          <h3 className="font-bold text-sm text-white">Autonomous Pipeline Executing...</h3>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <Timer className="w-3.5 h-3.5" />
          <span>{elapsed}s</span>
        </div>
      </div>

      <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {STAGES.map((s, i) => (
          <div key={s.id} className="bg-surface-2 p-2.5 rounded-xl border border-border text-center">
            <div className="text-[10px] text-gray-400 font-bold uppercase">{s.name}</div>
            <div className="mt-1 flex justify-center">
              {currentStage === 'complete' || i < completedIndex || currentStage === s.id ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-primary/40 animate-ping" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-bg/90 p-3 rounded-xl border border-border font-mono text-[11px] text-green-400 max-h-40 overflow-auto space-y-1">
        {logs.map((log, idx) => (
          <div key={idx} className="flex gap-2 animate-fadeIn">
            <span className="text-gray-500">[{log.time}]</span>
            <span>{log.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
