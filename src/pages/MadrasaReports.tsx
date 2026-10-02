import React from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { useApp } from '@/store';
import { downloadExcel } from '@/lib/excel';
import { institutionHeader, printHTML, PRINT_STYLES } from '@/lib/print';

export default function MadrasaReports() {
  const { state } = useApp();
  const students = state.students.filter(student => student.department === 'madrasa');
  const teachers = state.madrasaTeachers;
  const printStudents = () => printHTML(`<!DOCTYPE html><html lang="ur" dir="rtl"><head><meta charset="utf-8"><title>طلبہ رپورٹ</title>${PRINT_STYLES}</head><body class="rtl">${institutionHeader(undefined, 'ur')}<div class="section-title">مدرسہ طلبہ رپورٹ</div><table><thead><tr><th>نمبر</th><th>نام</th><th>رول نمبر</th><th>جماعت</th><th>والد کا نام</th><th>حالت</th></tr></thead><tbody>${students.map((student, index) => `<tr><td>${index + 1}</td><td>${student.name}</td><td>${student.rollNo || '-'}</td><td>${student.class}</td><td>${student.fatherName || '-'}</td><td>${student.status}</td></tr>`).join('')}</tbody></table></body></html>`, 'Madrasa_Students');
  const exportStudents = () => downloadExcel(students.map(student => ({ 'نام': student.name, 'رول نمبر': student.rollNo, 'جماعت': student.class, 'والد کا نام': student.fatherName, 'فون': student.phone, 'حالت': student.status })), 'Madrasa_Students', 'طلبہ');
  const printTeachers = () => printHTML(`<!DOCTYPE html><html lang="ur" dir="rtl"><head><meta charset="utf-8"><title>اساتذہ رپورٹ</title>${PRINT_STYLES}</head><body class="rtl">${institutionHeader(undefined, 'ur')}<div class="section-title">مدرسہ اساتذہ رپورٹ</div><table><thead><tr><th>نام</th><th>شناختی نمبر</th><th>مضمون</th><th>جماعتیں</th><th>فون</th></tr></thead><tbody>${teachers.map(teacher => `<tr><td>${teacher.name}</td><td>${teacher.employeeId || teacher.id}</td><td>${teacher.subject}</td><td>${teacher.assignedClasses?.join('، ') || '-'}</td><td>${teacher.phone || '-'}</td></tr>`).join('')}</tbody></table></body></html>`, 'Madrasa_Teachers');
  return <div className="madrasa-module-page urdu-text" dir="rtl"><div className="madrasa-module-heading"><div><span className="madrasa-kicker">رپورٹس</span><h1>مدرسہ رپورٹس</h1><p>طلبہ، اساتذہ اور عطیات کی منظم رپورٹس تیار کریں۔</p></div></div><div className="madrasa-report-grid"><div><FileText /><h2>طلبہ رپورٹ</h2><p>{students.length} طلبہ</p><div><button className="madrasa-secondary-button" onClick={printStudents}><Printer className="w-4 h-4" /> پرنٹ / پی ڈی ایف</button><button className="madrasa-secondary-button" onClick={exportStudents}><Download className="w-4 h-4" /> ایکسل</button></div></div><div><FileText /><h2>اساتذہ رپورٹ</h2><p>{teachers.length} اساتذہ</p><button className="madrasa-secondary-button" onClick={printTeachers}><Printer className="w-4 h-4" /> پرنٹ / پی ڈی ایف</button></div></div></div>;
}
