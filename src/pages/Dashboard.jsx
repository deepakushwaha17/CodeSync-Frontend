import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar      from '../components/layout/Navbar';
import ProjectCard from '../components/project/ProjectCard';
import Loader      from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import { getMyProjects }  from '../api/projectApi';
import { getJobsByUser }  from '../api/executionApi';

const s = {
  page:  { minHeight: '100vh', background: '#0d1117' },
  body: {
    maxWidth: '1100px',
    margin:   '0 auto',
    padding:  '32px 20px',
  },
  greeting: {
    fontSize:     '26px',
    fontWeight:   '700',
    color:        '#e6edf3',
    marginBottom: '4px',
  },
  greetingSub: {
    fontSize:     '14px',
    color:        '#8b949e',
    marginBottom: '32px',
  },
  statsGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap:                 '16px',
    marginBottom:        '32px',
  },
  statCard: {
    background:   '#161b22',
    border:       '1px solid #21262d',
    borderRadius: '10px',
    padding:      '20px',
  },
  statLabel: {
    fontSize:        '12px',
    color:           '#8b949e',
    marginBottom:    '8px',
    textTransform:   'uppercase',
    letterSpacing:   '0.5px',
  },
  statValue: {
    fontSize:   '28px',
    fontWeight: '700',
    color:      '#e6edf3',
  },
  section:       { marginBottom: '32px' },
  sectionHeader: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   '16px',
  },
  sectionTitle: {
    fontSize:   '16px',
    fontWeight: '600',
    color:      '#e6edf3',
  },
  seeAll: {
    fontSize:   '13px',
    color:      '#58a6ff',
    cursor:     'pointer',
    background: 'none',
    border:     'none',
  },
  grid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap:                 '16px',
  },
  emptyState: {
    padding:      '48px',
    textAlign:    'center',
    background:   '#161b22',
    border:       '1px dashed #30363d',
    borderRadius: '10px',
    color:        '#8b949e',
    fontSize:     '14px',
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
  },
  jobRow: {
    padding:         '12px 16px',
    display:         'flex',
    alignItems:      'center',
    gap:             '12px',
    borderBottom:    '1px solid #21262d',
  },
  langTag: {
    fontSize:     '12px',
    fontFamily:   'JetBrains Mono, monospace',
    color:        '#8b949e',
    background:   '#0d1117',
    padding:      '2px 8px',
    borderRadius: '4px',
  },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user, userId }      = useAuth();
  const navigate              = useNavigate();
  const [myProjects, setMy]   = useState([]);
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, jRes] = await Promise.all([
          getMyProjects(userId),
          getJobsByUser(userId),
        ]);
        setMy(pRes.data.data   || []);
        setJobs(jRes.data.data || []);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const completed =
    jobs.filter((j) => j.status === 'COMPLETED').length;

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.body}>

        <div style={s.greeting}>
          {greeting()},{' '}
          {user?.fullName?.split(' ')[0] || 'Developer'} 👋
        </div>
        <div style={s.greetingSub}>
          Here's what's happening today.
        </div>

        {/* Stats */}
        <div style={s.statsGrid}>
          {[
            {
              label: 'My Projects',
              value: myProjects.length,
              blue:  true,
            },
            { label: 'Total Runs',  value: jobs.length },
            { label: 'Successful',  value: completed },
            {
              label: 'Member Since',
              value: user?.createdAt
                ? new Date(user.createdAt)
                    .toLocaleDateString('en', {
                      month: 'short',
                      year:  'numeric',
                    })
                : '—',
            },
          ].map((s2) => (
            <div key={s2.label} style={s.statCard}>
              <div style={s.statLabel}>{s2.label}</div>
              <div style={{
                ...s.statValue,
                color: s2.blue ? '#58a6ff' : '#e6edf3',
              }}>
                {s2.value}
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>
              My Projects
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                style={s.newBtn}
                onClick={() => navigate('/projects')}
              >
                + New Project
              </button>
              <button
                style={s.seeAll}
                onClick={() => navigate('/projects')}
              >
                See all →
              </button>
            </div>
          </div>

          {loading ? <Loader /> :
            myProjects.length === 0 ? (
            <div style={s.emptyState}>
              <div style={{
                fontSize: '32px', marginBottom: '12px'
              }}>
                📁
              </div>
              No projects yet.
              <br />
              <button
                style={{ ...s.newBtn, marginTop: '16px' }}
                onClick={() => navigate('/projects')}
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div style={s.grid}>
              {myProjects.slice(0, 6).map((p) => (
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

        {/* Recent executions */}
        {jobs.length > 0 && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={s.sectionTitle}>
                Recent Executions
              </span>
            </div>
            <div style={{
              background:   '#161b22',
              border:       '1px solid #21262d',
              borderRadius: '10px',
              overflow:     'hidden',
            }}>
              {jobs.slice(0, 5).map((job, i) => (
                <div
                  key={job.jobId}
                  style={{
                    ...s.jobRow,
                    borderBottom: i < 4
                      ? '1px solid #21262d' : 'none',
                  }}
                >
                  <span style={s.langTag}>
                    {job.language}
                  </span>
                  <span style={{
                    flex:           1,
                    fontSize:       '13px',
                    color:          '#8b949e',
                    fontFamily:     'JetBrains Mono, monospace',
                    overflow:       'hidden',
                    textOverflow:   'ellipsis',
                    whiteSpace:     'nowrap',
                  }}>
                    {job.sourceCode?.slice(0, 60)}...
                  </span>
                  <span style={{
                    fontSize:   '12px',
                    fontWeight: '600',
                    color:
                      job.status === 'COMPLETED'
                        ? '#3fb950'
                        : job.status === 'FAILED'
                        ? '#f85149'
                        : '#d29922',
                  }}>
                    {job.status}
                  </span>
                  {job.executionTimeMs && (
                    <span style={{
                      fontSize: '12px',
                      color:    '#484f58',
                    }}>
                      {job.executionTimeMs}ms
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}