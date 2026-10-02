import React, { useState } from 'react';
import { useApp } from '@/store';
import { Teacher } from '@/types';
import { toast } from 'sonner';
import { Plus, Search, Edit, Trash2, Printer } from 'lucide-react';
import { printRecord } from '@/lib/print';

const CNIC_REGEX = /^\d{5}-\d{7}-\d{1}$/;
const PHONE_REGEX = /^\d{11}$/;

export default function Teachers() {
  const { state, dispatch, t } = useApp();
  const isUrdu = state.language === 'ur';
  const copy = isUrdu ? {
    title: 'اساتذہ', search: 'نام یا مضمون سے تلاش...', add: 'استاد شامل کریں', printAll: 'تمام اساتذہ پرنٹ', name: 'نام', subject: 'مضمون', qualification: 'قابلیت', cnic: 'شناختی کارڈ', phone: 'فون', actions: 'اقدامات', edit: 'ترمیم', delete: 'حذف', noTeachers: 'کوئی استاد نہیں ملا', editTeacher: 'استاد میں ترمیم', addTeacher: 'استاد شامل کریں', cancel: 'منسوخ', save: 'محفوظ کریں', print: 'استاد کا ریکارڈ پرنٹ کریں',
  } : {
    title: 'Teachers', search: 'Search by name or subject...', add: 'Add Teacher', printAll: 'Print All Teachers', name: 'Name', subject: 'Subject', qualification: 'Qualification', cnic: 'CNIC', phone: 'Phone', actions: 'Actions', edit: 'Edit', delete: 'Delete', noTeachers: 'No teachers found.', editTeacher: 'Edit Teacher', addTeacher: 'Add Teacher', cancel: 'Cancel', save: 'Save', print: 'Print Teacher Record',
  };

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [errors, setErrors] = useState<{ cnic?: string; phone?: string }>({});

  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '', subject: '', qualification: '', cnic: '', phone: ''
  });

  const filteredTeachers = state.teachers.filter(t =>
    !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const printTeacher = (teacher: Teacher) => printRecord('Teacher Record', `<table class="record-table"><tbody>
    <tr><th>Name</th><td>${teacher.name}</td></tr>
    <tr><th>Teacher ID</th><td>${teacher.id}</td></tr>
    <tr><th>Subject</th><td>${teacher.subject}</td></tr>
    <tr><th>Qualification</th><td>${teacher.qualification || '-'}</td></tr>
    <tr><th>CNIC</th><td>${teacher.cnic || '-'}</td></tr>
    <tr><th>Phone</th><td>${teacher.phone || '-'}</td></tr>
  </tbody></table>`);

  const printTeachers = () => printRecord('Teacher List', `<table class="print-table"><thead><tr><th>#</th><th>Name</th><th>Subject</th><th>Qualification</th><th>CNIC</th><th>Phone</th></tr></thead><tbody>${filteredTeachers.map((teacher, index) => `<tr><td>${index + 1}</td><td>${teacher.name}</td><td>${teacher.subject}</td><td>${teacher.qualification || '-'}</td><td>${teacher.cnic || '-'}</td><td>${teacher.phone || '-'}</td></tr>`).join('')}</tbody></table>`, { landscape: true });

  const handleCnicChange = (val: string) => {
    setFormData({ ...formData, cnic: val });
    if (val && !CNIC_REGEX.test(val)) {
      setErrors(e => ({ ...e, cnic: 'Please provide a valid CNIC in the format XXXXX-XXXXXXX-X.' }));
    } else {
      setErrors(e => ({ ...e, cnic: undefined }));
    }
  };

  const handlePhoneChange = (val: string) => {
    setFormData({ ...formData, phone: val });
    if (val && !PHONE_REGEX.test(val)) {
      setErrors(e => ({ ...e, phone: 'Please provide a valid 11-digit mobile number.' }));
    } else {
      setErrors(e => ({ ...e, phone: undefined }));
    }
  };

  const validateForm = () => {
    const errs: { cnic?: string; phone?: string } = {};
    if (formData.cnic && formData.cnic.trim() !== '' && !CNIC_REGEX.test(formData.cnic.trim())) {
      errs.cnic = 'Please provide a valid CNIC in the format XXXXX-XXXXXXX-X.';
    }
    if (formData.phone && formData.phone.trim() !== '' && !PHONE_REGEX.test(formData.phone.trim())) {
      errs.phone = 'Please provide a valid 11-digit mobile number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!formData.name || !formData.subject) {
      toast.error(isUrdu ? 'ضروری خانے مکمل کریں (نام، مضمون)' : 'Please fill required fields (Name, Subject)');
      return;
    }
    if (!validateForm()) return;

    if (editingTeacher) {
      dispatch({ type: 'UPDATE_TEACHER', payload: { ...editingTeacher, ...formData } as Teacher });
      toast.success(isUrdu ? 'استاد کی معلومات اپڈیٹ ہوئیں' : 'Teacher updated');
    } else {
      dispatch({
        type: 'ADD_TEACHER',
        payload: { id: Math.random().toString(36).substr(2, 9), ...formData } as Teacher
      });
      toast.success(isUrdu ? 'استاد شامل ہو گیا' : 'Teacher added');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      dispatch({ type: 'DELETE_TEACHER', payload: id });
      toast.success(isUrdu ? 'استاد حذف ہو گیا' : 'Teacher deleted');
    }
  };

  const openDialog = (teacher?: Teacher) => {
    setErrors({});
    if (teacher) {
      setEditingTeacher(teacher);
      setFormData(teacher);
    } else {
      setEditingTeacher(null);
      setFormData({ name: '', subject: '', qualification: '', cnic: '', phone: '' });
    }
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-[#E4572E]">{copy.title}</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="neu-inset-sm rounded-xl flex items-center px-4 h-11 w-full sm:w-64">
            <Search className="w-4 h-4 text-[#E4572E] shrink-0 mr-2" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="neu-input w-full h-full bg-transparent border-none outline-none text-sm shadow-none"
              placeholder={copy.search}
            />
          </div>
          <button onClick={printTeachers} className="neu-btn px-4 py-2.5 rounded-xl text-sm flex items-center gap-2" title={copy.printAll}>
            <Printer className="w-4 h-4" /> {copy.printAll}
          </button>
          <button onClick={() => openDialog()} className="neu-btn-primary px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2">
            <Plus className="w-4 h-4" /> {copy.add}
          </button>
        </div>
      </div>

      <div className="neu-inset rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--neu-dark)]/20">
                <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">{copy.name}</th>
                <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">{copy.subject}</th>
                <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">{copy.qualification}</th>
                <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">{copy.cnic}</th>
                <th className="px-5 py-4 text-left font-semibold opacity-60 text-xs uppercase tracking-wider">{copy.phone}</th>
                <th className="px-5 py-4 text-right font-semibold opacity-60 text-xs uppercase tracking-wider">{copy.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(t => (
                <tr key={t.id} className="border-b border-[var(--neu-dark)]/10 hover:bg-[rgba(228,87,46,0.03)] transition-colors last:border-0">
                  <td className="px-5 py-3.5 font-medium">{t.name}</td>
                  <td className="px-5 py-3.5 opacity-80">{t.subject}</td>
                  <td className="px-5 py-3.5 opacity-80">{t.qualification}</td>
                  <td className="px-5 py-3.5 font-mono text-xs opacity-70">{t.cnic}</td>
                  <td className="px-5 py-3.5 font-mono text-xs opacity-70">{t.phone}</td>
                  <td className="px-5 py-3.5 flex justify-end gap-2">
                    <button onClick={() => openDialog(t)} className="neu-btn w-9 h-9 rounded-xl flex items-center justify-center text-[#E4572E]" title={copy.edit}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => printTeacher(t)} className="neu-btn w-9 h-9 rounded-xl flex items-center justify-center text-[#1C2E6B]" title={copy.print} aria-label={copy.print}>
                      <Printer className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="neu-btn w-9 h-9 rounded-xl flex items-center justify-center text-red-500" title={copy.delete}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTeachers.length === 0 && (
            <div className="p-8 text-center opacity-50">{copy.noTeachers}</div>
          )}
        </div>
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
          <div className="relative z-10 neu-raised-lg rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto" dir={isUrdu ? 'rtl' : 'ltr'}>
            <h2 className="text-xl font-bold mb-6 text-[#E4572E]">
              {editingTeacher ? copy.editTeacher : copy.addTeacher}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">Name *</label>
                <input className="neu-input w-full rounded-xl px-4 py-2.5 h-11" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">Subject *</label>
                <input className="neu-input w-full rounded-xl px-4 py-2.5 h-11" value={formData.subject || ''} onChange={e => setFormData({ ...formData, subject: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">Qualification</label>
                <input className="neu-input w-full rounded-xl px-4 py-2.5 h-11" value={formData.qualification || ''} onChange={e => setFormData({ ...formData, qualification: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">CNIC <span className="font-normal opacity-50 text-xs">(XXXXX-XXXXXXX-X)</span></label>
                <input
                  className={`neu-input w-full rounded-xl px-4 py-2.5 h-11 ${errors.cnic ? 'border border-red-400' : ''}`}
                  value={formData.cnic || ''}
                  onChange={e => handleCnicChange(e.target.value)}
                  placeholder="e.g. 35201-1234567-8"
                />
                {errors.cnic && <p className="text-xs text-red-500 mt-1">{errors.cnic}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">Mobile Number <span className="font-normal opacity-50 text-xs">(11 digits)</span></label>
                <input
                  className={`neu-input w-full rounded-xl px-4 py-2.5 h-11 ${errors.phone ? 'border border-red-400' : ''}`}
                  value={formData.phone || ''}
                  onChange={e => handlePhoneChange(e.target.value)}
                  placeholder="e.g. 03001234567"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button className="neu-btn px-5 py-2.5 rounded-xl text-sm font-medium" onClick={() => setDialogOpen(false)}>{copy.cancel}</button>
              <button className="neu-btn-primary px-5 py-2.5 rounded-xl text-white text-sm font-semibold" onClick={handleSave}>{copy.save}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
