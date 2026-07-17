// src/app/admin/login/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { FaLock, FaEnvelope, FaEye, FaEyeSlash, FaUserShield } from 'react-icons/fa';

function AuthTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Terminal Mode
  const [mode, setMode] = useState<'login' | 'setup-password' | 'setup-2fa' | 'recovery-init' | 'recovery-verify'>('login');
  const [loginStep, setLoginStep] = useState<'credentials' | '2fa'>('credentials');
  
  // Shared State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [qrCode, setQrCode] = useState('');
  
  // UI State
  const [error, setError] = useState(searchParams.get('error') === 'AccessDenied' ? 'Access denied. You are not authorized.' : '');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // --- LOGIN & BACKDOOR FLOW ---
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await signIn('credentials', {
        email,
        password: mode === 'recovery-verify' ? 'bypass' : password,
        token: (loginStep === '2fa' || mode === 'recovery-verify') ? token : undefined,
        isRecovery: mode === 'recovery-verify' ? 'true' : 'false',
        redirect: false,
      });

      if (res?.error) {
        if (res.error === '2FA_REQUIRED') {
          setLoginStep('2fa');
        } else {
          setError(res.error);
        }
      } else if (res?.ok) {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- SETUP FLOW ---
  const handleSetupInit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setQrCode(data.qrCode);
        setMode('setup-2fa');
      } else {
        setError(data.error || 'Failed to initialize account');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally { setLoading(false); }
  };

  const handleSetupVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      const res = await fetch('/api/admin/setup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: token }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg('Account secured successfully! You can now log in.');
        setMode('login'); setLoginStep('credentials'); setToken('');
      } else {
        setError(data.error || 'Invalid code. Please try again.');
      }
    } catch (err) { setError('Verification failed.'); } finally { setLoading(false); }
  };

  // --- RECOVERY API TRIGGER ---
  const handleRecoveryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      await fetch('/api/admin/recovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSuccessMsg('If authorized, a recovery code has been sent to your email.');
      setMode('recovery-verify');
    } catch (err) {
      setError('Failed to trigger recovery.');
    } finally { setLoading(false); }
  };

  // --- RENDERERS ---
  const renderLogin = () => (
    <>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">
        {loginStep === 'credentials' ? 'Sign in to manage JaSiriCup operations' : 'Enter your 2FA code to continue'}
      </p>

      {successMsg && <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm font-bold rounded-xl text-center">{successMsg}</div>}

      {loginStep === 'credentials' ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><FaEnvelope /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400"><FaLock /></div>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-11 pr-12 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors outline-none">
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl mt-4 shadow-md transition-colors">{loading ? 'Authenticating...' : 'Sign In'}</button>
          
          {/* Concealed Web Master Recovery Backdoor */}
          <div className="flex justify-end mt-3">
            <button 
              type="button" 
              onClick={() => { setMode('recovery-init'); setError(''); setSuccessMsg(''); }} 
              className="text-gray-100 dark:text-gray-800 hover:text-purple-400 dark:hover:text-purple-500 transition-colors focus:outline-none"
              title="System Recovery"
            >
              <FaUserShield size={12} />
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 text-center">Authentication Code</label>
            <input type="text" value={token} onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} required autoFocus className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl text-center text-2xl tracking-[0.5em] font-mono outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
          </div>
          <div className="flex flex-col gap-3">
            <button type="submit" disabled={loading || token.length !== 6} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors">{loading ? 'Verifying...' : 'Verify Code'}</button>
            <button type="button" onClick={() => { setLoginStep('credentials'); setToken(''); }} className="w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-semibold py-2 transition-colors">Back</button>
          </div>
        </form>
      )}
    </>
  );

  const renderSetupPassword = () => (
    <>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">Enter your authorized email to set up your password.</p>
      <form onSubmit={handleSetupInit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Authorized Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">New Password</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors outline-none">
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Confirm Password</label>
          <div className="relative">
            <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors outline-none">
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl mt-4 shadow-md transition-colors">{loading ? 'Processing...' : 'Continue to 2FA Setup'}</button>
        <div className="text-center mt-6"><button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Cancel Setup</button></div>
      </form>
    </>
  );

  const renderSetup2FA = () => (
    <>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">Secure your account with 2FA to complete setup.</p>
      <form onSubmit={handleSetupVerify} className="space-y-6">
        <div className="flex flex-col items-center">
          <p className="font-bold text-sm text-gray-800 dark:text-gray-200 text-center mb-4">1. Scan this QR Code with Google Authenticator or Authy</p>
          <div className="bg-white p-3 rounded-xl shadow-sm mb-6"><Image src={qrCode} alt="2FA" width={180} height={180} /></div>
          <p className="font-bold text-sm text-gray-800 dark:text-gray-200 text-center mb-4">2. Enter the 6-digit code to verify</p>
          <input type="text" value={token} onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} required autoFocus className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl text-center text-2xl tracking-[0.5em] font-mono outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
        </div>
        <button type="submit" disabled={loading || token.length !== 6} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors">{loading ? 'Verifying...' : 'Verify & Lock Account'}</button>
      </form>
    </>
  );

  const renderRecoveryInit = () => (
    <>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">Enter the Admin Email</p>
      <form onSubmit={handleRecoveryRequest} className="space-y-4">
        <div><label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-colors" /></div>
        <button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl mt-4 shadow-md transition-colors">{loading ? 'Processing...' : 'Send Recovery Code'}</button>
        <div className="text-center mt-6"><button type="button" onClick={() => { setMode('login'); setError(''); }} className="text-sm font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">Cancel</button></div>
      </form>
    </>
  );

  const renderRecoveryVerify = () => (
    <>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">Enter the 6-digit recovery code sent to your email.</p>
      {successMsg && <div className="mb-6 p-4 bg-green-50 text-green-700 text-sm font-bold rounded-xl text-center">{successMsg}</div>}
      <form onSubmit={handleLoginSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2 text-center">Recovery Code</label>
          <input type="text" value={token} onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} required autoFocus className="w-full py-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl text-center text-2xl tracking-[0.5em] font-mono outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
        </div>
        <div className="flex flex-col gap-3">
          <button type="submit" disabled={loading || token.length !== 6} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors">{loading ? 'Bypassing...' : 'Bypass Login'}</button>
          <button type="button" onClick={() => { setMode('login'); setToken(''); }} className="w-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-semibold py-2 transition-colors">Back to standard login</button>
        </div>
      </form>
    </>
  );

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-10 transition-colors">
      <div className="flex justify-center mb-8">
        <Image src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/logo_jrc0mv.png" alt="JasiriCup" width={140} height={48} priority className="block dark:hidden h-auto w-auto" />
        <Image src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/whitelogo_bpym4s.png" alt="JasiriCup Dark" width={140} height={48} priority className="hidden dark:block h-auto w-auto" />
      </div>

      <h1 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white mb-2">Admin Portal</h1>
      {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl text-center">{error}</div>}

      {mode === 'login' && renderLogin()}
      {mode === 'setup-password' && renderSetupPassword()}
      {mode === 'setup-2fa' && renderSetup2FA()}
      {mode === 'recovery-init' && renderRecoveryInit()}
      {mode === 'recovery-verify' && renderRecoveryVerify()}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center px-4">
        <Suspense fallback={<div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 h-96 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>}>
          <AuthTerminal />
        </Suspense>
      </div>
    </div>
  );
}