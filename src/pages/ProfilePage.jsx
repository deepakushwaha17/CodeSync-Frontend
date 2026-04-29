import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile,
  changePassword,
} from '../api/authApi';

const s = {
  page:  { minHeight: '100vh', background: '#0d1117' },
  body: {
    maxWidth: '640px',
    margin:   '0 auto',
    padding:  '32px 20px',
  },
  title: {
    fontSize:     '22px',
    fontWeight:   '700',
    color:        '#e6edf3',
    marginBottom: '24px',
  },
  card: {
    background:   '#161b22',
    border:       '1px solid #21262d',
    borderRadius: '10px',
    padding:      '24px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize:     '16px',
    fontWeight:   '600',
    color:        '#e6edf3',
    marginBottom: '20px',
  },
  avatar: {
    width:          '72px',
    height:         '72px',
    borderRadius:   '50%',
    background:
      'linear-gradient(135deg, #58a6ff, #bc8cff)',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '28px',
    fontWeight:     '700',
    color:          '#fff',
    marginBottom:   '20px',
  },
  metaRow: {
    display:      'flex',
    gap:          '24px',
    flexWrap:     'wrap',
    marginBottom: '16px',
  },
  metaItem: {
    fontSize: '13px',
    color:    '#8b949e',
  },
  metaVal: {
    color:      '#e6edf3',
    fontWeight: '500',
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
    marginBottom: '14px',
  },
  saveBtn: {
    padding:      '9px 20px',
    background:   '#238636',
    border:       '1px solid #2ea043',
    borderRadius: '7px',
    color:        '#fff',
    fontSize:     '13px',
    fontWeight:   '600',
    cursor:       'pointer',
  },
};

export default function ProfilePage() {
  const { user, userId, loginUser } = useAuth();

  const [profile, setProfile] = useState({
    fullName:  user?.fullName  || '',
    username:  user?.username  || '',
    bio:       user?.bio       || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const [pwd, setPwd] = useState({
    currentPassword: '',
    newPassword:     '',
  });

  const [savingP, setSavingP] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';

  const handleSaveProfile = async () => {
    setSavingP(true);
    try {
      const res = await updateProfile(userId, profile);
      loginUser({
        accessToken: localStorage.getItem('token'),
        user:        res.data.data,
      });
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(
        err.response?.data?.message
        || 'Failed to update.'
      );
    } finally {
      setSavingP(false);
    }
  };

  const handleChangePwd = async () => {
    if (!pwd.currentPassword || !pwd.newPassword) {
      toast.error('Fill in both fields.');
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(userId, pwd);
      toast.success('Password changed!');
      setPwd({ currentPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(
        err.response?.data?.message
        || 'Failed to change password.'
      );
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.body}>
        <div style={s.title}>Profile</div>

        {/* Account info */}
        <div style={s.card}>
          <div style={s.avatar}>{initials}</div>
          <div style={s.metaRow}>
            <div style={s.metaItem}>
              Email:{' '}
              <span style={s.metaVal}>
                {user?.email}
              </span>
            </div>
            <div style={s.metaItem}>
              Role:{' '}
              <span style={s.metaVal}>
                {user?.role}
              </span>
            </div>
            <div style={s.metaItem}>
              Provider:{' '}
              <span style={s.metaVal}>
                {user?.provider}
              </span>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div style={s.card}>
          <div style={s.cardTitle}>Edit Profile</div>

          <label style={s.label}>Full Name</label>
          <input
            style={s.input}
            value={profile.fullName}
            onChange={(e) =>
              setProfile({
                ...profile,
                fullName: e.target.value,
              })
            }
          />

          <label style={s.label}>Username</label>
          <input
            style={s.input}
            value={profile.username}
            onChange={(e) =>
              setProfile({
                ...profile,
                username: e.target.value,
              })
            }
          />

          <label style={s.label}>Bio</label>
          <input
            style={s.input}
            placeholder="Tell us about yourself..."
            value={profile.bio}
            onChange={(e) =>
              setProfile({
                ...profile,
                bio: e.target.value,
              })
            }
          />

          <label style={s.label}>Avatar URL</label>
          <input
            style={s.input}
            placeholder="https://..."
            value={profile.avatarUrl}
            onChange={(e) =>
              setProfile({
                ...profile,
                avatarUrl: e.target.value,
              })
            }
          />

          <button
            style={{
              ...s.saveBtn,
              opacity: savingP ? 0.7 : 1,
            }}
            disabled={savingP}
            onClick={handleSaveProfile}
          >
            {savingP ? 'Saving…' : 'Save Profile'}
          </button>
        </div>

        {/* Change password — only for LOCAL accounts */}
        {user?.provider === 'LOCAL' && (
          <div style={s.card}>
            <div style={s.cardTitle}>
              Change Password
            </div>

            <label style={s.label}>
              Current Password
            </label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={pwd.currentPassword}
              onChange={(e) =>
                setPwd({
                  ...pwd,
                  currentPassword: e.target.value,
                })
              }
            />

            <label style={s.label}>New Password</label>
            <input
              style={s.input}
              type="password"
              placeholder="••••••••"
              value={pwd.newPassword}
              onChange={(e) =>
                setPwd({
                  ...pwd,
                  newPassword: e.target.value,
                })
              }
            />

            <button
              style={{
                ...s.saveBtn,
                opacity: savingPw ? 0.7 : 1,
              }}
              disabled={savingPw}
              onClick={handleChangePwd}
            >
              {savingPw
                ? 'Changing…'
                : 'Change Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}