import React, { useState } from 'react';
import { useApp } from '@/store';
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from '@/types';
import { Building2, Users, CheckCircle2, Printer } from 'lucide-react';
import Results from '@/pages/Results';
import { formatAdminDate } from '@/lib/adminDate';
import { printRecord } from '@/lib/print';

export default function School() {
  const { state, t } = useApp();
  const isUrdu = state.language === 'ur';

  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [activeArea, setActiveArea] = useState<'students' | 'results'>('students');

  const schoolStudents = state.students.filter(s => s.department === 'school' && (!state.viewSessionId || s.sessionId === state.viewSessionId));
  
  const filteredStudents = schoolStudents.filter(s => {
    if (classFilter && s.class !== classFilter) return false;
    if (sectionFilter && s.section !== sectionFilter) return false;
    return true;
  });

  const activeStudentsCount = schoolStudents.filter(s => s.status === 'active').length;
  const sessionName = state.academicSessions.find(session => session.id === (state.viewSessionId ?? state.activeSessionId))?.name;
  const selectedClassStudents = classFilter ? filteredStudents : [];
  const printStudent = (student: typeof schoolStudents[number]) => printRecord('School Student Record', `<table class="record-table"><tbody><tr><th>Name</th><td>${student.name}</td></tr><tr><th>Roll No</th><td>${student.rollNo || '-'}</td></tr><tr><th>Class</th><td>${student.class}</td></tr><tr><th>Section</th><td>${student.section || '-'}</td></tr><tr><th>Father / Guardian</th><td>${student.fatherName || '-'}</td></tr><tr><th>Date of Birth</th><td>${formatAdminDate(student.dob) || '-'}</td></tr><tr><th>CNIC</th><td>${student.cnic || '-'}</td></tr><tr><th>Phone</th><td>${student.phone || '-'}</td></tr><tr><th>Address</th><td>${student.address || '-'}</td></tr><tr><th>Status</th><td>${student.status}</td></tr></tbody></table>`, { sessionName });
  const printClass = () => {
    if (!classFilter) return;
    printRecord(`School ${classFilter} Students`, `<table class="print-table"><thead><tr><th>#</th><th>Name</th><th>Roll No</th><th>Section</th><th>Father / Guardian</th><th>Date of Birth</th><th>Phone</th><th>Status</th></tr></thead><tbody>${selectedClassStudents.map((student, index) => `<tr><td>${index + 1}</td><td>${student.name}</td><td>${student.rollNo || '-'}</td><td>${student.section || '-'}</td><td>${student.fatherName || '-'}</td><td>${formatAdminDate(student.dob) || '-'}</td><td>${student.phone || '-'}</td><td>${student.status}</td></tr>`).join('')}</tbody></table>`, { sessionName, landscape: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#E4572E]">{isUrdu ? 'سکول' : 'School Department'}</h2>
          <div className="flex gap-2 mt-3">
            <button onClick={() => setActiveArea('students')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeArea === 'students' ? 'neu-raised text-[#E4572E]' : 'neu-btn opacity-60'}`}>{isUrdu ? 'طالبات' : 'Students'}</button>
            <button onClick={() => setActiveArea('results')} className={`px-4 py-2 rounded-xl text-sm font-semibold ${activeArea === 'results' ? 'neu-raised text-[#E4572E]' : 'neu-btn opacity-60'}`}>{isUrdu ? 'نتائج' : 'Results'}</button>
          </div>
        </div>
      </div>

      {activeArea === 'results' ? <Results department="school" /> : <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="neu-raised rounded-2xl p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center shrink-0 text-[#E4572E]">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#E4572E]">{SCHOOL_CLASSES.length}</div>
            <div className="text-sm opacity-70 mt-0.5">{isUrdu ? 'کلاسز' : 'Total Classes'}</div>
          </div>
        </div>
        <div className="neu-raised rounded-2xl p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center shrink-0 text-[#3498db]">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#3498db]">{schoolStudents.length}</div>
            <div className="text-sm opacity-70 mt-0.5">{isUrdu ? 'کل طالبات' : 'Total Students'}</div>
          </div>
        </div>
        <div className="neu-raised rounded-2xl p-6 flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center shrink-0 text-[#27ae60]">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl font-bold text-[#27ae60]">{activeStudentsCount}</div>
            <div className="text-sm opacity-70 mt-0.5">{isUrdu ? 'فعال طالبات' : 'Active Students'}</div>
          </div>
        </div>
      </div>

      <div className="neu-raised rounded-2xl p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="neu-inset-sm rounded-xl px-3 py-1.5 w-full sm:w-64">
            <select 
              className="w-full bg-transparent border-none outline-none text-sm cursor-pointer"
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
            >
              <option value="">{isUrdu ? 'جماعت منتخب کریں' : 'Select School class...'}</option>
              {SCHOOL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="neu-inset-sm rounded-xl px-3 py-1.5 w-full sm:w-48">
            <select 
              className="w-full bg-transparent border-none outline-none text-sm cursor-pointer"
              value={sectionFilter}
              onChange={e => setSectionFilter(e.target.value)}
            >
              <option value="">{isUrdu ? 'تمام سیکشنز' : 'All Sections'}</option>
              {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
          {(classFilter || sectionFilter) && (
            <button 
              onClick={() => { setClassFilter(''); setSectionFilter(''); }}
              className="neu-btn px-4 py-2 rounded-xl text-sm font-medium text-red-500"
            >
              Clear Filters
            </button>
          )}
          <button disabled={!classFilter} onClick={printClass} className="neu-btn px-4 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-40"><Printer className="w-4 h-4" /> {isUrdu ? 'جماعت پرنٹ' : 'Print Class Students'}</button>
        </div>

        <div className="neu-inset rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--neu-dark)]/20">
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Roll No</th>
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Class</th>
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Section</th>
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-right font-semibold opacity-60 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedClassStudents.map(s => (
                  <tr key={s.id} className="border-b border-[var(--neu-dark)]/10 hover:bg-[rgba(228,87,46,0.03)] transition-colors last:border-0">
                    <td className="px-5 py-3.5 font-mono text-xs opacity-70">{s.rollNo}</td>
                    <td className="px-5 py-3.5 font-medium">{s.name}</td>
                    <td className="px-5 py-3.5 opacity-80">{s.class}</td>
                    <td className="px-5 py-3.5 opacity-80">{s.section || '-'}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ 
                        background: s.status === 'active' ? 'rgba(39,174,96,0.12)' : 'rgba(200,200,200,0.2)', 
                        color: s.status === 'active' ? '#27ae60' : '#888' 
                      }}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right"><button onClick={() => printStudent(s)} className="neu-btn w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#1C2E6B]" title="Print student record"><Printer className="w-3.5 h-3.5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!classFilter && (
              <div className="p-8 text-center opacity-50">{isUrdu ? 'اوپر سے جماعت منتخب کریں' : 'Choose a School class above.'}</div>
            )}
            {classFilter && selectedClassStudents.length === 0 && (
              <div className="p-8 text-center opacity-50">{isUrdu ? 'اس جماعت میں کوئی طالبہ نہیں' : 'No students found in this class.'}</div>
            )}
          </div>
        </div>
      </div>
      </>}
    </div>
  );
}
