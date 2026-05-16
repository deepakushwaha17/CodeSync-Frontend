import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  updateProfile,
  changePassword,
  uploadAvatar,
} from '../api/authApi';

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

  title: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#111827',
    marginBottom: '28px',
  },

  card: {
    background: 'rgba(255,255,255,0.82)',
    border: '1px solid #e5eaf5',
    borderRadius: '22px',
    padding: '28px',
    marginBottom: '24px',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 18px 40px rgba(15,23,42,0.06)',
  },

  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '22px',
  },

  metaRow: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    marginBottom: '18px',
  },

  metaItem: {
    fontSize: '13px',
    color: '#6b7280',
  },

  metaVal: {
    color: '#111827',
    fontWeight: '600',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    color: '#374151',
    marginBottom: '7px',
    fontWeight: '600',
  },

  input: {
    width: '100%',
    padding: '11px 14px',
    background: '#ffffff',
    border: '1px solid #dbe3f0',
    borderRadius: '10px',
    color: '#111827',
    fontSize: '14px',
    outline: 'none',
    marginBottom: '16px',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
  },

  saveBtn: {
    padding: '11px 22px',
    background:
      'linear-gradient(135deg,#2563eb,#4f46e5)',
    border: 'none',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 10px 20px rgba(37,99,235,0.22)',
    transition: 'all 0.2s ease',
  },
};

function withCacheBust(url) {
  if (!url || url.startsWith('data:')) return url;
  if (url.includes('?t=')) return url;
  return `${url}?t=${Date.now()}`;
}

function Avatar({ size = 72, url, fallback }) {
  const [err, setErr] = useState(false);

  return url && !err ? (
    <img
      src={url}
      alt="avatar"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #dbeafe',
        display: 'block',
        flexShrink: 0,
        boxShadow: '0 10px 24px rgba(37,99,235,0.16)',
      }}
      onError={() => setErr(true)}
    />
  ) : (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background:
          'linear-gradient(135deg,#2563eb,#7c3aed)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.33,
        fontWeight: '700',
        color: '#fff',
        border: '3px solid #dbeafe',
        flexShrink: 0,
        boxShadow: '0 10px 24px rgba(37,99,235,0.16)',
      }}
    >
      {fallback}
    </div>
  );
}

