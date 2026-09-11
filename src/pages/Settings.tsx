import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '@/store';
import { RollNumberRange, MADRASA_CLASSES, SCHOOL_CLASSES } from '@/types';
import { toast } from 'sonner';
import { Shield, Building, Save, Hash, RotateCcw, AlertTriangle, Check, BookOpen, Plus, X, Trash2 } from 'lucide-react';

export default function Settings() {
  const { state, dispatch } = useApp();
  const isUrdu = state.language === 'ur';

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'subjects' | 'rollnumbers'>('profile');
  const [profileData, setProfileData] = useState(state.institutionProfile);

  const [securityData, setSecurityData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  // Local edits for roll number ranges
  const [rangeEdits, setRangeEdits] = useState<Record<string, { rangeStart: string; rangeEnd: string }>>({});
  const [rangeErrors, setRangeErrors] = useState<Record<string, string>>({});

  const [subjectSessionId, setSubjectSessionId] = useState<string>('global');
  const [subjectDepartment, setSubjectDepartment] = useState<'school' | 'madrasa'>('school');
  const [subjectClassName, setSubjectClassName] = useState<string>(SCHOOL_CLASSES[0]);
  const [subjectDraft, setSubjectDraft] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');

  const handleSaveProfile = () => {
    dispatch({ type: 'SAVE_INSTITUTION_PROFILE', payload: profileData });
    toast.success(isUrdu ? 'ترتیبات محفوظ ہو گئیں' : 'Profile settings saved successfully');
  };

  const handleUpdatePassword = () => {
    if (!securityData.currentPassword || !securityData.newPassword || !securityData.confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (securityData.currentPassword !== state.adminPassword) {
      toast.error('Current password is incorrect');
      return;
    }
    dispatch({ type: 'SET_ADMIN_PASSWORD', payload: securityData.newPassword });
    toast.success('Password updated successfully');
    setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const getRangeValue = (range: RollNumberRange, field: 'rangeStart' | 'rangeEnd') => {
    const edit = rangeEdits[range.id];
    if (edit) return edit[field];
    return String(range[field]);
  };

  const setRangeValue = (rangeId: string, field: 'rangeStart' | 'rangeEnd', value: string) => {
    setRangeEdits(prev => ({
      ...prev,
      [rangeId]: { rangeStart: getRangeForId(rangeId, 'rangeStart'), rangeEnd: getRangeForId(rangeId, 'rangeEnd'), [field]: value },
    }));
  };

  const getRangeForId = (id: string, field: 'rangeStart' | 'rangeEnd') => {
    const edit = rangeEdits[id];
    if (edit) return edit[field];
    const range = state.rollNumberRanges.find(r => r.id === id);
    return String(range?.[field] ?? '');
  };

  const validateRanges = () => {
    const errors: Record<string, string> = {};
    const sortedRanges = state.rollNumberRanges.map(r => ({
      ...r,
      rangeStart: Number(getRangeValue(r, 'rangeStart')),
      rangeEnd: Number(getRangeValue(r, 'rangeEnd')),
    }));
    // Check each range is valid
    for (const r of sortedRanges) {
      if (!Number.isInteger(r.rangeStart) || !Number.isInteger(r.rangeEnd) || r.rangeStart < 1 || r.rangeEnd < 1 || r.rangeStart >= r.rangeEnd) {
        errors[r.id] = 'Start must be less than end';
      }
    }
    // Check overlaps within department
    for (let i = 0; i < sortedRanges.length; i++) {
      for (let j = i + 1; j < sortedRanges.length; j++) {
        const a = sortedRanges[i], b = sortedRanges[j];
        if (a.department !== b.department) continue;
        if (a.rangeStart <= b.rangeEnd && b.rangeStart <= a.rangeEnd) {
          errors[a.id] = `Overlaps with ${b.className}`;
          errors[b.id] = `Overlaps with ${a.className}`;
        }
      }
    }
    setRangeErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveRanges = () => {
    if (!validateRanges()) {
      toast.error(isUrdu ? 'رول نمبر رینج میں غلطی ہے' : 'Please fix range errors before saving');
      return;
    }
    // Apply all edits
    Object.entries(rangeEdits).forEach(([id, edit]) => {
      const range = state.rollNumberRanges.find(r => r.id === id);
      if (!range) return;
      dispatch({
        type: 'UPDATE_ROLL_RANGE',
        payload: {
          ...range,
          rangeStart: Number(edit.rangeStart),
          rangeEnd: Number(edit.rangeEnd),
        },
      });
    });
    setRangeEdits({});
    toast.success(isUrdu ? 'رول نمبر رینج محفوظ ہو گئی' : 'Roll number ranges saved');
  };

  const handleResetRanges = () => {
    if (!confirm(isUrdu ? 'کیا آپ واقعی ڈیفالٹ رینج بحال کرنا چاہتے ہیں؟' : 'Reset all ranges to default values?')) return;
    dispatch({ type: 'RESET_ROLL_RANGES' });
    setRangeEdits({});
    setRangeErrors({});
    toast.success(isUrdu ? 'رینج بحال ہو گئی' : 'Ranges reset to defaults');
  };

  const schoolRanges = state.rollNumberRanges.filter(r => r.department === 'school');
  const madrasaRanges = state.rollNumberRanges.filter(r => r.department === 'madrasa');
  const hasEdits = Object.keys(rangeEdits).length > 0;

  const classOptions = subjectDepartment === 'school' ? [...SCHOOL_CLASSES] : [...MADRASA_CLASSES];

  const defaultSubjectsForDepartment = useMemo(
    () => subjectDepartment === 'madrasa'
      ? ['Quran (Nazira)', 'Hifz', 'Tajweed', 'Hadees', 'Fiqh', 'Aqaid', 'Arabic', 'Urdu']
      : ['English', 'Urdu', 'Mathematics', 'General Science', 'Islamiat', 'Social Studies', 'Computer'],
    [subjectDepartment]
  );

  useEffect(() => {
    if (!classOptions.includes(subjectClassName)) {
      setSubjectClassName(classOptions[0]);
    }
  }, [classOptions, subjectClassName]);

  useEffect(() => {
    const config = state.subjectConfigs.find(c =>
      c.department === subjectDepartment
      && c.className === subjectClassName
      && (c.sessionId ?? 'global') === subjectSessionId
    );

    if (config) {
      setSubjectDraft(config.subjects);
      return;
    }

    // If no session-specific config exists, prefill from global config or defaults.
    const globalConfig = state.subjectConfigs.find(c =>
      c.department === subjectDepartment
      && c.className === subjectClassName
      && !c.sessionId
    );
    setSubjectDraft(globalConfig?.subjects ?? defaultSubjectsForDepartment);
  }, [
    state.subjectConfigs,
    subjectDepartment,
    subjectClassName,
    subjectSessionId,
    defaultSubjectsForDepartment,
  ]);

  const handleAddSubject = () => {
    const clean = newSubject.trim();
    if (!clean) return;
    if (subjectDraft.some(s => s.toLowerCase() === clean.toLowerCase())) {
      toast.error(isUrdu ? 'یہ مضمون پہلے سے موجود ہے' : 'Subject already exists');
      return;
    }
    setSubjectDraft([...subjectDraft, clean]);
    setNewSubject('');
  };

  const handleSaveSubjects = () => {
    const sanitized = subjectDraft.map(s => s.trim()).filter(Boolean);
    if (sanitized.length === 0) {
      toast.error(isUrdu ? 'کم از کم ایک مضمون شامل کریں' : 'Please keep at least one subject');
      return;
    }

    const existing = state.subjectConfigs.find(c =>
      c.department === subjectDepartment
      && c.className === subjectClassName
      && (c.sessionId ?? 'global') === subjectSessionId
    );

    dispatch({
      type: 'UPSERT_SUBJECT_CONFIG',
      payload: {
        id: existing?.id ?? `subject-${subjectDepartment}-${subjectClassName.replace(/\s+/g, '-').toLowerCase()}-${subjectSessionId}`,
        department: subjectDepartment,
        className: subjectClassName,
        subjects: sanitized,
        sessionId: subjectSessionId === 'global' ? undefined : subjectSessionId,
      },
    });
    toast.success(isUrdu ? 'مضامین محفوظ ہو گئے' : 'Subjects saved successfully');
  };

  const handleResetSubjects = () => {
    setSubjectDraft(defaultSubjectsForDepartment);
    toast.success(isUrdu ? 'ڈیفالٹ مضامین بحال ہو گئے' : 'Default subjects restored');
  };

  const handleDeleteSubjectConfig = () => {
    const existing = state.subjectConfigs.find(c =>
      c.department === subjectDepartment
      && c.className === subjectClassName
      && (c.sessionId ?? 'global') === subjectSessionId
    );
    if (!existing) return;
    dispatch({ type: 'DELETE_SUBJECT_CONFIG', payload: existing.id });
    toast.success(isUrdu ? 'اس ترتیب کو حذف کر دیا گیا' : 'This subject configuration was deleted');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#E4572E]">{isUrdu ? 'ترتیبات' : 'Settings'}</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'profile', label: isUrdu ? 'پروفائل' : 'Profile', icon: Building },
          { key: 'security', label: isUrdu ? 'سیکیورٹی' : 'Security', icon: Shield },
          { key: 'subjects', label: isUrdu ? 'مضامین' : 'Subjects', icon: BookOpen },
          { key: 'rollnumbers', label: isUrdu ? 'رول نمبر رینج' : 'Roll Number Ranges', icon: Hash },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${activeTab === tab.key ? 'neu-raised text-[#E4572E]' : 'neu-btn opacity-60'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="neu-raised rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--neu-dark)]/20">
            <Building className="w-6 h-6 text-[#E4572E]" />
            <h3 className="text-lg font-bold">{isUrdu ? 'ادارے کی پروفائل' : 'Institution Profile'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-1.5 opacity-70">Institution Name (English)</label>
              <input className="neu-input w-full rounded-xl px-4 py-2.5 h-11" value={profileData.nameEn} onChange={e => setProfileData({ ...profileData, nameEn: e.target.value })} dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 opacity-70">Institution Name (Urdu)</label>
              <input className="neu-input w-full rounded-xl px-4 py-2.5 h-11 urdu-text text-lg" value={profileData.nameUr} onChange={e => setProfileData({ ...profileData, nameUr: e.target.value })} dir="rtl" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 opacity-70">Email Address</label>
              <input type="email" className="neu-input w-full rounded-xl px-4 py-2.5 h-11" value={profileData.email} onChange={e => setProfileData({ ...profileData, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 opacity-70">Phone Number</label>
              <input className="neu-input w-full rounded-xl px-4 py-2.5 h-11" value={profileData.phone} onChange={e => setProfileData({ ...profileData, phone: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1.5 opacity-70">Address</label>
              <textarea className="neu-input w-full rounded-xl px-4 py-3 resize-none h-24" value={profileData.address} onChange={e => setProfileData({ ...profileData, address: e.target.value })} />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={handleSaveProfile} className="neu-btn-primary px-6 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isUrdu ? 'محفوظ کریں' : 'Save Profile'}
            </button>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="neu-raised rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--neu-dark)]/20">
            <Shield className="w-6 h-6 text-[#E4572E]" />
            <h3 className="text-lg font-bold">{isUrdu ? 'پاسورڈ تبدیل کریں' : 'Change Password'}</h3>
          </div>
          <div className="max-w-md space-y-4">
            {[
              { label: isUrdu ? 'موجودہ پاسورڈ' : 'Current Password', key: 'currentPassword' },
              { label: isUrdu ? 'نیا پاسورڈ' : 'New Password', key: 'newPassword' },
              { label: isUrdu ? 'نیا پاسورڈ دوبارہ' : 'Confirm New Password', key: 'confirmPassword' },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{field.label}</label>
                <input
                  type="password"
                  className="neu-input w-full rounded-xl px-4 py-2.5 h-11"
                  value={securityData[field.key as keyof typeof securityData]}
                  onChange={e => setSecurityData({ ...securityData, [field.key]: e.target.value })}
                />
              </div>
            ))}
            <button onClick={handleUpdatePassword} className="neu-btn-primary px-6 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 mt-2">
              <Shield className="w-4 h-4" />
              {isUrdu ? 'پاسورڈ اپڈیٹ کریں' : 'Update Password'}
            </button>
          </div>
        </div>
      )}

      {/* Subjects Tab */}
      {activeTab === 'subjects' && (
        <div className="space-y-6">
          <div className="neu-inset rounded-2xl p-4 flex gap-3 items-start text-sm">
            <BookOpen className="w-5 h-5 text-[#E4572E] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">{isUrdu ? 'کلاس وار مضامین' : 'Class-wise Subjects'}</p>
              <p className="opacity-70">
                {isUrdu
                  ? 'ہر تعلیمی سال کے لیے الگ مضامین ترتیب دیے جا سکتے ہیں۔ یہی مضامین نتائج میں نمبر درج کرتے وقت ظاہر ہوں گے۔'
                  : 'You can configure separate subjects per class for each session. These subjects will be shown in Results for marks entry.'}
              </p>
            </div>
          </div>

          <div className="neu-raised rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'تعلیمی سال' : 'Session'}</label>
                <div className="neu-inset-sm rounded-xl px-3 py-1">
                  <select
                    className="w-full bg-transparent border-none outline-none h-9 text-sm cursor-pointer"
                    value={subjectSessionId}
                    onChange={e => setSubjectSessionId(e.target.value)}
                  >
                    <option value="global">{isUrdu ? 'تمام سالوں کے لیے (ڈیفالٹ)' : 'Global Default (all sessions)'}</option>
                    {[...state.academicSessions].sort((a, b) => b.startYear - a.startYear).map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'شعبہ' : 'Department'}</label>
                <div className="flex gap-2">
                  {(['school', 'madrasa'] as const).map(d => (
                    <button
                      key={d}
                      onClick={() => setSubjectDepartment(d)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${subjectDepartment === d ? 'neu-raised text-[#E4572E]' : 'neu-btn opacity-60'}`}
                    >
                      {d === 'school' ? (isUrdu ? 'سکول' : 'School') : (isUrdu ? 'مدرسہ' : 'Madrasa')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">{isUrdu ? 'کلاس' : 'Class'}</label>
                <div className="neu-inset-sm rounded-xl px-3 py-1">
                  <select
                    className="w-full bg-transparent border-none outline-none h-9 text-sm cursor-pointer"
                    value={subjectClassName}
                    onChange={e => setSubjectClassName(e.target.value)}
                  >
                    {classOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 opacity-70">
                {isUrdu ? 'مضامین کی فہرست' : 'Subject List'}
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {subjectDraft.map((subject, idx) => (
                  <span key={`${subject}-${idx}`} className="neu-raised rounded-full px-3 py-1.5 text-sm font-medium flex items-center gap-2">
                    {subject}
                    <button
                      onClick={() => setSubjectDraft(subjectDraft.filter((_, i) => i !== idx))}
                      className="opacity-60 hover:opacity-100"
                      aria-label="Remove subject"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  className="neu-input flex-1 rounded-xl px-4 py-2.5 h-11"
                  placeholder={isUrdu ? 'نیا مضمون درج کریں...' : 'Enter new subject name...'}
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubject();
                    }
                  }}
                />
                <button onClick={handleAddSubject} className="neu-btn px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4 text-[#E4572E]" />
                  {isUrdu ? 'شامل کریں' : 'Add Subject'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-end">
              <button onClick={handleResetSubjects} className="neu-btn px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 opacity-70">
                <RotateCcw className="w-4 h-4" />
                {isUrdu ? 'ڈیفالٹ فہرست' : 'Default List'}
              </button>
              <button onClick={handleDeleteSubjectConfig} className="neu-btn px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 text-red-500">
                <Trash2 className="w-4 h-4" />
                {isUrdu ? 'یہ ترتیب حذف کریں' : 'Delete This Config'}
              </button>
              <button onClick={handleSaveSubjects} className="neu-btn-primary px-6 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2">
                <Save className="w-4 h-4" />
                {isUrdu ? 'مضامین محفوظ کریں' : 'Save Subjects'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roll Number Ranges Tab */}
      {activeTab === 'rollnumbers' && (
        <div className="space-y-6">
          {/* Info */}
          <div className="neu-inset rounded-2xl p-4 flex gap-3 items-start text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">{isUrdu ? 'اہم معلومات' : 'Important'}</p>
              <p className="opacity-70">
                {isUrdu
                  ? 'رینج تبدیل کرنے سے پہلے سے موجود رول نمبر متاثر نہیں ہوں گے۔ رینجز کا تداخل نہیں ہونا چاہیے۔'
                  : 'Changing ranges will not affect existing roll numbers. Ranges must not overlap within the same department.'}
              </p>
            </div>
          </div>

          {/* School Ranges */}
          <div className="neu-raised rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
              <Building className="w-5 h-5 text-[#5c8aff]" />
              {isUrdu ? 'سکول سیکشن' : 'School Section'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--neu-dark)]/20">
                    <th className="text-left py-3 px-2 font-semibold opacity-60 text-xs">{isUrdu ? 'جماعت' : 'Class'}</th>
                    <th className="text-left py-3 px-2 font-semibold opacity-60 text-xs">{isUrdu ? 'آغاز' : 'Range Start'}</th>
                    <th className="text-left py-3 px-2 font-semibold opacity-60 text-xs">{isUrdu ? 'اختتام' : 'Range End'}</th>
                    <th className="text-left py-3 px-2 font-semibold opacity-60 text-xs">{isUrdu ? 'استعمال شدہ' : 'Used'}</th>
                    <th className="text-left py-3 px-2 font-semibold opacity-60 text-xs">{isUrdu ? 'حالت' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {schoolRanges.map(range => {
                    const usedCount = state.students.filter(s => s.department === 'school' && s.class === range.className && s.rollNo).length;
                    const capacity = range.rangeEnd - range.rangeStart + 1;
                    const hasError = !!rangeErrors[range.id];
                    return (
                      <tr key={range.id} className="border-b border-[var(--neu-dark)]/10 last:border-0">
                        <td className="py-3 px-2 font-medium">{range.className}</td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            className={`neu-input rounded-lg px-3 py-1.5 h-9 w-28 text-sm ${hasError ? 'border border-red-400' : ''}`}
                            value={getRangeValue(range, 'rangeStart')}
                            onChange={e => setRangeValue(range.id, 'rangeStart', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            className={`neu-input rounded-lg px-3 py-1.5 h-9 w-28 text-sm ${hasError ? 'border border-red-400' : ''}`}
                            value={getRangeValue(range, 'rangeEnd')}
                            onChange={e => setRangeValue(range.id, 'rangeEnd', e.target.value)}
                          />
                        </td>
                        <td className="py-3 px-2 text-sm opacity-70">{usedCount} / {capacity}</td>
                        <td className="py-3 px-2">
                          {hasError
                            ? <span className="text-xs text-red-500">{rangeErrors[range.id]}</span>
                            : rangeEdits[range.id]
                              ? <span className="text-xs text-amber-600 font-semibold">{isUrdu ? 'غیر محفوظ' : 'Unsaved'}</span>
                              : <Check className="w-4 h-4 text-[#27ae60]" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Madrasa Ranges */}
          <div className="neu-raised rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
              <Hash className="w-5 h-5 text-[#E4572E]" />
              {isUrdu ? 'مدرسہ سیکشن' : 'Madrasa Section'}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--neu-dark)]/20">
                    <th className="text-right py-3 px-2 font-semibold opacity-60 text-xs">{isUrdu ? 'جماعت' : 'Class'}</th>
                    <th className="text-left py-3 px-2 font-semibold opacity-60 text-xs">{isUrdu ? 'آغاز' : 'Range Start'}</th>
                    <th className="text-left py-3 px-2 font-semibold opacity-60 text-xs">{isUrdu ? 'اختتام' : 'Range End'}</th>
                    <th className="text-left py-3 px-2 font-semibold opacity-60 text-xs">{isUrdu ? 'استعمال شدہ' : 'Used'}</th>
                    <th className="text-left py-3 px-2 font-semibold opacity-60 text-xs">{isUrdu ? 'حالت' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {madrasaRanges.map(range => {
                    const usedCount = state.students.filter(s => s.department === 'madrasa' && s.class === range.className && s.rollNo).length;
                    const capacity = range.rangeEnd - range.rangeStart + 1;
                    const hasError = !!rangeErrors[range.id];
                    return (
                      <tr key={range.id} className="border-b border-[var(--neu-dark)]/10 last:border-0">
                        <td className="py-3 px-2 font-medium urdu-text text-base" dir="rtl">{range.className}</td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            className={`neu-input rounded-lg px-3 py-1.5 h-9 w-28 text-sm ${hasError ? 'border border-red-400' : ''}`}
                            value={getRangeValue(range, 'rangeStart')}
                            onChange={e => setRangeValue(range.id, 'rangeStart', e.target.value)}
                          />
                        </td>
                        <td className="py-2 px-2">
                          <input
                            type="number"
                            className={`neu-input rounded-lg px-3 py-1.5 h-9 w-28 text-sm ${hasError ? 'border border-red-400' : ''}`}
                            value={getRangeValue(range, 'rangeEnd')}
                            onChange={e => setRangeValue(range.id, 'rangeEnd', e.target.value)}
                          />
                        </td>
                        <td className="py-3 px-2 text-sm opacity-70">{usedCount} / {capacity}</td>
                        <td className="py-3 px-2">
                          {hasError
                            ? <span className="text-xs text-red-500">{rangeErrors[range.id]}</span>
                            : rangeEdits[range.id]
                              ? <span className="text-xs text-amber-600 font-semibold">{isUrdu ? 'غیر محفوظ' : 'Unsaved'}</span>
                              : <Check className="w-4 h-4 text-[#27ae60]" />}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={handleResetRanges} className="neu-btn px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 opacity-70">
              <RotateCcw className="w-4 h-4" />
              {isUrdu ? 'ڈیفالٹ بحال کریں' : 'Reset to Defaults'}
            </button>
            <button
              onClick={handleSaveRanges}
              disabled={!hasEdits}
              className={`px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${hasEdits ? 'neu-btn-primary text-white' : 'neu-btn opacity-40 cursor-not-allowed'}`}
            >
              <Save className="w-4 h-4" />
              {isUrdu ? 'رینج محفوظ کریں' : 'Save Ranges'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
