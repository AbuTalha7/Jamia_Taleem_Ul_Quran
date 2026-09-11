import React, { useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { 
  Globe, UserCircle, ScrollText, Heart, Sparkles, Home as HomeIcon,
  BookOpen, GraduationCap, ShieldCheck, HeartHandshake,
  Users, UserCheck, Bell, Phone, Mail
} from 'lucide-react';
import { useApp } from '@/store';
import { Logo } from '@/components/Logo';
import { useSEO } from '@/lib/seo';

// Subcomponents:
const IslamicPattern = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="islamic-star-home" width="100" height="100" patternUnits="userSpaceOnUse">
        <path
          d="M50 0 L58 42 L100 50 L58 58 L50 100 L42 58 L0 50 L42 42 Z"
          fill="none"
          stroke="#E4572E"
          strokeWidth="1"
        />
        <circle cx="50" cy="50" r="25" fill="none" stroke="#E4572E" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#islamic-star-home)" />
  </svg>
);

const DomeArch = () => (
  <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto flex items-center justify-center">
    <div className="absolute inset-0 rounded-t-[10rem] neu-inset opacity-50"></div>
    <div className="absolute inset-4 rounded-t-[8rem] neu-raised"></div>
    <div className="absolute inset-8 rounded-t-[7rem] neu-inset opacity-50"></div>
    <div className="absolute inset-12 rounded-t-[6rem] neu-raised flex items-center justify-center text-[#E4572E]">
      <Logo className="w-24 h-24 opacity-80" />
    </div>
  </div>
);

const Orb = ({ delay, style }: { delay: number, style: React.CSSProperties }) => (
  <motion.div
    animate={{ 
      y: [0, -20, 0], 
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1]
    }}
    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay }}
    className="absolute rounded-full pointer-events-none blur-3xl bg-[rgba(228,87,46,0.15)]"
    style={style}
  />
);

const revealUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: 'easeOut' },
};

