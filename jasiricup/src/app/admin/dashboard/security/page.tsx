'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function SecuritySettings() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [message, setMessage] = useState('');

  const generate2FA = async () => {
    try {
      const res = await fetch('/api/admin/2fa/generate', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setStep('scanning');
      }
    } catch (error) {
      setMessage('Failed to generate QR code');
    }
  };

  const verify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, secret }),
      });
      const data = await res.json();

      if (data.success) {
        setStep('success');
        setMessage('2FA successfully enabled! You will need your authenticator app for future logins.');
      } else {
        setMessage(data.error || 'Invalid code. Try again.');
      }
    } catch (error) {
      setMessage('Verification failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Security Settings</h1>
      
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
        <h2 className="text-xl font-bold mb-4">Two-Factor Authentication (2FA)</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Protect your admin account by requiring a 6-digit code from Google Authenticator or Authy when logging in with an email and password.
        </p>

        {step === 'idle' && (
          <button
            onClick={generate2FA}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Setup 2FA
          </button>
        )}

        {step === 'scanning' && (
          <div className="flex flex-col items-center border-t border-gray-100 dark:border-gray-800 pt-6 mt-2">
            <p className="font-bold text-center mb-4">1. Scan this QR Code with your Authenticator App</p>
            <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
              <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />
            </div>
            
            <p className="font-bold text-center mb-4">2. Enter the 6-digit code to verify</p>
            <form onSubmit={verify2FA} className="w-full max-w-xs flex flex-col gap-4">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                className="w-full py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-center text-xl tracking-widest font-mono outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="000000"
              />
              <button
                type="submit"
                disabled={token.length !== 6}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
              >
                Verify & Enable
              </button>
            </form>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-xl text-center font-medium mt-4">
            {message}
          </div>
        )}

        {message && step !== 'success' && (
          <div className="text-red-500 text-sm text-center mt-4 font-medium">{message}</div>
        )}
      </div>
    </div>
  );
}