import React from 'react';
import { Download, FileText } from 'lucide-react';
import { useApp } from '@/store';
import { downloadExcel } from '@/lib/excel';

export default function FeeReports() {
  const { state } = useApp();
  const rows = state.feeRecords.map(record => { const student = state.students.find(item => item.id === record.studentId); const paid = record.paidAmount ?? (record.status === 'paid' ? record.amount : 0); return { Student: student?.name ?? '-', Department: student?.department === 'madrasa' ? 'Dars-e-Nizami' : 'School', Class: student?.class ?? '-', 'Roll No': student?.rollNo ?? '-', Month: record.month, 'Total Fee': record.amount, 'Paid Fee': paid, 'Pending Fee': record.amount - paid, Status: paid >= record.amount ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Pending', Voucher: record.voucherNo ?? record.id }; });
  const exportRows = (department?: 'school' | 'madrasa') => downloadExcel(rows.filter(row => !department || row.Department === (department === 'school' ? 'School' : 'Dars-e-Nizami')), `Fee_Report_${department ?? 'all'}`);
  return <div className="fee-module-page"><div className="fee-module-heading"><div><span className="fee-kicker">FEE REPORTS</span><h1>Reports & exports</h1><p>Export School and Dars-e-Nizami fee ledgers from one financial workspace.</p></div></div><div className="fee-report-grid"><div><FileText /><h2>School fee report</h2><p>Paid, pending, and class-wise School records.</p><button className="fee-secondary-button" onClick={() => exportRows('school')}><Download className="w-4 h-4" /> Export Excel</button></div><div><FileText /><h2>Dars-e-Nizami fee report</h2><p>Paid, pending, and class-wise Madrasa records.</p><button className="fee-secondary-button" onClick={() => exportRows('madrasa')}><Download className="w-4 h-4" /> Export Excel</button></div><div className="fee-report-wide"><FileText /><h2>Complete fee ledger</h2><p>{rows.length} records across both student groups.</p><button className="fee-primary-button" onClick={() => exportRows()}><Download className="w-4 h-4" /> Export complete ledger</button></div></div></div>;
}
