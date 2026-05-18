import React, { useState } from 'react';
import { useNavigate, useLocation }
  from 'react-router-dom';
import { useAuth }         from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const s = {
  nav: {
    height: '64px',
    background: 'rgba(255,255,255,0.82)',
    borderBottom: '1px solid #e5eaf5',
    backdropFilter: 'blur(14px)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 22px',
    gap: '10px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow:
      '0 10px 30px rgba(15,23,42,0.04)',
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    marginRight: '10px',
  },

  logoIcon: {
    width: '34px',
    height: '34px',
    background:
      'linear-gradient(135deg,#2563eb,#7c3aed)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    color: '#fff',
    boxShadow:
      '0 10px 20px rgba(37,99,235,0.18)',
  },

  logoText: {
    fontSize: '17px',
    fontWeight: '800',
    color: '#111827',
  },

  navBtn: {
    padding: '8px 14px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    background: 'transparent',
    border: 'none',
    color: '#6b7280',
    transition: 'all 0.2s ease',
  },

  navBtnActive: {
    color: '#2563eb',
    background: '#dbeafe',
    boxShadow:
      '0 8px 18px rgba(37,99,235,0.10)',
  },

  spacer: {
    flex: 1,
  },

  bellBtn: {
    position: 'relative',
    width: '38px',
    height: '38px',
    borderRadius: '12px',
    background: '#ffffff',
    border: '1px solid #dbe3f0',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '17px',
    transition: 'all 0.2s ease',
    boxShadow:
      '0 8px 18px rgba(15,23,42,0.05)',
  },

  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    minWidth: '18px',
    height: '18px',
    background: '#ef4444',
    borderRadius: '999px',
    fontSize: '10px',
    fontWeight: '700',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    border: '2px solid #fff',
  },

  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    cursor: 'pointer',
    flexShrink: 0,
    position: 'relative',
  },

  avatarImg: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #dbeafe',
    display: 'block',
    boxShadow:
      '0 8px 18px rgba(37,99,235,0.12)',
  },

  avatarFallback: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background:
      'linear-gradient(135deg,#2563eb,#7c3aed)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: '#fff',
    border: '2px solid #dbeafe',
    boxShadow:
      '0 8px 18px rgba(37,99,235,0.12)',
  },

  dropdown: {
    position: 'absolute',
    top: '54px',
    right: 0,
    background: 'rgba(255,255,255,0.92)',
    border: '1px solid #e5eaf5',
    borderRadius: '16px',
    padding: '8px',
    minWidth: '220px',
    zIndex: 200,
    backdropFilter: 'blur(12px)',
    boxShadow:
      '0 18px 40px rgba(15,23,42,0.10)',
  },

  dropItem: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'transparent',
    border: 'none',
    color: '#111827',
    fontSize: '14px',
    textAlign: 'left',
    cursor: 'pointer',
    display: 'block',
    transition: 'all 0.15s ease',
  },

  divider: {
    height: '1px',
    background: '#e5eaf5',
    margin: '6px 0',
  },
};

const DEV_LINKS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Projects', path: '/projects' },
];

const ADMIN_LINKS = [
  { label: 'Admin Panel', path: '/admin/dashboard' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser } = useAuth();
  const { unreadCount } = useNotification();
  const [open, setOpen] = useState(false);

  const links = user?.role === 'ADMIN'
    ? ADMIN_LINKS : DEV_LINKS;

  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';

  const handleLogout = () => {
    logoutUser();
    navigate('/auth');
  };

  return (
    <nav style={s.nav}>

      {/* Logo */}
      <div
        style={s.logo}
        onClick={() => navigate('/dashboard')}
      >
        <div style={s.logoIcon}>⚡</div>
        <span style={s.logoText}>CodeSync</span>
      </div>

      {/* Nav links */}
      {links.map((link) => (
        <button
          key={link.path}
          style={{
            ...s.navBtn,
            ...(location.pathname
                  .startsWith(link.path)
                ? s.navBtnActive : {}),
          }}
          onClick={() => navigate(link.path)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
          }}
        >
          {link.label}
        </button>
      ))}

      <div style={s.spacer} />

      {/* Notification bell */}
      <button
        style={s.bellBtn}
        onClick={() => navigate('/notifications')}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform =
            'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'none';
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={s.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Avatar + dropdown */}
      <div style={{ position: 'relative' }}>
  
        <div
          style={s.avatar}
          onClick={() => setOpen(!open)}
          title={user?.username}
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.username || 'avatar'}
              style={s.avatarImg}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div style={{
            ...s.avatarFallback,
            display: user?.avatarUrl ? 'none' : 'flex',
          }}>
            {initials}
          </div>
        </div>

        {open && (
          <>
            <div
              style={{
                position: 'fixed',
                inset:    0,
                zIndex:   199,
              }}
              onClick={() => setOpen(false)}
            />
            <div style={s.dropdown}>
              <div style={{
                padding:  '8px 12px',
                fontSize: '12px',
                color:    '#6b7280',
              }}>
                Signed in as{' '}
                <strong style={{ color: '#111827' }}>
                  {user?.username}
                </strong>
              </div>
              <div style={s.divider} />
              <button
                style={s.dropItem}
                onClick={() => {
                  setOpen(false);
                  navigate('/profile');
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    '#eef4ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    'transparent';
                }}
              >
                👤 Profile
              </button>
              <button
                style={s.dropItem}
                onClick={() => {
                  setOpen(false);
                  navigate('/notifications');
                }}
              >
                🔔 Notifications
                {unreadCount > 0 &&
                  ` (${unreadCount})`}
              </button>
              <div style={s.divider} />
              <button
                style={{
                  ...s.dropItem,
                  color: '#dc2626',
                }}
                onClick={handleLogout}
              >
                🚪 Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}