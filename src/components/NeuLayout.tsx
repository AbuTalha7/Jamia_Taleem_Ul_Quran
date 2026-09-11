import React, { useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useApp } from '@/store';
import { Logo } from '@/components/Logo';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  CreditCard,
  FileSpreadsheet,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Globe,
  CalendarRange,
  ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NeuLayout({ children }: { children: React.ReactNode }) {
  const [loc, navigate] = useLocation();
  const { state, t, logout, toggleLanguage, getActiveSession, getViewSession, dispatch } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [sessionPickerOpen, setSessionPickerOpen] = React.useState(false);

  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate('/login');
    }
  }, [state.isAuthenticated, navigate]);

  if (!state.isAuthenticated) return null;

  const isUrdu = state.language === 'ur';
  const activeSession = getActiveSession();
  const viewSession = getViewSession();
  const displaySession = viewSession ?? activeSession;

  const navLinks = [
    { path: '/dashboard',          icon: LayoutDashboard, label: t('dashboard') },
    { path: '/admin/students',     icon: Users,           label: t('students') },
    { path: '/admin/teachers',     icon: GraduationCap,   label: t('teachers') },
    { path: '/admin/madrasa',      icon: BookOpen,        label: t('madrasa') },
    { path: '/admin/school',       icon: Building2,       label: t('school') },
    { path: '/admin/fees',         icon: CreditCard,      label: t('fees') },
    { path: '/admin/results',      icon: FileSpreadsheet, label: t('results') },
    { path: '/admin/announcements',icon: Bell,            label: t('announcements') },
    { path: '/admin/reports',      icon: BarChart3,       label: t('reports') },
    { path: '/admin/sessions',     icon: CalendarRange,   label: isUrdu ? 'تعلیمی سال' : 'Sessions' },
    { path: '/admin/settings',     icon: Settings,        label: t('settings') },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getPageTitle = () => {
    const link = navLinks.find(l => l.path === loc);
    return link ? link.label : '';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full neu-inset flex items-center justify-center text-[#E4572E]">
          <Logo className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-[#E4572E] font-bold text-lg leading-tight">Jamia Portal</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
        {navLinks.map((link) => {
          const isActive = loc === link.path;
          return (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center gap-3 ${
                isActive
                  ? 'neu-raised rounded-xl px-4 py-2.5 text-[#E4572E] font-bold'
                  : 'px-4 py-2.5 opacity-60 hover:opacity-90 rounded-xl transition-opacity'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <link.icon className="w-5 h-5 shrink-0" />
              <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="neu-btn w-full px-4 py-3 rounded-xl text-[#E4572E] font-medium flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-[100dvh] flex ${isUrdu ? 'urdu-text' : ''}`}
      dir={isUrdu ? 'rtl' : 'ltr'}
      style={{ background: 'var(--neu-bg)' }}
    >
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block fixed top-0 bottom-0 w-64 neu-raised z-40 ${isUrdu ? 'right-0' : 'left-0'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: isUrdu ? 300 : -300 }}
              animate={{ x: 0 }}
              exit={{ x: isUrdu ? 300 : -300 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
              className={`fixed top-0 bottom-0 w-64 bg-[var(--neu-bg)] z-50 lg:hidden ${isUrdu ? 'right-0' : 'left-0'}`}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${isUrdu ? 'lg:mr-64' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 px-4 pt-4 pb-2" style={{ background: 'var(--neu-bg)' }}>
          <div className="max-w-7xl mx-auto neu-raised rounded-2xl px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden neu-btn w-10 h-10 rounded-xl flex items-center justify-center text-[#E4572E] shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-bold truncate">{getPageTitle()}</h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Session Picker */}
              <div className="relative">
                <button
                  onClick={() => setSessionPickerOpen(p => !p)}
                  className="neu-btn px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-[#1C2E6B] hidden sm:flex"
                >
                  <CalendarRange className="w-3.5 h-3.5 text-[#E4572E]" />
                  <span className="max-w-[120px] truncate">
                    {displaySession ? displaySession.name : 'All Sessions'}
                  </span>
                  {state.viewSessionId && (
                    <span className="px-1.5 py-0.5 bg-[#E4572E]/15 text-[#E4572E] rounded text-[10px]">
                      {isUrdu ? 'فلٹر' : 'Filter'}
                    </span>
                  )}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </button>

                <AnimatePresence>
                  {sessionPickerOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setSessionPickerOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full mt-2 right-0 z-50 neu-raised rounded-2xl p-3 min-w-[200px] shadow-lg"
                      >
                        <p className="text-[10px] font-bold uppercase opacity-50 px-2 mb-2 tracking-wider">
                          {isUrdu ? 'تعلیمی سال منتخب کریں' : 'Select Academic Session'}
                        </p>
                        <button
                          onClick={() => {
                            dispatch({ type: 'SET_VIEW_SESSION', payload: null });
                            setSessionPickerOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                            !state.viewSessionId ? 'neu-raised text-[#E4572E]' : 'hover:bg-[rgba(228,87,46,0.06)]'
                          }`}
                        >
                          {isUrdu ? 'تمام سال' : 'All Sessions'}
                        </button>
                        {state.academicSessions.map(s => (
                          <button
                            key={s.id}
                            onClick={() => {
                              dispatch({ type: 'SET_VIEW_SESSION', payload: s.id });
                              setSessionPickerOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-2 ${
                              state.viewSessionId === s.id ? 'neu-raised text-[#E4572E]' : 'hover:bg-[rgba(228,87,46,0.06)]'
                            }`}
                          >
                            <span>{s.name}</span>
                            {s.status === 'active' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#27ae60]/15 text-[#27ae60] font-bold">
                                {isUrdu ? 'فعال' : 'Active'}
                              </span>
                            )}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={toggleLanguage}
                className="neu-btn px-3 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <Globe className="w-4 h-4 text-[#E4572E]" />
                <span className="hidden sm:inline">{state.language === 'en' ? 'اردو' : 'English'}</span>
              </button>
              <div className="neu-inset-sm px-3 py-1.5 rounded-xl text-sm font-semibold text-[#E4572E] hidden sm:block">
                Admin
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
