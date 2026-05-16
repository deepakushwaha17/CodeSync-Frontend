import React, {
  useEffect, useState,
  useRef, useCallback,
} from 'react';
import { useParams, useNavigate }
  from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast from 'react-hot-toast'; 
import Navbar from '../components/layout/Navbar';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import {
  getSession,
  getParticipants,
  leaveSession,
  endSession,
  kickParticipant,
} from '../api/collabApi';
import {
  getFileById,
  getFileContent,
} from '../api/fileApi';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8087/ws';

const s = {
  page: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background:
      'linear-gradient(135deg,#f8fbff,#eef4ff)',
    overflow: 'hidden',
  },

  body: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },

  sidebar: {
    width: '230px',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(12px)',
    borderRight: '1px solid #e5eaf5',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 30px rgba(15,23,42,0.05)',
  },

  sidebarHdr: {
    padding: '14px 16px',
    borderBottom: '1px solid #e5eaf5',
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  liveDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#16a34a',
    animation: 'pulse 1.5s infinite',
  },

  participantItem: {
    padding: '12px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#111827',
    borderBottom: '1px solid #eef2ff',
    transition: 'background 0.15s ease',
  },

  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 6px 14px rgba(15,23,42,0.12)',
  },

  editorArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },

  toolbar: {
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid #e5eaf5',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    boxShadow: '0 10px 30px rgba(15,23,42,0.04)',
  },

  info: {
    flex: 1,
    fontSize: '12px',
    color: '#6b7280',
    fontFamily: 'JetBrains Mono, monospace',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  btn: {
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1px solid #dbe3f0',
    background: '#ffffff',
    color: '#111827',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  dangerBtn: {
    borderColor: '#fecaca',
    background: '#fef2f2',
    color: '#dc2626',
  },

  kickBtn: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '11px',
    padding: '4px 7px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
  },
};

export default function CollabPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { userId } = useAuth();
  const [session, setSess] = useState(null);
  const [file, setFile] = useState(null);
  const [content, setContent] = useState('');
  const [parts, setParts] = useState([]);
  const [connected, setConn] = useState(false);
  const [loading, setLoading] = useState(true);
  const stompRef = useRef(null);
  const remoteRef = useRef(false);

  useEffect(() => {
    async function load() {
      try {
        const [sRes, pRes] = await Promise.all([
          getSession(sessionId),
          getParticipants(sessionId),
        ]);
        const sess = sRes.data.data;
        setSess(sess);
        setParts(pRes.data.data || []);
        const [fRes, cRes] = await Promise.all([
          getFileById(sess.fileId),
          getFileContent(sess.fileId),
        ]);
        setFile(fRes.data.data);
        setContent(cRes.data.data || '');
      } catch {
        toast.error('Failed to load session.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [sessionId]);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 3000,
      onConnect: () => {
        setConn(true);
        toast.success('Connected to session!');

        client.subscribe(
          `/topic/session/${sessionId}`,
          (msg) => {
            const ch = JSON.parse(msg.body);
            if (
              String(ch.userId) !== String(userId)
              && ch.content != null
            ) {
              remoteRef.current = true;
              setContent(ch.content);
            }
          }
        );

        client.subscribe(
          `/topic/session/${sessionId}/users`,
          async () => {
            const pRes =
              await getParticipants(sessionId);
            setParts(pRes.data.data || []);
          }
        );
      },
      onDisconnect: () => setConn(false),
    });
    client.activate();
    stompRef.current = client;
    return () => { client.deactivate(); };
  }, [sessionId, userId]);

  const handleChange = useCallback((val) => {
    if (remoteRef.current) {
      remoteRef.current = false;
      return;
    }
    setContent(val || '');
    if (stompRef.current?.connected) {
      stompRef.current.publish({
        destination:
          `/app/session/${sessionId}/change`,
        body: JSON.stringify({
          sessionId,
          userId: Number(userId),
          content: val || '',
          operation: 'REPLACE',
        }),
      });
    }
  }, [sessionId, userId]);

  const handleCursorMove = useCallback((e) => {
    if (!stompRef.current?.connected) return;
    stompRef.current.publish({
      destination:
        `/app/session/${sessionId}/cursor`,
      body: JSON.stringify({
        sessionId,
        userId: Number(userId),
        line: e.position.lineNumber,
        col: e.position.column,
      }),
    });
  }, [sessionId, userId]);

  const handleLeave = async () => {
    try {
      await leaveSession(sessionId);
      stompRef.current?.deactivate();
      toast.success('Left session.');
      navigate(-1);
    } catch {
      toast.error('Failed to leave.');
    }
  };

  const handleEnd = async () => {
    if (!window.confirm('End session for everyone?'))
      return;
    try {
      await endSession(sessionId);
      stompRef.current?.deactivate();
      toast.success('Session ended.');
      navigate(-1);
    } catch {
      toast.error('Failed to end session.');
    }
  };

  const handleKick = async (targetId) => {
    try {
      await kickParticipant(sessionId, targetId);
      toast.success('Participant kicked.');
      const pRes = await getParticipants(sessionId);
      setParts(pRes.data.data || []);
    } catch {
      toast.error('Failed to kick.');
    }
  };

  if (loading) return (
    <div style={s.page}><Navbar /><Loader /></div>
  );

  const isOwner =
    session?.ownerId === Number(userId);

  return (
    <div style={s.page}>
      <style>{`
        @keyframes pulse {
          0%,100% { opacity:1; }
          50%      { opacity:0.4; }
        }
      `}</style>
      <Navbar />
      <div style={s.body}>

        {/* Participants */}
        <div style={s.sidebar}>
          <div style={s.sidebarHdr}>
            <span>Participants</span>
            <div style={s.liveDot} />
          </div>
          {parts.map((p) => (
            <div
              key={p.participantId}
              style={s.participantItem}
            >
              <div style={{
                ...s.avatar,
                background: p.color || '#58a6ff',
              }}>
                {p.userId}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px' }}>
                  User #{p.userId}
                </div>
                <div style={{
                  fontSize: '11px', color: '#8b949e'
                }}>
                  {p.role}
                </div>
              </div>
              {isOwner
                && String(p.userId)
                !== String(userId) && (
                  <button
                    style={s.kickBtn}
                    onClick={() => handleKick(p.userId)}
                    title="Kick"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fee2e2';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#fef2f2';
                    }}
                  >
                    ✕
                  </button>
                )}
            </div>
          ))}
        </div>

        {/* Editor */}
        <div style={s.editorArea}>
          <div style={s.toolbar}>
            <span style={s.info}>
              {connected ? '🟢' : '🔴'}{' '}
              {sessionId.slice(0, 8)}…
              {' '}| {file?.name}
            </span>
              <button
                style={s.btn}
                onClick={handleLeave}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 10px 20px rgba(15,23,42,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Leave
              </button>
            {isOwner && (
              <button
                style={{ ...s.btn, ...s.dangerBtn }}
                onClick={handleEnd}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    'translateY(-1px)';
                  e.currentTarget.style.boxShadow =
                    '0 10px 20px rgba(220,38,38,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                End Session
              </button>
            )}
          </div>

          <Editor
            height="100%"
            language={
              file?.language || 'plaintext'
            }
            value={content}
            onChange={handleChange}
            onMount={(editor) => {
              editor.onDidChangeCursorPosition(
                handleCursorMove
              );
            }}
            theme="vs"
            options={{
              fontSize: 14,
              fontFamily:
                'JetBrains Mono, monospace',
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
            }}
          />
        </div>
      </div>
    </div>
  );
}