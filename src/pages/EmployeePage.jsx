import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, MessageSquare, Plus, MessageCircle, Moon, Sun } from 'lucide-react';
import useAuthStore from '../context/authStore';
import useDarkMode from '../context/darkModeStore';
import { subscribeToSessions, createChatSession, updateUserStatus } from '../utils/firebase';
import ChatBox from '../components/ChatBox';
import Toast from '../components/Toast';

const EmployeePage = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [toast, setToast] = useState(null);
  const [creatingSession, setCreatingSession] = useState(false);
  const { user, logout } = useAuthStore();
  const { isDark, toggle, init } = useDarkMode();
  const navigate = useNavigate();
  const heartbeatRef = useRef(null);

  useEffect(() => {
    init();
  }, [init]);

  // Heartbeat: keep lastActive updated every 30 seconds
  useEffect(() => {
    if (!user?.email) return;

    // Set online on mount
    updateUserStatus(user.email, true);

    // Periodic heartbeat
    heartbeatRef.current = setInterval(() => {
      updateUserStatus(user.email, true);
    }, 30000);

    // Set offline on tab close
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

  useEffect(() => {
    if (user?.email) {
      const unsub = subscribeToSessions(user.email, (allSessions) => {
        setSessions(allSessions);
      });
      return () => unsub();
    }
  }, [user?.email]);

  const handleLogout = async () => {
    clearInterval(heartbeatRef.current);
    await updateUserStatus(user?.email, false);
    await logout();
    navigate('/login');
  };

  const handleNewChat = async () => {
    if (!user?.email) return;
    setCreatingSession(true);
    try {
      const sessionId = await createChatSession(user.email);
      setSelectedSessionId(sessionId);
      setToast({ message: 'New chat session created', type: 'success', key: Date.now() });
    } catch (error) {
      setToast({ message: 'Failed to create chat session', type: 'error', key: Date.now() });
    } finally {
      setCreatingSession(false);
    }
  };

  const handleSessionClick = (session) => {
    setSelectedSessionId(session.id);
    if (!session.isActive) {
      setToast({ message: 'This chat has been ended by admin', type: 'info', key: Date.now() });
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-[#F1E9E9] dark:bg-[#15173D] transition-colors">
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Top Navigation */}
      <header className="bg-white dark:bg-[#15173D] shadow-sm border-b border-[#982598]/10 dark:border-[#982598]/20">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-7 h-7 text-[#982598]" />
            <h1 className="text-xl font-bold text-gray-800 dark:text-[#F1E9E9]">Knowledge Base Assistant</h1>
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
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Left Sidebar - Chat Sessions */}
        <div className="w-80 bg-white dark:bg-[#15173D] border-r border-[#982598]/10 dark:border-[#982598]/20 flex flex-col">
          <div className="p-4 border-b border-[#982598]/10 dark:border-[#982598]/20">
            <button
              onClick={handleNewChat}
              disabled={creatingSession}
              className="w-full flex items-center justify-center gap-2 bg-[#982598] hover:bg-[#7a1e7a] disabled:bg-[#982598]/50 text-white px-4 py-2.5 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              {creatingSession ? 'Creating...' : 'New Chat'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="text-center py-10 text-gray-400 dark:text-[#E491C9]/50">
                <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-[#E491C9]/30" />
                <p className="text-sm">No chat sessions yet</p>
                <p className="text-xs mt-1">Click "New Chat" to start</p>
              </div>
            ) : (
              sessions.map((session) => {
                const isActive = session.isActive;
                const isSelected = selectedSessionId === session.id;
                return (
                  <button
                    key={session.id}
                    onClick={() => handleSessionClick(session)}
                    className={`w-full text-left px-4 py-3 border-b border-[#982598]/5 dark:border-[#982598]/20 transition-colors ${
                      isSelected
                        ? 'bg-[#982598]/10 dark:bg-[#982598]/20 border-l-4 border-l-[#982598]'
                        : 'hover:bg-gray-50 dark:hover:bg-[#0e0f29]'
                    } ${!isActive ? 'opacity-75' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium truncate flex-1 ${
                        isSelected ? 'text-[#982598] dark:text-[#E491C9]' : 'text-gray-800 dark:text-[#F1E9E9]'
                      }`}>
                        {session.title || 'New Chat'}
                      </p>
                      {isActive ? (
                        <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full ml-2">Active</span>
                      ) : (
                        <span className="text-xs bg-gray-100 dark:bg-[#0e0f29] text-gray-500 dark:text-[#E491C9]/60 px-2 py-0.5 rounded-full ml-2">Ended</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-[#E491C9]/60 mt-0.5">
                      {formatDate(session.createdAt)}
                    </p>
                    {!isActive && (
                      <p className="text-xs text-red-400 mt-0.5">
                        Ended by {session.endedBy || 'admin'}
                      </p>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Area - Chat Window */}
        <ChatBox 
          key={selectedSessionId} 
          sessionId={selectedSessionId}
        />
      </div>
    </div>
  );
};

export default EmployeePage;