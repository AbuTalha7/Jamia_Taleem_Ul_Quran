import React, { useMemo, useState } from 'react';
import { Edit, Mail, Phone, Plus, Search, Trash2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/store';
import type { Teacher } from '@/types';

const emptyTeacher: Partial<Teacher> = { name: '', fatherName: '', subject: '', qualification: '', phone: '', email: '', address: '', assignedClasses: [], joiningDate: '', employeeId: '', cnic: '' };

export default function SchoolTeachers() {
  const { state, dispatch } = useApp();
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState<Partial<Teacher>>(emptyTeacher);
  const [open, setOpen] = useState(false);
  const teachers = useMemo(() => state.teachers.filter(teacher => !query || `${teacher.name} ${teacher.subject} ${teacher.employeeId ?? ''}`.toLowerCase().includes(query.toLowerCase())), [state.teachers, query]);
  const update = (key: keyof Teacher, value: string | string[]) => setForm(current => ({ ...current, [key]: value }));
  const save = () => {
    if (!form.name?.trim() || !form.subject?.trim()) { toast.error('Teacher name and subject are required.'); return; }
    if (editing) dispatch({ type: 'UPDATE_TEACHER', payload: { ...editing, ...form } as Teacher });
    else dispatch({ type: 'ADD_TEACHER', payload: { ...emptyTeacher, ...form, id: form.employeeId?.trim() || `teacher-${Date.now()}` } as Teacher });
    toast.success(editing ? 'Teacher updated.' : 'Teacher added.');
    setOpen(false);
  };
  const startEdit = (teacher?: Teacher) => { setEditing(teacher ?? null); setForm(teacher ? { ...teacher } : { ...emptyTeacher }); setOpen(true); };
  return <div className="school-module-page">
    <div className="school-module-heading"><div><span className="school-kicker">PEOPLE</span><h1>Teachers</h1><p>Manage the school teaching team and class assignments.</p></div><button className="school-primary-button" onClick={() => startEdit()}><Plus className="w-4 h-4" /> Add teacher</button></div>
    <div className="school-toolbar"><div className="school-search"><Search className="w-4 h-4" /><input placeholder="Search by name, subject, or teacher ID" value={query} onChange={event => setQuery(event.target.value)} /></div><span>{teachers.length} teachers</span></div>
    <div className="school-table-wrap"><table className="school-table"><thead><tr><th>Teacher</th><th>Contact</th><th>Qualification</th><th>Subjects</th><th>Assigned classes</th><th>Actions</th></tr></thead><tbody>{teachers.map(teacher => <tr key={teacher.id}><td><div className="school-person"><span><UserRound className="w-4 h-4" /></span><div><strong>{teacher.name}</strong><small>{teacher.employeeId || teacher.id}</small></div></div></td><td><div>{teacher.email && <div><Mail className="inline w-3 h-3" /> {teacher.email}</div>}<div><Phone className="inline w-3 h-3" /> {teacher.phone || 'No phone'}</div></div></td><td>{teacher.qualification || '-'}</td><td>{teacher.subject}</td><td>{teacher.assignedClasses?.join(', ') || '-'}</td><td><div className="school-row-actions"><button title="Edit teacher" onClick={() => startEdit(teacher)}><Edit className="w-4 h-4" /></button><button title="Delete teacher" onClick={() => { dispatch({ type: 'DELETE_TEACHER', payload: teacher.id }); toast.success('Teacher deleted.'); }}><Trash2 className="w-4 h-4" /></button></div></td></tr>)}</tbody></table>{teachers.length === 0 && <div className="school-empty-table">No teachers match this search.</div>}</div>
    {open && <div className="school-dialog-backdrop"><div className="school-dialog"><div className="school-dialog-heading"><div><span className="school-kicker">TEACHER RECORD</span><h2>{editing ? 'Edit teacher' : 'Add teacher'}</h2></div><button onClick={() => setOpen(false)}>Close</button></div><div className="school-form-grid">
      {([['name', 'Teacher name *'], ['fatherName', "Father's name"], ['employeeId', 'Teacher ID / Employee ID'], ['email', 'Email'], ['phone', 'Contact number'], ['qualification', 'Qualification'], ['joiningDate', 'Joining date']] as const).map(([key, label]) => <label key={key}>{label}<input type={key === 'joiningDate' ? 'date' : key === 'email' ? 'email' : 'text'} value={(form[key] as string) ?? ''} onChange={event => update(key, event.target.value)} /></label>)}
      <label>Primary subject<input value={form.subject ?? ''} onChange={event => update('subject', event.target.value)} /></label><label>Assigned classes<select multiple value={form.assignedClasses ?? []} onChange={event => update('assignedClasses', Array.from(event.target.selectedOptions, option => option.value))}>{state.schoolClasses.map(className => <option key={className} value={className}>{className}</option>)}</select></label><label className="school-form-wide">Address<textarea value={form.address ?? ''} onChange={event => update('address', event.target.value)} /></label></div><div className="school-dialog-actions"><button className="school-secondary-button" onClick={() => setOpen(false)}>Cancel</button><button className="school-primary-button" onClick={save}>Save teacher</button></div></div></div>}
  </div>;
}
