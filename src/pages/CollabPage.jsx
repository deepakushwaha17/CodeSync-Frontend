import React, {
  useEffect, useState,
  useRef, useCallback,
} from 'react';
import { useParams, useNavigate }
  from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import toast   from 'react-hot-toast';
import Navbar  from '../components/layout/Navbar';
import Loader  from '../components/common/Loader';
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
    height:        '100vh',
    display:       'flex',
    flexDirection: 'column',
    background:    '#0d1117',
    overflow:      'hidden',
  },
  body: {
    flex:     1,
    display:  'flex',
    overflow: 'hidden',
  },
  sidebar: {
    width:         '200px',
    background:    '#161b22',
    borderRight:   '1px solid #21262d',
    display:       'flex',
    flexDirection: 'column',
  },
  sidebarHdr: {
    padding:        '10px 12px',
    borderBottom:   '1px solid #21262d',
    fontSize:       '11px',
    color:          '#8b949e',
    fontWeight:     '600',
    textTransform:  'uppercase',
    letterSpacing:  '0.5px',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
  },
  liveDot: {
    width:        '7px',
    height:       '7px',
    borderRadius: '50%',
    background:   '#3fb950',
    animation:    'pulse 1.5s infinite',
  },
  participantItem: {
    padding:     '10px 12px',
    display:     'flex',
    alignItems:  'center',
    gap:         '8px',
    fontSize:    '13px',
    color:       '#e6edf3',
    borderBottom:'1px solid #21262d',
  },
  avatar: {
    width:          '28px',
    height:         '28px',
    borderRadius:   '50%',
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    fontSize:       '11px',
    fontWeight:     '700',
    color:          '#fff',
    flexShrink:     0,
  },
  editorArea: {
    flex:          1,
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
  },
  toolbar: {
    padding:      '8px 12px',
    background:   '#161b22',
    borderBottom: '1px solid #21262d',
    display:      'flex',
    alignItems:   'center',
    gap:          '8px',
  },
  info: {
    flex:        1,
    fontSize:    '12px',
    color:       '#8b949e',
    fontFamily:  'JetBrains Mono, monospace',
    overflow:    'hidden',
    textOverflow:'ellipsis',
    whiteSpace:  'nowrap',
  },
  btn: {
    padding:      '5px 12px',
    borderRadius: '6px',
    border:       '1px solid #30363d',
    background:   '#21262d',
    color:        '#e6edf3',
    fontSize:     '12px',
    cursor:       'pointer',
  },
  dangerBtn: {
    borderColor: '#f85149',
    color:       '#f85149',
    background:  'none',
  },
  kickBtn: {
    background:   'none',
    border:       'none',
    color:        '#f85149',
    cursor:       'pointer',
    fontSize:     '12px',
    padding:      '2px 4px',
  },
};

export default function CollabPage() {
  const { sessionId }    = useParams();
  const navigate         = useNavigate();
  const { userId }       = useAuth();
  const [session, setSess]     = useState(null);
  const [file, setFile]        = useState(null);
  const [content, setContent]  = useState('');
  const [parts, setParts]      = useState([]);
  const [connected, setConn]   = useState(false);
  const [loading, setLoading]  = useState(true);
  const stompRef               = useRef(null);
  const remoteRef              = useRef(false);

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
      reconnectDelay:   3000,
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
          userId:    Number(userId),
          content:   val || '',
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
        line:   e.position.lineNumber,
        col:    e.position.column,
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
            >
              Leave
            </button>
            {isOwner && (
              <button
                style={{ ...s.btn, ...s.dangerBtn }}
                onClick={handleEnd}
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
            theme="vs-dark"
            options={{
              fontSize:            14,
              fontFamily:
                'JetBrains Mono, monospace',
              minimap:             { enabled: false },
              scrollBeyondLastLine:false,
              automaticLayout:     true,
              tabSize:             2,
              wordWrap:            'on',
            }}
          />
        </div>
      </div>
    </div>
  );
}