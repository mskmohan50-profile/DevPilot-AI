import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider, useProjectsContext } from './context/ProjectContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { ProjectViewPage } from './pages/ProjectViewPage';

const MainWorkspace: React.FC = () => {
  const { selectedProject } = useProjectsContext();
  const [showNewProject, setShowNewProject] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { login } = useAuth();

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authEmail.trim()) {
      login(authEmail.trim());
      setShowAuthModal(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-bg text-gray-100 font-sans overflow-hidden">
      <Header onOpenAuth={() => setShowAuthModal(true)} onToggleSidebar={() => setSidebarOpen((s) => !s)} />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          onNewProject={() => {
            setShowNewProject(true);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 flex flex-col overflow-hidden min-w-0">
          {showNewProject ? (
            <NewProjectPage onCancel={() => setShowNewProject(false)} />
          ) : selectedProject ? (
            <ProjectViewPage project={selectedProject} />
          ) : (
            <DashboardPage onNewProject={() => setShowNewProject(true)} />
          )}
        </main>
      </div>

      {/* Workspace Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold mb-1 text-white">Workspace User Auth</h3>
            <p className="text-xs text-gray-400 mb-4">Sign in to sync your personal projects across workspaces.</p>
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-200 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-gray-200 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white font-semibold text-xs py-2 rounded-xl hover:bg-primary-dark transition"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="px-4 py-2 bg-surface-2 text-gray-400 hover:text-white text-xs rounded-xl transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <MainWorkspace />
      </ProjectProvider>
    </AuthProvider>
  );
}
