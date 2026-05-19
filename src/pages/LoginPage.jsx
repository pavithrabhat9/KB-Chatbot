import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2, ShieldCheck, UserPlus, UserCircle, Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../context/authStore';

const LoginPage = () => {
  const [tab, setTab] = useState('admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { loginAsAdmin, loginWithEmail, signupWithEmail, loginWithGoogle } = useAuthStore();

  const passwordRequirements = [
    { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
    { label: 'At least 1 uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
    { label: 'At least 1 number', test: (pw) => /\d/.test(pw) },
    { label: 'At least 1 special character', test: (pw) => /[!@#$%^&*(),.?":{}|<>_\-]/.test(pw) },
  ];

  const getPasswordErrors = (pw) => {
    const errors = [];
    passwordRequirements.forEach((req) => {
      if (!req.test(pw)) errors.push(req.label);
    });
    return errors;
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    const result = await loginAsAdmin(trimmedEmail, trimmedPassword);
    setLoading(false);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.error);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    const result = await loginWithEmail(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/employee');
    } else {
      setError(result.error);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters');
      return;
    }

    const pwErrors = getPasswordErrors(password);
    if (pwErrors.length > 0) {
      setError('Password requirements:\n• ' + pwErrors.join('\n• '));
      return;
    }

    setLoading(true);
    const result = await signupWithEmail(email, password, fullName);
    setLoading(false);
    if (result.success) {
      navigate('/employee');
    } else {
      setError(result.error);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    const result = await loginWithGoogle();
    setLoading(false);
    if (result.success) {
      navigate('/employee');
    } else {
      setError(result.error);
    }
  };

  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/login-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-[#15173D]/70 backdrop-blur-sm"></div>
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#15173D] border border-[#982598]/30 rounded-2xl mb-4 shadow-lg shadow-[#982598]/10">
            <ShieldCheck className="w-8 h-8 text-[#E491C9]" />
          </div>
          <h1 className="text-3xl font-bold text-[#F1E9E9] tracking-tight">TRIKON</h1>
          <p className="text-[#E491C9] mt-2 text-sm">Enterprise Knowledge Assistant</p>
        </div>

        <div className="bg-[#15173D] border border-[#982598]/20 rounded-2xl shadow-xl shadow-black/20 p-6">
          {/* Tab Navigation */}
          <div className="flex gap-1 mb-6 bg-[#0e0f29] rounded-lg p-1">
            <button
              onClick={() => { setTab('admin'); setError(''); }}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                tab === 'admin' ? 'bg-[#982598] text-[#F1E9E9] shadow-md' : 'text-[#E491C9]/60 hover:text-[#F1E9E9]'
              }`}
            >
              Admin
            </button>
            <button
              onClick={() => { setTab('signup'); setError(''); setShowPassword(false); }}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                tab === 'signup' ? 'bg-[#982598] text-[#F1E9E9] shadow-md' : 'text-[#E491C9]/60 hover:text-[#F1E9E9]'
              }`}
            >
              Employee
            </button>
          </div>

          {/* Admin Login */}
          {tab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#E491C9] mb-1.5 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E491C9]/60" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0e0f29] border border-[#982598]/30 rounded-lg focus:ring-2 focus:ring-[#982598] focus:border-transparent outline-none text-[#F1E9E9] placeholder-[#E491C9]/40 text-sm transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#E491C9] mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E491C9]/60" />
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0e0f29] border border-[#982598]/30 rounded-lg focus:ring-2 focus:ring-[#982598] focus:border-transparent outline-none text-[#F1E9E9] placeholder-[#E491C9]/40 text-sm transition-all"
                  />
                </div>
              </div>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-lg text-sm whitespace-pre-wrap">{error}</div>
              )}
              <button
                type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-[#982598] to-[#E491C9] hover:from-[#982598] hover:to-[#d07db8] disabled:opacity-50 text-[#F1E9E9] font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#982598]/20 hover:shadow-[#982598]/30"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <><LogIn className="w-4 h-4" /> Sign In</>}
              </button>
            </form>
          )}

          {/* Sign Up */}
          {tab === 'signup' && (
            <>
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#E491C9] mb-1.5 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E491C9]/60" />
                    <input
                      type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter full name"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0e0f29] border border-[#982598]/30 rounded-lg focus:ring-2 focus:ring-[#982598] focus:border-transparent outline-none text-[#F1E9E9] placeholder-[#E491C9]/40 text-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#E491C9] mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E491C9]/60" />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#0e0f29] border border-[#982598]/30 rounded-lg focus:ring-2 focus:ring-[#982598] focus:border-transparent outline-none text-[#F1E9E9] placeholder-[#E491C9]/40 text-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#E491C9] mb-1.5 uppercase tracking-wider">
                    Password
                    <span className="font-normal lowercase ml-1 text-[10px]">(8+ chars, uppercase, number, special)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#E491C9]/60" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-10 pr-10 py-2.5 bg-[#0e0f29] border border-[#982598]/30 rounded-lg focus:ring-2 focus:ring-[#982598] focus:border-transparent outline-none text-[#F1E9E9] placeholder-[#E491C9]/40 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E491C9]/60 hover:text-[#E491C9] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Password requirements checklist */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {passwordRequirements.map((req, idx) => {
                        const passed = req.test(password);
                        return (
                          <div key={idx} className="flex items-center gap-1.5 text-xs">
                            <span className={`${passed ? 'text-green-400' : 'text-gray-500'}`}>
                              {passed ? '✓' : '○'}
                            </span>
                            <span className={`${passed ? 'text-green-400' : 'text-[#E491C9]/60'}`}>
                              {req.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-lg text-sm whitespace-pre-wrap">{error}</div>
                )}
                <button
                  type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-[#982598] to-[#E491C9] hover:from-[#982598] hover:to-[#d07db8] disabled:opacity-50 text-[#F1E9E9] font-medium py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#982598]/20"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : <><UserPlus className="w-4 h-4" /> Create Account</>}
                </button>
              </form>
              <div className="mt-4 pt-4 border-t border-[#982598]/30">
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 disabled:opacity-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg transition-all text-sm shadow-md"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-[#E491C9]/60 text-xs mt-6">
          Secure Enterprise Chat Platform
        </p>
      </div>
    </div>
  );
};

export default LoginPage;