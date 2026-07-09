// src/app/admin/setup/page.tsx
'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function SetupFormComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [step, setStep] = useState<'password' | '2fa' | 'success'>('password');
  
  // Password State
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // 2FA State
  const [qrCode, setQrCode] = useState('');
  const [authCode, setAuthCode] = useState('');
  
  // UI State
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!email || !token) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
        <p className="text-red-500 font-bold">Invalid setup link. Please contact your administrator.</p>
      </div>
    );
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password }),
      });

      const data = await res.json();

      if (data.success) {
        setQrCode(data.qrCode);
        setStep('2fa');
      } else {
        setError(data.error || 'Failed to set password');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/setup/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, code: authCode }),
      });

      const data = await res.json();

      if (data.success) {
        setStep('success');
        setTimeout(() => {
          router.push('/admin/login');
        }, 3000);
      } else {
        setError(data.error || 'Invalid code. Please try again.');
      }
    } catch (err) {
      setError('Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 sm:p-10 transition-colors">
      <div className="flex justify-center mb-8">
        <Image
          src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/logo_jrc0mv.png"
          alt="JasiriCup Logo"
          width={140}
          height={48}
          priority
          className="block dark:hidden h-auto"
        />
        <Image
          src="https://res.cloudinary.com/dsvexizbx/image/upload/v1754083461/whitelogo_bpym4s.png"
          alt="JasiriCup Logo Dark"
          width={140}
          height={48}
          priority
          className="hidden dark:block h-auto"
        />
      </div>

      <h1 className="text-2xl font-extrabold text-center text-gray-900 dark:text-white mb-2">
        Account Setup
      </h1>
      <p className="text-center text-gray-500 dark:text-gray-400 text-sm mb-8">
        {step === 'password' && `Create a secure password for ${email}`}
        {step === '2fa' && 'Secure your account with 2FA'}
      </p>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium rounded-xl text-center">
          {error}
        </div>
      )}

      {step === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
                placeholder="At least 8 characters"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition-colors"
                placeholder="Type it again"
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-600 transition-colors outline-none"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 mt-4 shadow-md"
          >
            {loading ? 'Processing...' : 'Next Step'}
          </button>
        </form>
      )}

      {step === '2fa' && (
        <form onSubmit={handle2FASubmit} className="space-y-6">
          <div className="flex flex-col items-center">
            <p className="font-bold text-sm text-gray-800 dark:text-gray-200 text-center mb-4">
              1. Scan this QR Code with Google Authenticator or Authy
            </p>
            <div className="bg-white p-3 rounded-xl shadow-sm mb-6">
              <Image src={qrCode} alt="2FA QR Code" width={180} height={180} />
            </div>
            
            <p className="font-bold text-sm text-gray-800 dark:text-gray-200 text-center mb-4">
              2. Enter the 6-digit code to verify
            </p>
            <input
              type="text"
              value={authCode}
              onChange={(e) => setAuthCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
              required
              autoFocus
              className="w-full py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-center text-2xl tracking-[0.5em] font-mono transition-colors"
              placeholder="000000"
            />
          </div>

          <button
            type="submit"
            disabled={loading || authCode.length !== 6}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50 shadow-md"
          >
            {loading ? 'Verifying...' : 'Verify & Complete Setup'}
          </button>
        </form>
      )}

      {step === 'success' && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-6 rounded-xl text-center font-bold">
          Setup Complete! Redirecting you to the login page...
        </div>
      )}
    </div>
  );
}

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex justify-center px-4">
        <Suspense fallback={
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 flex justify-center border border-gray-100 dark:border-gray-800">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        }>
          <SetupFormComponent />
        </Suspense>
      </div>
    </div>
  );
}