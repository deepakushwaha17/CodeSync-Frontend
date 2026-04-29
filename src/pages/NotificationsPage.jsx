import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Loader from '../components/common/Loader';
import { useAuth }         from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} from '../api/notificationApi';

const TYPE_ICONS = {
  SESSION_INVITE:    '📨',
  PARTICIPANT_JOINED:'👋',
  PARTICIPANT_LEFT:  '🚪',
  COMMENT_ADDED:     '💬',
  COMMENT_REPLY:     '↩️',
  COMMENT_MENTION:   '🔖',
  COMMENT_RESOLVED:  '✅',
  SNAPSHOT_CREATED:  '📸',
  PROJECT_FORKED:    '🍴',
  MEMBER_ADDED:      '➕',
  MEMBER_REMOVED:    '➖',
  BROADCAST:         '📢',
  SYSTEM:            '⚙️',
};

function timeAgo(dateStr) {
  const ms   = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs  = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const s = {
  page:  { minHeight: '100vh', background: '#0d1117' },
  body: {
    maxWidth: '720px',
    margin:   '0 auto',
    padding:  '32px 20px',
  },
  topRow: {
    display:     'flex',
    alignItems:  'center',
    marginBottom:'24px',
    gap:         '12px',
  },
  title: {
    fontSize:   '22px',
    fontWeight: '700',
    color:      '#e6edf3',
    flex:       1,
  },
  unreadLabel: {
    fontSize:   '13px',
    fontWeight: '500',
    color:      '#58a6ff',
    marginLeft: '10px',
  },
  btn: {
    padding:      '7px 14px',
    borderRadius: '7px',
    border:       '1px solid #30363d',
    background:   '#21262d',
    color:        '#e6edf3',
    fontSize:     '13px',
    cursor:       'pointer',
  },
  dangerBtn: {
    borderColor: '#f85149',
    color:       '#f85149',
    background:  'none',
  },
  card: {
    display:     'flex',
    alignItems:  'flex-start',
    gap:         '12px',
    padding:     '14px 16px',
    background:  '#161b22',
    border:      '1px solid #21262d',
    borderRadius:'10px',
    marginBottom:'8px',
    cursor:      'pointer',
    transition:  'border-color 0.15s',
  },
  unreadDot: {
    width:        '8px',
    height:       '8px',
    borderRadius: '50%',
    background:   '#58a6ff',
    flexShrink:   0,
    marginTop:    '5px',
  },
  icon: {
    fontSize:  '20px',
    flexShrink: 0,
    width:     '28px',
    textAlign: 'center',
  },
  content: { flex: 1 },
  nTitle: {
    fontSize:     '14px',
    fontWeight:   '600',
    color:        '#e6edf3',
    marginBottom: '2px',
  },
  nMsg: {
    fontSize:     '13px',
    color:        '#8b949e',
    marginBottom: '4px',
  },
  nTime: {
    fontSize: '11px',
    color:    '#484f58',
  },
  actions: {
    display:   'flex',
    gap:       '8px',
    flexShrink:0,
  },
  actBtn: {
    background: 'none',
    border:     'none',
    color:      '#484f58',
    cursor:     'pointer',
    fontSize:   '14px',
    padding:    '2px',
  },
  emptyState: {
    textAlign: 'center',
    padding:   '64px',
    color:     '#8b949e',
    fontSize:  '14px',
  },
};

export default function NotificationsPage() {
  const { userId }          = useAuth();
  const { fetchCount }      = useNotification();
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoad]  = useState(true);

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
                ? '#1f6feb44' : '#21262d',
              background: !n.isRead
                ? '#1f6feb0a' : '#161b22',
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