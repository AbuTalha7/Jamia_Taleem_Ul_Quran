import React from 'react';
import { Link } from 'wouter';
import { ArrowUpRight, BookOpen, ClipboardList, Users } from 'lucide-react';
import { useApp } from '@/store';
import type { Portal } from '@/types';

export default function PortalDashboard({ portal }: { portal: Portal }) {
  const { state, getActiveSession } = useApp();
  const isMadrasa = portal === 'madrasa';
  const students = state.students.filter(student => student.department === portal && (!state.viewSessionId || student.sessionId === state.viewSessionId));
  const activeStudents = students.filter(student => student.status === 'active').length;
  const results = state.results.filter(result => students.some(student => student.id === result.studentId));
  const session = getActiveSession();
  const copy = isMadrasa
    ? { eyebrow: 'مدرسہ انتظامیہ', title: 'درسِ نظامی کا آج کا جائزہ', intro: 'طالبات، جماعتوں اور نتائج کو ایک جگہ منظم کریں۔', students: 'کل طالبات', active: 'فعال طالبات', results: 'درج شدہ نتائج', classes: 'جماعتیں', studentAction: 'طالبات دیکھیں', resultAction: 'نتائج درج کریں' }
    : { eyebrow: 'School administration', title: 'A clear view of your school day', intro: 'Keep classes, student records, and academic results moving together.', students: 'Total students', active: 'Active students', results: 'Recorded results', classes: 'Classes', studentAction: 'Open students', resultAction: 'Manage results' };
  const statCards = [
    { icon: Users, label: copy.students, value: students.length },
    { icon: BookOpen, label: copy.active, value: activeStudents },
    { icon: ClipboardList, label: copy.results, value: results.length },
    { icon: BookOpen, label: copy.classes, value: new Set(students.map(student => student.class)).size },
  ];

  return (
    <div className="portal-dashboard">
      <section className="portal-hero">
        <div><p className="portal-eyebrow">{copy.eyebrow}</p><h1>{copy.title}</h1><p>{copy.intro}</p></div>
        <div className="portal-session">{isMadrasa ? 'تعلیمی سال' : 'Academic session'}<strong>{session?.name ?? '-'}</strong></div>
      </section>
      <section className="portal-stat-grid">
        {statCards.map(({ icon: StatIcon, label, value }) => <div className="portal-stat" key={label}><StatIcon className="w-5 h-5" /><strong>{value}</strong><span>{label}</span></div>)}
      </section>
      <section className="portal-action-grid">
        <Link href={isMadrasa ? '/madrasa-portal/students' : '/school-portal/students'} className="portal-action"><span><Users className="w-6 h-6" /><strong>{copy.studentAction}</strong></span><ArrowUpRight className="w-5 h-5" /></Link>
        <Link href={isMadrasa ? '/madrasa-portal/results' : '/school-portal/results'} className="portal-action"><span><ClipboardList className="w-6 h-6" /><strong>{copy.resultAction}</strong></span><ArrowUpRight className="w-5 h-5" /></Link>
      </section>
    </div>
  );
}
