import React, { useState } from 'react';
import { useApp } from '@/store';
import { Announcement } from '@/types';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';

export default function Announcements() {
  const { state, dispatch, t } = useApp();
  const isUrdu = state.language === 'ur';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState<Partial<Announcement>>({
    title: { en: '', ur: '' },
    content: { en: '', ur: '' },
    date: ''
  });

  const handleSave = () => {
    if (!formData.title?.en || !formData.content?.en || !formData.date) {
      toast.error('Please fill required English fields and date');
      return;
    }

    if (editingAnnouncement) {
      dispatch({
        type: 'UPDATE_ANNOUNCEMENT',
        payload: { ...editingAnnouncement, ...formData } as Announcement
      });
      toast.success('Announcement updated');
    } else {
      dispatch({
        type: 'ADD_ANNOUNCEMENT',
        payload: {
          id: Math.random().toString(36).substr(2, 9),
          ...formData
        } as Announcement
      });
      toast.success('Announcement added');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      dispatch({ type: 'DELETE_ANNOUNCEMENT', payload: id });
      toast.success('Announcement deleted');
    }
  };

  const openDialog = (announcement?: Announcement) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData(JSON.parse(JSON.stringify(announcement))); // deep copy
    } else {
      setEditingAnnouncement(null);
      const today = new Date().toISOString().slice(0, 10);
      setFormData({ title: { en: '', ur: '' }, content: { en: '', ur: '' }, date: today });
    }
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#E4572E]">{isUrdu ? 'اعلانات' : 'Announcements'}</h2>
        <button onClick={() => openDialog()} className="neu-btn-primary px-5 py-2.5 rounded-xl text-white font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Announcement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {state.announcements.map((a) => (
          <div key={a.id} className="neu-raised rounded-2xl p-6 relative overflow-hidden group">
            <div className={`absolute top-0 w-full h-1 bg-[#E4572E] left-0`} />
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold opacity-60 bg-[rgba(228,87,46,0.1)] text-[#E4572E] px-3 py-1 rounded-full w-fit">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(a.date).toLocaleDateString(isUrdu ? 'ur-PK' : 'en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openDialog(a)} className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-[#E4572E]">
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(a.id)} className="neu-btn w-8 h-8 rounded-lg flex items-center justify-center text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <h3 className="font-bold text-lg mb-2">{isUrdu ? a.title.ur || a.title.en : a.title.en || a.title.ur}</h3>
            <p className="text-sm opacity-70 whitespace-pre-wrap leading-relaxed">
              {isUrdu ? a.content.ur || a.content.en : a.content.en || a.content.ur}
            </p>
          </div>
        ))}
        
        {state.announcements.length === 0 && (
          <div className="col-span-1 md:col-span-2 p-12 text-center opacity-50 neu-inset rounded-2xl">
            No announcements found.
          </div>
        )}
      </div>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
          <div className="relative z-10 neu-raised-lg rounded-3xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto" dir={isUrdu ? 'rtl' : 'ltr'}>
            <h2 className="text-xl font-bold mb-6 text-[#E4572E]">
              {editingAnnouncement ? 'Edit Announcement' : 'New Announcement'}
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-1.5 opacity-70">Date *</label>
                <div className="neu-inset-sm rounded-xl px-4 py-2.5 w-fit">
                  <input 
                    type="date"
                    className="bg-transparent border-none outline-none h-6 text-sm" 
                    value={formData.date || ''} 
                    onChange={e => setFormData({...formData, date: e.target.value})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-bold text-sm bg-[rgba(228,87,46,0.1)] text-[#E4572E] px-3 py-1 rounded-full w-fit">English</h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 opacity-70">Title (EN) *</label>
                    <input 
                      className="neu-input w-full rounded-xl px-4 py-2.5 h-11" 
                      value={formData.title?.en || ''} 
                      onChange={e => setFormData({...formData, title: { ...formData.title!, en: e.target.value }})} 
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 opacity-70">Content (EN) *</label>
                    <textarea 
                      className="neu-input w-full rounded-xl px-4 py-3 resize-none h-32" 
                      value={formData.content?.en || ''} 
                      onChange={e => setFormData({...formData, content: { ...formData.content!, en: e.target.value }})} 
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-sm bg-[rgba(228,87,46,0.1)] text-[#E4572E] px-3 py-1 rounded-full w-fit">Urdu</h3>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 opacity-70">Title (UR)</label>
                    <input 
                      className="neu-input w-full rounded-xl px-4 py-2.5 h-11 urdu-text" 
                      value={formData.title?.ur || ''} 
                      onChange={e => setFormData({...formData, title: { ...formData.title!, ur: e.target.value }})} 
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 opacity-70">Content (UR)</label>
                    <textarea 
                      className="neu-input w-full rounded-xl px-4 py-3 resize-none h-32 urdu-text" 
                      value={formData.content?.ur || ''} 
                      onChange={e => setFormData({...formData, content: { ...formData.content!, ur: e.target.value }})} 
                      dir="rtl"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-8">
              <button className="neu-btn px-5 py-2.5 rounded-xl text-sm font-medium" onClick={() => setDialogOpen(false)}>Cancel</button>
              <button className="neu-btn-primary px-5 py-2.5 rounded-xl text-white text-sm font-semibold" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
