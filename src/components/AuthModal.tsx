import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { X, Lock, Mail, User, ShieldCheck, HelpCircle, ArrowRight, Sparkles, Phone } from 'lucide-react';
import { User as UserType } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (user: UserType) => void;
}

export default function AuthModal({ onClose, onLogin }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  
  // Form states
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Statuses
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    if (!mobile || !password || (isRegister && !name)) {
      setErrorMsg('Please populate all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint = isRegister ? '/api/users/register' : '/api/users/login';
      const body = isRegister 
        ? { name, mobile, email: email || undefined, password } 
        : { mobile, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      // Store secure JWT token in localStorage
      localStorage.setItem('aurum_token', data.token);

      setSuccessMsg(isRegister ? 'Registration successful! Signing in...' : 'Sign in approved!');
      setTimeout(() => {
        onLogin(data.user);
        onClose();
      }, 1000);

    } catch (err: any) {
      setErrorMsg(err.message || 'Server connection issue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prefillCustomerCredentials = () => {
    setIsRegister(false);
    setMobile('8888888888');
    setPassword('member123');
    setErrorMsg('');
    setSuccessMsg('Customer mobile loaded: 8888888888. Click Sign In!');
  };

  const prefillAdminCredentials = () => {
    setIsRegister(false);
    setMobile('9999999999');
    setPassword('admin123');
    setErrorMsg('');
    setSuccessMsg('Admin mobile loaded: 9999999999. Click Sign In!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative glass-dark w-full max-w-md rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 text-white admin-glow"
        id="auth-modal-container"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full border border-gold/15 hover:border-gold hover:bg-gold/10 text-gold transition-colors"
          id="close-auth-modal"
        >
          <X size={16} />
        </button>

        {/* Brand Logo Header */}
        <div className="text-center mb-8">
          <span className="font-serif text-2xl font-extrabold tracking-[0.2em] text-gold bg-gradient-to-r from-gold-light via-gold to-gold-dark bg-clip-text text-transparent">
            AURUM
          </span>
          <p className="text-[10px] tracking-[0.3em] text-gold/60 uppercase mt-0.5">Atelier Member Access</p>
        </div>

        {/* Tabs for Login / Register */}
        <div className="flex border-b border-gold/10 mb-6 text-xs font-semibold tracking-wider uppercase">
          <button
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 pb-3 text-center transition-all ${
              !isRegister ? 'text-gold border-b-2 border-gold font-bold' : 'text-gray-400 hover:text-white'
            }`}
            id="auth-tab-signin"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`flex-1 pb-3 text-center transition-all ${
              isRegister ? 'text-gold border-b-2 border-gold font-bold' : 'text-gray-400 hover:text-white'
            }`}
            id="auth-tab-register"
          >
            Create Account
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <p className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs p-3 rounded-lg mb-4 text-center font-sans">
            ✘ {errorMsg}
          </p>
        )}
        {successMsg && (
          <p className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs p-3 rounded-lg mb-4 text-center font-sans flex items-center justify-center gap-1.5">
            <Sparkles size={12} className="animate-pulse" />
            {successMsg}
          </p>
        )}

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4" id="member-auth-form">
          {isRegister && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Your Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
                <input
                  type="text"
                  placeholder="e.g. Charlotte Rose"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-xs rounded-xl pl-10 pr-4 py-3 text-white transition-colors"
                  required={isRegister}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Mobile Number</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
              <input
                type="tel"
                placeholder="e.g. 8888888888"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-xs rounded-xl pl-10 pr-4 py-3 text-white transition-colors"
                required
              />
            </div>
          </div>

          {isRegister && (
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Email Address (Optional)</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
                <input
                  type="email"
                  placeholder="e.g. member@aurum.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-xs rounded-xl pl-10 pr-4 py-3 text-white transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Secure Password</label>
            <div className="relative">
              <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gold/60" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-gold focus:outline-none text-xs rounded-xl pl-10 pr-4 py-3 text-white transition-colors"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-gold-dark via-gold to-gold-bright disabled:opacity-50 text-dark-rich font-bold tracking-widest uppercase text-xs py-3.5 rounded-xl transition-all shadow-lg hover:shadow-gold/25 mt-2 flex items-center justify-center gap-1.5"
            id="auth-submit-btn"
          >
            <span>{isRegister ? 'Register & Sign In' : 'Sign In'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Interactive Bypass helpers */}
        <div className="mt-8 border-t border-gold/10 pt-5 text-center space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-amber-500/5 border border-amber-500/20 rounded-2xl px-3 py-1.5 text-amber-500 text-[10px] font-mono select-none mx-auto">
            <ShieldCheck size={13} />
            <span>QUICK ACCREDITED LOGIN BYPASS</span>
          </div>
          <p className="text-[9px] text-gray-400 font-sans leading-relaxed">
            Quickly load sandbox coordinates using sandbox mobile numbers to test buying flow or admin dashboards.
            <br />
            <span className="text-gold/80 font-mono text-[9px]">Admin: 9999999999 / admin123 | Customer: 8888888888 / member123</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
            <button
              type="button"
              onClick={prefillCustomerCredentials}
              className="text-[10px] font-bold tracking-widest uppercase text-gold hover:text-white bg-gold/10 hover:bg-gold/20 px-4 py-2 rounded-xl border border-gold/20 hover:border-gold transition-all cursor-pointer"
              id="prefill-customer-btn"
            >
              Test Customer Login
            </button>
            <button
              type="button"
              onClick={prefillAdminCredentials}
              className="text-[10px] font-bold tracking-widest uppercase text-gold hover:text-white bg-gold/10 hover:bg-gold/20 px-4 py-2 rounded-xl border border-gold/20 hover:border-gold transition-all cursor-pointer"
              id="prefill-admin-btn"
            >
              Test Admin Login
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
