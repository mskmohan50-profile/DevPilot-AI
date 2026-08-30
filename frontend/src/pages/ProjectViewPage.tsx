import React, { useState } from 'react';
import { Project, FileNode } from '../types';
import { CodeEditor } from '../components/CodeEditor';
import {
  Download, LayoutDashboard, FileText, Blocks, Code2, TestTube2, Bug, ShieldCheck,
  CheckCircle2, XCircle, Clock3, Gauge,
} from 'lucide-react';
import { api } from '../services/api';
import { downloadBlob, countFiles, healthColor, healthBarColor, techStackLabel } from '../utils/formatters';

interface ProjectViewPageProps {
  project: Project;
}

const STAGES = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'reqs', label: 'Requirements', icon: FileText },
  { key: 'arch', label: 'Architecture', icon: Blocks },
  { key: 'code', label: 'Source Code', icon: Code2 },
  { key: 'tests', label: 'Tests', icon: TestTube2 },
  { key: 'debug', label: 'Debug', icon: Bug },
  { key: 'review', label: 'Code Review', icon: ShieldCheck },
];

const PRIORITY_STYLES: Record<string, string> = {
  High: 'bg-error/20 text-error border-error/30',
  Medium: 'bg-warning/20 text-warning border-warning/30',
  Low: 'bg-success/20 text-success border-success/30',
};

function ScoreRing({ value, label }: { value: number; label: string }) {
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 85 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="26" stroke="#1f2937" strokeWidth="6" fill="none" />
        <circle
          cx="32" cy="32" r="26" stroke={color} strokeWidth="6" fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-90 32 32)"
        />
        <text x="32" y="37" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">{value}</text>
      </svg>
      <span className="text-[10px] text-gray-400 uppercase tracking-wide text-center">{label}</span>
    </div>
  );
}

