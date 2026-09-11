import React, { useState } from 'react';
import { useApp } from '@/store';
import { AcademicSession } from '@/types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, CheckCircle2, Archive, CalendarRange, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AcademicSessions() {
  const { state, dispatch } = useApp();
  const isUrdu = state.language === 'ur';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<AcademicSession | null>(null);
  const [formData, setFormData] = useState({ startYear: new Date().getFullYear(), endYear: new Date().getFullYear() + 1 });

  const openCreate = () => {
    const y = new Date().getFullYear();
    setFormData({ startYear: y, endYear: y + 1 });
    setEditingSession(null);
    setDialogOpen(true);
  };

  const openEdit = (s: AcademicSession) => {
    setFormData({ startYear: s.startYear, endYear: s.endYear });
    setEditingSession(s);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (formData.endYear <= formData.startYear) {
      toast.error(isUrdu ? 'اختتامی سال آغاز سے زیادہ ہونا چاہیے' : 'End year must be greater than start year');
      return;
    }
    const name = `${formData.startYear}-${formData.endYear}`;
    // Check duplicate
    const duplicate = state.academicSessions.find(s =>
      s.name === name && s.id !== editingSession?.id
    );
    if (duplicate) {
      toast.error(isUrdu ? 'یہ تعلیمی سال پہلے سے موجود ہے' : 'This academic session already exists');
      return;
    }

    if (editingSession) {
      dispatch({
        type: 'UPDATE_SESSION',
        payload: { ...editingSession, name, startYear: formData.startYear, endYear: formData.endYear },
      });
      toast.success(isUrdu ? 'تعلیمی سال اپڈیٹ ہو گیا' : 'Session updated successfully');
    } else {
      const newSession: AcademicSession = {
        id: `session-${Date.now()}`,
        name,
        startYear: formData.startYear,
        endYear: formData.endYear,
        status: 'archived',
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_SESSION', payload: newSession });
      toast.success(isUrdu ? 'نیا تعلیمی سال شامل ہو گیا' : 'New session created');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const studentCount = state.students.filter(s => s.sessionId === id).length;
    if (studentCount > 0) {
      toast.error(isUrdu
        ? `اس سال میں ${studentCount} طالبات ہیں۔ پہلے ان کو منتقل کریں۔`
        : `${studentCount} students are in this session. Transfer them first.`
      );
      return;
    }
    if (state.academicSessions.length <= 1) {
      toast.error(isUrdu ? 'کم از کم ایک تعلیمی سال ضروری ہے' : 'At least one academic session is required');
      return;
    }
    dispatch({ type: 'DELETE_SESSION', payload: id });
    toast.success(isUrdu ? 'تعلیمی سال حذف ہو گیا' : 'Session deleted');
  };

  const handleSetActive = (id: string) => {
    dispatch({ type: 'SET_ACTIVE_SESSION', payload: id });
    toast.success(isUrdu ? 'فعال سال تبدیل ہو گیا' : 'Active session updated');
  };

  const sorted = [...state.academicSessions].sort((a, b) => b.startYear - a.startYear);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#E4572E]">
            {isUrdu ? 'تعلیمی سال' : 'Academic Sessions'}
          </h2>
          <p className="text-sm opacity-60 mt-1">
            {isUrdu
              ? 'ہر سال کے داخلوں کو الگ رکھنے کے لیے تعلیمی سال بنائیں'
              : 'Manage academic years to keep admissions organized per session'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="neu-btn-primary px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          {isUrdu ? 'نیا سال' : 'New Session'}
        </button>
      </div>

      {/* Info Card */}
      <div className="neu-inset rounded-2xl p-5 flex gap-4 items-start">
        <CalendarRange className="w-6 h-6 text-[#E4572E] shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-semibold mb-1">{isUrdu ? 'تعلیمی سال کے بارے میں' : 'About Academic Sessions'}</p>
          <p className="opacity-70 leading-relaxed">
            {isUrdu
              ? 'فعال سال نئے داخلوں کے لیے خودبخود استعمال ہوتا ہے۔ آپ ہیڈر میں موجود سال منتخب کنندہ سے کسی بھی سال کے ریکارڈ دیکھ سکتے ہیں۔ پرانے سالوں کا ڈیٹا محفوظ رہتا ہے۔'
              : 'The active session is automatically used for new admissions. Use the session selector in the header to view records for any year. Historical data from past sessions is always preserved.'}
          </p>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sorted.map((session, i) => {
          const studentCount = state.students.filter(s => s.sessionId === session.id).length;
          const isActive = session.id === state.activeSessionId;
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`neu-raised rounded-2xl p-6 relative overflow-hidden ${isActive ? 'ring-2 ring-[#E4572E]/30' : ''}`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E4572E] to-[#ff7a5c]" />
              )}

              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-[#E4572E]">{session.name}</h3>
                  <p className="text-xs opacity-50 mt-0.5">
                    {isUrdu ? 'تعلیمی سال' : 'Academic Year'}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  isActive
                    ? 'bg-[#27ae60]/15 text-[#27ae60]'
                    : 'bg-[rgba(200,200,200,0.2)] text-gray-500'
                }`}>
                  {isActive
                    ? (isUrdu ? 'فعال' : 'Active')
                    : (isUrdu ? 'محفوظ' : 'Archived')}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-6 neu-inset-sm rounded-xl px-4 py-3">
                <Users className="w-4 h-4 text-[#E4572E] opacity-70" />
                <span className="text-sm font-semibold">{studentCount}</span>
                <span className="text-sm opacity-60">{isUrdu ? 'طالبات' : 'Students'}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {!isActive && (
                  <button
                    onClick={() => handleSetActive(session.id)}
                    className="neu-btn px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-[#27ae60]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isUrdu ? 'فعال کریں' : 'Set Active'}
                  </button>
                )}
                <button
                  onClick={() => openEdit(session)}
                  className="neu-btn px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  {isUrdu ? 'ترمیم' : 'Edit'}
                </button>
                {!isActive && (
                  <button
                    onClick={() => handleDelete(session.id)}
                    className="neu-btn px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {isUrdu ? 'حذف' : 'Delete'}
                  </button>
                )}
              </div>

              {isActive && (
                <p className="text-xs opacity-40 mt-3 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {isUrdu ? 'نئے داخلوں کے لیے استعمال ہو رہا ہے' : 'Currently used for new admissions'}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="neu-raised rounded-2xl p-12 text-center">
          <Archive className="w-12 h-12 opacity-20 mx-auto mb-4" />
          <p className="opacity-50">{isUrdu ? 'کوئی تعلیمی سال نہیں' : 'No academic sessions yet'}</p>
          <button onClick={openCreate} className="mt-4 neu-btn-primary px-5 py-2.5 rounded-xl text-white text-sm font-semibold">
            {isUrdu ? 'پہلا سال بنائیں' : 'Create First Session'}
          </button>
        </div>
      )}

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 neu-raised rounded-2xl p-8 w-full max-w-md"
          >
            <h3 className="text-xl font-bold mb-6">
              {editingSession
                ? (isUrdu ? 'سال میں ترمیم' : 'Edit Session')
                : (isUrdu ? 'نیا تعلیمی سال' : 'New Academic Session')}
            </h3>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 opacity-70">
                    {isUrdu ? 'آغاز سال' : 'Start Year'}
                  </label>
                  <input
                    type="number"
                    className="neu-input w-full rounded-xl px-4 py-2.5 h-11"
                    value={formData.startYear}
                    min={2000}
                    max={2100}
                    onChange={e => {
                      const y = parseInt(e.target.value) || new Date().getFullYear();
                      setFormData({ startYear: y, endYear: y + 1 });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5 opacity-70">
                    {isUrdu ? 'اختتام سال' : 'End Year'}
                  </label>
                  <input
                    type="number"
                    className="neu-input w-full rounded-xl px-4 py-2.5 h-11"
                    value={formData.endYear}
                    min={2001}
                    max={2101}
                    onChange={e => setFormData({ ...formData, endYear: parseInt(e.target.value) || formData.startYear + 1 })}
                  />
                </div>
              </div>

              <div className="neu-inset-sm rounded-xl px-4 py-3 text-sm">
                <span className="opacity-60">{isUrdu ? 'سال کا نام:' : 'Session name:'}</span>
                <span className="font-bold text-[#E4572E] ml-2">{formData.startYear}-{formData.endYear}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button className="neu-btn px-5 py-2.5 rounded-xl text-sm font-medium" onClick={() => setDialogOpen(false)}>
                {isUrdu ? 'منسوخ' : 'Cancel'}
              </button>
              <button className="neu-btn-primary px-5 py-2.5 rounded-xl text-white text-sm font-semibold" onClick={handleSave}>
                {isUrdu ? 'محفوظ کریں' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
