import React, { useState } from 'react';
import { useApp } from '@/store';
import { Result, Student, MADRASA_CLASSES, SCHOOL_CLASSES } from '@/types';
import { downloadExcel } from '@/lib/excel';
import { printHTML, PRINT_STYLES, institutionHeader } from '@/lib/print';
import { toast } from 'sonner';
import { Plus, Printer, Edit, Trash2, Download, ChevronDown } from 'lucide-react';

const ALL_CLASSES = [...MADRASA_CLASSES, ...SCHOOL_CLASSES];

type ResultWithInfo = Result & { studentName: string; rollNo: string; className: string };
type FormState = Partial<Result> & { className?: string };
type BulkMark = { marks: number | ''; totalMarks: number | '' };

export default function Results() {
  const { state, dispatch, getViewSession } = useApp();
  const isUrdu = state.language === 'ur';
  const viewSession = getViewSession();

  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<ResultWithInfo | null>(null);
  const [bulkMarks, setBulkMarks] = useState<Record<string, BulkMark>>({});
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [profileForm, setProfileForm] = useState<Partial<Student>>({});
  const [formData, setFormData] = useState<FormState>({
    studentId: '', className: '', subject: '', marks: 0, totalMarks: 100, grade: '', examDate: '',
  });

  const getStudentInfo = (id: string) => state.students.find(s => s.id === id);

  const openStudentProfile = (studentId: string) => {
    const student = state.students.find(item => item.id === studentId);
    if (student) {
      setProfileStudent(student);
      setProfileForm({ ...student });
      setProfileEditOpen(false);
    }
  };

  const saveStudentProfile = () => {
    if (!profileStudent) return;
    if (!profileForm.name?.trim() || !profileForm.class || !profileForm.dob) {
      toast.error(isUrdu ? 'نام، جماعت اور تاریخ پیدائش ضروری ہیں' : 'Name, class, and date of birth are required');
      return;
    }
    const updatedStudent = { ...profileStudent, ...profileForm } as Student;
    dispatch({ type: 'UPDATE_STUDENT', payload: updatedStudent });
    setProfileStudent(updatedStudent);
    setProfileEditOpen(false);
    toast.success(isUrdu ? 'طالب علم کی معلومات اپڈیٹ ہو گئیں' : 'Student updated successfully');
  };

  const printStudentProfile = (student: Student) => {
    const sessionName = state.academicSessions.find(session => session.id === student.sessionId)?.name ?? '-';
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Student Profile</title>${PRINT_STYLES}</head><body>
      ${institutionHeader(sessionName)}
      <div class="section-title">Student Profile</div>
      <table><tbody>
        <tr><th>Name</th><td>${student.name}</td><th>Roll No</th><td>${student.rollNo || '-'}</td></tr>
        <tr><th>Father Name</th><td>${student.fatherName || '-'}</td><th>Date of Birth</th><td>${student.dob}</td></tr>
        <tr><th>Class</th><td>${student.class}</td><th>Section</th><td>${student.section || '-'}</td></tr>
        <tr><th>Department</th><td>${student.department === 'madrasa' ? 'Madrasa' : 'School'}</td><th>Phone</th><td>${student.phone || '-'}</td></tr>
        <tr><th>Status</th><td>${student.status}</td><th>CNIC / B-Form</th><td>${student.cnic || '-'}</td></tr>
      </tbody></table>
      <p class="footer-note">Printed on ${new Date().toLocaleDateString()} — Jamia Taleem-ul-Quran Lil-Banat</p>
    </body></html>`;
    printHTML(html, `Student_Profile_${student.name}`);
  };

  const deleteStudentFromProfile = () => {
    if (!profileStudent) return;
    dispatch({ type: 'DELETE_STUDENT', payload: profileStudent.id });
    setProfileStudent(null);
    toast.success(isUrdu ? 'طالب علم حذف ہو گیا' : 'Student deleted');
  };

  // Session-filtered results
  const sessionStudents = state.viewSessionId
    ? state.students.filter(s => s.sessionId === state.viewSessionId)
    : state.students;
  const sessionStudentIds = new Set(sessionStudents.map(s => s.id));

  const resultsWithStudentInfo: ResultWithInfo[] = state.results
    .filter(r => !state.viewSessionId || sessionStudentIds.has(r.studentId))
    .map(r => {
      const s = getStudentInfo(r.studentId);
      return { ...r, studentName: s?.name ?? 'Unknown', rollNo: s?.rollNo ?? '-', className: s?.class ?? (r.className ?? '-'), sessionId: r.sessionId ?? s?.sessionId };
    });

  const filteredResults = resultsWithStudentInfo.filter(r => {
    if (classFilter && r.className !== classFilter) return false;
    if (sectionFilter) {
      const student = state.students.find(s => s.id === r.studentId);
      return student?.section === sectionFilter;
    }
    return true;
  });

  const visibleStudents = sessionStudents.filter(student => {
    if (classFilter && student.class !== classFilter) return false;
    if (sectionFilter && student.section !== sectionFilter) return false;
    return true;
  });

  const groupedResults = visibleStudents.map(student => {
    const studentResults = filteredResults
      .filter(result => result.studentId === student.id)
      .sort((a, b) => a.subject.localeCompare(b.subject));
    return {
      studentId: student.id,
      studentName: student.name,
      rollNo: student.rollNo || '-',
      className: student.class,
      results: studentResults,
    };
  });

  const availableSections = classFilter
    ? [...new Set(sessionStudents.filter(s => s.class === classFilter).map(s => s.section).filter(Boolean))].sort()
    : [];

  const dialogStudents = formData.className
    ? sessionStudents.filter(s => s.class === formData.className)
    : sessionStudents;

  const selectedStudent = formData.studentId
    ? state.students.find(s => s.id === formData.studentId)
    : undefined;

  const selectedDepartment: 'madrasa' | 'school' = selectedStudent?.department
    ?? (formData.className && MADRASA_CLASSES.includes(formData.className as (typeof MADRASA_CLASSES)[number]) ? 'madrasa' : 'school');

  const selectedSessionId = selectedStudent?.sessionId ?? state.viewSessionId ?? state.activeSessionId ?? undefined;

  const subjectOptions = formData.className
    ? (
      state.subjectConfigs.find(c =>
        c.department === selectedDepartment
        && c.className === formData.className
        && c.sessionId === selectedSessionId
      )?.subjects
      ?? state.subjectConfigs.find(c =>
        c.department === selectedDepartment
        && c.className === formData.className
        && !c.sessionId
      )?.subjects
      ?? []
    )
    : [];

  const studentSubjectResults = formData.studentId
    ? resultsWithStudentInfo
      .filter(r => r.studentId === formData.studentId)
      .sort((a, b) => a.subject.localeCompare(b.subject))
    : [];

  const calculateGrade = (marks: number, total: number) => {
    if (!total || total <= 0) return 'N/A';
    const p = (marks / total) * 100;
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B+';
    if (p >= 60) return 'B';
    if (p >= 50) return 'C';
    if (p >= 40) return 'D';
    return 'F';
  };

  const safePct = (marks: number, total: number) => total > 0 ? ((marks / total) * 100).toFixed(1) : '0.0';

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'A') return '#1a7a45';
    if (grade === 'B+' || grade === 'B') return '#2980b9';
    if (grade === 'F') return '#c0392b';
    return '#e67e22';
  };

  const individualResultHTML = (r: ResultWithInfo) => {
    const studentResults = resultsWithStudentInfo
      .filter(result => result.studentId === r.studentId && result.sessionId === (state.viewSessionId ?? getStudentInfo(r.studentId)?.sessionId))
      .sort((a, b) => a.subject.localeCompare(b.subject));
    const obtained = studentResults.reduce((sum, result) => sum + result.marks, 0);
    const total = studentResults.reduce((sum, result) => sum + result.totalMarks, 0);
    const student = state.students.find(item => item.id === r.studentId);
    const percentage = total > 0 ? (obtained / total) * 100 : 0;

    return `
      <!DOCTYPE html><html dir="${isUrdu ? 'rtl' : 'ltr'}">
      <head><meta charset="utf-8"/><title>Student Result Card</title>${PRINT_STYLES}</head>
      <body>
        ${institutionHeader(viewSession?.name)}
        <div class="result-heading">
          <h2>${isUrdu ? 'مکمل نتیجہ کارڈ' : 'Complete Student Result Card'}</h2>
          <div class="result-meta"><strong>Class:</strong> ${r.className} &nbsp; | &nbsp; <strong>Section:</strong> ${student?.section || '-'} &nbsp; | &nbsp; <strong>Session:</strong> ${viewSession?.name || '-'}</div>
        </div>
        <div class="slip" style="width:100%;max-width:620px">
          <div class="slip-row"><span class="slip-label">${isUrdu ? 'نام:' : 'Student Name:'}</span><span class="slip-value">${r.studentName}</span></div>
          <div class="slip-row"><span class="slip-label">${isUrdu ? 'رول نمبر:' : 'Roll No:'}</span><span class="slip-value" style="font-family:monospace;font-weight:bold">${r.rollNo}</span></div>
          <table>
            <thead><tr><th>Subject</th><th>Obtained Marks</th><th>Total Marks</th><th>Percentage</th><th>Grade</th></tr></thead>
            <tbody>${studentResults.map(result => `<tr><td>${result.subject}</td><td>${result.marks}</td><td>${result.totalMarks}</td><td>${safePct(result.marks, result.totalMarks)}%</td><td style="font-weight:bold;color:${getGradeColor(result.grade)}">${result.grade}</td></tr>`).join('')}</tbody>
            <tfoot><tr><th>Total</th><th>${obtained}</th><th>${total}</th><th>${percentage.toFixed(2)}%</th><th>-</th></tr></tfoot>
          </table>
        </div>
        <p class="footer-note">Printed on ${new Date().toLocaleDateString()} — Jamia Taleem-ul-Quran Lil-Banat</p>
      </body></html>`;
  };

  const classResultHTML = () => {
    if (!classFilter) {
      toast.error(isUrdu ? 'پہلے جماعت منتخب کریں' : 'Select a class first');
      return;
    }

    const classStudents = sessionStudents.filter(s =>
      s.class === classFilter && (!sectionFilter || s.section === sectionFilter)
    );
    const classStudentIds = new Set(classStudents.map(student => student.id));
    const classResults = resultsWithStudentInfo.filter(result => classStudentIds.has(result.studentId));
    const classDepartment = classStudents[0]?.department;
    const configuredSubjects = state.subjectConfigs.find(config =>
      config.department === classDepartment
      && config.className === classFilter
      && config.sessionId === (viewSession?.id ?? state.activeSessionId)
    )?.subjects ?? state.subjectConfigs.find(config =>
      config.department === classDepartment
      && config.className === classFilter
      && !config.sessionId
    )?.subjects;
    const subjects = configuredSubjects ?? [...new Set(classResults.map(r => r.subject))].sort();
    if (classStudents.length === 0) {
      toast.error(isUrdu ? 'اس جماعت میں کوئی طالب علم نہیں' : 'No students found in this class');
      return;
    }
    const rows = classStudents.map(student => {
      const studentResults = classResults.filter(r => r.studentId === student.id);
      const obtained = studentResults.reduce((sum, r) => sum + r.marks, 0);
      const total = studentResults.reduce((sum, r) => sum + r.totalMarks, 0);
      return { student, studentResults, obtained, total, percentage: total ? (obtained / total) * 100 : 0 };
    }).sort((a, b) => b.percentage - a.percentage);
    const positions = rows.filter(row => row.total > 0).map(row => row.percentage).reduce<number[]>((all, percentage) => {
      if (!all.includes(percentage)) all.push(percentage);
      return all;
    }, []);
    const gradeCounts = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'].map(grade => ({
      grade,
      count: rows.filter(row => row.total > 0 && calculateGrade(row.obtained, row.total) === grade).length,
    }));
    const totalObtained = rows.reduce((sum, row) => sum + row.obtained, 0);
    const totalMarks = rows.reduce((sum, row) => sum + row.total, 0);
    const overallPercentage = totalMarks ? ((totalObtained / totalMarks) * 100).toFixed(2) : '-';
    const finalAverage = rows.filter(row => row.total > 0).length
      ? (rows.filter(row => row.total > 0).reduce((sum, row) => sum + row.percentage, 0) / rows.filter(row => row.total > 0).length).toFixed(2)
      : '-';
    const sessionName = viewSession?.name ?? state.academicSessions.find(s => s.id === state.activeSessionId)?.name ?? '-';
    const sectionLabel = sectionFilter || 'All Sections';
    const subjectCell = (row: typeof rows[number], subject: string) => {
      const result = row.studentResults.find(item => item.subject === subject);
      return result ? `${result.marks}` : '-';
    };

    const html = `
      <!DOCTYPE html><html><head><meta charset="utf-8"/><title>Overall Class Result</title>${PRINT_STYLES}</head>
      <body>
        ${institutionHeader(sessionName)}
        <div class="result-heading">
          <h2>Overall Class Result</h2>
          <div class="result-meta"><strong>Class:</strong> ${classFilter} &nbsp; | &nbsp; <strong>Section:</strong> ${sectionLabel} &nbsp; | &nbsp; <strong>Session:</strong> ${sessionName}</div>
        </div>
        <table class="class-result-table">
          <thead><tr><th>#</th><th>Exam Roll</th><th>Student Name</th>${subjects.map(subject => `<th>${subject}<br><small>Marks</small></th>`).join('')}<th>Obt. Marks</th><th>Total</th><th>Percentage</th><th>Position</th><th>Grade</th></tr></thead>
          <tbody>
            ${rows.map((row, index) => {
              const position = row.total > 0 ? positions.indexOf(row.percentage) + 1 : 0;
              const finalGrade = row.total > 0 ? calculateGrade(row.obtained, row.total) : '-';
              const isFail = row.total > 0 && row.percentage < 40;
              const positionLabel = position ? `${position}${position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th'}` : '-';
              const percentageLabel = row.total > 0 ? `${row.percentage.toFixed(2)}%` : '-';
              return `<tr><td>${index + 1}</td><td>${row.student.rollNo || '-'}</td><td>${row.student.name}</td>${subjects.map(subject => `<td>${subjectCell(row, subject)}</td>`).join('')}<td><strong>${row.total > 0 ? row.obtained : '-'}</strong></td><td>${row.total > 0 ? row.total : '-'}</td><td><strong>${percentageLabel}</strong></td><td>${positionLabel}</td><td class="${isFail ? 'fail-grade' : ''}">${isFail ? 'Fail' : finalGrade}</td></tr>`;
            }).join('')}
          </tbody>
        </table>
        <div class="summary-title">Total Result Record</div>
        <table class="summary-table"><thead><tr><th>Total</th>${gradeCounts.map(item => `<th>${item.grade}</th>`).join('')}<th>Percentage</th><th>Final Average</th></tr></thead><tbody><tr><td>${rows.length}</td>${gradeCounts.map(item => `<td>${item.count}</td>`).join('')}<td>${overallPercentage}${overallPercentage === '-' ? '' : '%'}</td><td>${finalAverage}${finalAverage === '-' ? '' : '%'}</td></tr></tbody></table>
        <p class="footer-note">Printed on ${new Date().toLocaleDateString()} — Jamia Taleem-ul-Quran Lil-Banat</p>
      </body></html>`;
    printHTML(html, 'Overall_Class_Result');
  };

  const handleSave = () => {
    if (!formData.studentId) { toast.error('Please select a student'); return; }

    if (!editingResult) {
      if (subjectOptions.length === 0) {
        toast.error(isUrdu ? 'اس جماعت کے مضامین ترتیب نہیں دیے گئے' : 'No subjects are configured for this class');
        return;
      }

      const saveSessionId = selectedSessionId;
      const existingResults = state.results.filter(r =>
        r.studentId === formData.studentId && (r.sessionId ?? selectedStudent?.sessionId) === saveSessionId
      );
      const resultsToSave = subjectOptions.map(subject => {
        const existing = existingResults.find(r => r.subject === subject);
        const entered = bulkMarks[subject];
        const marks = typeof entered?.marks === 'number' ? entered.marks : existing?.marks ?? 0;
        const totalMarks = typeof entered?.totalMarks === 'number' ? entered.totalMarks : existing?.totalMarks ?? 100;
        if (!Number.isFinite(marks) || !Number.isFinite(totalMarks) || totalMarks <= 0 || marks < 0 || marks > totalMarks) {
          return null;
        }
        const result: Result = {
          id: existing?.id ?? `res-${Date.now()}-${subject}`,
          studentId: formData.studentId as string,
          className: formData.className,
          subject,
          marks,
          totalMarks,
          grade: calculateGrade(marks, totalMarks),
          examDate: formData.examDate || new Date().toISOString().slice(0, 10),
          sessionId: saveSessionId,
        };
        return result;
      }).filter((result): result is Result => result !== null);
      if (resultsToSave.length !== subjectOptions.length) {
        toast.error(isUrdu ? 'حاصل نمبر کل نمبروں سے زیادہ نہیں ہو سکتے' : 'Marks must be between 0 and the total marks for every subject');
        return;
      }
      dispatch({ type: 'SAVE_RESULTS', payload: resultsToSave });
      toast.success(isUrdu ? 'تمام مضامین کے نتائج محفوظ ہو گئے' : `All ${subjectOptions.length} subject results saved`);
      setDialogOpen(false);
      return;
    }

    if (!formData.subject?.trim()) { toast.error('Subject is required'); return; }
    const marks = Number(formData.marks);
    const totalMarks = Number(formData.totalMarks);
    if (!Number.isFinite(marks) || !Number.isFinite(totalMarks) || totalMarks <= 0 || marks < 0 || marks > totalMarks) {
      toast.error(isUrdu ? 'نمبر درست درج کریں' : 'Marks must be between 0 and the total marks');
      return;
    }

    const duplicate = state.results.find(r =>
      r.studentId === formData.studentId
      && r.subject.trim().toLowerCase() === formData.subject?.trim().toLowerCase()
      && r.id !== editingResult?.id
    );
    if (duplicate) {
      toast.error(isUrdu ? 'اس مضمون کے لیے نمبر پہلے سے موجود ہیں' : 'Marks for this subject already exist for the selected student');
      return;
    }

    const grade = calculateGrade(marks, totalMarks);

    if (editingResult) {
      dispatch({ type: 'UPDATE_RESULT', payload: { ...editingResult, ...formData, marks, totalMarks, grade, sessionId: editingResult.sessionId ?? selectedSessionId } as Result });
      toast.success(isUrdu ? 'نتیجہ اپڈیٹ ہوا' : 'Result updated');
    } else {
      dispatch({ type: 'ADD_RESULT', payload: { id: `res-${Date.now()}`, ...formData, grade } as Result });
      toast.success(isUrdu ? 'نتیجہ شامل ہو گیا' : 'Result added');
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#E4572E]">{isUrdu ? 'نتائج' : 'Results'}</h2>
          {viewSession && (
            <p className="text-sm text-[#E4572E] opacity-70 mt-0.5 font-medium">
              {isUrdu ? `تعلیمی سال: ${viewSession.name}` : `Session: ${viewSession.name}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={classResultHTML}
            className="neu-btn px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
          >
            <Printer className="w-4 h-4 text-[#1C2E6B]" />
            {isUrdu ? 'کلاس رزلٹ پرنٹ' : 'Print Class Result'}
          </button>
          <button
            onClick={() => downloadExcel(
              filteredResults.map(r => ({
                'Roll No': r.rollNo, Student: r.studentName, Class: r.className,
                Subject: r.subject, Marks: r.marks, Total: r.totalMarks,
                Percentage: safePct(r.marks, r.totalMarks) + '%', Grade: r.grade,
              })),
              'Results'
            )}
            className="neu-btn px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#E4572E]" />
            {isUrdu ? 'ایکسل' : 'Excel'}
          </button>
          <button
            onClick={() => { setEditingResult(null); setBulkMarks({}); setFormData({ studentId: '', className: '', subject: '', marks: 0, totalMarks: 100, grade: '', examDate: '' }); setDialogOpen(true); }}
            className="neu-btn-primary px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isUrdu ? 'نیا نتیجہ' : 'Add Result'}
          </button>
        </div>
      </div>

      {/* Class filter */}
      <div className="neu-inset-sm rounded-xl px-3 py-1 w-full sm:max-w-xs">
        <select className="w-full bg-transparent border-none outline-none h-9 text-sm cursor-pointer" value={classFilter} onChange={e => setClassFilter(e.target.value)}>
          <option value="">{isUrdu ? 'تمام جماعتیں' : 'All Classes'}</option>
          {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {classFilter && availableSections.length > 0 && (
        <div className="neu-inset-sm rounded-xl px-3 py-1 w-full sm:max-w-xs">
          <select className="w-full bg-transparent border-none outline-none h-9 text-sm cursor-pointer" value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}>
            <option value="">{isUrdu ? 'تمام سیکشنز' : 'All Sections'}</option>
            {availableSections.map(section => <option key={section} value={section}>{section}</option>)}
          </select>
        </div>
      )}

      {/* Table */}
      <div className="neu-raised rounded-2xl overflow-hidden">
        <div className="neu-inset rounded-2xl m-3 overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[var(--neu-dark)]/20">
                <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs">{isUrdu ? 'طالبہ' : 'Student'}</th>
                <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs">{isUrdu ? 'مضامین' : 'Subjects'}</th>
                <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs">{isUrdu ? 'مجموعی فیصد' : 'Overall'}</th>
                <th className="px-5 py-4 text-right font-semibold opacity-60 text-xs">{isUrdu ? 'اقدامات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {groupedResults.map(group => {
                const obtained = group.results.reduce((sum, result) => sum + result.marks, 0);
                const total = group.results.reduce((sum, result) => sum + result.totalMarks, 0);
                const isExpanded = expandedStudentId === group.studentId;
                return (
                  <React.Fragment key={group.studentId}>
                    <tr onClick={() => openStudentProfile(group.studentId)} className="border-b border-[var(--neu-dark)]/10 hover:bg-[rgba(228,87,46,0.03)] transition-colors cursor-pointer">
                      <td className="px-5 py-4">
                        <button type="button" onClick={event => { event.stopPropagation(); openStudentProfile(group.studentId); }} className="font-medium text-left text-[#1C2E6B] hover:text-[#E4572E] hover:underline">{group.studentName}</button>
                        <div className="text-xs opacity-50 font-mono">{group.rollNo} · {group.className}</div>
                      </td>
                      <td className="px-5 py-4 opacity-70">{group.results.length ? `${group.results.length} ${isUrdu ? 'مضامین' : group.results.length === 1 ? 'subject' : 'subjects'}` : <span className="opacity-50">{isUrdu ? 'ابھی کوئی نتیجہ نہیں' : 'No results yet'}</span>}</td>
                      <td className="px-5 py-4 font-semibold">{group.results.length ? `${safePct(obtained, total)}%` : '-'}</td>
                      <td className="px-5 py-4 text-right"><button type="button" aria-label={isExpanded ? 'Collapse subjects' : 'Expand subjects'} onClick={event => { event.stopPropagation(); setExpandedStudentId(isExpanded ? null : group.studentId); }} className="neu-btn w-8 h-8 rounded-lg inline-flex items-center justify-center"><ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></button></td>
                    </tr>
                    {isExpanded && (
                      <tr className="border-b border-[var(--neu-dark)]/10">
                        <td colSpan={4} className="px-4 py-3 bg-[rgba(228,87,46,0.025)]">
                          <div className="rounded-xl neu-inset-sm overflow-hidden">
                            <table className="w-full text-sm">
                              <thead><tr className="border-b border-[var(--neu-dark)]/15"><th className="px-4 py-3 text-left text-xs opacity-60">{isUrdu ? 'مضمون' : 'Subject'}</th><th className="px-4 py-3 text-left text-xs opacity-60">{isUrdu ? 'نمبر' : 'Marks'}</th><th className="px-4 py-3 text-left text-xs opacity-60">{isUrdu ? 'گریڈ' : 'Grade'}</th><th className="px-4 py-3 text-right text-xs opacity-60">{isUrdu ? 'اقدامات' : 'Actions'}</th></tr></thead>
                              <tbody>
                                {group.results.length > 0 ? group.results.map(r => (
                                  <tr key={r.id} className="border-b border-[var(--neu-dark)]/10 last:border-0">
                                    <td className="px-4 py-3 opacity-80">{r.subject}</td>
                                    <td className="px-4 py-3"><span className="font-bold">{r.marks}</span><span className="opacity-50 text-xs">/{r.totalMarks}</span><span className="text-xs opacity-60 ml-1">({safePct(r.marks, r.totalMarks)}%)</span></td>
                                    <td className="px-4 py-3"><span className="font-bold text-sm" style={{ color: getGradeColor(r.grade) }}>{r.grade}</span></td>
                                    <td className="px-4 py-3"><div className="flex gap-2 justify-end">
                                      <button onClick={() => printHTML(individualResultHTML(r), 'Result_Card')} className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#1C2E6B]"><Printer className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => { setEditingResult(r); setBulkMarks({}); setFormData({ ...r, className: r.className }); setDialogOpen(true); }} className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#E4572E]"><Edit className="w-3.5 h-3.5" /></button>
                                      <button onClick={() => { dispatch({ type: 'DELETE_RESULT', payload: r.id }); toast.success('Deleted'); }} className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div></td>
                                  </tr>
                                )) : (
                                  <tr>
                                    <td colSpan={4} className="px-4 py-4 text-center text-sm opacity-60">
                                      {isUrdu ? 'ابھی کوئی مضمون درج نہیں ہوا' : 'No subjects entered yet'}
                                      <button onClick={() => { setEditingResult(null); setBulkMarks({}); setFormData({ studentId: group.studentId, className: group.className, subject: '', marks: 0, totalMarks: 100, grade: '', examDate: '' }); setDialogOpen(true); }} className="neu-btn ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#E4572E] inline-flex items-center gap-1">
                                        <Plus className="w-3 h-3" /> {isUrdu ? 'نمبر درج کریں' : 'Enter marks'}
                                      </button>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          {groupedResults.length === 0 && <div className="p-8 text-center opacity-40 text-sm">{isUrdu ? 'کوئی نتیجہ نہیں' : 'No results found'}</div>}
        </div>
      </div>

      {profileStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setProfileStudent(null)} />
          <div className="relative z-10 neu-raised rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold">{profileEditOpen ? (isUrdu ? 'ترمیم طالب علم' : 'Edit Student') : profileStudent.name}</h3>
                {!profileEditOpen && <p className="text-sm opacity-60 mt-1">{profileStudent.rollNo || '-'} · {profileStudent.class}</p>}
              </div>
              <button type="button" onClick={() => setProfileStudent(null)} className="neu-btn w-8 h-8 rounded-lg">×</button>
            </div>
            {profileEditOpen ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="text-sm font-semibold">Name<input className="neu-input w-full rounded-xl px-3 py-2 mt-1 font-normal" value={profileForm.name || ''} onChange={event => setProfileForm({ ...profileForm, name: event.target.value })} /></label>
                <label className="text-sm font-semibold">Father Name<input className="neu-input w-full rounded-xl px-3 py-2 mt-1 font-normal" value={profileForm.fatherName || ''} onChange={event => setProfileForm({ ...profileForm, fatherName: event.target.value })} /></label>
                <label className="text-sm font-semibold">Date of Birth *<input type="date" required className="neu-input w-full rounded-xl px-3 py-2 mt-1 font-normal" value={profileForm.dob || ''} onChange={event => setProfileForm({ ...profileForm, dob: event.target.value })} /></label>
                <label className="text-sm font-semibold">Class *<select className="neu-input w-full rounded-xl px-3 py-2 mt-1 font-normal" value={profileForm.class || ''} onChange={event => setProfileForm({ ...profileForm, class: event.target.value })}><option value="">Select class</option>{ALL_CLASSES.map(className => <option key={className} value={className}>{className}</option>)}</select></label>
                <label className="text-sm font-semibold">Section<input className="neu-input w-full rounded-xl px-3 py-2 mt-1 font-normal" value={profileForm.section || ''} onChange={event => setProfileForm({ ...profileForm, section: event.target.value })} /></label>
                <label className="text-sm font-semibold">Phone<input className="neu-input w-full rounded-xl px-3 py-2 mt-1 font-normal" value={profileForm.phone || ''} onChange={event => setProfileForm({ ...profileForm, phone: event.target.value })} /></label>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ['Father Name', profileStudent.fatherName || '-'], ['Date of Birth', profileStudent.dob || '-'],
                  ['Class', profileStudent.class], ['Section', profileStudent.section || '-'],
                  ['Department', profileStudent.department === 'madrasa' ? 'Madrasa' : 'School'], ['Phone', profileStudent.phone || '-'],
                  ['CNIC / B-Form', profileStudent.cnic || '-'], ['Status', profileStudent.status],
                ].map(([label, value]) => <div key={label} className="neu-inset-sm rounded-xl p-3"><div className="text-xs opacity-55 mb-1">{label}</div><div className="font-medium break-words">{value}</div></div>)}
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2 mt-6">
              {profileEditOpen ? <>
                <button type="button" className="neu-btn px-4 py-2 rounded-xl" onClick={() => setProfileEditOpen(false)}>Cancel</button>
                <button type="button" className="neu-btn-primary px-4 py-2 rounded-xl text-white font-semibold" onClick={saveStudentProfile}>Save</button>
              </> : <>
                <button type="button" className="neu-btn px-4 py-2 rounded-xl text-[#1C2E6B]" onClick={() => printStudentProfile(profileStudent)}>Print Profile</button>
                <button type="button" className="neu-btn px-4 py-2 rounded-xl text-[#E4572E]" onClick={() => setProfileEditOpen(true)}>Edit Student</button>
                <button type="button" className="neu-btn px-4 py-2 rounded-xl text-red-500" onClick={deleteStudentFromProfile}>Delete</button>
              </>}
            </div>
          </div>
        </div>
      )}

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
          <div className="relative z-10 neu-raised rounded-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">{editingResult ? (isUrdu ? 'ترمیم' : 'Edit Result') : (isUrdu ? 'نیا نتیجہ' : 'Add Result')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'جماعت' : 'Class'}</label>
                <div className="neu-inset-sm rounded-xl px-3 py-1">
                  <select className="w-full bg-transparent border-none outline-none h-9 text-sm cursor-pointer" value={formData.className || ''} onChange={e => setFormData({ ...formData, className: e.target.value, studentId: '' })}>
                    <option value="">{isUrdu ? 'جماعت منتخب کریں' : 'Select class...'}</option>
                    {ALL_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'طالبہ *' : 'Student *'}</label>
                <div className="neu-inset-sm rounded-xl px-3 py-1">
                  <select className="w-full bg-transparent border-none outline-none h-9 text-sm cursor-pointer" value={formData.studentId || ''} onChange={e => setFormData({ ...formData, studentId: e.target.value })}>
                    <option value="">{isUrdu ? 'طالبہ منتخب کریں' : 'Select student...'}</option>
                    {dialogStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.rollNo || '-'})</option>)}
                  </select>
                </div>
              </div>
              {!editingResult && formData.studentId && subjectOptions.length > 0 ? (
                <div className="neu-inset-sm rounded-xl p-3 space-y-3">
                  <div>
                    <div className="text-sm font-semibold">{isUrdu ? 'تمام مضامین کے نمبر' : 'Enter marks for all subjects'}</div>
                    <div className="text-xs opacity-60 mt-1">{isUrdu ? 'ہر مضمون کے حاصل کردہ اور کل نمبر درج کریں' : 'Enter obtained and total marks for each subject.'}</div>
                  </div>
                  {subjectOptions.map(subject => {
                    const existing = studentSubjectResults.find(result => result.subject === subject);
                    const mark = bulkMarks[subject]?.marks ?? existing?.marks ?? '';
                    const total = bulkMarks[subject]?.totalMarks ?? existing?.totalMarks ?? 100;
                    return (
                      <div key={subject} className="grid grid-cols-[minmax(0,1fr)_5rem_5rem] gap-2 items-center">
                        <label className="text-sm font-medium truncate" title={subject}>{subject}</label>
                        <input type="number" min="0" className="neu-input w-full rounded-lg px-2 py-2 text-sm" value={mark} aria-label={`${subject} obtained marks`} onChange={e => setBulkMarks({ ...bulkMarks, [subject]: { marks: e.target.value === '' ? '' : Number(e.target.value), totalMarks: total } })} />
                        <input type="number" min="1" className="neu-input w-full rounded-lg px-2 py-2 text-sm" value={total} aria-label={`${subject} total marks`} onChange={e => setBulkMarks({ ...bulkMarks, [subject]: { marks: mark, totalMarks: e.target.value === '' ? '' : Number(e.target.value) } })} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'مضمون *' : 'Subject *'}</label>
                  <div className="neu-inset-sm rounded-xl px-3 py-1">
                    <select className="w-full bg-transparent border-none outline-none h-9 text-sm cursor-pointer" value={formData.subject || ''} onChange={e => setFormData({ ...formData, subject: e.target.value })}>
                      <option value="">{isUrdu ? 'مضمون منتخب کریں...' : 'Select subject...'}</option>
                      {subjectOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}
              {formData.studentId && (
                <div className="neu-inset-sm rounded-xl p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
                    {isUrdu ? 'منتخب طالبہ کے مضامین' : 'Subject-wise marks for selected student'}
                  </div>
                  {studentSubjectResults.length > 0 ? (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {studentSubjectResults.map(sr => (
                        <div key={sr.id} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{sr.subject}</span>
                          <span className="font-mono opacity-70">{sr.marks}/{sr.totalMarks}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs opacity-50">
                      {isUrdu ? 'ابھی کوئی مضمون درج نہیں ہوا' : 'No subjects entered yet'}
                    </div>
                  )}
                </div>
              )}
              {editingResult && <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'حاصل نمبر' : 'Obtained Marks'}</label>
                  <input type="number" className="neu-input w-full rounded-xl px-4 py-2.5 h-11" value={formData.marks ?? ''} onChange={e => setFormData({ ...formData, marks: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'کل نمبر' : 'Total Marks'}</label>
                  <input type="number" className="neu-input w-full rounded-xl px-4 py-2.5 h-11" value={formData.totalMarks ?? ''} onChange={e => setFormData({ ...formData, totalMarks: Number(e.target.value) })} />
                </div>
              </div>}
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'امتحان کی تاریخ' : 'Exam Date'}</label>
                <div className="neu-inset-sm rounded-xl px-4 py-2.5 h-11 flex items-center">
                  <input type="date" className="w-full bg-transparent border-none outline-none text-sm" value={formData.examDate || ''} onChange={e => setFormData({ ...formData, examDate: e.target.value })} />
                </div>
              </div>
              {editingResult && formData.marks !== undefined && formData.totalMarks && (
                <div className="neu-inset-sm rounded-xl p-3 flex items-center justify-between text-sm">
                  <span className="opacity-60">{isUrdu ? 'خودکار گریڈ:' : 'Auto Grade:'}</span>
                  <span className="font-bold" style={{ color: getGradeColor(calculateGrade(formData.marks, formData.totalMarks)) }}>
                    {calculateGrade(formData.marks, formData.totalMarks)} ({safePct(formData.marks ?? 0, formData.totalMarks ?? 100)}%)
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button className="neu-btn px-5 py-2.5 rounded-xl text-sm font-medium" onClick={() => setDialogOpen(false)}>{isUrdu ? 'منسوخ' : 'Cancel'}</button>
              <button className="neu-btn-primary px-5 py-2.5 rounded-xl text-white text-sm font-semibold" onClick={handleSave}>{isUrdu ? 'محفوظ کریں' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
