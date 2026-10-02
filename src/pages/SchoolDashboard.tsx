import React, { useMemo } from 'react';
import { Link } from 'wouter';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ClipboardList, GraduationCap, Users } from 'lucide-react';
import { useApp } from '@/store';

const COLORS = ['#2f6f8f', '#f0a35b', '#5f8f72', '#d46c5d', '#6e78a8', '#c58c4c'];

export default function SchoolDashboard() {
  const { state, getActiveSession } = useApp();
  const students = state.students.filter(student => student.department === 'school' && (!state.viewSessionId || student.sessionId === state.viewSessionId));
  const studentIds = new Set(students.map(student => student.id));
  const results = state.results.filter(result => studentIds.has(result.studentId));
  const classCounts = useMemo(() => state.schoolClasses.map(className => ({ className, students: students.filter(student => student.class === className).length })).filter(item => item.students > 0), [state.schoolClasses, students]);
  const performance = useMemo(() => state.schoolClasses.map(className => {
    const classIds = new Set(students.filter(student => student.class === className).map(student => student.id));
    const classResults = results.filter(result => classIds.has(result.studentId));
    const average = classResults.length ? classResults.reduce((sum, result) => sum + (result.marks / Math.max(result.totalMarks, 1)) * 100, 0) / classResults.length : 0;
    return { className, average: Number(average.toFixed(1)) };
  }).filter(item => item.average > 0), [state.schoolClasses, students, results]);
  const passFail = useMemo(() => {
    const passed = results.filter(result => result.totalMarks > 0 && result.marks / result.totalMarks >= 0.4).length;
    return [{ name: 'Passed', value: passed }, { name: 'Needs support', value: Math.max(0, results.length - passed) }].filter(item => item.value > 0);
  }, [results]);
  const average = results.length ? (results.reduce((sum, result) => sum + (result.marks / Math.max(result.totalMarks, 1)) * 100, 0) / results.length).toFixed(1) : '0.0';
  const session = getActiveSession();

  return (
    <div className="school-dashboard-page">
      <div className="school-dashboard-heading">
        <div><span className="school-kicker">SCHOOL MANAGEMENT SYSTEM</span><h1>Good morning, administrator.</h1><p>One focused view of your students, classes, and academic performance.</p></div>
        <div className="school-session-chip">Academic session<strong>{session?.name ?? '-'}</strong></div>
      </div>
      <div className="school-kpi-grid">
        <div className="school-kpi"><Users /><span>Total students</span><strong>{students.length}</strong><small>Across {new Set(students.map(student => student.class)).size} active classes</small></div>
        <div className="school-kpi"><GraduationCap /><span>Active teachers</span><strong>{state.teachers.length}</strong><small>School teaching staff</small></div>
        <div className="school-kpi"><ClipboardList /><span>Average result</span><strong>{average}%</strong><small>{results.length} marks recorded</small></div>
      </div>
      <div className="school-chart-grid">
        <section className="school-chart-panel"><div className="school-panel-heading"><div><span>STUDENT STATISTICS</span><h2>Students by class</h2></div><Link href="/school-portal/students">View students</Link></div><div className="school-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={classCounts} margin={{ top: 8, right: 12, left: -18, bottom: 24 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe5e7" /><XAxis dataKey="className" angle={-28} textAnchor="end" height={52} tick={{ fill: '#60747b', fontSize: 11 }} /><YAxis allowDecimals={false} tick={{ fill: '#60747b', fontSize: 11 }} /><Tooltip cursor={{ fill: '#edf4f5' }} /><Bar dataKey="students" name="Students" fill="#2f6f8f" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>{classCounts.length === 0 && <p className="school-empty-chart">Add school students to see class distribution.</p>}</section>
        <section className="school-chart-panel"><div className="school-panel-heading"><div><span>RESULT PERFORMANCE</span><h2>Academic outcomes</h2></div><Link href="/school-portal/results">Open results</Link></div><div className="school-performance-layout"><div className="school-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={performance} margin={{ top: 8, right: 12, left: -18, bottom: 24 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dbe5e7" /><XAxis dataKey="className" angle={-28} textAnchor="end" height={52} tick={{ fill: '#60747b', fontSize: 11 }} /><YAxis domain={[0, 100]} tick={{ fill: '#60747b', fontSize: 11 }} /><Tooltip formatter={(value: number) => [`${value}%`, 'Average']} /><Bar dataKey="average" name="Average" fill="#5f8f72" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div><div className="school-passfail"><strong>{average}%</strong><span>Overall average</span><ResponsiveContainer width="100%" height={125}><PieChart><Pie data={passFail} dataKey="value" innerRadius={30} outerRadius={46} paddingAngle={3}>{passFail.map((entry, index) => <Cell key={entry.name} fill={index === 0 ? '#5f8f72' : '#e1a15b'} />)}</Pie></PieChart></ResponsiveContainer><small>{passFail.map(item => `${item.name}: ${item.value}`).join(' · ') || 'No result records yet'}</small></div></div>{performance.length === 0 && <p className="school-empty-chart">Enter results to see class performance.</p>}</section>
      </div>
    </div>
  );
}
