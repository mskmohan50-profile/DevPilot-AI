import React, { useState } from 'react';
import { LogIn, UserCheck, Zap, Key, Settings, BookOpen, Bell, X, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProjectsContext } from '../context/ProjectContext';

interface HeaderProps {
  onOpenAuth: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth, onToggleSidebar }) => {
  const { user, logout, apiKey, setApiKey } = useAuth();
  const { projects } = useProjectsContext();
  const [showSettings, setShowSettings] = useState(false);
  const [keyDraft, setKeyDraft] = useState(apiKey);
  const [showNotifs, setShowNotifs] = useState(false);

  const completeCount = projects.filter((p) => p.status === 'complete').length;

  const handleSaveKey = () => {
    setApiKey(keyDraft.trim());
    setShowSettings(false);
  };

  return (
    <header className="relative bg-surface/90 backdrop-blur border-b border-border px-3 sm:px-4 py-2 flex items-center justify-between z-20 min-h-[52px]">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 rounded-lg bg-surface-2 hover:bg-border border border-border transition text-gray-300 mr-0.5"
          title="Toggle projects"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30 shadow-glow">
          <Zap className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="text-[13px] font-bold text-white tracking-tight flex items-center gap-1.5 leading-tight">
            <span className="gradient-text">DevPilot AI</span>
            <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-mono font-normal hidden xs:inline">
              v1.0 Microservice
            </span>
          </h1>
          <p className="text-[10px] text-gray-400 leading-tight hidden sm:block">Autonomous Software Engineering Pipeline</p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3 text-[10px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span>{projects.length} project{projects.length !== 1 ? 's' : ''}</span>
        </div>
        <span className="w-px h-3 bg-border" />
        <span>{completeCount} shipped</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={() => setShowNotifs((s) => !s)}
          className="relative p-1.5 rounded-lg bg-surface-2 hover:bg-border border border-border transition text-gray-300"
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5" />
          {completeCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary border-2 border-surface" />
          )}
        </button>

        <button
          onClick={() => { setKeyDraft(apiKey); setShowSettings(true); }}
          className="p-1.5 rounded-lg bg-surface-2 hover:bg-border border border-border transition text-gray-300"
          title="Settings & API Key"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>

        <a
          href="https://github.com/mskmohan50-profile"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex p-1.5 rounded-lg bg-surface-2 hover:bg-border border border-border transition text-gray-300"
          title="Documentation"
        >
          <BookOpen className="w-3.5 h-3.5" />
        </a>

        {user ? (
          <div className="flex items-center gap-1.5 sm:gap-2 bg-surface-2 px-2 sm:px-2.5 py-1 rounded-lg border border-border text-[11px]">
            <UserCheck className="w-3.5 h-3.5 text-success" />
            <span className="text-gray-200 font-medium hidden sm:inline">{user.email}</span>
            <button
              onClick={logout}
              className="text-[10px] text-gray-400 hover:text-error transition sm:ml-1.5 sm:border-l sm:border-border sm:pl-1.5"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg bg-surface-2 hover:bg-border text-[11px] font-medium text-gray-200 border border-border transition"
            title="Workspace Auth"
          >
            <LogIn className="w-3 h-3 text-primary" />
            <span className="hidden sm:inline">Workspace Auth</span>
          </button>
        )}
      </div>

      {showNotifs && (
        <div className="absolute left-3 right-3 sm:left-auto sm:right-4 top-12 sm:w-72 bg-surface border border-border rounded-2xl shadow-2xl p-3 animate-slideUp z-30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-white">Notifications</h4>
            <button onClick={() => setShowNotifs(false)} className="text-gray-500 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          {completeCount === 0 ? (
            <p className="text-[11px] text-gray-500 py-4 text-center">No activity yet. Launch your first project!</p>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-auto">
              {projects.slice(0, 5).map((p) => (
                <div key={p.id} className="text-[11px] bg-surface-2 border border-border rounded-lg p-2">
                  <span className="text-gray-200 font-medium">{p.title}</span>
                  <span className="block text-gray-500">pipeline {p.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-slideUp">
            <div className="flex items-center gap-2 mb-1">
              <Key className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold text-white">LLM API Key</h3>
            </div>
            <p className="text-xs text-gray-400 mb-4">Stored locally in your browser. Used to power the AI generation pipeline.</p>
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="sk-..."
              className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-primary mb-4"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveKey}
                className="flex-1 bg-primary text-white font-semibold text-xs py-2 rounded-xl hover:bg-primary-dark transition"
              >
                Save Key
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-surface-2 text-gray-400 hover:text-white text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
