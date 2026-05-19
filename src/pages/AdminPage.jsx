import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Eye, ShieldCheck, Moon, Sun } from 'lucide-react';
import useAuthStore from '../context/authStore';
import useDarkMode from '../context/darkModeStore';
import KnowledgeBaseManager from '../components/KnowledgeBaseManager';
import EmployeeMonitor from '../components/EmployeeMonitor';
import { updateUserStatus } from '../utils/firebase';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('kb');
  const { user, logout } = useAuthStore();
  const { isDark, toggle, init } = useDarkMode();
  const navigate = useNavigate();
  const heartbeatRef = useRef(null);

  useEffect(() => {
    init();
  }, [init]);

  // Heartbeat to keep admin online status fresh
  useEffect(() => {
    if (!user?.email) return;
    updateUserStatus(user.email, true);
    heartbeatRef.current = setInterval(() => {
      updateUserStatus(user.email, true);
    }, 30000);
    const handleBeforeUnload = () => {
      updateUserStatus(user.email, false);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      clearInterval(heartbeatRef.current);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updateUserStatus(user.email, false);
    };
  }, [user?.email]);

  const handleLogout = async () => {
    clearInterval(heartbeatRef.current);
    await updateUserStatus(user?.email, false);
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F1E9E9] dark:bg-[#15173D] transition-colors">
      {/* Top Navigation */}
      <header className="bg-white dark:bg-[#15173D] shadow-sm border-b border-[#982598]/10 dark:border-[#982598]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-7 h-7 text-[#982598]" />
              <h1 className="text-xl font-bold text-gray-800 dark:text-[#F1E9E9]">Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggle}
                className="p-2 rounded-lg text-gray-500 dark:text-[#E491C9]/60 hover:bg-gray-100 dark:hover:bg-[#0e0f29] transition-colors"
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <span className="text-sm text-gray-600 dark:text-[#E491C9]/80">
                Welcome, <span className="font-medium text-gray-800 dark:text-[#F1E9E9]">{user?.fullName}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 -mb-px">
            <button
              onClick={() => setActiveTab('kb')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'kb'
                  ? 'border-[#982598] text-[#982598] dark:text-[#E491C9] dark:border-[#E491C9]'
                  : 'border-transparent text-gray-500 dark:text-[#E491C9]/60 hover:text-gray-700 dark:hover:text-[#F1E9E9] hover:border-gray-300 dark:hover:border-[#982598]/30'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Knowledge Base Management
            </button>
            <button
              onClick={() => setActiveTab('monitor')}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'monitor'
                  ? 'border-[#982598] text-[#982598] dark:text-[#E491C9] dark:border-[#E491C9]'
                  : 'border-transparent text-gray-500 dark:text-[#E491C9]/60 hover:text-gray-700 dark:hover:text-[#F1E9E9] hover:border-gray-300 dark:hover:border-[#982598]/30'
              }`}
            >
              <Eye className="w-4 h-4" />
              Employee Monitoring
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'kb' && <KnowledgeBaseManager />}
        {activeTab === 'monitor' && <EmployeeMonitor />}
      </main>
    </div>
  );
};

export default AdminPage;