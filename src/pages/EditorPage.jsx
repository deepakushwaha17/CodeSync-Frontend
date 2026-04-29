import React, {
  useEffect, useState,
  useCallback, useRef,
} from 'react';
import { useParams, useNavigate }
  from 'react-router-dom';
import Editor from '@monaco-editor/react';
import toast  from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Loader from '../components/common/Loader';
import { useAuth } from '../context/AuthContext';
import {
  getFileById,
  getFileContent,
  updateFileContent,
  getFileTree,
} from '../api/fileApi';
import {
  createSnapshot,
  getFileHistory,
} from '../api/versionApi';
import {
  submitExecution,
  getJob,
} from '../api/executionApi';
import {
  getCommentsByFile,
  addComment,
} from '../api/commentApi';
import {
  createSession,
  getActiveSession,
} from '../api/collabApi';

const EXT_LANG = {
  java:'java',  py:'python',
  js:'javascript', ts:'typescript',
  cpp:'cpp',    c:'c',
  go:'go',      rs:'rust',
  rb:'ruby',    php:'php',
  kt:'kotlin',  swift:'swift',
};

const FILE_ICONS = {
  java:'☕', py:'🐍', js:'🟨', ts:'🔷',
  go:'🐹', rs:'🦀', cpp:'⚙️', c:'⚙️',
  rb:'💎', php:'🐘', kt:'🎯',
};

function getEditorLang(file) {
  if (!file) return 'plaintext';
  const ext =
    file.name?.split('.').pop()?.toLowerCase();
  return EXT_LANG[ext]
    || file.language?.toLowerCase()
    || 'plaintext';
}

