import { useState, useEffect } from 'react';
import { Users, MessageSquare, Monitor, StopCircle, Clock, Loader2, X } from 'lucide-react';
import { subscribeToUsers, subscribeToAllSessions, subscribeToMessages, endChatSession, subscribeToSessionStatus } from '../utils/firebase';
import Toast from './Toast';

const EmployeeMonitor = () => {
  const [users, setUsers] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showStopConfirm, setShowStopConfirm] = useState(null);

  useEffect(() => {
    const unsubUsers = subscribeToUsers((data) => {
      setUsers(data.filter((u) => u.role === 'employee'));
      setLoading(false);
    });

    const unsubSessions = subscribeToAllSessions((data) => {
      setSessions(data);
    });

    return () => {
      unsubUsers();
      unsubSessions();
    };
  }, []);

  useEffect(() => {
    if (selectedSession) {
      const unsubMessages = subscribeToMessages(selectedSession.id, (data) => {
        setMessages(data);
      });

      const unsubStatus = subscribeToSessionStatus(selectedSession.id, (updatedSession) => {
        setSelectedSession(updatedSession);
      });

      return () => {
        unsubMessages();
        unsubStatus();
      };
    }
  }, [selectedSession?.id]);

  const handleEmployeeClick = (employee) => {
    setSelectedEmployee(employee);
    setSelectedSession(null);
    setMessages([]);
  };

  const handleSessionClick = (session) => {
    if (selectedSession?.id === session.id) return;
    setSelectedSession(session);
    setMessages([]);
  };

  const handleStopChat = async (sessionId) => {
    try {
      await endChatSession(sessionId, 'admin');
      setShowStopConfirm(null);
      setToast({ message: 'Chat stopped successfully', type: 'success', key: Date.now() });
    } catch (error) {
      setToast({ message: 'Failed to stop chat', type: 'error', key: Date.now() });
    }
  };

  const clearSelection = () => {
    setSelectedEmployee(null);
    setSelectedSession(null);
    setMessages([]);
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp?.toDate) return 'Never';
    const now = new Date();
    const diff = now - timestamp.toDate();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const isUserOnline = (employee) => {
    if (!employee.isOnline) return false;
    if (!employee.lastActive?.toDate) return false;
    const now = new Date();
    const diffMs = now - employee.lastActive.toDate();
    return diffMs < 60000;
  };

  const employeeSessions = selectedEmployee
    ? sessions.filter((s) => s.employeeId === selectedEmployee.email)
    : [];

  return (
    <div className="flex h-[calc(100vh-120px)] dark:bg-[#15173D]">
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Left Sidebar - Employees */}
      <div className="w-72 bg-white dark:bg-[#15173D] border-r border-[#982598]/10 dark:border-[#982598]/20 flex flex-col">
        <div className="p-4 border-b border-[#982598]/10 dark:border-[#982598]/20">
          <div className="flex items-center gap-2 text-gray-700 dark:text-[#F1E9E9]">
            <Users className="w-5 h-5" />
            <h3 className="font-semibold">Employees</h3>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[#982598]" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-[#E491C9]/60 text-sm">No employees found</div>
          ) : (
            users.map((employee) => (
              <button
                key={employee.email}
                onClick={() => handleEmployeeClick(employee)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#0e0f29] transition-colors border-b border-[#982598]/5 dark:border-[#982598]/20 ${
                  selectedEmployee?.email === employee.email ? 'bg-[#982598]/10 dark:bg-[#982598]/20 border-l-4 border-l-[#982598]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isUserOnline(employee) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-[#F1E9E9] truncate">{employee.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-[#E491C9]/60 truncate">{employee.email}</p>
                  </div>
                  <div className="text-xs text-gray-400 dark:text-[#E491C9]/50 flex items-center gap-1 flex-shrink-0">
                    <Clock className="w-3 h-3" />
                    {getTimeAgo(employee.lastActive)}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {!selectedEmployee ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-[#E491C9]/50">
            <div className="text-center">
              <Monitor className="w-16 h-16 mx-auto mb-3 text-gray-300 dark:text-[#E491C9]/30" />
              <p className="text-lg font-medium">Select an employee</p>
              <p className="text-sm mt-1">Choose an employee to monitor their chats</p>
            </div>
          </div>
        ) : (
          <>
            {/* Sessions sidebar */}
            <div className="w-64 bg-[#F1E9E9] dark:bg-[#15173D]/50 border-r border-[#982598]/10 dark:border-[#982598]/20 flex flex-col">
              <div className="p-3 border-b border-[#982598]/10 dark:border-[#982598]/20 bg-white dark:bg-[#15173D]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-gray-700 dark:text-[#F1E9E9]">{selectedEmployee.fullName}</p>
                    <p className="text-xs text-gray-500 dark:text-[#E491C9]/60">{selectedEmployee.email}</p>
                  </div>
                  <button onClick={clearSelection} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0e0f29] rounded ml-2 flex-shrink-0" title="Close employee view">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-[#E491C9]/50 mt-1">{employeeSessions.length} session(s)</p>
              </div>
              <div className="flex-1 overflow-y-auto">
                {employeeSessions.length === 0 ? (
                  <div className="text-center py-8 text-[#E491C9]/60 text-sm">No chat sessions</div>
                ) : (
                  employeeSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => handleSessionClick(session)}
                      className={`w-full text-left px-3 py-2.5 hover:bg-white dark:hover:bg-[#0e0f29] transition-colors border-b border-[#982598]/10 dark:border-[#982598]/20 ${
                        selectedSession?.id === session.id ? 'bg-white dark:bg-[#0e0f29] shadow-sm' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-800 dark:text-[#F1E9E9] truncate flex-1">
                          {session.title || 'New Chat'}
                        </p>
                        {session.isActive ? (
                          <span className="text-xs bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full ml-2">Active</span>
                        ) : (
                          <span className="text-xs bg-gray-100 dark:bg-[#0e0f29] text-gray-500 dark:text-[#E491C9]/60 px-2 py-0.5 rounded-full ml-2">Ended</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-[#E491C9]/60 mt-0.5">{formatDate(session.createdAt)}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col bg-white dark:bg-[#15173D]">
              {!selectedSession ? (
                <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-[#E491C9]/50">
                  <div className="text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-[#E491C9]/30" />
                    <p className="text-sm">Select a session to view messages</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Session header */}
                  <div className="px-4 py-3 border-b border-[#982598]/10 dark:border-[#982598]/20 flex items-center justify-between bg-white dark:bg-[#15173D]">
                    <div>
                      <p className="font-medium text-sm text-gray-800 dark:text-[#F1E9E9]">
                        {selectedSession.title || 'Chat Session'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-[#E491C9]/60">
                        {selectedSession.isActive ? 'Active' : `Ended by ${selectedSession.endedBy || 'unknown'}`}
                        {' · '}{formatDate(selectedSession.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedSession.isActive && (
                        <button
                          onClick={() => setShowStopConfirm(selectedSession.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <StopCircle className="w-4 h-4" />
                          Stop Chat
                        </button>
                      )}
                      <button
                        onClick={() => { setSelectedSession(null); setMessages([]); }}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#0e0f29] rounded-lg transition-colors"
                        title="Close chat"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 dark:bg-[#15173D]">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                            msg.senderType === 'user'
                              ? 'bg-[#982598] text-[#F1E9E9] rounded-br-md'
                              : msg.senderType === 'admin'
                              ? 'bg-[#E491C9]/20 dark:bg-[#E491C9]/10 text-gray-800 dark:text-[#F1E9E9] rounded-bl-md'
                              : 'bg-white dark:bg-[#0e0f29] text-gray-800 dark:text-[#F1E9E9] rounded-bl-md border border-[#982598]/10 dark:border-[#982598]/20'
                          }`}
                        >
                          {msg.senderType === 'admin' && <p className="text-xs font-medium text-[#982598] dark:text-[#E491C9] mb-0.5">Admin</p>}
                          {msg.senderType === 'bot' && <p className="text-xs font-medium text-gray-500 dark:text-[#E491C9]/60 mb-0.5">Bot</p>}
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.senderType === 'user' ? 'text-[#E491C9]/70' : 'text-gray-400 dark:text-[#E491C9]/50'}`}>
                            {formatDate(msg.createdAt) || 'Just now'}
                          </p>
                        </div>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <div className="text-center py-10 text-gray-400 dark:text-[#E491C9]/50 text-sm">No messages in this session</div>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {/* Stop Chat Confirmation */}
      {showStopConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowStopConfirm(null)} />
          <div className="relative bg-white dark:bg-[#15173D] rounded-2xl shadow-xl w-full max-w-md p-6 z-50 border border-[#982598]/20">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-[#F1E9E9] mb-2">Stop Chat</h3>
            <p className="text-sm text-gray-600 dark:text-[#E491C9]/80 mb-6">
              Stop this chat? Employee won't be able to chat further.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowStopConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-[#982598]/20 dark:border-[#982598]/30 text-gray-700 dark:text-[#E491C9] rounded-lg hover:bg-gray-50 dark:hover:bg-[#0e0f29] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStopChat(showStopConfirm)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg transition-colors"
              >
                Stop Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeMonitor;