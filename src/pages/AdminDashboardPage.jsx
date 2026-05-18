import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  getAllUsers,
  searchUsers,
  deactivateUser,
  getExecutionStats,
  cancelExecutionJob,
  getSupportedLanguages,
  sendBulkNotification,
} from '../api/adminApi';

const s = {
  page: {
    minHeight: '100vh',
    background: '#f8fbff',
  },
  body: {
    padding: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    marginBottom: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '18px',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e5eaf5',
    borderRadius: '16px',
    padding: '18px',
    boxShadow: '0 8px 22px rgba(15,23,42,0.06)',
  },
  h2: {
    fontSize: '18px',
    fontWeight: '700',
    marginBottom: '12px',
    color: '#111827',
  },
  input: {
    width: '100%',
    padding: '10px',
    borderRadius: '10px',
    border: '1px solid #dbe3f0',
    marginBottom: '10px',
  },
  btn: {
    padding: '9px 12px',
    borderRadius: '10px',
    border: '1px solid #dbe3f0',
    background: '#ffffff',
    cursor: 'pointer',
    fontWeight: '600',
    marginRight: '8px',
    marginTop: '8px',
  },
  dangerBtn: {
    background: '#fef2f2',
    color: '#dc2626',
    borderColor: '#fecaca',
  },
  userRow: {
    padding: '10px',
    border: '1px solid #eef2f7',
    borderRadius: '10px',
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    alignItems: 'center',
  },
  small: {
    fontSize: '12px',
    color: '#6b7280',
  },
};

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [stats, setStats] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [jobId, setJobId] = useState('');
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const { user } = useAuth();

  const loadUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data.data || []);
    } catch {
      toast.error('Failed to load users.');
    }
  };

  const loadStats = async () => {
    try {
      const res = await getExecutionStats();
      setStats(res.data.data);
    } catch {
      toast.error('Failed to load execution stats.');
    }
  };

  const loadLanguages = async () => {
    try {
      const res = await getSupportedLanguages();
      setLanguages(res.data.data || []);
    } catch {
      toast.error('Failed to load languages.');
    }
  };

  useEffect(() => {
    loadUsers();
    loadStats();
    loadLanguages();
  }, []);

  const handleSearchUser = async () => {
    if (!keyword.trim()) {
      loadUsers();
      return;
    }

    try {
      const res = await searchUsers(keyword);
      setUsers(res.data.data || []);
    } catch {
      toast.error('Failed to search users.');
    }
  };

  const handleDeactivateUser = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return;

    try {
      await deactivateUser(userId);
      toast.success('User deactivated.');
      loadUsers();
    } catch {
      toast.error('Failed to deactivate user.');
    }
  };

  const handleCancelJob = async () => {
    if (!jobId.trim()) {
      toast.error('Enter job ID.');
      return;
    }

    try {
      await cancelExecutionJob(jobId);
      toast.success('Execution job cancelled.');
      setJobId('');
    } catch {
      toast.error('Failed to cancel job.');
    }
  };

  const handleSendBulkNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      toast.error('Enter title and message.');
      return;
    }

    try {
      await sendBulkNotification({
        recipientIds: users.map((u) => u.userId),
        actorId: user?.userId || null,
        type: 'SYSTEM',
        title: notificationTitle,
        message: notificationMessage,
        relatedId: null,
        relatedType: 'PLATFORM',
      });

      toast.success('Notification sent.');
      setNotificationTitle('');
      setNotificationMessage('');
    } catch {
      toast.error('Failed to send notification.');
    }
  };

  return (
    <div style={s.page}>
      <Navbar />

      <div style={s.body}>
        <div style={s.title}>Admin Dashboard</div>

        <div style={s.grid}>

          {/* Users */}
          <div style={s.card}>
            <div style={s.h2}>Manage Users</div>

            <input
              style={s.input}
              placeholder="Search user..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />

            <button style={s.btn} onClick={handleSearchUser}>
              Search
            </button>

            <button style={s.btn} onClick={loadUsers}>
              Refresh
            </button>

            <div style={{ marginTop: '14px' }}>
              {users.map((u) => (
                <div key={u.userId} style={s.userRow}>
                  <div>
                    <div style={{ fontWeight: '700' }}>
                      {u.username || u.fullName}
                    </div>
                    <div style={s.small}>{u.email}</div>
                    <div style={s.small}>
                      Role: {u.role} | Active: {String(u.active ?? u.isActive)}
                    </div>
                  </div>

                  <button
                    style={{ ...s.btn, ...s.dangerBtn }}
                    onClick={() => handleDeactivateUser(u.userId)}
                  >
                    Deactivate
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Stats */}
          <div style={s.card}>
            <div style={s.h2}>Execution Stats</div>

            {stats ? (
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(stats, null, 2)}
              </pre>
            ) : (
              <p>No stats found.</p>
            )}

            <button style={s.btn} onClick={loadStats}>
              Refresh Stats
            </button>
          </div>

          {/* Cancel Job */}
          <div style={s.card}>
            <div style={s.h2}>Cancel Execution Job</div>

            <input
              style={s.input}
              placeholder="Enter job ID"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            />

            <button
              style={{ ...s.btn, ...s.dangerBtn }}
              onClick={handleCancelJob}
            >
              Cancel Job
            </button>
          </div>

          {/* Languages */}
          <div style={s.card}>
            <div style={s.h2}>Supported Languages</div>

            {languages.length === 0 ? (
              <p>No languages found.</p>
            ) : (
              languages.map((lang) => (
                <div key={lang.languageId || lang.name} style={s.userRow}>
                  <div>
                    <div style={{ fontWeight: '700' }}>
                      {lang.name}
                    </div>
                    <div style={s.small}>
                      {lang.version || lang.dockerImage || 'No details'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Platform Notification */}
          <div style={s.card}>
            <div style={s.h2}>Send Platform Notification</div>

            <input
              style={s.input}
              placeholder="Notification title"
              value={notificationTitle}
              onChange={(e) => setNotificationTitle(e.target.value)}
            />

            <textarea
              style={{
                ...s.input,
                minHeight: '90px',
                resize: 'vertical',
              }}
              placeholder="Notification message"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
            />

            <button style={s.btn} onClick={handleSendBulkNotification}>
              Send Notification
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}