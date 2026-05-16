import { useEffect } from 'react';
import { useNavigate, useSearchParams }
  from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function OAuth2SuccessPage() {
  const [params]      = useSearchParams();
  const navigate      = useNavigate();
  const { loginUser } = useAuth();

  useEffect(() => {
    const token    = params.get('token');
    const userId   = params.get('userId');
    const username = params.get('username');
    const email    = params.get('email');
    const role     = params.get('role');

    if (!token || !userId) {
      navigate('/auth', { replace: true });
      return;
    }

    // ── Must call loginUser() to update React state ──
    // Manually setting localStorage does NOT update
    // the token state in AuthContext, so PrivateRoute
    // keeps redirecting to /auth
    loginUser({
      accessToken: token,
      user: {
        userId:   Number(userId),
        username: username || '',
        email:    email    || '',
        fullName: username || '',
        role:     role     || 'DEVELOPER',
        provider: 'GOOGLE',
        isActive: true,
      },
    });

    navigate('/dashboard', { replace: true });
  }, []);

  return (
    <div style={{
      height:         '100vh',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      background:     '#0d1117',
      color:          '#8b949e',
      gap:            '16px',
      fontFamily:     'Inter, sans-serif',
    }}>
      <div style={{
        width:        '36px',
        height:       '36px',
        border:       '3px solid #30363d',
        borderTop:    '3px solid #58a6ff',
        borderRadius: '50%',
        animation:    'spin 0.8s linear infinite',
      }} />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{ fontSize: '16px' }}>
        Completing sign in...
      </div>
    </div>
  );
}