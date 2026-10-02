import React, { useState } from 'react';
import { useApp } from '@/store';
import { MADRASA_CLASSES } from '@/types';
import { Users, GraduationCap, BookOpen, Award, Printer } from 'lucide-react';
import { formatAdminDate } from '@/lib/adminDate';
import { printRecord } from '@/lib/print';
import Results from '@/pages/Results';

export default function Madrasa() {
  const { state, t } = useApp();
  const isUrdu = state.language === 'ur';
  const [activeArea, setActiveArea] = useState<'students' | 'results'>('students');
  const [selectedClass, setSelectedClass] = useState('');

  const madrasaStudents = state.students.filter(s => s.department === 'madrasa' && (!state.viewSessionId || s.sessionId === state.viewSessionId));
  const activeStudents = madrasaStudents.filter(s => s.status === 'active');
  const graduatedStudents = madrasaStudents.filter(s => s.status === 'graduated');
  const sessionName = state.academicSessions.find(session => session.id === (state.viewSessionId ?? state.activeSessionId))?.name;
  const printStudent = (student: typeof madrasaStudents[number]) => printRecord('Madrasa Student Record', `<table class="record-table"><tbody><tr><th>Name</th><td>${student.name}</td></tr><tr><th>Roll No</th><td>${student.rollNo || '-'}</td></tr><tr><th>Class</th><td>${student.class}</td></tr><tr><th>Father / Guardian</th><td>${student.fatherName || '-'}</td></tr><tr><th>Date of Birth</th><td>${formatAdminDate(student.dob) || '-'}</td></tr><tr><th>CNIC</th><td>${student.cnic || '-'}</td></tr><tr><th>Phone</th><td>${student.phone || '-'}</td></tr><tr><th>Address</th><td>${student.address || '-'}</td></tr><tr><th>Status</th><td>${student.status}</td></tr></tbody></table>`, { sessionName });
  const printClass = (className: string) => {
    const students = madrasaStudents.filter(student => student.class === className);
    printRecord(`Madrasa ${className} Students`, `<table class="print-table"><thead><tr><th>#</th><th>Name</th><th>Roll No</th><th>Father / Guardian</th><th>Date of Birth</th><th>Phone</th><th>Status</th></tr></thead><tbody>${students.map((student, index) => `<tr><td>${index + 1}</td><td>${student.name}</td><td>${student.rollNo || '-'}</td><td>${student.fatherName || '-'}</td><td>${formatAdminDate(student.dob) || '-'}</td><td>${student.phone || '-'}</td><td>${student.status}</td></tr>`).join('')}</tbody></table>`, { sessionName });
  };
  const printAll = () => printRecord('All Madrasa Students', `<table class="print-table"><thead><tr><th>#</th><th>Name</th><th>Roll No</th><th>Class</th><th>Father / Guardian</th><th>Phone</th><th>Status</th></tr></thead><tbody>${madrasaStudents.map((student, index) => `<tr><td>${index + 1}</td><td>${student.name}</td><td>${student.rollNo || '-'}</td><td>${student.class}</td><td>${student.fatherName || '-'}</td><td>${student.phone || '-'}</td><td>${student.status}</td></tr>`).join('')}</tbody></table>`, { sessionName, landscape: true });
  const selectedClassStudents = selectedClass ? madrasaStudents.filter(student => student.class === selectedClass) : [];

  const stats = [
    { label: isUrdu ? 'کل طالبات' : 'Total Students', value: madrasaStudents.length, icon: Users, color: '#E4572E' },
    { label: isUrdu ? 'فعال طالبات' : 'Active Students', value: activeStudents.length, icon: BookOpen, color: '#27ae60' },
    { label: isUrdu ? 'کلاسز' : 'Total Classes', value: MADRASA_CLASSES.length, icon: GraduationCap, color: '#3498db' },
    { label: isUrdu ? 'فارغ التحصیل' : 'Graduated', value: graduatedStudents.length, icon: Award, color: '#f39c12' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#E4572E]">{isUrdu ? 'مدرسہ' : 'Madrasa Department'}</h2>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveArea('students')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeArea === 'students' ? 'neu-raised text-[#E4572E]' : 'neu-btn opacity-60'}`}>{isUrdu ? 'طالبات' : 'Students'}</button>
          <button onClick={() => setActiveArea('results')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeArea === 'results' ? 'neu-raised text-[#E4572E]' : 'neu-btn opacity-60'}`}>{isUrdu ? 'نتائج' : 'Results'}</button>
          {activeArea === 'students' && <button onClick={printAll} className="neu-btn px-4 py-2.5 rounded-xl text-sm flex items-center gap-2"><Printer className="w-4 h-4" /> Print All</button>}
        </div>
      </div>

      {activeArea === 'results' ? <Results department="madrasa" /> : <>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="neu-raised rounded-2xl p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center shrink-0" style={{ color: stat.color }}>
              <stat.icon className="w-7 h-7" />
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-sm opacity-70 mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="neu-raised rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="font-bold text-lg">{isUrdu ? 'طالبات بذریعہ جماعت' : 'Students by Class'}</h3>
            <p className="text-sm opacity-60 mt-1">{selectedClass ? `${selectedClassStudents.length} ${isUrdu ? 'طالبات' : 'students'}` : (isUrdu ? 'جماعت منتخب کریں' : 'Select a class to view and print students')}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="neu-inset-sm rounded-xl px-3 py-1.5 w-full sm:w-64">
              <select className="w-full bg-transparent border-none outline-none text-sm cursor-pointer" value={selectedClass} onChange={event => setSelectedClass(event.target.value)}>
                <option value="">{isUrdu ? 'جماعت منتخب کریں' : 'Select Madrasa class...'}</option>
                {MADRASA_CLASSES.map(className => <option key={className} value={className}>{className} ({madrasaStudents.filter(student => student.class === className).length})</option>)}
              </select>
            </div>
            <button disabled={!selectedClass} onClick={() => printClass(selectedClass)} className="neu-btn px-4 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-40" title="Print selected class students"><Printer className="w-4 h-4" /> {isUrdu ? 'جماعت پرنٹ' : 'Print Class Students'}</button>
          </div>
        </div>
        <div className="neu-inset rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--neu-dark)]/20">
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Roll No</th>
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Class</th>
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-right font-semibold opacity-60 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedClassStudents.map(s => (
                  <tr key={s.id} className="border-b border-[var(--neu-dark)]/10 hover:bg-[rgba(228,87,46,0.03)] transition-colors last:border-0">
                    <td className="px-5 py-3.5 font-mono text-xs opacity-70">{s.rollNo}</td>
                    <td className="px-5 py-3.5 font-medium">{s.name}</td>
                    <td className="px-5 py-3.5 opacity-80 urdu-text" dir="rtl">{s.class}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ 
                        background: s.status === 'active' ? 'rgba(39,174,96,0.12)' : 'rgba(200,200,200,0.2)', 
                        color: s.status === 'active' ? '#27ae60' : '#888' 
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right"><button onClick={() => printStudent(s)} className="neu-btn w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#1C2E6B]" title="Print student"><Printer className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!selectedClass && (
              <div className="p-8 text-center opacity-50">{isUrdu ? 'اوپر سے جماعت منتخب کریں' : 'Choose a Madrasa class above.'}</div>
            )}
            {selectedClass && selectedClassStudents.length === 0 && (
              <div className="p-8 text-center opacity-50">{isUrdu ? 'اس جماعت میں کوئی طالبہ نہیں' : 'No students found in this class.'}</div>
            )}
          </div>
        </div>
      </div>
      </>}
    </div>
  );
}
