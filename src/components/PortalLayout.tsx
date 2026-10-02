import React, { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { BarChart3, BookOpen, Building2, ClipboardList, CreditCard, GraduationCap, HandCoins, LayoutDashboard, LogOut, Menu, Settings, Users, WalletCards } from 'lucide-react';
import { useApp } from '@/store';
import type { Portal } from '@/types';

const portalConfig = {
  school: {
    title: 'School Portal',
    subtitle: 'Academic administration',
    accent: '#2f6f8f',
    icon: Building2,
    links: [
      ['/school-portal/dashboard', 'Dashboard', LayoutDashboard],
      ['/school-portal/students', 'Students', Users],
      ['/school-portal/teachers', 'Teachers', GraduationCap],
      ['/school-portal/results', 'Results', ClipboardList],
      ['/school-portal/settings', 'Settings', Settings],
    ],
  },
  madrasa: {
    title: 'مدرسہ پورٹل',
    subtitle: 'درس نظامی انتظامیہ',
    accent: '#263a78',
    icon: BookOpen,
    links: [
      ['/madrasa-portal/dashboard', 'ڈیش بورڈ', LayoutDashboard],
      ['/madrasa-portal/students', 'طالبات', Users],
      ['/madrasa-portal/teachers', 'اساتذہ', GraduationCap],
      ['/madrasa-portal/results', 'نتائج', ClipboardList],
      ['/madrasa-portal/donations', 'عطیات', HandCoins],
      ['/madrasa-portal/reports', 'رپورٹس', BarChart3],
      ['/madrasa-portal/settings', 'ترتیبات', Settings],
    ],
  },
  fees: {
    title: 'Fee Management',
    subtitle: 'Financial administration',
    accent: '#a86426',
    icon: WalletCards,
    links: [
      ['/fees-portal/dashboard', 'Dashboard', LayoutDashboard],
      ['/fees-portal/school', 'School Fees', Building2],
      ['/fees-portal/madrasa', 'Dars-e-Nizami Fees', BookOpen],
      ['/fees-portal/reports', 'Reports', BarChart3],
    ],
  },
  settings: {
    title: 'Portal Settings',
    subtitle: 'Public portal administration',
    accent: '#5b6475',
    icon: Settings,
    links: [
      ['/portal-settings', 'Portal Settings', Settings],
    ],
  },
} as const;

export default function PortalLayout({ portal, children }: { portal: Portal; children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { state, logout } = useApp();
  const config = portalConfig[portal];
  const isMadrasa = portal === 'madrasa';
  const isFees = portal === 'fees';
  const isSettings = portal === 'settings';
  const Icon = config.icon;

  useEffect(() => {
    if (!state.isAuthenticated || state.portal !== portal) navigate('/login');
  }, [navigate, portal, state.isAuthenticated, state.portal]);

  if (!state.isAuthenticated || state.portal !== portal) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={`portal-shell ${isMadrasa ? 'madrasa-shell urdu-text' : isFees ? 'fee-shell' : isSettings ? 'settings-shell' : 'school-shell'}`} dir={isMadrasa ? 'rtl' : 'ltr'} style={{ '--portal-accent': config.accent } as React.CSSProperties}>
      <aside className="portal-sidebar">
        <Link href={portal === 'school' ? '/school-portal/dashboard' : portal === 'madrasa' ? '/madrasa-portal/dashboard' : portal === 'fees' ? '/fees-portal/dashboard' : '/portal-settings'} className="portal-brand">
          <span className="portal-brand-mark"><Icon className="w-6 h-6" /></span>
          <span><strong>{config.title}</strong><small>{config.subtitle}</small></span>
        </Link>
        <nav className="portal-nav">
          {config.links.map(([href, label, LinkIcon]) => (
            <Link key={href} href={href} className={location === href ? 'active' : ''}>
              <LinkIcon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <button type="button" onClick={handleLogout} className="portal-logout"><LogOut className="w-4 h-4" />{isMadrasa ? 'لاگ آؤٹ' : 'Log out'}</button>
      </aside>
      <main className="portal-main">
        <header className="portal-header">
          <div className="portal-mobile-title"><Menu className="w-5 h-5" /><span>{config.title}</span></div>
          <span className="portal-context">{isMadrasa ? 'تعلیمی سال اور طالبات کا انتظام' : isFees ? 'Track payments, balances, and fee reports' : isSettings ? 'Manage public information and administrator access' : 'Manage classes, students, and academic results'}</span>
          <Settings className="w-5 h-5 opacity-50" />
        </header>
        <div className="portal-content">{children}</div>
      </main>
    </div>
  );
}
