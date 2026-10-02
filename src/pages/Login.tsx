import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { User, Lock, Building2, BookOpen, WalletCards, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/store';
import { Portal } from '@/types';
import { Logo } from '@/components/Logo';
import { useSEO } from '@/lib/seo';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [portal, setPortal] = useState<Portal>('school');
  const [, navigate] = useLocation();
  const { login, t } = useApp();

  const isUrdu = portal === 'madrasa';

  useSEO({
    title: isUrdu ? 'ایڈمن لاگ اِن | جامعہ پورٹل' : 'Admin Login | Jamia Portal',
    description: isUrdu
      ? 'جامعہ پورٹل کے ایڈمن پینل میں محفوظ لاگ اِن کریں۔'
      : 'Secure admin login for Jamia Portal management dashboard.',
    path: '/login',
    locale: isUrdu ? 'ur_PK' : 'en_PK',
    noindex: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await login(username, password, portal)) {
      toast.success(isUrdu ? 'کامیابی سے لاگ ان ہو گئے' : 'Successfully logged in');
      navigate(portal === 'school' ? '/school-portal/dashboard' : portal === 'madrasa' ? '/madrasa-portal/dashboard' : portal === 'fees' ? '/fees-portal/dashboard' : '/portal-settings');
    } else {
      toast.error(isUrdu ? 'غلط یوزرنیم یا پاسورڈ' : 'Invalid username or password');
    }
  };

  return (
    <div className={`min-h-[100dvh] relative flex items-center justify-center overflow-hidden ${isUrdu ? 'urdu-text' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Background pattern */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.05]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="islamic-star" width="80" height="80" patternUnits="userSpaceOnUse">
            <path
              d="M40 0 L45 35 L80 40 L45 45 L40 80 L35 45 L0 40 L35 35 Z"
              fill="none"
              stroke="#E4572E"
              strokeWidth="1.5"
            />
            <path d="M20 20 L60 60 M20 60 L60 20" stroke="#E4572E" strokeWidth="0.5" />
            <circle cx="40" cy="40" r="20" fill="none" stroke="#E4572E" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-star)" />
      </svg>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8 md:p-10 rounded-[2rem] neu-raised-lg mx-4"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 rounded-full neu-raised flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full neu-inset flex items-center justify-center text-[#E4572E]">
              <Logo className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#E4572E] text-center mb-1">
            {t('institutionName')}
          </h1>
          <p className="text-sm font-medium opacity-70 text-center">
            {t('institutionSubtitle')}
          </p>
          <div className="w-full mt-6">
            <label htmlFor="portal" className="block text-sm font-semibold mb-2 text-left">
              {isUrdu ? 'پورٹل منتخب کریں' : 'Select portal'}
            </label>
            <div className="relative">
              {portal === 'school' ? <Building2 className="absolute left-3 top-3.5 w-5 h-5 text-[#2f6f8f]" /> : portal === 'madrasa' ? <BookOpen className="absolute left-3 top-3.5 w-5 h-5 text-[#263a78]" /> : portal === 'fees' ? <WalletCards className="absolute left-3 top-3.5 w-5 h-5 text-[#a86426]" /> : <Settings className="absolute left-3 top-3.5 w-5 h-5 text-[#5b6475]" />}
              <select
                id="portal"
                value={portal}
                onChange={event => setPortal(event.target.value as Portal)}
                className="neu-input w-full rounded-xl pl-11 pr-4 h-12 text-sm"
              >
                <option value="school">School Portal</option>
                <option value="madrasa">Madrasa / Dars-e-Nizami Portal</option>
                <option value="fees">Fee Management Portal</option>
                <option value="settings">Portal Settings</option>
              </select>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="neu-inset-sm flex items-center px-4 py-1 rounded-xl h-14">
              <User className="w-5 h-5 text-[#E4572E] opacity-70 shrink-0" />
              <input
                type="text"
                placeholder={isUrdu ? 'یوزر نیم' : 'Username'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-transparent border-none outline-none px-4 text-base neu-input h-full rounded-lg"
                autoComplete="username"
                required
              />
            </div>
            
            <div className="neu-inset-sm flex items-center px-4 py-1 rounded-xl h-14">
              <Lock className="w-5 h-5 text-[#E4572E] opacity-70 shrink-0" />
              <input
                type="password"
                placeholder={isUrdu ? 'پاس ورڈ' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent border-none outline-none px-4 text-base neu-input h-full rounded-lg"
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="neu-btn-primary w-full py-4 rounded-xl text-white font-semibold text-lg tracking-wide"
          >
            {t('adminLogin')}
          </button>
        </form>

        <div className="mt-8 text-center text-sm opacity-50 font-medium">
          {isUrdu ? 'یوزرنیم: admin | پاسورڈ: admin123' : 'Hint: admin / admin123'}
        </div>
      </motion.div>
    </div>
  );
}
