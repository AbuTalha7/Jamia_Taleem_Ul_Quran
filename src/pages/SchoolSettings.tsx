import React, { useEffect, useState } from 'react';
import { Check, Edit, Hash, Plus, Save, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/store';

export default function SchoolSettings() {
  const { state, dispatch } = useApp();
  const [newClass, setNewClass] = useState('');
  const [selectedClass, setSelectedClass] = useState(state.schoolClasses[0] ?? '');
  const [selectedRollClass, setSelectedRollClass] = useState(state.schoolClasses[0] ?? '');
  const [newSubject, setNewSubject] = useState('');
  const [editingClass, setEditingClass] = useState<number | null>(null);
  const [editingClassValue, setEditingClassValue] = useState('');
  const [editingSubject, setEditingSubject] = useState<number | null>(null);
  const [editingSubjectValue, setEditingSubjectValue] = useState('');
  const [range, setRange] = useState({ start: 0, end: 0 });
  const subjects = state.schoolSubjectsByClass[selectedClass] ?? [];

  useEffect(() => {
    const configured = state.rollNumberRanges.find(item => item.department === 'school' && item.className === selectedRollClass);
    setRange(configured ? { start: configured.rangeStart, end: configured.rangeEnd } : { start: 0, end: 0 });
  }, [selectedRollClass, state.rollNumberRanges]);

  const addClass = () => {
    const value = newClass.trim();
    if (!value || state.schoolClasses.includes(value)) return;
    dispatch({ type: 'SET_SCHOOL_CLASSES', payload: [...state.schoolClasses, value] });
    dispatch({ type: 'SET_SCHOOL_CLASS_SUBJECTS', payload: { className: value, subjects: [] } });
    setSelectedClass(value);
    setSelectedRollClass(value);
    setNewClass('');
    toast.success('School class added.');
  };

  const saveClass = (index: number) => {
    const value = editingClassValue.trim();
    const oldValue = state.schoolClasses[index];
    if (!value || state.schoolClasses.some((item, itemIndex) => item === value && itemIndex !== index)) return;
    dispatch({ type: 'SET_SCHOOL_CLASSES', payload: state.schoolClasses.map((item, itemIndex) => itemIndex === index ? value : item) });
    dispatch({ type: 'SET_SCHOOL_CLASS_SUBJECTS', payload: { className: value, subjects: state.schoolSubjectsByClass[oldValue] ?? [] } });
    if (selectedClass === oldValue) setSelectedClass(value);
    setEditingClass(null);
  };

  const removeClass = (className: string) => {
    if (!confirm(`Delete ${className} and its subject list?`)) return;
    const remaining = state.schoolClasses.filter(item => item !== className);
    dispatch({ type: 'SET_SCHOOL_CLASSES', payload: remaining });
    setSelectedClass(selectedClass === className ? (remaining[0] ?? '') : selectedClass);
  };

  const addSubject = () => {
    const value = newSubject.trim();
    if (!selectedClass || !value || subjects.includes(value)) return;
    dispatch({ type: 'SET_SCHOOL_CLASS_SUBJECTS', payload: { className: selectedClass, subjects: [...subjects, value] } });
    setNewSubject('');
    toast.success(`${value} added to ${selectedClass}.`);
  };

  const saveSubject = (index: number) => {
    const value = editingSubjectValue.trim();
    if (!value || subjects.some((item, itemIndex) => item === value && itemIndex !== index)) return;
    dispatch({ type: 'SET_SCHOOL_CLASS_SUBJECTS', payload: { className: selectedClass, subjects: subjects.map((item, itemIndex) => itemIndex === index ? value : item) } });
    setEditingSubject(null);
  };

  const removeSubject = (index: number) => dispatch({ type: 'SET_SCHOOL_CLASS_SUBJECTS', payload: { className: selectedClass, subjects: subjects.filter((_, itemIndex) => itemIndex !== index) } });
  const saveRange = () => {
    if (!selectedRollClass || !Number.isInteger(range.start) || !Number.isInteger(range.end) || range.start < 1 || range.start >= range.end) {
      toast.error('Enter a valid starting and ending roll number.');
      return;
    }
    dispatch({ type: 'SET_SCHOOL_CLASS_ROLL_RANGE', payload: { className: selectedRollClass, rangeStart: range.start, rangeEnd: range.end } });
    toast.success(`${selectedRollClass} roll-number range saved.`);
  };

  return <div className="school-module-page">
    <div className="school-module-heading"><div><span className="school-kicker">SCHOOL CONFIGURATION</span><h1>School settings</h1><p>Configure classes, class-specific subjects, and roll numbers for the School Portal only.</p></div></div>
    <div className="school-settings-grid">
      <section className="school-settings-panel"><div className="school-settings-title"><Hash /><div><h2>Roll number settings</h2><p>Select a class first, then manage only its allowed roll-number range.</p></div></div><label className="school-class-picker">Class<select value={selectedRollClass} onChange={event => setSelectedRollClass(event.target.value)}><option value="">Select a class</option>{state.schoolClasses.map(className => <option key={className} value={className}>{className}</option>)}</select></label>{selectedRollClass ? <><div className="school-subject-context"><strong>{selectedRollClass}</strong><span>Class-specific range</span></div><div className="school-range-fields"><label>Starting roll number<input type="number" min="1" value={range.start || ''} onChange={event => setRange({ ...range, start: Number(event.target.value) })} /></label><label>Ending roll number<input type="number" min="1" value={range.end || ''} onChange={event => setRange({ ...range, end: Number(event.target.value) })} /></label></div><button className="school-primary-button" onClick={saveRange}><Save className="w-4 h-4" /> Save {selectedRollClass} range</button></> : <p className="school-empty-table">Select a class to view its roll-number range.</p>}</section>
      <section className="school-settings-panel"><div className="school-settings-title"><Check /><div><h2>Classes</h2><p>{state.schoolClasses.length} school classes</p></div></div><div className="school-add-line"><input placeholder="New class name" value={newClass} onChange={event => setNewClass(event.target.value)} onKeyDown={event => event.key === 'Enter' && addClass()} /><button title="Add class" onClick={addClass}><Plus className="w-4 h-4" /></button></div><div className="school-settings-list">{state.schoolClasses.map((className, index) => <div key={`${className}-${index}`}>{editingClass === index ? <input value={editingClassValue} onChange={event => setEditingClassValue(event.target.value)} /> : <button className={`school-class-select ${selectedClass === className ? 'selected' : ''}`} onClick={() => setSelectedClass(className)}>{className}</button>}<div>{editingClass === index ? <><button title="Save class" onClick={() => saveClass(index)}><Check className="w-4 h-4" /></button><button title="Cancel" onClick={() => setEditingClass(null)}><X className="w-4 h-4" /></button></> : <><button title="Edit class" onClick={() => { setEditingClass(index); setEditingClassValue(className); }}><Edit className="w-4 h-4" /></button><button title="Delete class" onClick={() => removeClass(className)}><Trash2 className="w-4 h-4" /></button></>}</div></div>)}</div></section>
      <section className="school-settings-panel"><div className="school-settings-title"><Check /><div><h2>Subjects by class</h2><p>Select a class first. Only that class's subjects are shown and changed.</p></div></div><label className="school-class-picker">Class<select value={selectedClass} onChange={event => { setSelectedClass(event.target.value); setEditingSubject(null); }}><option value="">Select a class</option>{state.schoolClasses.map(className => <option key={className} value={className}>{className}</option>)}</select></label>{selectedClass ? <><div className="school-subject-context"><strong>{selectedClass}</strong><span>{subjects.length} assigned subjects</span></div><div className="school-add-line"><input placeholder={`Add subject to ${selectedClass}`} value={newSubject} onChange={event => setNewSubject(event.target.value)} onKeyDown={event => event.key === 'Enter' && addSubject()} /><button title="Add subject" onClick={addSubject}><Plus className="w-4 h-4" /></button></div><div className="school-settings-list">{subjects.map((subject, index) => <div key={`${selectedClass}-${subject}-${index}`}>{editingSubject === index ? <input value={editingSubjectValue} onChange={event => setEditingSubjectValue(event.target.value)} /> : <span>{subject}</span>}<div>{editingSubject === index ? <><button title="Save subject" onClick={() => saveSubject(index)}><Check className="w-4 h-4" /></button><button title="Cancel" onClick={() => setEditingSubject(null)}><X className="w-4 h-4" /></button></> : <><button title="Edit subject" onClick={() => { setEditingSubject(index); setEditingSubjectValue(subject); }}><Edit className="w-4 h-4" /></button><button title="Remove subject" onClick={() => removeSubject(index)}><Trash2 className="w-4 h-4" /></button></>}</div></div>)}{subjects.length === 0 && <p className="school-empty-table">No subjects assigned to {selectedClass} yet.</p>}</div></> : <p className="school-empty-table">Select a class to view its subjects.</p>}</section>
    </div>
  </div>;
}
