import React, { useMemo, useState } from 'react';
import { FileNode } from '../types';
import { Copy, Download, Check, Search, FileCode2 } from 'lucide-react';
import { countFiles } from '../utils/formatters';

interface CodeEditorProps {
  selectedFile: FileNode | null;
  renderFileTree: (node: FileNode) => React.ReactNode;
  rootTree?: FileNode;
  onCopy: () => void;
  onDownload: () => void;
  copied: boolean;
}

function filterTree(node: FileNode, query: string): FileNode | null {
  if (!query) return node;
  const q = query.toLowerCase();
  if (node.type === 'file') {
    return node.name.toLowerCase().includes(q) ? node : null;
  }
  const children = (node.children || [])
    .map((child) => filterTree(child, query))
    .filter((c): c is FileNode => !!c);
  if (children.length === 0 && !node.name.toLowerCase().includes(q)) return null;
  return { ...node, children };
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  selectedFile,
  renderFileTree,
  rootTree,
  onCopy,
  onDownload,
  copied,
}) => {
  const [fileQuery, setFileQuery] = useState('');
  const fileCount = useMemo(() => countFiles(rootTree), [rootTree]);
  const visibleTree = useMemo(
    () => (rootTree ? filterTree(rootTree, fileQuery) : undefined),
    [rootTree, fileQuery]
  );
  const lineCount = selectedFile?.content ? selectedFile.content.split('\n').length : 0;

  return (
    <div className="flex flex-col md:flex-row h-full gap-3 md:gap-4">
      <div className="w-full md:w-64 max-h-48 md:max-h-none bg-surface p-3 md:p-4 rounded-xl border border-border overflow-auto shrink-0 flex flex-col">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          <h3 className="font-bold text-xs text-gray-400 uppercase tracking-wider">Explorer</h3>
          <span className="text-[10px] bg-surface-2 px-1.5 py-0.5 rounded text-primary">{fileCount}</span>
        </div>
        <div className="relative mb-2 md:mb-3">
          <Search className="w-3 h-3 text-gray-500 absolute left-2.5 top-2" />
          <input
            value={fileQuery}
            onChange={(e) => setFileQuery(e.target.value)}
            placeholder="Filter files..."
            className="w-full bg-surface-2 border border-border rounded-lg pl-7 pr-2 py-1.5 text-[11px] text-gray-200 focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex-1 overflow-auto">
          {visibleTree ? renderFileTree(visibleTree) : (
            <p className="text-[11px] text-gray-500 text-center py-6">No files match "{fileQuery}"</p>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0 bg-surface rounded-xl border border-border p-3 md:p-4 flex flex-col font-mono text-xs overflow-hidden">
        <div className="border-b border-border pb-2.5 mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="font-bold text-primary truncate flex items-center gap-2 min-w-0">
            <FileCode2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{selectedFile ? selectedFile.name : 'Select a file from explorer'}</span>
            {selectedFile?.content && (
              <span className="text-[10px] text-gray-500 font-normal shrink-0">({lineCount} lines)</span>
            )}
          </div>
          {selectedFile?.content && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={onCopy}
                className="flex items-center gap-1.5 bg-surface-2 hover:bg-border text-gray-300 px-2.5 py-1 rounded text-xs transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={onDownload}
                className="flex items-center gap-1.5 bg-surface-2 hover:bg-border text-gray-300 px-2.5 py-1 rounded text-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-auto bg-bg rounded-lg">
          {selectedFile?.content ? (
            <div className="flex">
              <div className="select-none text-right pr-3 pl-3 py-4 text-gray-600 border-r border-border/60">
                {selectedFile.content.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <pre className="flex-1 p-4 text-gray-200 leading-relaxed font-mono overflow-visible">
                {selectedFile.content}
              </pre>
            </div>
          ) : (
            <pre className="p-4 text-gray-500">// Select a file from the explorer on the left to view source code.</pre>
          )}
        </div>
      </div>
    </div>
  );
};
