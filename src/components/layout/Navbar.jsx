import React, { useState } from 'react';
import { useNavigate, useLocation }
  from 'react-router-dom';
import { useAuth }         from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const s = {
  nav: {
    height:       '56px',
    background:   '#161b22',
    borderBottom: '1px solid #21262d',
    display:      'flex',
    alignItems:   'center',
    padding:      '0 20px',
    gap:          '8px',
    position:     'sticky',
    top:          0,
    zIndex:       100,
  },
  logo: {
    display:    'flex',
    alignItems: 'center',
    gap:        '8px',
    cursor:     'pointer',
    marginRight:'8px',
  },
  logoIcon: {
    width:          '28px',
    height:         '28px',
    background:
      'linear-gradient(135deg, #58a6ff, #bc8cff)',
    borderRadius:   '7px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '14px',
  },
  logoText: {
    fontSize:   '15px',
    fontWeight: '700',
    color:      '#e6edf3',
  },
  navBtn: {
    padding:    '5px 10px',
    borderRadius:'6px',
    fontSize:   '13px',
    fontWeight: '500',
    cursor:     'pointer',
    background: 'none',
    border:     'none',
    color:      '#8b949e',
    transition: 'all 0.15s',
  },
  navBtnActive: {
    color:      '#e6edf3',
    background: '#21262d',
  },
  spacer: { flex: 1 },
  bellBtn: {
    position:       'relative',
    width:          '34px',
    height:         '34px',
    borderRadius:   '8px',
    background:     'none',
    border:         '1px solid #30363d',
    color:          '#8b949e',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    cursor:         'pointer',
    fontSize:       '16px',
  },
  badge: {
    position:       'absolute',
    top:            '-4px',
    right:          '-4px',
    minWidth:       '16px',
    height:         '16px',
    background:     '#f85149',
    borderRadius:   '8px',
    fontSize:       '10px',
    fontWeight:     '700',
    color:          '#fff',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    padding:        '0 3px',
  },
  avatar: {
    width:          '32px',
    height:         '32px',
    borderRadius:   '50%',
    background:
      'linear-gradient(135deg, #58a6ff, #bc8cff)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '13px',
    fontWeight:     '700',
    color:          '#fff',
    cursor:         'pointer',
    border:         '2px solid #30363d',
    flexShrink:     0,
  },
  dropdown: {
    position:   'absolute',
    top:        '48px',
    right:      '16px',
    background: '#161b22',
    border:     '1px solid #30363d',
    borderRadius:'10px',
    padding:    '6px',
    minWidth:   '180px',
    zIndex:     200,
    boxShadow:  '0 8px 24px rgba(0,0,0,0.4)',
  },
  dropItem: {
    width:      '100%',
    padding:    '8px 12px',
    borderRadius:'6px',
    background: 'none',
    border:     'none',
    color:      '#e6edf3',
    fontSize:   '13px',
    textAlign:  'left',
    cursor:     'pointer',
    display:    'block',
  },
  divider: {
    height:     '1px',
    background: '#21262d',
    margin:     '4px 0',
  },
};

const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Projects',  path: '/projects'  },
];

export default function Navbar() {
  const navigate             = useNavigate();
  const location             = useLocation();
  const { user, logoutUser } = useAuth();
  const { unreadCount }      = useNotification();
  const [open, setOpen]      = useState(false);

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
      {NAV_LINKS.map((link) => (
        <button
          key={link.path}
          style={{
            ...s.navBtn,
            ...(location.pathname
                  .startsWith(link.path)
                ? s.navBtnActive : {}),
          }}
          onClick={() => navigate(link.path)}
        >
          {link.label}
        </button>
      ))}

      <div style={s.spacer} />

      {/* Notification bell */}
      <button
        style={s.bellBtn}
        onClick={() => navigate('/notifications')}
        title="Notifications"
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
          {initials}
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
                color:    '#8b949e',
              }}>
                Signed in as{' '}
                <strong style={{ color: '#e6edf3' }}>
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
                  color: '#f85149',
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