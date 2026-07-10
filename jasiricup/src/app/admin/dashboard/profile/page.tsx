'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { User, UploadCloud, ShieldCheck } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function ProfilePage() {
  const { update } = useSession();

  // Personal Info State
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [infoStatus, setInfoStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);

  // Image Upload State
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passStatus, setPassStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // 2FA State
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [twoFactorStep, setTwoFactorStep] = useState<'idle' | 'scanning' | 'success'>('idle');
  const [twoFactorMessage, setTwoFactorMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/profile');
      const data = await res.json();
      if (data.success && data.user) {
        setName(data.user.name || '');
        setImageUrl(data.user.image || '');
      }
    } catch (err) {
      console.error("Failed to fetch profile info");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    setInfoStatus(null);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'profile');

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      
      if (data.success && data.url) {
        setImageUrl(data.url);
        setInfoStatus({ type: 'success', msg: 'Image uploaded! Click "Update Info" below to save your profile.' });
      } else {
        setInfoStatus({ type: 'error', msg: data.error || 'Upload failed' });
      }
    } catch (err) {
      setInfoStatus({ type: 'error', msg: 'An error occurred during upload.' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoLoading(true);
    setInfoStatus(null);
    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, image: imageUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setInfoStatus({ type: 'success', msg: 'Profile updated successfully!' });
        await update({ name, image: imageUrl });
      } else {
        setInfoStatus({ type: 'error', msg: data.error || 'Failed to update profile' });
      }
    } catch (err) {
      setInfoStatus({ type: 'error', msg: 'An unexpected error occurred.' });
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPassStatus({ type: 'error', msg: 'New passwords do not match' });
      return;
    }
    setPassLoading(true);
    setPassStatus(null);
    try {
      const res = await fetch('/api/admin/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setPassStatus({ type: 'success', msg: 'Password updated successfully!' });
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        setPassStatus({ type: 'error', msg: data.error || 'Failed to update password' });
      }
    } catch (err) {
      setPassStatus({ type: 'error', msg: 'An unexpected error occurred.' });
    } finally {
      setPassLoading(false);
    }
  };

  // --- 2FA Handlers ---
  const generate2FA = async () => {
    try {
      const res = await fetch('/api/admin/2fa/generate', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setTwoFactorStep('scanning');
      }
    } catch (error) {
      setTwoFactorMessage('Failed to generate QR code');
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
        setTwoFactorStep('success');
        setTwoFactorMessage('2FA successfully enabled! You will need your authenticator app for future logins.');
      } else {
        setTwoFactorMessage(data.error || 'Invalid code. Try again.');
      }
    } catch (error) {
      setTwoFactorMessage('Verification failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
      
      {/* PERSONAL INFO SECTION */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8 transition-colors">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Personal Information</h2>
        
        {infoStatus && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${infoStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
            {infoStatus.msg}
          </div>
        )}
        <form onSubmit={handleInfoSubmit} className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Display Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-colors" placeholder="e.g. Mercy" />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Profile Image</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="url" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                  className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-colors" 
                  placeholder="https://..." 
                />
                
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()} 
                  disabled={uploadingImage}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap border border-gray-300 dark:border-gray-700 shadow-sm"
                >
                  <UploadCloud size={18} />
                  {uploadingImage ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">Paste a URL, or click &quot;Upload File&quot; to select an image from your device.</p>
            </div>
            <button type="submit" disabled={infoLoading || uploadingImage} className="bg-purple-600 text-white font-bold py-3 px-6 rounded-xl mt-2 shadow-md hover:bg-purple-700 disabled:opacity-50 transition-colors">
              {infoLoading ? 'Saving...' : 'Update Info'}
            </button>
          </div>
          
          <div className="shrink-0 flex flex-col items-center justify-center pt-4 md:pt-0 md:pr-4">
            <div className="relative w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-gray-900 shadow-lg overflow-hidden flex items-center justify-center shrink-0">
              {uploadingImage ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : null}
              
              {imageUrl ? (
                <img src={imageUrl} alt="Profile Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              ) : (
                <User size={48} className="text-gray-400" />
              )}
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase mt-4 tracking-wider">Preview</span>
          </div>
        </form>
      </div>

      {/* PASSWORD SECTION */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8 transition-colors">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Change Password</h2>
        
        {passStatus && (
          <div className={`mb-6 p-4 rounded-xl text-sm font-bold ${passStatus.type === 'success' ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
            {passStatus.msg}
          </div>
        )}
        <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={8} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 transition-colors" />
          </div>
          
          <button type="submit" disabled={passLoading} className="bg-gray-900 dark:bg-gray-700 text-white font-bold py-3 px-6 rounded-xl mt-4 shadow-md hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors">
            {passLoading ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* TWO-FACTOR AUTHENTICATION SECTION */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="text-purple-600 dark:text-purple-400" size={24} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication (2FA)</h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl">
          Protect your admin account by requiring a 6-digit code from Google Authenticator or Authy when logging in with an email and password.
        </p>

        {twoFactorStep === 'idle' && (
          <button
            onClick={generate2FA}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Setup 2FA
          </button>
        )}

        {twoFactorStep === 'scanning' && (
          <div className="flex flex-col items-center border-t border-gray-100 dark:border-gray-800 pt-8 mt-4">
            <p className="font-bold text-gray-900 dark:text-white text-center mb-4">1. Scan this QR Code with your Authenticator App</p>
            <div className="bg-white p-4 rounded-xl shadow-sm mb-8 border border-gray-200">
              {qrCode && <Image src={qrCode} alt="2FA QR Code" width={200} height={200} />}
            </div>
            
            <p className="font-bold text-gray-900 dark:text-white text-center mb-4">2. Enter the 6-digit code to verify</p>
            <form onSubmit={verify2FA} className="w-full max-w-xs flex flex-col gap-4">
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                className="w-full py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-center text-2xl tracking-widest font-mono text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                placeholder="000000"
              />
              <button
                type="submit"
                disabled={token.length !== 6}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
              >
                Verify & Enable
              </button>
            </form>
          </div>
        )}

        {twoFactorStep === 'success' && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-xl text-center font-medium mt-4">
            {twoFactorMessage}
          </div>
        )}

        {twoFactorMessage && twoFactorStep !== 'success' && (
          <div className="text-red-500 text-sm mt-4 font-medium">{twoFactorMessage}</div>
        )}
      </div>

    </div>
  );
}