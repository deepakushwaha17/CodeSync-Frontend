import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import ProjectCard from '../components/project/ProjectCard';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import { getMyProjects } from '../api/projectApi';
import { getJobsByUser } from '../api/executionApi';

const s = {
  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)',
  },

  body: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '36px 20px',
  },

  greeting: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    marginBottom: '6px',
  },

  greetingSub: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '32px',
  },

  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
    marginBottom: '36px',
  },

  statCard: {
    background: '#ffffff',
    border: '1px solid #e5eaf5',
    borderRadius: '16px',
    padding: '22px',
    boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
  },

  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '600',
  },

  statValue: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#111827',
  },

  section: {
    marginBottom: '36px',
  },

  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '18px',
    gap: '12px',
  },

  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
  },

  seeAll: {
    fontSize: '13px',
    color: '#2563eb',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontWeight: '600',
  },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '18px',
  },

  emptyState: {
    padding: '54px 24px',
    textAlign: 'center',
    background: '#ffffff',
    boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
    border: '1px dashed #cbd5e1',
    borderRadius: '16px',
    color: '#6b7280',
    fontSize: '14px',
  },

  newBtn: {
    padding: '10px 18px',
    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
    border: 'none',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(37,99,235,0.22)',
  },

  jobBox: {
    background: '#ffffff',
    border: '1px solid #e5eaf5',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(15,23,42,0.06)',
  },

  jobRow: {
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid #e5eaf5',
  },

  langTag: {
    fontSize: '12px',
    fontFamily: 'JetBrains Mono, monospace',
    color: '#2563eb',
    background: '#dbeafe',
    padding: '4px 9px',
    borderRadius: '6px',
    fontWeight: '600',
  },
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { user, userId } = useAuth();
  const navigate = useNavigate();

  const [myProjects, setMy] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pRes, jRes] = await Promise.all([
          getMyProjects(userId),
          getJobsByUser(userId),
        ]);

        setMy(pRes.data.data || []);
        setJobs(jRes.data.data || []);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }

    if (userId) load();
  }, [userId]);

  const completed =
    jobs.filter((j) => j.status === 'COMPLETED').length;

  return (
    <div style={s.page}>
      <Navbar />

      <div style={s.body}>
        <div style={s.greeting}>
          {greeting()},{' '}
          {user?.fullName?.split(' ')[0] ||
            user?.username ||
            'Developer'}{' '}
          👋
        </div>

        <div style={s.greetingSub}>
          Here's what's happening today.
        </div>

        <div style={s.statsGrid}>
          {[
            {
              label: 'My Projects',
              value: myProjects.length,
              blue: true,
            },
            {
              label: 'Total Runs',
              value: jobs.length,
            },
            {
              label: 'Successful',
              value: completed,
            },
            {
              label: 'Member Since',
              value: user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString(
                    'en',
                    {
                      month: 'short',
                      year: 'numeric',
                    }
                  )
                : '—',
            },
          ].map((item) => (
            <div key={item.label} style={s.statCard}>
              <div style={s.statLabel}>
                {item.label}
              </div>

              <div
                style={{
                  ...s.statValue,
                  color: item.blue ? '#2563eb' : '#111827',
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div style={s.section}>
          <div style={s.sectionHeader}>
            <span style={s.sectionTitle}>
              My Projects
            </span>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
              }}
            >
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

          {loading ? (
            <Loader />
          ) : myProjects.length === 0 ? (
            <div style={s.emptyState}>
              <div
                style={{
                  fontSize: '38px',
                  marginBottom: '14px',
                }}
              >
                📁
              </div>

              <div>No projects yet.</div>

              <button
                style={{
                  ...s.newBtn,
                  marginTop: '18px',
                }}
                onClick={() => navigate('/projects')}
              >
                Create your first project
              </button>
            </div>
          ) : (
            <div style={s.grid}>
              {myProjects.slice(0, 6).map((project) => (
                <ProjectCard
                  key={project.projectId}
                  project={project}
                  onClick={() =>
                    navigate(`/projects/${project.projectId}`)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {jobs.length > 0 && (
          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={s.sectionTitle}>
                Recent Executions
              </span>
            </div>

            <div style={s.jobBox}>
              {jobs.slice(0, 5).map((job, index) => (
                <div
                  key={job.jobId}
                  style={{
                    ...s.jobRow,
                    borderBottom:
                      index < 4
                        ? '1px solid #e5eaf5'
                        : 'none',
                  }}
                >
                  <span style={s.langTag}>
                    {job.language}
                  </span>

                  <span
                    style={{
                      flex: 1,
                      fontSize: '13px',
                      color: '#4b5563',
                      fontFamily:
                        'JetBrains Mono, monospace',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {job.sourceCode?.slice(0, 60)}...
                  </span>

                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color:
                        job.status === 'COMPLETED'
                          ? '#16a34a'
                          : job.status === 'FAILED'
                            ? '#dc2626'
                            : '#d97706',
                    }}
                  >
                    {job.status}
                  </span>

                  {job.executionTimeMs && (
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#6b7280',
                      }}
                    >
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