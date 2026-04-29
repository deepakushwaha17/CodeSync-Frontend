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
    position:       'fixed',
    inset:          0,
    background:     'rgba(0,0,0,0.7)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    zIndex:         1000,
  },
  modal: {
    background:   '#161b22',
    border:       '1px solid #30363d',
    borderRadius: '12px',
    padding:      '28px',
    width:        '100%',
    maxWidth:     '460px',
  },
  title: {
    fontSize:     '18px',
    fontWeight:   '700',
    color:        '#e6edf3',
    marginBottom: '24px',
  },
  label: {
    display:      'block',
    fontSize:     '13px',
    color:        '#8b949e',
    marginBottom: '6px',
    fontWeight:   '500',
  },
  input: {
    width:        '100%',
    padding:      '9px 12px',
    background:   '#0d1117',
    border:       '1px solid #30363d',
    borderRadius: '7px',
    color:        '#e6edf3',
    fontSize:     '13px',
    outline:      'none',
    marginBottom: '16px',
  },
  select: {
    width:        '100%',
    padding:      '9px 12px',
    background:   '#0d1117',
    border:       '1px solid #30363d',
    borderRadius: '7px',
    color:        '#e6edf3',
    fontSize:     '13px',
    outline:      'none',
    marginBottom: '16px',
  },
  visRow: {
    display:      'flex',
    gap:          '10px',
    marginBottom: '24px',
  },
  visBtn: {
    flex:         1,
    padding:      '9px',
    borderRadius: '7px',
    border:       '1px solid #30363d',
    background:   '#0d1117',
    color:        '#8b949e',
    fontSize:     '13px',
    cursor:       'pointer',
  },
  visBtnActive: {
    borderColor: '#58a6ff',
    color:       '#58a6ff',
    background:  '#1f6feb22',
  },
  btnRow: {
    display:        'flex',
    gap:            '10px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding:      '9px 18px',
    background:   'none',
    border:       '1px solid #30363d',
    borderRadius: '7px',
    color:        '#8b949e',
    fontSize:     '13px',
    cursor:       'pointer',
  },
  createBtn: {
    padding:      '9px 18px',
    background:   '#238636',
    border:       '1px solid #2ea043',
    borderRadius: '7px',
    color:        '#fff',
    fontSize:     '13px',
    fontWeight:   '600',
    cursor:       'pointer',
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