export default function Home() {
  const [, navigate] = useLocation();
  const { t, state, toggleLanguage } = useApp();
  const isUrdu = state.language === 'ur';

  useSEO({
    title: isUrdu
      ? 'جامعہ تعلیم القرآن للبنات | اسلامی و عصری تعلیم'
      : 'Jamia Taleem-ul-Quran Lil-Banat | Islamic and Contemporary Education',
    description: isUrdu
      ? 'جامعہ تعلیم القرآن للبنات پشاور میں بچیوں کے لیے دینی اور عصری تعلیم، حفظ القرآن، تجوید اور اسکول پروگرام فراہم کرتا ہے۔'
      : 'Jamia Taleem-ul-Quran Lil-Banat in Peshawar provides girls with Islamic studies, Hifz-ul-Quran, Tajweed, and contemporary school education.',
    path: '/',
    locale: isUrdu ? 'ur_PK' : 'en_PK',
    keywords: isUrdu
      ? 'جامعہ تعلیم القرآن, مدرسہ, لڑکیوں کی تعلیم, حفظ القرآن, تجوید, پشاور'
      : 'Jamia Taleem-ul-Quran, girls education, madrasa in Peshawar, Hifz-ul-Quran, Tajweed, Islamic school',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'Jamia Taleem-ul-Quran Lil-Banat',
      alternateName: 'جامعہ تعلیم القرآن للبنات',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      logo: '/logo.jpeg',
      telephone: '+92 312 5654118',
      email: 'tk353778@gmail.com',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Peshawar',
        addressCountry: 'PK',
      },
      sameAs: ['https://wa.me/923125654118'],
    },
  });

  const stats = {
    students: state.students.length,
    teachers: state.teachers.length,
    announcements: state.announcements.length,
  };
  const latestAnnouncements = useMemo(
    () => [...state.announcements]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4),
    [state.announcements]
  );

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className={`min-h-[100dvh] relative overflow-x-hidden ${isUrdu ? 'urdu-text' : ''}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[70] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-[#E4572E] focus:text-white"
      >
        {isUrdu ? 'مواد پر جائیں' : 'Skip to main content'}
      </a>

      {/* Global Background Pattern */}
      <IslamicPattern />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full pt-4 pb-2 px-4 md:px-8 bg-[var(--neu-bg)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto neu-raised rounded-2xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full neu-inset flex items-center justify-center text-[#E4572E]">
              <Logo className="w-8 h-8" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-[#E4572E] font-bold text-lg leading-tight">{t('institutionName')}</h1>
              <p className="text-sm opacity-70 leading-tight">{t('institutionSubtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="neu-btn px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium"
            >
              <Globe className="w-4 h-4 text-[#E4572E]" />
              <span className="hidden sm:inline">{state.language === 'en' ? 'اردو' : 'English'}</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="neu-btn-primary px-6 py-2 rounded-full text-white font-medium flex items-center gap-2"
            >
              <UserCircle className="w-5 h-5" />
              <span className="hidden sm:inline">{t('adminLogin')}</span>
            </button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-3 flex flex-wrap items-center gap-2 px-1">
          {[
            { id: 'programs', label: isUrdu ? 'پروگرامز' : 'Programs' },
            { id: 'stats', label: isUrdu ? 'اعداد و شمار' : 'Stats' },
            { id: 'announcements', label: isUrdu ? 'اعلانات' : 'Announcements' },
            { id: 'contact', label: isUrdu ? 'رابطہ' : 'Contact' },
          ].map(link => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="neu-btn rounded-full px-4 py-1.5 text-xs md:text-sm font-semibold opacity-85"
            >
              {link.label}
            </button>
          ))}
        </div>
      </header>

      <main id="main-content" className="relative z-10 space-y-32 pb-32">
        
        {/* HERO SECTION */}
        <section className="relative pt-12 md:pt-24 px-4 md:px-8 max-w-7xl mx-auto">
          <Orb delay={0} style={{ width: '300px', height: '300px', top: '10%', left: '-5%' }} />
          <Orb delay={2} style={{ width: '250px', height: '250px', bottom: '10%', right: '40%' }} />

          <motion.div {...revealUp} className="relative z-10 text-center mb-8 md:mb-10">
            <div className="inline-flex items-center gap-3 px-4 md:px-7 py-2.5 md:py-3 rounded-full neu-raised border border-white/60">
              <span className="w-6 md:w-10 h-px bg-[#E4572E]/50" />
              <h2 className="text-[#E4572E] font-serif text-2xl sm:text-3xl md:text-4xl tracking-wide leading-tight" dir="rtl">
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
              </h2>
              <span className="w-6 md:w-10 h-px bg-[#E4572E]/50" />
            </div>
          </motion.div>

          <div className="flex flex-col items-center gap-8 md:gap-10">
            <motion.div {...revealUp} className="relative z-10 text-center w-full max-w-5xl">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-[var(--foreground)]">
                <span className="hero-title-glow block text-4xl md:text-6xl lg:text-7xl text-balance">
                  {isUrdu ? 'جامعہ تعلیم القرآن میں خوش آمدید' : 'Welcome to Jamia Taleem-ul-Quran'}
                </span>
              </h1>
            </motion.div>

            <motion.div
              {...revealUp}
              className="relative z-10 w-full flex justify-center"
            >
              <div className="neu-raised rounded-[2.4rem] p-5 md:p-7 border border-white/60">
                <DomeArch />
              </div>
            </motion.div>
          </div>
        </section>

        {/* PROGRAM SPOTLIGHT */}
        <section className="max-w-7xl mx-auto px-4 md:px-8">
          <motion.div {...revealUp} className="text-center space-y-4 mb-10">
            <span className="inline-block px-4 py-1.5 rounded-full neu-inset-sm text-[#E4572E] text-sm font-semibold uppercase tracking-wider">
              {isUrdu ? 'نمایاں پروگرامز' : 'Program Spotlight'}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold">
              {isUrdu ? 'ہر بچی کے لیے واضح تعلیمی راستہ' : 'A Clear Learning Path For Every Student'}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: isUrdu ? 'حفظ القرآن' : 'Hifz-ul-Quran Track',
                desc: isUrdu ? 'منظم حفظ، روزانہ دہرائی، اور پیش رفت کی مسلسل نگرانی۔' : 'Structured memorization with daily revision and measurable progress monitoring.',
                gradient: 'linear-gradient(135deg, rgba(228,87,46,0.14), rgba(28,46,107,0.12))',
              },
              {
                title: isUrdu ? 'درس نظامی' : 'Dars-e-Nizami Studies',
                desc: isUrdu ? 'عربی، فقہ، حدیث اور تفسیر پر جامع علمی بنیاد۔' : 'Strong scholarly foundation in Arabic, Fiqh, Hadith, and Tafsir.',
                gradient: 'linear-gradient(135deg, rgba(28,46,107,0.14), rgba(228,87,46,0.08))',
              },
              {
                title: isUrdu ? 'اسکول نصاب' : 'Contemporary School Curriculum',
                desc: isUrdu ? 'سائنس، ریاضی اور زبانوں کے ساتھ متوازن عصری تعلیم۔' : 'Balanced modern academics including science, mathematics, and languages.',
                gradient: 'linear-gradient(135deg, rgba(39,174,96,0.12), rgba(228,87,46,0.10))',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                className="neu-raised rounded-[2rem] p-7 border border-white/60"
                style={{ background: item.gradient }}
              >
                <div className="w-12 h-12 rounded-xl neu-inset mb-5 flex items-center justify-center text-[#E4572E] font-black">
                  0{i + 1}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="opacity-75 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* WHAT WE PROVIDE */}
        <section id="programs" className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center space-y-4 mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full neu-inset-sm text-[#E4572E] text-sm font-semibold uppercase tracking-wider">
              {t('provideKicker')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold">{t('provideTitle')}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: ScrollText, title: t('provide1Title'), desc: t('provide1Desc') },
              { icon: Heart, title: t('provide2Title'), desc: t('provide2Desc') },
              { icon: Sparkles, title: t('provide3Title'), desc: t('provide3Desc') },
              { icon: HomeIcon, title: t('provide4Title'), desc: t('provide4Desc') },
            ].map((item, idx) => (
              <div key={idx} className="neu-raised rounded-3xl p-8 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-20 h-20 rounded-2xl neu-icon flex items-center justify-center mb-6 text-[#E4572E] group-hover:scale-110 transition-transform">
                  <item.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="opacity-70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* OUR SERVICES */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 relative">
          <Orb delay={1} style={{ width: '400px', height: '400px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          
          <div className="text-center space-y-4 mb-16 relative z-10">
            <span className="inline-block px-4 py-1.5 rounded-full neu-inset-sm text-[#E4572E] text-sm font-semibold uppercase tracking-wider">
              {t('servicesKicker')}
            </span>
            <h2 className="text-3xl md:text-5xl font-bold">{t('servicesTitle')}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center relative z-10">
            <div className="space-y-8">
              {[
                { icon: BookOpen, title: t('service1Title'), desc: t('service1Desc') },
                { icon: GraduationCap, title: t('service2Title'), desc: t('service2Desc') }
              ].map((item, idx) => (
                <div key={idx} className="neu-raised rounded-[2rem] p-6 flex gap-6 items-start">
                  <div className="w-16 h-16 shrink-0 rounded-2xl neu-inset flex items-center justify-center text-[#E4572E]">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="opacity-70 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center hidden lg:flex">
              <div className="w-72 h-72 rounded-full neu-raised-lg flex items-center justify-center p-6 relative">
                <div className="absolute inset-2 rounded-full border border-[var(--neu-light)] opacity-50"></div>
                <div className="w-full h-full rounded-full neu-inset flex items-center justify-center">
                  <svg width="120" height="120" viewBox="0 0 100 100" fill="none" className="text-[#E4572E] opacity-80">
                    <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" fill="currentColor" />
                    <circle cx="50" cy="50" r="15" fill="var(--neu-bg)" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {[
                { icon: ShieldCheck, title: t('service3Title'), desc: t('service3Desc') },
                { icon: HeartHandshake, title: t('service4Title'), desc: t('service4Desc') }
              ].map((item, idx) => (
                <div key={idx} className="neu-raised rounded-[2rem] p-6 flex gap-6 items-start">
                  <div className="w-16 h-16 shrink-0 rounded-2xl neu-inset flex items-center justify-center text-[#E4572E]">
                    <item.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="opacity-70 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* STATISTICS */}
        <section id="stats" className="max-w-5xl mx-auto px-4 md:px-8 relative z-10">
          <div className="neu-raised-lg rounded-[3rem] p-8 md:p-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, label: t('totalStudents'), count: stats.students },
              { icon: UserCheck, label: t('activeTeachers'), count: stats.teachers },
              { icon: Bell, label: t('notices'), count: stats.announcements },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full neu-inset flex items-center justify-center text-[#E4572E] mb-6">
                  <stat.icon className="w-10 h-10" />
                </div>
                <div className="text-5xl font-bold text-[#E4572E] mb-2">{stat.count}</div>
                <div className="text-lg font-medium opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* NOTICES */}
        <section id="announcements" className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-xl neu-raised flex items-center justify-center text-[#E4572E]">
              <Bell className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold">{t('notices')}</h2>
          </div>

          <div className="space-y-6">
            {latestAnnouncements.length > 0 ? (
              latestAnnouncements.map((announcement) => (
                <div key={announcement.id} className="neu-raised rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                  <div className={`absolute top-0 bottom-0 w-2 bg-[#E4572E] ${isUrdu ? 'right-0' : 'left-0'}`}></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-[#E4572E] mb-2">
                      {new Date(announcement.date).toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{isUrdu ? announcement.title.ur : announcement.title.en}</h3>
                    <p className="opacity-75 leading-relaxed">{isUrdu ? announcement.content.ur : announcement.content.en}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="neu-inset rounded-2xl p-12 text-center opacity-60">
                {isUrdu ? 'فی الحال کوئی اعلانات نہیں ہیں' : 'No announcements at the moment'}
              </div>
            )}
          </div>
        </section>

        {/* CTA BAND */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <div className="neu-raised-lg rounded-[3rem] p-10 md:p-16 flex items-center justify-center bg-[rgba(228,87,46,0.03)] border border-white/50">
            <a 
              href="https://wa.me/923125654118" 
              target="_blank" 
              rel="noreferrer"
              className="neu-btn-primary px-8 py-5 rounded-2xl text-white font-bold text-xl whitespace-nowrap flex items-center gap-3 shadow-xl hover:scale-105 transition-transform"
            >
              <Phone className="w-6 h-6" />
              {t('ctaButton')}
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="contact" className="relative z-10 neu-raised pt-16 pb-8 border-t border-[var(--neu-light)]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full neu-inset flex items-center justify-center text-[#E4572E]">
                <Logo className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-[#E4572E] font-bold text-xl">{t('institutionName')}</h3>
                <p className="text-sm opacity-70">{t('institutionSubtitle')}</p>
              </div>
            </div>
            <p className="opacity-70 leading-relaxed max-w-sm">
              {isUrdu 
                ? 'جامعہ تعلیم القرآن لڑکیوں کے لیے ایک بہترین اسلامی اور عصری تعلیمی ادارہ ہے۔' 
                : 'Jamia Taleem-ul-Quran is a premier institution for girls offering a perfect blend of Islamic and contemporary education.'}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-[#E4572E]">
              {isUrdu ? 'شعبہ جات' : 'Departments'}
            </h4>
            <ul className="space-y-3 opacity-80">
              <li>{isUrdu ? 'حفظ القرآن' : 'Hifz-ul-Quran'}</li>
              <li>{isUrdu ? 'ناظرہ و تجوید' : 'Nazira & Tajweed'}</li>
              <li>{isUrdu ? 'درس نظامی' : 'Dars-e-Nizami'}</li>
              <li>{isUrdu ? 'پرائمری سکول' : 'Primary School'}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-[#E4572E]">
              {t('contact')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-[#E4572E]">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="opacity-80 font-mono">+92 312 5654118</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full neu-raised flex items-center justify-center text-[#E4572E]">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="opacity-80">tk353778@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Developer Credits Card */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
          <div className="neu-raised rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/40">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full neu-inset flex items-center justify-center text-[#E4572E] flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest opacity-50 mb-0.5">
                  {isUrdu ? 'تیار کردہ' : 'Developed by'}
                </p>
                <p className="font-bold text-[#E4572E] text-base leading-tight">
                  Abu Talha &amp; Ibadat Ullah
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs opacity-50 font-mono tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#E4572E] opacity-70 animate-pulse inline-block" />
              {isUrdu ? 'جامعہ پورٹل v1.1' : 'Jamia Portal v1.1'}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 border-t border-[var(--neu-dark)]/20 text-center opacity-60 text-sm">
          &copy; {new Date().getFullYear()} {t('institutionName')}. {isUrdu ? 'تمام حقوق محفوظ ہیں۔' : 'All rights reserved.'}
        </div>
      </footer>
    </div>
  );
}
