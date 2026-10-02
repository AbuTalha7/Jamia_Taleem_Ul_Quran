import React, { useMemo, useState } from 'react';
import { useApp } from '@/store';
import { FeeRecord } from '@/types';
import { printHTML, PRINT_STYLES, institutionHeader } from '@/lib/print';
import { toast } from 'sonner';
import { Plus, Printer, Edit, Trash2, Search } from 'lucide-react';

export default function Fees() {
  const { state, dispatch, getFeeSummary, getViewSession, getActiveSession } = useApp();
  const isUrdu = state.language === 'ur';
  const viewSession = getViewSession();
  const activeSession = getActiveSession();
  const printLabels = isUrdu
    ? { receipt: 'فیس رسید', receiptNo: 'رسید نمبر:', student: 'طالبہ:', roll: 'رول نمبر:', className: 'جماعت:', month: 'ماہ:', description: 'تفصیل:', amount: 'رقم:', status: 'حالت:', ledger: 'فیس لیجر', paid: 'ادا شدہ', pending: 'زیر التواء', total: 'کل', records: 'ریکارڈز' }
    : { receipt: 'Fee Receipt', receiptNo: 'Receipt No:', student: 'Student Name:', roll: 'Roll No:', className: 'Class:', month: 'Month:', description: 'Description:', amount: 'Amount:', status: 'Status:', ledger: 'Fee Ledger', paid: 'Paid', pending: 'Pending', total: 'Total', records: 'records' };

  const [monthFilter, setMonthFilter] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [feeStudentSearch, setFeeStudentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);

  const [formData, setFormData] = useState<Partial<FeeRecord>>({
    studentId: '', amount: 0, month: '', status: 'paid', description: 'Monthly Fee',
  });

  // Session-filtered students for dropdown
  const sessionStudents = state.viewSessionId
    ? state.students.filter(s => s.sessionId === state.viewSessionId)
    : state.students;
  const selectedFeeStudent = sessionStudents.find(student => student.id === formData.studentId);
  const feeStudentMatches = useMemo(() => {
    const query = feeStudentSearch.trim().toLowerCase();
    if (!query) return [];
    return sessionStudents.filter(student =>
      student.name.toLowerCase().includes(query) || student.rollNo.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [feeStudentSearch, sessionStudents]);

  const allRecords = getFeeSummary().filter(f => {
    if (state.viewSessionId) {
      const student = state.students.find(s => s.id === f.studentId);
      if (student?.sessionId !== state.viewSessionId) return false;
    }
    return true;
  });

  const filteredRecords = allRecords.filter(f => {
    if (monthFilter && f.month !== monthFilter) return false;
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (studentSearch && !f.studentName.toLowerCase().includes(studentSearch.toLowerCase()) && !f.rollNo.toLowerCase().includes(studentSearch.toLowerCase())) return false;
    return true;
  });

  const totalAmount  = filteredRecords.reduce((sum, f) => sum + f.amount, 0);
  const totalPaid    = filteredRecords.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalPending = filteredRecords.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);

  const feeReceiptHTML = (f: typeof filteredRecords[0]) => `
    <!DOCTYPE html><html dir="${isUrdu ? 'rtl' : 'ltr'}">
    <head><meta charset="utf-8"/><title>${printLabels.receipt}</title>${PRINT_STYLES}</head>
    <body>
      ${institutionHeader(viewSession?.name)}
      <div class="slip">
        <h2>${printLabels.receipt}</h2>
        <div class="slip-row"><span class="slip-label">${printLabels.receiptNo}</span><span class="slip-value" style="font-family:monospace">${f.id.toUpperCase()}</span></div>
        <div class="slip-row"><span class="slip-label">${printLabels.student}</span><span class="slip-value">${f.studentName}</span></div>
        <div class="slip-row"><span class="slip-label">${printLabels.roll}</span><span class="slip-value" style="font-family:monospace;font-weight:bold">${f.rollNo}</span></div>
        <div class="slip-row"><span class="slip-label">${printLabels.className}</span><span class="slip-value">${f.className}</span></div>
        <div class="slip-row"><span class="slip-label">${printLabels.month}</span><span class="slip-value">${f.month}</span></div>
        <div class="slip-row"><span class="slip-label">${printLabels.description}</span><span class="slip-value">${f.description || (isUrdu ? 'ماہانہ فیس' : 'Monthly Fee')}</span></div>
        <div class="slip-row" style="font-size:16px;font-weight:bold;border-top:2px solid #1C2E6B;margin-top:6px;padding-top:10px">
          <span class="slip-label">${printLabels.amount}</span>
          <span class="slip-value">Rs. ${f.amount.toLocaleString()}</span>
        </div>
        <div class="slip-row">
          <span class="slip-label">${printLabels.status}</span>
          <span class="slip-value"><span class="badge ${f.status === 'paid' ? 'badge-paid' : 'badge-pending'}">${f.status.toUpperCase()}</span></span>
        </div>
      </div>
      <p class="footer-note">Printed on ${new Date().toLocaleDateString()} — Jamia Taleem-ul-Quran Lil-Banat</p>
    </body></html>`;

  const feeLedgerHTML = () => `
    <!DOCTYPE html><html dir="${isUrdu ? 'rtl' : 'ltr'}">
    <head><meta charset="utf-8"/><title>${printLabels.ledger}</title>${PRINT_STYLES}</head>
    <body>
      ${institutionHeader(viewSession?.name)}
      <div class="section-title">${printLabels.ledger}${monthFilter ? ` — ${monthFilter}` : ''} (${filteredRecords.length} ${printLabels.records})</div>
      <div style="display:flex;gap:20px;margin-bottom:14px;font-size:13px;font-weight:bold">
        <span style="color:#1a7a45">${printLabels.paid}: Rs. ${totalPaid.toLocaleString()}</span>
        <span style="color:#b85c00">${printLabels.pending}: Rs. ${totalPending.toLocaleString()}</span>
        <span>${printLabels.total}: Rs. ${totalAmount.toLocaleString()}</span>
      </div>
      <table>
        <thead><tr><th>#</th><th>Roll No</th><th>Student</th><th>Class</th><th>Month</th><th>Amount</th><th>Status</th></tr></thead>
        <tbody>
          ${filteredRecords.map((r, i) => `
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
      <p class="footer-note">Printed on ${new Date().toLocaleDateString()}</p>
    </body></html>`;

  const handleSave = () => {
    if (!formData.studentId) { toast.error(isUrdu ? 'طالبہ منتخب کریں' : 'Please select a student'); return; }
    if (!formData.month) { toast.error(isUrdu ? 'ماہ منتخب کریں' : 'Please select a month'); return; }
    if (!formData.amount || formData.amount <= 0) { toast.error(isUrdu ? 'درست رقم درج کریں' : 'Please enter a valid amount'); return; }

    const duplicate = state.feeRecords.find(fee =>
      fee.studentId === formData.studentId
      && fee.month === formData.month
      && fee.id !== editingFee?.id
      && (formData.description || 'Monthly Fee') === (fee.description || 'Monthly Fee')
    );
    if (duplicate) {
      toast.error(isUrdu ? 'اس طالب علم کے لیے اس ماہ کا ریکارڈ پہلے سے موجود ہے' : 'A fee record already exists for this student and month');
      return;
    }

    if (editingFee) {
      dispatch({ type: 'UPDATE_FEE_RECORD', payload: { ...editingFee, ...formData } as FeeRecord });
      toast.success(isUrdu ? 'ریکارڈ اپڈیٹ ہوا' : 'Fee record updated');
    } else {
      dispatch({
        type: 'ADD_FEE_RECORD',
        payload: { id: `fee-${Date.now()}`, ...formData } as FeeRecord,
      });
      toast.success(isUrdu ? 'فیس ریکارڈ شامل ہو گیا' : 'Fee record added');
    }
    setDialogOpen(false);
    setEditingFee(null);
    setFormData({ studentId: '', amount: 0, month: '', status: 'paid', description: 'Monthly Fee' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#E4572E]">{isUrdu ? 'فیس ریکارڈز' : 'Fee Records'}</h2>
          {viewSession && (
            <p className="text-sm text-[#E4572E] opacity-70 mt-0.5 font-medium">
              {isUrdu ? `تعلیمی سال: ${viewSession.name}` : `Session: ${viewSession.name}`}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={() => printHTML(feeLedgerHTML(), 'Fee_Ledger')} className="neu-btn px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#E4572E]" />
            {isUrdu ? 'لیجر پرنٹ' : 'Print Ledger'}
          </button>
          <button
            onClick={() => { setEditingFee(null); setFeeStudentSearch(''); setFormData({ studentId: '', amount: 0, month: '', status: 'paid', description: 'Monthly Fee' }); setDialogOpen(true); }}
            className="neu-btn-primary px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {isUrdu ? 'نئی فیس' : 'Add Fee'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: isUrdu ? 'کل رقم' : 'Total', value: totalAmount, color: '#1C2E6B' },
          { label: isUrdu ? 'ادا شدہ' : 'Paid', value: totalPaid, color: '#27ae60' },
          { label: isUrdu ? 'زیر التواء' : 'Pending', value: totalPending, color: '#E4572E' },
        ].map((stat, i) => (
          <div key={i} className="neu-raised rounded-2xl p-5 text-center">
            <div className="text-xl font-bold" style={{ color: stat.color }}>Rs. {stat.value.toLocaleString()}</div>
            <div className="text-xs opacity-60 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="neu-inset-sm rounded-xl px-3 flex items-center gap-2 h-11 w-full sm:w-72">
          <Search className="w-4 h-4 opacity-40" />
          <input className="bg-transparent outline-none text-sm w-full" placeholder={isUrdu ? 'نام یا رول نمبر سے تلاش...' : 'Search student name or roll no...'} value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
        </div>
        <div className="neu-inset-sm rounded-xl px-3 py-1">
          <input type="month" className="bg-transparent border-none outline-none h-9 text-sm" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} />
        </div>
        {(['all', 'paid', 'pending'] as const).map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-xl text-sm font-semibold ${statusFilter === s ? 'neu-raised text-[#E4572E]' : 'neu-btn opacity-60'}`}>
            {s === 'all' ? (isUrdu ? 'سب' : 'All') : s === 'paid' ? (isUrdu ? 'ادا شدہ' : 'Paid') : (isUrdu ? 'زیر التواء' : 'Pending')}
          </button>
        ))}
      </div>

      {studentSearch && filteredRecords.length > 0 && (
        <div className="neu-inset rounded-xl px-4 py-3 text-sm"><span className="font-semibold">Fee history:</span> {filteredRecords[0].studentName} <span className="opacity-60">({filteredRecords[0].rollNo || 'No roll number'}) - {filteredRecords.length} record{filteredRecords.length === 1 ? '' : 's'} found</span></div>
      )}

      {/* Table */}
      <div className="neu-raised rounded-2xl overflow-hidden">
        <div className="neu-inset rounded-2xl m-3 overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-[var(--neu-dark)]/20">
                <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs">{isUrdu ? 'طالبہ' : 'Student'}</th>
                <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs">{isUrdu ? 'ماہ' : 'Month'}</th>
                <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs">{isUrdu ? 'رقم' : 'Amount'}</th>
                <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs">{isUrdu ? 'حالت' : 'Status'}</th>
                <th className="px-5 py-4 text-right font-semibold opacity-60 text-xs">{isUrdu ? 'اقدامات' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(f => (
                <tr key={f.id} className="border-b border-[var(--neu-dark)]/10 hover:bg-[rgba(228,87,46,0.03)] transition-colors last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="font-medium">{f.studentName}</div>
                    <div className="text-xs opacity-50 font-mono">{f.rollNo}</div>
                  </td>
                  <td className="px-5 py-3.5 opacity-70">{f.month}</td>
                  <td className="px-5 py-3.5 font-bold">Rs. {f.amount.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{
                      background: f.status === 'paid' ? 'rgba(39,174,96,0.12)' : 'rgba(228,87,46,0.12)',
                      color: f.status === 'paid' ? '#27ae60' : '#E4572E',
                    }}>
                      {f.status === 'paid' ? (isUrdu ? 'ادا شدہ' : 'Paid') : (isUrdu ? 'زیر التواء' : 'Pending')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => printHTML(feeReceiptHTML(f), 'Fee_Receipt')} className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#1C2E6B]">
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { const student = sessionStudents.find(item => item.id === f.studentId); setEditingFee(f); setFeeStudentSearch(student ? `${student.name} (${student.rollNo || 'No Roll'})` : ''); setFormData({ ...f }); setDialogOpen(true); }} className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#E4572E]">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { dispatch({ type: 'DELETE_FEE_RECORD', payload: f.id }); toast.success(isUrdu ? 'حذف ہو گیا' : 'Deleted'); }} className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredRecords.length === 0 && <div className="p-8 text-center opacity-40 text-sm">{isUrdu ? 'کوئی ریکارڈ نہیں' : 'No records found'}</div>}
        </div>
      </div>

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
          <div className="relative z-10 neu-raised rounded-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold mb-6">{editingFee ? (isUrdu ? 'ترمیم' : 'Edit Fee') : (isUrdu ? 'نئی فیس' : 'Add Fee')}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'طالبہ *' : 'Student *'}</label>
                <div className="relative">
                  <div className="neu-inset-sm rounded-xl px-3 py-1">
                    <input
                      className="w-full bg-transparent border-none outline-none h-9 text-sm"
                      placeholder={isUrdu ? 'نام یا رول نمبر تلاش کریں...' : 'Search by name or roll no...'}
                      value={feeStudentSearch}
                      onChange={e => { setFeeStudentSearch(e.target.value); setFormData({ ...formData, studentId: '' }); }}
                    />
                  </div>
                  {feeStudentMatches.length > 0 && !formData.studentId && (
                    <div className="absolute z-20 mt-2 w-full neu-raised rounded-xl p-2 space-y-1 max-h-60 overflow-y-auto">
                      {feeStudentMatches.map(student => (
                        <button
                          type="button"
                          key={student.id}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-[rgba(228,87,46,0.08)] text-sm"
                          onClick={() => { setFormData({ ...formData, studentId: student.id }); setFeeStudentSearch(`${student.name} (${student.rollNo || 'No Roll'})`); }}
                        >
                          <span className="font-semibold">{student.name}</span>
                          <span className="block text-xs opacity-60">Roll No: {student.rollNo || '—'} · {student.class}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {feeStudentSearch.trim() && feeStudentMatches.length === 0 && !selectedFeeStudent && <p className="text-xs opacity-50 mt-1.5">{isUrdu ? 'کوئی طالبہ نہیں ملی' : 'No matching students found'}</p>}
                {selectedFeeStudent && (
                  <div className="neu-inset rounded-xl mt-2 px-3 py-2 text-xs flex flex-wrap gap-x-4 gap-y-1">
                    <span><strong>{selectedFeeStudent.name}</strong></span>
                    <span className="opacity-70">Roll No: {selectedFeeStudent.rollNo || '—'}</span>
                    <span className="opacity-70">Class: {selectedFeeStudent.class}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'ماہ *' : 'Month *'}</label>
                <div className="neu-inset-sm rounded-xl px-4 py-2.5">
                  <input type="month" className="w-full bg-transparent border-none outline-none h-6 text-sm" value={formData.month || ''} onChange={e => setFormData({ ...formData, month: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'رقم (روپے) *' : 'Amount (Rs.) *'}</label>
                <input type="number" className="neu-input w-full rounded-xl px-4 py-2.5 h-11" value={formData.amount || ''} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'تفصیل' : 'Description'}</label>
                <input className="neu-input w-full rounded-xl px-4 py-2.5 h-11" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'حالت' : 'Status'}</label>
                <div className="neu-inset-sm rounded-xl px-3 py-1">
                  <select className="w-full bg-transparent border-none outline-none h-9 text-sm cursor-pointer" value={formData.status || 'paid'} onChange={e => setFormData({ ...formData, status: e.target.value as FeeRecord['status'] })}>
                    <option value="paid">{isUrdu ? 'ادا شدہ' : 'Paid'}</option>
                    <option value="pending">{isUrdu ? 'زیر التواء' : 'Pending'}</option>
                  </select>
                </div>
              </div>
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