function flattenTree(nodes, depth = 0) {
  const items = [];
  for (const n of nodes) {
    items.push({ ...n, depth });
    if (n.fileType === 'FOLDER' && n.children) {
      items.push(
        ...flattenTree(n.children, depth + 1)
      );
    }
  }
  return items;
}

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
    width:         '210px',
    background:    '#161b22',
    borderRight:   '1px solid #21262d',
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
  },
  sidebarHdr: {
    padding:       '10px 12px',
    borderBottom:  '1px solid #21262d',
    fontSize:      '11px',
    color:         '#8b949e',
    fontWeight:    '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sidebarList: { flex: 1, overflowY: 'auto' },
  sidebarItem: {
    padding:    '7px 12px',
    fontSize:   '12px',
    cursor:     'pointer',
    display:    'flex',
    alignItems: 'center',
    gap:        '6px',
    borderRadius:'4px',
    margin:     '1px 4px',
    transition: 'background 0.1s',
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
  fileName: {
    fontSize:   '13px',
    color:      '#e6edf3',
    fontWeight: '500',
    fontFamily: 'JetBrains Mono, monospace',
    flex:       1,
  },
  saveStatus: {
    fontSize:    '11px',
    color:       '#484f58',
    marginLeft:  '4px',
  },
  tBtn: {
    padding:      '5px 12px',
    borderRadius: '6px',
    border:       '1px solid #30363d',
    background:   '#21262d',
    color:        '#e6edf3',
    fontSize:     '12px',
    fontWeight:   '500',
    cursor:       'pointer',
    whiteSpace:   'nowrap',
  },
  runBtn: {
    background:  '#238636',
    borderColor: '#2ea043',
    color:       '#fff',
  },
  rightPanel: {
    width:         '330px',
    background:    '#161b22',
    borderLeft:    '1px solid #21262d',
    display:       'flex',
    flexDirection: 'column',
    overflow:      'hidden',
  },
  panelTabs: {
    display:      'flex',
    borderBottom: '1px solid #21262d',
  },
  panelTab: {
    flex:            1,
    padding:         '8px 4px',
    background:      'none',
    border:          'none',
    borderBottom:    '2px solid transparent',
    color:           '#8b949e',
    fontSize:        '10px',
    fontWeight:      '600',
    cursor:          'pointer',
    textTransform:   'uppercase',
    letterSpacing:   '0.5px',
    transition:      'all 0.15s',
  },
  panelTabActive: {
    color:           '#58a6ff',
    borderBottomColor:'#58a6ff',
  },
  panelBody: {
    flex:      1,
    overflowY: 'auto',
    padding:   '12px',
  },
  stdinBox: {
    width:       '100%',
    padding:     '8px 10px',
    background:  '#0d1117',
    border:      '1px solid #30363d',
    borderRadius:'6px',
    color:       '#e6edf3',
    fontSize:    '12px',
    fontFamily:  'JetBrains Mono, monospace',
    resize:      'vertical',
    outline:     'none',
    minHeight:   '60px',
    marginBottom:'8px',
  },
  outputBox: {
    background:   '#0d1117',
    border:       '1px solid #21262d',
    borderRadius: '6px',
    padding:      '10px',
    fontFamily:   'JetBrains Mono, monospace',
    fontSize:     '12px',
    color:        '#3fb950',
    minHeight:    '100px',
    whiteSpace:   'pre-wrap',
    wordBreak:    'break-all',
  },
  snapItem: {
    padding:      '10px',
    background:   '#0d1117',
    border:       '1px solid #21262d',
    borderRadius: '6px',
    marginBottom: '8px',
    fontSize:     '12px',
  },
  commentItem: {
    padding:      '10px',
    background:   '#0d1117',
    border:       '1px solid #21262d',
    borderRadius: '6px',
    marginBottom: '8px',
    fontSize:     '12px',
  },
  panelBtn: {
    width:        '100%',
    padding:      '8px',
    borderRadius: '6px',
    border:       '1px solid #30363d',
    background:   '#21262d',
    color:        '#e6edf3',
    fontSize:     '12px',
    cursor:       'pointer',
    marginBottom: '12px',
    textAlign:    'center',
  },
};

export default function EditorPage() {
  const { projectId, fileId } = useParams();
  const navigate              = useNavigate();
  const { userId }            = useAuth();

  const [file, setFile]           = useState(null);
  const [content, setContent]     = useState('');
  const [tree, setTree]           = useState([]);
  const [panelTab, setPanelTab]   = useState('run');
  const [stdin, setStdin]         = useState('');
  const [output, setOutput]       = useState('');
  const [outputErr, setOutputErr] = useState('');
  const [runStatus, setRunStatus] = useState('');
  const [running, setRunning]     = useState(false);
  const [snapshots, setSnaps]     = useState([]);
  const [comments, setComments]   = useState([]);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(true);
  const [loading, setLoading]     = useState(true);
  const saveTimer                 = useRef(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [fRes, cRes, tRes, sRes, cmRes] =
          await Promise.all([
            getFileById(fileId),
            getFileContent(fileId),
            getFileTree(projectId),
            getFileHistory(fileId),
            getCommentsByFile(fileId),
          ]);
        setFile(fRes.data.data);
        setContent(cRes.data.data   || '');
        setTree(tRes.data.data      || []);
        setSnaps(sRes.data.data     || []);
        setComments(cmRes.data.data || []);
      } catch {
        toast.error('Failed to load file.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fileId, projectId]);

  const handleContentChange = useCallback((val) => {
    setContent(val || '');
    setSaved(false);
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      try {
        await updateFileContent(fileId, val || '');
        setSaved(true);
      } catch { /* silent */ }
      finally { setSaving(false); }
    }, 2000);
  }, [fileId]);

  const handleRun = async () => {
    setRunning(true);
    setOutput('');
    setOutputErr('');
    setRunStatus('QUEUED');
    try {
      await updateFileContent(fileId, content);
      const res = await submitExecution({
        projectId:  Number(projectId),
        fileId:     Number(fileId),
        language:   getEditorLang(file),
        sourceCode: content,
        stdin: stdin,
        input: stdin
      });
      const jobId = res.data.data.jobId;
      let attempts = 0;

      const poll = async () => {
        const jRes = await getJob(jobId);
        const job  = jRes.data.data;
        setRunStatus(job.status);
        const done = [
          'COMPLETED','FAILED',
          'TIMED_OUT','CANCELLED',
        ].includes(job.status);

        if (done) {
          setOutput(job.stdout    || '');
          setOutputErr(job.stderr || '');
          setRunning(false);
        } else if (attempts < 20) {
          attempts++;
          setTimeout(poll, 1500);
        } else {
          setRunning(false);
        }
      };
      setTimeout(poll, 1500);
    } catch {
      toast.error('Failed to submit.');
      setRunning(false);
    }
  };

  const handleSnapshot = async () => {
    const msg = prompt('Commit message:');
    if (!msg) return;
    try {
      await createSnapshot({
        projectId:  Number(projectId),
        fileId:     Number(fileId),
        message:    msg,
        content,
        branch:     'main',
      });
      toast.success('Snapshot created!');
      const sRes = await getFileHistory(fileId);
      setSnaps(sRes.data.data || []);
    } catch {
      toast.error('Failed to create snapshot.');
    }
  };

  const handleCollab = async () => {
    try {
      let session;
      try {
        const res = await getActiveSession(
          projectId, fileId
        );
        session = res.data.data;
      } catch {
        const res = await createSession({
          projectId:           Number(projectId),
          fileId:              Number(fileId),
          language:            getEditorLang(file),
          maxParticipants:     10,
          isPasswordProtected: false,
        });
        session = res.data.data;
        toast.success('Session started!');
      }
      navigate(`/collab/${session.sessionId}`);
    } catch {
      toast.error('Failed to start session.');
    }
  };

  const handleAddComment = async () => {
    const text = prompt('Comment:');
    if (!text) return;
    try {
      await addComment({
        projectId:  Number(projectId),
        fileId:     Number(fileId),
        content:    text,
        lineNumber: 1,
      });
      toast.success('Comment added!');
      const cmRes = await getCommentsByFile(fileId);
      setComments(cmRes.data.data || []);
    } catch {
      toast.error('Failed to add comment.');
    }
  };

  if (loading) return (
    <div style={s.page}><Navbar /><Loader /></div>
  );

  const flat = flattenTree(tree);

  return (
    <div style={s.page}>
      <Navbar />
      <div style={s.body}>

        {/* File sidebar */}
        <div style={s.sidebar}>
          <div style={s.sidebarHdr}>Explorer</div>
          <div style={s.sidebarList}>
            {flat.map((node) => {
              const ext =
                node.name?.split('.').pop()
                         ?.toLowerCase();
              const icon = node.fileType === 'FOLDER'
                ? '📁'
                : (FILE_ICONS[ext] || '📄');
              const isActive =
                String(node.fileId) ===
                String(fileId);

              return (
                <div
                  key={node.fileId}
                  style={{
                    ...s.sidebarItem,
                    paddingLeft:
                      `${12 + node.depth * 12}px`,
                    background: isActive
                      ? '#21262d' : 'transparent',
                    color: isActive
                      ? '#e6edf3' : '#8b949e',
                  }}
                  onClick={() => {
                    if (node.fileType === 'FILE') {
                      navigate(
                        `/editor/${projectId}`
                        + `/${node.fileId}`
                      );
                    }
                  }}
                >
                  <span>{icon}</span>
                  {node.name}
                </div>
              );
            })}
          </div>
        </div>

        {/* Monaco editor */}
        <div style={s.editorArea}>
          <div style={s.toolbar}>
            <span style={s.fileName}>
              {file?.name || '...'}
            </span>
            <span style={s.saveStatus}>
              {saving ? '💾 Saving…'
                : saved ? '✓ Saved' : '• Unsaved'}
            </span>
            <button
              style={{ ...s.tBtn, ...s.runBtn }}
              onClick={handleRun}
              disabled={running}
            >
              {running ? '⏳ Running…' : '▶ Run'}
            </button>
            <button
              style={s.tBtn}
              onClick={handleSnapshot}
            >
              📸 Snapshot
            </button>
            <button
              style={s.tBtn}
              onClick={handleCollab}
            >
              👥 Collab
            </button>
          </div>

          <Editor
            height="100%"
            language={getEditorLang(file)}
            value={content}
            onChange={handleContentChange}
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
              lineNumbers:         'on',
              renderLineHighlight: 'line',
              smoothScrolling:     true,
              cursorBlinking:      'phase',
              bracketPairColorization:
                { enabled: true },
            }}
          />
        </div>

        {/* Right panel */}
        <div style={s.rightPanel}>
          <div style={s.panelTabs}>
            {[
              { key: 'run',      label: '▶ Run'      },
              { key: 'history',  label: '📸 History'  },
              { key: 'comments', label: '💬 Comments' },
            ].map((t) => (
              <button
                key={t.key}
                style={{
                  ...s.panelTab,
                  ...(panelTab === t.key
                    ? s.panelTabActive : {}),
                }}
                onClick={() => setPanelTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div style={s.panelBody}>

            {/* Run */}
            {panelTab === 'run' && (
              <>
                <div style={{
                  fontSize:     '12px',
                  color:        '#8b949e',
                  marginBottom: '6px',
                }}>
                  Standard Input
                </div>
                <textarea
                  style={s.stdinBox}
                  placeholder="Program input..."
                  value={stdin}
                  onChange={(e) =>
                    setStdin(e.target.value)
                  }
                />

                {runStatus && (
                  <div style={{
                    fontSize:     '12px',
                    fontWeight:   '600',
                    marginBottom: '8px',
                    color:
                      runStatus === 'COMPLETED'
                        ? '#3fb950'
                        : runStatus === 'FAILED'
                        ? '#f85149'
                        : '#d29922',
                  }}>
                    {runStatus}
                  </div>
                )}

                <div style={{
                  fontSize:     '12px',
                  color:        '#8b949e',
                  marginBottom: '6px',
                }}>
                  Output
                </div>
                <div style={s.outputBox}>
                  {output || (running
                    ? 'Running…'
                    : 'Run your code to see output.'
                  )}
                </div>

                {outputErr && (
                  <div style={{
                    ...s.outputBox,
                    marginTop: '8px',
                    color:     '#f85149',
                  }}>
                    {outputErr}
                  </div>
                )}
              </>
            )}

            {/* History */}
            {panelTab === 'history' && (
              <>
                <button
                  style={s.panelBtn}
                  onClick={handleSnapshot}
                >
                  📸 Create Snapshot
                </button>
                {snapshots.length === 0 ? (
                  <div style={{
                    color:     '#8b949e',
                    fontSize:  '13px',
                    textAlign: 'center',
                    padding:   '20px',
                  }}>
                    No snapshots yet.
                  </div>
                ) : snapshots.map((snap) => (
                  <div
                    key={snap.snapshotId}
                    style={s.snapItem}
                  >
                    <div style={{ color: '#e6edf3' }}>
                      {snap.message}
                    </div>
                    <div style={{
                      color:     '#8b949e',
                      marginTop: '2px',
                    }}>
                      {snap.branch}
                    </div>
                    <div style={{
                      color:     '#484f58',
                      marginTop: '2px',
                    }}>
                      {new Date(snap.createdAt)
                        .toLocaleString()}
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Comments */}
            {panelTab === 'comments' && (
              <>
                <button
                  style={s.panelBtn}
                  onClick={handleAddComment}
                >
                  + Add Comment
                </button>
                {comments.length === 0 ? (
                  <div style={{
                    color:     '#8b949e',
                    fontSize:  '13px',
                    textAlign: 'center',
                    padding:   '20px',
                  }}>
                    No comments yet.
                  </div>
                ) : comments.map((c) => (
                  <div
                    key={c.commentId}
                    style={s.commentItem}
                  >
                    <div style={{
                      display:        'flex',
                      justifyContent: 'space-between',
                      marginBottom:   '4px',
                    }}>
                      <span style={{ color: '#58a6ff' }}>
                        Line {c.lineNumber}
                      </span>
                      {c.resolved && (
                        <span style={{
                          color:    '#3fb950',
                          fontSize: '11px',
                        }}>
                          ✓ Resolved
                        </span>
                      )}
                    </div>
                    <div style={{ color: '#e6edf3' }}>
                      {c.content}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}