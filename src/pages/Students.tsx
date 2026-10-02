import React, { useState } from 'react';
import { useApp } from '@/store';
import { Student, MADRASA_CLASSES, SCHOOL_CLASSES, SCHOOL_SECTIONS } from '@/types';
import { downloadExcel } from '@/lib/excel';
import { printHTML, PRINT_STYLES, institutionHeader } from '@/lib/print';
import { toast } from 'sonner';
import { Plus, Search, Edit, Printer, Trash2, Download, Wand2, IdCard, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatAdminDate, isAdminDate, normalizeAdminDate } from '@/lib/adminDate';

const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
const PHONE_REGEX = /^\d{11}$/;

export default function Students({ department }: { department?: 'school' | 'madrasa' } = {}) {
  const { state, dispatch, t, autoAssignRollNo, getActiveSession, getViewSession } = useApp();
  const isUrdu = state.language === 'ur';
  const activeSession = getActiveSession();
  const viewSession = getViewSession();

  const [activeTab, setActiveTab] = useState<'All' | 'Madrasa' | 'School'>(department === 'madrasa' ? 'Madrasa' : department === 'school' ? 'School' : 'All');
  const [search, setSearch] = useState('');
  const [reportClass, setReportClass] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [errors, setErrors] = useState<{ dob?: string; cnic?: string; phone?: string; rollNo?: string }>({});

  const blankForm = (): Partial<Student> => ({
    name: '', fatherName: '', dob: '', rollNo: '', cnic: '', phone: '',
    address: '',
    class: '', section: '', department: department ?? 'school', status: 'active',
    sessionId: activeSession?.id ?? undefined,
  });

  const [formData, setFormData] = useState<Partial<Student>>(blankForm());

  // Session-aware student list
  const sessionStudents = state.viewSessionId
    ? state.students.filter(s => s.sessionId === state.viewSessionId)
    : state.students;

  const filteredStudents = sessionStudents.filter(s => {
    if (department && s.department !== department) return false;
    if (!department && activeTab === 'Madrasa' && s.department !== 'madrasa') return false;
    if (!department && activeTab === 'School' && s.department !== 'school') return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.rollNo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ ...student, dob: formatAdminDate(student.dob) });
    setErrors({});
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingStudent(null);
    setFormData(blankForm());
    setErrors({});
    setDialogOpen(true);
  };

  const handleDepartmentChange = (dept: 'school' | 'madrasa') => {
    setFormData({ ...formData, department: dept, class: '', rollNo: '' });
  };

  const handleClassChange = (cls: string) => {
    setFormData({ ...formData, class: cls, rollNo: '' });
  };

  const handleAutoRollNo = () => {
    if (!formData.class) {
      toast.error(isUrdu ? 'پہلے جماعت منتخب کریں' : 'Please select a class first');
      return;
    }
    const assigned = autoAssignRollNo((department ?? formData.department ?? 'school') as 'school' | 'madrasa', formData.class);
    if (!assigned) {
      toast.error(isUrdu ? 'اس جماعت کے لیے رول نمبر رینج ترتیب نہیں دی گئی یا ختم ہو گئی' : 'No roll-number range is configured for this class, or the range is exhausted');
      return;
    }
    setFormData({ ...formData, rollNo: assigned });
    toast.success(isUrdu ? `رول نمبر ${assigned} تفویض ہو گیا` : `Roll number ${assigned} assigned`);
  };

  const handleCnicChange = (val: string) => {
    let v = val.replace(/[^0-9-]/g, '');
    const digits = v.replace(/-/g, '');
    if (digits.length <= 5) v = digits;
    else if (digits.length <= 12) v = `${digits.slice(0, 5)}-${digits.slice(5)}`;
    else v = `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
    setFormData({ ...formData, cnic: v });
    setErrors({ ...errors, cnic: CNIC_REGEX.test(v) || v === '' ? undefined : 'Format: XXXXX-XXXXXXX-X' });
  };

  const handlePhoneChange = (val: string) => {
    const v = val.replace(/\D/g, '').slice(0, 11);
    setFormData({ ...formData, phone: v });
    setErrors({ ...errors, phone: PHONE_REGEX.test(v) || v === '' ? undefined : '11-digit phone number required' });
  };

  const validate = () => {
    const e: typeof errors = {};
    const selectedDepartment = (department ?? formData.department ?? 'school') as 'school' | 'madrasa';
    const range = state.rollNumberRanges.find(item => item.department === selectedDepartment && item.className === formData.class);
    if (!formData.dob) e.dob = isUrdu ? 'تاریخ پیدائش ضروری ہے' : 'Date of birth is required';
    if (formData.cnic && !CNIC_REGEX.test(formData.cnic)) e.cnic = 'Format: XXXXX-XXXXXXX-X';
    if (formData.phone && !PHONE_REGEX.test(formData.phone)) e.phone = '11-digit phone required';
    if (selectedDepartment === 'school' && !range) {
      e.rollNo = 'Configure a roll-number range for this class before admitting a student';
    } else if (selectedDepartment === 'school' && !formData.rollNo) {
      e.rollNo = 'Roll number is required for School students';
    }
    if (formData.rollNo) {
      const numericRollNo = Number(formData.rollNo);
      if (range && (!Number.isInteger(numericRollNo) || numericRollNo < range.rangeStart || numericRollNo > range.rangeEnd)) {
        e.rollNo = `Roll number must be between ${range.rangeStart} and ${range.rangeEnd} for ${formData.class}`;
      }
      const dup = state.students.find(s =>
        s.rollNo === formData.rollNo
        && s.department === selectedDepartment
        && s.class === formData.class
        && s.id !== editingStudent?.id
      );
      if (dup) e.rollNo = isUrdu ? 'یہ رول نمبر پہلے سے موجود ہے' : 'This roll number is already in use';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!formData.name?.trim()) { toast.error('Name is required'); return; }
    if (!formData.class) { toast.error('Class is required'); return; }
    if (!isAdminDate(formData.dob ?? '')) {
      setErrors({ ...errors, dob: isUrdu ? 'درمیانی تاریخ DD/MM/YYYY میں درج کریں' : 'Use the format DD/MM/YYYY' });
      return;
    }
    if (!validate()) return;

    if (editingStudent) {
      dispatch({ type: 'UPDATE_STUDENT', payload: { ...editingStudent, ...formData, dob: normalizeAdminDate(formData.dob ?? '') } as Student });
      toast.success(isUrdu ? 'طالبہ کی معلومات اپڈیٹ ہوئیں' : 'Student updated successfully');
    } else {
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        name: formData.name ?? '',
        fatherName: formData.fatherName ?? '',
        dob: normalizeAdminDate(formData.dob ?? ''),
        rollNo: formData.rollNo ?? '',
        cnic: formData.cnic ?? '',
        phone: formData.phone ?? '',
        address: formData.address ?? '',
        class: formData.class ?? '',
        section: formData.section ?? '',
        department: formData.department ?? 'school',
        status: formData.status ?? 'active',
        sessionId: formData.sessionId ?? activeSession?.id,
      };
      dispatch({ type: 'ADD_STUDENT', payload: newStudent });
      toast.success(isUrdu ? 'نئی طالبہ شامل ہو گئی' : 'Student added successfully', {
        action: { label: isUrdu ? 'پرنٹ' : 'Print Record', onClick: () => printStudentCard(newStudent) },
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    dispatch({ type: 'DELETE_STUDENT', payload: id });
    toast.success(isUrdu ? 'طالبہ حذف ہو گئی' : 'Student deleted');
  };

  const getSessionName = (sessionId?: string) => {
    if (!sessionId) return '-';
    return state.academicSessions.find(s => s.id === sessionId)?.name ?? '-';
  };

  const printLabels = isUrdu
    ? { list: 'طالبات کی فہرست', roll: 'رول نمبر', name: 'نام', father: 'والد کا نام', address: 'پتہ', className: 'جماعت', department: 'شعبہ', session: 'تعلیمی سال', status: 'حالت', printed: 'پرنٹ کی تاریخ' }
    : { list: 'Student List', roll: 'Roll No', name: 'Name', father: 'Father Name', address: 'Address', className: 'Class', department: 'Dept', session: 'Session', status: 'Status', printed: 'Printed on' };

  // Print
  const handlePrint = () => {
    const sessionName = viewSession?.name ?? activeSession?.name;
    const html = `
      <!DOCTYPE html><html>
      <head><meta charset="utf-8"/><title>${printLabels.list}</title>${PRINT_STYLES}</head>
      <body>
        ${institutionHeader(viewSession?.name)}
        <div class="section-title">
          ${printLabels.list} — ${activeTab !== 'All' ? activeTab + ' • ' : ''}${filteredStudents.length} ${isUrdu ? 'طالبات' : 'students'}
          ${viewSession ? ` | Session: ${viewSession.name}` : ''}
        </div>
        <table>
          <thead><tr>
            <th>#</th><th>${printLabels.roll}</th><th>${printLabels.name}</th><th>${printLabels.father}</th><th>${printLabels.address}</th>
            <th>${printLabels.className}</th><th>${printLabels.department}</th><th>${printLabels.session}</th><th>${printLabels.status}</th>
          </tr></thead>
          <tbody>
            ${filteredStudents.map((s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td style="font-family:monospace;font-weight:bold">${s.rollNo || '-'}</td>
                <td>${s.name}</td>
                <td>${s.fatherName || '-'}</td>
                <td>${s.address || '-'}</td>
                <td class="${MADRASA_CLASSES.includes(s.class as (typeof MADRASA_CLASSES)[number]) ? 'urdu' : ''}" dir="${MADRASA_CLASSES.includes(s.class as (typeof MADRASA_CLASSES)[number]) ? 'rtl' : 'ltr'}">${s.class}</td>
                <td>${s.department === 'madrasa' ? 'Madrasa' : 'School'}</td>
                <td>${getSessionName(s.sessionId)}</td>
                <td><span class="badge">${s.status}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
        <p class="footer-note">${printLabels.printed} ${new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK')} — Jamia Taleem-ul-Quran Lil-Banat</p>
      </body></html>`;
    printHTML(html, 'Student_List');
  };

  const handleExcel = () => {
    downloadExcel(
      filteredStudents.map(s => ({
        'Roll No': s.rollNo, Name: s.name, 'Father Name': s.fatherName, Address: s.address,
        DOB: s.dob, CNIC: s.cnic, Phone: s.phone, Class: s.class,
        Section: s.section, Department: s.department, Status: s.status,
        Session: getSessionName(s.sessionId),
      })),
      'Students'
    );
  };

  /** Individual student profile card — A5-size printout */
  const printStudentCard = (s: Student) => {
    const sessionName = getSessionName(s.sessionId);
    const isUrduClass = MADRASA_CLASSES.includes(s.class as (typeof MADRASA_CLASSES)[number]);
    const statusColor = s.status === 'active' ? '#1a7a45' : s.status === 'graduated' ? '#2980b9' : '#888';

    const html = `<!DOCTYPE html><html>
    <head><meta charset="utf-8"/><title>Student Card — ${s.name}</title>${PRINT_STYLES}
    <style>
      @page { size: A5; margin: 14mm; }
      body { max-width: 148mm; margin: 0 auto; }
      .card-wrap { border: 2px solid #1C2E6B; border-radius: 12px; overflow: hidden; }
      .card-top  { background: linear-gradient(135deg,#1C2E6B 0%,#2a4a9e 100%); padding: 20px 24px 16px; text-align: center; }
      .card-top h1 { color: #fff; font-size: 16px; margin-bottom: 2px; }
      .card-top .urdu { color: rgba(255,255,255,0.85); font-size: 18px; line-height: 2.2; font-family: 'Jameel Noori Nastaleeq','Noto Nastaliq Urdu',serif; display: block; }
      .card-top .sub { color: rgba(255,255,255,0.65); font-size: 11px; margin-top: 2px; }
      .badge-strip { background: #E4572E; color:#fff; text-align:center; font-size:12px; font-weight:700; padding: 5px; letter-spacing:1px; }
      .fields { padding: 18px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; }
      .field { }
      .field-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; color: #888; margin-bottom: 3px; }
      .field-value { font-size: 13px; font-weight: 600; color: #1a1a2e; word-break: break-word; }
      .field-value.urdu { font-family: 'Jameel Noori Nastaleeq','Noto Nastaliq Urdu',serif; font-size: 16px; line-height: 2.2; direction: rtl; }
      .field-value.roll { font-family: monospace; font-size: 20px; color: #E4572E; font-weight: 800; }
      .field-full { grid-column: 1 / -1; }
      .divider { grid-column: 1 / -1; border: none; border-top: 1px dashed #d4d4e0; margin: 0; }
      .footer-strip { background: #f0f4f8; border-top: 1px solid #d4d4e0; text-align: center; font-size: 10px; color: #888; padding: 8px; }
      .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; background: ${statusColor}; }
    </style>
    </head>
    <body>
      <div class="card-wrap">
        <div class="card-top">
          <h1>Jamia Taleem-ul-Quran Lil-Banat</h1>
          <span class="urdu">جامعہ تعلیم القرآن للبنات</span>
          <div class="sub">Peshawar, Pakistan &nbsp;|&nbsp; +92 312 5654118</div>
        </div>
        <div class="badge-strip">STUDENT PROFILE CARD</div>
        <div class="fields">
          <div class="field field-full">
            <div class="field-label">Student Name</div>
            <div class="field-value">${s.name}</div>
          </div>
          <div class="field">
            <div class="field-label">Roll Number</div>
            <div class="field-value roll">${s.rollNo || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">Class</div>
            <div class="field-value ${isUrduClass ? 'urdu' : ''}" ${isUrduClass ? 'dir="rtl"' : ''}>${s.class}</div>
          </div>
          <hr class="divider"/>
          <div class="field">
            <div class="field-label">Father's Name</div>
            <div class="field-value">${s.fatherName || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">Date of Birth</div>
            <div class="field-value">${formatAdminDate(s.dob) || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">CNIC / B-Form</div>
            <div class="field-value" style="font-family:monospace">${s.cnic || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">Phone</div>
            <div class="field-value" style="font-family:monospace">${s.phone || '—'}</div>
          </div>
          <div class="field field-full">
            <div class="field-label">Address</div>
            <div class="field-value">${s.address || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">Department</div>
            <div class="field-value">${s.department === 'madrasa' ? 'Madrasa' : 'School'}</div>
          </div>
          <div class="field">
            <div class="field-label">Section</div>
            <div class="field-value">${s.section || '—'}</div>
          </div>
          <div class="field">
            <div class="field-label">Academic Session</div>
            <div class="field-value">${sessionName}</div>
          </div>
          <div class="field">
            <div class="field-label">Status</div>
            <div class="field-value"><span class="status-dot"></span>${s.status.charAt(0).toUpperCase() + s.status.slice(1)}</div>
          </div>
        </div>
        <div class="footer-strip">Issued by Jamia Taleem-ul-Quran Lil-Banat &nbsp;|&nbsp; ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>
    </body></html>`;
    printHTML(html, `StudentCard_${s.name}`);
  };

  /** Compact roll-number slip — prints 2 per page (A6 landscape) */
  const printRollNoSlip = (s: Student) => {
    const sessionName = getSessionName(s.sessionId);
    const isUrduClass = MADRASA_CLASSES.includes(s.class as (typeof MADRASA_CLASSES)[number]);

    const slip = `
      <div style="border:2px solid #1C2E6B;border-radius:10px;padding:0;overflow:hidden;width:200mm;margin:auto;font-family:Georgia,serif;">
        <div style="background:linear-gradient(135deg,#1C2E6B,#2a4a9e);padding:12px 20px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="color:#fff;font-size:14px;font-weight:700;">Jamia Taleem-ul-Quran Lil-Banat</div>
            <div style="color:rgba(255,255,255,0.75);font-family:'Jameel Noori Nastaleeq','Noto Nastaliq Urdu',serif;font-size:16px;line-height:2.2;direction:rtl;">جامعہ تعلیم القرآن للبنات</div>
          </div>
          <div style="text-align:right;">
            <div style="color:rgba(255,255,255,0.6);font-size:10px;text-transform:uppercase;letter-spacing:1px;">Roll Number Slip</div>
            <div style="color:#fff;font-size:36px;font-weight:900;font-family:monospace;line-height:1.1;">${s.rollNo || '—'}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;border-top:1px solid #d4d4e0;">
          <div style="padding:12px 18px;border-right:1px solid #d4d4e0;">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#888;margin-bottom:4px;">Student Name</div>
            <div style="font-size:14px;font-weight:700;color:#1a1a2e;">${s.name}</div>
          </div>
          <div style="padding:12px 18px;border-right:1px solid #d4d4e0;">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#888;margin-bottom:4px;">Father's Name</div>
            <div style="font-size:13px;font-weight:600;color:#1a1a2e;">${s.fatherName || '—'}</div>
          </div>
          <div style="padding:12px 18px;">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#888;margin-bottom:4px;">Class</div>
            <div style="font-size:13px;font-weight:600;color:#1a1a2e;${isUrduClass ? "font-family:'Jameel Noori Nastaleeq','Noto Nastaliq Urdu',serif;font-size:16px;line-height:2.2;direction:rtl;" : ''}">${s.class}</div>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;border-top:1px solid #d4d4e0;background:#f8fafc;">
          <div style="padding:10px 18px;border-right:1px solid #d4d4e0;">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#888;margin-bottom:3px;">Department</div>
            <div style="font-size:12px;font-weight:600;color:#1C2E6B;">${s.department === 'madrasa' ? 'Madrasa' : 'School'}</div>
          </div>
          <div style="padding:10px 18px;border-right:1px solid #d4d4e0;">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#888;margin-bottom:3px;">Session</div>
            <div style="font-size:12px;font-weight:600;color:#1C2E6B;">${sessionName}</div>
          </div>
          <div style="padding:10px 18px;">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#888;margin-bottom:3px;">Issued</div>
            <div style="font-size:11px;color:#666;">${new Date().toLocaleDateString()}</div>
          </div>
        </div>
      </div>`;

    const html = `<!DOCTYPE html><html>
    <head><meta charset="utf-8"/><title>Roll No Slip — ${s.name}</title>${PRINT_STYLES}
    <style>
      @page { size: A4; margin: 12mm; }
      body { max-width: 210mm; margin: 0 auto; }
      .slip-container { display: flex; flex-direction: column; gap: 16px; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
    </head>
    <body>
      <div class="slip-container">
        ${slip}
        <div style="border-top:2px dashed #ccc;padding-top:16px;">${slip}</div>
      </div>
      <p style="text-align:center;font-size:10px;color:#aaa;margin-top:14px;">★ Cut along the dashed line — duplicate copy ★</p>
    </body></html>`;
    printHTML(html, `RollNoSlip_${s.rollNo || s.name}`);
  };

  const classOptions = department === 'school'
    ? state.schoolClasses
    : formData.department === 'madrasa' ? state.madrasaClasses : state.schoolClasses;
  const classRosterStudents = reportClass ? sessionStudents.filter(s => s.class === reportClass) : [];

  const printClassRoster = () => {
    const rows = classRosterStudents.map((s, i) => `<tr><td>${i + 1}</td><td>${s.rollNo || '-'}</td><td>${s.name}</td><td>${s.fatherName || '-'}</td><td>${s.address || '-'}</td><td>${s.phone || '-'}</td><td>${s.status}</td></tr>`).join('');
    printHTML(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Class Roster</title>${PRINT_STYLES}</head><body>${institutionHeader(viewSession?.name)}<div class="section-title">Class Roster - ${reportClass} (${classRosterStudents.length} students)</div><table><thead><tr><th>#</th><th>Roll No</th><th>Name</th><th>Father Name</th><th>Address</th><th>Phone</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table><p class="footer-note">Printed on ${new Date().toLocaleDateString()}</p></body></html>`, `Class_Roster_${reportClass}`);
  };

  const exportClassRoster = () => downloadExcel(classRosterStudents.map(s => ({ 'Roll No': s.rollNo, Name: s.name, 'Father Name': s.fatherName, Address: s.address, DOB: s.dob, CNIC: s.cnic, Phone: s.phone, Class: s.class, Section: s.section, Department: s.department, Status: s.status, Session: getSessionName(s.sessionId) })), `Class_${reportClass.replace(/[^a-z0-9]/gi, '_')}`);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#E4572E]">{isUrdu ? 'طالبات' : 'Students'}</h2>
          {viewSession && (
            <p className="text-sm text-[#E4572E] opacity-70 mt-0.5 font-medium">
              {isUrdu ? `تعلیمی سال: ${viewSession.name}` : `Session: ${viewSession.name}`}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={handlePrint} className="neu-btn px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#E4572E]" />
            {isUrdu ? 'پرنٹ' : 'Print'}
          </button>
          <button onClick={handleExcel} className="neu-btn px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
            <Download className="w-4 h-4 text-[#E4572E]" />
            {isUrdu ? 'ایکسل' : 'Excel'}
          </button>
          <select value={reportClass} onChange={e => setReportClass(e.target.value)} className="neu-input rounded-xl px-3 py-2.5 text-sm">
            <option value="">Class roster...</option>
              {(department === 'school' ? state.schoolClasses : department === 'madrasa' ? state.madrasaClasses : [...SCHOOL_CLASSES, ...MADRASA_CLASSES]).map(cls => <option key={cls} value={cls}>{cls}</option>)}
          </select>
          <button onClick={handleAdd} className="neu-btn-primary px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {isUrdu ? 'نئی طالبہ' : 'Add Student'}
          </button>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="neu-inset rounded-xl flex items-center px-4 gap-2 h-11 w-full sm:max-w-xs">
          <Search className="w-4 h-4 opacity-40 shrink-0" />
          <input
            className="bg-transparent outline-none text-sm w-full"
            placeholder={isUrdu ? 'نام یا رول نمبر سے تلاش...' : 'Search by name or roll no...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
            dir={isUrdu ? 'rtl' : 'ltr'}
          />
        </div>
        {!department && <div className="flex gap-2">
          {['All', 'Madrasa', 'School'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'All' | 'Madrasa' | 'School')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab ? 'neu-raised text-[#E4572E]' : 'neu-btn opacity-60'}`}
            >
              {tab === 'All' ? (isUrdu ? 'سب' : 'All') : tab === 'Madrasa' ? (isUrdu ? 'مدرسہ' : 'Madrasa') : (isUrdu ? 'سکول' : 'School')}
              <span className="ml-1.5 text-xs opacity-60">
                ({tab === 'All' ? sessionStudents.length : sessionStudents.filter(s => s.department === (tab === 'Madrasa' ? 'madrasa' : 'school')).length})
              </span>
            </button>
          ))}
        </div>}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="neu-raised rounded-2xl overflow-hidden"
      >
        <div className="neu-inset rounded-2xl m-3 overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="border-b border-[var(--neu-dark)]/20">
                <th className={`px-5 py-4 font-semibold opacity-60 text-xs tracking-wider ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? 'نام' : 'Name'}</th>
                <th className={`px-5 py-4 font-semibold opacity-60 text-xs tracking-wider ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? 'رول نمبر' : 'Roll No'}</th>
                <th className={`px-5 py-4 font-semibold opacity-60 text-xs tracking-wider hidden md:table-cell ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? 'جماعت' : 'Class'}</th>
                <th className={`px-5 py-4 font-semibold opacity-60 text-xs tracking-wider hidden xl:table-cell ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? 'پتہ' : 'Address'}</th>
                <th className={`px-5 py-4 font-semibold opacity-60 text-xs tracking-wider hidden lg:table-cell ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? 'تعلیمی سال' : 'Session'}</th>
                <th className={`px-5 py-4 font-semibold opacity-60 text-xs tracking-wider ${isUrdu ? 'text-right' : 'text-left'}`}>{isUrdu ? 'صورتحال' : 'Status'}</th>
                <th className="px-5 py-4 font-semibold opacity-60 text-xs tracking-wider text-right">{isUrdu ? 'اقدامات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(s => (
                <tr key={s.id} className="border-b border-[var(--neu-dark)]/10 hover:bg-[rgba(228,87,46,0.03)] transition-colors last:border-0">
                  <td className="px-5 py-3.5 font-medium">{s.name}</td>
                  <td className="px-5 py-3.5 opacity-70 font-mono text-xs">{s.rollNo || '—'}</td>
                  <td className="px-5 py-3.5 opacity-70 hidden md:table-cell">
                    <span className={MADRASA_CLASSES.includes(s.class as (typeof MADRASA_CLASSES)[number]) ? 'urdu-text' : ''} dir={MADRASA_CLASSES.includes(s.class as (typeof MADRASA_CLASSES)[number]) ? 'rtl' : 'ltr'}>
                      {s.class}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 opacity-70 hidden xl:table-cell max-w-xs">{s.address || '—'}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    <span className="text-xs opacity-60">{getSessionName(s.sessionId)}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{
                      background: s.status === 'active' ? 'rgba(39,174,96,0.12)' : 'rgba(200,200,200,0.2)',
                      color: s.status === 'active' ? '#27ae60' : '#888',
                    }}>
                      {s.status === 'active' ? (isUrdu ? 'فعال' : 'Active') : s.status === 'graduated' ? (isUrdu ? 'فارغ التحصیل' : 'Graduated') : (isUrdu ? 'غیر فعال' : 'Inactive')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => printStudentCard(s)}
                        title={isUrdu ? 'طالبہ کارڈ پرنٹ کریں' : 'Print student card'}
                        className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#1C2E6B]"
                      >
                        <IdCard className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => printRollNoSlip(s)}
                        title={isUrdu ? 'رول نمبر سلپ پرنٹ کریں' : 'Print roll number slip'}
                        className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#2a4a9e]"
                      >
                        <Hash className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleEdit(s)} className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#E4572E]">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="p-8 text-center opacity-40 text-sm">
              {search ? (isUrdu ? 'کوئی نتیجہ نہیں' : 'No results found') : (isUrdu ? 'کوئی طالبہ نہیں' : 'No students yet')}
            </div>
          )}
        </div>
      </motion.div>

      {reportClass && (
        <div className="neu-raised rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div><h3 className="font-bold text-lg">Class Roster: {reportClass}</h3><p className="text-sm opacity-60">{classRosterStudents.length} enrolled students</p></div>
            <div className="flex gap-2"><button onClick={printClassRoster} className="neu-btn px-3 py-2 rounded-xl text-sm flex items-center gap-2"><Printer className="w-4 h-4" />Print / PDF</button><button onClick={exportClassRoster} className="neu-btn px-3 py-2 rounded-xl text-sm flex items-center gap-2"><Download className="w-4 h-4" />Excel</button></div>
          </div>
          <div className="neu-inset rounded-xl overflow-x-auto"><table className="w-full text-sm min-w-[700px]"><thead><tr><th className="px-4 py-3 text-left opacity-60">Roll No</th><th className="px-4 py-3 text-left opacity-60">Name</th><th className="px-4 py-3 text-left opacity-60">Father Name</th><th className="px-4 py-3 text-left opacity-60">Address</th><th className="px-4 py-3 text-left opacity-60">Phone</th><th className="px-4 py-3 text-left opacity-60">Status</th></tr></thead><tbody>{classRosterStudents.map(s => <tr key={s.id} className="border-b border-[var(--neu-dark)]/10 last:border-0"><td className="px-4 py-3 font-mono">{s.rollNo || '-'}</td><td className="px-4 py-3 font-medium">{s.name}</td><td className="px-4 py-3">{s.fatherName || '-'}</td><td className="px-4 py-3">{s.address || '-'}</td><td className="px-4 py-3">{s.phone || '-'}</td><td className="px-4 py-3">{s.status}</td></tr>)}</tbody></table>{classRosterStudents.length === 0 && <div className="p-6 text-center opacity-40">No students in this class</div>}</div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 neu-raised rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold mb-6">
              {editingStudent ? (isUrdu ? 'طالبہ میں ترمیم' : 'Edit Student') : (isUrdu ? 'نئی طالبہ شامل کریں' : 'Add New Student')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'نام *' : 'Full Name *'}</label>
                <input className="neu-input w-full rounded-xl px-4 py-2.5 h-11" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} dir={isUrdu ? 'rtl' : 'ltr'} />
              </div>
              {/* Father Name */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'والد کا نام' : 'Father Name'}</label>
                <input className="neu-input w-full rounded-xl px-4 py-2.5 h-11" value={formData.fatherName || ''} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} dir={isUrdu ? 'rtl' : 'ltr'} />
              </div>
              {/* DOB */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'تاریخ پیدائش *' : 'Date of Birth *'}</label>
                <div className="neu-inset-sm rounded-xl px-4 py-2.5 h-11 flex items-center">
                  <input type="text" inputMode="numeric" required placeholder="DD/MM/YYYY" maxLength={10} className="w-full bg-transparent border-none outline-none text-sm" value={formData.dob || ''} onChange={e => setFormData({ ...formData, dob: e.target.value.replace(/[^\d/]/g, '').slice(0, 10) })} />
                </div>
                {errors.dob && <p className="text-xs text-red-500 mt-1">{errors.dob}</p>}
              </div>
              {/* Academic Session */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'تعلیمی سال *' : 'Academic Session *'}</label>
                <div className="neu-inset-sm rounded-xl px-3 py-1">
                  <select className="w-full bg-transparent border-none outline-none h-9 text-sm cursor-pointer" value={formData.sessionId || ''} onChange={e => setFormData({ ...formData, sessionId: e.target.value })}>
                    <option value="">{isUrdu ? 'تعلیمی سال منتخب کریں' : 'Select session...'}</option>
                    {[...state.academicSessions].sort((a, b) => b.startYear - a.startYear).map(s => (
                      <option key={s.id} value={s.id}>{s.name} {s.status === 'active' ? '(Active)' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Department is intentionally omitted from the dedicated portal forms. */}
              {!department && <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'شعبہ *' : 'Department *'}</label>
                <div className="flex gap-2">
                  {(['school', 'madrasa'] as const).map(d => (
                    <button key={d} onClick={() => handleDepartmentChange(d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${formData.department === d ? 'neu-raised text-[#E4572E]' : 'neu-btn opacity-60'}`}>
                      {d === 'school' ? (isUrdu ? 'سکول' : 'School') : (isUrdu ? 'مدرسہ' : 'Madrasa')}
                    </button>
                  ))}
                </div>
              </div>}
              {/* Class */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'جماعت *' : 'Class *'}</label>
                <div className="neu-inset-sm rounded-xl px-3 py-1">
                  <select className="w-full bg-transparent border-none outline-none h-9 text-sm cursor-pointer" value={formData.class || ''} onChange={e => handleClassChange(e.target.value)}>
                    <option value="">{isUrdu ? 'جماعت منتخب کریں' : 'Select class...'}</option>
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              {/* Section (school only) */}
              {formData.department === 'school' && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'سیکشن' : 'Section'}</label>
                  <div className="neu-inset-sm rounded-xl px-3 py-1">
                    <select className="w-full bg-transparent border-none outline-none h-9 text-sm cursor-pointer" value={formData.section || ''} onChange={e => setFormData({ ...formData, section: e.target.value })}>
                      <option value="">—</option>
                      {SCHOOL_SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}
              {/* Roll Number */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70 flex items-center justify-between">
                  <span>{isUrdu ? 'رول نمبر' : 'Roll Number'}</span>
                  <button onClick={handleAutoRollNo} className="text-xs text-[#E4572E] font-bold flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity">
                    <Wand2 className="w-3 h-3" />
                    {isUrdu ? 'خودکار' : 'Auto'}
                  </button>
                </label>
                <input
                  className={`neu-input w-full rounded-xl px-4 py-2.5 h-11 ${errors.rollNo ? 'border border-red-400' : ''}`}
                  value={formData.rollNo || ''}
                  onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                  placeholder={isUrdu ? 'خودکار تفویض یا دستی' : 'Auto-assign or enter manually'}
                />
                {errors.rollNo && <p className="text-xs text-red-500 mt-1">{errors.rollNo}</p>}
              </div>
              {/* CNIC */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">CNIC / B-Form <span className="font-normal opacity-50 text-xs">(XXXXX-XXXXXXX-X)</span></label>
                <input className={`neu-input w-full rounded-xl px-4 py-2.5 h-11 ${errors.cnic ? 'border border-red-400' : ''}`} value={formData.cnic || ''} onChange={e => handleCnicChange(e.target.value)} placeholder="35201-1234567-8" />
                {errors.cnic && <p className="text-xs text-red-500 mt-1">{errors.cnic}</p>}
              </div>
              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'موبائل نمبر' : 'Mobile Number'} <span className="font-normal opacity-50 text-xs">(11 digits)</span></label>
                <input className={`neu-input w-full rounded-xl px-4 py-2.5 h-11 ${errors.phone ? 'border border-red-400' : ''}`} value={formData.phone || ''} onChange={e => handlePhoneChange(e.target.value)} placeholder="03001234567" />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
              {/* Status */}
              {/* Address */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'پتہ' : 'Address'}</label>
                <textarea className="neu-input w-full rounded-xl px-4 py-2.5 min-h-20 resize-y" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} dir={isUrdu ? 'rtl' : 'ltr'} placeholder={isUrdu ? 'مکمل پتہ' : 'Student residential address'} />
              </div>
              {/* Status */}
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'صورتحال' : 'Status'}</label>
                <div className="neu-inset-sm rounded-xl px-3 py-1">
                  <select className="w-full bg-transparent border-none outline-none h-9 text-sm cursor-pointer" value={formData.status || 'active'} onChange={e => setFormData({ ...formData, status: e.target.value as Student['status'] })}>
                    <option value="active">{isUrdu ? 'فعال' : 'Active'}</option>
                    <option value="inactive">{isUrdu ? 'غیر فعال' : 'Inactive'}</option>
                    <option value="graduated">{isUrdu ? 'فارغ التحصیل' : 'Graduated'}</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button className="neu-btn px-5 py-2.5 rounded-xl text-sm font-medium" onClick={() => setDialogOpen(false)}>{isUrdu ? 'منسوخ' : 'Cancel'}</button>
              <button className="neu-btn-primary px-5 py-2.5 rounded-xl text-white text-sm font-semibold" onClick={handleSave}>{isUrdu ? 'محفوظ کریں' : 'Save'}</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
