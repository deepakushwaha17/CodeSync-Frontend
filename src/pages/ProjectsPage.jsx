import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import ProjectCard from '../components/project/ProjectCard';
import CreateProjectModal
  from '../components/project/CreateProjectModal';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import {
  getMyProjects,
  getPublicProjects,
  searchProjects,
} from '../api/projectApi';

const s = {
  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg,#f8fbff,#eef4ff)',
  },

  body: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '36px 20px',
  },

  topRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },

  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },

  searchInput: {
    padding: '11px 16px',
    background: '#ffffff',
    border: '1px solid #dbe3f0',
    borderRadius: '12px',
    color: '#111827',
    fontSize: '14px',
    outline: 'none',
    width: '240px',
    boxShadow:
      '0 8px 20px rgba(15,23,42,0.04)',
    transition: 'all 0.2s ease',
  },

  newBtn: {
    padding: '11px 18px',
    background:
      'linear-gradient(135deg,#2563eb,#4f46e5)',
    border: 'none',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    boxShadow:
      '0 10px 20px rgba(37,99,235,0.22)',
    transition: 'all 0.2s ease',
  },

  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '28px',
    background: '#eef2ff',
    border: '1px solid #dbe3f0',
    padding: '6px',
    borderRadius: '14px',
    width: 'fit-content',
  },

  tab: {
    padding: '10px 18px',
    background: 'transparent',
    border: 'none',
    borderRadius: '10px',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  tabActive: {
    background: '#ffffff',
    color: '#2563eb',
    boxShadow:
      '0 8px 18px rgba(37,99,235,0.10)',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '18px',
  },

  emptyState: {
    padding: '80px 30px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px',
    background: 'rgba(255,255,255,0.82)',
    border: '1px solid #e5eaf5',
    borderRadius: '22px',
    boxShadow:
      '0 16px 36px rgba(15,23,42,0.05)',
    backdropFilter: 'blur(10px)',
  },
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [tab, setTab] = useState('mine');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = tab === 'mine'
        ? await getMyProjects(userId)
        : await getPublicProjects();
      setProjects(res.data.data || []);
    } catch {
      toast.error('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearch(val);
    if (val.trim().length < 2) {
      load();
      return;
    }
    try {
      const res = await searchProjects(val);
      setProjects(res.data.data || []);
    } catch { /* silent */ }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.body}>

        <div style={s.topRow}>
          <span style={s.title}>Projects</span>
          <input
            placeholder="🔍 Search projects..."
            value={search}
            onChange={handleSearch}
            style={s.searchInput}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb';
              e.target.style.boxShadow =
                '0 0 0 4px rgba(37,99,235,0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#dbe3f0';
              e.target.style.boxShadow =
                '0 8px 20px rgba(15,23,42,0.04)';
            }}
          />
          <button
            style={s.newBtn}
            onClick={() => setShowModal(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform =
                'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
            }}
          >
            + New Project
          </button>
        </div>

        <div style={s.tabs}>
          {[
            { key: 'mine', label: 'My Projects' },
            { key: 'public', label: 'Explore Public' },
          ].map((t) => (
            <button
              key={t.key}
              style={{
                ...s.tab,
                ...(tab === t.key ? s.tabActive : {}),
              }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <Loader /> :
          projects.length === 0 ? (
            <div style={s.emptyState}>
              <div style={{
                fontSize: '40px', marginBottom: '12px'
              }}>
                📂
              </div>
              No projects found.
            </div>
          ) : (
            <div style={s.grid}>
              {projects.map((p) => (
                <ProjectCard
                  key={p.projectId}
                  project={p}
                  onClick={() =>
                    navigate(`/projects/${p.projectId}`)
                  }
                />
              ))}
            </div>
          )}
      </div>

      {showModal && (
        <CreateProjectModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => {
            setShowModal(false);
            navigate(`/projects/${p.projectId}`);
          }}
        />
      )}
    </div>
  );
}