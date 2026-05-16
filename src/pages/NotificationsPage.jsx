import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} from '../api/notificationApi';

const TYPE_ICONS = {
  SESSION_INVITE: '📨',
  PARTICIPANT_JOINED: '👋',
  PARTICIPANT_LEFT: '🚪',
  COMMENT_ADDED: '💬',
  COMMENT_REPLY: '↩️',
  COMMENT_MENTION: '🔖',
  COMMENT_RESOLVED: '✅',
  SNAPSHOT_CREATED: '📸',
  PROJECT_FORKED: '🍴',
  MEMBER_ADDED: '➕',
  MEMBER_REMOVED: '➖',
  BROADCAST: '📢',
  SYSTEM: '⚙️',
};

function timeAgo(dateStr) {
  const ms = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const s = {
  page: {
    minHeight: '100vh',
    background:
      'linear-gradient(135deg,#f8fbff,#eef4ff)',
  },

  body: {
    maxWidth: '760px',
    margin: '0 auto',
    padding: '36px 20px',
  },

  topRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '28px',
    gap: '12px',
    flexWrap: 'wrap',
  },

  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },

  unreadLabel: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2563eb',
    marginLeft: '10px',
  },

  btn: {
    padding: '9px 14px',
    borderRadius: '10px',
    border: '1px solid #dbe3f0',
    background: '#ffffff',
    color: '#111827',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow:
      '0 8px 20px rgba(15,23,42,0.04)',
  },

  dangerBtn: {
    borderColor: '#fecaca',
    color: '#dc2626',
    background: '#fef2f2',
  },

  card: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '16px 18px',
    background: 'rgba(255,255,255,0.82)',
    border: '1px solid #e5eaf5',
    borderRadius: '16px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)',
    boxShadow:
      '0 10px 24px rgba(15,23,42,0.05)',
  },

  unreadDot: {
    width: '9px',
    height: '9px',
    borderRadius: '50%',
    background: '#2563eb',
    flexShrink: 0,
    marginTop: '7px',
  },

  icon: {
    fontSize: '22px',
    flexShrink: 0,
    width: '30px',
    textAlign: 'center',
  },

  content: {
    flex: 1,
  },

  nTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '4px',
  },

  nMsg: {
    fontSize: '13px',
    color: '#4b5563',
    marginBottom: '6px',
    lineHeight: '1.5',
  },

  nTime: {
    fontSize: '11px',
    color: '#6b7280',
  },

  actions: {
    display: 'flex',
    gap: '8px',
    flexShrink: 0,
  },

  actBtn: {
    background: '#ffffff',
    border: '1px solid #dbe3f0',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '13px',
    padding: '5px 8px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
  },

  emptyState: {
    textAlign: 'center',
    padding: '80px 30px',
    color: '#6b7280',
    fontSize: '14px',
    background: 'rgba(255,255,255,0.82)',
    border: '1px solid #e5eaf5',
    borderRadius: '18px',
    boxShadow:
      '0 10px 24px rgba(15,23,42,0.05)',
  },
};

export default function NotificationsPage() {
  const { userId } = useAuth();
  const { fetchCount } = useNotification();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoad] = useState(true);

  const load = async () => {
    try {
      const res = await getNotifications(userId);
      setNotifs(res.data.data || []);
    } catch {
      toast.error('Failed to load notifications.');
    } finally {
      setLoad(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifs((prev) =>
        prev.map((n) =>
          n.notificationId === id
            ? { ...n, isRead: true }
            : n
        )
      );
      fetchCount();
    } catch { /* silent */ }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifs((prev) =>
        prev.filter((n) => n.notificationId !== id)
      );
      fetchCount();
    } catch { /* silent */ }
  };

  const handleMarkAll = async () => {
    try {
      await markAllAsRead(userId);
      setNotifs((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
      fetchCount();
      toast.success('All marked as read.');
    } catch { /* silent */ }
  };

  const handleDeleteRead = async () => {
    try {
      await deleteAllRead(userId);
      setNotifs((prev) =>
        prev.filter((n) => !n.isRead)
      );
      toast.success('Read notifications cleared.');
    } catch { /* silent */ }
  };

  const unread =
    notifs.filter((n) => !n.isRead).length;

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.body}>

        <div style={s.topRow}>
          <div style={s.title}>
            Notifications
            {unread > 0 && (
              <span style={s.unreadLabel}>
                {unread} unread
              </span>
            )}
          </div>
          {unread > 0 && (
            <button
              style={s.btn}
              onClick={handleMarkAll}
            >
              ✓ Mark all read
            </button>
          )}
          <button
            style={{ ...s.btn, ...s.dangerBtn }}
            onClick={handleDeleteRead}
          >
            🗑 Clear read
          </button>
        </div>

        {loading ? <Loader /> :
          notifs.length === 0 ? (
            <div style={s.emptyState}>
              <div style={{
                fontSize: '40px', marginBottom: '12px'
              }}>
                🔔
              </div>
              You're all caught up!
            </div>
          ) : notifs.map((n) => (
            <div
              key={n.notificationId}
              style={{
                ...s.card,
                borderColor: !n.isRead
                  ? '#bfdbfe' : '#e5eaf5',

                background: !n.isRead
                  ? '#eff6ff' : 'rgba(255,255,255,0.82)',
              }}
              onClick={() =>
                !n.isRead &&
                handleRead(n.notificationId)
              }
            >
              {!n.isRead && (
                <div style={s.unreadDot} />
              )}
              <div style={s.icon}>
                {TYPE_ICONS[n.type] || '🔔'}
              </div>
              <div style={s.content}>
                <div style={s.nTitle}>{n.title}</div>
                <div style={s.nMsg}>{n.message}</div>
                <div style={s.nTime}>
                  {timeAgo(n.createdAt)}
                </div>
              </div>
              <div style={s.actions}>
                {!n.isRead && (
                  <button
                    style={s.actBtn}
                    title="Mark read"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRead(n.notificationId);
                    }}
                  >
                    ✓
                  </button>
                )}
                <button
                  style={s.actBtn}
                  title="Delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(n.notificationId);
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}