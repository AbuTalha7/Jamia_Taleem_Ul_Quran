import React from 'react';
import { useApp } from '@/store';
import { MADRASA_CLASSES } from '@/types';
import { printHTML, PRINT_STYLES, institutionHeader } from '@/lib/print';
import { downloadExcel } from '@/lib/excel';
import { FileText, Printer, Download } from 'lucide-react';
import { toast } from 'sonner';

export default function Reports() {
  const { state, getViewSession, getActiveSession, getStudentsForView } = useApp();
  const isUrdu = state.language === 'ur';
  const viewSession = getViewSession();
  const activeSession = getActiveSession();
  const sessionName = viewSession?.name ?? undefined;
  const labels = isUrdu ? {
    roster: 'طالبات کی فہرست', allStudents: 'تمام طالبات', roll: 'رول نمبر', name: 'نام', father: 'والد کا نام', address: 'پتہ', className: 'جماعت', department: 'شعبہ', phone: 'فون', status: 'حالت', printed: 'پرنٹ کی تاریخ', fee: 'فیس رپورٹ', paid: 'ادا شدہ', pending: 'زیر التواء', records: 'ریکارڈز', madrasa: 'مدرسہ رپورٹ', students: 'طالبات', excel: 'طالبات کا ڈیٹا',
  } : {
    roster: 'Student Roster', allStudents: 'All Students', roll: 'Roll No', name: 'Name', father: 'Father Name', address: 'Address', className: 'Class', department: 'Dept', phone: 'Phone', status: 'Status', printed: 'Printed on', fee: 'Fee Collection Report', paid: 'Paid', pending: 'Pending', records: 'records', madrasa: 'Madrasa Report', students: 'students', excel: 'Students',
  };

  const students = getStudentsForView();
  const feeStudentIds = state.viewSessionId
    ? new Set(state.students.filter(s => s.sessionId === state.viewSessionId).map(s => s.id))
    : null;
  const feeRecords = feeStudentIds
    ? state.feeRecords.filter(f => feeStudentIds.has(f.studentId))
    : state.feeRecords;

  // ── 1. Student Roster ──────────────────────────────────────
  const printStudentRoster = () => {
    const html = `
      <!DOCTYPE html><html>
      <head><meta charset="utf-8"/><title>Student Roster</title>${PRINT_STYLES}</head>
      <body>
        ${institutionHeader(sessionName)}
        <div class="section-title">${labels.roster} — ${labels.allStudents} (${students.length})${sessionName ? ` | ${sessionName}` : ''}</div>
        <table>
          <thead><tr><th>#</th><th>${labels.roll}</th><th>${labels.name}</th><th>${labels.father}</th><th>${labels.address}</th><th>${labels.className}</th><th>${labels.department}</th><th>${labels.phone}</th><th>${labels.status}</th></tr></thead>
          <tbody>
            ${students.map((s, i) => `
              <tr>
                <td>${i + 1}</td>
                <td style="font-family:monospace;font-weight:bold">${s.rollNo || '-'}</td>
                <td>${s.name}</td>
                <td>${s.fatherName || '-'}</td>
                <td>${s.address || '-'}</td>
                <td class="${MADRASA_CLASSES.includes(s.class as (typeof MADRASA_CLASSES)[number]) ? 'urdu' : ''}" dir="${MADRASA_CLASSES.includes(s.class as (typeof MADRASA_CLASSES)[number]) ? 'rtl' : 'ltr'}">${s.class}</td>
                <td>${s.department === 'madrasa' ? 'Madrasa' : 'School'}</td>
                <td style="font-family:monospace">${s.phone || '-'}</td>
                <td><span class="badge">${s.status}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
        <p class="footer-note">${labels.printed} ${new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK')}</p>
      </body></html>`;
    printHTML(html, 'Student_Roster');
  };

  // ── 2. Fee Collection Report ───────────────────────────────
  const printFeeReport = () => {
    const records = feeRecords.map(f => {
      const s = state.students.find(st => st.id === f.studentId);
      return { ...f, studentName: s?.name ?? 'Unknown', rollNo: s?.rollNo ?? '-', className: s?.class ?? '-' };
    });
    const paid    = records.filter(r => r.status === 'paid');
    const pending = records.filter(r => r.status === 'pending');
    const totalPaid    = paid.reduce((sum, r) => sum + r.amount, 0);
    const totalPending = pending.reduce((sum, r) => sum + r.amount, 0);
    const html = `
      <!DOCTYPE html><html>
      <head><meta charset="utf-8"/><title>Fee Report</title>${PRINT_STYLES}</head>
      <body>
        ${institutionHeader(sessionName)}
        <div class="section-title">${labels.fee}${sessionName ? ` — ${sessionName}` : ''}</div>
        <div style="display:flex;gap:20px;margin-bottom:14px;font-size:13px;font-weight:bold">
          <span style="color:#1a7a45">${labels.paid}: Rs. ${totalPaid.toLocaleString()}</span>
          <span style="color:#b85c00">${labels.pending}: Rs. ${totalPending.toLocaleString()}</span>
          <span>${records.length} ${labels.records}</span>
        </div>
        <table>
          <thead><tr><th>#</th><th>Roll No</th><th>Student</th><th>Class</th><th>Month</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            ${records.map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td style="font-family:monospace;font-weight:bold">${r.rollNo}</td>
                <td>${r.studentName}</td>
                <td>${r.className}</td>
                <td>${r.month}</td>
                <td style="font-weight:bold">Rs. ${r.amount.toLocaleString()}</td>
                <td><span class="badge ${r.status === 'paid' ? 'badge-paid' : 'badge-pending'}">${r.status.toUpperCase()}</span></td>
              </tr>`).join('')}
          </tbody>
        </table>
        <p class="footer-note">${labels.printed} ${new Date().toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK')}</p>
      </body></html>`;
    printHTML(html, 'Fee_Report');
  };

  // ── 3. Madrasa Summary ─────────────────────────────────────
  const printMadrasaSummary = () => {
    const madrasaStudents = students.filter(s => s.department === 'madrasa');
    const html = `
      <!DOCTYPE html><html>
      <head><meta charset="utf-8"/><title>${labels.madrasa}</title>${PRINT_STYLES}</head>
      <body>
        ${institutionHeader(sessionName)}
        <div class="section-title">${labels.madrasa} — ${madrasaStudents.length} ${labels.students}</div>
        ${MADRASA_CLASSES.map(cls => {
          const clsStudents = madrasaStudents.filter(s => s.class === cls);
          if (clsStudents.length === 0) return '';
          return `
            <div class="section-title" style="margin-top:14px;font-size:13px">
              <span class="urdu" dir="rtl" style="font-family:'Jameel Noori Nastaleeq','Noto Nastaliq Urdu',serif;font-size:16px">${cls}</span>
              — ${clsStudents.length} students
            </div>
            <table>
              <thead><tr><th>Roll No</th><th>Name</th><th>Father Name</th><th>Status</th></tr></thead>
              <tbody>
                ${clsStudents.map(s => `
                  <tr>
                    <td style="font-family:monospace;font-weight:bold">${s.rollNo || '-'}</td>
                    <td>${s.name}</td>
                    <td>${s.fatherName || '-'}</td>
                    <td><span class="badge">${s.status}</span></td>
                  </tr>`).join('')}
              </tbody>
            </table>`;
        }).join('')}
        <p class="footer-note">Printed on ${new Date().toLocaleDateString()}</p>
      </body></html>`;
    printHTML(html, 'Madrasa_Report');
  };

  // ── 4. Excel Export ────────────────────────────────────────
  const exportAllDataExcel = () => {
    const sessionLabel = sessionName ?? 'All Sessions';
    downloadExcel(
      students.map(s => ({
        'Roll No': s.rollNo || '-', Name: s.name, 'Father Name': s.fatherName, Address: s.address,
        DOB: s.dob, CNIC: s.cnic, Phone: s.phone, Class: s.class,
        Section: s.section, Department: s.department, Status: s.status,
        Session: sessionLabel,
      })),
      `Students_${sessionLabel.replace(/[^a-z0-9]/gi, '_')}`
    );
    toast.success(isUrdu ? 'فائل ڈاؤن لوڈ ہو رہی ہے' : 'Excel file downloading...');
  };

  const reports = [
    {
      id: 'student-roster',
      title: isUrdu ? 'طالبات کی فہرست' : 'Student Roster',
      description: isUrdu ? 'تمام طالبات کی مکمل فہرست بمع رول نمبر، جماعت اور تعلیمی سال۔' : 'Complete list of all students with roll numbers, class, and session.',
      count: `${students.length} ${isUrdu ? 'طالبات' : 'students'}`,
      action: printStudentRoster,
      type: 'print' as const,
    },
    {
      id: 'fee-report',
      title: isUrdu ? 'فیس کی رپورٹ' : 'Fee Collection Report',
      description: isUrdu ? 'تمام فیس ریکارڈز بمع ادا شدہ اور زیرِ التواء تفصیل۔' : 'All fee records with paid/pending breakdown.',
      count: `${feeRecords.length} ${isUrdu ? 'ریکارڈز' : 'records'}`,
      action: printFeeReport,
      type: 'print' as const,
    },
    {
      id: 'madrasa-summary',
      title: isUrdu ? 'مدرسہ کلاس رپورٹ' : 'Madrasa Class Report',
      description: isUrdu ? 'مدرسہ کی ہر جماعت کے طلباء کی تفصیل۔' : 'Class-wise breakdown of all Madrasa students.',
      count: `${students.filter(s => s.department === 'madrasa').length} ${isUrdu ? 'طالبات' : 'students'}`,
      action: printMadrasaSummary,
      type: 'print' as const,
    },
    {
      id: 'excel-export',
      title: isUrdu ? 'ایکسل ڈیٹا ایکسپورٹ' : 'Full Data Excel Export',
      description: isUrdu ? 'تمام طلباء کا ڈیٹا ایکسل فائل میں محفوظ کریں۔' : 'Export complete student data as an Excel spreadsheet.',
      count: `${students.length} ${isUrdu ? 'ریکارڈز' : 'records'}`,
      action: exportAllDataExcel,
      type: 'excel' as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#E4572E]">{isUrdu ? 'رپورٹس' : 'Reports'}</h2>
          {viewSession && (
            <p className="text-sm text-[#E4572E] opacity-70 mt-0.5 font-medium">
              {isUrdu ? `تعلیمی سال: ${viewSession.name}` : `Session: ${viewSession.name}`}
            </p>
          )}
        </div>
        <p className="text-sm opacity-50">{isUrdu ? 'رپورٹ بنانے کے لیے بٹن دبائیں' : 'Click any button to generate and print/download'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {reports.map(report => (
          <div key={report.id} className="neu-raised rounded-2xl p-6 flex flex-col">
            <div className="w-14 h-14 rounded-2xl neu-inset flex items-center justify-center text-[#E4572E] mb-4 self-start">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className={`font-bold text-lg mb-1 ${isUrdu ? 'urdu-text' : ''}`}>{report.title}</h3>
            <p className="text-xs font-semibold text-[#E4572E] mb-2">{report.count}</p>
            <p className={`text-sm opacity-60 mb-6 flex-1 ${isUrdu ? 'urdu-text' : ''}`}>{report.description}</p>
            <button
              onClick={report.action}
              className="neu-btn px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 text-[#E4572E] w-full justify-center"
            >
              {report.type === 'excel'
                ? <><Download className="w-4 h-4" />{isUrdu ? 'ایکسل ڈاؤن لوڈ' : 'Download Excel'}</>
                : <><Printer className="w-4 h-4" />{isUrdu ? 'پرنٹ / پی ڈی ایف' : 'Print / PDF'}</>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
