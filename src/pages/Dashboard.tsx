import { motion } from 'framer-motion';
import {
  Users, GraduationCap, Bell, CreditCard,
  TrendingUp, AlertCircle, CheckCircle2, CalendarRange,
} from 'lucide-react';
import { useApp } from '@/store';

export default function Dashboard() {
  const { state, getDashboardStats, getActiveSession, getViewSession, getStudentsForView } = useApp();
  const isUrdu = state.language === 'ur';
  const stats = getDashboardStats();
  const activeSession = getActiveSession();
  const viewSession = getViewSession();
  const displaySession = viewSession ?? activeSession;
  const students = getStudentsForView();

  const visibleStudentIds = new Set(students.map(student => student.id));
  const visibleFees = state.feeRecords.filter(fee => visibleStudentIds.has(fee.studentId));
  const paidFees   = visibleFees.filter(f => f.status === 'paid').length;
  const pendingFees = visibleFees.filter(f => f.status === 'pending').length;

  const statCards = [
    { icon: Users,         label: isUrdu ? 'کل طالبات'      : 'Total Students', value: stats.totalStudents,         color: '#E4572E' },
    { icon: GraduationCap, label: isUrdu ? 'اساتذہ'          : 'Teachers',       value: stats.activeTeachers,        color: '#5c8aff' },
    { icon: Bell,          label: isUrdu ? 'اعلانات'         : 'Notices',        value: state.announcements.length,  color: '#9b59b6' },
    { icon: CreditCard,    label: isUrdu ? 'زیرِ التواء فیس' : 'Pending Fees',   value: `Rs. ${stats.pendingFees}`,  color: '#27ae60' },
  ];

  // Per-session breakdown for the sessions summary
  const sessionBreakdown = state.academicSessions.map(s => ({
    ...s,
    studentCount: state.students.filter(st => st.sessionId === s.id).length,
  })).sort((a, b) => b.startYear - a.startYear);

  return (
    <div className="space-y-8">
      {/* Session Banner */}
      {displaySession && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="neu-inset rounded-2xl px-6 py-4 flex items-center gap-4"
        >
          <CalendarRange className="w-5 h-5 text-[#E4572E] shrink-0" />
          <div>
            <span className="font-bold text-[#E4572E]">
              {isUrdu ? 'تعلیمی سال: ' : 'Academic Session: '}{displaySession.name}
            </span>
            {viewSession && (
              <span className="text-xs ml-2 opacity-60">({isUrdu ? 'فلٹر کیا گیا' : 'filtered view'})</span>
            )}
            {!viewSession && displaySession.status === 'active' && (
              <span className="text-xs ml-2 px-2 py-0.5 bg-[#27ae60]/15 text-[#27ae60] rounded-full font-bold">
                {isUrdu ? 'فعال' : 'Active'}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="neu-raised rounded-2xl p-6 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center shrink-0" style={{ color: card.color }}>
              <card.icon className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: card.color }}>{card.value}</div>
              <div className="text-sm opacity-70 mt-0.5">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }} className="neu-raised rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#E4572E]" />
            {isUrdu ? 'فیس کی صورتحال' : 'Fee Status'}
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#27ae60]" />{isUrdu ? 'ادا شدہ' : 'Paid'}</span>
                <span className="font-bold text-[#27ae60]">{paidFees}</span>
              </div>
              <div className="neu-inset rounded-full h-3 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${visibleFees.length ? (paidFees / visibleFees.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #27ae60, #2ecc71)', boxShadow: '0 0 8px rgba(39,174,96,0.4)' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4 text-[#E4572E]" />{isUrdu ? 'زیرِ التواء' : 'Pending'}</span>
                <span className="font-bold text-[#E4572E]">{pendingFees}</span>
              </div>
              <div className="neu-inset rounded-full h-3 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${visibleFees.length ? (pendingFees / visibleFees.length) * 100 : 0}%`, background: 'linear-gradient(90deg, #E4572E, #ff7a5c)', boxShadow: '0 0 8px rgba(228,87,46,0.4)' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Academic Sessions Summary */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4 }} className="neu-raised rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
            <CalendarRange className="w-5 h-5 text-[#E4572E]" />
            {isUrdu ? 'تعلیمی سال' : 'Academic Sessions'}
          </h3>
          <div className="space-y-3">
            {sessionBreakdown.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 neu-inset-sm rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm">{s.name}</span>
                  {s.status === 'active' && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#27ae60]/15 text-[#27ae60] font-bold">
                      {isUrdu ? 'فعال' : 'Active'}
                    </span>
                  )}
                </div>
                <span className="font-bold text-[#E4572E]">
                  {s.studentCount} <span className="font-normal opacity-60 text-xs">{isUrdu ? 'طالبات' : 'students'}</span>
                </span>
              </div>
            ))}
            {sessionBreakdown.length === 0 && (
              <p className="text-sm opacity-50 text-center py-4">{isUrdu ? 'کوئی سال نہیں' : 'No sessions yet'}</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Students */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }} className="neu-raised rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-5">{isUrdu ? 'حالیہ طالبات' : 'Recent Students'}</h3>
        <div className="neu-inset rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--neu-dark)]/20">
                  <th className={`px-5 py-3 font-semibold opacity-60 text-xs tracking-wider ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? 'نام' : 'Name'}</th>
                  <th className={`px-5 py-3 font-semibold opacity-60 text-xs tracking-wider ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? 'رول نمبر' : 'Roll No'}</th>
                  <th className={`px-5 py-3 font-semibold opacity-60 text-xs tracking-wider hidden md:table-cell ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? 'جماعت' : 'Class'}</th>
                  <th className={`px-5 py-3 font-semibold opacity-60 text-xs tracking-wider hidden lg:table-cell ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? 'تعلیمی سال' : 'Session'}</th>
                  <th className={`px-5 py-3 font-semibold opacity-60 text-xs tracking-wider ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? 'صورتحال' : 'Status'}</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(-10).reverse().map(s => {
                  const sessionName2 = state.academicSessions.find(ss => ss.id === s.sessionId)?.name ?? '-';
                  return (
                    <tr key={s.id} className="border-b border-[var(--neu-dark)]/10 hover:bg-[rgba(228,87,46,0.03)] transition-colors last:border-0">
                      <td className="px-5 py-3.5 font-medium">{s.name}</td>
                      <td className="px-5 py-3.5 opacity-70 font-mono text-xs">{s.rollNo || '—'}</td>
                      <td className="px-5 py-3.5 opacity-70 hidden md:table-cell">{s.class}</td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <span className="text-xs opacity-60">{sessionName2}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: s.status === 'active' ? 'rgba(39,174,96,0.12)' : 'rgba(200,200,200,0.2)', color: s.status === 'active' ? '#27ae60' : '#888' }}>
                          {s.status === 'active' ? (isUrdu ? 'فعال' : 'Active') : (isUrdu ? 'غیر فعال' : 'Inactive')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {students.length === 0 && <div className="p-8 text-center opacity-40 text-sm">{isUrdu ? 'ابھی کوئی طالبہ نہیں' : 'No students yet'}</div>}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
