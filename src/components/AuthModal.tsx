import React, { useState } from 'react';
import { signUpUser, signInUser } from '../lib/supabase';
import { UserProfile } from '../types';
import { PAKISTAN_CITIES } from '../data/pakistanLocations';
import { X, Lock, Mail, User, MapPin, Phone, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  defaultCity?: string;
  defaultArea?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultCity = 'Lahore',
  defaultArea = 'Johar Town',
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState(defaultCity);
  const [area, setArea] = useState(defaultArea);
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    if (isLogin) {
      const { user, error } = await signInUser(email.trim(), password);
      setLoading(false);
      if (error) {
        if (error.toLowerCase().includes('invalid login credentials')) {
          setErrorMsg('Incorrect email or password. Please try again.');
        } else {
          setErrorMsg(error);
        }
      } else if (user) {
        setSuccessMsg('Welcome back! Signed in successfully.');
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 500);
      }
    } else {
      // Sign Up
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters.');
        setLoading(false);
        return;
      }

      const { user, error } = await signUpUser({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
        city,
        area,
        phone: phone.trim() || undefined,
      });

      setLoading(false);
      if (error) {
        if (error.toLowerCase().includes('user already registered')) {
          setErrorMsg('An account with this email already exists. Please login instead.');
        } else {
          setErrorMsg(error);
        }
      } else if (user) {
        setSuccessMsg('Account created successfully!');
        setTimeout(() => {
          onSuccess(user);
          onClose();
        }, 500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" id="auth-modal-backdrop">
      <div className="bg-white w-full max-w-md rounded-2xl border border-stone-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#0F3D2A] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 flex items-center justify-center font-serif font-black text-xl">
              ش
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold leading-tight">
                {isLogin ? 'Citizen Login' : 'Create Citizen Account'}
              </h2>
              <p className="text-xs text-emerald-200 urdu-text">
                {isLogin ? 'شہری لاگ ان' : 'نیا اکاؤنٹ بنائیں'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-900 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-200 bg-stone-50">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition ${
              isLogin
                ? 'border-[#0F3D2A] text-[#0F3D2A] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
            id="tab-auth-login"
          >
            Login (لاگ ان)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-sm font-bold text-center border-b-2 transition ${
              !isLogin
                ? 'border-[#0F3D2A] text-[#0F3D2A] bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
            id="tab-auth-signup"
          >
            Sign Up (رجسٹریشن)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Full Name for Signup */}
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-stone-900 mb-1">
                Full Name (پورا نام) *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Muhammad Tariq"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F3D2A]"
                  id="input-auth-name"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-stone-900 mb-1">
              Email Address (ای میل) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="youremail@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F3D2A]"
                id="input-auth-email"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-stone-900 mb-1">
              Password (پاس ورڈ) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0F3D2A]"
                id="input-auth-password"
              />
            </div>
          </div>

          {/* City & Area for Signup */}
          {!isLogin && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1">
                    City (شہر) *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs font-semibold bg-white"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-900 mb-1">
                    Area (علاقہ) *
                  </label>
                  <input
                    type="text"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="e.g. Johar Town"
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-900 mb-1">
                  Phone Number (فون نمبر) <span className="text-stone-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+92 300 1234567"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-hidden"
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#0F3D2A] text-white font-bold text-sm hover:bg-emerald-900 transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
              id="btn-auth-submit"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span>{isLogin ? 'Sign In to ShehriAwaz' : 'Complete Citizen Registration'}</span>
            </button>
          </div>

        </form>

        {/* Footer */}
        <div className="bg-stone-50 px-6 py-3 border-t border-stone-200 text-center text-xs text-stone-500">
          ShehriAwaz respects citizen privacy and protects submitted reports.
        </div>

      </div>
    </div>
  );
};
