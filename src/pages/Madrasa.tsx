import React, { useState } from 'react';
import { useApp } from '@/store';
import { MADRASA_CLASSES } from '@/types';
import { Users, GraduationCap, BookOpen, Award } from 'lucide-react';

export default function Madrasa() {
  const { state, t } = useApp();
  const isUrdu = state.language === 'ur';

  const madrasaStudents = state.students.filter(s => s.department === 'madrasa');
  const activeStudents = madrasaStudents.filter(s => s.status === 'active');
  const graduatedStudents = madrasaStudents.filter(s => s.status === 'graduated');

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
      </div>

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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MADRASA_CLASSES.map(cls => {
          const studentsInClass = madrasaStudents.filter(s => s.class === cls);
          return (
            <div key={cls} className="neu-raised rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 bottom-0 w-1 bg-[#E4572E] left-0" />
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl urdu-text" dir="rtl">{cls}</h3>
                <span className="neu-inset-sm px-3 py-1 rounded-full text-xs font-bold text-[#E4572E]">
                  {studentsInClass.length} {isUrdu ? 'طالبات' : 'Students'}
                </span>
              </div>
              
              <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-1">
                {studentsInClass.length > 0 ? (
                  studentsInClass.map(s => (
                    <div key={s.id} className="flex justify-between items-center text-sm p-2 rounded-xl hover:bg-[rgba(228,87,46,0.05)] transition-colors">
                      <span className="font-medium">{s.name}</span>
                      <span className="opacity-60 font-mono text-xs">{s.rollNo}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center opacity-50 text-sm py-4">{isUrdu ? 'کوئی طالبہ داخل نہیں' : 'No students enrolled'}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="neu-raised rounded-2xl p-6">
        <h3 className="font-bold text-lg mb-5">{isUrdu ? 'مدرسہ کی تمام طالبات' : 'All Madrasa Students'}</h3>
        <div className="neu-inset rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--neu-dark)]/20">
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Roll No</th>
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Class</th>
                  <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {madrasaStudents.map(s => (
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
                  </tr>
                ))}
              </tbody>
            </table>
            {madrasaStudents.length === 0 && (
              <div className="p-8 text-center opacity-50">{isUrdu ? 'کوئی طالبہ نہیں ملی' : 'No students found.'}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