export const ProjectViewPage: React.FC<ProjectViewPageProps> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'reqs' | 'arch' | 'code' | 'tests' | 'debug' | 'review'>('overview');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [copied, setCopied] = useState(false);

  const handleExportZip = async () => {
    if (!project.file_tree) return;
    try {
      const blob = await api.exportZip(project.file_tree, project.title);
      downloadBlob(blob, `${project.title.toLowerCase().replace(/\s+/g, '-')}.zip`);
    } catch (err) {
      alert('Failed to export zip file');
    }
  };

  const handleCopyCode = () => {
    if (!selectedFile?.content) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    if (!selectedFile?.content || !selectedFile?.name) return;
    const blob = new Blob([selectedFile.content], { type: 'text/plain' });
    downloadBlob(blob, selectedFile.name);
  };

  const renderFileTree = (node: FileNode) => {
    if (node.type === 'file') {
      return (
        <div
          key={node.name}
          onClick={() => setSelectedFile(node)}
          className={`cursor-pointer px-3 py-1.5 text-xs rounded hover:bg-surface-2 transition ${
            selectedFile?.name === node.name ? 'bg-primary/20 text-primary font-bold' : 'text-gray-300'
          }`}
        >
          📄 {node.name}
        </div>
      );
    }
    return (
      <div key={node.name} className="ml-2">
        <div className="font-bold text-xs text-gray-400 my-1">📁 {node.name}</div>
        <div className="ml-2 space-y-0.5">
          {node.children?.map((child) => renderFileTree(child))}
        </div>
      </div>
    );
  };

  const fileCount = countFiles(project.file_tree);
  const health = project.health_score;
  const overallHealth = health?.codeQuality ?? project.review?.overall ?? (project.status === 'complete' ? 90 : 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-surface border-b border-border px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap gap-3 justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">{project.title}</h2>
            {project.tech_stack && (
              <span className="text-[10px] bg-surface-2 border border-border text-gray-400 px-2 py-0.5 rounded-full">
                {techStackLabel(project.tech_stack)}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">{project.description}</p>
        </div>

        <div className="flex items-center gap-3">
          {project.file_tree && (
            <button
              onClick={handleExportZip}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold transition shadow-glow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Code (.zip)</span>
            </button>
          )}

          <div className="flex gap-1 bg-bg p-1 rounded-xl border border-border text-xs overflow-x-auto">
            {STAGES.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveTab(s.key as any)}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === s.key ? 'bg-primary text-white font-semibold shadow-glow' : 'text-gray-400 hover:text-white'
                }`}
              >
                <s.icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6 max-w-4xl animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface p-5 rounded-xl border border-border md:col-span-1 flex flex-col items-center justify-center">
                <Gauge className="w-4 h-4 text-primary mb-2" />
                <div className={`text-4xl font-extrabold ${healthColor(overallHealth)}`}>{overallHealth}%</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Overall Health</div>
              </div>
              <div className="bg-surface p-5 rounded-xl border border-border md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-xl font-bold text-white">{fileCount}</div>
                  <div className="text-[10px] text-gray-400 uppercase">Files Generated</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{project.tests?.total ?? 0}</div>
                  <div className="text-[10px] text-gray-400 uppercase">Tests Run</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-success">{project.tests?.passed ?? 0}</div>
                  <div className="text-[10px] text-gray-400 uppercase">Tests Passed</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{project.requirements?.apiEndpoints?.length ?? 0}</div>
                  <div className="text-[10px] text-gray-400 uppercase">API Endpoints</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{project.architecture?.componentStructure?.length ?? 0}</div>
                  <div className="text-[10px] text-gray-400 uppercase">Components</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{project.review?.findings?.length ?? 0}</div>
                  <div className="text-[10px] text-gray-400 uppercase">Review Findings</div>
                </div>
              </div>
            </div>

            {health && (
              <div className="bg-surface p-5 rounded-xl border border-border">
                <h3 className="font-bold text-sm text-primary mb-4">Health Breakdown</h3>
                <div className="flex flex-wrap gap-6 justify-around">
                  <ScoreRing value={health.codeQuality} label="Code Quality" />
                  <ScoreRing value={health.productionReady} label="Production Ready" />
                  <ScoreRing value={Math.max(0, 100 - health.securityIssues * 10)} label="Security" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  {[
                    ['Requirements', health.requirements],
                    ['Architecture', health.architecture],
                    ['Implementation', health.implementation],
                    ['Tests', health.tests],
                    ['Security', health.security],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between bg-surface-2 px-3 py-2 rounded-lg text-xs border border-border">
                      <span className="text-gray-400">{label}</span>
                      <span className="text-gray-200 font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reqs' && (
          <div className="space-y-6 max-w-4xl animate-fadeIn">
            <div className="bg-surface p-5 rounded-xl border border-border">
              <h3 className="font-bold text-sm text-primary mb-2">System Overview</h3>
              <p className="text-xs text-gray-300 leading-relaxed">{project.requirements?.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface p-5 rounded-xl border border-border">
                <h3 className="font-bold text-sm text-primary mb-3">Core Features</h3>
                <ul className="list-disc list-inside text-xs text-gray-300 space-y-1.5">
                  {project.requirements?.features?.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-surface p-5 rounded-xl border border-border">
                <h3 className="font-bold text-sm text-primary mb-3">Target Users</h3>
                <ul className="list-disc list-inside text-xs text-gray-300 space-y-1.5">
                  {project.requirements?.users?.map((u, i) => (
                    <li key={i}>{u}</li>
                  ))}
                </ul>
              </div>

              {project.requirements?.functionalReqs && project.requirements.functionalReqs.length > 0 && (
                <div className="bg-surface p-5 rounded-xl border border-border">
                  <h3 className="font-bold text-sm text-primary mb-3">Functional Requirements</h3>
                  <ul className="list-disc list-inside text-xs text-gray-300 space-y-1.5">
                    {project.requirements.functionalReqs.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}

              {project.requirements?.nonFunctionalReqs && project.requirements.nonFunctionalReqs.length > 0 && (
                <div className="bg-surface p-5 rounded-xl border border-border">
                  <h3 className="font-bold text-sm text-primary mb-3">Non-Functional Requirements</h3>
                  <ul className="list-disc list-inside text-xs text-gray-300 space-y-1.5">
                    {project.requirements.nonFunctionalReqs.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}

              {project.requirements?.authRequirements && project.requirements.authRequirements.length > 0 && (
                <div className="bg-surface p-5 rounded-xl border border-border">
                  <h3 className="font-bold text-sm text-primary mb-3">Auth Requirements</h3>
                  <ul className="list-disc list-inside text-xs text-gray-300 space-y-1.5">
                    {project.requirements.authRequirements.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}

              {project.requirements?.edgeCases && project.requirements.edgeCases.length > 0 && (
                <div className="bg-surface p-5 rounded-xl border border-border">
                  <h3 className="font-bold text-sm text-primary mb-3">Edge Cases Considered</h3>
                  <ul className="list-disc list-inside text-xs text-gray-300 space-y-1.5">
                    {project.requirements.edgeCases.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {project.requirements?.databaseEntities && project.requirements.databaseEntities.length > 0 && (
              <div className="bg-surface p-5 rounded-xl border border-border">
                <h3 className="font-bold text-sm text-primary mb-3">Database Entities</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {project.requirements.databaseEntities.map((ent, i) => (
                    <div key={i} className="bg-surface-2 p-3 rounded-lg border border-border">
                      <div className="font-bold text-xs text-white mb-1">{ent.name}</div>
                      <div className="text-[10px] text-gray-400 space-y-0.5">
                        {ent.fields.map((f, j) => <div key={j} className="font-mono">{f}</div>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.requirements?.apiEndpoints && (
              <div className="bg-surface p-5 rounded-xl border border-border">
                <h3 className="font-bold text-sm text-primary mb-3">REST API Endpoints</h3>
                <div className="space-y-2">
                  {project.requirements.apiEndpoints.map((ep, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-surface-2 p-2.5 rounded-lg border border-border text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {ep.method}
                        </span>
                        <span className="font-mono text-gray-200">{ep.path}</span>
                      </div>
                      <span className="text-gray-400 text-[11px]">{ep.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'arch' && (
          <div className="space-y-6 max-w-4xl animate-fadeIn">
            {project.architecture ? (
              <>
                <div className="bg-surface p-5 rounded-xl border border-border">
                  <h3 className="font-bold text-sm text-primary mb-3">Technology Stack</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {project.architecture.stack?.map((s, i) => (
                      <div key={i} className="bg-surface-2 p-3 rounded-lg border border-border">
                        <div className="text-[10px] text-gray-400 uppercase font-bold">{s.layer}</div>
                        <div className="font-bold text-xs text-white my-1">{s.technology}</div>
                        <div className="text-[10px] text-gray-400">{s.reason}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {project.architecture.systemArchitecture && (
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <h3 className="font-bold text-sm text-primary mb-2">System Architecture</h3>
                    <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{project.architecture.systemArchitecture}</p>
                  </div>
                )}

                {project.architecture.componentStructure && project.architecture.componentStructure.length > 0 && (
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <h3 className="font-bold text-sm text-primary mb-3">Component Structure</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.architecture.componentStructure.map((c, i) => (
                        <div key={i} className="bg-surface-2 p-3 rounded-lg border border-border">
                          <div className="font-bold text-xs text-white">{c.name}</div>
                          <div className="text-[11px] text-gray-400">{c.responsibility}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {project.architecture.apiStructure && (
                    <div className="bg-surface p-5 rounded-xl border border-border">
                      <h3 className="font-bold text-sm text-primary mb-2">API Structure</h3>
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{project.architecture.apiStructure}</p>
                    </div>
                  )}
                  {project.architecture.databaseDesign && (
                    <div className="bg-surface p-5 rounded-xl border border-border">
                      <h3 className="font-bold text-sm text-primary mb-2">Database Design</h3>
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{project.architecture.databaseDesign}</p>
                    </div>
                  )}
                  {project.architecture.authFlow && (
                    <div className="bg-surface p-5 rounded-xl border border-border">
                      <h3 className="font-bold text-sm text-primary mb-2">Auth Flow</h3>
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{project.architecture.authFlow}</p>
                    </div>
                  )}
                  {project.architecture.dataFlow && project.architecture.dataFlow.length > 0 && (
                    <div className="bg-surface p-5 rounded-xl border border-border">
                      <h3 className="font-bold text-sm text-primary mb-2">Data Flow</h3>
                      <ol className="list-decimal list-inside text-xs text-gray-300 space-y-1">
                        {project.architecture.dataFlow.map((d, i) => <li key={i}>{d}</li>)}
                      </ol>
                    </div>
                  )}
                </div>

                {project.architecture.recommendedFeatures && project.architecture.recommendedFeatures.length > 0 && (
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <h3 className="font-bold text-sm text-primary mb-3">Recommended Features</h3>
                    <div className="space-y-2">
                      {project.architecture.recommendedFeatures.map((rf, i) => (
                        <div key={i} className="bg-surface-2 p-3 rounded-lg border border-border">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-xs text-white">{rf.feature}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${PRIORITY_STYLES[rf.priority] || ''}`}>
                              {rf.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mb-1">{rf.description}</p>
                          <p className="text-[10px] text-gray-500 italic">{rf.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-gray-500">No architecture plan available for this project yet.</p>
            )}
          </div>
        )}

        {activeTab === 'code' && (
          <CodeEditor
            selectedFile={selectedFile}
            renderFileTree={renderFileTree}
            rootTree={project.file_tree}
            onCopy={handleCopyCode}
            onDownload={handleDownloadFile}
            copied={copied}
          />
        )}

        {activeTab === 'tests' && (
          <div className="space-y-6 max-w-4xl animate-fadeIn">
            {project.tests && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-surface p-4 rounded-xl border border-border">
                  <div className="text-xl font-bold text-white">{project.tests.total}</div>
                  <div className="text-[10px] text-gray-400 uppercase">Total Tests</div>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border">
                  <div className="text-xl font-bold text-success">{project.tests.passed}</div>
                  <div className="text-[10px] text-gray-400 uppercase">Passed</div>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border">
                  <div className="text-xl font-bold text-error">{project.tests.failed}</div>
                  <div className="text-[10px] text-gray-400 uppercase">Failed</div>
                </div>
                <div className="bg-surface p-4 rounded-xl border border-border">
                  <div className="text-xl font-bold text-white">{project.tests.coverageEstimate ?? '—'}{project.tests.coverageEstimate ? '%' : ''}</div>
                  <div className="text-[10px] text-gray-400 uppercase">Coverage Est.</div>
                </div>
              </div>
            )}

            <div className="bg-surface p-5 rounded-xl border border-border">
              <h3 className="font-bold text-sm text-primary mb-3 flex items-center justify-between">
                <span>Automated Test Execution</span>
                {project.tests?.durationMs !== undefined && (
                  <span className="text-[10px] text-gray-500 flex items-center gap-1 font-normal">
                    <Clock3 className="w-3 h-3" /> {(project.tests.durationMs / 1000).toFixed(1)}s
                  </span>
                )}
              </h3>
              <div className="space-y-2">
                {project.tests?.cases?.map((c) => (
                  <div key={c.id} className="bg-surface-2 p-3 rounded-lg text-xs border border-border">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-200 flex items-center gap-2">
                        {c.status === 'pass' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-error" />
                        )}
                        [{c.group}] {c.name}
                        {c.type && <span className="text-[9px] bg-surface px-1.5 py-0.5 rounded border border-border text-gray-400">{c.type}</span>}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.status === 'pass' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                      }`}>
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                    {c.error && <p className="text-[10px] text-error/80 mt-1.5 font-mono">{c.error}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'debug' && (
          <div className="space-y-6 max-w-4xl animate-fadeIn">
            {project.debug_results ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <div className="text-xl font-bold text-error">{project.debug_results.initialFailed}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Initial Failures</div>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <div className="text-xl font-bold text-white">{project.debug_results.fixes.length}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Fixes Applied</div>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <div className="text-xl font-bold text-success">{project.debug_results.finalPassed}</div>
                    <div className="text-[10px] text-gray-400 uppercase">Final Passed</div>
                  </div>
                  <div className="bg-surface p-4 rounded-xl border border-border">
                    <div className={`text-xl font-bold ${project.debug_results.resolved ? 'text-success' : 'text-warning'}`}>
                      {project.debug_results.resolved ? 'Resolved' : 'Partial'}
                    </div>
                    <div className="text-[10px] text-gray-400 uppercase">Status</div>
                  </div>
                </div>

                <div className="bg-surface p-5 rounded-xl border border-border">
                  <h3 className="font-bold text-sm text-primary mb-3">Root-Cause Fixes</h3>
                  <div className="space-y-3">
                    {project.debug_results.fixes.map((fix, i) => (
                      <div key={i} className="bg-surface-2 p-3 rounded-lg border border-border">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-white">{fix.testName}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${fix.applied ? 'bg-success/20 text-success border-success/30' : 'bg-warning/20 text-warning border-warning/30'}`}>
                            {fix.applied ? 'Applied' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-[10px] text-error/80 font-mono mb-1.5">{fix.error}</p>
                        <p className="text-[11px] text-gray-400 mb-1.5"><span className="text-gray-300 font-semibold">Root cause: </span>{fix.rootCause}</p>
                        {fix.analysis && fix.analysis.length > 0 && (
                          <div className="ml-2 border-l border-border pl-3 space-y-1 mb-1.5">
                            {fix.analysis.map((a, j) => (
                              <p key={j} className="text-[10px] text-gray-500"><span className="text-gray-400 font-semibold">{a.step}: </span>{a.detail}</p>
                            ))}
                          </div>
                        )}
                        <p className="text-[11px] text-gray-300"><span className="font-semibold text-success">Fix: </span>{fix.fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-gray-500">No debug cycle was required — all tests passed on first run.</p>
            )}
          </div>
        )}

        {activeTab === 'review' && (
          <div className="space-y-6 max-w-4xl animate-fadeIn">
            {project.review && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-surface p-5 rounded-xl border border-border flex items-center gap-4">
                    <ScoreRing value={project.review.overall} label="Overall Score" />
                    <div className="text-xs text-gray-400">Aggregate quality score across all reviewed categories.</div>
                  </div>
                  <div className="bg-surface p-5 rounded-xl border border-border flex items-center gap-4">
                    <ScoreRing value={project.review.productionReady} label="Production Ready" />
                    <div className="text-xs text-gray-400">Estimated readiness for a production deployment.</div>
                  </div>
                </div>

                {project.review.scores && project.review.scores.length > 0 && (
                  <div className="bg-surface p-5 rounded-xl border border-border">
                    <h3 className="font-bold text-sm text-primary mb-3">Category Scores</h3>
                    <div className="space-y-2.5">
                      {project.review.scores.map((s, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-300">{s.category}</span>
                            <span className="text-gray-400 font-semibold">{s.score}/100</span>
                          </div>
                          <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${healthBarColor(s.score)}`} style={{ width: `${s.score}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="bg-surface p-5 rounded-xl border border-border">
              <h3 className="font-bold text-sm text-primary mb-3">Audit Findings</h3>
              <div className="space-y-2">
                {project.review?.findings?.map((f, i) => (
                  <div key={i} className="bg-surface-2 p-3 rounded-lg text-xs flex justify-between items-center gap-3 border border-border">
                    <span className="text-gray-200">{f.message}</span>
                    <span className={`font-bold uppercase text-[10px] shrink-0 px-2 py-0.5 rounded-full border ${
                      f.type === 'positive' ? 'bg-success/20 text-success border-success/30'
                      : f.type === 'error' ? 'bg-error/20 text-error border-error/30'
                      : 'bg-warning/20 text-warning border-warning/30'
                    }`}>
                      {f.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