export default function ProfilePage() {
  const { user, userId, loginUser } = useAuth();

  const [profile, setProfile] = useState({
    fullName: user?.fullName || '',
    username: user?.username || '',
    bio: user?.bio || '',
    avatarUrl: user?.avatarUrl || '',
  });

  const [pwd, setPwd] = useState({
    currentPassword: '',
    newPassword: '',
  });

  const [savingP, setSavingP] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const [photoTab, setPhotoTab] = useState('upload');
  const [urlInput, setUrlInput] = useState(
    user?.avatarUrl?.startsWith('http') ? user.avatarUrl : ''
  );
  const [urlStatus, setUrlStatus] = useState('idle');
  const [localPreview, setLocalPreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '??';

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image too large. Max size 2MB.');
      return;
    }

    const allowed = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowed.includes(file.type)) {
      toast.error('Only JPG/JPEG, PNG, GIF, WEBP.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (ev) => {
      setLocalPreview(ev.target.result);
      setSelectedFile(file);
      setProfile((prev) => ({
        ...prev,
        avatarUrl: '',
      }));
      toast.success('Photo selected. Click Save Profile.');
    };

    reader.onerror = () => toast.error('Failed to read image.');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleTestUrl = () => {
    const cleanUrl = urlInput.trim();

    if (!cleanUrl) {
      toast.error('Enter a URL first.');
      return;
    }

    if (
      !cleanUrl.startsWith('http://') &&
      !cleanUrl.startsWith('https://')
    ) {
      toast.error('Only http/https image URLs are allowed.');
      return;
    }

    setUrlStatus('loading');

    const img = new Image();

    img.onload = () => {
      setUrlStatus('ok');
      setSelectedFile(null);
      setLocalPreview('');
      setProfile((prev) => ({
        ...prev,
        avatarUrl: cleanUrl,
      }));
      toast.success('URL works!');
    };

    img.onerror = () => {
      setUrlStatus('error');
      toast.error('Image URL does not load.');
    };

    img.src = cleanUrl;
  };

  const handleSaveProfile = async () => {
    setSavingP(true);

    try {
      let finalUser;

      if (selectedFile) {
        const uploadRes = await uploadAvatar(userId, selectedFile);

        const uploadedUrl =
          uploadRes.data?.data?.avatarUrl ||
          uploadRes.data?.data?.user?.avatarUrl ||
          uploadRes.data?.data?.avatar_url;

        if (!uploadedUrl) {
          toast.error('Avatar uploaded, but URL was not returned.');
          return;
        }

        const freshUrl = withCacheBust(uploadedUrl);

        finalUser = {
          ...user,
          ...profile,
          avatarUrl: freshUrl,
        };

        loginUser({
          accessToken: localStorage.getItem('token'),
          user: finalUser,
        });

        setProfile({
          fullName: finalUser.fullName || '',
          username: finalUser.username || '',
          bio: finalUser.bio || '',
          avatarUrl: freshUrl,
        });

        setLocalPreview('');
        setSelectedFile(null);
        setUrlInput(freshUrl);

        toast.success('Profile photo updated!');
        return;
      }

      const avatarUrl = profile.avatarUrl?.trim();

      if (
        avatarUrl &&
        !avatarUrl.startsWith('http://') &&
        !avatarUrl.startsWith('https://')
      ) {
        toast.error('Avatar URL must start with http:// or https://');
        return;
      }

      const res = await updateProfile(userId, {
        ...profile,
        avatarUrl,
      });

      const updated = res.data.data;

      finalUser = {
        ...user,
        ...updated,
        avatarUrl: avatarUrl
          ? withCacheBust(avatarUrl)
          : '',
      };

      loginUser({
        accessToken: localStorage.getItem('token'),
        user: finalUser,
      });

      setProfile({
        fullName: finalUser.fullName || '',
        username: finalUser.username || '',
        bio: finalUser.bio || '',
        avatarUrl: finalUser.avatarUrl || '',
      });

      setLocalPreview('');
      setSelectedFile(null);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to update.'
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
      setPwd({
        currentPassword: '',
        newPassword: '',
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to change password.'
      );
    } finally {
      setSavingPw(false);
    }
  };

  const displayAvatar =
    localPreview ||
    profile.avatarUrl ||
    user?.avatarUrl;

  return (
    <div style={s.page}>
      <Navbar />

      <div style={s.body}>
        <div style={s.title}>Profile</div>

        <div style={s.card}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar
              size={150}
              url={displayAvatar}
              fallback={initials}
            />

            <h2
              style={{
                color: '#111827',
                fontSize: '24px',
                margin: '18px 0 4px',
                fontWeight: '700',
              }}
            >
              {profile.fullName || user?.fullName}
            </h2>

            <div
              style={{
                color: '#6b7280',
                fontSize: '16px',
                marginBottom: '14px',
              }}
            >
              @{profile.username || user?.username}
            </div>

            <div
              style={{
                color: '#111827',
                fontSize: '14px',
                marginBottom: '18px',
                textAlign: 'center',
              }}
            >
              {profile.bio || user?.bio || 'No bio added'}
            </div>

            <button
              type="button"
              style={{
                width: '100%',
                padding: '9px 12px',
                background: '#ffffff',
                border: '1px solid #dbe3f0',
                color: '#111827',
                boxShadow: '0 8px 20px rgba(15,23,42,0.04)',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                marginBottom: '18px',
              }}
              onClick={() => {
                document
                  .querySelector('#edit-profile-section')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Edit profile
            </button>
          </div>

          <div style={s.metaRow}>
            <div style={s.metaItem}>
              Email:{' '}
              <span style={s.metaVal}>{user?.email}</span>
            </div>

            <div style={s.metaItem}>
              Role:{' '}
              <span style={s.metaVal}>{user?.role}</span>
            </div>

            <div style={s.metaItem}>
              Provider:{' '}
              <span style={s.metaVal}>
                {user?.provider}
              </span>
            </div>
          </div>
        </div>

        <div style={s.card} id="edit-profile-section">
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

          <label style={s.label}>Profile Photo</label>

          <div
            style={{
              padding: '16px',
              background: '#f8fbff',
              border: '1px solid #e5eaf5',
              borderRadius: '14px',
              marginBottom: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <Avatar
                size={56}
                url={displayAvatar}
                fallback={initials}
              />

              <div>
                <div
                  style={{
                    fontSize: '13px',
                    color: '#111827',
                    fontWeight: '600',
                    marginBottom: '2px',
                  }}
                >
                  {displayAvatar
                    ? '✓ Photo ready'
                    : 'No photo set'}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                  }}
                >
                  Upload a file or paste a direct image URL
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                background: '#eef2ff',
                borderRadius: '10px',
                padding: '4px',
                marginBottom: '14px',
                border: '1px solid #dbe3f0',
              }}
            >
              {['upload', 'url'].map((t) => (
                <button
                  key={t}
                  type="button"
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background:
                      photoTab === t
                        ? '#ffffff'
                        : 'transparent',
                    color:
                      photoTab === t
                        ? '#2563eb'
                        : '#6b7280',
                    boxShadow:
                      photoTab === t
                        ? '0 6px 14px rgba(37,99,235,0.10)'
                        : 'none',
                  }}
                  onClick={() => {
                    setPhotoTab(t);
                    setUrlStatus('idle');
                  }}
                >
                  {t === 'upload'
                    ? '📁 Upload File'
                    : '🔗 Image URL'}
                </button>
              ))}
            </div>

            {photoTab === 'upload' && (
              <div>
                <input
                  id="avatar-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />

                <label
                  htmlFor="avatar-file-input"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '22px',
                    background: '#ffffff',
                    border: '2px dashed #cbd5e1',
                    color: '#6b7280',
                    borderRadius: '12px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    textAlign: 'center',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      '#2563eb';
                    e.currentTarget.style.color = '#2563eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      '#cbd5e1';
                    e.currentTarget.style.color = '#6b7280';
                  }}
                >
                  <span style={{ fontSize: '28px' }}>📁</span>
                  <span>Click to choose photo</span>
                  <span style={{ fontSize: '11px' }}>
                    JPG, PNG, GIF, WEBP — max 2MB
                  </span>
                </label>
              </div>
            )}

            {photoTab === 'url' && (
              <div>
                <div style={{ position: 'relative' }}>
                  <input
                    style={{
                      ...s.input,
                      marginBottom: '8px',
                      paddingRight: '70px',
                    }}
                    placeholder="https://i.imgur.com/abc.jpg"
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUrlStatus('idle');
                    }}
                  />

                  <button
                    type="button"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-65%)',
                      padding: '5px 10px',
                      background: '#2563eb',
                      border: 'none',
                      borderRadius: '7px',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                    onClick={handleTestUrl}
                  >
                    Test
                  </button>
                </div>

                {urlStatus === 'loading' && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#d97706',
                      marginBottom: '8px',
                    }}
                  >
                    ⏳ Checking URL...
                  </div>
                )}

                {urlStatus === 'ok' && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#16a34a',
                      marginBottom: '8px',
                    }}
                  >
                    ✓ URL works! Click Save Profile.
                  </div>
                )}

                {urlStatus === 'error' && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#dc2626',
                      marginBottom: '8px',
                      background: '#fef2f2',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #fecaca',
                      lineHeight: '1.6',
                    }}
                  >
                    ✕ URL did not load. Reasons:
                    <br />
                    • Google Images links don't work
                    <br />
                    • Site blocks direct embedding
                    <br />
                    • Right-click image → "Open in new tab" → copy that URL
                  </div>
                )}

                <div
                  style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    lineHeight: '1.7',
                    padding: '10px',
                    background: '#ffffff',
                    borderRadius: '8px',
                    border: '1px solid #e5eaf5',
                    marginTop: '4px',
                  }}
                >
                  <div
                    style={{
                      color: '#374151',
                      marginBottom: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    ✅ URLs that work:
                  </div>
                  • i.imgur.com/xxxxx.jpg
                  <br />
                  • avatars.githubusercontent.com
                  <br />
                  • i.pravatar.cc/150?img=5
                  <br />
                  • gravatar.com/avatar/hash
                  <br />

                  <div
                    style={{
                      color: '#dc2626',
                      marginTop: '6px',
                      marginBottom: '2px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}
                  >
                    ✕ URLs that don't work:
                  </div>
                  • google.com/imgres?...
                  <br />
                  • shutterstock.com, getty images
                </div>
              </div>
            )}

            {(profile.avatarUrl || localPreview || selectedFile) && (
              <button
                type="button"
                style={{
                  marginTop: '12px',
                  padding: '7px 12px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#dc2626',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setProfile({
                    ...profile,
                    avatarUrl: '',
                  });
                  setLocalPreview('');
                  setSelectedFile(null);
                  setUrlInput('');
                  setUrlStatus('idle');
                  toast.success('Photo removed.');
                }}
              >
                ✕ Remove photo
              </button>
            )}
          </div>

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

        {user?.provider === 'LOCAL' && (
          <div style={s.card}>
            <div style={s.cardTitle}>Change Password</div>

            <label style={s.label}>Current Password</label>
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
              {savingPw ? 'Changing…' : 'Change Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}