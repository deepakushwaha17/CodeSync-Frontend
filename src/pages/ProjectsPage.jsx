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
  page: { minHeight: '100vh', background: '#0d1117' },
  body: {
    maxWidth: '1100px',
    margin:   '0 auto',
    padding:  '32px 20px',
  },
  topRow: {
    display:    'flex',
    alignItems: 'center',
    gap:        '12px',
    marginBottom:'24px',
  },
  title: {
    fontSize:   '22px',
    fontWeight: '700',
    color:      '#e6edf3',
    flex:       1,
  },
  searchInput: {
    padding:      '8px 14px',
    background:   '#161b22',
    border:       '1px solid #30363d',
    borderRadius: '8px',
    color:        '#e6edf3',
    fontSize:     '13px',
    outline:      'none',
    width:        '220px',
  },
  newBtn: {
    padding:      '8px 16px',
    background:   '#238636',
    border:       '1px solid #2ea043',
    borderRadius: '7px',
    color:        '#fff',
    fontSize:     '13px',
    fontWeight:   '600',
    cursor:       'pointer',
    whiteSpace:   'nowrap',
  },
  tabs: {
    display:      'flex',
    gap:          '4px',
    marginBottom: '24px',
    borderBottom: '1px solid #21262d',
  },
  tab: {
    padding:         '8px 16px',
    background:      'none',
    border:          'none',
    borderBottom:    '2px solid transparent',
    color:           '#8b949e',
    fontSize:        '14px',
    fontWeight:      '500',
    cursor:          'pointer',
    marginBottom:    '-1px',
    transition:      'all 0.15s',
  },
  tabActive: {
    color:           '#e6edf3',
    borderBottomColor:'#58a6ff',
  },
  grid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap:                 '16px',
  },
  emptyState: {
    padding:   '64px',
    textAlign: 'center',
    color:     '#8b949e',
    fontSize:  '14px',
  },
};

export default function ProjectsPage() {
  const navigate              = useNavigate();
  const { userId }            = useAuth();
  const [tab, setTab]         = useState('mine');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
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
          />
          <button
            style={s.newBtn}
            onClick={() => setShowModal(true)}
          >
            + New Project
          </button>
        </div>

        <div style={s.tabs}>
          {[
            { key: 'mine',   label: 'My Projects'   },
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