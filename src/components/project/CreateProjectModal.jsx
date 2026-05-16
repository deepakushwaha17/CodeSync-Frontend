import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { createProject } from '../../api/projectApi';

const LANGUAGES = [
  'Java','Python','JavaScript','TypeScript',
  'C','C++','Go','Rust','Ruby','PHP',
  'Kotlin','Swift',
];

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.18)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },

  modal: {
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e5eaf5',
    borderRadius: '22px',
    padding: '30px',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 25px 60px rgba(15,23,42,0.12)',
    backdropFilter: 'blur(14px)',
  },

  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#111827',
    marginBottom: '26px',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    color: '#374151',
    marginBottom: '7px',
    fontWeight: '600',
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    background: '#ffffff',
    border: '1px solid #dbe3f0',
    borderRadius: '10px',
    color: '#111827',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '18px',
    transition: 'all 0.2s ease',
  },

  select: {
    width: '100%',
    padding: '12px 14px',
    background: '#ffffff',
    border: '1px solid #dbe3f0',
    borderRadius: '10px',
    color: '#111827',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '18px',
    transition: 'all 0.2s ease',
  },

  visRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '28px',
  },

  visBtn: {
    flex: 1,
    padding: '11px',
    borderRadius: '10px',
    border: '1px solid #dbe3f0',
    background: '#ffffff',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  visBtnActive: {
    borderColor: '#2563eb',
    color: '#2563eb',
    background: '#dbeafe',
    boxShadow: '0 8px 18px rgba(37,99,235,0.14)',
  },

  btnRow: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
  },

  cancelBtn: {
    padding: '11px 18px',
    background: '#ffffff',
    border: '1px solid #dbe3f0',
    borderRadius: '10px',
    color: '#4b5563',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },

  createBtn: {
    padding: '11px 20px',
    background:
      'linear-gradient(135deg, #2563eb, #4f46e5)',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(37,99,235,0.22)',
  },
};

export default function CreateProjectModal({
  onClose,
  onCreated,
}) {
  const [form, setForm] = useState({
    name:        '',
    description: '',
    language:    'Java',
    visibility:  'PUBLIC',
  });
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Project name is required.');
      return;
    }
    setLoading(true);
    try {
      const res = await createProject(form);
      toast.success('Project created!');
      onCreated(res.data.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message
        || 'Failed to create project.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={s.overlay}
      onClick={onClose}
    >
      <div
        style={s.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={s.title}>Create New Project</div>

        <label style={s.label}>Project Name *</label>
        <input
          style={s.input}
          placeholder="my-awesome-project"
          value={form.name}
          onChange={(e) =>
            setForm({ ...form, name: e.target.value })
          }
        />

        <label style={s.label}>Description</label>
        <input
          style={s.input}
          placeholder="What does this project do?"
          value={form.description}
          onChange={(e) =>
            setForm({
              ...form,
              description: e.target.value,
            })
          }
        />

        <label style={s.label}>Language</label>
        <select
          style={s.select}
          value={form.language}
          onChange={(e) =>
            setForm({
              ...form,
              language: e.target.value,
            })
          }
        >
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <label style={s.label}>Visibility</label>
        <div style={s.visRow}>
          {['PUBLIC', 'PRIVATE'].map((v) => (
            <button
              key={v}
              style={{
                ...s.visBtn,
                ...(form.visibility === v
                  ? s.visBtnActive : {}),
              }}
              onClick={() =>
                setForm({ ...form, visibility: v })
              }
            >
              {v === 'PUBLIC'
                ? '🌐 Public' : '🔒 Private'}
            </button>
          ))}
        </div>

        <div style={s.btnRow}>
          <button
            style={s.cancelBtn}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            style={{
              ...s.createBtn,
              opacity: loading ? 0.7 : 1,
            }}
            disabled={loading}
            onClick={handleCreate}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}