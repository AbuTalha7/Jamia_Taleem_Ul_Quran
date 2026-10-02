import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import {
  Users, GraduationCap, Bell, CreditCard, ChevronDown, Search,
  CalendarRange,
} from 'lucide-react';
import { useApp } from '@/store';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

export default function Dashboard() {
  const { state, getDashboardStats, getActiveSession, getViewSession, getStudentsForView } = useApp();
  const isUrdu = state.language === 'ur';
  const stats = getDashboardStats();
  const activeSession = getActiveSession();
  const viewSession = getViewSession();
  const displaySession = viewSession ?? activeSession;
  const students = getStudentsForView();
  const [studentsExpanded, setStudentsExpanded] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);

  const visibleStudentIds = new Set(students.map(student => student.id));
  const visibleFees = state.feeRecords.filter(fee => visibleStudentIds.has(fee.studentId));
  const paidFees   = visibleFees.filter(f => f.status === 'paid').length;
  const pendingFees = visibleFees.filter(f => f.status === 'pending').length;
  const feeBreakdown = [
    { name: isUrdu ? 'ادا شدہ' : 'Paid', value: paidFees, color: '#27ae60' },
    { name: isUrdu ? 'زیر التواء' : 'Pending', value: pendingFees, color: '#E4572E' },
  ];
  const admissionBreakdown = useMemo(() => {
    const counts = new Map<string, number>();
    students.forEach(student => counts.set(student.class || 'Unassigned', (counts.get(student.class || 'Unassigned') ?? 0) + 1));
    return Array.from(counts, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [students]);
  const filteredDashboardStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    return students.filter(student => !query || `${student.name} ${student.rollNo} ${student.class}`.toLowerCase().includes(query));
  }, [students, studentSearch]);
  const dashboardPageSize = 10;
  const dashboardPageCount = Math.max(1, Math.ceil(filteredDashboardStudents.length / dashboardPageSize));
  const dashboardStudents = filteredDashboardStudents.slice((studentPage - 1) * dashboardPageSize, studentPage * dashboardPageSize);
  const chartColors = ['#E4572E', '#1C2E6B', '#27ae60', '#5c8aff', '#9b59b6', '#d99122', '#4b8f8c'];

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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="neu-raised rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-3">{isUrdu ? 'داخلہ کا جائزہ' : 'Student Admissions Overview'}</h3>
          {admissionBreakdown.length > 0 ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={admissionBreakdown} dataKey="value" nameKey="name" cx="50%" cy="48%" outerRadius="72%" innerRadius="35%" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>{admissionBreakdown.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip formatter={(value: number) => [`${value}`, isUrdu ? 'طالبات' : 'students']} /><Legend /></PieChart></ResponsiveContainer></div> : <p className="py-20 text-center text-sm opacity-50">{isUrdu ? 'ابھی کوئی طالبہ نہیں' : 'No students yet'}</p>}
        </motion.div>
        {/* Fee Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }} className="neu-raised rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-3">{isUrdu ? 'فیس کا جائزہ' : 'Fee Overview'}</h3>
          {visibleFees.length > 0 ? <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={feeBreakdown} dataKey="value" nameKey="name" cx="50%" cy="48%" outerRadius="72%" innerRadius="42%" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>{feeBreakdown.map(entry => <Cell key={entry.name} fill={entry.color} />)}</Pie><Tooltip formatter={(value: number) => [`${value}`, isUrdu ? 'ریکارڈز' : 'records']} /><Legend /></PieChart></ResponsiveContainer></div> : <p className="py-20 text-center text-sm opacity-50">{isUrdu ? 'کوئی فیس ریکارڈ نہیں' : 'No fee records yet'}</p>}
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
        <button className="w-full flex items-center justify-between gap-4 text-left" onClick={() => setStudentsExpanded(expanded => !expanded)} aria-expanded={studentsExpanded}>
          <span className="font-bold text-lg">{isUrdu ? 'حالیہ طالبات' : 'Student List'} <span className="text-sm font-normal opacity-50">({students.length})</span></span>
          <ChevronDown className={`w-5 h-5 text-[#E4572E] transition-transform ${studentsExpanded ? 'rotate-180' : ''}`} />
        </button>
        {studentsExpanded && <div className="mt-5 neu-inset rounded-2xl overflow-hidden">
          <div className="p-3 flex flex-col sm:flex-row gap-3 justify-between">
            <div className="neu-inset-sm rounded-xl px-3 flex items-center gap-2 h-10 w-full sm:w-80"><Search className="w-4 h-4 opacity-40" /><input className="bg-transparent outline-none text-sm w-full" placeholder={isUrdu ? 'نام، رول نمبر یا جماعت...' : 'Search name, roll no, or class...'} value={studentSearch} onChange={event => { setStudentSearch(event.target.value); setStudentPage(1); }} /></div>
            <span className="text-xs opacity-50 self-center">{filteredDashboardStudents.length} {isUrdu ? 'نتائج' : 'matches'}</span>
          </div>
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
                {dashboardStudents.map(s => {
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
          {filteredDashboardStudents.length > 0 && <div className="flex items-center justify-between gap-3 p-3 text-sm"><span className="opacity-50">Page {studentPage} of {dashboardPageCount}</span><div className="flex gap-2"><button className="neu-btn px-3 py-1.5 rounded-lg disabled:opacity-30" disabled={studentPage === 1} onClick={() => setStudentPage(page => page - 1)}>Previous</button><button className="neu-btn px-3 py-1.5 rounded-lg disabled:opacity-30" disabled={studentPage === dashboardPageCount} onClick={() => setStudentPage(page => page + 1)}>Next</button></div></div>}
        </div>}
      </motion.div>
    </div>
  );
}
