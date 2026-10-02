import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { BookOpen, ClipboardList, Users } from 'lucide-react';
import { Link } from 'wouter';
import { useApp } from '@/store';

export default function MadrasaDashboard() {
  const { state, getActiveSession } = useApp();
  const students = state.students.filter(student => student.department === 'madrasa' && (!state.viewSessionId || student.sessionId === state.viewSessionId));
  const ids = new Set(students.map(student => student.id));
  const results = state.results.filter(result => ids.has(result.studentId));
  const classCounts = useMemo(() => state.madrasaClasses.map(className => ({ className, students: students.filter(student => student.class === className).length })).filter(item => item.students > 0), [state.madrasaClasses, students]);
  const performance = useMemo(() => state.madrasaClasses.map(className => {
    const classIds = new Set(students.filter(student => student.class === className).map(student => student.id));
    const classResults = results.filter(result => classIds.has(result.studentId));
    const average = classResults.length ? classResults.reduce((sum, result) => sum + (result.marks / Math.max(result.totalMarks, 1)) * 100, 0) / classResults.length : 0;
    return { className, average: Number(average.toFixed(1)) };
  }).filter(item => item.average > 0), [state.madrasaClasses, students, results]);
  const passed = results.filter(result => result.totalMarks > 0 && result.marks / result.totalMarks >= 0.4).length;
  const needsSupport = Math.max(0, results.length - passed);
  const average = results.length ? (results.reduce((sum, result) => sum + (result.marks / Math.max(result.totalMarks, 1)) * 100, 0) / results.length).toFixed(1) : '0.0';
  const session = getActiveSession();

  return <div className="madrasa-dashboard-page urdu-text" dir="rtl">
    <div className="madrasa-dashboard-heading"><div><span className="madrasa-kicker">مدرسہ انتظامیہ</span><h1>درسِ نظامی کا آج کا جائزہ</h1><p>طالبات، جماعتوں اور نتائج کا مکمل انتظام ایک جگہ۔</p></div><div className="madrasa-session-chip">تعلیمی سال<strong>{session?.name ?? '-'}</strong></div></div>
    <div className="madrasa-kpi-grid"><div className="madrasa-kpi"><Users /><span>کل طالبات</span><strong>{students.length}</strong><small>{new Set(students.map(student => student.class)).size} فعال جماعتیں</small></div><div className="madrasa-kpi"><BookOpen /><span>کل اساتذہ</span><strong>{state.madrasaTeachers.length}</strong><small>مدرسہ تدریسی عملہ</small></div><div className="madrasa-kpi"><ClipboardList /><span>اوسط نتیجہ</span><strong>{average}%</strong><small>{results.length} نمبرز درج ہیں</small></div></div>
    <div className="madrasa-chart-grid"><section className="madrasa-chart-panel"><div className="madrasa-panel-heading"><div><span>طالبات کا اعداد و شمار</span><h2>جماعت وار طالبات</h2></div><Link href="/madrasa-portal/students">طالبات دیکھیں</Link></div><div className="madrasa-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={classCounts} margin={{ top: 8, right: 12, left: -18, bottom: 24 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d7e8df" /><XAxis dataKey="className" angle={-28} textAnchor="end" height={54} tick={{ fill: '#55776a', fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fill: '#55776a', fontSize: 11 }} /><Tooltip /><Bar dataKey="students" name="طالبات" fill="#1f7a5c" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>{classCounts.length === 0 && <p className="madrasa-empty-chart">طالبات شامل کریں تو جماعت وار اعداد و شمار ظاہر ہوں گے۔</p>}</section>
    <section className="madrasa-chart-panel"><div className="madrasa-panel-heading"><div><span>نتائج کی کارکردگی</span><h2>تعلیمی نتائج</h2></div><Link href="/madrasa-portal/results">نتائج دیکھیں</Link></div><div className="madrasa-performance-layout"><div className="madrasa-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={performance} margin={{ top: 8, right: 12, left: -18, bottom: 24 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d7e8df" /><XAxis dataKey="className" angle={-28} textAnchor="end" height={54} tick={{ fill: '#55776a', fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fill: '#55776a', fontSize: 11 }} /><Tooltip formatter={(value: number) => [`${value}%`, 'اوسط']} /><Bar dataKey="average" name="اوسط" fill="#b98345" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="madrasa-outcome"><strong>{average}%</strong><span>مجموعی اوسط</span><p>کامیاب: {passed}</p><p>مزید توجہ: {needsSupport}</p></div></div>{performance.length === 0 && <p className="madrasa-empty-chart">نتائج درج کریں تو جماعت وار کارکردگی ظاہر ہوگی۔</p>}</section></div>
  </div>;
}
